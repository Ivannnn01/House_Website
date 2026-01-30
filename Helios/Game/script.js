const canvas = document.getElementById("background");
const ctx = canvas.getContext('2d');

// --- Scaling and Alignment Variables ---
let drawWidth, drawHeight, offsetX;
const pathPadding = 0.12; 

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateScaling();
}

function updateScaling() {
    if (!pathimage.complete) return;
    const imgRatio = pathimage.width / pathimage.height;
    drawWidth = Math.min(canvas.width, canvas.height * imgRatio);
    drawHeight = drawWidth / imgRatio;
    offsetX = (canvas.width - drawWidth) / 2;
}

window.addEventListener('resize', resize);

const pathimage = new Image();
pathimage.src = "Cloud_Path.png";
const chariotImg = new Image();
chariotImg.src = "Chariot.png";
const obstacleImg = new Image();
obstacleImg.src = "Storm_Cloud.png";
const coinImg = new Image();
coinImg.src = "Solar_Coin.png";

let gamespeed = 7;
let bgY = 0;
let score = 0;
let obstacles = [];
let coins = [];
let spawnTimer = 0;
let lives = 3;

const player = {
    lane: 1,
    x: 0,
    y: 0,
    width: 60,
    height: 95
};

function movePlayer(direction) {
    if (direction === "left" && player.lane > 0) player.lane--;
    if (direction === "right" && player.lane < 2) player.lane++;
}

// --- FIXED BUTTON LOGIC ---
const setupBtn = (id, direction) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    const handleAction = (e) => {
        e.preventDefault(); // Stops the "double trigger" on mobile
        e.stopPropagation();
        movePlayer(direction);
    };

    el.addEventListener("touchstart", handleAction, {passive: false});
    el.addEventListener("mousedown", handleAction);
};

setupBtn("leftBtn", "left");
setupBtn("rightBtn", "right");

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") movePlayer("left");
    if (e.key === "ArrowRight") movePlayer("right");
});

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function resetGame() {
    score = 0;
    obstacles = [];
    coins = [];
    player.lane = 1;
    gamespeed = 7;
    lives = 3;
}

function getLaneX(laneIndex, objWidth) {
    const playableWidth = drawWidth * (1 - (pathPadding * 2));
    const pathStart = offsetX + (drawWidth * pathPadding);
    const laneWidth = playableWidth / 3;
    return pathStart + (laneIndex * laneWidth) + (laneWidth / 2) - (objWidth / 2);
}

function spawn() {
    spawnTimer++;
    if (spawnTimer > 60) {
        const lane = Math.floor(Math.random() * 3);
        if (Math.random() < 0.7) {
            const x = getLaneX(lane, 60);
            obstacles.push({ x: x, y: -100, width: 60, height: 60 });
        } else {
            const x = getLaneX(lane, 35);
            coins.push({ x: x, y: -100, width: 35, height: 35 });
        }
        spawnTimer = 0;
    }
}

function update() {
    bgY += gamespeed;
    if (bgY >= drawHeight) bgY = 0;

    player.y = canvas.height - 150;
    let targetX = getLaneX(player.lane, player.width);
    player.x += (targetX - player.x) * 0.2;

    spawn();

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += gamespeed;
        if (checkCollision(player, obs)) {
            lives--;
            obstacles.splice(i, 1);
            if (lives <= 0) { alert("Game Over! Score: " + score); resetGame(); }
        } else if (obs.y > canvas.height) { obstacles.splice(i, 1); }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.y += gamespeed;
        if (checkCollision(player, coin)) {
            score += 10;
            coins.splice(i, 1);
        } else if (coin.y > canvas.height) { coins.splice(i, 1); }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- TILED BACKGROUND WITH OVERLAP FIX ---
    for (let i = -1; i < Math.ceil(canvas.height / drawHeight) + 1; i++) {
        ctx.drawImage(
            pathimage, 
            offsetX, 
            Math.floor(bgY + (i * drawHeight)), // Math.floor helps with sub-pixel jitter
            drawWidth, 
            drawHeight + 1 // +1 creates a tiny overlap to hide the seam
        );
    }

    obstacles.forEach(obs => ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height));
    coins.forEach(coin => ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height));
    ctx.drawImage(chariotImg, player.x, player.y, player.width, player.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("Lives: " + lives, 20, 70);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

pathimage.onload = () => {
    resize();
    gameLoop();
};
