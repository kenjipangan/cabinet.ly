/**
 * CabinetCalculator - Single Responsibility: sheet/cost calculations
 */
export class CabinetCalculator {
    constructor() {
        this.sheetSize = { width: 1220, height: 2440 };
        this.wasteFactorPercent = 15;
    }

    calculateSheetsNeeded(totalArea) {
        const sheetArea = this.sheetSize.width * this.sheetSize.height;
        const areaWithWaste = totalArea * (1 + this.wasteFactorPercent / 100);
        return Math.ceil(areaWithWaste / sheetArea);
    }

    calculateActualSheetsFromCuts(cuts, sheetWidth, sheetHeight, kerf) {
        if (!cuts || cuts.length === 0) return 0;

        const pieces = [];
        cuts.forEach(cut => {
            for (let i = 0; i < cut.quantity; i++) {
                pieces.push({ part: cut.part, width: cut.width, height: cut.height });
            }
        });
        if (pieces.length === 0) return 0;

        const sorted = pieces.map((p, i) => {
            const w = Math.min(p.width, p.height);
            const h = Math.max(p.width, p.height);
            return { ...p, w, h, area: w * h, idx: i };
        }).sort((a, b) => b.area - a.area || b.h - a.h);

        const sheets = [];

        const createSheet = () => ({
            pieces: [],
            freeRects: [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }]
        });

        const findBestFit = (freeRects, pw, ph) => {
            let bestScore = Infinity, bestIdx = -1;
            for (let i = 0; i < freeRects.length; i++) {
                const r = freeRects[i];
                if (pw <= r.w && ph <= r.h) {
                    const leftover = Math.min(r.w - pw, r.h - ph);
                    if (leftover < bestScore) { bestScore = leftover; bestIdx = i; }
                }
            }
            return { idx: bestIdx };
        };

        const splitRect = (freeRect, pw, ph, k) => {
            const results = [];
            const kw = pw + k, kh = ph + k;
            if (freeRect.w - kw > k) results.push({ x: freeRect.x + kw, y: freeRect.y, w: freeRect.w - kw, h: freeRect.h });
            if (freeRect.h - kh > k) results.push({ x: freeRect.x, y: freeRect.y + kh, w: pw, h: freeRect.h - kh });
            return results;
        };

        const placePiece = (sheet, piece) => {
            const { idx } = findBestFit(sheet.freeRects, piece.w, piece.h);
            if (idx === -1) return false;
            const rect = sheet.freeRects[idx];
            sheet.pieces.push({ ...piece, x: rect.x, y: rect.y, width: piece.w, height: piece.h });
            const newRects = splitRect(rect, piece.w, piece.h, kerf);
            sheet.freeRects.splice(idx, 1, ...newRects);
            return true;
        };

        sorted.forEach(piece => {
            const minDim = Math.min(piece.w, piece.h);
            const maxDim = Math.max(piece.w, piece.h);
            if ((minDim > sheetWidth && minDim > sheetHeight) || (maxDim > sheetWidth && maxDim > sheetHeight)) {
                sheets.push(createSheet());
                return;
            }
            let placed = false;
            for (let s = 0; s < sheets.length; s++) {
                if (placePiece(sheets[s], piece)) { placed = true; break; }
            }
            if (!placed) { const ns = createSheet(); placePiece(ns, piece); sheets.push(ns); }
        });

        return sheets.length;
    }

    generateQuote(cabinets, pricing) {
        let totalArea = 0, totalArea6mm = 0, totalEdgeBanding = 0;
        let totalDoors = 0, totalDrawers = 0, totalHandles = 0, totalDrawerSlidesCost = 0;
        let mainCuts = [], thinCuts = [];

        cabinets.forEach(cabinet => {
            const cuts = cabinet.getCutList();
            cuts.forEach(cut => {
                if (cut.thickness >= 12) { totalArea += cut.width * cut.height * cut.quantity; mainCuts.push(cut); }
                else if (cut.thickness <= 6) { totalArea6mm += cut.width * cut.height * cut.quantity; thinCuts.push(cut); }
                if (cut.edgeBanding) {
                    const edgeTotal = cut.edgeBanding.front + cut.edgeBanding.back + cut.edgeBanding.left + cut.edgeBanding.right;
                    totalEdgeBanding += (edgeTotal / 1000) * cut.quantity;
                }
            });
            totalDoors += cabinet.numDoors * cabinet.quantity;
            totalDrawers += cabinet.numDrawers * cabinet.quantity;
            totalHandles += (cabinet.numDoors + cabinet.numDrawers) * cabinet.quantity;
            if (cabinet.numDrawers > 0) {
                const slidePrice = pricing.slidePrices[cabinet.drawerSlideLength] || pricing.slidePrices[500] || 550;
                totalDrawerSlidesCost += slidePrice * cabinet.numDrawers * cabinet.quantity;
            }
        });

        const kerf = cabinets[0]?.kerf || 3;
        const sheetsNeeded = this.calculateActualSheetsFromCuts(mainCuts, this.sheetSize.width, this.sheetSize.height, kerf);
        const sheetsNeeded6mm = this.calculateActualSheetsFromCuts(thinCuts, this.sheetSize.width, this.sheetSize.height, kerf);

        const sheetMaterialCost = sheetsNeeded * pricing.sheetCost;
        const sheet6mmCost = sheetsNeeded6mm * (pricing.sheet6mmCost || 0);
        const edgeBandingCost = totalEdgeBanding * pricing.edgeBanding;
        const hingesCost = totalDoors * pricing.hingesCost;
        const handlesCost = totalHandles * pricing.handlesCost;
        const screwsCost = pricing.screwsCost * cabinets.reduce((sum, c) => sum + c.quantity, 0);

        const materialSubtotal = sheetMaterialCost + sheet6mmCost + edgeBandingCost;
        const hardwareSubtotal = hingesCost + totalDrawerSlidesCost + handlesCost + screwsCost;
        const laborCost = pricing.laborHours * pricing.laborRate;
        const baseCost = materialSubtotal + hardwareSubtotal + laborCost;
        const markupPercent = pricing.markup || 70;
        const markupAmount = baseCost * (markupPercent / 100);
        const overhead = pricing.overhead || 0;
        const total = baseCost + markupAmount + overhead;

        const fmt = n => n.toFixed(2);
        return {
            materials: { sheetsNeeded, totalArea: fmt(totalArea / 1e6), sheetMaterialCost: fmt(sheetMaterialCost), sheetsNeeded6mm, totalArea6mm: fmt(totalArea6mm / 1e6), sheet6mmCost: fmt(sheet6mmCost), edgeBandingMeters: fmt(totalEdgeBanding), edgeBandingCost: fmt(edgeBandingCost), materialSubtotal: fmt(materialSubtotal) },
            hardware: { totalDoors, totalDrawers, totalHandles, hingesCost: fmt(hingesCost), drawerSlidesCost: fmt(totalDrawerSlidesCost), handlesCost: fmt(handlesCost), screwsCost: fmt(screwsCost), hardwareSubtotal: fmt(hardwareSubtotal) },
            labor: { hours: pricing.laborHours.toFixed(1), rate: pricing.laborRate, laborCost: fmt(laborCost) },
            totals: { baseCost: fmt(baseCost), markupPercent, markupAmount: fmt(markupAmount), overhead: fmt(overhead), total: fmt(total) }
        };
    }
}
