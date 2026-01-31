const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

const GRAVITY = 0.5;
const JUMP = -8;
const PIPE_SPEED = 4;
const PIPE_GAP = 180;
const PIPE_WIDTH = 80;

let lastTime = 0;
const targetFPS = 60;
const fpsInterval = 1000 / targetFPS;

let birdY = window.innerHeight / 2;
let velocity = 0;
let score = 0;
let pipes = [];
let frameCount = 0;
let isGameRunning = false;
let isGameOver = false;

function init() {
    resize();
    resetGame();
    requestAnimationFrame(gameLoop);
}

function createPipe() {
    const minHeight = 60;
    const maxHeight = window.innerHeight - PIPE_GAP - minHeight;
    const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe top';
    topPipe.style.height = pipeHeight + 'px';
    topPipe.style.left = window.innerWidth + 'px';
    gameContainer.appendChild(topPipe);

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe bottom';
    bottomPipe.style.height = (window.innerHeight - pipeHeight - PIPE_GAP) + 'px';
    bottomPipe.style.left = window.innerWidth + 'px';
    gameContainer.appendChild(bottomPipe);

    pipes.push({
        top: topPipe,
        bottom: bottomPipe,
        x: window.innerWidth,
        passed: false
    });
}

function resetGame() {
    birdY = window.innerHeight / 2;
    velocity = 0;
    score = 0;
    frameCount = 0;
    isGameOver = false;
    isGameRunning = false;
    
    scoreEl.innerText = score;
    messageEl.innerText = "Tap to Start";
    messageEl.style.display = 'block';
    
    pipes.forEach(p => {
        p.top.remove();
        p.bottom.remove();
    });
    pipes = [];
    
    bird.style.top = birdY + 'px';
    bird.style.transform = 'rotate(0deg)';
}

function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    if (e.type === 'pointerdown' && !e.isPrimary) return;
    
    if(e.cancelable) e.preventDefault();
    
    if (isGameOver) {
        resetGame();
        return;
    }
    
    if (!isGameRunning) {
        isGameRunning = true;
        messageEl.style.display = 'none';
        velocity = JUMP;
        return;
    }
    
    velocity = JUMP;
}

function updateLogic() {
    if (!isGameRunning || isGameOver) return;

    velocity += GRAVITY;
    birdY += velocity;

    if (birdY > window.innerHeight - bird.offsetHeight) {
        birdY = window.innerHeight - bird.offsetHeight;
        gameOver();
    }
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }

    bird.style.top = birdY + 'px';
    let rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (velocity * 0.1)));
    bird.style.transform = `rotate(${rotation}rad)`;

    if (frameCount % 90 === 0) {
        createPipe();
    }

    const birdRect = bird.getBoundingClientRect();
    const hitMargin = 6;

    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= PIPE_SPEED;
        p.top.style.left = p.x + 'px';
        p.bottom.style.left = p.x + 'px';

        if (p.x + PIPE_WIDTH < 0) {
            p.top.remove();
            p.bottom.remove();
            pipes.splice(i, 1);
            continue;
        }

        if (p.x + PIPE_WIDTH < birdRect.left && !p.passed) {
            score++;
            scoreEl.innerText = score;
            p.passed = true;
        }

        const topRect = p.top.getBoundingClientRect();
        const bottomRect = p.bottom.getBoundingClientRect();

        if (
            birdRect.right - hitMargin > topRect.left && 
            birdRect.left + hitMargin < topRect.right && 
            birdRect.top + hitMargin < topRect.bottom
        ) {
            gameOver();
        }

        if (
            birdRect.right - hitMargin > bottomRect.left && 
            birdRect.left + hitMargin < bottomRect.right && 
            birdRect.bottom - hitMargin > bottomRect.top
        ) {
            gameOver();
        }
    }
    
    frameCount++;
}

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    if (!lastTime) lastTime = timestamp;

    const elapsed = timestamp - lastTime;

    if (elapsed > fpsInterval) {
        lastTime = timestamp - (elapsed % fpsInterval);
        updateLogic();
    }
}

function gameOver() {
    isGameOver = true;
    messageEl.innerText = "Game Over\nTap to Restart";
    messageEl.style.display = 'block';
}

function resize() {
    if(!isGameRunning) birdY = window.innerHeight / 2;
}

window.addEventListener('resize', resize);
window.addEventListener('pointerdown', handleInput, { passive: false }); 
window.addEventListener('keydown', handleInput);

init();
