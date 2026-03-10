class Tank {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.r = CONFIG.TANK_RADIUS;
        this.angle = 0;
        this.hp = CONFIG.TANK_HP;
        this.maxHp = CONFIG.TANK_HP;
        this.barrelLen = 40;
        this.barrelW = 18;
        this.recoil = 0;
        this.alive = true;
    }

    update(keys, mx, my, cam, walls) {
        let ax = 0, ay = 0;
        if (keys["w"] || keys["arrowup"]) ay -= 1;
        if (keys["s"] || keys["arrowdown"]) ay += 1;
        if (keys["a"] || keys["arrowleft"]) ax -= 1;
        if (keys["d"] || keys["arrowright"]) ax += 1;

        if (ax !== 0 && ay !== 0) {
            const m = 1 / Math.SQRT2;
            ax *= m; ay *= m;
        }

        this.vx += ax * CONFIG.TANK_ACCEL;
        this.vy += ay * CONFIG.TANK_ACCEL;
        this.vx *= CONFIG.TANK_FRICTION;
        this.vy *= CONFIG.TANK_FRICTION;

        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd > CONFIG.TANK_SPEED) {
            const s = CONFIG.TANK_SPEED / spd;
            this.vx *= s; this.vy *= s;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.x = clamp(this.x, this.r, CONFIG.MAP_WIDTH - this.r);
        this.y = clamp(this.y, this.r, CONFIG.MAP_HEIGHT - this.r);

        const res = walls.resolveAll(this.x, this.y, this.r);
        this.x = res.x;
        this.y = res.y;

        const worldMx = mx + cam.viewX;
        const worldMy = my + cam.viewY;
        this.angle = angle(this.x, this.y, worldMx, worldMy);

        if (this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + CONFIG.TANK_REGEN);
        }

        this.recoil *= 0.78;
    }

    fire() {
        this.recoil = 7;
    }

    draw(ctx, cx, cy) {
        const sx = this.x - cx, sy = this.y - cy;

        drawShadow(ctx, sx + 2, sy + 2, this.r + 2);

        const rcx = -Math.cos(this.angle) * this.recoil;
        const rcy = -Math.sin(this.angle) * this.recoil;

        ctx.save();
        ctx.translate(sx + rcx, sy + rcy);
        ctx.rotate(this.angle);

        const bg = ctx.createLinearGradient(0, -this.barrelW / 2, 0, this.barrelW / 2);
        bg.addColorStop(0, CONFIG.TANK_BARREL_HI);
        bg.addColorStop(0.5, CONFIG.TANK_BARREL);
        bg.addColorStop(1, CONFIG.TANK_BARREL_LO);
        ctx.fillStyle = bg;
        roundRect(ctx, -2, -this.barrelW / 2, this.barrelLen + 2, this.barrelW, 3);
        ctx.fill();
        ctx.strokeStyle = CONFIG.TANK_OUTLINE;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        roundRect(ctx, -2, -this.barrelW / 2, this.barrelLen + 2, this.barrelW, 3);
        ctx.stroke();

        ctx.restore();

        drawCircleGrad(ctx, sx, sy, this.r,
            CONFIG.TANK_BODY_HI, CONFIG.TANK_BODY_LO, CONFIG.TANK_OUTLINE, 3);

        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.arc(sx - this.r * 0.18, sy - this.r * 0.18, this.r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        drawBar(ctx, sx, sy + this.r + 12, this.r * 2.4, 5.5,
            this.hp / this.maxHp, "#4de94d", "rgba(0,0,0,0.35)");
    }
}
