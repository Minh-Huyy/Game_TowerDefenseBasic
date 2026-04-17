// js/systems/Managers.js

const spells = {
    activeTargeting: null,
    bomb: { cdTimer: 0, cdTotal: 30000, active: false },
    spikes: { cdTimer: 0, cdTotal: 20000, active: false },
    
    toggleTargeting: function(type) {
        if (this[type].cdTimer > 0) return; // cooldown active
        
        if (this.activeTargeting === type) {
            this.activeTargeting = null; // untoggle
        } else {
            this.activeTargeting = type;
        }
        this.updateUI();
    },

    cast: function(x, y) {
        if(this.activeTargeting === 'bomb') {
            this.bomb.cdTimer = this.bomb.cdTotal;
            gameState.particles.push(new BombSpell(x, y));
        } else if (this.activeTargeting === 'spikes') {
            this.spikes.cdTimer = this.spikes.cdTotal;
            gameState.spikesTokens.push(new SpikeTrap(x, y));
        }
        this.activeTargeting = null;
        this.updateUI();
    },

    update: function(delta) {
        if (this.bomb.cdTimer > 0) this.bomb.cdTimer = Math.max(0, this.bomb.cdTimer - delta);
        if (this.spikes.cdTimer > 0) this.spikes.cdTimer = Math.max(0, this.spikes.cdTimer - delta);
        
        document.getElementById('cd-bomb').style.height = `${(this.bomb.cdTimer / this.bomb.cdTotal) * 100}%`;
        document.getElementById('cd-spikes').style.height = `${(this.spikes.cdTimer / this.spikes.cdTotal) * 100}%`;
    },

    updateUI: function() {
        document.getElementById('btn-bomb').classList.toggle('active-target', this.activeTargeting === 'bomb');
        document.getElementById('btn-spikes').classList.toggle('active-target', this.activeTargeting === 'spikes');
    }
};

const waveManager = {
    wave: 0,
    active: false,
    enemiesLeft: 0,
    spawnTimer: 0,
    spawnInterval: 1500,
    bossSpawned: false,
    
    // Auto-wave fields
    isResting: false,
    restTimer: 0,
    restTotal: 20000, // 20s

    startNext: function() {
        if (this.active) return;
        
        // Bonus calculation if skipping rest time
        if (this.isResting && this.restTimer > 0) {
            const timeSavedSec = this.restTimer / 1000;
            const bonus = Math.ceil(timeSavedSec * 5); // 5 coins per second
            if (bonus > 0) {
                gameState.coins += bonus;
                gameState.particles.push(new FloatingText(400, 300, `+${bonus} Bonus!`, '#f1c40f'));
                // also update ui immediately
                if(typeof updateGeneralUI === 'function') updateGeneralUI();
            }
        }
        
        this.isResting = false;
        this.restTimer = 0;
        
        this.wave++;
        this.enemiesLeft = 8 + Math.floor(this.wave * 1.5);
        this.active = true;
        this.bossSpawned = false;
        this.spawnInterval = Math.max(500, 1500 - this.wave * 50);
        
        document.getElementById('wave-display').innerText = this.wave;
        const btn = document.getElementById('start-wave-btn');
        btn.disabled = true;
        btn.innerText = "Wave Active Phase";
    },

    update: function(delta) {
        // Rest Phase Logic
        if (this.isResting) {
            this.restTimer -= delta;
            
            const btn = document.getElementById('start-wave-btn');
            const secLeft = Math.max(0, this.restTimer / 1000).toFixed(1);
            btn.innerText = `Next Wave in ${secLeft}s (Skip for Bonus)`;
            
            if (this.restTimer <= 0) {
                this.startNext(); // Auto start
            }
            return;
        }

        // Active Spawning Logic
        if (this.active && this.enemiesLeft > 0) {
            this.spawnTimer += delta;
            if(this.spawnTimer >= this.spawnInterval) {
                this.spawnEnemy();
                this.spawnTimer = 0;
                this.enemiesLeft--;
            }
        }

        // Wave End condition -> Transition to Rest Phase
        if (this.active && this.enemiesLeft <= 0 && gameState.enemies.length === 0) {
            this.active = false;
            this.isResting = true;
            this.restTimer = this.restTotal; // Begin 20s countdown
            
            const btn = document.getElementById('start-wave-btn');
            btn.disabled = false;
        }
    },

    spawnEnemy: function() {
        let type = 'normal';
        
        if (this.wave % 10 === 0 && !this.bossSpawned && this.enemiesLeft === 1) {
            type = 'boss';
            this.bossSpawned = true;
        } else if (this.wave >= 5 && Math.random() < 0.3) {
            type = 'armored';
        } else if (this.wave >= 3 && Math.random() < 0.4) {
            type = 'fast';
        }

        gameState.enemies.push(new Enemy(type, this.wave));
    }
};

const upgradeManager = {
    select: function(tower) {
        selectedTower = tower;
        const panel = document.getElementById('upgrade-panel');
        
        if (tower) {
            panel.style.display = 'block';
            document.getElementById('upgrade-target-name').innerText = `${tower.cfg.name} (Lv. ${tower.level})`;
            this.updateButtons();
        } else {
            panel.style.display = 'none';
        }
    },

    getCost: function() {
        if(!selectedTower) return 0;
        return 100 * selectedTower.level;
    },

    getRelocateCost: function() {
        if(!selectedTower) return 0;
        if (selectedTower.moveCount < 2) return 30;
        return Math.floor(30 * Math.pow(1.5, selectedTower.moveCount - 1));
    },

    updateButtons: function() {
        if(!selectedTower) return;
        
        const states = ['range', 'damage', 'speed'];
        const cost = this.getCost();
        
        states.forEach(stat => {
            const btn = document.getElementById(`up-${stat}`);
            
            // Check Exclusive Upgrading Restrictions
            const isLocked = selectedTower.chosenPath !== null && selectedTower.chosenPath !== stat;
            const isMax = selectedTower.level >= 4 && selectedTower.chosenPath === stat;

            let text = `${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
            
            if (isLocked) {
                btn.innerText = `${text} [LOCKED]`;
                btn.disabled = true;
            } else if (isMax) {
                btn.innerText = `${text} [MAX]`;
                btn.disabled = true;
            } else {
                btn.innerText = `${text} (+${cost} 💰)`;
                btn.disabled = gameState.coins < cost;
            }
        });

        // Update Move Button
        const moveBtn = document.getElementById('move-btn');
        if (moveBtn) {
            const relCost = this.getRelocateCost();
            moveBtn.innerText = `Move (${relCost} 💰)`;
            moveBtn.disabled = gameState.coins < relCost;
        }
    },

    buy: function(stat) {
        const cost = this.getCost();
        // Fallback protection just in case
        if (selectedTower.level >= 4) return;
        if (selectedTower.chosenPath !== null && selectedTower.chosenPath !== stat) return;

        if (gameState.coins >= cost) {
            gameState.coins -= cost;
            selectedTower.chosenPath = stat; // Lock the path
            selectedTower.upgrades[stat] = (selectedTower.upgrades[stat] || 0) + 1;
            selectedTower.level++;
            
            if(stat === 'range') selectedTower.range *= 1.25;
            if(stat === 'damage') selectedTower.damage *= 1.5;
            if(stat === 'speed') selectedTower.cooldown *= 0.75; 
            
            // Show upgrade particle on tower
            gameState.particles.push(new ExpandingRing(selectedTower.x, selectedTower.y, 60, '#f1c40f'));
            
            updateGeneralUI();
            this.select(selectedTower); // Refresh view
        }
    },

    sell: function() {
        if(!selectedTower) return;
        
        // Sum total invested: base cost + all upgrades
        let upgradeInvestment = 0;
        for(let i = 1; i < selectedTower.level; i++) {
            upgradeInvestment += (100 * i); // Calculate sum of factorial-ish cost levels visually (100+200+300)
        }
        
        const totalInvested = TOWER_CONFIGS[selectedTower.typeKey].cost + upgradeInvestment;
        const returnVal = Math.floor(totalInvested * 0.5);
        
        gameState.coins += returnVal;
        
        const idx = gameState.towers.indexOf(selectedTower);
        if(idx > -1) gameState.towers.splice(idx, 1);
        
        updateGeneralUI();
        this.select(null);
    },

    relocateTower: function() {
        if(!selectedTower) return;
        const cost = this.getRelocateCost();
        
        if (gameState.coins >= cost) {
            gameState.coins -= cost;
            relocatingTower = selectedTower;
            this.select(null); 
            updateGeneralUI();
        }
    }
};
