// Cabinet Quotation Calculator

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
            material: '6mm Plywood/Hardboard',
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
            const drawerBoxWidth = this.width - (2 * t) - 6; // Fit inside cabinet with clearance

            // Use custom drawer heights if provided, otherwise calculate evenly
            const drawerHeights = this.drawerHeights.length === this.numDrawers 
                ? this.drawerHeights 
                : Array(this.numDrawers).fill(Math.floor((this.height - t) / this.numDrawers));

            drawerHeights.forEach((drawerOpeningHeight, index) => {
                const drawerBoxHeight = drawerOpeningHeight - 40; // Clearance for slides and movement

                // A. DRAWER FRONT - Overlay style, covers opening
                cuts.push({
                    part: `Drawer ${index + 1} Front (Overlay)`,
                    width: this.width,
                    height: drawerOpeningHeight,
                    thickness: t,
                    quantity: 1 * qty,
                    material: this.sheetMaterial,
                    notes: `Full overlay front - ${(drawerOpeningHeight/10).toFixed(1)}cm`,
                    grain: this.getGrainDirection('vertical'),
                    edgeBanding: {
                        front: (this.width * 2) + (drawerOpeningHeight * 2), // All 4 edges
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
                    material: '6mm Plywood',
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
        let totalEdgeBanding = 0;
        let totalDoors = 0;
        let totalDrawers = 0;
        let totalHandles = 0;
        let totalDrawerSlidesCost = 0;

        // Calculate totals from all cabinets using actual cut lists
        cabinets.forEach(cabinet => {
            const cuts = cabinet.getCutList();
            
            // Calculate actual area from cut list
            cuts.forEach(cut => {
                // Only count main sheet material (thickness >= 12mm), not back panels or drawer bottoms
                if (cut.thickness >= 12) {
                    totalArea += (cut.width * cut.height * cut.quantity);
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

        const sheetsNeeded = this.calculateSheetsNeeded(totalArea);
        
        // Material costs
        const sheetMaterialCost = sheetsNeeded * pricing.sheetCost;
        const edgeBandingCost = totalEdgeBanding * pricing.edgeBanding;
        
        // Hardware costs
        const hingesCost = totalDoors * pricing.hingesCost;
        const drawerSlidesCost = totalDrawerSlidesCost;
        const handlesCost = totalHandles * pricing.handlesCost;
        const finishCost = pricing.finishCost * cabinets.reduce((sum, c) => sum + c.quantity, 0);
        
        // Subtotals
        const materialSubtotal = sheetMaterialCost + edgeBandingCost;
        const hardwareSubtotal = hingesCost + drawerSlidesCost + handlesCost + finishCost;
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
                finishCost: finishCost.toFixed(2),
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
            alert('Please add at least one cabinet before proceeding!');
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
                <div style="margin-bottom: 25px;">
                    <h3 style="color: var(--accent); font-size: 1.1em; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--accent);">
                        ${group}
                    </h3>
            `;
            
            groupedCabinets[group].forEach(({ cabinet, index }) => {
                html += `
                    <div class="cabinet-item">
                        <div class="cabinet-item-info">
                            <h4>${cabinet.name} (x${cabinet.quantity})</h4>
                            <p>${(cabinet.width/10).toFixed(1)}cm × ${(cabinet.height/10).toFixed(1)}cm × ${(cabinet.depth/10).toFixed(1)}cm</p>
                            <p>${cabinet.numDoors} doors, ${cabinet.numDrawers} drawers${cabinet.numDrawers > 0 ? ` (${cabinet.drawerSlideLength}mm slides)` : ''}${cabinet.drawerHeights.length > 0 ? ` (${cabinet.drawerHeights.map(h => (h/10).toFixed(1)).join('cm, ')}cm)` : ''}, ${cabinet.numShelves} shelves${cabinet.numVerticalDividers > 0 ? `, ${cabinet.numVerticalDividers} dividers` : ''}</p>
                        </div>
                        <button class="btn-remove" onclick="removeCabinetFromReview(${index})">Remove</button>
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
            alert('No cabinets remaining. Returning to Add Cabinets step.');
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
        
        preSizeSelect.innerHTML = '<option value="">Select a standard size...</option>';
        
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
            alert(`Maximum recommended drawers for ${heightCm}cm height is ${maxDrawers}. You entered ${numDrawers}.`);
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
        
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <label for="drawer${i}Height">Drawer ${i + 1} Height (cm):</label>
                <input type="number" id="drawer${i}Height" class="drawer-height-input" placeholder="15" step="0.1" min="5" value="15">
            `;
            drawerSizesInputs.appendChild(div);
            
            // Add validation listener
            const input = div.querySelector('input');
            input.addEventListener('change', validateDrawerHeights);
            input.addEventListener('input', validateDrawerHeights);
        }
        
        validateDrawerHeights();
    }

    function getCabinetData() {
        const numDrawers = parseInt(document.getElementById('numDrawers').value) || 0;
        const drawerHeights = [];
        
        if (numDrawers > 0) {
            for (let i = 0; i < numDrawers; i++) {
                const heightInput = document.getElementById(`drawer${i}Height`);
                const heightCm = heightInput ? parseFloat(heightInput.value) || 15 : 15;
                drawerHeights.push(heightCm * 10); // Convert cm to mm for internal calculations
            }
        }

        const sheetMaterial = document.getElementById('sheetMaterial').value;
        const thickness = parseFloat(document.getElementById('sheetThickness').value) || 18;
        const fullMaterialName = `${thickness}mm ${sheetMaterial}`;
        const grainOrientation = document.getElementById('grainOrientation').value || 'standard';

        return {
            cabinetName: document.getElementById('cabinetName').value || 'Unnamed Cabinet',
            cabinetGroup: document.getElementById('cabinetGroup').value || 'Ungrouped',
            quantity: parseInt(document.getElementById('quantity').value) || 1,
            width: parseFloat(document.getElementById('width').value) * 10 || 900, // Convert cm to mm
            height: parseFloat(document.getElementById('height').value) * 10 || 750, // Convert cm to mm
            depth: parseFloat(document.getElementById('depth').value) * 10 || 600, // Convert cm to mm
            cabinetType: document.getElementById('cabinetType').value,
            numDoors: parseInt(document.getElementById('numDoors').value) || 0,
            numDrawers: numDrawers,
            drawerHeights: drawerHeights,
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
                <div style="margin-bottom: 25px;">
                    <h3 style="color: var(--accent); font-size: 1.1em; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--accent);">
                        ${group}
                    </h3>
            `;
            
            groupedCabinets[group].forEach(({ cabinet, index }) => {
                html += `
                    <div class="cabinet-item">
                        <div class="cabinet-item-info">
                            <h4>${cabinet.name} (x${cabinet.quantity})</h4>
                            <p>${(cabinet.width/10).toFixed(1)}cm × ${(cabinet.height/10).toFixed(1)}cm × ${(cabinet.depth/10).toFixed(1)}cm</p>
                            <p>${cabinet.numDoors} doors, ${cabinet.numDrawers} drawers${cabinet.numDrawers > 0 ? ` (${cabinet.drawerSlideLength}mm slides)` : ''}${cabinet.drawerHeights.length > 0 ? ` (${cabinet.drawerHeights.map(h => (h/10).toFixed(1)).join('cm, ')}cm)` : ''}, ${cabinet.numShelves} shelves${cabinet.numVerticalDividers > 0 ? `, ${cabinet.numVerticalDividers} dividers` : ''}</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn-secondary" onclick="editCabinet(${index})" style="padding: 10px 20px;">Edit</button>
                            <button class="btn-remove" onclick="removeCabinet(${index})">Remove</button>
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
                <td>${partLabel}</td>
                <td>${length}mm</td>
                <td>${width}mm</td>
                <td>${cut.thickness}mm</td>
                <td>${cut.quantity}</td>
                <td>${cut.material}</td>
                <td style="text-align: center; font-size: 1.2em;">${grainIcon}</td>
                <td>${totalEdgeBanding > 0 ? (totalEdgeBanding / 1000).toFixed(2) + 'm' : '-'}</td>
                <td style="font-size: 0.85em; color: #c5c5c5;">${cut.notes || ''}</td>
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
            let length = Math.max(cut.width, cut.height);
            let width = Math.min(cut.width, cut.height);
            
            const partLabel = `${cut.cabinetName} - ${cut.part}`;
            
            return `
            <tr>
                <td>${partLabel}</td>
                <td>${length}mm</td>
                <td>${width}mm</td>
                <td>${cut.thickness}mm</td>
                <td>${cut.quantity}</td>
                <td>${cut.material}</td>
                <td style="text-align: center; font-size: 1.2em;">${grainIcon}</td>
                <td>${totalEdgeBanding > 0 ? (totalEdgeBanding / 1000).toFixed(2) + 'm' : '-'}</td>
                <td style="font-size: 0.85em; color: #c5c5c5;">${cut.notes || ''}</td>
            </tr>
        `;
        }).join('');
        
        cutlistContent.innerHTML = `
            <div class="quote-header">
                <h3>CUT LIST & CUTTING DIAGRAM</h3>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Material:</strong> ${sheetMaterialName}</p>
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
                ${parseFloat(quote.hardware.finishCost) > 0 ? `
                <div class="quote-item">
                    <span>Finish/Paint</span>
                    <span>₱${formatPrice(quote.hardware.finishCost)}</span>
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
            clientName: document.getElementById('clientName').value || 'Valued Client',
            projectName: document.getElementById('projectName').value || 'Custom Cabinets'
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
            finishCost: parseFloat(document.getElementById('finishCost').value) || 0,
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
            alert('Please add at least one cabinet first!');
            return;
        }

        const projectData = {
            clientName: document.getElementById('clientName').value || 'Valued Client',
            projectName: document.getElementById('projectName').value || 'Custom Cabinets'
        };

        const sheetCost = parseFloat(document.getElementById('sheetCost').value) || 5000;
        const sheetMaterialName = document.getElementById('sheetMaterial').value;

        // Calculate total number of cabinet units
        const totalCabinetUnits = cabinets.reduce((sum, c) => sum + c.quantity, 0);
        const defaultLaborHours = totalCabinetUnits * 8; // 8 hours per cabinet unit

        const pricing = {
            sheetCost: sheetCost,
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
            finishCost: parseFloat(document.getElementById('finishCost').value) || 0,
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
        cutlistResults.style.display = 'block';
        cutlistResults.scrollIntoView({ behavior: 'smooth' });
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
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    simplifiedQuoteBtn.addEventListener('click', () => {
        displaySimplifiedQuote();
        resultsSection.style.display = 'none';
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
                clientName: document.getElementById('clientName').value || '',
                projectName: document.getElementById('projectName').value || 'Cabinet Project'
            },
            settings: {
                sheetMaterial: document.getElementById('sheetMaterial').value,
                sheetCost: parseFloat(document.getElementById('sheetCost').value) || 5000,
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
                finishCost: parseFloat(document.getElementById('finishCost').value) || 0,
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
                drawerSlideLength: cabinet.drawerSlideLength,
                numShelves: cabinet.numShelves,
                numVerticalDividers: cabinet.numVerticalDividers
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
        const filename = `${clientName.replace(/[^a-z0-9]/gi, '_')} - ${projectName.replace(/[^a-z0-9]/gi, '_')}_${date}.json`;
        
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
                    alert('Invalid project file format.');
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
                document.getElementById('finishCost').value = settings.finishCost || 0;
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
                        drawerSlideLength: cabinetData.drawerSlideLength || 500,
                        numShelves: cabinetData.numShelves,
                        numVerticalDividers: cabinetData.numVerticalDividers || 0,
                        sheetMaterial: `${settings.sheetThickness}mm ${settings.sheetMaterial}`,
                        thickness: settings.sheetThickness,
                        kerf: settings.kerf,
                        grainOrientation: settings.grainOrientation
                    });
                    cabinets.push(cabinet);
                });
                
                // Update UI
                updateCabinetList();
                if (cabinets.length > 0) {
                    cabinetListSection.style.display = 'block';
                }
                
                // Navigate to step 3 (Add Cabinets) to show loaded cabinets
                goToStep(3);
                
                alert(`Project imported successfully!\n${cabinets.length} cabinet(s) loaded.`);
                
            } catch (error) {
                alert('Error reading project file: ' + error.message);
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
                    alert('CSV file is empty or invalid.');
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
                    alert('No valid data found in CSV file.');
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
                alert('Error reading CSV file: ' + error.message);
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
                <td>${cut.label}</td>
                <td>${cut.length}mm</td>
                <td>${cut.width}mm</td>
                <td>${cut.quantity}</td>
                <td>${cut.material}</td>
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
        const finishCost = parseFloat(document.getElementById('finishCost').value) || 0;
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
        const finishCostTotal = estimatedCabinets * finishCost;
        
        const hardwareSubtotal = hingesCostTotal + drawerSlidesCostTotal + handlesCostTotal + finishCostTotal;
        
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
            finishCost: finishCostTotal.toFixed(2),
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
                    <span>Finish/Paint</span>
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
        const sheets = [];
        
        // Normalize: shorter side = x-width, longer side = y-height
        const normalized = pieces.map(p => {
            const shorter = Math.min(p.width, p.height);
            const longer = Math.max(p.width, p.height);
            return { ...p, w: shorter, h: longer };
        });
        
        // Group pieces by their width (x-dimension) for shared rip cuts
        const widthGroups = {};
        normalized.forEach(piece => {
            const key = piece.w;
            if (!widthGroups[key]) widthGroups[key] = [];
            widthGroups[key].push(piece);
        });
        
        // Sort groups: widest strips first (better packing)
        const sortedWidths = Object.keys(widthGroups)
            .map(Number)
            .sort((a, b) => b - a);
        
        // Within each group, sort by height descending (tallest first)
        sortedWidths.forEach(w => {
            widthGroups[w].sort((a, b) => b.h - a.h);
        });
        
        // Build strips: each strip is a column of same-width pieces
        // One rip cut per strip, then cross cuts within
        const strips = [];
        sortedWidths.forEach(w => {
            const group = widthGroups[w];
            let stripPieces = [];
            let usedHeight = 0;
            
            group.forEach(piece => {
                const neededHeight = piece.h + (stripPieces.length > 0 ? kerf : 0);
                if (usedHeight + neededHeight <= sheetHeight) {
                    stripPieces.push(piece);
                    usedHeight += neededHeight;
                } else {
                    // Current strip is full, save it and start new one
                    if (stripPieces.length > 0) {
                        strips.push({ width: w, height: usedHeight, pieces: stripPieces });
                    }
                    stripPieces = [piece];
                    usedHeight = piece.h;
                }
            });
            if (stripPieces.length > 0) {
                strips.push({ width: w, height: usedHeight, pieces: stripPieces });
            }
        });
        
        // Now pack strips onto sheets left-to-right
        // Each strip uses: strip.width + kerf on x-axis
        function createSheet() {
            return { pieces: [], usedWidth: 0 };
        }
        
        let currentSheet = createSheet();
        
        strips.forEach(strip => {
            const stripW = strip.width + (currentSheet.usedWidth > 0 ? kerf : 0);
            
            if (currentSheet.usedWidth + stripW <= sheetWidth) {
                // Place strip on current sheet
                placeStrip(currentSheet, strip);
            } else {
                // Try existing sheets
                let placed = false;
                for (let s = 0; s < sheets.length; s++) {
                    const sw = strip.width + (sheets[s].usedWidth > 0 ? kerf : 0);
                    if (sheets[s].usedWidth + sw <= sheetWidth) {
                        placeStrip(sheets[s], strip);
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    if (currentSheet.pieces.length > 0) {
                        sheets.push(currentSheet);
                    }
                    currentSheet = createSheet();
                    placeStrip(currentSheet, strip);
                }
            }
        });
        
        if (currentSheet.pieces.length > 0) {
            sheets.push(currentSheet);
        }
        
        function placeStrip(sheet, strip) {
            const x = sheet.usedWidth + (sheet.usedWidth > 0 ? kerf : 0);
            let y = 0;
            
            strip.pieces.forEach(piece => {
                // Check if piece fits on sheet
                if (piece.w > sheetWidth || piece.h > sheetHeight) {
                    console.warn(`Piece ${piece.part} (${piece.w}×${piece.h}mm) too large for sheet.`);
                    sheet.pieces.push({
                        ...piece,
                        x: x,
                        y: y,
                        width: Math.min(piece.w, sheetWidth - x),
                        height: Math.min(piece.h, sheetHeight - y),
                        oversized: true
                    });
                } else {
                    sheet.pieces.push({
                        ...piece,
                        x: x,
                        y: y,
                        width: piece.w,
                        height: piece.h
                    });
                }
                y += piece.h + kerf;
            });
            
            sheet.usedWidth = x + strip.width;
        }
        
        return sheets;
    }

    function findPosition(usedArea, width, height, sheetWidth, sheetHeight, kerf) {
        // Legacy function kept for compatibility
        const step = 10;
        
        for (let y = 0; y <= sheetHeight - height; y += step) {
            for (let x = 0; x <= sheetWidth - width; x += step) {
                const testRect = { x, y, width: width + kerf, height: height + kerf };
                
                let overlaps = false;
                for (let used of usedArea) {
                    if (rectanglesOverlap(testRect, used)) {
                        overlaps = true;
                        break;
                    }
                }
                
                if (!overlaps) {
                    return { x, y };
                }
            }
        }
        
        return null;
    }

    function rectanglesOverlap(rect1, rect2) {
        return !(rect1.x + rect1.width <= rect2.x ||
                 rect2.x + rect2.width <= rect1.x ||
                 rect1.y + rect1.height <= rect2.y ||
                 rect2.y + rect2.height <= rect1.y);
    }

    // Function to print content in a new window
    function printContent(htmlContent, title) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title} - Likha Studio</title>
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
