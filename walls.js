class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(ctx, cx, cy) {
        const sx = this.x - cx, sy = this.y - cy;

        const g = ctx.createLinearGradient(sx, sy, sx, sy + this.h);
        g.addColorStop(0, CONFIG.WALL_HI);
        g.addColorStop(1, CONFIG.WALL_LO);
        ctx.fillStyle = g;
        roundRect(ctx, sx, sy, this.w, this.h, 4);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(sx + 2, sy + 2, this.w - 4, 3);

        ctx.strokeStyle = CONFIG.WALL_STROKE;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        roundRect(ctx, sx, sy, this.w, this.h, 4);
        ctx.stroke();
    }

    collides(cx, cy, cr) {
        return circleRect(cx, cy, cr, this.x, this.y, this.w, this.h);
    }

    resolve(cx, cy, cr) {
        return resolveCircleRect(cx, cy, cr, this.x, this.y, this.w, this.h);
    }
}

class WallManager {
    constructor() {
        this.walls = [];
        this.generate();
    }

    generate() {
        const margin = 220;
        const mw = CONFIG.MAP_WIDTH, mh = CONFIG.MAP_HEIGHT;
        const cx = mw / 2, cy = mh / 2;
        const safe = 180;
        let attempts = 0;

        while (this.walls.length < CONFIG.WALL_COUNT && attempts < 500) {
            attempts++;
            let w, h;
            const r = Math.random();
            if (r < 0.4) {
                w = rand(CONFIG.WALL_MIN, CONFIG.WALL_MAX);
                h = CONFIG.WALL_THICK;
            } else if (r < 0.8) {
                w = CONFIG.WALL_THICK;
                h = rand(CONFIG.WALL_MIN, CONFIG.WALL_MAX);
            } else if (r < 0.9) {
                w = rand(60, 140);
                h = rand(60, 140);
            } else {
                const len = rand(CONFIG.WALL_MIN, CONFIG.WALL_MAX * 0.6);
                w = len;
                h = CONFIG.WALL_THICK;
                const x1 = rand(margin, mw - margin - w);
                const y1 = rand(margin, mh - margin - h);
                if (this.canPlace(x1, y1, w, h, cx, cy, safe)) {
                    this.walls.push(new Wall(x1, y1, w, h));
                    const x2 = x1 + w - CONFIG.WALL_THICK;
                    const h2 = rand(60, 160);
                    if (this.canPlace(x2, y1, CONFIG.WALL_THICK, h2, cx, cy, safe)) {
                        this.walls.push(new Wall(x2, y1, CONFIG.WALL_THICK, h2));
                    }
                }
                continue;
            }

            const x = rand(margin, mw - margin - w);
            const y = rand(margin, mh - margin - h);

            if (this.canPlace(x, y, w, h, cx, cy, safe)) {
                this.walls.push(new Wall(x, y, w, h));
            }
        }
    }

    canPlace(x, y, w, h, cx, cy, safe) {
        if (x < cx + safe && x + w > cx - safe && y < cy + safe && y + h > cy - safe) return false;
        for (const wall of this.walls) {
            if (x < wall.x + wall.w + 60 && x + w + 60 > wall.x &&
                y < wall.y + wall.h + 60 && y + h + 60 > wall.y) {
                return false;
            }
        }
        return true;
    }

    draw(ctx, cam) {
        for (const w of this.walls) {
            if (w.x + w.w > cam.viewX - 20 && w.x < cam.viewX + cam.w + 20 &&
                w.y + w.h > cam.viewY - 20 && w.y < cam.viewY + cam.h + 20) {
                w.draw(ctx, cam.viewX, cam.viewY);
            }
        }
    }

    check(cx, cy, cr) {
        for (const w of this.walls) {
            if (w.collides(cx, cy, cr)) return w;
        }
        return null;
    }

    resolveAll(cx, cy, cr) {
        let nx = cx, ny = cy;
        for (let pass = 0; pass < 3; pass++) {
            for (const w of this.walls) {
                if (w.collides(nx, ny, cr)) {
                    const r = w.resolve(nx, ny, cr);
                    nx = r.x; ny = r.y;
                }
            }
        }
        return { x: nx, y: ny };
    }
}
