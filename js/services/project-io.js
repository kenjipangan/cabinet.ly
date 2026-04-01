/**
 * Project Import/Export Service
 * Single Responsibility: serialization and file I/O
 * Dependency Inversion: depends on abstractions (Cabinet, RoomStateManager)
 */
import { Cabinet } from '../models/cabinet.js';

export function exportProjectData(cabinets, roomStateManager) {
    return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        projectInfo: {
            clientName: document.getElementById('clientName').value || 'Client 1',
            projectName: document.getElementById('projectName').value || 'Project 1'
        },
        settings: readSettings(),
        cabinets: cabinets.map(c => c.toExportData()),
        roomLayouts: roomStateManager.exportData()
    };
}

export function readSettings() {
    return {
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
    };
}

export function readPricing(cabinets) {
    const settings = readSettings();
    const totalUnits = cabinets.reduce((sum, c) => sum + c.quantity, 0);
    return {
        sheetCost: settings.sheetCost,
        sheet6mmCost: settings.sheet6mmCost,
        edgeBanding: settings.edgeBanding,
        hingesCost: settings.hingesCost,
        slidePrices: settings.slidePrices,
        handlesCost: settings.handlesCost,
        screwsCost: settings.screwsCost,
        laborHours: totalUnits * settings.laborHours,
        laborRate: settings.laborRate,
        markup: settings.markup,
        overhead: settings.overhead
    };
}

export function applySettings(settings) {
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
}

export function createCabinetFromImport(cabinetData, settings) {
    return new Cabinet({
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
        grainOrientation: cabinetData.grainOrientation || settings.grainOrientation,
        wall: cabinetData.wall || 'A',
        marginT: cabinetData.marginT || 0,
        marginL: cabinetData.marginL || 0,
        marginB: cabinetData.marginB || 0,
        marginR: cabinetData.marginR || 0
    });
}
