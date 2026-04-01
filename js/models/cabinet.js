/**
 * Cabinet Model - Single Responsibility: cabinet data and cut list generation
 */
export class Cabinet {
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
        this.kerf = data.kerf || 3;
        this.grainOrientation = data.grainOrientation || 'standard';
        this.wall = data.wall || 'A';
        this.marginT = data.marginT || 0;
        this.marginL = data.marginL || 0;
        this.marginB = data.marginB || 0;
        this.marginR = data.marginR || 0;
    }

    getGrainDirection(standardGrain) {
        if (this.grainOrientation === 'horizontal') return 'horizontal';
        if (this.grainOrientation === 'vertical') return 'vertical';
        return standardGrain;
    }

    toExportData() {
        return {
            name: this.name,
            group: this.group,
            quantity: this.quantity,
            width: this.width,
            height: this.height,
            depth: this.depth,
            cabinetType: this.cabinetType,
            numDoors: this.numDoors,
            numDrawers: this.numDrawers,
            drawerHeights: this.drawerHeights,
            drawerWidths: this.drawerWidths,
            drawerSlideLength: this.drawerSlideLength,
            numShelves: this.numShelves,
            numVerticalDividers: this.numVerticalDividers,
            grainOrientation: this.grainOrientation,
            wall: this.wall,
            marginT: this.marginT,
            marginL: this.marginL,
            marginB: this.marginB,
            marginR: this.marginR
        };
    }

    getCutList() {
        const cuts = [];
        const qty = this.quantity;
        const t = this.thickness;
        const baseMaterial = this.sheetMaterial.replace(/^\d+mm\s*/, '');

        const eb = (f = 0, b = 0, l = 0, r = 0) => ({ front: f, back: b, left: l, right: r });

        // Sides
        cuts.push({ part: 'Side Panel (Left/Right)', width: this.depth, height: this.height, thickness: t, quantity: 2 * qty, material: this.sheetMaterial, notes: 'Full height sides', grain: this.getGrainDirection('vertical'), edgeBanding: eb(this.height, 0, this.depth, this.depth) });

        // Top
        cuts.push({ part: 'Top Panel', width: this.width - 2 * t, height: this.depth, thickness: t, quantity: qty, material: this.sheetMaterial, notes: 'Fits between sides', grain: this.getGrainDirection('horizontal'), edgeBanding: eb(this.width - 2 * t) });

        // Bottom
        cuts.push({ part: 'Bottom Panel', width: this.width - 2 * t, height: this.depth, thickness: t, quantity: qty, material: this.sheetMaterial, notes: 'Fits between sides', grain: this.getGrainDirection('horizontal'), edgeBanding: eb(this.width - 2 * t) });

        // Back Panel
        cuts.push({ part: 'Back Panel', width: this.width - 20, height: this.height - 20, thickness: 6, quantity: qty, material: `6mm ${baseMaterial}`, notes: 'Sits in 10mm rabbet', grain: 'none', edgeBanding: eb() });

        // Shelves
        if (this.numShelves > 0) {
            cuts.push({ part: 'Adjustable Shelf', width: this.width - 2 * t - 4, height: this.depth - 20, thickness: t, quantity: this.numShelves * qty, material: this.sheetMaterial, notes: 'Sits on shelf pins', grain: this.getGrainDirection('horizontal'), edgeBanding: eb(this.width - 2 * t - 4) });
        }

        // Vertical Dividers
        if (this.numVerticalDividers > 0) {
            cuts.push({ part: 'Vertical Divider', width: this.depth - 20, height: this.height - 2 * t, thickness: t, quantity: this.numVerticalDividers * qty, material: this.sheetMaterial, notes: 'Fits between top and bottom', grain: this.getGrainDirection('vertical'), edgeBanding: eb(this.height - 2 * t) });
        }

        // Doors
        if (this.numDoors > 0) {
            const gap = (this.numDoors > 1) ? 2 : 0;
            const totalGaps = (this.numDoors - 1) * gap;
            const doorW = Math.floor((this.width - totalGaps) / this.numDoors);
            const doorH = this.height;
            cuts.push({ part: 'Door Panel', width: doorW, height: doorH, thickness: t, quantity: this.numDoors * qty, material: this.sheetMaterial, notes: 'Full overlay, 2mm gap between doors', grain: this.getGrainDirection('vertical'), edgeBanding: eb(doorW * 2 + doorH * 2) });
        }

        // Drawers
        if (this.numDrawers > 0) {
            const boxDepth = this.drawerSlideLength;
            const defaultBoxW = this.width - 2 * t - 6;
            const heights = this.drawerHeights.length === this.numDrawers
                ? this.drawerHeights
                : Array(this.numDrawers).fill(Math.floor((this.height - t) / this.numDrawers));

            heights.forEach((openH, idx) => {
                const boxH = openH - 40;
                const customW = (this.drawerWidths && this.drawerWidths[idx]) ? this.drawerWidths[idx] : 0;
                const frontW = customW > 0 ? customW : this.width;
                const boxW = customW > 0 ? customW - 2 * t - 6 : defaultBoxW;

                cuts.push({ part: `Drawer ${idx + 1} Front (Overlay)`, width: frontW, height: openH, thickness: t, quantity: qty, material: this.sheetMaterial, notes: `Full overlay front - ${(openH / 10).toFixed(1)}cm`, grain: this.getGrainDirection('vertical'), edgeBanding: eb(frontW * 2 + openH * 2) });
                cuts.push({ part: `Drawer ${idx + 1} Side`, width: boxDepth, height: boxH, thickness: t, quantity: 2 * qty, material: this.sheetMaterial, notes: 'Drawer box sides', grain: this.getGrainDirection('horizontal'), edgeBanding: eb(boxH) });
                cuts.push({ part: `Drawer ${idx + 1} Front (Internal)`, width: boxW - 2 * t, height: boxH, thickness: t, quantity: qty, material: this.sheetMaterial, notes: 'Internal front, fits between sides', grain: this.getGrainDirection('horizontal'), edgeBanding: eb(boxH) });
                cuts.push({ part: `Drawer ${idx + 1} Back`, width: boxW - 2 * t, height: boxH - 20, thickness: t, quantity: qty, material: this.sheetMaterial, notes: 'Lower than front for bottom', grain: this.getGrainDirection('horizontal'), edgeBanding: eb(boxH - 20) });
                cuts.push({ part: `Drawer ${idx + 1} Bottom`, width: boxW - 2 * t + 20, height: boxDepth - 10, thickness: 6, quantity: qty, material: `6mm ${baseMaterial}`, notes: 'Sits in 6mm groove, 10mm from bottom edge', grain: 'none', edgeBanding: eb() });
            });
        }

        return cuts;
    }
}
