const canvas = document.getElementById("background");
const ctx = canvas.getContext('2d');

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

let baseSpeed = 400; 
let gamespeed = 400; 
let bgY = 0;
let score = 0;
let lastMilestone = 0;
let obstacles = [];
let coins = [];
let spawnTimer = 0;
let lives = 3;
let lastTime = 0;
let gameActive = False;

const player = {
    lane: 1,
    x: 0,
    y: 0,
    width: 80,
    height: 0
};

function movePlayer(direction) {
    if (direction === "left" && player.lane > 0) player.lane--;
    if (direction === "right" && player.lane < 2) player.lane++;
}


let touchStartX = 0;
window.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: false });

window.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 15) {
        if (diff > 0) movePlayer("right");
        else movePlayer("left");
    }
    e.preventDefault(); 
}, { passive: false });

window.oncontextmenu = (e) => { e.preventDefault(); return false; };

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") movePlayer("left");
    if (e.key === "ArrowRight") movePlayer("right");
});


function checkCollision(playerRect, objRect, isObstacle) {
    const playerPadding = 40; 
    
    const objPadding = isObstacle ? 15 : 0; 
    
    return (playerRect.x + playerPadding) < (objRect.x + objRect.width - objPadding) &&
           (playerRect.x + playerRect.width - playerPadding) > (objRect.x + objPadding) &&
           (playerRect.y + playerPadding) < (objRect.y + objRect.height - objPadding) &&
           (playerRect.y + playerRect.height - playerPadding) > (objRect.y + objPadding);
}

function resetGame() {
    score = 0;
    lastMilestone = 0;
    gamespeed = baseSpeed;
    obstacles = [];
    coins = [];
    player.lane = 1;
    lives = 3;
}

function getLaneX(laneIndex, objWidth) {
    const playableWidth = drawWidth * (1 - (pathPadding * 2));
    const pathStart = offsetX + (drawWidth * pathPadding);
    const laneWidth = playableWidth / 3;
    return pathStart + (laneIndex * laneWidth) + (laneWidth / 2) - (objWidth / 2);
}

function spawn(dt) {
    spawnTimer += dt;
    const spawnRate = Math.max(0.4, 1.0 - (score / 500)); 
    if (spawnTimer > spawnRate) {
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

function update(dt) {
    if (chariotImg.width > 0) {
        player.height = player.width * (chariotImg.height / chariotImg.width);
    }

    let currentMilestone = Math.floor(score / 50);
    if (currentMilestone > lastMilestone) {
        gamespeed *= 1.10;
        lastMilestone = currentMilestone;
    }

    bgY = (bgY + gamespeed * dt) % drawHeight;
    player.y = canvas.height - (player.height + 50); 
    let targetX = getLaneX(player.lane, player.width);
    player.x += (targetX - player.x) * 0.35;

    spawn(dt);

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += gamespeed * dt;
        if (checkCollision(player, obs, true)) {
            lives--;
            obstacles.splice(i, 1);
            if (lives <= 0) { alert("Game Over! Score: " + score); resetGame(); }
        } else if (obs.y > canvas.height) { obstacles.splice(i, 1); }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.y += gamespeed * dt;
        if (checkCollision(player, coin, false)) {
            score += 10;
            coins.splice(i, 1);
        } else if (coin.y > canvas.height) { coins.splice(i, 1); }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tilesNeeded = Math.ceil(canvas.height / drawHeight) + 1;
    for (let i = -1; i < tilesNeeded; i++) {
        ctx.drawImage(pathimage, offsetX, Math.floor(bgY + (i * drawHeight)), drawWidth, drawHeight + 1);
    }
    obstacles.forEach(obs => ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height));
    coins.forEach(coin => ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height));
    ctx.drawImage(chariotImg, player.x, player.y, player.width, player.height);


    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("Lives: " + lives, 20, 70);
}

function gameLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

pathimage.onload = () => {
    resize();
    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        gameLoop(timestamp);
    });
};



