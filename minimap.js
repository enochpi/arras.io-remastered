class Minimap {
    constructor() {
        this.size = CONFIG.MM_SIZE;
        this.margin = CONFIG.MM_MARGIN;
        this.radarAngle = 0;
        this.pings = [];
    }

    addPing(x, y, color) {
        this.pings.push({ x, y, color, life: 30, maxLife: 30 });
    }

    update() {
        this.radarAngle += CONFIG.MM_RADAR_SPEED;
        for (let i = this.pings.length - 1; i >= 0; i--) {
            this.pings[i].life--;
            if (this.pings[i].life <= 0) this.pings.splice(i, 1);
        }
    }

    draw(ctx, cw, ch, tank, walls, shapes) {
        const mm = this.size;
        const mg = this.margin;
        const ox = cw - mm - mg;
        const oy = ch - mm - mg;
        const sx = mm / CONFIG.MAP_WIDTH;
        const sy = mm / CONFIG.MAP_HEIGHT;

        ctx.save();

        ctx.fillStyle = CONFIG.MM_BG;
        roundRect(ctx, ox - 4, oy - 4, mm + 8, mm + 8, 8);
        ctx.fill();

        ctx.strokeStyle = CONFIG.MM_BORDER;
        ctx.lineWidth = 1.5;
        roundRect(ctx, ox - 4, oy - 4, mm + 8, mm + 8, 8);
        ctx.stroke();

        ctx.beginPath();
        roundRect(ctx, ox, oy, mm, mm, 6);
        ctx.clip();

        ctx.fillStyle = "rgba(180,175,165,0.35)";
        ctx.fillRect(ox, oy, mm, mm);

        for (const r of CONFIG.REGIONS) {
            ctx.fillStyle = r.tint.replace("0.04", "0.15");
            ctx.fillRect(ox + r.x * sx, oy + r.y * sy, r.w * sx, r.h * sy);
        }

        ctx.fillStyle = "rgba(100,95,88,0.55)";
        for (const w of walls) {
            ctx.fillRect(
                ox + w.x * sx,
                oy + w.y * sy,
                Math.max(1.5, w.w * sx),
                Math.max(1.5, w.h * sy)
            );
        }

        for (const s of shapes) {
            let c = s.color;
            if (s.variant === "rainbow") c = hslHex(s.rbHue, 90, 60);
            let alpha = 0.6;
            if (s.variant === "shadow") alpha = 0.2;
            if (s.variant === "shiny" || s.variant === "legendary" || s.variant === "rainbow") alpha = 0.9;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = c;
            const sz = s.variant ? 3 : 1.8;
            ctx.fillRect(
                ox + s.x * sx - sz / 2,
                oy + s.y * sy - sz / 2,
                sz, sz
            );
        }
        ctx.globalAlpha = 1;

        const rcx = ox + mm / 2;
        const rcy = oy + mm / 2;
        const rr = mm * 0.7;
        const ra = this.radarAngle;

        const sweep = ctx.createConicalGradient
            ? null
            : (() => {
                const g = ctx.createLinearGradient(
                    rcx + Math.cos(ra) * rr,
                    rcy + Math.sin(ra) * rr,
                    rcx + Math.cos(ra - 0.8) * rr,
                    rcy + Math.sin(ra - 0.8) * rr
                );
                g.addColorStop(0, CONFIG.MM_RADAR_COLOR);
                g.addColorStop(1, "rgba(0,0,0,0)");
                return g;
            })();

        if (sweep) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(rcx, rcy);
            ctx.arc(rcx, rcy, rr, ra - 0.6, ra, false);
            ctx.closePath();
            ctx.fillStyle = sweep;
            ctx.fill();
            ctx.restore();
        }

        for (const p of this.pings) {
            const pa = p.life / p.maxLife;
            const pr = (1 - pa) * 8 + 2;
            ctx.globalAlpha = pa * 0.8;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(ox + p.x * sx, oy + p.y * sy, pr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const px = ox + tank.x * sx;
        const py = oy + tank.y * sy;

        ctx.fillStyle = "rgba(0,176,219,0.3)";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = CONFIG.TANK_BODY;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();

        const dirLen = 8;
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(tank.angle) * dirLen, py + Math.sin(tank.angle) * dirLen);
        ctx.stroke();

        ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = "bold 9px 'Exo 2',sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(
            `${Math.floor(tank.x)}, ${Math.floor(tank.y)}`,
            ox + mm - 2, oy + mm + 13
        );
    }
}
