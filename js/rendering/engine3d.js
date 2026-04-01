/**
 * 3D Rendering Engine - Single Responsibility: projection, face management, SVG output
 * Open/Closed: extend via renderCab without modifying core projection
 */
export class Renderer3D {
    constructor() {
        this.rotY = 0.65;
        this.rotX = 0.5;
        this.zoom = 1;
        this.fov = 900;
        this.centerX = 0;
        this.centerY = 0;
        this.centerZ = 0;
        this.faces = [];
    }

    setCenter(x, y, z) {
        this.centerX = x;
        this.centerY = y;
        this.centerZ = z;
    }

    project(x, y, z) {
        const cx = x - this.centerX;
        const cy = y - this.centerY;
        const cz = z - this.centerZ;
        const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
        const rx = cx * cosY + cy * sinY;
        const ry = -cx * sinY + cy * cosY;
        const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
        const ry2 = ry * cosX - cz * sinX;
        const rz2 = ry * sinX + cz * cosX;
        const ps = this.fov / (this.fov + ry2);
        return { px: rx * ps, py: -rz2 * ps, depth: ry2 };
    }

    addFace(x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4, fill, stroke, strokeW, depthBias) {
        const p = [
            this.project(x1,y1,z1), this.project(x2,y2,z2),
            this.project(x3,y3,z3), this.project(x4,y4,z4)
        ];
        const avgDepth = (p[0].depth + p[1].depth + p[2].depth + p[3].depth) / 4 + (depthBias || 0);
        const pts = p.map(v => `${v.px.toFixed(1)},${v.py.toFixed(1)}`).join(' ');
        this.faces.push({ type: 'poly', pts, depth: avgDepth, fill, stroke: stroke || '#555', strokeW: strokeW || 0.7 });
    }

    addLine(x1,y1,z1, x2,y2,z2, stroke, strokeW, dashed) {
        const a = this.project(x1,y1,z1);
        const b = this.project(x2,y2,z2);
        this.faces.push({
            type: dashed ? 'dashed' : 'line',
            x1: a.px, y1: a.py, x2: b.px, y2: b.py,
            depth: (a.depth + b.depth) / 2 - 100,
            stroke, strokeW, cap: !dashed
        });
    }

    clearFaces() {
        this.faces = [];
    }

    toSVG(viewBoxSize, extraContent) {
        this.faces.sort((a, b) => b.depth - a.depth);
        const vbSize = viewBoxSize / this.zoom;
        const half = vbSize / 2;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-half} ${-half} ${vbSize} ${vbSize}" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision" style="width:100%;height:100%;background:#1a1a1a;border-radius:8px;user-select:none;">`;
        svg += `<defs><style>
            .d3-dim{font-family:Inter,sans-serif;font-size:11px;fill:#9a9a9a;text-anchor:middle}
            .d3c-gap{font-family:Inter,sans-serif;font-size:9px;fill:#d4af37;text-anchor:start}
            .d3c-wl{font-family:Inter,sans-serif;font-size:10px;font-weight:700;text-anchor:middle}
        </style></defs>`;

        for (const f of this.faces) {
            if (f.type === 'poly') {
                svg += `<polygon points="${f.pts}" fill="${f.fill}" stroke="${f.stroke}" stroke-width="${f.strokeW}" stroke-linejoin="round"/>`;
            } else if (f.type === 'dashed') {
                svg += `<line x1="${f.x1.toFixed(1)}" y1="${f.y1.toFixed(1)}" x2="${f.x2.toFixed(1)}" y2="${f.y2.toFixed(1)}" stroke="${f.stroke}" stroke-width="${f.strokeW}" stroke-dasharray="4,3"/>`;
            } else {
                svg += `<line x1="${f.x1.toFixed(1)}" y1="${f.y1.toFixed(1)}" x2="${f.x2.toFixed(1)}" y2="${f.y2.toFixed(1)}" stroke="${f.stroke}" stroke-width="${f.strokeW}" ${f.cap ? 'stroke-linecap="round"' : ''}/>`;
            }
        }

        if (extraContent) svg += extraContent;
        svg += `</svg>`;
        return svg;
    }
}
