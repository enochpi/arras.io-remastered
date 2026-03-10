class Bullet {
    constructor() {
        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.radius = CONFIG.BULLET_RADIUS;
        this.dmg = CONFIG.BULLET_DMG;
        this.life = 0;
        this.alive = false;
        this.trail = [];
    }

    init(x, y, ang) {
        this.x = x; this.y = y;
        this.vx = Math.cos(ang) * CONFIG.BULLET_SPEED;
        this.vy = Math.sin(ang) * CONFIG.BULLET_SPEED;
        this.life = CONFIG.BULLET_LIFE;
        this.alive = true;
        this.trail.length = 0;
    }

    update(walls) {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > CONFIG.BULLET_TRAIL_LEN) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (this.life <= 0 ||
            this.x < 0 || this.x > CONFIG.MAP_WIDTH ||
            this.y < 0 || this.y > CONFIG.MAP_HEIGHT) {
            this.alive = false;
            return;
        }

        if (walls.check(this.x, this.y, this.radius)) {
            this.alive = false;
        }
    }

    draw(ctx, cx, cy) {
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const a = (i + 1) / (this.trail.length + 1) * 0.35;
            const s = this.radius * (0.3 + 0.7 * (i / this.trail.length));
            ctx.globalAlpha = a;
            ctx.fillStyle = CONFIG.BULLET_COLOR;
            ctx.beginPath();
            ctx.arc(t.x - cx, t.y - cy, s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const sx = this.x - cx, sy = this.y - cy;

        ctx.save();
        ctx.shadowColor = CONFIG.BULLET_GLOW;
        ctx.shadowBlur = 10;
        drawCircleGrad(ctx, sx, sy, this.radius,
            CONFIG.TANK_BODY_HI, CONFIG.TANK_BODY, CONFIG.TANK_OUTLINE, 2);
        ctx.restore();
    }
}

class BulletManager {
    constructor() {
        this.pool = new Pool(() => new Bullet(), 200);
        this.cooldown = 0;
        this.muzzleFlash = 0;
        this.muzzleX = 0;
        this.muzzleY = 0;
    }

    fire(x, y, ang, particles) {
        if (this.cooldown > 0) return false;
        this.cooldown = CONFIG.FIRE_RATE;

        const bx = x + Math.cos(ang) * (CONFIG.TANK_RADIUS + 22);
        const by = y + Math.sin(ang) * (CONFIG.TANK_RADIUS + 22);

        const b = this.pool.get();
        if (b) {
            b.init(bx, by, ang);
        }

        this.muzzleFlash = CONFIG.MUZZLE_FLASH;
        this.muzzleX = bx;
        this.muzzleY = by;

        particles.emitDirectional(bx, by, "#ffdd66", 3, 4, 3, 8, ang, 0.4);

        return true;
    }

    update(walls) {
        if (this.cooldown > 0) this.cooldown--;
        if (this.muzzleFlash > 0) this.muzzleFlash--;
        this.pool.update(walls);
    }

    draw(ctx, cx, cy) {
        for (const b of this.pool.active) {
            b.draw(ctx, cx, cy);
        }

        if (this.muzzleFlash > 0) {
            const a = this.muzzleFlash / CONFIG.MUZZLE_FLASH;
            const sx = this.muzzleX - cx, sy = this.muzzleY - cy;
            ctx.globalAlpha = a * 0.7;
            const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 18 * a);
            g.addColorStop(0, "rgba(255,240,180,0.9)");
            g.addColorStop(0.5, "rgba(255,200,80,0.4)");
            g.addColorStop(1, "rgba(255,150,30,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(sx, sy, 18 * a, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    get bullets() { return this.pool.active; }
}
