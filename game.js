class Game {
    constructor() {
        this.cvs = document.getElementById("gameCanvas");
        this.ctx = this.cvs.getContext("2d");
        this.resize();
        this.keys = {};
        this.mx = 0;
        this.my = 0;
        this.mDown = false;
        this.tick = 0;

        this.walls = new WallManager();
        this.camera = new Camera(this.cvs.width, this.cvs.height);
        this.tank = new Tank(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2);
        this.bullets = new BulletManager();
        this.shapes = new ShapeManager(this.walls);
        this.particles = new Particles();
        this.minimap = new Minimap();
        this.ui = new UI();

        this.camera.x = this.tank.x - this.cvs.width / 2;
        this.camera.y = this.tank.y - this.cvs.height / 2;

        this.bind();
        this.loop();
    }

    resize() {
        this.cvs.width = window.innerWidth;
        this.cvs.height = window.innerHeight;
        if (this.camera) this.camera.resize(this.cvs.width, this.cvs.height);
    }

    bind() {
        window.addEventListener("resize", () => this.resize());
        window.addEventListener("keydown", e => { this.keys[e.key.toLowerCase()] = true; });
        window.addEventListener("keyup", e => { this.keys[e.key.toLowerCase()] = false; });
        this.cvs.addEventListener("mousemove", e => { this.mx = e.clientX; this.my = e.clientY; });
        this.cvs.addEventListener("mousedown", e => { if (e.button === 0) this.mDown = true; });
        this.cvs.addEventListener("mouseup", e => { if (e.button === 0) this.mDown = false; });
        this.cvs.addEventListener("contextmenu", e => e.preventDefault());
    }

    update() {
        this.tick++;

        this.tank.update(this.keys, this.mx, this.my, this.camera, this.walls);

        if (this.mDown) {
            const fired = this.bullets.fire(this.tank.x, this.tank.y, this.tank.angle, this.particles);
            if (fired) {
                this.tank.fire();
                this.camera.shake(CONFIG.FIRE_SHAKE);
            }
        }

        this.bullets.update(this.walls);
        this.shapes.update(this.tick, this.particles);
        this.particles.update();
        this.minimap.update();
        this.ui.update();

        this.collide();

        this.camera.update(this.tank.x, this.tank.y);
    }

    collide() {
        const bList = this.bullets.bullets;
        const sList = this.shapes.shapes;

        for (let i = bList.length - 1; i >= 0; i--) {
            const b = bList[i];
            if (!b.alive) continue;

            for (let j = sList.length - 1; j >= 0; j--) {
                const s = sList[j];
                if (!s.alive) continue;

                const d = dist(b.x, b.y, s.x, s.y);
                if (d < b.radius + s.radius) {
                    const hitAng = angle(b.x, b.y, s.x, s.y);

                    s.hit(b.dmg);
                    s.knockback(hitAng, CONFIG.SHAPE_KNOCKBACK);
                    b.alive = false;

                    this.particles.emit(
                        b.x, b.y, "#ffdd88",
                        CONFIG.SPARK_N, CONFIG.SPARK_SPEED,
                        CONFIG.SPARK_SIZE, CONFIG.SPARK_LIFE, "spark"
                    );

                    this.particles.emit(
                        (b.x + s.x) / 2, (b.y + s.y) / 2,
                        s.color, 3, 2, 3, 15, "circle"
                    );

                    if (!s.alive) {
                        this.onShapeDestroyed(s);
                    }
                    break;
                }
            }
        }
    }

    onShapeDestroyed(s) {
        const pts = s.getScore();
        this.ui.addScore(pts);

        let popColor = "#fff";
        if (s.variant) {
            const v = CONFIG.RARES[s.variant];
            popColor = s.variant === "rainbow"
                ? hslHex(s.rbHue, 90, 70)
                : v.color;
        }

        this.ui.addPopup(s.x, s.y, pts, popColor, s.variant);

        let pColor = s.color;
        if (s.variant === "rainbow") pColor = hslHex(s.rbHue, 85, 60);
        let pCount = CONFIG.SHAPE_DEATH_PARTS;
        let pSpeed = CONFIG.P_SPEED;
        let pSize = CONFIG.P_SIZE;

        if (s.variant) {
            pCount = Math.floor(pCount * 2);
            pSpeed *= 1.3;
            pSize *= 1.2;
        }

        this.particles.emit(s.x, s.y, pColor, pCount, pSpeed, pSize, CONFIG.P_LIFE, "circle");
        this.particles.emit(s.x, s.y, "#fff", Math.floor(pCount / 2), pSpeed * 1.5, pSize * 0.6, CONFIG.P_LIFE * 0.6, "spark");

        if (s.variant) {
            const vc = CONFIG.RARES[s.variant];
            this.particles.emit(s.x, s.y, vc.pColor, 6, 2, 5, 25, "glow");
            this.minimap.addPing(s.x, s.y, vc.color || s.color);
        }

        let shakeAmt = CONFIG.SHAKE_S;
        if (s.type === "triangle") shakeAmt = CONFIG.SHAKE_M;
        if (s.type === "pentagon") shakeAmt = CONFIG.SHAKE_L;
        if (s.type === "hexagon") shakeAmt = CONFIG.SHAKE_XL;
        if (s.variant) shakeAmt *= 1.4;
        this.camera.shake(shakeAmt);
    }

    render() {
        const ctx = this.ctx;
        const cx = this.camera.viewX;
        const cy = this.camera.viewY;
        const cw = this.cvs.width;
        const ch = this.cvs.height;

        ctx.fillStyle = CONFIG.BG_COLOR;
        ctx.fillRect(0, 0, cw, ch);

        this.drawRegions(ctx, cx, cy, cw, ch);
        this.drawGrid(ctx, cx, cy, cw, ch);
        this.drawBorders(ctx, cx, cy, cw, ch);

        this.walls.draw(ctx, this.camera);
        this.shapes.draw(ctx, this.camera);
        this.bullets.draw(ctx, cx, cy);
        this.tank.draw(ctx, cx, cy);
        this.particles.draw(ctx, cx, cy);
        this.ui.drawPopups(ctx, cx, cy);

        this.ui.drawHUD(ctx, cw, ch, this.tank);
        this.minimap.draw(ctx, cw, ch, this.tank, this.walls.walls, this.shapes.shapes);
    }

    drawRegions(ctx, cx, cy, cw, ch) {
        for (const r of CONFIG.REGIONS) {
            if (r.x + r.w > cx && r.x < cx + cw && r.y + r.h > cy && r.y < cy + ch) {
                ctx.fillStyle = r.tint;
                ctx.fillRect(r.x - cx, r.y - cy, r.w, r.h);
            }
        }
    }

    drawGrid(ctx, cx, cy, cw, ch) {
        const gs = CONFIG.GRID_SIZE;
        const sx = Math.floor(cx / gs) * gs;
        const sy = Math.floor(cy / gs) * gs;
        ctx.strokeStyle = CONFIG.GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = sx; x < cx + cw + gs; x += gs) {
            const dx = x - cx;
            ctx.moveTo(dx, 0);
            ctx.lineTo(dx, ch);
        }
        for (let y = sy; y < cy + ch + gs; y += gs) {
            const dy = y - cy;
            ctx.moveTo(0, dy);
            ctx.lineTo(cw, dy);
        }
        ctx.stroke();
    }

    drawBorders(ctx, cx, cy, cw, ch) {
        const bw = CONFIG.BORDER_WIDTH;
        ctx.fillStyle = CONFIG.BORDER_GLOW;

        if (cx < bw)
            ctx.fillRect(0, 0, bw - cx, ch);
        if (cy < bw)
            ctx.fillRect(0, 0, cw, bw - cy);
        if (cx + cw > CONFIG.MAP_WIDTH - bw)
            ctx.fillRect(CONFIG.MAP_WIDTH - bw - cx, 0, cw, ch);
        if (cy + ch > CONFIG.MAP_HEIGHT - bw)
            ctx.fillRect(0, CONFIG.MAP_HEIGHT - bw - cy, cw, ch);

        ctx.strokeStyle = "rgba(200,60,60,0.35)";
        ctx.lineWidth = 3;
        const lx = -cx, ly = -cy;
        const rxx = CONFIG.MAP_WIDTH - cx;
        const byy = CONFIG.MAP_HEIGHT - cy;
        ctx.strokeRect(lx, ly, CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT);
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
}

window.addEventListener("load", () => new Game());
