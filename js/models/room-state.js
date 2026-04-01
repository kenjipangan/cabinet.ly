/**
 * Room Layout State Manager
 * Single Responsibility: manages wall assignments and ordering per room
 */
export class RoomStateManager {
    constructor() {
        this.rooms = {};
    }

    initRoom(groupName, cabIndices, cabs) {
        const expected = [];
        cabIndices.forEach(i => {
            const c = cabs[i];
            for (let u = 0; u < c.quantity; u++) {
                expected.push({
                    idx: i, unit: u,
                    wall: c.wall || 'A',
                    mt: c.marginT || 0, ml: c.marginL || 0,
                    mb: c.marginB || 0, mr: c.marginR || 0
                });
            }
        });

        const existing = this.rooms[groupName];
        if (existing) {
            const allExisting = [...existing.wallOrders.A, ...existing.wallOrders.B, ...existing.wallOrders.C];
            const same = expected.length === allExisting.length &&
                expected.every(e => allExisting.some(x => x.idx === e.idx && x.unit === e.unit));
            if (same) return;

            // Preserve existing assignments, add new entries
            const newOrders = { A: [], B: [], C: [] };
            ['A', 'B', 'C'].forEach(w => {
                existing.wallOrders[w].forEach(entry => {
                    if (expected.some(e => e.idx === entry.idx && e.unit === entry.unit)) {
                        newOrders[w].push(entry);
                    }
                });
            });
            const placed = [...newOrders.A, ...newOrders.B, ...newOrders.C];
            expected.forEach(e => {
                if (!placed.some(p => p.idx === e.idx && p.unit === e.unit)) {
                    newOrders[e.wall || 'A'].push(e);
                }
            });
            existing.wallOrders = newOrders;
        } else {
            const wo = { A: [], B: [], C: [] };
            expected.forEach(e => { wo[e.wall || 'A'].push(e); });
            const hasC = expected.some(e => e.wall === 'C');
            this.rooms[groupName] = { wallOrders: wo, shape: hasC ? 'U' : 'L', gap: 450 };
        }
    }

    getRoom(name) {
        return this.rooms[name];
    }

    cleanupStaleRooms(validGroups) {
        Object.keys(this.rooms).forEach(g => {
            if (!validGroups[g]) delete this.rooms[g];
        });
    }

    moveEntry(roomName, fromWall, toWall, entryIdx, entryUnit, toPos) {
        const state = this.rooms[roomName];
        if (!state) return;
        const fromArr = state.wallOrders[fromWall];
        const fi = fromArr.findIndex(en => en.idx === entryIdx && en.unit === entryUnit);
        if (fi === -1) return;
        const [entry] = fromArr.splice(fi, 1);
        if (toPos !== undefined) {
            state.wallOrders[toWall].splice(toPos, 0, entry);
        } else {
            state.wallOrders[toWall].push(entry);
        }
    }

    exportData() {
        return JSON.parse(JSON.stringify(this.rooms));
    }

    importData(data) {
        if (data) this.rooms = data;
    }
}
