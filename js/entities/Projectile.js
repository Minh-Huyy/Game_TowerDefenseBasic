// js/entities/Projectile.js

class Projectile {
    constructor(sx, sy, target, tower) {
        this.x = sx; this.y = sy;
        this.target = target;
        this.tx = target.x; this.ty = target.y; // Track last know pos
        this.tower = tower;
        this.speed = 500; // Fast travel
        this.active = true;
    }

    update(delta) {
        // If target alive, home in. Else go to last known pos.
        if (gameState.enemies.includes(this.target)) {
            this.tx = this.target.x;
            this.ty = this.target.y;
        }

        const dx = this.tx - this.x;
        const dy = this.ty - this.y;
        const dist = Math.hypot(dx, dy);
        const moveFrame = this.speed * (delta/1000);

        if (dist <= moveFrame || dist < 5) {
            this.x = this.tx; this.y = this.ty;
            this.hit();
            this.active = false;
        } else {
            this.x += (dx/dist) * moveFrame;
            this.y += (dy/dist) * moveFrame;
        }
    }

    hit() {
        const type = this.tower.typeKey;
        const dmg = this.tower.damage;

        if (type === 'basic') {
            if (gameState.enemies.includes(this.target)) this.target.takeDamage(dmg);
        } 
        else if (type === 'aoe') {
            const radius = this.tower.cfg.explosionRadius;
            gameState.particles.push(new Explosion(this.x, this.y, radius, '#e67e22'));
            gameState.enemies.forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= radius) {
                    e.takeDamage(dmg);
                }
            });
        } 
        else if (type === 'slow') {
            if (gameState.enemies.includes(this.target)) {
                this.target.takeDamage(dmg);
                this.target.applySlow(this.tower.cfg.slowFactor, this.tower.cfg.slowDur);
                gameState.particles.push(new ExpandingRing(this.x, this.y, 40, '#3498db')); // Ice splash
            }
        } 
        else if (type === 'poison') {
            if (gameState.enemies.includes(this.target)) {
                this.target.takeDamage(dmg); // initial impact
                this.target.applyPoison(this.tower.cfg.dotDmg, this.tower.cfg.dotDur);
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI*2);
        ctx.fillStyle = this.tower.cfg.color;
        ctx.fill();
    }
}
