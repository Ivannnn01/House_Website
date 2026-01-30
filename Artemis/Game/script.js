const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let w, h, score, arrows, lives, gameActive = false;
let targets = [];
let activeArrows = [];

// Image Loading Logic
let imagesLoaded = 0;
const targetImg = new Image();
targetImg.src = 'target.png';
const wolfImg = new Image();
wolfImg.src = 'wolf.png';

const startBtn = document.getElementById("startBtn");

const checkImages = () => {
    imagesLoaded++;
    if(imagesLoaded === 2) {
        startBtn.innerText = "START HUNT";
        startBtn.style.background = "#f1c40f"; // Change color when ready
    }
};

targetImg.onload = checkImages;
wolfImg.onload = checkImages;
targetImg.onerror = () => console.error("target.png missing");
wolfImg.onerror = () => console.error("wolf.png missing");

function init() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    score = 0; arrows = 10; lives = 3;
    targets = []; activeArrows = [];
    updateUI();
    for(let i=0; i < 4; i++) spawnTarget();
}

function updateUI() {
    document.getElementById("scoreText").innerText = score;
    document.getElementById("arrsText").innerText = arrows;
    document.getElementById("livesText").innerText = lives;
}

function spawnTarget() {
    const isWolf = Math.random() < 0.25; 
    const direction = Math.random() < 0.5 ? 1 : -1;
    targets.push({
        x: direction === 1 ? -60 : w + 60,
        y: 100 + Math.random() * (h * 0.4),
        isWolf: isWolf,
        radius: 40,
        speedX: (2 + Math.random() * 2.5) * direction
    });
}

// BULLETPROOF START FUNCTION
function startTheGame() {
    if(imagesLoaded < 2) {
        console.log("Still loading images...");
        return;
    }
    console.log("Game Starting...");
    document.getElementById("startMenu").style.display = "none";
    init();
    gameActive = true;
    requestAnimationFrame(gameLoop);
}

// Assign listeners directly to the button element
startBtn.addEventListener("click", startTheGame);
startBtn.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevents double-firing on some phones
    startTheGame();
}, {passive: false});

function shoot(clientX, clientY) {
    if (!gameActive || arrows <= 0) return;
    const bowX = w / 2;
    const bowY = h - 80;
    const angle = Math.atan2(clientY - bowY, clientX - bowX);
    activeArrows.push({ x: bowX, y: bowY, angle: angle, speed: 25 });
}

// Game Input
window.addEventListener("mousedown", (e) => {
    if(gameActive) shoot(e.clientX, e.clientY);
});
window.addEventListener("touchstart", (e) => {
    if(gameActive) {
        shoot(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault(); 
    }
}, {passive: false});

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, w, h);

    // Draw Bow Station
    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w/2, h-80, 60, Math.PI, 0); 
    ctx.stroke();

    // Targets Logic
    for (let i = targets.length - 1; i >= 0; i--) {
        let t = targets[i];
        t.x += t.speedX;

        if (t.x > w + 100) t.x = -100;
        if (t.x < -100) t.x = w + 100;

        const img = t.isWolf ? wolfImg : targetImg;
        // Use drawImage safely
        try {
            ctx.drawImage(img, t.x - t.radius, t.y - t.radius, t.radius*2, t.radius*2);
        } catch(e) {}
    }

    // Arrow Logic
    for (let i = activeArrows.length - 1; i >= 0; i--) {
        let a = activeArrows[i];
        a.x += Math.cos(a.angle) * a.speed;
        a.y += Math.sin(a.angle) * a.speed;

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        ctx.fillStyle = "#333";
        ctx.fillRect(0, -2, 40, 4);
        ctx.restore();

        let hit = false;
        for (let j = targets.length - 1; j >= 0; j--) {
            let t = targets[j];
            let dist = Math.hypot(a.x - t.x, a.y - t.y);

            if (dist < t.radius) {
                if (t.isWolf) lives--;
                else score += 10;
                
                updateUI();
                targets.splice(j, 1);
                spawnTarget();
                activeArrows.splice(i, 1);
                hit = true;
                break;
            }
        }

        if (!hit && (a.x > w || a.x < 0 || a.y < 0 || a.y > h)) {
            activeArrows.splice(i, 1);
            arrows--;
            updateUI();
        }
    }

    if (lives <= 0 || arrows <= 0) {
        gameActive = false;
        setTimeout(() => {
            alert(`GAME OVER\nScore: ${score}`);
            document.getElementById("startMenu").style.display = "flex";
        }, 100);
    } else {
        requestAnimationFrame(gameLoop);
    }
}
