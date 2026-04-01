/**
 * Cabinet Renderer - renders a single cabinet box in 3D
 * Dependency Inversion: depends on Renderer3D abstraction
 */

const DOOR_DEPTH_BIAS = -50;

/**
 * Render a cabinet box with doors/drawers
 * @param {Renderer3D} r - the 3D renderer
 * @param {Object} cab - cabinet data
 * @param {number} ox - X origin
 * @param {number} oy - Y origin
 * @param {number} oz - Z origin (height)
 * @param {string} dir - 'x' or 'y' (which axis the width runs along)
 * @param {string} face - which face gets doors: '-y','+y','+x','-x'
 * @param {number} scale - world-to-scene scale factor
 */
export function renderCabinet3D(r, cab, ox, oy, oz, dir, face, scale) {
    const cw = cab.width * scale;
    const ch = cab.height * scale;
    const cd = cab.depth * scale;
    const g = Math.max(0.8 * scale, 0.5);
    const fO = -1;

    let x0, y0, x1, y1;
    if (dir === 'x') { x0 = ox; y0 = oy; x1 = ox + cw; y1 = oy + cd; }
    else { x0 = ox; y0 = oy; x1 = ox + cd; y1 = oy + cw; }
    const z0 = oz, z1 = oz + ch;

    // Box faces
    r.addFace(x0,y0,z0, x1,y0,z0, x1,y1,z0, x0,y1,z0, '#3d3530','#666',0.4);  // bottom
    r.addFace(x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1, '#5a4f42','#888',0.4);  // top
    r.addFace(x0,y0,z0, x1,y0,z0, x1,y0,z1, x0,y0,z1, '#4a4038','#777',0.4);  // front (-y)
    r.addFace(x0,y1,z0, x1,y1,z0, x1,y1,z1, x0,y1,z1, '#352f28','#555',0.4);  // back (+y)
    r.addFace(x0,y0,z0, x0,y1,z0, x0,y1,z1, x0,y0,z1, '#4a4038','#777',0.4);  // left (-x)
    r.addFace(x1,y0,z0, x1,y1,z0, x1,y1,z1, x1,y0,z1, '#352f28','#666',0.4);  // right (+x)

    let dBot = z0, dTop = z1;

    // Drawers
    if (cab.numDrawers > 0) {
        const dH = cab.drawerHeights.length === cab.numDrawers
            ? cab.drawerHeights
            : Array(cab.numDrawers).fill(Math.floor(cab.height / cab.numDrawers));
        let dz = z1;
        dH.forEach(dh => {
            const sdh = dh * scale;
            dz -= sdh;
            const fill = 'rgba(108,203,95,0.22)', stroke = '#6ccb5f';
            if (face === '-y') r.addFace(x0+g,y0+fO,dz+g, x1-g,y0+fO,dz+g, x1-g,y0+fO,dz+sdh-g, x0+g,y0+fO,dz+sdh-g, fill,stroke,0.5,DOOR_DEPTH_BIAS);
            else if (face === '+y') r.addFace(x0+g,y1-fO,dz+g, x1-g,y1-fO,dz+g, x1-g,y1-fO,dz+sdh-g, x0+g,y1-fO,dz+sdh-g, fill,stroke,0.5,DOOR_DEPTH_BIAS);
            else if (face === '+x') r.addFace(x1-fO,y0+g,dz+g, x1-fO,y1-g,dz+g, x1-fO,y1-g,dz+sdh-g, x1-fO,y0+g,dz+sdh-g, fill,stroke,0.5,DOOR_DEPTH_BIAS);
            else r.addFace(x0+fO,y0+g,dz+g, x0+fO,y1-g,dz+g, x0+fO,y1-g,dz+sdh-g, x0+fO,y0+g,dz+sdh-g, fill,stroke,0.5,DOOR_DEPTH_BIAS);
        });
        dTop = dz;
    }

    // Doors
    if (cab.numDoors > 0 && dTop - dBot > g * 4) {
        const nD = cab.numDoors;
        const fill = 'rgba(212,175,55,0.18)', stroke = '#d4af37';

        if (face === '-y' || face === '+y') {
            const dW = (cw - g * (nD - 1)) / nD;
            const fy = face === '-y' ? y0 + fO : y1 - fO;
            for (let i = 0; i < nD; i++) {
                const dx = x0 + i * (dW + g);
                r.addFace(dx+g,fy,dBot+g, dx+dW-g,fy,dBot+g, dx+dW-g,fy,dTop-g, dx+g,fy,dTop-g, fill,stroke,0.5,DOOR_DEPTH_BIAS);
            }
        } else {
            const dW = (cw - g * (nD - 1)) / nD;
            const fx = face === '+x' ? x1 - fO : x0 + fO;
            for (let i = 0; i < nD; i++) {
                const dy = y0 + i * (dW + g);
                r.addFace(fx,dy+g,dBot+g, fx,dy+dW-g,dBot+g, fx,dy+dW-g,dTop-g, fx,dy+g,dTop-g, fill,stroke,0.5,DOOR_DEPTH_BIAS);
            }
        }
    }
}
