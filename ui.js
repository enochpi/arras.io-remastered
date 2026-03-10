class ScorePopup {
    constructor(x, y, text, color, big) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.big = big || false;
        this.life = CONFIG.POP_LIFE;
        this.maxLife = CONFIG.POP_LIFE;
        this.alive = true;
        this.vx = rand(-0.3, 0.3);
        this.scale = big ? 1.4 : 1;
    }

    update() {
        this.y -= CONFIG.POP_RISE;
        this.x += this.vx;
        this.life--;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx, cx, cy) {
        const a = clamp(this.life / this.maxLife, 0, 1);
        const ease = a < 0.3 ? a / 0.3 : 1;
        const bounce = this.life > this.maxLife - 6 ? 1.15 - (this.life - this.maxLife + 6) * 0.025 : 1;
        const sz = Math.floor(CONFIG.POP_FONT * this.scale * bounce);
        const sx = this.x - cx, sy = this.y - cy;

        ctx.save();
        ctx.globalAlpha = ease;
        ctx.font = `bold ${sz}px 'Exo 2',sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.lineWidth = 3.5;
        ctx.lineJoin = "round";
        ctx.strokeText(this.text, sx, sy);

        ctx.fillStyle = this.color;
        ctx.fillText(this.text, sx, sy);
        ctx.restore();
    }
}

class UI {
    constructor() {
        this.popups = [];
        this.score = 0;
        this.displayScore = 0;
        this.scoreFlash = 0;
        this.killCount = 0;
    }

    addPopup(x, y, pts, color, variant) {
        const formatted = "+" + formatScore(pts);
        const big = variant !== null;
        this.popups.push(new ScorePopup(x, y - 25, formatted, color || "#fff", big));
        this.scoreFlash = 12;
    }

    addScore(pts) {
        this.score += pts;
        this.killCount++;
    }

    update() {
        const diff = this.score - this.displayScore;
        if (Math.abs(diff) < 1) {
            this.displayScore = this.score;
        } else {
            this.displayScore += diff * 0.12;
        }

        if (this.scoreFlash > 0) this.scoreFlash--;

        for (let i = this.popups.length - 1; i >= 0; i--) {
            this.popups[i].update();
            if (!this.popups[i].alive) this.popups.splice(i, 1);
        }
    }

    drawPopups(ctx, cx, cy) {
        for (const p of this.popups) p.draw(ctx, cx, cy);
    }

    drawHUD(ctx, cw, ch, tank) {
        this.drawScorePanel(ctx, cw);
        this.drawPlayerHealth(ctx, cw, ch, tank);
        this.drawControls(ctx, ch);
    }

    drawScorePanel(ctx, cw) {
        const x = cw / 2;
        const y = 18;

        ctx.save();

        const pw = 220, ph = 48;
        const px = x - pw / 2, py = y - 6;
        ctx.fillStyle = "rgba(20,20,30,0.55)";
        roundRect(ctx, px, py, pw, ph, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        roundRect(ctx, px, py, pw, ph, 12);
        ctx.stroke();

        const flash = this.scoreFlash > 0 ? 1 + this.scoreFlash * 0.008 : 1;
        const sz = Math.floor(26 * flash);
        ctx.font = `bold ${sz}px 'Exo 2',sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "600 11px 'Exo 2',sans-serif";
        ctx.fillText("SCORE", x, y + 5);

        ctx.font = `bold ${sz}px 'Exo 2',sans-serif`;
        const sc = formatScore(Math.floor(this.displayScore));
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.strokeText(sc, x, y + 27);

        const fc = this.scoreFlash > 0 ? "#ffe566" : "#ffffff";
        ctx.fillStyle = fc;
        ctx.fillText(sc, x, y + 27);

        ctx.restore();
    }

    drawPlayerHealth(ctx, cw, ch, tank) {
        const bw = 260, bh = 10;
        const bx = cw / 2 - bw / 2;
        const by = ch - 40;

        ctx.save();
        ctx.fillStyle = "rgba(20,20,30,0.45)";
        roundRect(ctx, bx - 6, by - 5, bw + 12, bh + 10, 8);
        ctx.fill();

        const ratio = clamp(tank.hp / tank.maxHp, 0, 1);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        roundRect(ctx, bx, by, bw, bh, bh / 2);
        ctx.fill();

        if (ratio > 0) {
            const g = ctx.createLinearGradient(bx, by, bx + bw * ratio, by);
            g.addColorStop(0, "#44ee44");
            g.addColorStop(1, "#22bb22");
            ctx.fillStyle = g;
            roundRect(ctx, bx, by, bw * ratio, bh, bh / 2);
            ctx.fill();
        }

        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        roundRect(ctx, bx, by, bw, bh, bh / 2);
        ctx.stroke();

        ctx.font = "bold 10px 'Exo 2',sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(
            `${Math.ceil(tank.hp)} / ${tank.maxHp}`,
            cw / 2, by + bh / 2
        );

        ctx.restore();
    }

    drawControls(ctx, ch) {
        ctx.save();
        ctx.font = "500 10px 'Exo 2',sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillText("WASD move  |  Mouse aim  |  Click shoot", 14, ch - 12);
        ctx.restore();
    }
}
