function dist(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(lo, hi) { return Math.random() * (hi - lo) + lo; }
function randI(lo, hi) { return Math.floor(rand(lo, hi + 1)); }
function angle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }
function hsl(h, s, l) { return `hsl(${h},${s}%,${l}%)`; }

function hslHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
    const nx = clamp(cx, rx, rx + rw);
    const ny = clamp(cy, ry, ry + rh);
    const dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
}

function resolveCircleRect(cx, cy, cr, rx, ry, rw, rh) {
    const nx = clamp(cx, rx, rx + rw);
    const ny = clamp(cy, ry, ry + rh);
    const dx = cx - nx, dy = cy - ny;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d === 0) return { x: cx, y: cy - cr };
    const ov = cr - d;
    return { x: cx + (dx / d) * ov, y: cy + (dy / d) * ov };
}

function polyPath(ctx, x, y, r, sides, rot) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const a = (Math.PI * 2 / sides) * i + rot;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawPoly(ctx, x, y, r, sides, rot, fill, stroke, lw) {
    polyPath(ctx, x, y, r, sides, rot);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw || 3;
        ctx.lineJoin = "round";
        ctx.stroke();
    }
}

function drawPolyGrad(ctx, x, y, r, sides, rot, c1, c2, stroke, lw) {
    const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r * 1.1);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    polyPath(ctx, x, y, r, sides, rot);
    ctx.fillStyle = g;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw || 3;
        ctx.lineJoin = "round";
        ctx.stroke();
    }
}

function drawCircle(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw || 3;
        ctx.stroke();
    }
}

function drawCircleGrad(ctx, x, y, r, c1, c2, stroke, lw) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw || 3;
        ctx.stroke();
    }
}

function drawShadow(ctx, x, y, r) {
    const g = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, r * 1.3);
    g.addColorStop(0, "rgba(0,0,0,0.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y + 4, r * 1.2, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBar(ctx, x, y, w, h, ratio, color, bg) {
    if (ratio >= 1) return;
    ratio = clamp(ratio, 0, 1);
    const rx = x - w / 2;
    ctx.fillStyle = bg || "rgba(0,0,0,0.35)";
    roundRect(ctx, rx, y, w, h, h / 2);
    ctx.fill();
    if (ratio > 0) {
        ctx.fillStyle = color;
        roundRect(ctx, rx, y, w * ratio, h, h / 2);
        ctx.fill();
    }
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    roundRect(ctx, rx, y, w, h, h / 2);
    ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function formatScore(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toString();
}
