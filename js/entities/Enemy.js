// js/entities/Enemy.js

class Enemy {
    constructor(type, waveNum) {
        this.x = path[0].x - 20; 
        this.y = path[0].y;
        this.pathIndex = 0;
        this.type = type;
        
        let baseHp = 100 + (waveNum * 25);
        this.baseSpeed = 55; // px/s
        this.armor = 0;
        this.reward = 10 + waveNum;
        this.radius = 12;
        this.color = '#e74c3c';
        
        if (type === 'fast') {
            baseHp *= 0.6;
            this.baseSpeed = 95;
            this.color = '#f1c40f'; // yellow
        } else if (type === 'armored') {
            baseHp *= 1.4;
            this.baseSpeed = 40;
            this.armor = 40 + (waveNum * 5); 
            this.color = '#7f8c8d'; // gray
            this.radius = 15;
            this.reward = 15 + waveNum;
        } else if (type === 'boss') {
            baseHp *= 10; // Huge HP
            this.baseSpeed = 30;
            this.color = '#8e44ad'; // Boss purple
            this.radius = 28;
            this.reward = 100 + (waveNum * 5);
            this.auraTimer = 0;
        }
        
        this.hp = baseHp;
        this.maxHp = baseHp;
        this.isDead = false;

        // Status effects
        this.slowTimer = 0;
        this.slowFactor = 1;
        this.poisonTimer = 0;
        this.poisonDot = 0; // dmg per second
    }

    takeDamage(amount, isPoison = false) {
        if (this.isDead) return;

        if (isPoison) {
            this.hp -= amount; // bypass armor
        } else {
            const reductionMultiplier = 100 / (100 + this.armor);
            this.hp -= (amount * reductionMultiplier);
        }
        
        if(this.hp <= 0) {
            this.isDead = true;
            gameState.coins += this.reward;
            gameState.particles.push(new FloatingText(this.x, this.y, `+${this.reward}`, '#f1c40f'));
            if (typeof updateGeneralUI === 'function') updateGeneralUI(); 
        }
    }

    applySlow(factor, duration) {
        this.slowFactor = factor;
        this.slowTimer = duration; // Replace current slow duration
    }

    applyPoison(dotDmg, duration) {
        this.poisonDot = dotDmg;
        this.poisonTimer = duration; // Replaces current poison 
    }

    update(delta) {
        // Effects processing
        let actualSpeed = this.baseSpeed;
        
        if (this.slowTimer > 0) {
            this.slowTimer -= delta;
            actualSpeed *= this.slowFactor;
        }
        
        if (this.poisonTimer > 0) {
            this.poisonTimer -= delta;
            this.takeDamage(this.poisonDot * (delta/1000), true);
        }

        // Boss Aura
        if (this.type === 'boss') {
            this.auraTimer += delta;
            if (this.auraTimer >= 1000) {
                // Heal nearby enemies by 5% every second
                gameState.enemies.forEach(e => {
                    if (e !== this && Math.hypot(e.x - this.x, e.y - this.y) < 180) {
                        e.hp = Math.min(e.maxHp, e.hp + (e.maxHp * 0.05));
                    }
                });
                this.auraTimer = 0;
                gameState.particles.push(new ExpandingRing(this.x, this.y, 180, '#2ecc71'));
            }
        }

        // Movement
        const target = path[this.pathIndex + 1];
        if (!target) return; // Exit logic handles deletion

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        const moveDist = actualSpeed * (delta/1000);

        if (dist <= moveDist) {
            this.x = target.x;
            this.y = target.y;
            this.pathIndex++;
        } else {
            this.x += (dx / dist) * moveDist;
            this.y += (dy / dist) * moveDist;
        }
    }

    draw(ctx) {
        // Draw Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Armored outline visual
        if(this.armor > 0) {
            ctx.strokeStyle = '#ecf0f1';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
        }
        ctx.stroke();

        // Status Effect Markers
        if (this.slowTimer > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        if (this.poisonTimer > 0) {
            // Draw bubbling green circle above
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.radius - 8, 4, 0, Math.PI*2);
            ctx.fillStyle = '#2ecc71';
            ctx.fill();
        }

        // Health Bar
        if (this.hp < this.maxHp) {
            const width = this.radius * 2 * 1.2;
            const pct = Math.max(this.hp / this.maxHp, 0);
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(this.x - width/2, this.y - this.radius - 8, width, 4);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(this.x - width/2, this.y - this.radius - 8, width * pct, 4);
        }
    }
}
