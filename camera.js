class Camera {
    constructor(canvasW, canvasH) {
        this.x = 0;
        this.y = 0;
        this.w = canvasW;
        this.h = canvasH;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeIntensity = 0;
    }

    resize(w, h) {
        this.w = w;
        this.h = h;
    }

    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    update(targetX, targetY) {
        const tx = targetX - this.w / 2;
        const ty = targetY - this.h / 2;
        this.x = lerp(this.x, tx, CONFIG.CAM_LERP);
        this.y = lerp(this.y, ty, CONFIG.CAM_LERP);
        this.x = clamp(this.x, 0, CONFIG.MAP_WIDTH - this.w);
        this.y = clamp(this.y, 0, CONFIG.MAP_HEIGHT - this.h);

        if (this.shakeIntensity > 0.1) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeIntensity *= CONFIG.CAM_SHAKE_DECAY;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
            this.shakeIntensity = 0;
        }
    }

    get viewX() { return this.x + this.shakeX; }
    get viewY() { return this.y + this.shakeY; }

    visible(ex, ey, margin) {
        margin = margin || 80;
        return ex > this.x - margin && ex < this.x + this.w + margin &&
               ey > this.y - margin && ey < this.y + this.h + margin;
    }
}
