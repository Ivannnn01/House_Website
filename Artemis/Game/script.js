const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let w, h, score, arrows, lives, gameActive = false;
let targets = [];
let activeArrows = [];

// MISSING VARIABLES FIXED: Track last input for bow rotation
let lastInputX = window.innerWidth / 2;
let lastInputY = 0;

let imagesLoaded = 0;
const totalImages = 3; // target, wolf, bow

const checkImages = () => {
    imagesLoaded++;
    if(imagesLoaded === totalImages) {
        startBtn.innerText = "START HUNT";
        startBtn.style.background = "#f1c40f";
        startBtn.style.color = "#000";
    }
};

const targetImg = new Image();
targetImg.onload = checkImages;
targetImg.src = 'target.png';

const wolfImg = new Image();
wolfImg.onload = checkImages;
wolfImg.src = 'wolf.png';

const bowImg = new Image();
bowImg.onload = checkImages;
bowImg.src = 'bow.png';

const startBtn = document.getElementById("startBtn");

function init() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    score = 0; 
    arrows = 10; 
    lives = 3;
    targets = []; 
    activeArrows = [];
    updateUI();
    for(let i=0; i < 4; i++) spawnTarget();
}

function updateUI() {
    document.getElementById("scoreText").innerText = score;
    document.getElementById("arrsText").innerText = arrows;
    document.getElementById("livesText").innerText = lives;
}

function spawnTarget() {
    let isWolf;
    const wolfCount = targets.filter(t => t.isWolf).length;
    const targetCount = targets.filter(t => !t.isWolf).length;

    if (wolfCount === 0 && targets.length > 0) {
        isWolf = true;
    } else if (targetCount === 0 && targets.length > 0) {
        isWolf = false;
    } else {
        isWolf = Math.random() < 0.25; 
    }

    const direction = Math.random() < 0.5 ? 1 : -1;
    targets.push({
        x: direction === 1 ? -60 : w + 60,
        y: 100 + Math.random() * (h * 0.4),
        isWolf: isWolf,
        radius: 40,
        speedX: (2 + Math.random() * 2.5) * direction
    });
}

function startTheGame() {
    if(imagesLoaded < totalImages) {
        console.log("Still loading images...");
        return;
    }
    document.getElementById("startMenu").style.display = "none";
    init();
    gameActive = true;
    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", startTheGame);

function shoot(clientX, clientY) {
    if (!gameActive || arrows <= 0) return;
    

    arrows--; 
    updateUI();

    const bowX = w / 2;
    const bowY = h - 80;
    const angle = Math.atan2(clientY - bowY, clientX - bowX);
    activeArrows.push({ x: bowX, y: bowY, angle: angle, speed: 25 });
}


window.addEventListener("mousemove", (e) => {
    lastInputX = e.clientX;
    lastInputY = e.clientY;
});

window.addEventListener("mousedown", (e) => {
    if(gameActive) shoot(e.clientX, e.clientY);
});

window.addEventListener("touchstart", (e) => {
    lastInputX = e.touches[0].clientX;
    lastInputY = e.touches[0].clientY;
    if(gameActive) {
        shoot(lastInputX, lastInputY);
    }
}, {passive: false});

window.addEventListener("touchmove", (e) => {
    lastInputX = e.touches[0].clientX;
    lastInputY = e.touches[0].clientY;
    if(gameActive) e.preventDefault(); 
}, {passive: false});


function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, w, h);

    const bowX = w / 2;
    const bowY = h - 80;
    

    let aimAngle = Math.atan2(lastInputY - bowY, lastInputX - bowX);
    

    ctx.save();
    ctx.translate(bowX, bowY);
    ctx.rotate(aimAngle + Math.PI / 2); 
    try {
        ctx.drawImage(bowImg, -40, -40, 80, 80); 
    } catch(e) {}
    ctx.restore();

    for (let i = targets.length - 1; i >= 0; i--) {
        let t = targets[i];
        t.x += t.speedX;

        if (t.x > w + 100) t.x = -100;
        if (t.x < -100) t.x = w + 100;

        const img = t.isWolf ? wolfImg : targetImg;
        try {
            ctx.drawImage(img, t.x - t.radius, t.y - t.radius, t.radius*2, t.radius*2);
        } catch(e) {}
    }


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
                if (t.isWolf) {
                    lives--;
                } else {
                    score += 10;
                }
                
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
        }
    }


    if (lives <= 0 || (arrows <= 0 && activeArrows.length === 0)) {
        gameActive = false;
        setTimeout(() => {
            alert(`GAME OVER\nScore: ${score}`);
            document.getElementById("startMenu").style.display = "flex";
        }, 100);
    } else {
        requestAnimationFrame(gameLoop);
    }
}
