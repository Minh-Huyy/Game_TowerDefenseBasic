// js/entities/Tower.js

class Tower {
    constructor(x, y, typeKey) {
        this.x = x;
        this.y = y;
        this.typeKey = typeKey;
        this.cfg = Object.assign({}, TOWER_CONFIGS[typeKey]);
        
        // Base stats that can mutate via upgrade
        this.range = this.cfg.range;
        this.damage = this.cfg.damage;
        this.cooldown = this.cfg.cd;
        
        this.lastFired = 0;
        
        // New upgrade system constraints
        this.level = 1; 
        this.chosenPath = null; // 'range' | 'damage' | 'speed' (locked after 1st upgrade)
        this.upgrades = { range: 0, damage: 0, speed: 0 };
        this.moveCount = 0;
    }

    update(delta, timestamp) {
        if (typeof relocatingTower !== 'undefined' && relocatingTower === this) return; // Đóng băng tháp khi đang dời
        
        if (timestamp - this.lastFired < this.cooldown) return;

        let target = null;
        let minDist = Infinity;

        for (let e of gameState.enemies) {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.range && dist < minDist) {
                minDist = dist;
                target = e;
            }
        }

        if (target) {
            this.lastFired = timestamp;
            gameState.projectiles.push(new Projectile(this.x, this.y, target, this));
        }
    }

    draw(ctx) {
        if (typeof relocatingTower !== 'undefined' && relocatingTower === this) return; // Ẩn tháp cũ khi đang dính vào chuột
        
        ctx.save();
        
        // Selection Aura
        if (selectedTower === this) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(241, 196, 15, 0.15)';
            ctx.fill();
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Selection ring around tower
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.cfg.radius + 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Tower Sprite Image
        const img = TOWER_IMAGES[this.typeKey];
        if (img && img.complete) {
            const size = this.cfg.radius * 3.5; 
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
        } else {
            // Hiệu ứng tải tạm (Fallback) trước khi ảnh Load xong
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.cfg.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.cfg.color;
            ctx.fill();
        }

        // Upgrade visual indicators (dots)
        let primaryColor = '#f1c40f';
        if (this.chosenPath === 'range') primaryColor = '#3498db';
        if (this.chosenPath === 'damage') primaryColor = '#e74c3c';
        if (this.chosenPath === 'speed') primaryColor = '#2ecc71';

        ctx.fillStyle = primaryColor;
        for(let i=0; i<this.level-1; i++) {
            ctx.fillRect(this.x - 10 + (i*6), this.y + 16, 4, 4);
        }

        ctx.restore();
    }
}
