const canvas = document.getElementById("background");
const ctx = canvas.getContext('2d');

// --- Scaling and Alignment Variables ---
let drawWidth, drawHeight, offsetX, offsetY;
const pathPadding = 0.12; // Adjust this if the lanes feel slightly off-center

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateScaling();
}

function updateScaling() {
    if (!pathimage.complete) return;
    
    const imgRatio = pathimage.width / pathimage.height;
    const canvasRatio = canvas.width / canvas.height;

    // This logic ensures the image fits WITHIN the screen (Letterboxing)
    if (canvasRatio > imgRatio) {
        // Screen is wider than the image (Desktop/Tablet)
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    } else {
        // Screen is taller than the image (Most Phones)
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = 0; // Keeping it at top, or (canvas.height - drawHeight)/2 to center
    }
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
    width: 60,  // Slightly smaller to fit mobile screens better
    height: 95
};

function movePlayer(direction) {
    if (direction === "left" && player.lane > 0) player.lane--;
    if (direction === "right" && player.lane < 2) player.lane++;
}

// Controls
const setupBtn = (id, direction) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("touchstart", (e) => { e.preventDefault(); movePlayer(direction); });
    el.addEventListener("mousedown", (e) => { e.preventDefault(); movePlayer(direction); });
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

// --- Dynamic Lane Calculation ---
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
    // Scroll background relative to its own drawn height
    bgY += gamespeed;
    if (bgY >= drawHeight) bgY = 0;

    // Keep player near bottom of the screen
    player.y = canvas.height - 150;
    
    let targetX = getLaneX(player.lane, player.width);
    player.x += (targetX - player.x) * 0.2; // Snappier movement for mobile

    spawn();

    // Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += gamespeed;
        if (checkCollision(player, obs)) {
            lives--;
            obstacles.splice(i, 1);
            if (lives <= 0) { alert("Game Over! Score: " + score); resetGame(); }
        } else if (obs.y > canvas.height) { obstacles.splice(i, 1); }
    }

    // Coins
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

    // Draw scrolling background
    // We draw it twice to create the infinite loop effect
    ctx.drawImage(pathimage, offsetX, bgY, drawWidth, drawHeight);
    ctx.drawImage(pathimage, offsetX, bgY - drawHeight, drawWidth, drawHeight);

    // Draw Entities
    obstacles.forEach(obs => ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height));
    coins.forEach(coin => ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height));
    ctx.drawImage(chariotImg, player.x, player.y, player.width, player.height);

    // UI
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
