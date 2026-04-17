// js/config.js

// Lấy canvas element (do script đặt ở cuối body)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GLOBAL STATE ---
let gameState = {
    hp: 20,
    coins: 250, // Tiền ban đầu
    score: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    spikesTokens: [], // bẫy chông đang hoạt động
    isGameOver: false,
};

// Trạng thái kéo thả và chuột
let draggingTowerType = null;
let draggingTowerCost = 0;
let mouseX = -1000;
let mouseY = -1000;
let selectedTower = null;
let relocatingTower = null; // Theo dõi Tháp đang được dời đi.

// Tọa độ đường đi (Predefined Path)
const path = [
    { x: 0, y: 120 }, { x: 200, y: 120 }, { x: 200, y: 350 },
    { x: 500, y: 350 }, { x: 500, y: 150 }, { x: 740, y: 150 },
    { x: 740, y: 480 }, { x: 800, y: 480 } 
];

// --- CẤU HÌNH TRỤ (TOWER CONFIGS) ---
const TOWER_CONFIGS = {
    basic: { name: 'Basic Tower', color: '#3498db', range: 130, damage: 30, cd: 600, radius: 18 },
    aoe: { name: 'AOE Tower', color: '#e67e22', range: 120, damage: 25, cd: 1500, radius: 20, explosionRadius: 90 },
    slow: { name: 'Slow Tower', color: '#8e44ad', range: 160, damage: 5, cd: 1000, radius: 18, slowFactor: 0.5, slowDur: 2500 },
    poison: { name: 'Poison Tower', color: '#2ecc71', range: 150, damage: 2, cd: 1200, radius: 16, dotDmg: 20, dotDur: 4000 }
};

// Cấu hình Load Hình ảnh Trụ
const TOWER_IMAGES = {
    basic: new Image(),
    aoe: new Image(),
    slow: new Image(),
    poison: new Image()
};

TOWER_IMAGES.basic.src = "img/tower_basic.png";
TOWER_IMAGES.aoe.src = "img/tower_aoe.png";
TOWER_IMAGES.slow.src = "img/tower_slow.png";
TOWER_IMAGES.poison.src = "img/tower_poison.png";
