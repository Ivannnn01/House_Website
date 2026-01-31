const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

let birdY = window.innerHeight / 2;
let velocity = 0;
let gravity = 0.4;
let jump = -6.5;
let isGameOver = false;
let isGameStarted = false;
let score = 0;
let pipeSpeed = 3;
let pipeGap = 180;
let pipes = [];
let frameCount = 0;
let animationId;

const PIPE_WIDTH = 85; 

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (window.innerHeight - pipeGap - 100)) + 50;
    
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe top';
    topPipe.style.height = pipeHeight + 'px';
    topPipe.style.left = window.innerWidth + 'px';
    gameContainer.appendChild(topPipe);

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe bottom';
    bottomPipe.style.height = (window.innerHeight - pipeHeight - pipeGap) + 'px';
    bottomPipe.style.left = window.innerWidth + 'px';
    gameContainer.appendChild(bottomPipe);

    pipes.push({
        top: topPipe,
        bottom: bottomPipe,
        x: window.innerWidth,
        passed: false
    });
}

function update() {
    if (!isGameStarted || isGameOver) {
        if (!isGameOver) animationId = requestAnimationFrame(update);
        return;
    }

    velocity += gravity;
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

    if (frameCount % 120 === 0) {
        createPipe();
    }

    const birdRect = bird.getBoundingClientRect();

    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        p.x -= pipeSpeed;
        p.top.style.left = p.x + 'px';
        p.bottom.style.left = p.x + 'px';

        if (p.x + PIPE_WIDTH < 0) {
            p.top.remove();
            p.bottom.remove();
            pipes.shift();
            i--;
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
            birdRect.left < topRect.right &&
            birdRect.right > topRect.left &&
            birdRect.top < topRect.bottom
        ) {
            gameOver();
        }

        if (
            birdRect.left < bottomRect.right &&
            birdRect.right > bottomRect.left &&
            birdRect.bottom > bottomRect.top
        ) {
            gameOver();
        }
    }

    frameCount++;
    animationId = requestAnimationFrame(update);
}

function gameOver() {
    isGameOver = true;
    messageEl.innerText = "Game Over\nTap to Restart";
    messageEl.style.display = 'block';
}

function resetGame() {
    isGameOver = false;
    isGameStarted = false;
    score = 0;
    frameCount = 0;
    velocity = 0;
    birdY = window.innerHeight / 2;
    scoreEl.innerText = 0;
    messageEl.innerText = "Tap to Start";
    
    pipes.forEach(p => {
        p.top.remove();
        p.bottom.remove();
    });
    pipes = [];
    
    bird.style.top = birdY + 'px';
    
    cancelAnimationFrame(animationId);
    update();
}

function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    
    if (isGameOver) {
        resetGame();
        return;
    }
    
    if (!isGameStarted) {
        isGameStarted = true;
        messageEl.style.display = 'none';
    }
    
    velocity = jump;
}

window.addEventListener('pointerdown', handleInput);
window.addEventListener('keydown', handleInput);
window.addEventListener('resize', () => {
    birdY = window.innerHeight / 2;
});

update();