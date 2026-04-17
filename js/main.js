// js/main.js

function updateGeneralUI() {
    document.getElementById('hp-display').innerText = gameState.hp;
    document.getElementById('coins-display').innerText = gameState.coins;
    upgradeManager.updateButtons(); // keep buttons enabled/disabled state synced
}

function drawMap() {
    // Shadow / outer path
    ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 44; // Dark mud
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();

    // Inner dirt path
    ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 36; // Lighter dirt
    ctx.stroke();
}

function isPointOnPath(x, y) {
    const pad = 24; 
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i]; const p2 = path[i+1];
        const minX = Math.min(p1.x, p2.x) - pad; const maxX = Math.max(p1.x, p2.x) + pad;
        const minY = Math.min(p1.y, p2.y) - pad; const maxY = Math.max(p1.y, p2.y) + pad;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) return true;
    }
    return false;
}

function tryPlaceTower(typeKey, cost, x, y) {
    if (gameState.coins < cost || isPointOnPath(x, y)) return;

    // Check overlap
    for (let t of gameState.towers) {
        if (Math.hypot(t.x - x, t.y - y) < 40) return; // Minimum 40px gap
    }

    gameState.coins -= cost;
    gameState.towers.push(new Tower(x, y, typeKey));
    updateGeneralUI();
}

function drawPreviews() {
    // Drag Drop Tower Preview
    const isRelocating = relocatingTower !== null;
    if ((draggingTowerType || isRelocating) && mouseX > 0 && mouseY > 0) {
        let typeToDraw = isRelocating ? relocatingTower.typeKey : draggingTowerType;
        let costToCheck = isRelocating ? 0 : draggingTowerCost; // Cost already paid for relocate
        
        const canAfford = isRelocating ? true : gameState.coins >= costToCheck;
        const onPath = isPointOnPath(mouseX, mouseY);
        let overlap = false;
        for (let t of gameState.towers) { 
            // Ignore overlap with itself if relocating
            if (isRelocating && t === relocatingTower) continue;
            if (Math.hypot(t.x - mouseX, t.y - mouseY) < 40) overlap = true; 
        }
        
        const valid = canAfford && !onPath && !overlap;
        const cfg = TOWER_CONFIGS[typeToDraw];
        const r = isRelocating ? relocatingTower.range : cfg.range;

        ctx.beginPath(); ctx.arc(mouseX, mouseY, r, 0, Math.PI*2);
        ctx.fillStyle = valid ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)';
        ctx.fill();
        
        // Draw sprite alpha preview
        const img = TOWER_IMAGES[typeToDraw];
        if (img && img.complete) {
            ctx.globalAlpha = 0.6;
            const size = cfg.radius * 3.5;
            ctx.drawImage(img, mouseX - size/2, mouseY - size/2, size, size);
            ctx.globalAlpha = 1.0;
            
            // Draw red cross if invalid
            if(!valid) {
                ctx.beginPath(); ctx.arc(mouseX, mouseY, 18, 0, Math.PI*2);
                ctx.fillStyle = 'rgba(231, 76, 60, 0.6)'; ctx.fill();
            }
        } else {
            ctx.beginPath(); ctx.arc(mouseX, mouseY, 18, 0, Math.PI*2);
            ctx.fillStyle = valid ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)';
            ctx.fill();
        }
    }

    // Spell Targeting Preview
    if (spells.activeTargeting && mouseX > 0 && mouseY > 0) {
        ctx.beginPath();
        if (spells.activeTargeting === 'bomb') {
            ctx.arc(mouseX, mouseY, 160, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        } else {
            ctx.arc(mouseX, mouseY, 45, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(142, 68, 173, 0.3)';
        }
        ctx.fill();
    }
}

let lastTime = performance.now();

function gameLoop(timestamp) {
    const delta = Math.min(timestamp - lastTime, 100);
    lastTime = timestamp;

    if (gameState.hp <= 0 && !gameState.isGameOver) {
        gameState.isGameOver = true;
        updateGeneralUI();
    }

    if (gameState.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 64px Arial'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    
    // Managers update
    waveManager.update(delta);
    spells.update(delta);

    // Spikes
    for(let i = gameState.spikesTokens.length-1; i>=0; i--) {
        let sp = gameState.spikesTokens[i];
        sp.update(delta);
        sp.draw(ctx);
        if(sp.timer <= 0) gameState.spikesTokens.splice(i, 1);
    }

    // Particles (Bottom layer)
    for(let i = gameState.particles.length-1; i>=0; i--) {
        let p = gameState.particles[i];
        if (p.update) p.update(delta);
        else if (p.life !== undefined) { p.update(); }
        
        p.draw(ctx);
        
        if (p.active === false || p.life <= 0) gameState.particles.splice(i, 1);
    }

    // Enemies
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        let e = gameState.enemies[i];
        e.update(delta);
        e.draw(ctx);

        if (e.hp <= 0) {
            gameState.enemies.splice(i, 1);
            continue;
        }

        if (e.pathIndex >= path.length - 1) {
            gameState.hp -= (e.type === 'boss' ? 5 : 1);
            gameState.enemies.splice(i, 1);
            updateGeneralUI();
        }
    }

    // Towers
    for (let t of gameState.towers) {
        t.update(delta, timestamp);
        t.draw(ctx);
    }

    // Projectiles
    for (let i = gameState.projectiles.length-1; i>=0; i--) {
        let p = gameState.projectiles[i];
        p.update(delta);
        p.draw(ctx);
        if (!p.active) gameState.projectiles.splice(i, 1);
    }

    drawPreviews();

    requestAnimationFrame(gameLoop);
}

// --- EVENT LISTENERS ---

const shopItems = document.querySelectorAll('.shop-item');
shopItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        draggingTowerType = item.dataset.type;
        draggingTowerCost = parseInt(item.dataset.cost);
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: draggingTowerType, cost: draggingTowerCost }));
        e.dataTransfer.effectAllowed = 'copy';
        
        // Ẩn bảng (ghost image) mặc định của trình duyệt để Canvas tự lo phần hiển thị
        const emptyImage = new Image();
        emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(emptyImage, 0, 0);
        
        upgradeManager.select(null);
    });
    item.addEventListener('dragend', () => {
        draggingTowerType = null;
        draggingTowerCost = 0;
        mouseX = -100; mouseY = -100;
    });
});

canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const rect = canvas.getBoundingClientRect();
    tryPlaceTower(data.type, data.cost, e.clientX - rect.left, e.clientY - rect.top);
    draggingTowerType = null;
    mouseX = -100; mouseY = -100;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => { mouseX = -100; mouseY = -100; });

canvas.addEventListener('click', (e) => {
    if(gameState.isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (spells.activeTargeting) {
        spells.cast(x, y);
        return;
    }

    // 2. Check Relocation Drop
    if (relocatingTower) {
        const onPath = isPointOnPath(x, y);
        let overlap = false;
        for (let t of gameState.towers) { 
            if (t !== relocatingTower && Math.hypot(t.x - x, t.y - y) < 40) overlap = true; 
        }
        
        if (!onPath && !overlap) {
            // Valid drop
            relocatingTower.x = x;
            relocatingTower.y = y;
            relocatingTower.moveCount++;
            
            // Pop Smoke effect
            gameState.particles.push(new ExpandingRing(x, y, 60, '#bdc3c7'));
            
            relocatingTower = null; // Exit move mode
            updateGeneralUI();
        }
        return;
    }

    // 3. Check Tower Selection Overlay
    let clickedTower = null;
    for(let t of gameState.towers) {
        if (Math.hypot(t.x - x, t.y - y) <= t.cfg.radius + 10) {
            clickedTower = t;
            break;
        }
    }

    upgradeManager.select(clickedTower);
});

// Start
updateGeneralUI();
requestAnimationFrame(gameLoop);
