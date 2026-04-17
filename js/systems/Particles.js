// js/systems/Particles.js

// --- SPELL ENTITIES & PARTICLES ---
class SpikeTrap {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.timer = 10000; // 10s lifetime
        this.radius = 45;
        this.damagePerSec = 40;
    }
    update(delta) {
        this.timer -= delta;
        gameState.enemies.forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) <= this.radius) {
                e.takeDamage(this.damagePerSec * (delta/1000));
                e.applySlow(0.4, 500); // Massive slow while inside
            }
        });
    }
    draw(ctx) {
        ctx.fillStyle = 'rgba(127, 140, 141, 0.4)'; // Grayish puddle
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.fill();
        
        // Draw Spikes
        ctx.fillStyle = '#ecf0f1';
        for(let i=0; i<4; i++) {
            ctx.fillRect(this.x - 15 + (i*10), this.y - 15 + (i%2*10), 4, 12);
        }
    }
}

class BombSpell {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.timer = 1200; // 1.2s warning
        this.radius = 160;
        this.active = true;
    }
    update(delta) {
        this.timer -= delta;
        if (this.timer <= 0) {
            this.explode();
            this.active = false;
        }
    }
    explode() {
        gameState.particles.push(new Explosion(this.x, this.y, this.radius, '#c0392b'));
        gameState.enemies.forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) <= this.radius) {
                e.takeDamage(600); // Massive spell damage
            }
        });
    }
    draw(ctx) {
        // Red warning target
        const alpha = (Date.now() % 200) < 100 ? 0.6 : 0.2; // flashing
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.stroke();
    }
}

class Explosion {
    constructor(x, y, maxR, color) {
        this.x = x; this.y = y; this.maxR = maxR; this.r = 5;
        this.color = color || '#e67e22';
        this.life = 15; // frames approximation for visual
    }
    update() { this.r += (this.maxR / 15); this.life--; }
    draw(ctx) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 15;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class ExpandingRing {
    constructor(x, y, maxR, color) {
        this.x = x; this.y = y; this.maxR = maxR; this.r = 5;
        this.color = color; this.life = 20; 
    }
    update() { this.r += (this.maxR / 20); this.life--; }
    draw(ctx) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = this.life / 20;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color || '#f1c40f';
        this.life = 1500; // ms
        this.maxLife = 1500;
        this.active = true;
    }
    update(delta) {
        this.life -= delta;
        this.y -= 30 * (delta/1000); // float upwards 30px per sec
        if(this.life <= 0) this.active = false;
    }
    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        // draw shadow
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(this.text, this.x, this.y);
        ctx.shadowBlur = 0; // reset
        
        ctx.globalAlpha = 1.0;
    }
}
