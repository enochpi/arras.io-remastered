class Shape {
    constructor(x, y, type, variant) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.variant = variant;
        const c = CONFIG.SHAPES[type];
        this.sides = c.sides;
        this.baseSize = c.size;
        this.color = c.color;
        this.colorDark = c.dark;
        this.outline = c.outline;
        this.maxHp = c.hp;
        this.hp = c.hp;
        this.scoreMin = c.scoreMin;
        this.scoreMax = c.scoreMax;
        this.rot = Math.random() * Math.PI * 2;
        this.rotV = rand(-0.012, 0.012);
        this.vx = rand(-1, 1) * CONFIG.SHAPE_DRIFT;
        this.vy = rand(-1, 1) * CONFIG.SHAPE_DRIFT;
        this.alive = true;
        this.scale = 1;
        this.flashT = 0;
        this.rbHue = Math.random() * 360;
        this.spawnT = CONFIG.SHAPE_SPAWN_FRAMES;
        this.pulseT = Math.random() * Math.PI * 2;

        if (variant) {
            const v = CONFIG.RARES[variant];
            this.scale = v.scale;
            if (variant !== "rainbow") {
                this.color = v.color;
                this.colorDark = v.dark;
            }
        }
    }

    get radius() { return this.baseSize * this.scale; }

    getScore() {
        let base = randI(this.scoreMin, this.scoreMax);
        if (!this.variant) return base;
        const v = CONFIG.RARES[this.variant];
        if (v.multMin > 1) base *= randI(v.multMin, v.multMax);
        if (v.bonusMin > 0) base += randI(v.bonusMin, v.bonusMax);
        return Math.floor(base);
    }

    update(walls, tick, particles) {
        this.rot += this.rotV;
        this.pulseT += 0.06;
        this.x += this.vx;
        this.y += this.vy;

        const r = this.radius;
        if (this.x - r < 0) { this.x = r; this.vx = Math.abs(this.vx); }
        if (this.x + r > CONFIG.MAP_WIDTH) { this.x = CONFIG.MAP_WIDTH - r; this.vx = -Math.abs(this.vx); }
        if (this.y - r < 0) { this.y = r; this.vy = Math.abs(this.vy); }
        if (this.y + r > CONFIG.MAP_HEIGHT) { this.y = CONFIG.MAP_HEIGHT - r; this.vy = -Math.abs(this.vy); }

        const res = walls.resolveAll(this.x, this.y, r);
        if (res.x !== this.x) this.vx *= -1;
        if (res.y !== this.y) this.vy *= -1;
        this.x = res.x;
        this.y = res.y;

        if (this.flashT > 0) this.flashT--;
        if (this.spawnT > 0) this.spawnT--;

        if (this.variant === "rainbow") {
            this.rbHue = (this.rbHue + 3) % 360;
        }

        if (this.variant === "shiny" && tick % 4 === 0) {
            particles.sparkle(this.x, this.y, r, "#88ffbb");
        }
        if (this.variant === "rainbow" && tick % 3 === 0) {
            particles.sparkle(this.x, this.y, r * 1.2, hslHex(this.rbHue, 90, 65));
        }
    }

    hit(dmg) {
        this.hp -= dmg;
        this.flashT = 5;
        if (this.hp <= 0) this.alive = false;
    }

    knockback(ang, force) {
        this.vx += Math.cos(ang) * force;
        this.vy += Math.sin(ang) * force;
    }

    draw(ctx, cx, cy) {
        const sx = this.x - cx, sy = this.y - cy;
        let r = this.radius;

        if (this.spawnT > 0) {
            const t = 1 - (this.spawnT / CONFIG.SHAPE_SPAWN_FRAMES);
            const ease = 1 - Math.pow(1 - t, 3);
            r *= ease;
            ctx.globalAlpha = ease;
        }

        let fc = this.color, dc = this.colorDark, oc = this.outline;

        if (this.variant === "rainbow") {
            fc = hslHex(this.rbHue, 85, 58);
            dc = hslHex(this.rbHue, 75, 40);
            oc = hslHex((this.rbHue + 30) % 360, 70, 32);
        }

        if (this.flashT > 0) {
            fc = "#ffffff";
            dc = "#dddddd";
        }

        drawShadow(ctx, sx, sy, r);

        if (this.variant && this.variant !== "shadow") {
            const vc = CONFIG.RARES[this.variant];
            const glowR = vc.glowR;
            let glowC = vc.glow;
            if (this.variant === "rainbow") {
                glowC = `hsla(${this.rbHue},90%,60%,0.4)`;
            }
            const pulse = this.variant === "legendary" ? 1 + Math.sin(this.pulseT) * 0.12 : 1;

            ctx.save();
            ctx.shadowColor = glowC;
            ctx.shadowBlur = glowR * pulse;
            drawPolyGrad(ctx, sx, sy, r, this.sides, this.rot, fc, dc, oc, 3);
            ctx.restore();

            if (this.variant === "legendary") {
                const pr = r * pulse;
                ctx.globalAlpha = 0.12 + Math.sin(this.pulseT) * 0.06;
                drawPoly(ctx, sx, sy, pr + 4, this.sides, this.rot, "transparent", vc.glow, 2);
                ctx.globalAlpha = 1;
            }
        } else if (this.variant === "shadow") {
            ctx.globalAlpha = clamp(ctx.globalAlpha * 0.38, 0, 1);
            const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 1.8);
            g.addColorStop(0, "rgba(15,15,30,0.35)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(sx, sy, r * 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = clamp((this.spawnT > 0 ? (1 - this.spawnT / CONFIG.SHAPE_SPAWN_FRAMES) : 1) * 0.42, 0, 1);
            drawPolyGrad(ctx, sx, sy, r, this.sides, this.rot, fc, dc, oc, 2.5);
        } else {
            drawPolyGrad(ctx, sx, sy, r, this.sides, this.rot, fc, dc, oc, 3);
        }

        ctx.globalAlpha = 1;

        drawBar(ctx, sx, sy + r + 10, r * 1.8, 4, this.hp / this.maxHp, "#5de05d");

        if (this.variant) {
            const label = CONFIG.RARES[this.variant].label;
            ctx.save();
            ctx.font = "bold 9px 'Exo 2',sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            let lc = "#fff";
            if (this.variant === "rainbow") lc = hslHex(this.rbHue, 90, 70);
            else if (this.variant === "shadow") lc = "#8888aa";
            else lc = CONFIG.RARES[this.variant].color;
            ctx.strokeStyle = "rgba(0,0,0,0.6)";
            ctx.lineWidth = 2.5;
            ctx.strokeText(label, sx, sy - r - 5);
            ctx.fillStyle = lc;
            ctx.fillText(label, sx, sy - r - 5);
            ctx.restore();
        }
    }
}

class ShapeManager {
    constructor(walls) {
        this.shapes = [];
        this.walls = walls;
        for (let i = 0; i < CONFIG.MAX_SHAPES; i++) this.spawn();
    }

    pickType() {
        const all = CONFIG.SHAPES;
        let total = 0;
        for (const k in all) total += all[k].weight;
        let r = Math.random() * total;
        for (const k in all) {
            r -= all[k].weight;
            if (r <= 0) return k;
        }
        return "square";
    }

    pickVariant() {
        for (const k in CONFIG.RARES) {
            if (Math.random() < 1 / CONFIG.RARES[k].rarity) return k;
        }
        return null;
    }

    findPos(rad) {
        for (let i = 0; i < 40; i++) {
            const x = rand(120, CONFIG.MAP_WIDTH - 120);
            const y = rand(120, CONFIG.MAP_HEIGHT - 120);
            if (!this.walls.check(x, y, rad + 15)) return { x, y };
        }
        return { x: rand(300, CONFIG.MAP_WIDTH - 300), y: rand(300, CONFIG.MAP_HEIGHT - 300) };
    }

    spawn() {
        if (this.shapes.length >= CONFIG.MAX_SHAPES) return;
        const type = this.pickType();
        const variant = this.pickVariant();
        const sz = CONFIG.SHAPES[type].size * (variant ? CONFIG.RARES[variant].scale : 1);
        const pos = this.findPos(sz);
        this.shapes.push(new Shape(pos.x, pos.y, type, variant));
    }

    update(tick, particles) {
        for (const s of this.shapes) s.update(this.walls, tick, particles);
        this.shapes = this.shapes.filter(s => s.alive);

        const deficit = CONFIG.MAX_SHAPES - this.shapes.length;
        const n = Math.min(deficit, CONFIG.SHAPE_SPAWN_RATE);
        for (let i = 0; i < n; i++) this.spawn();
    }

    draw(ctx, cam) {
        for (const s of this.shapes) {
            if (cam.visible(s.x, s.y, s.radius + 50)) {
                s.draw(ctx, cam.viewX, cam.viewY);
            }
        }
    }
}
