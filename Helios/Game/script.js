const canvas = document.getElementById("background");
const ctx = canvas.getContext('2d');

// --- Global Scaling Variables ---
let drawWidth, drawHeight, offsetX;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateScaling();
}

function updateScaling() {
    if (!pathimage.complete) return;
    const imgRatio = pathimage.width / pathimage.height;
    const canvasRatio = canvas.width / canvas.height;

    if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
    } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
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
    width: 70,
    height: 110
};

const setupBtn = (id, direction) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("touchstart", (e) => { e.preventDefault(); movePlayer(direction); });
    el.addEventListener("mousedown", () => movePlayer(direction));
};

function movePlayer(direction) {
    if (direction === "left" && player.lane > 0) player.lane--;
    if (direction === "right" && player.lane < 2) player.lane++;
}

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

function spawn() {
    spawnTimer++;
    if (spawnTimer > 60) {
        const lane = Math.floor(Math.random() * 3);
        const laneWidth = drawWidth / 3; // Use drawWidth, not canvas.width
        const xPos = offsetX + (lane * laneWidth) + (laneWidth / 2); // Add offsetX

        if (Math.random() < 0.7) {
            obstacles.push({ x: xPos - 35, y: -100, width: 70, height: 70 });
        } else {
            coins.push({ x: xPos - 20, y: -100, width: 40, height: 40 });
        }
        spawnTimer = 0;
    }
}

function update() {
    bgY += gamespeed;
    if (bgY >= drawHeight) bgY = 0;

    player.y = canvas.height - 180;
    let laneWidth = drawWidth / 3;
    let targetX = offsetX + (player.lane * laneWidth) + (laneWidth / 2) - (player.width / 2);
    player.x += (targetX - player.x) * 0.15;

    spawn();

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += gamespeed;

        if (checkCollision(player, obs)) {
            lives--;
            obstacles.splice(i, 1);
            if (lives <= 0) {
                alert("Crashed! Score: " + score);
                resetGame();
            }
        } else if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.y += gamespeed;

        if (checkCollision(player, coin)) {
            score += 10;
            coins.splice(i, 1);
        } else if (coin.y > canvas.height) {
            coins.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scrolling background
    ctx.drawImage(pathimage, offsetX, bgY, drawWidth, drawHeight);
    ctx.drawImage(pathimage, offsetX, bgY - drawHeight, drawWidth, drawHeight);

    // Draw Entities
    obstacles.forEach(obs => ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height));
    coins.forEach(coin => ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height));
    ctx.drawImage(chariotImg, player.x, player.y, player.width, player.height);

    // Draw UI
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("Lives: " + lives, 20, 70);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

pathimage.onload = () => {
    resize(); // This calls updateScaling
    gameLoop();
};