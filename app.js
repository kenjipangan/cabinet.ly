// Cabinet Quotation Calculator

// Toast notification system
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '<i class="bi bi-check-circle"></i>',
        error: '<i class="bi bi-x-circle"></i>',
        warning: '<i class="bi bi-exclamation-triangle"></i>',
        info: '<i class="bi bi-info-circle"></i>'
    };
    
    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-body">
            <div class="toast-title">${titles[type] || titles.info}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

class Cabinet {
    constructor(data) {
        this.name = data.cabinetName;
        this.group = data.cabinetGroup || 'Ungrouped';
        this.quantity = data.quantity;
        this.width = data.width;
        this.height = data.height;
        this.depth = data.depth;
        this.cabinetType = data.cabinetType;
        this.numDoors = data.numDoors;
        this.numDrawers = data.numDrawers;
        this.drawerHeights = data.drawerHeights || [];
        this.drawerWidths = data.drawerWidths || [];
        this.drawerSlideLength = data.drawerSlideLength || 500;
        this.numShelves = data.numShelves;
        this.numVerticalDividers = data.numVerticalDividers || 0;
        this.sheetMaterial = data.sheetMaterial;
        this.thickness = data.thickness;
        this.kerf = data.kerf || 3; // Kerf/cut thickness in mm
        this.grainOrientation = data.grainOrientation || 'standard'; // Grain orientation preference
    }

    getGrainDirection(standardGrain) {
        // Override grain based on user preference
        if (this.grainOrientation === 'horizontal') {
            return 'horizontal';
        } else if (this.grainOrientation === 'vertical') {
            return 'vertical';
        }
        // Default: use standard grain direction
        return standardGrain;
    }

    getCutList() {
        const cuts = [];
        const qty = this.quantity;
        const t = this.thickness; // Board thickness
        const kerf = this.kerf || 3; // Kerf/cut thickness (default 3mm)
        // Extract base material name (remove thickness prefix like "18mm ")
        const baseMaterial = this.sheetMaterial.replace(/^\d+mm\s*/, '');

        // CABINET BOX CONSTRUCTION (Standard modular kitchen method)
        
        // 1. SIDES - Full height, full depth
        cuts.push({
            part: 'Side Panel (Left/Right)',
            width: this.depth,
            height: this.height,
            thickness: t,
            quantity: 2 * qty,
            material: this.sheetMaterial,
            notes: 'Full height sides',
            grain: this.getGrainDirection('vertical'),
            edgeBanding: {
                front: this.height,
                back: 0,
                left: this.depth,
                right: this.depth
            }
        });

        // 2. TOP - Fits between sides (width minus 2x thickness)
        cuts.push({
            part: 'Top Panel',
            width: this.width - (2 * t),
            height: this.depth,
            thickness: t,
            quantity: 1 * qty,
            material: this.sheetMaterial,
            notes: 'Fits between sides',
            grain: this.getGrainDirection('horizontal'),
            edgeBanding: {
                front: this.width - (2 * t),
                back: 0,
                left: 0,
                right: 0
            }
        });

        // 3. BOTTOM - Fits between sides, same as top
        cuts.push({
            part: 'Bottom Panel',
            width: this.width - (2 * t),
            height: this.depth,
            thickness: t,
            quantity: 1 * qty,
            material: this.sheetMaterial,
            notes: 'Fits between sides',
            grain: this.getGrainDirection('horizontal'),
            edgeBanding: {
                front: this.width - (2 * t),
                back: 0,
                left: 0,
                right: 0
            }
        });

        // 4. BACK PANEL - Sits in rabbet, slightly smaller
        // Standard: 10mm rabbet from edges
        cuts.push({
            part: 'Back Panel',
            width: this.width - 20, // 10mm rabbet each side
            height: this.height - 20, // 10mm rabbet top/bottom
            thickness: 6, // Back panels typically 6mm
            quantity: 1 * qty,
            material: `6mm ${baseMaterial}`,
            notes: 'Sits in 10mm rabbet',
            grain: 'none',
            edgeBanding: {
                front: 0,
                back: 0,
                left: 0,
                right: 0
            }
        });

        // 5. SHELVES - Adjustable, fit between sides
        if (this.numShelves > 0) {
            cuts.push({
                part: 'Adjustable Shelf',
                width: this.width - (2 * t) - 4, // Minus sides + 2mm clearance each side
                height: this.depth - 20, // Allow space for back and front clearance
                thickness: t,
                quantity: this.numShelves * qty,
                material: this.sheetMaterial,
                notes: 'Sits on shelf pins',
                grain: this.getGrainDirection('horizontal'),
                edgeBanding: {
                    front: this.width - (2 * t) - 4,
                    back: 0,
                    left: 0,
                    right: 0
                }
            });
        }

        // 5B. VERTICAL DIVIDERS - Fit between top and bottom
        if (this.numVerticalDividers > 0) {
            cuts.push({
                part: 'Vertical Divider',
                width: this.depth - 20, // Allow space for back
                height: this.height - (2 * t), // Fit between top and bottom
                thickness: t,
                quantity: this.numVerticalDividers * qty,
                material: this.sheetMaterial,
                notes: 'Fits between top and bottom',
                grain: this.getGrainDirection('vertical'),
                edgeBanding: {
                    front: this.height - (2 * t),
                    back: 0,
                    left: 0,
                    right: 0
                }
            });
        }

        // 6. DOORS - Overlay style (standard 2mm reveal)
        if (this.numDoors > 0) {
            // Calculate door width: total width divided by number of doors, minus 2mm gap between doors
            const gapBetweenDoors = (this.numDoors > 1) ? 2 : 0;
            const totalGaps = (this.numDoors - 1) * gapBetweenDoors;
            const doorWidth = Math.floor((this.width - totalGaps) / this.numDoors);
            const doorHeight = this.height;
            
            cuts.push({
                part: 'Door Panel',
                width: doorWidth,
                height: doorHeight,
                thickness: t,
                quantity: this.numDoors * qty,
                material: this.sheetMaterial,
                notes: 'Full overlay, 2mm gap between doors',
                grain: this.getGrainDirection('vertical'),
                edgeBanding: {
                    front: (doorWidth * 2) + (doorHeight * 2), // All 4 edges
                    back: 0,
                    left: 0,
                    right: 0
                }
            });
        }

        // 7. DRAWER COMPONENTS (if drawers exist)
        if (this.numDrawers > 0) {
            const drawerBoxDepth = this.drawerSlideLength; // Use selected slide length
            const defaultDrawerBoxWidth = this.width - (2 * t) - 6; // Fit inside cabinet with clearance

            // Use custom drawer heights if provided, otherwise calculate evenly
            const drawerHeights = this.drawerHeights.length === this.numDrawers 
                ? this.drawerHeights 
                : Array(this.numDrawers).fill(Math.floor((this.height - t) / this.numDrawers));

            drawerHeights.forEach((drawerOpeningHeight, index) => {
                const drawerBoxHeight = drawerOpeningHeight - 40; // Clearance for slides and movement
                
                // Use custom drawer width if specified, otherwise full cabinet width
                const customWidth = (this.drawerWidths && this.drawerWidths[index]) ? this.drawerWidths[index] : 0;
                const drawerFrontWidth = customWidth > 0 ? customWidth : this.width;
                const drawerBoxWidth = customWidth > 0 ? customWidth - (2 * t) - 6 : defaultDrawerBoxWidth;

                // A. DRAWER FRONT - Overlay style, covers opening
                cuts.push({
                    part: `Drawer ${index + 1} Front (Overlay)`,
                    width: drawerFrontWidth,
                    height: drawerOpeningHeight,
                    thickness: t,
                    quantity: 1 * qty,
                    material: this.sheetMaterial,
                    notes: `Full overlay front - ${(drawerOpeningHeight/10).toFixed(1)}cm`,
                    grain: this.getGrainDirection('vertical'),
                    edgeBanding: {
                        front: (drawerFrontWidth * 2) + (drawerOpeningHeight * 2), // All 4 edges
                        back: 0,
                        left: 0,
                        right: 0
                    }
                });

                // B. Drawer Sides
                cuts.push({
                    part: `Drawer ${index + 1} Side`,
                    width: drawerBoxDepth,
                    height: drawerBoxHeight,
                    thickness: t,
                    quantity: 2 * qty,
                    material: this.sheetMaterial,
                    notes: 'Drawer box sides',
                    grain: this.getGrainDirection('horizontal'),
                    edgeBanding: {
                        front: drawerBoxHeight, // Top edge only
                        back: 0,
                        left: 0,
                        right: 0
                    }
                });

                // C. Drawer Front (internal, not the overlay front)
                cuts.push({
                    part: `Drawer ${index + 1} Front (Internal)`,
                    width: drawerBoxWidth - (2 * t),
                    height: drawerBoxHeight,
                    thickness: t,
                    quantity: 1 * qty,
                    material: this.sheetMaterial,
                    notes: 'Internal front, fits between sides',
                    grain: this.getGrainDirection('horizontal'),
                    edgeBanding: {
                        front: drawerBoxHeight, // Top edge only
                        back: 0,
                        left: 0,
                        right: 0
                    }
                });

                // D. Drawer Back
                cuts.push({
                    part: `Drawer ${index + 1} Back`,
                    width: drawerBoxWidth - (2 * t),
                    height: drawerBoxHeight - 20,
                    thickness: t,
                    quantity: 1 * qty,
                    material: this.sheetMaterial,
                    notes: 'Lower than front for bottom',
                    grain: this.getGrainDirection('horizontal'),
                    edgeBanding: {
                        front: drawerBoxHeight - 20, // Top edge only
                        back: 0,
                        left: 0,
                        right: 0
                    }
                });

                // E. Drawer Bottom - Sits in groove
                cuts.push({
                    part: `Drawer ${index + 1} Bottom`,
                    width: drawerBoxWidth - (2 * t) + 20,
                    height: drawerBoxDepth - 10,
                    thickness: 6,
                    quantity: 1 * qty,
                    material: `6mm ${baseMaterial}`,
                    notes: 'Sits in 6mm groove, 10mm from bottom edge',
                    grain: 'none',
                    edgeBanding: {
                        front: 0,
                        back: 0,
                        left: 0,
                        right: 0
                    }
                });
            });
        }

        return cuts;
    }
}

class CabinetCalculator {
    constructor() {
        this.sheetSize = { width: 1220, height: 2440 }; // Standard sheet in mm
        this.wasteFactorPercent = 15; // 15% waste factor
    }

    calculateSheetArea(width, height, depth, numDoors, numDrawers, numShelves) {
        // This method now calculates actual area from cut list parts
        // Create a temporary cabinet object to get accurate cut list
        const tempCabinet = {
            width, height, depth, numDoors, numDrawers, numShelves,
            thickness: 18, // Standard thickness
            quantity: 1,
            drawerHeights: [],
            sheetMaterial: 'Plywood',
            kerf: 3,
            getCutList: Cabinet.prototype.getCutList
        };
        
        const cuts = tempCabinet.getCutList();
        let totalArea = 0;
        
        // Calculate actual area from all cuts
        cuts.forEach(cut => {
            // Only count main sheet material (18mm), not back panels or drawer bottoms
            if (cut.thickness >= 12) {
                totalArea += (cut.width * cut.height * cut.quantity);
            }
        });
        
        return totalArea;
    }

    calculateSheetsNeeded(totalArea) {
        const sheetArea = this.sheetSize.width * this.sheetSize.height;
        const areaWithWaste = totalArea * (1 + this.wasteFactorPercent / 100);
        return Math.ceil(areaWithWaste / sheetArea);
    }

    // Calculate actual sheets needed using bin-packing layout (same as diagram)
    calculateActualSheetsFromCuts(cuts, sheetWidth, sheetHeight, kerf) {
        if (!cuts || cuts.length === 0) return 0;
        
        // Expand cuts by quantity
        const pieces = [];
        cuts.forEach(cut => {
            for (let i = 0; i < cut.quantity; i++) {
                pieces.push({
                    part: cut.part,
                    width: cut.width,
                    height: cut.height
                });
            }
        });
        
        if (pieces.length === 0) return 0;
        
        // Guillotine bin-packing (same as layoutPieces)
        const sorted = pieces.map((p, i) => {
            const w = Math.min(p.width, p.height);
            const h = Math.max(p.width, p.height);
            return { ...p, w, h, area: w * h, idx: i };
        }).sort((a, b) => b.area - a.area || b.h - a.h);

        const sheets = [];

        function createSheet() {
            return {
                pieces: [],
                freeRects: [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }]
            };
        }

        function findBestFit(freeRects, pw, ph) {
            let bestScore = Infinity;
            let bestIdx = -1;

            for (let i = 0; i < freeRects.length; i++) {
                const r = freeRects[i];
                // Only try the given orientation (no rotation)
                if (pw <= r.w && ph <= r.h) {
                    const leftover = Math.min(r.w - pw, r.h - ph);
                    if (leftover < bestScore) {
                        bestScore = leftover;
                        bestIdx = i;
                    }
                }
            }
            return { idx: bestIdx };
        }

        function splitRect(freeRect, pw, ph, k) {
            const results = [];
            const kw = pw + k;
            const kh = ph + k;
            if (freeRect.w - kw > k) {
                results.push({ x: freeRect.x + kw, y: freeRect.y, w: freeRect.w - kw, h: freeRect.h });
            }
            if (freeRect.h - kh > k) {
                results.push({ x: freeRect.x, y: freeRect.y + kh, w: pw, h: freeRect.h - kh });
            }
            return results;
        }

        function placePiece(sheet, piece) {
            const { idx } = findBestFit(sheet.freeRects, piece.w, piece.h);
            if (idx === -1) return false;
            const rect = sheet.freeRects[idx];
            sheet.pieces.push({ ...piece, x: rect.x, y: rect.y, width: piece.w, height: piece.h });
            const newRects = splitRect(rect, piece.w, piece.h, kerf);
            sheet.freeRects.splice(idx, 1, ...newRects);
            return true;
        }

        sorted.forEach(piece => {
            const minDim = Math.min(piece.w, piece.h);
            const maxDim = Math.max(piece.w, piece.h);
            if ((minDim > sheetWidth && minDim > sheetHeight) ||
                (maxDim > sheetWidth && maxDim > sheetHeight)) {
                sheets.push(createSheet());
                return;
            }

            let placed = false;
            for (let s = 0; s < sheets.length; s++) {
                if (placePiece(sheets[s], piece)) {
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                const newSheet = createSheet();
                placePiece(newSheet, piece);
                sheets.push(newSheet);
            }
        });

        return sheets.length;
    }

    calculateEdgeBanding(width, height, depth, numDoors, numShelves) {
        let totalLength = 0;
        
        // This method is kept for backward compatibility with material calculation
        // Actual edge banding per part is now calculated in getCutList()
        
        // Cabinet box edges (front edges mainly)
        totalLength += (2 * height) + (2 * width); // Front edges of sides and top/bottom
        
        // Shelves (front edge)
        totalLength += numShelves * width;
        
        // Doors (all four edges per door)
        if (numDoors > 0) {
            const doorWidth = (width / numDoors) - 12;
            const doorHeight = height - 25;
            totalLength += numDoors * (2 * (doorWidth + doorHeight));
        }
        
        return totalLength / 1000; // Convert to meters
    }

    generateQuote(cabinets, pricing) {
        let totalArea = 0;
        let totalArea6mm = 0;
        let totalEdgeBanding = 0;
        let totalDoors = 0;
        let totalDrawers = 0;
        let totalHandles = 0;
        let totalDrawerSlidesCost = 0;
        
        // Collect cuts by thickness for accurate sheet counting
        let mainCuts = [];   // >= 12mm
        let thinCuts = [];   // <= 6mm

        // Calculate totals from all cabinets using actual cut lists
        cabinets.forEach(cabinet => {
            const cuts = cabinet.getCutList();
            
            // Calculate actual area from cut list
            cuts.forEach(cut => {
                // Only count main sheet material (thickness >= 12mm), not back panels or drawer bottoms
                if (cut.thickness >= 12) {
                    totalArea += (cut.width * cut.height * cut.quantity);
                    mainCuts.push(cut);
                } else if (cut.thickness <= 6) {
                    // Track 6mm material (back panels, drawer bottoms)
                    totalArea6mm += (cut.width * cut.height * cut.quantity);
                    thinCuts.push(cut);
                }
                
                // Calculate edge banding from cut list
                if (cut.edgeBanding) {
                    const edgeTotal = cut.edgeBanding.front + cut.edgeBanding.back + 
                                     cut.edgeBanding.left + cut.edgeBanding.right;
                    totalEdgeBanding += (edgeTotal / 1000) * cut.quantity; // Convert to meters
                }
            });
            
            totalDoors += cabinet.numDoors * cabinet.quantity;
            totalDrawers += cabinet.numDrawers * cabinet.quantity;
            totalHandles += (cabinet.numDoors + cabinet.numDrawers) * cabinet.quantity;
            
            // Calculate drawer slide cost based on slide length
            if (cabinet.numDrawers > 0) {
                const slidePrice = pricing.slidePrices[cabinet.drawerSlideLength] || pricing.slidePrices[500] || 550;
                totalDrawerSlidesCost += slidePrice * cabinet.numDrawers * cabinet.quantity;
            }
        });

        // Labor hours is already calculated as total units * 8 hours per unit
        const totalLaborHours = pricing.laborHours;

        const kerf = cabinets[0]?.kerf || 3;
        const sheetsNeeded = this.calculateActualSheetsFromCuts(mainCuts, this.sheetSize.width, this.sheetSize.height, kerf);
        const sheetsNeeded6mm = this.calculateActualSheetsFromCuts(thinCuts, this.sheetSize.width, this.sheetSize.height, kerf);
        
        // Material costs
        const sheetMaterialCost = sheetsNeeded * pricing.sheetCost;
        const sheet6mmCost = sheetsNeeded6mm * (pricing.sheet6mmCost || 0);
        const edgeBandingCost = totalEdgeBanding * pricing.edgeBanding;
        
        // Hardware costs
        const hingesCost = totalDoors * pricing.hingesCost;
        const drawerSlidesCost = totalDrawerSlidesCost;
        const handlesCost = totalHandles * pricing.handlesCost;
        const screwsCost = pricing.screwsCost * cabinets.reduce((sum, c) => sum + c.quantity, 0);
        
        // Subtotals
        const materialSubtotal = sheetMaterialCost + sheet6mmCost + edgeBandingCost;
        const hardwareSubtotal = hingesCost + drawerSlidesCost + handlesCost + screwsCost;
        const laborCost = totalLaborHours * pricing.laborRate;
        
        // New calculation: Materials + Labor = Base Cost
        const baseCost = materialSubtotal + hardwareSubtotal + laborCost;
        
        // Markup from user input (default 70%)
        const markupPercent = pricing.markup || 70;
        const markupAmount = baseCost * (markupPercent / 100);
        
        // Overhead (user input)
        const overhead = pricing.overhead || 0;
        
        // Total = Base Cost + Markup + Overhead
        const total = baseCost + markupAmount + overhead;
        
        return {
            materials: {
                sheetsNeeded,
                totalArea: (totalArea / 1000000).toFixed(2),
                sheetMaterialCost: sheetMaterialCost.toFixed(2),
                sheetsNeeded6mm,
                totalArea6mm: (totalArea6mm / 1000000).toFixed(2),
                sheet6mmCost: sheet6mmCost.toFixed(2),
                edgeBandingMeters: totalEdgeBanding.toFixed(2),
                edgeBandingCost: edgeBandingCost.toFixed(2),
                materialSubtotal: materialSubtotal.toFixed(2)
            },
            hardware: {
                totalDoors,
                totalDrawers,
                totalHandles,
                hingesCost: hingesCost.toFixed(2),
                drawerSlidesCost: drawerSlidesCost.toFixed(2),
                handlesCost: handlesCost.toFixed(2),
                screwsCost: screwsCost.toFixed(2),
                hardwareSubtotal: hardwareSubtotal.toFixed(2)
            },
            labor: {
                hours: totalLaborHours.toFixed(1),
                rate: pricing.laborRate,
                laborCost: laborCost.toFixed(2)
            },
            totals: {
                baseCost: baseCost.toFixed(2),
                markupPercent: markupPercent,
                markupAmount: markupAmount.toFixed(2),
                overhead: overhead.toFixed(2),
                total: total.toFixed(2)
            }
        };
    }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new CabinetCalculator();
    const cabinets = [];
    let currentStep = 1;
    let editingIndex = -1; // Track which cabinet is being edited
    
    // Format number with commas
    function formatPrice(number) {
        return parseFloat(number).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    const addCabinetBtn = document.getElementById('addCabinetBtn');
    const updateCabinetBtn = document.getElementById('updateCabinetBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const calculateBtnTop = document.getElementById('calculateBtnTop');
    const resetCurrentBtn = document.getElementById('resetCurrentBtn');
    const printQuoteBtn = document.getElementById('printQuoteBtn');
    const copyQuoteBtn = document.getElementById('copyQuoteBtn');
    const viewCutlistBtn = document.getElementById('viewCutlistBtn');
    const viewCabinetDrawingsBtn = document.getElementById('viewCabinetDrawingsBtn');
    const simplifiedQuoteBtn = document.getElementById('simplifiedQuoteBtn');
    const printSimplifiedBtn = document.getElementById('printSimplifiedBtn');
    const copySimplifiedBtn = document.getElementById('copySimplifiedBtn');
    const backToDetailedBtn = document.getElementById('backToDetailedBtn');
    const printCutlistBtn = document.getElementById('printCutlistBtn');
    const copyCutlistBtn = document.getElementById('copyCutlistBtn');
    const backToQuoteBtn = document.getElementById('backToQuoteBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportProjectBtn = document.getElementById('exportProjectBtn');
    const importCsvBtn = document.getElementById('importCsvBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const importProjectBtnHeader = document.getElementById('importProjectBtnHeader');
    const projectFileInputHeader = document.getElementById('projectFileInputHeader');
    const sheetMaterialSelect = document.getElementById('sheetMaterial');
    const sheetCostInput = document.getElementById('sheetCost');
    const cabinetTypeSelect = document.getElementById('cabinetType');
    const preSizeSelect = document.getElementById('preSize');
    const numDrawersInput = document.getElementById('numDrawers');
    const drawerSizesContainer = document.getElementById('drawerSizesContainer');
    const drawerSizesInputs = document.getElementById('drawerSizesInputs');
    const cabinetListSection = document.getElementById('cabinetList');
    const cabinetItems = document.getElementById('cabinetItems');
    const resultsSection = document.getElementById('results');
    const simplifiedResults = document.getElementById('simplifiedResults');
    const cutlistResults = document.getElementById('cutlistResults');
    const cabinetDrawingsResults = document.getElementById('cabinetDrawingsResults');
    const cabinetDrawingsContent = document.getElementById('cabinetDrawingsContent');
    const quotationContent = document.getElementById('quotationContent');
    const simplifiedQuotationContent = document.getElementById('simplifiedQuotationContent');
    const cutlistContent = document.getElementById('cutlistContent');

    // Step navigation functions
    window.goToStep = function(step) {
        // Hide all steps
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).style.display = 'none';
            document.querySelector(`.step-item[data-step="${i}"]`).classList.remove('active');
        }
        
        // Show target step
        document.getElementById(`step${step}`).style.display = 'block';
        document.querySelector(`.step-item[data-step="${step}"]`).classList.add('active');
        
        // Mark completed steps
        for (let i = 1; i < step; i++) {
            document.querySelector(`.step-item[data-step="${i}"]`).classList.add('completed');
        }
        
        currentStep = step;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Check if top nav should be visible after content loads
        setTimeout(updateTopNavVisibility, 100);
    };

    window.proceedToReview = function() {
        if (cabinets.length === 0) {
            showToast('Please add at least one cabinet before proceeding.', 'warning');
            return;
        }
        
        // Update review section with cabinet list
        updateCabinetListReview();
        goToStep(4);
    };

    function updateCabinetListReview() {
        const reviewItems = document.getElementById('cabinetItemsReview');
        
        // Group cabinets by group/location
        const groupedCabinets = {};
        cabinets.forEach((cabinet, index) => {
            const group = cabinet.group || 'Ungrouped';
            if (!groupedCabinets[group]) {
                groupedCabinets[group] = [];
            }
            groupedCabinets[group].push({ cabinet, index });
        });

        let html = '';
        Object.keys(groupedCabinets).sort().forEach(group => {
            html += `
                <div style="margin-bottom: 16px;">
                    <h3 style="color: var(--accent); font-size: 0.95em; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--accent);">
                        ${group}
                    </h3>
            `;
            
            groupedCabinets[group].forEach(({ cabinet, index }) => {
                const config = [];
                if (cabinet.numDoors > 0) config.push(`${cabinet.numDoors}D`);
                if (cabinet.numDrawers > 0) config.push(`${cabinet.numDrawers}Dr`);
                if (cabinet.numShelves > 0) config.push(`${cabinet.numShelves}S`);
                if (cabinet.numVerticalDividers > 0) config.push(`${cabinet.numVerticalDividers}V`);
                
                html += `
                    <div class="cabinet-item" style="padding: 10px 12px;">
                        <div class="cabinet-item-info" style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <strong style="font-size: 0.95em;">${cabinet.name}</strong>
                                <span style="color: var(--text-secondary); font-size: 0.85em;">×${cabinet.quantity}</span>
                                <span style="color: var(--text-tertiary); font-size: 0.85em;">${(cabinet.width/10).toFixed(1)}×${(cabinet.height/10).toFixed(1)}×${(cabinet.depth/10).toFixed(1)}cm</span>
                                <span style="color: var(--text-tertiary); font-size: 0.8em;">${config.join(' ')}</span>
                            </div>
                        </div>
                        <button class="btn-icon btn-icon-danger" onclick="removeCabinetFromReview(${index})" title="Remove"><i class="bi bi-trash"></i></button>
                    </div>
                `;
            });
            
            html += `</div>`;
        });

        reviewItems.innerHTML = html;
    }

    window.removeCabinetFromReview = function(index) {
        cabinets.splice(index, 1);
        updateCabinetListReview();
        updateCabinetList();
        if (cabinets.length === 0) {
            showToast('No cabinets remaining. Returning to Add Cabinets step.', 'info');
            goToStep(3);
        }
    };

    // Make step items clickable
    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', () => {
            const step = parseInt(item.dataset.step);
            // Only allow going back or to completed steps
            if (step <= currentStep || item.classList.contains('completed')) {
                goToStep(step);
            }
        });
    });

    // Function to check if page is scrollable and show/hide top navigation
    function updateTopNavVisibility() {
        const topNavs = document.querySelectorAll('.step-navigation.top-nav');
        const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
        
        topNavs.forEach(nav => {
            if (isScrollable) {
                nav.classList.add('show');
            } else {
                nav.classList.remove('show');
            }
        });
    }

    // Check on page load and resize
    updateTopNavVisibility();
    window.addEventListener('resize', updateTopNavVisibility);
    
    // Also check when content changes (like adding cabinets)
    const observer = new MutationObserver(updateTopNavVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    // Standard modular cabinet sizes (in cm)
    const standardSizes = {
        base: [
            { width: 30, height: 85, depth: 60, label: '30cm - Single Door' },
            { width: 40, height: 85, depth: 60, label: '40cm - Single Door' },
            { width: 45, height: 85, depth: 60, label: '45cm - Single Door' },
            { width: 50, height: 85, depth: 60, label: '50cm - Single Door' },
            { width: 60, height: 85, depth: 60, label: '60cm - Double Door' },
            { width: 80, height: 85, depth: 60, label: '80cm - Double Door' },
            { width: 90, height: 85, depth: 60, label: '90cm - Double Door' },
            { width: 100, height: 85, depth: 60, label: '100cm - Double Door' },
            { width: 120, height: 85, depth: 60, label: '120cm - Double Door' }
        ],
        wall: [
            { width: 30, height: 70, depth: 35, label: '30cm - Single Door' },
            { width: 40, height: 70, depth: 35, label: '40cm - Single Door' },
            { width: 50, height: 70, depth: 35, label: '50cm - Single Door' },
            { width: 60, height: 70, depth: 35, label: '60cm - Double Door' },
            { width: 80, height: 70, depth: 35, label: '80cm - Double Door' },
            { width: 90, height: 70, depth: 35, label: '90cm - Double Door' },
            { width: 100, height: 70, depth: 35, label: '100cm - Double Door' },
            { width: 120, height: 70, depth: 35, label: '120cm - Double Door' }
        ],
        tall: [
            { width: 60, height: 210, depth: 60, label: '60cm - Pantry' },
            { width: 80, height: 210, depth: 60, label: '80cm - Pantry' },
            { width: 90, height: 210, depth: 60, label: '90cm - Pantry' },
            { width: 60, height: 180, depth: 60, label: '60cm - Tall Storage' },
            { width: 80, height: 180, depth: 60, label: '80cm - Tall Storage' }
        ],
        custom: []
    };

    // Update material price when sheet material changes
    sheetMaterialSelect.addEventListener('change', () => {
        const material = sheetMaterialSelect.value;
        if (material === 'PVC') {
            sheetCostInput.value = 5000;
        } else if (material === 'Plywood') {
            sheetCostInput.value = 2500;
        }
    });

    // Update pre-size options when cabinet type changes
    cabinetTypeSelect.addEventListener('change', () => {
        updatePreSizeOptions();
    });

    // Apply pre-size when selected
    preSizeSelect.addEventListener('change', () => {
        if (preSizeSelect.value) {
            const size = JSON.parse(preSizeSelect.value);
            document.getElementById('width').value = size.width;
            document.getElementById('height').value = size.height;
            document.getElementById('depth').value = size.depth;
            
            // Auto-set number of doors based on width
            // Standard: Single door for widths <= 50cm, double door for wider
            const numDoors = size.width <= 50 ? 1 : 2;
            document.getElementById('numDoors').value = numDoors;
            
            // Auto-set vertical dividers based on width
            // Standard: 1 divider for every 40cm of width (rounded down), max based on width
            const numDividers = size.width >= 80 ? Math.floor(size.width / 40) - 1 : 0;
            document.getElementById('numVerticalDividers').value = numDividers;
            
            // Auto-select best drawer slide length for this depth
            updateDrawerSlideLength();
        }
    });

    function updatePreSizeOptions() {
        const cabinetType = cabinetTypeSelect.value;
        const sizes = standardSizes[cabinetType] || [];
        
        preSizeSelect.innerHTML = '<option value="">Select a size...</option>';
        
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = JSON.stringify(size);
            option.textContent = size.label;
            preSizeSelect.appendChild(option);
        });

        // Enable/disable pre-size based on cabinet type
        preSizeSelect.disabled = cabinetType === 'custom';
    }

    // Auto-select drawer slide length based on cabinet depth
    function updateDrawerSlideLength() {
        const depthCm = parseFloat(document.getElementById('depth').value) || 0;
        const depthMm = depthCm * 10;
        // Available slide lengths
        const slideLengths = [300, 350, 400, 450, 500, 550];
        // Pick the largest slide that fits (depth minus ~50mm clearance for back panel and front)
        const maxSlide = depthMm - 50;
        let bestFit = slideLengths[0];
        for (const len of slideLengths) {
            if (len <= maxSlide) {
                bestFit = len;
            }
        }
        document.getElementById('drawerSlideLength').value = bestFit;
    }

    // Listen for depth changes
    document.getElementById('depth').addEventListener('change', updateDrawerSlideLength);
    document.getElementById('depth').addEventListener('input', updateDrawerSlideLength);

    // Initialize pre-size options on load
    updatePreSizeOptions();

    // Handle drawer count changes
    numDrawersInput.addEventListener('change', () => {
        const numDrawers = parseInt(numDrawersInput.value) || 0;
        const heightCm = parseFloat(document.getElementById('height').value) || 75;
        const maxDrawers = Math.floor(heightCm / 10); // Minimum ~10cm per drawer
        
        if (numDrawers > maxDrawers && heightCm > 0) {
            showToast(`Maximum recommended drawers for ${heightCm}cm height is ${maxDrawers}. You entered ${numDrawers}.`, 'warning');
        }
        
        if (numDrawers > 0) {
            drawerSizesContainer.style.display = 'block';
            updateDrawerSizeInputs(numDrawers);
            validateDrawerHeights();
        } else {
            drawerSizesContainer.style.display = 'none';
            const oldWarning = document.getElementById('drawerWarning');
            if (oldWarning) oldWarning.remove();
        }
    });

    function validateDrawerHeights() {
        const heightCm = parseFloat(document.getElementById('height').value) || 0;
        const heightMm = heightCm * 10;
        const numDrawers = parseInt(numDrawersInput.value) || 0;
        
        if (numDrawers === 0 || heightMm === 0) return;
        
        // Calculate total drawer height from inputs
        let totalDrawerHeight = 0;
        for (let i = 0; i < numDrawers; i++) {
            const input = document.getElementById(`drawer${i}Height`);
            const h = input ? (parseFloat(input.value) || 15) * 10 : 150; // cm to mm
            totalDrawerHeight += h;
        }
        
        const warningEl = document.getElementById('drawerWarning');
        
        if (totalDrawerHeight > heightMm) {
            if (!warningEl) {
                const warning = document.createElement('div');
                warning.id = 'drawerWarning';
                warning.style.cssText = 'margin-top: 10px; padding: 10px; background: rgba(212, 175, 55, 0.15); border-radius: 6px; color: #e5c158; font-size: 0.85em; border-left: 4px solid #d4af37;';
                warning.innerHTML = `<strong>Warning:</strong> Total drawer height (${(totalDrawerHeight/10).toFixed(1)}cm) exceeds cabinet height (${heightCm}cm). Reduce drawer count or heights.`;
                drawerSizesInputs.parentNode.appendChild(warning);
            } else {
                warningEl.innerHTML = `<strong>Warning:</strong> Total drawer height (${(totalDrawerHeight/10).toFixed(1)}cm) exceeds cabinet height (${heightCm}cm). Reduce drawer count or heights.`;
            }
        } else {
            if (warningEl) warningEl.remove();
        }
    }

    // Re-validate when height changes
    document.getElementById('height').addEventListener('change', validateDrawerHeights);
    document.getElementById('height').addEventListener('input', validateDrawerHeights);

    function updateDrawerSizeInputs(count) {
        drawerSizesInputs.innerHTML = '';
        // Remove old warning if any
        const oldWarning = document.getElementById('drawerWarning');
        if (oldWarning) oldWarning.remove();
        
        const cabinetWidth = parseFloat(document.getElementById('width').value) || 0;
        
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <label style="margin-bottom: 6px; display: block;">Drawer ${i + 1}:</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div>
                        <label for="drawer${i}Height" style="font-size: 0.8em; color: var(--text-tertiary);">Height (cm)</label>
                        <input type="number" id="drawer${i}Height" class="drawer-height-input" placeholder="15" step="0.1" min="5" value="15">
                    </div>
                    <div>
                        <label for="drawer${i}Width" style="font-size: 0.8em; color: var(--text-tertiary);">Width (cm)</label>
                        <input type="number" id="drawer${i}Width" class="drawer-width-input" placeholder="${cabinetWidth ? cabinetWidth.toFixed(1) : 'auto'}" step="0.1" min="5" value="">
                        <small style="color: var(--text-disabled); font-size: 0.75em;">Leave blank = full width</small>
                    </div>
                </div>
            `;
            drawerSizesInputs.appendChild(div);
            
            // Add validation listener
            const heightInput = div.querySelector('.drawer-height-input');
            heightInput.addEventListener('change', validateDrawerHeights);
            heightInput.addEventListener('input', validateDrawerHeights);
        }
        
        validateDrawerHeights();
    }

    function getAutoName(cabinetType) {
        const typeLabels = { base: 'Base Cabinet', wall: 'Wall Cabinet', tall: 'Tall Cabinet', custom: 'Custom Cabinet' };
        const label = typeLabels[cabinetType] || 'Cabinet';
        const existing = cabinets.filter(c => c.name.startsWith(label)).length;
        return `${label} ${existing + 1}`;
    }

    function getCabinetData() {
        const numDrawers = parseInt(document.getElementById('numDrawers').value) || 0;
        const drawerHeights = [];
        const drawerWidths = [];
        
        if (numDrawers > 0) {
            for (let i = 0; i < numDrawers; i++) {
                const heightInput = document.getElementById(`drawer${i}Height`);
                const heightCm = heightInput ? parseFloat(heightInput.value) || 15 : 15;
                drawerHeights.push(heightCm * 10); // Convert cm to mm
                
                const widthInput = document.getElementById(`drawer${i}Width`);
                const widthCm = widthInput ? parseFloat(widthInput.value) : 0;
                drawerWidths.push(widthCm > 0 ? widthCm * 10 : 0); // 0 means full width
            }
        }

        const sheetMaterial = document.getElementById('sheetMaterial').value;
        const thickness = parseFloat(document.getElementById('sheetThickness').value) || 18;
        const fullMaterialName = `${thickness}mm ${sheetMaterial}`;
        const grainOrientation = document.getElementById('grainOrientation').value || 'standard';
        const cabinetType = document.getElementById('cabinetType').value;

        return {
            cabinetName: document.getElementById('cabinetName').value || getAutoName(cabinetType),
            cabinetGroup: document.getElementById('cabinetGroup').value || 'Ungrouped',
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            width: parseFloat(document.getElementById('width').value) * 10 || 900, // Convert cm to mm
            height: parseFloat(document.getElementById('height').value) * 10 || 750, // Convert cm to mm
            depth: parseFloat(document.getElementById('depth').value) * 10 || 600, // Convert cm to mm
            cabinetType: cabinetType,
            numDoors: parseInt(document.getElementById('numDoors').value) || 0,
            numDrawers: numDrawers,
            drawerHeights: drawerHeights,
            drawerWidths: drawerWidths,
            numShelves: parseInt(document.getElementById('numShelves').value) || 0,
            numVerticalDividers: parseInt(document.getElementById('numVerticalDividers').value) || 0,
            drawerSlideLength: parseInt(document.getElementById('drawerSlideLength').value) || 500,
            sheetMaterial: fullMaterialName,
            thickness: thickness,
            kerf: parseFloat(document.getElementById('kerf').value) || 3,
            grainOrientation: grainOrientation
        };
    }

    function resetForm() {
        document.getElementById('cabinetName').value = '';
        document.getElementById('cabinetGroup').value = '';
        document.getElementById('quantity').value = '1';
        document.getElementById('cabinetType').value = 'base';
        document.getElementById('preSize').value = '';
        document.getElementById('width').value = '';
        document.getElementById('height').value = '';
        document.getElementById('depth').value = '';
        document.getElementById('numDoors').value = '2';
        document.getElementById('numDrawers').value = '0';
        document.getElementById('numShelves').value = '1';
        document.getElementById('numVerticalDividers').value = '0';
        drawerSizesContainer.style.display = 'none';
        drawerSizesInputs.innerHTML = '';
        document.getElementById('drawerSlideLength').value = '500';
        updatePreSizeOptions();
        
        // Reset edit mode
        editingIndex = -1;
        addCabinetBtn.style.display = 'inline-flex';
        updateCabinetBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
    }

    function updateCabinetList() {
        if (cabinets.length === 0) {
            cabinetListSection.style.display = 'none';
            return;
        }

        // Group cabinets by group/location
        const groupedCabinets = {};
        cabinets.forEach((cabinet, index) => {
            const group = cabinet.group || 'Ungrouped';
            if (!groupedCabinets[group]) {
                groupedCabinets[group] = [];
            }
            groupedCabinets[group].push({ cabinet, index });
        });

        let html = '';
        Object.keys(groupedCabinets).sort().forEach(group => {
            html += `
                <div style="margin-bottom: 16px;">
                    <h3 style="color: var(--accent); font-size: 0.95em; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--accent);">
                        ${group}
                    </h3>
            `;
            
            groupedCabinets[group].forEach(({ cabinet, index }) => {
                const config = [];
                if (cabinet.numDoors > 0) config.push(`${cabinet.numDoors}D`);
                if (cabinet.numDrawers > 0) config.push(`${cabinet.numDrawers}Dr`);
                if (cabinet.numShelves > 0) config.push(`${cabinet.numShelves}S`);
                if (cabinet.numVerticalDividers > 0) config.push(`${cabinet.numVerticalDividers}V`);
                
                html += `
                    <div class="cabinet-item" style="padding: 10px 12px;">
                        <div class="cabinet-item-info" style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <strong style="font-size: 0.95em;">${cabinet.name}</strong>
                                <span style="color: var(--text-secondary); font-size: 0.85em;">×${cabinet.quantity}</span>
                                <span style="color: var(--text-tertiary); font-size: 0.85em;">${(cabinet.width/10).toFixed(1)}×${(cabinet.height/10).toFixed(1)}×${(cabinet.depth/10).toFixed(1)}cm</span>
                                <span style="color: var(--text-tertiary); font-size: 0.8em;">${config.join(' ')}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn-icon" onclick="editCabinet(${index})" title="Edit"><i class="bi bi-pencil"></i></button>
                            <button class="btn-icon btn-icon-danger" onclick="removeCabinet(${index})" title="Remove"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        });

        cabinetItems.innerHTML = html;
        cabinetListSection.style.display = 'block';
    }

    window.removeCabinet = function(index) {
        cabinets.splice(index, 1);
        updateCabinetList();
        if (cabinets.length === 0) {
            resultsSection.style.display = 'none';
        }
        // If we were editing this cabinet, reset the form
        if (editingIndex === index) {
            resetForm();
        } else if (editingIndex > index) {
            // Adjust editing index if a cabinet before it was removed
            editingIndex--;
        }
    };

    window.editCabinet = function(index) {
        const cabinet = cabinets[index];
        editingIndex = index;
        
        // Populate form with cabinet data
        document.getElementById('cabinetName').value = cabinet.name;
        document.getElementById('cabinetGroup').value = cabinet.group || '';
        document.getElementById('quantity').value = cabinet.quantity;
        document.getElementById('width').value = (cabinet.width / 10).toFixed(1);
        document.getElementById('height').value = (cabinet.height / 10).toFixed(1);
        document.getElementById('depth').value = (cabinet.depth / 10).toFixed(1);
        document.getElementById('cabinetType').value = cabinet.cabinetType;
        document.getElementById('numDoors').value = cabinet.numDoors;
        document.getElementById('numDrawers').value = cabinet.numDrawers;
        document.getElementById('numShelves').value = cabinet.numShelves;
        document.getElementById('numVerticalDividers').value = cabinet.numVerticalDividers;
        
        // Handle drawer heights
        if (cabinet.numDrawers > 0) {
            updateDrawerSizeInputs(cabinet.numDrawers);
            drawerSizesContainer.style.display = 'block';
            document.getElementById('drawerSlideLength').value = cabinet.drawerSlideLength || 500;
            cabinet.drawerHeights.forEach((height, i) => {
                const input = document.getElementById(`drawer${i}Height`);
                if (input) {
                    input.value = (height / 10).toFixed(1);
                }
            });
            if (cabinet.drawerWidths) {
                cabinet.drawerWidths.forEach((width, i) => {
                    const input = document.getElementById(`drawer${i}Width`);
                    if (input && width > 0) {
                        input.value = (width / 10).toFixed(1);
                    }
                });
            }
        }
        
        // Switch to edit mode
        addCabinetBtn.style.display = 'none';
        updateCabinetBtn.style.display = 'inline-flex';
        cancelEditBtn.style.display = 'inline-flex';
        
        // Scroll to form
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    function displayQuote(projectData, cabinets, quote, sheetMaterialName, laminateTypeName) {
        const today = new Date().toLocaleDateString();
        const totalUnits = cabinets.reduce((sum, c) => sum + c.quantity, 0);
        const typesText = cabinets.length === 1 ? 'type' : 'types';
        const unitsText = totalUnits === 1 ? 'unit' : 'units';
        
        // Generate cut list
        let allCuts = [];
        cabinets.forEach(cabinet => {
            const cuts = cabinet.getCutList();
            cuts.forEach(cut => {
                cut.cabinetName = cabinet.name;
            });
            allCuts = allCuts.concat(cuts);
        });

        // Group cuts by cabinet, part type and dimensions
        const groupedCuts = {};
        allCuts.forEach(cut => {
            const key = `${cut.cabinetName}-${cut.part}-${cut.width}-${cut.height}-${cut.thickness}`;
            if (!groupedCuts[key]) {
                groupedCuts[key] = { ...cut };
            } else {
                groupedCuts[key].quantity += cut.quantity;
            }
        });

        const cutListRows = Object.values(groupedCuts).map(cut => {
            const totalEdgeBanding = cut.edgeBanding ? 
                (cut.edgeBanding.front + cut.edgeBanding.back + cut.edgeBanding.left + cut.edgeBanding.right) : 0;
            const grainIcon = cut.grain === 'vertical' ? '↕' : cut.grain === 'horizontal' ? '↔' : '-';
            
            // Length is always the larger dimension, Width is the smaller
            // Grain icon indicates how the piece is oriented on the sheet
            let length = Math.max(cut.width, cut.height);
            let width = Math.min(cut.width, cut.height);
            
            const partLabel = `${cut.cabinetName} - ${cut.part}`;
            
            return `
            <tr>
                <td data-label="Part">${partLabel}</td>
                <td data-label="Length">${length}mm</td>
                <td data-label="Width">${width}mm</td>
                <td data-label="Thickness">${cut.thickness}mm</td>
                <td data-label="Qty">${cut.quantity}</td>
                <td data-label="Material">${cut.material}</td>
                <td data-label="Grain" style="text-align: center; font-size: 1.2em;">${grainIcon}</td>
                <td data-label="Edge Band">${totalEdgeBanding > 0 ? (totalEdgeBanding / 1000).toFixed(2) + 'm' : '-'}</td>
                <td data-label="Notes" style="font-size: 0.85em; color: #c5c5c5;">${cut.notes || ''}</td>
            </tr>
        `;
        }).join('');
        
        cutlistContent.innerHTML = `
            <div class="quote-header">
                <h3>QUOTATION</h3>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Client:</strong> ${projectData.clientName}</p>
                <p><strong>Project:</strong> ${projectData.projectName}</p>
            </div>

            <div class="quote-section">
                <h3>Cabinets (${cabinets.length} ${typesText}, ${totalUnits} total ${unitsText})</h3>
                ${cabinets.map(cabinet => `
                    <div class="quote-item">
                        <span>${cabinet.name} (${cabinet.width}×${cabinet.height}×${cabinet.depth}mm)</span>
                        <span>Qty: ${cabinet.quantity}</span>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666;">
                <p><em>Note: This quotation is valid for 30 days. Material costs subject to change based on availability.</em></p>
            </div>
        `;
    }

    function generateCutlistView(cabinets, sheetMaterialName, materialType) {
        const today = new Date().toLocaleDateString();
        
        // Generate cut list
        let allCuts = [];
        let thinCuts = [];
        let count6mmParts = 0;
        let totalArea6mm = 0;
        cabinets.forEach(cabinet => {
            const cuts = cabinet.getCutList();
            cuts.forEach(cut => {
                cut.cabinetName = cabinet.name;
                // Track 6mm parts
                if (cut.thickness <= 6) {
                    thinCuts.push(cut);
                    totalArea6mm += (cut.width * cut.height * cut.quantity);
                    count6mmParts += cut.quantity;
                }
            });
            allCuts = allCuts.concat(cuts);
        });
        
        // Calculate 6mm sheets needed using bin-packing (matches diagram)
        const kerf = cabinets[0]?.kerf || 3;
        const calc = new CabinetCalculator();
        const sheetsNeeded6mm = calc.calculateActualSheetsFromCuts(thinCuts, 1220, 2440, kerf);

        // Group cuts by cabinet, part type and dimensions
        const groupedCuts = {};
        allCuts.forEach(cut => {
            const key = `${cut.cabinetName}-${cut.part}-${cut.width}-${cut.height}-${cut.thickness}`;
            if (!groupedCuts[key]) {
                groupedCuts[key] = { ...cut };
            } else {
                groupedCuts[key].quantity += cut.quantity;
            }
        });

        const cutListRows = Object.values(groupedCuts).map(cut => {
            const totalEdgeBanding = cut.edgeBanding ? 
                (cut.edgeBanding.front + cut.edgeBanding.back + cut.edgeBanding.left + cut.edgeBanding.right) : 0;
            const grainIcon = cut.grain === 'vertical' ? '↕' : cut.grain === 'horizontal' ? '↔' : '-';
            
            // Length is always the larger dimension, Width is the smaller
            let length = Math.max(cut.width, cut.height);
            let width = Math.min(cut.width, cut.height);
            
            const partLabel = `${cut.cabinetName} - ${cut.part}`;
            
            return `
            <tr>
                <td data-label="Part">${partLabel}</td>
                <td data-label="Length">${length}mm</td>
                <td data-label="Width">${width}mm</td>
                <td data-label="Thickness">${cut.thickness}mm</td>
                <td data-label="Qty">${cut.quantity}</td>
                <td data-label="Material">${cut.material}</td>
                <td data-label="Grain" style="text-align: center; font-size: 1.2em;">${grainIcon}</td>
                <td data-label="Edge Band">${totalEdgeBanding > 0 ? (totalEdgeBanding / 1000).toFixed(2) + 'm' : '-'}</td>
                <td data-label="Notes" style="font-size: 0.85em; color: #c5c5c5;">${cut.notes || ''}</td>
            </tr>
        `;
        }).join('');
        
        cutlistContent.innerHTML = `
            <div class="quote-header">
                <h3>CUT LIST & CUTTING DIAGRAM</h3>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Material:</strong> ${sheetMaterialName}</p>
                ${sheetsNeeded6mm > 0 ? `<p><strong>6mm Backing:</strong> ${sheetsNeeded6mm} sheet(s) needed (${count6mmParts} parts, ${(totalArea6mm / 1000000).toFixed(2)} m²)</p>` : ''}
            </div>

            <div class="cutlist-section">
                <h3>Cut List</h3>
                <table class="cutlist-table">
                    <thead>
                        <tr>
                            <th>Part</th>
                            <th>Length (grain)</th>
                            <th>Width (across)</th>
                            <th>Thickness</th>
                            <th>Qty</th>
                            <th>Material</th>
                            <th>Grain</th>
                            <th>Edge Band</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cutListRows}
                    </tbody>
                </table>
                <div style="margin-top: 15px; padding: 15px; background: rgba(108, 203, 95, 0.1); border-radius: 6px; border: 1px solid rgba(108, 203, 95, 0.2);">
                    <strong style="color: #6ccb5f;">Grain Direction Legend:</strong>
                    <ul style="margin: 10px 0 0 20px; color: #c5c5c5;">
                        <li>↕ = Vertical grain (grain runs along length/height)</li>
                        <li>↔ = Horizontal grain (grain runs along length/width)</li>
                        <li>- = No grain direction (back panels, drawer bottoms)</li>
                    </ul>
                    <p style="margin-top: 10px; color: #c5c5c5;"><strong>Cut List Format:</strong> Length × Width × Thickness</p>
                    <p style="color: #c5c5c5;">Length is the dimension along the grain direction. Width is across the grain.</p>
                    <p style="margin-top: 10px; color: #c5c5c5;"><strong>Note:</strong> Kerf (saw blade thickness) of ${cabinets[0]?.kerf || 3}mm is accounted for in cutting diagram spacing.</p>
                </div>
            </div>

            <div class="cutting-diagram-section">
                <h3>Sheet Cutting Diagram</h3>
                <p style="margin-bottom: 15px; color: #9a9a9a;">Visual layout for cutting ${sheetMaterialName} sheets (1220mm × 2440mm)</p>
                <div id="cuttingDiagram"></div>
                <div style="margin-top: 15px; padding: 15px; background: rgba(212, 175, 55, 0.1); border-radius: 6px; border-left: 4px solid #d4af37;">
                    <strong style="color: #e5c158;">Tips:</strong>
                    <ul style="margin: 10px 0 0 20px; color: #c5c5c5;">
                        <li>Each colored rectangle represents a part to cut</li>
                        <li>Dimensions shown are width × height in mm</li>
                        <li>Allow 3-5mm kerf (saw blade width) between cuts</li>
                        <li>Cut larger pieces first for better accuracy</li>
                        <li>This is an optimized layout to minimize waste</li>
                    </ul>
                </div>
            </div>
        `;

        // Generate cutting diagram
        generateCuttingDiagram(cabinets);
    }

    function displayQuote(projectData, cabinets, quote, sheetMaterialName, materialType) {
        const today = new Date().toLocaleDateString();
        const totalUnits = cabinets.reduce((sum, c) => sum + c.quantity, 0);
        const typesText = cabinets.length === 1 ? 'type' : 'types';
        const unitsText = totalUnits === 1 ? 'unit' : 'units';
        
        // Group cabinets by group/location
        const groupedCabinets = {};
        cabinets.forEach(cabinet => {
            const group = cabinet.group || 'Ungrouped';
            if (!groupedCabinets[group]) {
                groupedCabinets[group] = [];
            }
            groupedCabinets[group].push(cabinet);
        });

        let cabinetListHtml = '';
        Object.keys(groupedCabinets).sort().forEach(group => {
            cabinetListHtml += `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: var(--accent); font-size: 1em; margin-bottom: 8px;">${group}</h4>
            `;
            groupedCabinets[group].forEach(cabinet => {
                cabinetListHtml += `
                    <div class="quote-item">
                        <span>${cabinet.name} (${(cabinet.width/10).toFixed(1)}×${(cabinet.height/10).toFixed(1)}×${(cabinet.depth/10).toFixed(1)}cm)</span>
                        <span>Qty: ${cabinet.quantity}</span>
                    </div>
                `;
            });
            cabinetListHtml += `</div>`;
        });
        
        quotationContent.innerHTML = `
            <div class="quote-header">
                <h3>QUOTATION</h3>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Client:</strong> ${projectData.clientName}</p>
                <p><strong>Project:</strong> ${projectData.projectName}</p>
            </div>

            <div class="quote-section">
                <h3>Cabinets (${cabinets.length} ${typesText}, ${totalUnits} total ${unitsText})</h3>
                ${cabinetListHtml}
            </div>

            <div class="quote-section">
                <h3>Materials</h3>
                <div class="quote-item">
                    <span>${sheetMaterialName} (${quote.materials.sheetsNeeded} sheets, ${quote.materials.totalArea} m²)</span>
                    <span>₱${formatPrice(quote.materials.sheetMaterialCost)}</span>
                </div>
                ${quote.materials.sheetsNeeded6mm > 0 ? `
                <div class="quote-item">
                    <span>6mm Backing (${quote.materials.sheetsNeeded6mm} sheets, ${quote.materials.totalArea6mm} m²)</span>
                    <span>₱${formatPrice(quote.materials.sheet6mmCost)}</span>
                </div>` : ''}
                <div class="quote-item">
                    <span>Edge Banding (${quote.materials.edgeBandingMeters}m)</span>
                    <span>₱${formatPrice(quote.materials.edgeBandingCost)}</span>
                </div>
                <div class="quote-item">
                    <strong>Materials Subtotal:</strong>
                    <strong>₱${formatPrice(quote.materials.materialSubtotal)}</strong>
                </div>
            </div>

            <div class="quote-section">
                <h3>Hardware & Finishing</h3>
                ${quote.hardware.totalDoors > 0 ? `
                <div class="quote-item">
                    <span>Hinges (${quote.hardware.totalDoors} doors)</span>
                    <span>₱${formatPrice(quote.hardware.hingesCost)}</span>
                </div>` : ''}
                ${quote.hardware.totalDrawers > 0 ? `
                <div class="quote-item">
                    <span>Drawer Slides (${quote.hardware.totalDrawers} drawers)</span>
                    <span>₱${formatPrice(quote.hardware.drawerSlidesCost)}</span>
                </div>` : ''}
                ${quote.hardware.totalHandles > 0 && parseFloat(quote.hardware.handlesCost) > 0 ? `
                <div class="quote-item">
                    <span>Handles/Knobs (${quote.hardware.totalHandles} pieces)</span>
                    <span>₱${formatPrice(quote.hardware.handlesCost)}</span>
                </div>` : ''}
                ${parseFloat(quote.hardware.screwsCost) > 0 ? `
                <div class="quote-item">
                    <span>Screws</span>
                    <span>₱${formatPrice(quote.hardware.screwsCost)}</span>
                </div>` : ''}
                <div class="quote-item">
                    <strong>Hardware Subtotal:</strong>
                    <strong>₱${formatPrice(quote.hardware.hardwareSubtotal)}</strong>
                </div>
            </div>

            <div class="quote-section">
                <h3>Labor</h3>
                <div class="quote-item">
                    <span>${quote.labor.hours} hours @ ₱${formatPrice(quote.labor.rate)}/hour</span>
                    <span>₱${formatPrice(quote.labor.laborCost)}</span>
                </div>
            </div>

            <div class="quote-total">
                <div class="quote-item">
                    <span>Base Cost (Materials + Hardware + Labor):</span>
                    <span>₱${formatPrice(quote.totals.baseCost)}</span>
                </div>
                <div class="quote-item">
                    <span>Markup (${quote.totals.markupPercent}%):</span>
                    <span>₱${formatPrice(quote.totals.markupAmount)}</span>
                </div>
                ${parseFloat(quote.totals.overhead) > 0 ? `
                <div class="quote-item">
                    <span>Overhead:</span>
                    <span>₱${formatPrice(quote.totals.overhead)}</span>
                </div>` : ''}
                <div class="quote-item" style="font-size: 1.2em; color: var(--accent);">
                    <span>TOTAL:</span>
                    <span>₱${formatPrice(quote.totals.total)}</span>
                </div>
            </div>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666;">
                <p><em>Note: This quotation is valid for 30 days. Material costs subject to change based on availability.</em></p>
            </div>
        `;
    }

    function displaySimplifiedQuote() {
        const today = new Date().toLocaleDateString();
        const projectData = {
            clientName: document.getElementById('clientName').value || 'Client 1',
            projectName: document.getElementById('projectName').value || 'Project 1'
        };
        
        const totalUnits = cabinets.reduce((sum, c) => sum + c.quantity, 0);
        const typesText = cabinets.length === 1 ? 'type' : 'types';
        const unitsText = totalUnits === 1 ? 'unit' : 'units';
        
        // Get the last calculated quote data
        const sheetCost = parseFloat(document.getElementById('sheetCost').value) || 5000;
        const sheetMaterialName = document.getElementById('sheetMaterial').value;
        const sheetThickness = document.getElementById('sheetThickness').value;
        const fullMaterialName = `${sheetThickness}mm ${sheetMaterialName}`;
        
        const totalCabinetUnits = cabinets.reduce((sum, c) => sum + c.quantity, 0);
        const defaultLaborHours = totalCabinetUnits * 8;
        
        const pricing = {
            sheetCost: sheetCost,
            sheet6mmCost: parseFloat(document.getElementById('sheet6mmCost').value) || 500,
            edgeBanding: parseFloat(document.getElementById('edgeBanding').value) || 50,
            hingesCost: parseFloat(document.getElementById('hingesCost').value) || 300,
            slidePrices: {
                300: parseFloat(document.getElementById('slidePrice300').value) || 350,
                350: parseFloat(document.getElementById('slidePrice350').value) || 400,
                400: parseFloat(document.getElementById('slidePrice400').value) || 450,
                450: parseFloat(document.getElementById('slidePrice450').value) || 500,
                500: parseFloat(document.getElementById('slidePrice500').value) || 550,
                550: parseFloat(document.getElementById('slidePrice550').value) || 600
            },
            handlesCost: parseFloat(document.getElementById('handlesCost').value) || 0,
            screwsCost: parseFloat(document.getElementById('screwsCost').value) || 150,
            laborHours: defaultLaborHours,
            laborRate: parseFloat(document.getElementById('laborRate').value) || 200,
            markup: parseFloat(document.getElementById('markup').value) || 70,
            overhead: parseFloat(document.getElementById('overhead').value) || 0
        };
        
        const quote = calculator.generateQuote(cabinets, pricing);
        
        // Group cabinets by group/location
        const groupedCabinets = {};
        cabinets.forEach(cabinet => {
            const group = cabinet.group || 'Ungrouped';
            if (!groupedCabinets[group]) {
                groupedCabinets[group] = [];
            }
            groupedCabinets[group].push(cabinet);
        });

        let cabinetListHtml = '';
        Object.keys(groupedCabinets).sort().forEach(group => {
            cabinetListHtml += `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: var(--accent); font-size: 1em; margin-bottom: 8px;">${group}</h4>
            `;
            groupedCabinets[group].forEach(cabinet => {
                cabinetListHtml += `
                    <div class="quote-item">
                        <span>${cabinet.name}</span>
                        <span>${(cabinet.width/10).toFixed(1)}cm × ${(cabinet.height/10).toFixed(1)}cm × ${(cabinet.depth/10).toFixed(1)}cm (Qty: ${cabinet.quantity})</span>
                    </div>
                `;
            });
            cabinetListHtml += `</div>`;
        });
        
        simplifiedQuotationContent.innerHTML = `
            <div class="quote-header">
                <h3>QUOTATION</h3>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Client:</strong> ${projectData.clientName}</p>
                <p><strong>Project:</strong> ${projectData.projectName}</p>
            </div>

            <div class="quote-section">
                <h3>Cabinet Details</h3>
                ${cabinetListHtml}
                <div class="quote-item" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
                    <span><strong>Total:</strong></span>
                    <span><strong>${cabinets.length} ${typesText}, ${totalUnits} ${unitsText}</strong></span>
                </div>
            </div>

            <div class="quote-section">
                <h3>Material</h3>
                <div class="quote-item">
                    <span>${fullMaterialName}</span>
                </div>
            </div>

            <div class="quote-total">
                <div class="quote-item" style="font-size: 1.5em; color: var(--accent); padding: 20px 0;">
                    <span><strong>TOTAL COST:</strong></span>
                    <span><strong>₱${formatPrice(quote.totals.total)}</strong></span>
                </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: rgba(212, 175, 55, 0.1); border-radius: 12px; border-left: 4px solid var(--accent);">
                <h4 style="margin-bottom: 15px; color: var(--text-primary, #e0e0e0);">What's Included:</h4>
                <ul style="margin: 0 0 0 20px; color: var(--text-secondary, #c5c5c5); line-height: 1.8;">
                    <li>All materials (${fullMaterialName}, edge banding)</li>
                    <li>Hardware (hinges, drawer slides, handles)</li>
                    <li>Professional installation and finishing</li>
                    <li>Quality workmanship guarantee</li>
                </ul>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: rgba(212, 175, 55, 0.15); border-radius: 8px; font-size: 0.9em; color: #e5c158; border: 1px solid rgba(212, 175, 55, 0.3);">
                <p style="margin: 0;"><strong>Note:</strong> This quotation is valid for 30 days from the date above. Material costs are subject to change based on availability. A 50% deposit is required to begin work.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid var(--border-default, rgba(255,255,255,0.08)); text-align: center; color: var(--text-secondary, #c5c5c5);">
                <p style="margin: 5px 0;">Thank you for choosing our services!</p>
                <p style="margin: 5px 0; font-size: 0.9em;">For questions or concerns, please contact us.</p>
            </div>
        `;
    }

    addCabinetBtn.addEventListener('click', () => {
        const data = getCabinetData();
        const cabinet = new Cabinet(data);
        cabinets.push(cabinet);
        updateCabinetList();
        resetForm();
        cabinetListSection.style.display = 'block';
    });

    updateCabinetBtn.addEventListener('click', () => {
        if (editingIndex >= 0 && editingIndex < cabinets.length) {
            const data = getCabinetData();
            const cabinet = new Cabinet(data);
            cabinets[editingIndex] = cabinet;
            updateCabinetList();
            resetForm();
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    calculateBtn.addEventListener('click', () => {
        if (cabinets.length === 0) {
            showToast('Please add at least one cabinet first.', 'warning');
            return;
        }

        const projectData = {
            clientName: document.getElementById('clientName').value || 'Client 1',
            projectName: document.getElementById('projectName').value || 'Project 1'
        };

        const sheetCost = parseFloat(document.getElementById('sheetCost').value) || 5000;
        const sheetMaterialName = document.getElementById('sheetMaterial').value;

        // Calculate total number of cabinet units
        const totalCabinetUnits = cabinets.reduce((sum, c) => sum + c.quantity, 0);
        const defaultLaborHours = totalCabinetUnits * 8; // 8 hours per cabinet unit

        const pricing = {
            sheetCost: sheetCost,
            sheet6mmCost: parseFloat(document.getElementById('sheet6mmCost').value) || 500,
            edgeBanding: parseFloat(document.getElementById('edgeBanding').value) || 50,
            hingesCost: parseFloat(document.getElementById('hingesCost').value) || 300,
            slidePrices: {
                300: parseFloat(document.getElementById('slidePrice300').value) || 350,
                350: parseFloat(document.getElementById('slidePrice350').value) || 400,
                400: parseFloat(document.getElementById('slidePrice400').value) || 450,
                450: parseFloat(document.getElementById('slidePrice450').value) || 500,
                500: parseFloat(document.getElementById('slidePrice500').value) || 550,
                550: parseFloat(document.getElementById('slidePrice550').value) || 600
            },
            handlesCost: parseFloat(document.getElementById('handlesCost').value) || 0,
            screwsCost: parseFloat(document.getElementById('screwsCost').value) || 150,
            laborHours: defaultLaborHours, // Use calculated default
            laborRate: parseFloat(document.getElementById('laborRate').value) || 200,
            markup: parseFloat(document.getElementById('markup').value) || 70,
            overhead: parseFloat(document.getElementById('overhead').value) || 0
        };

        const sheetThickness = document.getElementById('sheetThickness').value;
        const fullMaterialName = `${sheetThickness}mm ${sheetMaterialName}`;
        const quote = calculator.generateQuote(cabinets, pricing);
        displayQuote(projectData, cabinets, quote, fullMaterialName, sheetMaterialName);
        generateCutlistView(cabinets, fullMaterialName, sheetMaterialName);
        resultsSection.style.display = 'block';
        cutlistResults.style.display = 'none';
        cabinetDrawingsResults.style.display = 'none';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Top calculate button does the same thing
    calculateBtnTop.addEventListener('click', () => {
        calculateBtn.click();
    });

    resetCurrentBtn.addEventListener('click', () => {
        resetForm();
    });

    printQuoteBtn.addEventListener('click', () => {
        printContent(quotationContent.innerHTML, 'Quotation');
    });

    copyQuoteBtn.addEventListener('click', () => {
        const text = quotationContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyQuoteBtn.textContent;
            copyQuoteBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyQuoteBtn.textContent = originalText;
            }, 2000);
        });
    });

    viewCutlistBtn.addEventListener('click', () => {
        resultsSection.style.display = 'none';
        cabinetDrawingsResults.style.display = 'none';
        cutlistResults.style.display = 'block';
        cutlistResults.scrollIntoView({ behavior: 'smooth' });
    });

    viewCabinetDrawingsBtn.addEventListener('click', () => {
        generateCabinetDrawings(cabinets);
        resultsSection.style.display = 'none';
        cutlistResults.style.display = 'none';
        simplifiedResults.style.display = 'none';
        cabinetDrawingsResults.style.display = 'block';
        cabinetDrawingsResults.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('printDrawingsBtn').addEventListener('click', () => {
        printContent(cabinetDrawingsContent.innerHTML, 'Cabinet Drawings');
    });

    document.getElementById('backToQuoteFromDrawingsBtn').addEventListener('click', () => {
        cabinetDrawingsResults.style.display = 'none';
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    printCutlistBtn.addEventListener('click', () => {
        printContent(cutlistContent.innerHTML, 'Cut List');
    });

    copyCutlistBtn.addEventListener('click', () => {
        const text = cutlistContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyCutlistBtn.textContent;
            copyCutlistBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyCutlistBtn.textContent = originalText;
            }, 2000);
        });
    });

    backToQuoteBtn.addEventListener('click', () => {
        cutlistResults.style.display = 'none';
        cabinetDrawingsResults.style.display = 'none';
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    simplifiedQuoteBtn.addEventListener('click', () => {
        displaySimplifiedQuote();
        resultsSection.style.display = 'none';
        cabinetDrawingsResults.style.display = 'none';
        simplifiedResults.style.display = 'block';
        simplifiedResults.scrollIntoView({ behavior: 'smooth' });
    });

    printSimplifiedBtn.addEventListener('click', () => {
        printContent(simplifiedQuotationContent.innerHTML, 'Simplified Quotation');
    });

    copySimplifiedBtn.addEventListener('click', () => {
        const text = simplifiedQuotationContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copySimplifiedBtn.textContent;
            copySimplifiedBtn.textContent = 'Copied!';
            setTimeout(() => {
                copySimplifiedBtn.textContent = originalText;
            }, 2000);
        });
    });

    backToDetailedBtn.addEventListener('click', () => {
        simplifiedResults.style.display = 'none';
        cabinetDrawingsResults.style.display = 'none';
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    exportCsvBtn.addEventListener('click', () => {
        exportCutlistToCSV();
    });

    exportProjectBtn.addEventListener('click', () => {
        exportProject();
    });

    importCsvBtn.addEventListener('click', () => {
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            importCutlistFromCSV(file);
        }
    });

    // Header import button
    importProjectBtnHeader.addEventListener('click', () => {
        projectFileInputHeader.click();
    });

    projectFileInputHeader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            importProject(file);
        }
    });

    function exportProject() {
        // Gather all project data
        const projectData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            projectInfo: {
                clientName: document.getElementById('clientName').value || 'Client 1',
                projectName: document.getElementById('projectName').value || 'Project 1'
            },
            settings: {
                sheetMaterial: document.getElementById('sheetMaterial').value,
                sheetCost: parseFloat(document.getElementById('sheetCost').value) || 5000,
                sheet6mmCost: parseFloat(document.getElementById('sheet6mmCost').value) || 500,
                sheetThickness: parseFloat(document.getElementById('sheetThickness').value) || 18,
                grainOrientation: document.getElementById('grainOrientation').value || 'horizontal',
                edgeBanding: parseFloat(document.getElementById('edgeBanding').value) || 50,
                hingesCost: parseFloat(document.getElementById('hingesCost').value) || 300,
                slidePrices: {
                    300: parseFloat(document.getElementById('slidePrice300').value) || 350,
                    350: parseFloat(document.getElementById('slidePrice350').value) || 400,
                    400: parseFloat(document.getElementById('slidePrice400').value) || 450,
                    450: parseFloat(document.getElementById('slidePrice450').value) || 500,
                    500: parseFloat(document.getElementById('slidePrice500').value) || 550,
                    550: parseFloat(document.getElementById('slidePrice550').value) || 600
                },
                handlesCost: parseFloat(document.getElementById('handlesCost').value) || 0,
                screwsCost: parseFloat(document.getElementById('screwsCost').value) || 150,
                laborHours: parseFloat(document.getElementById('laborHours').value) || 8,
                laborRate: parseFloat(document.getElementById('laborRate').value) || 200,
                markup: parseFloat(document.getElementById('markup').value) || 70,
                overhead: parseFloat(document.getElementById('overhead').value) || 0,
                kerf: parseFloat(document.getElementById('kerf').value) || 3
            },
            cabinets: cabinets.map(cabinet => ({
                name: cabinet.name,
                group: cabinet.group,
                quantity: cabinet.quantity,
                width: cabinet.width,
                height: cabinet.height,
                depth: cabinet.depth,
                cabinetType: cabinet.cabinetType,
                numDoors: cabinet.numDoors,
                numDrawers: cabinet.numDrawers,
                drawerHeights: cabinet.drawerHeights,
                drawerWidths: cabinet.drawerWidths,
                drawerSlideLength: cabinet.drawerSlideLength,
                numShelves: cabinet.numShelves,
                numVerticalDividers: cabinet.numVerticalDividers,
                grainOrientation: cabinet.grainOrientation
            }))
        };

        // Create JSON file
        const jsonContent = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename
        const clientName = projectData.projectInfo.clientName || 'Client';
        const projectName = projectData.projectInfo.projectName || 'Project';
        const date = new Date().toISOString().split('T')[0];
        const filename = `${clientName}-${projectName}-Project-${date}.json`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show feedback
        const originalText = exportProjectBtn.textContent;
        exportProjectBtn.textContent = 'Exported!';
        setTimeout(() => {
            exportProjectBtn.textContent = originalText;
        }, 2000);
    }

    function importProject(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const projectData = JSON.parse(e.target.result);
                
                // Validate project data
                if (!projectData.version || !projectData.settings || !projectData.cabinets) {
                    showToast('Invalid project file format.', 'error');
                    return;
                }
                
                // Load project info
                if (projectData.projectInfo) {
                    document.getElementById('clientName').value = projectData.projectInfo.clientName || '';
                    document.getElementById('projectName').value = projectData.projectInfo.projectName || '';
                }
                
                // Load settings
                const settings = projectData.settings;
                document.getElementById('sheetMaterial').value = settings.sheetMaterial || 'PVC';
                document.getElementById('sheetCost').value = settings.sheetCost || 5000;
                document.getElementById('sheet6mmCost').value = settings.sheet6mmCost || 500;
                document.getElementById('sheetThickness').value = settings.sheetThickness || 18;
                document.getElementById('grainOrientation').value = settings.grainOrientation || 'horizontal';
                document.getElementById('edgeBanding').value = settings.edgeBanding || 50;
                document.getElementById('hingesCost').value = settings.hingesCost || 300;
                if (settings.slidePrices) {
                    document.getElementById('slidePrice300').value = settings.slidePrices[300] || 350;
                    document.getElementById('slidePrice350').value = settings.slidePrices[350] || 400;
                    document.getElementById('slidePrice400').value = settings.slidePrices[400] || 450;
                    document.getElementById('slidePrice450').value = settings.slidePrices[450] || 500;
                    document.getElementById('slidePrice500').value = settings.slidePrices[500] || 550;
                    document.getElementById('slidePrice550').value = settings.slidePrices[550] || 600;
                }
                document.getElementById('handlesCost').value = settings.handlesCost || 0;
                document.getElementById('screwsCost').value = settings.screwsCost || settings.finishCost || 150;
                document.getElementById('laborHours').value = settings.laborHours || 8;
                document.getElementById('laborRate').value = settings.laborRate || 200;
                document.getElementById('markup').value = settings.markup || 70;
                document.getElementById('overhead').value = settings.overhead || 0;
                document.getElementById('kerf').value = settings.kerf || 3;
                
                // Load cabinets
                cabinets.length = 0; // Clear existing cabinets
                projectData.cabinets.forEach(cabinetData => {
                    const cabinet = new Cabinet({
                        cabinetName: cabinetData.name,
                        cabinetGroup: cabinetData.group || 'Ungrouped',
                        quantity: cabinetData.quantity,
                        width: cabinetData.width,
                        height: cabinetData.height,
                        depth: cabinetData.depth,
                        cabinetType: cabinetData.cabinetType,
                        numDoors: cabinetData.numDoors,
                        numDrawers: cabinetData.numDrawers,
                        drawerHeights: cabinetData.drawerHeights || [],
                        drawerWidths: cabinetData.drawerWidths || [],
                        drawerSlideLength: cabinetData.drawerSlideLength || 500,
                        numShelves: cabinetData.numShelves,
                        numVerticalDividers: cabinetData.numVerticalDividers || 0,
                        sheetMaterial: `${settings.sheetThickness}mm ${settings.sheetMaterial}`,
                        thickness: settings.sheetThickness,
                        kerf: settings.kerf,
                        grainOrientation: cabinetData.grainOrientation || settings.grainOrientation
                    });
                    cabinets.push(cabinet);
                });
                
                // Update UI
                updateCabinetList();
                if (cabinets.length > 0) {
                    cabinetListSection.style.display = 'block';
                }
                
                // Navigate to last step (Review & Calculate) and auto-generate
                goToStep(4);
                updateCabinetListReview();
                calculateBtn.click();
                
                showToast(`Project imported successfully! ${cabinets.length} cabinet(s) loaded.`, 'success');
                
            } catch (error) {
                showToast('Error reading project file: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        projectFileInputHeader.value = '';
    }

    function importCutlistFromCSV(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const csvContent = e.target.result;
                const lines = csvContent.split('\n');
                
                // Skip header row
                if (lines.length < 2) {
                    showToast('CSV file is empty or invalid.', 'error');
                    return;
                }
                
                // Parse CSV data
                const importedCuts = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    // Parse CSV line (handle quoted fields)
                    const fields = parseCSVLine(line);
                    
                    if (fields.length >= 5) {
                        const length = parseFloat(fields[0]);
                        const width = parseFloat(fields[1]);
                        const qty = parseInt(fields[2]);
                        const material = fields[3].replace(/^"|"$/g, ''); // Remove quotes
                        const label = fields[4].replace(/^"|"$/g, ''); // Remove quotes
                        
                        if (!isNaN(length) && !isNaN(width) && !isNaN(qty)) {
                            importedCuts.push({
                                length,
                                width,
                                quantity: qty,
                                material,
                                label
                            });
                        }
                    }
                }
                
                if (importedCuts.length === 0) {
                    showToast('No valid data found in CSV file.', 'error');
                    return;
                }
                
                // Display imported data
                displayImportedCutlist(importedCuts);
                
                // Show feedback
                const originalText = importCsvBtn.textContent;
                importCsvBtn.textContent = `Imported ${importedCuts.length} items!`;
                setTimeout(() => {
                    importCsvBtn.textContent = originalText;
                }, 3000);
                
            } catch (error) {
                showToast('Error reading CSV file: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        csvFileInput.value = '';
    }

    function parseCSVLine(line) {
        const fields = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        
        fields.push(currentField);
        return fields;
    }

    function displayImportedCutlist(cuts) {
        const today = new Date().toLocaleDateString();
        
        // Calculate materials from imported cuts
        const materialCalculation = calculateMaterialsFromImportedCuts(cuts);
        
        const cutListRows = cuts.map(cut => `
            <tr>
                <td data-label="Part">${cut.label}</td>
                <td data-label="Length">${cut.length}mm</td>
                <td data-label="Width">${cut.width}mm</td>
                <td data-label="Qty">${cut.quantity}</td>
                <td data-label="Material">${cut.material}</td>
            </tr>
        `).join('');
        
        cutlistContent.innerHTML = `
            <div class="quote-header">
                <h3>IMPORTED CUT LIST</h3>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Source:</strong> CSV Import</p>
            </div>

            <div class="cutlist-section">
                <h3>Cut List (${cuts.length} items)</h3>
                <table class="cutlist-table">
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th>Length</th>
                            <th>Width</th>
                            <th>Qty</th>
                            <th>Material</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cutListRows}
                    </tbody>
                </table>
            </div>
        `;
        
        // Generate quote from imported data
        displayImportedQuote(materialCalculation);
        
        // Navigate to step 4 and show the quote view
        goToStep(4);
        resultsSection.style.display = 'block';
        cutlistResults.style.display = 'none';
        cabinetDrawingsResults.style.display = 'none';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function calculateMaterialsFromImportedCuts(cuts) {
        const SHEET_WIDTH = 1220; // mm
        const SHEET_HEIGHT = 2440; // mm
        const SHEET_AREA = SHEET_WIDTH * SHEET_HEIGHT; // mm²
        const WASTE_FACTOR = 1.15; // 15% waste
        
        let totalArea = 0;
        
        // Calculate total area from cuts
        cuts.forEach(cut => {
            const area = cut.length * cut.width * cut.quantity;
            totalArea += area;
        });
        
        // Calculate sheets needed
        const sheetsNeeded = Math.ceil((totalArea * WASTE_FACTOR) / SHEET_AREA);
        
        // Get pricing from setup
        const sheetCost = parseFloat(document.getElementById('sheetCost').value) || 5000;
        const edgeBandingCostPerMeter = parseFloat(document.getElementById('edgeBanding').value) || 50;
        const hingesCost = parseFloat(document.getElementById('hingesCost').value) || 300;
        const drawerSlidesCost = parseFloat(document.getElementById('slidePrice500').value) || 550; // Default to 500mm slide price for imports
        const handlesCost = parseFloat(document.getElementById('handlesCost').value) || 0;
        const screwsCost = parseFloat(document.getElementById('screwsCost').value) || 150;
        const laborRate = parseFloat(document.getElementById('laborRate').value) || 200;
        const laborHoursPerCabinet = parseFloat(document.getElementById('laborHours').value) || 8;
        const markupPercent = parseFloat(document.getElementById('markup').value) || 70;
        const overhead = parseFloat(document.getElementById('overhead').value) || 0;
        
        // Estimate cabinets, doors, drawers from labels
        const cabinetNames = new Set();
        let doorCount = 0;
        let drawerCount = 0;
        
        cuts.forEach(cut => {
            const label = cut.label.toLowerCase();
            
            // Extract cabinet name (before the dash)
            const parts = cut.label.split(' - ');
            if (parts.length > 0) {
                cabinetNames.add(parts[0]);
            }
            
            // Count doors and drawers
            if (label.includes('door')) {
                doorCount += cut.quantity;
            }
            if (label.includes('drawer') && label.includes('front') && label.includes('overlay')) {
                drawerCount += cut.quantity;
            }
        });
        
        const estimatedCabinets = cabinetNames.size || 1;
        const totalHandles = doorCount + drawerCount;
        
        // Calculate costs
        const sheetMaterialCost = sheetsNeeded * sheetCost;
        const edgeBandingMeters = 0; // Not available from CSV
        const edgeBandingCost = 0;
        
        const materialSubtotal = sheetMaterialCost + edgeBandingCost;
        
        const hingesCostTotal = doorCount * hingesCost;
        const drawerSlidesCostTotal = drawerCount * drawerSlidesCost;
        const handlesCostTotal = totalHandles * handlesCost;
        const screwsCostTotal = estimatedCabinets * screwsCost;
        
        const hardwareSubtotal = hingesCostTotal + drawerSlidesCostTotal + handlesCostTotal + screwsCostTotal;
        
        const laborHours = estimatedCabinets * laborHoursPerCabinet;
        const laborCost = laborHours * laborRate;
        
        const baseCost = materialSubtotal + hardwareSubtotal + laborCost;
        const markupAmount = baseCost * (markupPercent / 100);
        const total = baseCost + markupAmount + overhead;
        
        return {
            sheetsNeeded,
            totalArea: (totalArea / 1000000).toFixed(2),
            sheetMaterialCost: sheetMaterialCost.toFixed(2),
            edgeBandingMeters: edgeBandingMeters.toFixed(2),
            edgeBandingCost: edgeBandingCost.toFixed(2),
            materialSubtotal: materialSubtotal.toFixed(2),
            doorCount,
            drawerCount,
            totalHandles,
            hingesCost: hingesCostTotal.toFixed(2),
            drawerSlidesCost: drawerSlidesCostTotal.toFixed(2),
            handlesCost: handlesCostTotal.toFixed(2),
            finishCost: screwsCostTotal.toFixed(2),
            hardwareSubtotal: hardwareSubtotal.toFixed(2),
            laborHours: laborHours.toFixed(1),
            laborRate,
            laborCost: laborCost.toFixed(2),
            baseCost: baseCost.toFixed(2),
            markupPercent,
            markupAmount: markupAmount.toFixed(2),
            overhead: overhead.toFixed(2),
            total: total.toFixed(2),
            estimatedCabinets
        };
    }

    function displayImportedQuote(calc) {
        const today = new Date().toLocaleDateString();
        const sheetMaterial = document.getElementById('sheetMaterial').value;
        const sheetThickness = document.getElementById('sheetThickness').value;
        const fullMaterialName = `${sheetThickness}mm ${sheetMaterial}`;
        
        quotationContent.innerHTML = `
            <div class="quote-header">
                <h3>QUOTATION (FROM IMPORTED DATA)</h3>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Source:</strong> CSV Import</p>
                <p style="color: #f57c00;"><strong>Note:</strong> Estimated from cut list data</p>
            </div>

            <div class="quote-section">
                <h3>Estimated Cabinets: ${calc.estimatedCabinets}</h3>
                <p style="color: #666; font-size: 0.9em;">Based on unique cabinet names in imported data</p>
            </div>

            <div class="quote-section">
                <h3>Materials</h3>
                <div class="quote-item">
                    <span>${fullMaterialName} (${calc.sheetsNeeded} sheets, ${calc.totalArea} m²)</span>
                    <span>₱${formatPrice(calc.sheetMaterialCost)}</span>
                </div>
                <div class="quote-item">
                    <strong>Materials Subtotal:</strong>
                    <strong>₱${formatPrice(calc.materialSubtotal)}</strong>
                </div>
            </div>

            <div class="quote-section">
                <h3>Hardware & Finishing</h3>
                ${calc.doorCount > 0 ? `
                <div class="quote-item">
                    <span>Hinges (${calc.doorCount} doors)</span>
                    <span>₱${formatPrice(calc.hingesCost)}</span>
                </div>` : ''}
                ${calc.drawerCount > 0 ? `
                <div class="quote-item">
                    <span>Drawer Slides (${calc.drawerCount} drawers)</span>
                    <span>₱${formatPrice(calc.drawerSlidesCost)}</span>
                </div>` : ''}
                ${calc.totalHandles > 0 && parseFloat(calc.handlesCost) > 0 ? `
                <div class="quote-item">
                    <span>Handles/Knobs (${calc.totalHandles} pieces)</span>
                    <span>₱${formatPrice(calc.handlesCost)}</span>
                </div>` : ''}
                ${parseFloat(calc.finishCost) > 0 ? `
                <div class="quote-item">
                    <span>Screws</span>
                    <span>₱${formatPrice(calc.finishCost)}</span>
                </div>` : ''}
                <div class="quote-item">
                    <strong>Hardware Subtotal:</strong>
                    <strong>₱${formatPrice(calc.hardwareSubtotal)}</strong>
                </div>
            </div>

            <div class="quote-section">
                <h3>Labor</h3>
                <div class="quote-item">
                    <span>${calc.laborHours} hours @ ₱${formatPrice(calc.laborRate)}/hour</span>
                    <span>₱${formatPrice(calc.laborCost)}</span>
                </div>
            </div>

            <div class="quote-total">
                <div class="quote-item">
                    <span>Base Cost (Materials + Hardware + Labor):</span>
                    <span>₱${formatPrice(calc.baseCost)}</span>
                </div>
                <div class="quote-item">
                    <span>Markup (${calc.markupPercent}%):</span>
                    <span>₱${formatPrice(calc.markupAmount)}</span>
                </div>
                ${parseFloat(calc.overhead) > 0 ? `
                <div class="quote-item">
                    <span>Overhead:</span>
                    <span>₱${formatPrice(calc.overhead)}</span>
                </div>` : ''}
                <div class="quote-item" style="font-size: 1.2em; color: var(--accent);">
                    <span>TOTAL:</span>
                    <span>₱${formatPrice(calc.total)}</span>
                </div>
            </div>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 0.9em; color: #666;">
                <p><em>Note: This quotation is estimated from imported cut list data. Cabinet count, doors, and drawers are detected from part labels. For accurate quotes, use the cabinet builder.</em></p>
            </div>
        `;
    }

    function exportCutlistToCSV() {
        // Generate cut list from all cabinets
        let allCuts = [];
        cabinets.forEach(cabinet => {
            const cuts = cabinet.getCutList();
            cuts.forEach(cut => {
                cut.cabinetName = cabinet.name;
            });
            allCuts = allCuts.concat(cuts);
        });

        // Note: We don't group cuts here because we need to preserve cabinet names
        // Each cut will have its own row with cabinet name + part as label

        // Prepare CSV data with columns: Length, Width, Qty, Material, Label
        const csvRows = [];
        
        // Add header
        csvRows.push('Length,Width,Qty,Material,Label');
        
        // Add data rows
        allCuts.forEach(cut => {
            // Length is always the larger dimension
            let length = Math.max(cut.width, cut.height);
            let width = Math.min(cut.width, cut.height);
            
            const label = `"${cut.cabinetName} - ${cut.part}"`;
            const material = `"${cut.material}"`;
            
            csvRows.push(`${length},${width},${cut.quantity},${material},${label}`);
        });

        // Create CSV content
        const csvContent = csvRows.join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename with project name and date
        const projectName = document.getElementById('projectName').value || 'Cabinet';
        const date = new Date().toISOString().split('T')[0];
        const filename = `${projectName.replace(/[^a-z0-9]/gi, '_')}_Cutlist_${date}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show feedback
        const originalText = exportCsvBtn.textContent;
        exportCsvBtn.textContent = 'Exported!';
        setTimeout(() => {
            exportCsvBtn.textContent = originalText;
        }, 2000);
    }

    function generateCabinetDrawings(cabinets) {
        cabinetDrawingsContent.innerHTML = '';

        // Rotatable 3D cabinet renderer
        // Each cabinet gets its own rotation state with drag-to-rotate interaction

        function createCabinetRenderer(cabinet, container) {
            let rotY = 0.6;  // horizontal rotation (radians)
            let rotX = 0.45; // vertical tilt (radians)
            let dragging = false;
            let lastX = 0, lastY = 0;

            const W = cabinet.width;
            const H = cabinet.height;
            const D = cabinet.depth;
            const t = cabinet.thickness;
            const maxDim = Math.max(W, H, D);
            const scale = Math.min(320 / maxDim, 0.45);
            const sw = W * scale, sh = H * scale, sd = D * scale;
            const st = Math.max(t * scale, 1.5);

            // 3D projection with arbitrary rotation
            function project(x, y, z) {
                // Center the model
                const cx = x - sw / 2, cy = y - sd / 2, cz = z - sh / 2;
                // Rotate around Y axis (horizontal drag)
                const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
                const rx1 = cx * cosY + cy * sinY;
                const ry1 = -cx * sinY + cy * cosY;
                const rz1 = cz;
                // Rotate around X axis (vertical drag)
                const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
                const rx2 = rx1;
                const ry2 = ry1 * cosX - rz1 * sinX;
                const rz2 = ry1 * sinX + rz1 * cosX;
                // Simple orthographic with slight perspective
                const fov = 800;
                const pScale = fov / (fov + ry2);
                return { px: rx2 * pScale, py: -rz2 * pScale, depth: ry2 };
            }

            function quadPts(x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4) {
                const pts = [project(x1,y1,z1), project(x2,y2,z2), project(x3,y3,z3), project(x4,y4,z4)];
                const avgDepth = (pts[0].depth + pts[1].depth + pts[2].depth + pts[3].depth) / 4;
                const str = pts.map(p => `${p.px.toFixed(1)},${p.py.toFixed(1)}`).join(' ');
                return { str, avgDepth };
            }

            function linePts(x1,y1,z1, x2,y2,z2) {
                const a = project(x1,y1,z1), b = project(x2,y2,z2);
                return { x1: a.px, y1: a.py, x2: b.px, y2: b.py, depth: (a.depth + b.depth) / 2 };
            }

            // Fixed viewBox: use bounding sphere so size doesn't change on rotation
            const maxRadius = Math.sqrt(sw * sw + sd * sd + sh * sh) / 2 + 35;
            const fixedVB = Math.ceil(maxRadius * 2);

            function render() {
                // Collect all faces with depth for painter's algorithm
                const faces = [];

                function addFace(x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4, fill, stroke, strokeW) {
                    const q = quadPts(x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4);
                    // Compute face normal for backface culling
                    const p0 = project(x1,y1,z1), p1 = project(x2,y2,z2), p2 = project(x3,y3,z3);
                    const nx = (p1.px - p0.px) * (p2.py - p0.py) - (p1.py - p0.py) * (p2.px - p0.px);
                    faces.push({ type: 'poly', pts: q.str, depth: q.avgDepth, fill, stroke: stroke || '#666', strokeW: strokeW || 1, normal: nx });
                }

                function addLine(x1,y1,z1, x2,y2,z2, stroke, strokeW, cap) {
                    const l = linePts(x1,y1,z1, x2,y2,z2);
                    faces.push({ type: 'line', ...l, depth: l.depth - 100, stroke, strokeW, cap });
                }

                // Back panel
                addFace(st,sd-1,st, sw-st,sd-1,st, sw-st,sd-1,sh-st, st,sd-1,sh-st, '#252525', '#444', 0.5);

                // Bottom faces
                addFace(0,0,0, sw,0,0, sw,sd,0, 0,sd,0, '#3d3530', '#777', 1);
                addFace(0,0,st, sw,0,st, sw,0,0, 0,0,0, '#4a4038', '#888', 1);
                addFace(0,sd,0, sw,sd,0, sw,sd,st, 0,sd,st, '#352f28', '#666', 1);

                // Top faces
                addFace(0,0,sh, sw,0,sh, sw,sd,sh, 0,sd,sh, '#5a4f42', '#999', 1);
                addFace(0,0,sh, sw,0,sh, sw,0,sh-st, 0,0,sh-st, '#4a4038', '#888', 1);
                addFace(0,sd,sh-st, sw,sd,sh-st, sw,sd,sh, 0,sd,sh, '#352f28', '#666', 1);

                // Left side faces
                addFace(0,0,0, 0,sd,0, 0,sd,sh, 0,0,sh, '#4a4038', '#888', 1);
                addFace(0,0,0, st,0,0, st,0,sh, 0,0,sh, '#5a4f42', '#999', 1);

                // Right side faces
                addFace(sw,0,0, sw,sd,0, sw,sd,sh, sw,0,sh, '#352f28', '#777', 1);
                addFace(sw-st,0,0, sw,0,0, sw,0,sh, sw-st,0,sh, '#4a4038', '#888', 1);

                // Shelves
                if (cabinet.numShelves > 0) {
                    const innerH = sh - 2 * st;
                    const spacing = innerH / (cabinet.numShelves + 1);
                    for (let i = 1; i <= cabinet.numShelves; i++) {
                        const sz = st + spacing * i;
                        addFace(st,st,sz, sw-st,st,sz, sw-st,sd-st,sz, st,sd-st,sz, 'rgba(186,225,255,0.18)', '#7ab8db', 0.8);
                        addFace(st,0,sz, sw-st,0,sz, sw-st,0,sz-st*0.5, st,0,sz-st*0.5, 'rgba(186,225,255,0.12)', '#7ab8db', 0.6);
                        addFace(st,sd-st,sz-st*0.5, sw-st,sd-st,sz-st*0.5, sw-st,sd-st,sz, st,sd-st,sz, 'rgba(186,225,255,0.08)', '#5a9ab5', 0.5);
                    }
                }

                // Vertical dividers
                if (cabinet.numVerticalDividers > 0) {
                    const sections = cabinet.numVerticalDividers + 1;
                    const innerW = sw - 2 * st;
                    for (let i = 1; i <= cabinet.numVerticalDividers; i++) {
                        const dx = st + (innerW / sections) * i;
                        const dw = st * 0.4;
                        addFace(dx,0,st, dx+dw,0,st, dx+dw,0,sh-st, dx,0,sh-st, 'rgba(224,187,228,0.2)', '#c49ec9', 0.6);
                        addFace(dx,sd-st,st, dx+dw,sd-st,st, dx+dw,sd-st,sh-st, dx,sd-st,sh-st, 'rgba(224,187,228,0.1)', '#9a7a9e', 0.5);
                        addFace(dx,0,sh-st, dx+dw,0,sh-st, dx+dw,sd-st,sh-st, dx,sd-st,sh-st, 'rgba(224,187,228,0.12)', '#c49ec9', 0.5);
                    }
                }

                // Doors & Drawers
                const gap = Math.max(1.5 * scale, 1);
                const fOff = -2;
                let doorBottom = 0, doorTop = sh;

                if (cabinet.numDrawers > 0) {
                    const dHeights = cabinet.drawerHeights.length === cabinet.numDrawers
                        ? cabinet.drawerHeights
                        : Array(cabinet.numDrawers).fill(Math.floor(H / cabinet.numDrawers));
                    let dz = sh;
                    dHeights.forEach((dh, i) => {
                        const sdh = dh * scale;
                        dz -= sdh;
                        const dWidths = cabinet.drawerWidths || [];
                        const cw = dWidths[i] || 0;
                        const dw = cw > 0 ? cw * scale : sw;
                        const dx = cw > 0 ? (sw - dw) / 2 : 0;
                        addFace(dx+gap,fOff,dz+gap, dx+dw-gap,fOff,dz+gap, dx+dw-gap,fOff,dz+sdh-gap, dx+gap,fOff,dz+sdh-gap, 'rgba(108,203,95,0.18)', '#6ccb5f', 1.2);
                        addFace(dx+gap,fOff,dz+sdh-gap, dx+dw-gap,fOff,dz+sdh-gap, dx+dw-gap,fOff+st*0.6,dz+sdh-gap, dx+gap,fOff+st*0.6,dz+sdh-gap, 'rgba(108,203,95,0.1)', '#6ccb5f', 0.5);
                        addFace(dx+dw-gap,fOff,dz+gap, dx+dw-gap,fOff+st*0.6,dz+gap, dx+dw-gap,fOff+st*0.6,dz+sdh-gap, dx+dw-gap,fOff,dz+sdh-gap, 'rgba(108,203,95,0.08)', '#6ccb5f', 0.5);
                        const hW = Math.min(dw * 0.2, 30);
                        addLine(dx+(dw-hW)/2, fOff-1, dz+sdh*0.5, dx+(dw+hW)/2, fOff-1, dz+sdh*0.5, '#6ccb5f', 2.5, true);
                    });
                    doorTop = dz;
                }

                if (cabinet.numDoors > 0 && doorTop - doorBottom > gap * 4) {
                    const doorW = (sw - gap * (cabinet.numDoors - 1)) / cabinet.numDoors;
                    for (let i = 0; i < cabinet.numDoors; i++) {
                        const dx = i * (doorW + gap);
                        addFace(dx+gap,fOff,doorBottom+gap, dx+doorW-gap,fOff,doorBottom+gap, dx+doorW-gap,fOff,doorTop-gap, dx+gap,fOff,doorTop-gap, 'rgba(212,175,55,0.15)', '#d4af37', 1.2);
                        addFace(dx+gap,fOff,doorTop-gap, dx+doorW-gap,fOff,doorTop-gap, dx+doorW-gap,fOff+st*0.6,doorTop-gap, dx+gap,fOff+st*0.6,doorTop-gap, 'rgba(212,175,55,0.08)', '#d4af37', 0.5);
                        addFace(dx+doorW-gap,fOff,doorBottom+gap, dx+doorW-gap,fOff+st*0.6,doorBottom+gap, dx+doorW-gap,fOff+st*0.6,doorTop-gap, dx+doorW-gap,fOff,doorTop-gap, 'rgba(212,175,55,0.06)', '#d4af37', 0.5);
                        const hH = Math.min((doorTop-doorBottom)*0.1, 22);
                        const hx = (i < cabinet.numDoors/2) ? dx+doorW-gap-8 : dx+gap+6;
                        const hz = doorBottom + (doorTop-doorBottom)*0.4;
                        addLine(hx, fOff-1, hz, hx, fOff-1, hz+hH, '#d4af37', 2.5, true);
                    }
                }

                // Sort by depth (painter's algorithm - far to near)
                faces.sort((a, b) => b.depth - a.depth);

                const half = fixedVB / 2;
                let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-half} ${-half} ${fixedVB} ${fixedVB}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:${Math.max(fixedVB, 400)}px;height:auto;background:#1a1a1a;border-radius:8px;user-select:none;">`;
                svg += `<defs><style>.d3-dim{font-family:Inter,sans-serif;font-size:11px;fill:#9a9a9a;text-anchor:middle}</style></defs>`;

                faces.forEach(f => {
                    if (f.type === 'poly') {
                        svg += `<polygon points="${f.pts}" fill="${f.fill}" stroke="${f.stroke}" stroke-width="${f.strokeW}" stroke-linejoin="round"/>`;
                    } else {
                        svg += `<line x1="${f.x1.toFixed(1)}" y1="${f.y1.toFixed(1)}" x2="${f.x2.toFixed(1)}" y2="${f.y2.toFixed(1)}" stroke="${f.stroke}" stroke-width="${f.strokeW}" ${f.cap ? 'stroke-linecap="round"' : ''}/>`;
                    }
                });

                // Dimension labels (always visible, positioned at corners)
                const bfl = project(0, -15, 0), bfr = project(sw, -15, 0), bfm = project(sw/2, -18, 0);
                svg += `<line x1="${bfl.px.toFixed(1)}" y1="${bfl.py.toFixed(1)}" x2="${bfr.px.toFixed(1)}" y2="${bfr.py.toFixed(1)}" stroke="#666" stroke-width="0.7"/>`;
                svg += `<text x="${bfm.px.toFixed(1)}" y="${(bfm.py - 5).toFixed(1)}" class="d3-dim">${W}mm</text>`;

                const hb = project(-15, 0, 0), ht = project(-15, 0, sh), hm = project(-18, 0, sh/2);
                svg += `<line x1="${hb.px.toFixed(1)}" y1="${hb.py.toFixed(1)}" x2="${ht.px.toFixed(1)}" y2="${ht.py.toFixed(1)}" stroke="#666" stroke-width="0.7"/>`;
                svg += `<text x="${(hm.px - 5).toFixed(1)}" y="${hm.py.toFixed(1)}" class="d3-dim" text-anchor="end">${H}mm</text>`;

                const db = project(sw+15, 0, 0), dt = project(sw+15, sd, 0), dm = project(sw+18, sd/2, 0);
                svg += `<line x1="${db.px.toFixed(1)}" y1="${db.py.toFixed(1)}" x2="${dt.px.toFixed(1)}" y2="${dt.py.toFixed(1)}" stroke="#666" stroke-width="0.7"/>`;
                svg += `<text x="${(dm.px + 5).toFixed(1)}" y="${dm.py.toFixed(1)}" class="d3-dim" text-anchor="start">${D}mm</text>`;

                svg += `</svg>`;
                container.innerHTML = svg;
            }

            // Attach drag handlers to the container (persists across re-renders)
            let rafId = null;
            function scheduleRender() {
                if (!rafId) {
                    rafId = requestAnimationFrame(() => {
                        rafId = null;
                        render();
                    });
                }
            }

            function onPointerDown(e) {
                dragging = true;
                lastX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                lastY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
                container.style.cursor = 'grabbing';
                e.preventDefault();
            }
            function onPointerMove(e) {
                if (!dragging) return;
                const cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                const cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
                const dx = cx - lastX;
                const dy = cy - lastY;
                rotY += dx * 0.008;
                rotX = Math.max(-1.2, Math.min(1.2, rotX - dy * 0.008));
                lastX = cx;
                lastY = cy;
                scheduleRender();
            }
            function onPointerUp() {
                dragging = false;
                container.style.cursor = 'grab';
            }

            container.style.cursor = 'grab';
            container.addEventListener('mousedown', onPointerDown);
            container.addEventListener('touchstart', onPointerDown, { passive: false });
            window.addEventListener('mousemove', onPointerMove);
            window.addEventListener('touchmove', onPointerMove, { passive: false });
            window.addEventListener('mouseup', onPointerUp);
            window.addEventListener('touchend', onPointerUp);

            render();
        }

        cabinets.forEach(cabinet => {
            const W = cabinet.width, H = cabinet.height, D = cabinet.depth;
            const config = [];
            if (cabinet.numDoors > 0) config.push(`${cabinet.numDoors} door${cabinet.numDoors > 1 ? 's' : ''}`);
            if (cabinet.numDrawers > 0) config.push(`${cabinet.numDrawers} drawer${cabinet.numDrawers > 1 ? 's' : ''}`);
            if (cabinet.numShelves > 0) config.push(`${cabinet.numShelves} ${cabinet.numShelves > 1 ? 'shelves' : 'shelf'}`);
            if (cabinet.numVerticalDividers > 0) config.push(`${cabinet.numVerticalDividers} divider${cabinet.numVerticalDividers > 1 ? 's' : ''}`);

            const card = document.createElement('div');
            card.className = 'cabinet-drawing-card';
            const header = document.createElement('div');
            header.className = 'cabinet-drawing-header';
            header.innerHTML = `
                <h3>${cabinet.name}</h3>
                <span class="cabinet-drawing-dims">${(W/10).toFixed(1)} × ${(H/10).toFixed(1)} × ${(D/10).toFixed(1)} cm &nbsp;|&nbsp; Qty: ${cabinet.quantity}</span>
                <span class="cabinet-drawing-config">${config.join(' · ')}</span>
            `;
            card.appendChild(header);

            const hint = document.createElement('div');
            hint.className = 'cabinet-drawing-hint';
            hint.textContent = 'Drag to rotate';
            card.appendChild(hint);

            const svgContainer = document.createElement('div');
            svgContainer.className = 'cabinet-drawing-svg';
            card.appendChild(svgContainer);
            cabinetDrawingsContent.appendChild(card);

            createCabinetRenderer(cabinet, svgContainer);
        });

        // Legend
        const legend = document.createElement('div');
        legend.className = 'cabinet-drawing-legend';
        legend.innerHTML = `
            <div class="legend-title">Legend</div>
            <div class="legend-items">
                <div class="legend-item"><div class="legend-color" style="background:rgba(212,175,55,0.15);border:1.5px solid #d4af37;"></div><span class="legend-text">Door</span></div>
                <div class="legend-item"><div class="legend-color" style="background:rgba(108,203,95,0.15);border:1.5px solid #6ccb5f;"></div><span class="legend-text">Drawer</span></div>
                <div class="legend-item"><div class="legend-color" style="background:rgba(186,225,255,0.12);border:1.5px solid #7ab8db;"></div><span class="legend-text">Shelf</span></div>
                <div class="legend-item"><div class="legend-color" style="background:rgba(224,187,228,0.15);border:1.5px solid #c49ec9;"></div><span class="legend-text">Divider</span></div>
            </div>
        `;
        cabinetDrawingsContent.appendChild(legend);
    }


    function generateCuttingDiagram(cabinets) {
        const diagramContainer = document.getElementById('cuttingDiagram');
        const SHEET_WIDTH = 1220; // mm
        const SHEET_HEIGHT = 2440; // mm
        const SCALE = 0.15; // Scale for display (15% of actual size)
        const KERF = cabinets[0]?.kerf || 3; // Use kerf from cabinet data
        
        // Collect all cuts from all cabinets
        let allCuts = [];
        cabinets.forEach(cabinet => {
            const cuts = cabinet.getCutList();
            allCuts = allCuts.concat(cuts);
        });

        // Group by thickness and material
        const cutsByThickness = {};
        allCuts.forEach(cut => {
            const key = `${cut.thickness}mm-${cut.material}`;
            if (!cutsByThickness[key]) {
                cutsByThickness[key] = [];
            }
            // Expand quantity into individual pieces, preserving grain direction
            for (let i = 0; i < cut.quantity; i++) {
                cutsByThickness[key].push({
                    part: cut.part,
                    width: cut.width,
                    height: cut.height,
                    thickness: cut.thickness,
                    material: cut.material,
                    grain: cut.grain // Preserve grain direction
                });
            }
        });

        // Color palette for different part types
        const partColors = {
            'Side Panel (Left/Right)': '#FFB3BA',
            'Top Panel': '#BAFFC9',
            'Bottom Panel': '#BAE1FF',
            'Back Panel': '#FFFFBA',
            'Adjustable Shelf': '#FFD9BA',
            'Door Panel': '#E0BBE4',
            'Drawer Front (Overlay)': '#FEC8D8',
            'Drawer Side': '#D4F1F4',
            'Drawer Front (Internal)': '#C9E4DE',
            'Drawer Back': '#F7D9C4',
            'Drawer Bottom': '#FDEBD0'
        };

        diagramContainer.innerHTML = '';

        // Generate sheets for each thickness/material
        Object.keys(cutsByThickness).forEach(key => {
            const pieces = cutsByThickness[key];
            const sheets = layoutPieces(pieces, SHEET_WIDTH, SHEET_HEIGHT, KERF);
            
            sheets.forEach((sheet, sheetIndex) => {
                const sheetDiv = document.createElement('div');
                sheetDiv.className = 'sheet-container';
                
                const title = document.createElement('div');
                title.className = 'sheet-title';
                title.textContent = `Sheet ${sheetIndex + 1} - ${key}`;
                sheetDiv.appendChild(title);
                
                const canvas = document.createElement('div');
                canvas.className = 'sheet-canvas';
                canvas.style.width = (SHEET_WIDTH * SCALE) + 'px';
                canvas.style.height = (SHEET_HEIGHT * SCALE) + 'px';
                
                sheet.pieces.forEach(piece => {
                    const pieceDiv = document.createElement('div');
                    pieceDiv.className = 'cut-piece';
                    pieceDiv.style.left = (piece.x * SCALE) + 'px';
                    pieceDiv.style.top = (piece.y * SCALE) + 'px';
                    pieceDiv.style.width = (piece.width * SCALE) + 'px';
                    pieceDiv.style.height = (piece.height * SCALE) + 'px';
                    pieceDiv.style.backgroundColor = piece.oversized ? '#FF6B6B' : (partColors[piece.part] || '#E0E0E0');
                    if (piece.oversized) {
                        pieceDiv.style.border = '3px dashed #c0392b';
                    }
                    
                    const label = document.createElement('div');
                    label.className = 'cut-piece-label';
                    label.textContent = piece.oversized ? `⚠ ${piece.part}` : piece.part;
                    
                    const dims = document.createElement('div');
                    dims.className = 'cut-piece-dims';
                    // Show as Length × Width (larger first) for consistency with cut list
                    const dimL = Math.max(piece.width, piece.height);
                    const dimW = Math.min(piece.width, piece.height);
                    dims.textContent = `${dimL}×${dimW}`;
                    
                    pieceDiv.appendChild(label);
                    pieceDiv.appendChild(dims);
                    pieceDiv.title = piece.oversized 
                        ? `⚠ OVERSIZED: ${piece.part}\nNeeds ${dimL}mm × ${dimW}mm but sheet is ${SHEET_WIDTH}×${SHEET_HEIGHT}mm\nThis piece needs to be joined from multiple cuts`
                        : `${piece.part}\n${dimL}mm × ${dimW}mm\nOn sheet: ${piece.width}mm (x) × ${piece.height}mm (y)`;
                    
                    canvas.appendChild(pieceDiv);
                });
                
                sheetDiv.appendChild(canvas);
                diagramContainer.appendChild(sheetDiv);
            });
        });

        // Add legend
        const legend = document.createElement('div');
        legend.className = 'legend';
        legend.innerHTML = `
            <div class="legend-title">Part Types:</div>
            <div class="legend-items">
                ${Object.keys(partColors).map(part => `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: ${partColors[part]}"></div>
                        <div class="legend-text">${part}</div>
                    </div>
                `).join('')}
            </div>
        `;
        diagramContainer.appendChild(legend);
    }

    function layoutPieces(pieces, sheetWidth, sheetHeight, kerf) {
        // Guillotine bin-packing with best-area-fit and rotation support
        
        // Sort pieces by area descending (largest first), then by longest side
        const sorted = pieces.map((p, i) => {
            const w = Math.min(p.width, p.height);
            const h = Math.max(p.width, p.height);
            return { ...p, w, h, area: w * h, idx: i };
        }).sort((a, b) => b.area - a.area || b.h - a.h);

        const sheets = [];

        function createSheet() {
            return {
                pieces: [],
                // Free rectangles available for placement
                freeRects: [{ x: 0, y: 0, w: sheetWidth, h: sheetHeight }]
            };
        }

        // Find best free rect for a piece (Best Short Side Fit)
        function findBestFit(freeRects, pw, ph) {
            let bestScore = Infinity;
            let bestIdx = -1;

            for (let i = 0; i < freeRects.length; i++) {
                const r = freeRects[i];

                // Only try the given orientation (no rotation)
                if (pw <= r.w && ph <= r.h) {
                    const leftover = Math.min(r.w - pw, r.h - ph);
                    if (leftover < bestScore) {
                        bestScore = leftover;
                        bestIdx = i;
                    }
                }
            }

            return { idx: bestIdx };
        }

        // Split a free rectangle after placing a piece using guillotine split
        function splitRect(freeRect, pw, ph, kerf) {
            const results = [];
            const kw = pw + kerf;
            const kh = ph + kerf;

            // Right remainder
            const rw = freeRect.w - kw;
            if (rw > kerf) {
                results.push({
                    x: freeRect.x + kw,
                    y: freeRect.y,
                    w: rw,
                    h: freeRect.h
                });
            }

            // Bottom remainder
            const bh = freeRect.h - kh;
            if (bh > kerf) {
                results.push({
                    x: freeRect.x,
                    y: freeRect.y + kh,
                    w: pw,
                    h: bh
                });
            }

            return results;
        }

        // Try to place a piece on an existing sheet
        function placePiece(sheet, piece) {
            const { idx } = findBestFit(sheet.freeRects, piece.w, piece.h);
            if (idx === -1) return false;

            const rect = sheet.freeRects[idx];

            sheet.pieces.push({
                ...piece,
                x: rect.x,
                y: rect.y,
                width: piece.w,
                height: piece.h
            });

            // Split the used rect and replace it with remainders
            const newRects = splitRect(rect, piece.w, piece.h, kerf);
            sheet.freeRects.splice(idx, 1, ...newRects);

            // Merge overlapping/adjacent free rects to reduce fragmentation
            mergeFreeRects(sheet.freeRects);

            return true;
        }

        // Merge free rects that can be combined
        function mergeFreeRects(rects) {
            for (let i = 0; i < rects.length; i++) {
                for (let j = i + 1; j < rects.length; j++) {
                    const a = rects[i];
                    const b = rects[j];

                    // Check if b is fully contained in a
                    if (b.x >= a.x && b.y >= a.y &&
                        b.x + b.w <= a.x + a.w && b.y + b.h <= a.y + a.h) {
                        rects.splice(j, 1);
                        j--;
                        continue;
                    }
                    // Check if a is fully contained in b
                    if (a.x >= b.x && a.y >= b.y &&
                        a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h) {
                        rects.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }

        // Place all pieces
        sorted.forEach(piece => {
            // Check if piece is oversized
            const minDim = Math.min(piece.w, piece.h);
            const maxDim = Math.max(piece.w, piece.h);
            if ((minDim > sheetWidth && minDim > sheetHeight) ||
                (maxDim > sheetWidth && maxDim > sheetHeight)) {
                // Oversized - put on its own sheet
                const s = createSheet();
                s.pieces.push({
                    ...piece,
                    x: 0,
                    y: 0,
                    width: Math.min(piece.w, sheetWidth),
                    height: Math.min(piece.h, sheetHeight),
                    oversized: true
                });
                sheets.push(s);
                return;
            }

            // Try existing sheets (best fit across all sheets)
            let placed = false;
            for (let s = 0; s < sheets.length; s++) {
                if (placePiece(sheets[s], piece)) {
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                const newSheet = createSheet();
                placePiece(newSheet, piece);
                sheets.push(newSheet);
            }
        });

        return sheets;
    }

    // Function to print content in a new window
    function printContent(htmlContent, title) {
        const clientName = document.getElementById('clientName').value || 'Client';
        const projectName = document.getElementById('projectName').value || 'Project';
        const date = new Date().toLocaleDateString();
        const docTitle = `${clientName}-${projectName}-${title}-${date}`;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${docTitle}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 20px;
                        color: #000;
                        background: white;
                        line-height: 1.5;
                        font-size: 12px;
                    }
                    
                    .quote-header {
                        border-bottom: 3px solid #d4af37;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                        page-break-after: avoid;
                    }
                    
                    .quote-header h3 {
                        font-size: 1.4em;
                        color: #0f172a;
                        margin-bottom: 10px;
                    }
                    
                    .quote-header p {
                        color: #64748b;
                        margin: 3px 0;
                        font-size: 0.95em;
                    }
                    
                    .quote-section {
                        margin-bottom: 20px;
                        padding: 15px;
                        background: #f8fafc;
                        border-radius: 6px;
                        border: 1px solid #e2e8f0;
                        page-break-inside: avoid;
                    }
                    
                    .quote-section h3, .quote-section h4 {
                        color: #0f172a;
                        margin-bottom: 12px;
                        font-size: 1.1em;
                    }
                    
                    .quote-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #e2e8f0;
                        font-size: 0.95em;
                    }
                    
                    .quote-item:last-child {
                        border-bottom: none;
                    }
                    
                    .quote-total {
                        margin-top: 20px;
                        padding: 20px;
                        border: 2px solid #0f172a;
                        border-radius: 6px;
                        background: #f8fafc;
                    }
                    
                    .cutlist-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 0.9em;
                    }
                    
                    .cutlist-table th,
                    .cutlist-table td {
                        padding: 8px 10px;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .cutlist-table th {
                        background: #0f172a;
                        color: white;
                        font-weight: 600;
                        font-size: 0.85em;
                    }
                    
                    .cutlist-table tr:nth-child(even) {
                        background: #f8fafc;
                    }
                    
                    .cutlist-section,
                    .cutting-diagram-section {
                        margin: 25px 0;
                        page-break-inside: avoid;
                    }
                    
                    .cutlist-section h3,
                    .cutting-diagram-section h3 {
                        font-size: 1.1em;
                        margin-bottom: 10px;
                    }
                    
                    .sheet-container {
                        margin: 15px 0;
                        page-break-inside: avoid;
                    }
                    
                    .sheet-title {
                        font-weight: 700;
                        margin-bottom: 8px;
                        color: #0f172a;
                        font-size: 0.95em;
                    }
                    
                    .sheet-canvas {
                        border: 2px solid #0f172a;
                        background: #fafafa;
                        position: relative;
                        display: inline-block;
                    }
                    
                    .cut-piece {
                        position: absolute;
                        border: 2px solid #0f172a;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        font-size: 9px;
                        font-weight: 600;
                        text-align: center;
                        padding: 3px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .legend {
                        margin-top: 15px;
                        padding: 12px;
                        background: #f8fafc;
                        border-radius: 6px;
                        border: 1px solid #e2e8f0;
                        font-size: 0.9em;
                    }
                    
                    .legend-title {
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    
                    .legend-items {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 12px;
                    }
                    
                    .legend-item {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 0.85em;
                    }
                    
                    .legend-color {
                        width: 25px;
                        height: 18px;
                        border: 1px solid #000;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .sheet-canvas {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        
                        .cutting-diagram-section {
                            page-break-before: always;
                        }
                        
                        .sheet-container {
                            page-break-before: always;
                            page-break-inside: avoid;
                            text-align: center;
                            padding-top: 20px;
                        }
                        
                        .sheet-container:first-child {
                            page-break-before: avoid;
                        }
                        
                        .sheet-canvas {
                            transform: scale(2.5);
                            transform-origin: top left;
                            margin-bottom: 200px;
                            margin-left: 60px;
                        }
                        
                        .sheet-title {
                            font-size: 1.4em;
                            margin-bottom: 20px;
                        }
                        
                        .legend {
                            page-break-before: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    }
});
