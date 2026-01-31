const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisp = document.getElementById('score');
const livesDisp = document.getElementById('lives');
const chargesDisp = document.getElementById('charges');
const menu = document.getElementById('menu');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score, lives, gameOver = true, speedMult, shieldAngle, charges, isFullShield;
let projectiles = [], keys = {};

const shieldRadius = 130, shieldWidth = 1.2, rotSpd = 0.08;
const centerX = canvas.width / 2, centerY = canvas.height / 2;

const imgP = new Image(); imgP.src = "Poseidon.png";
const imgS = new Image(); imgS.src = "shark.png";

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') activateFullShield();
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

function activateFullShield() {
    if (charges > 0 && !isFullShield && !gameOver) {
        charges--;
        isFullShield = true;
        chargesDisp.innerText = charges;
        setTimeout(() => isFullShield = false, 3000);
    }
}

function bind(id, key, callback) {
    const el = document.getElementById(id);
    if(!el) return;

    const start = (e) => { 
        e.preventDefault(); 
        if(callback) callback(); 
        if(key) keys[key] = true; 
    };
    const stop = (e) => { 
        e.preventDefault();
        if(key) keys[key] = false; 
    };

    el.addEventListener('touchstart', start, {passive: false});
    el.addEventListener('touchend', stop, {passive: false});
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', stop);
    el.addEventListener('mouseleave', stop);
}

bind('lBtn', 'ArrowLeft');
bind('rBtn', 'ArrowRight');
bind('shieldBtn', null, activateFullShield);

document.getElementById('startBtn').onclick = () => {
    score = 0; lives = 3; charges = 3; speedMult = 1;
    projectiles = [];
    scoreDisp.innerText = 0; livesDisp.innerText = 3; chargesDisp.innerText = 3;
    shieldAngle = 0;
    gameOver = false;
    menu.style.display = 'none';
    spawn();
};

function spawn() {
    if (gameOver) return;
    const a = Math.random() * Math.PI * 2;
    const d = Math.max(canvas.width, canvas.height);
    projectiles.push({ 
        x: centerX + Math.cos(a) * d, 
        y: centerY + Math.sin(a) * d, 
        spd: (3 + Math.random() * 2) * speedMult 
    });
    setTimeout(spawn, Math.max(400, 1500 - score * 5));
}

function update() {
    if (gameOver) return;
    if (keys['ArrowLeft']) shieldAngle -= rotSpd;
    if (keys['ArrowRight']) shieldAngle += rotSpd;

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const prevDist = Math.hypot(centerX - p.x, centerY - p.y);
        const ang = Math.atan2(centerY - p.y, centerX - p.x);
        
        p.x += Math.cos(ang) * p.spd;
        p.y += Math.sin(ang) * p.spd;

        const currDist = Math.hypot(centerX - p.x, centerY - p.y);

        if (prevDist > shieldRadius && currDist <= shieldRadius) {
            const sharkAngle = Math.atan2(p.y - centerY, p.x - centerX);
            let angleDiff = sharkAngle - shieldAngle;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

            if (isFullShield || Math.abs(angleDiff) < shieldWidth / 2) {
                projectiles.splice(i, 1);
                score += 10;
                scoreDisp.innerText = score;
                if (score % 50 === 0) speedMult *= 1.05;
                continue;
            }
        }

        if (currDist < 60) {
            projectiles.splice(i, 1);
            lives--;
            livesDisp.innerText = lives;
            if (lives <= 0) { 
                gameOver = true; 
                menu.style.display = 'block'; 
            }
        }
    }
}

function draw() {
    update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(shieldAngle - Math.PI/2);
    ctx.drawImage(imgP, -75, -75, 150, 150);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, shieldRadius, isFullShield ? 0 : shieldAngle - shieldWidth/2, isFullShield ? Math.PI*2 : shieldAngle + shieldWidth/2);
    ctx.strokeStyle = isFullShield ? 'gold' : '#00f2ff';
    ctx.lineWidth = isFullShield ? 15 : 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    projectiles.forEach(p => {
        const a = Math.atan2(centerY - p.y, centerX - p.x);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(a - Math.PI/2);
        ctx.drawImage(imgS, -30, -30, 60, 60);
        ctx.restore();
    });

    requestAnimationFrame(draw);
}
draw();
