class Pool {
    constructor(factory, maxSize) {
        this.factory = factory;
        this.max = maxSize;
        this.active = [];
        this.inactive = [];
        for (let i = 0; i < maxSize; i++) {
            this.inactive.push(factory());
        }
    }

    get() {
        let obj = this.inactive.pop();
        if (!obj) {
            if (this.active.length >= this.max) return null;
            obj = this.factory();
        }
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx !== -1) {
            this.active.splice(idx, 1);
            this.inactive.push(obj);
        }
    }

    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const obj = this.active[i];
            obj.update(dt);
            if (!obj.alive) {
                this.active.splice(i, 1);
                this.inactive.push(obj);
            }
        }
    }

    draw(ctx, cx, cy) {
        for (const obj of this.active) {
            obj.draw(ctx, cx, cy);
        }
    }

    clear() {
        while (this.active.length) {
            this.inactive.push(this.active.pop());
        }
    }

    get count() { return this.active.length; }
}
