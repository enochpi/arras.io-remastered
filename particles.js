function makeParticle() {
    return {
        x: 0, y: 0, vx: 0, vy: 0,
        size: 0, life: 0, maxLife: 0,
        color: "#fff", type: "circle",
        alive: false, friction: 0.96,
        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
            if (this.life <= 0) this.alive = false;
        },
        draw(ctx, cx, cy) {
            const a = clamp(this.life / this.maxLife, 0, 1);
            const s = this.size * (0.3 + 0.7 * a);
            const sx = this.x - cx, sy = this.y - cy;
            ctx.globalAlpha = a;
            if (this.type === "spark") {
                const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const stretch = Math.max(s, len * 1.5);
                const ang = Math.atan2(this.vy, this.vx);
                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(ang);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, stretch, s * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (this.type === "glow") {
                const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, s * 2);
                g.addColorStop(0, this.color);
                g.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(sx, sy, s * 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === "star") {
                ctx.fillStyle = this.color;
                const rot = (1 - a) * Math.PI * 4;
                drawStar(ctx, sx, sy, s, rot);
            } else {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(sx, sy, s, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    };
}

function drawStar(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const a1 = rot + (Math.PI * 2 / 5) * i - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
        ctx.lineTo(x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45);
    }
    ctx.closePath();
    ctx.fill();
}

function makeTrail() {
    return {
        x: 0, y: 0, size: 0, life: 0, maxLife: 0,
        color: "#fff", alive: false,
        update() {
            this.life--;
            if (this.life <= 0) this.alive = false;
        },
        draw(ctx, cx, cy) {
            const a = clamp(this.life / this.maxLife, 0, 1);
            const s = this.size * a;
            ctx.globalAlpha = a * 0.45;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x - cx, this.y - cy, s, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    };
}

class Particles {
    constructor() {
        this.particles = new Pool(makeParticle, CONFIG.P_POOL);
        this.trails = new Pool(makeTrail, CONFIG.TRAIL_POOL);
    }

    emit(x, y, color, count, speed, size, life, type) {
        type = type || "circle";
        for (let i = 0; i < count; i++) {
            const p = this.particles.get();
            if (!p) break;
            const a = Math.random() * Math.PI * 2;
            const spd = rand(speed * 0.4, speed * 1.6);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd;
            p.size = rand(size * 0.6, size * 1.5);
            p.life = randI(Math.floor(life * 0.5), life);
            p.maxLife = p.life;
            p.color = color;
            p.type = type;
            p.alive = true;
            p.friction = type === "spark" ? 0.93 : 0.96;
        }
    }

    emitDirectional(x, y, color, count, speed, size, life, ang, spread) {
        for (let i = 0; i < count; i++) {
            const p = this.particles.get();
            if (!p) break;
            const a = ang + rand(-spread, spread);
            const spd = rand(speed * 0.6, speed * 1.4);
            p.x = x; p.y = y;
            p.vx = Math.cos(a) * spd;
            p.vy = Math.sin(a) * spd;
            p.size = rand(size * 0.7, size * 1.3);
            p.life = randI(Math.floor(life * 0.6), life);
            p.maxLife = p.life;
            p.color = color;
            p.type = "spark";
            p.alive = true;
            p.friction = 0.92;
        }
    }

    trail(x, y, color, size) {
        const t = this.trails.get();
        if (!t) return;
        t.x = x; t.y = y;
        t.color = color;
        t.size = size;
        t.life = CONFIG.TRAIL_LIFE;
        t.maxLife = CONFIG.TRAIL_LIFE;
        t.alive = true;
    }

    sparkle(x, y, radius, color) {
        const p = this.particles.get();
        if (!p) return;
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * radius;
        p.x = x + Math.cos(a) * d;
        p.y = y + Math.sin(a) * d;
        p.vx = rand(-0.3, 0.3);
        p.vy = rand(-1.2, -0.3);
        p.size = rand(2, 4);
        p.life = randI(12, 22);
        p.maxLife = p.life;
        p.color = color;
        p.type = "star";
        p.alive = true;
        p.friction = 0.98;
    }

    update() {
        this.particles.update();
        this.trails.update();
    }

    draw(ctx, cx, cy) {
        this.trails.draw(ctx, cx, cy);
        this.particles.draw(ctx, cx, cy);
    }
}
