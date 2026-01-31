let move_speed = 3; 
let gravity = 0.5;
let bird = document.querySelector('.bird');
let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let game_state = 'Start';
let bird_dy = 0;
let pipe_seperation = 0;
let pipe_gap = 35; 
let animationId; 

function handleInput() {
    if (game_state === 'Start' || game_state === 'End') {
        startGame();
    } else if (game_state === 'Play') {
        bird_dy = -7.6;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') handleInput();
});

document.addEventListener('touchstart', (e) => {
    if(e.cancelable) e.preventDefault(); 
    handleInput();
}, { passive: false });

document.addEventListener('mousedown', (e) => {
    if (e.button === 0) handleInput();
});

function startGame() {
    if (animationId) cancelAnimationFrame(animationId);

    game_state = 'Play';
    bird_dy = 0;
    pipe_seperation = 0;
    score_val.innerHTML = '0';
    message.innerHTML = '';
    score_title.innerHTML = 'Score : ';
    
    bird.style.top = '40vh';

    document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());

    requestAnimationFrame(gameLoop);
}

function gameLoop() {

    if (game_state !== 'Play') return;

    let bird_props = bird.getBoundingClientRect();
    

    bird_dy += gravity;
    

    if (bird_props.top <= 0 || bird_props.bottom >= window.innerHeight) {
        endGame();
        return; 
    }
    
    bird.style.top = (bird_props.top + bird_dy) + 'px';


    let pipe_sprites = document.querySelectorAll('.pipe_sprite');
    pipe_sprites.forEach((element) => {
        let pipe_props = element.getBoundingClientRect();
        let bird_current_props = bird.getBoundingClientRect();


        let hPad = 25; 
        let vPad = 15;


        if (
            bird_current_props.left + hPad < pipe_props.left + pipe_props.width &&
            bird_current_props.left + bird_current_props.width - hPad > pipe_props.left &&
            bird_current_props.top + vPad < pipe_props.top + pipe_props.height &&
            bird_current_props.top + bird_current_props.height - vPad > pipe_props.top
        ) {
            endGame();
            return;
        }


        if (pipe_props.right <= 0) {
            element.remove();
        } else {

            if (
                pipe_props.right < bird_current_props.left && 
                pipe_props.right + move_speed >= bird_current_props.left && 
                element.increase_score === '1'
            ) {
                score_val.innerHTML = parseInt(score_val.innerHTML) + 1;
                element.increase_score = '0'; // Prevent double scoring
            }
            element.style.left = (pipe_props.left - move_speed) + 'px';
        }
    });

    if (pipe_seperation > 115) {
        pipe_seperation = 0;
        let pipe_posi = Math.floor(Math.random() * 43) + 8;
        let pipe_inv = document.createElement('div');
        pipe_inv.className = 'pipe_sprite pipe_inv';
        pipe_inv.style.top = (pipe_posi - 70) + 'vh';
        pipe_inv.style.left = '100vw';
        document.body.appendChild(pipe_inv);


        let pipe = document.createElement('div');
        pipe.className = 'pipe_sprite';
        pipe.style.top = (pipe_posi + pipe_gap) + 'vh';
        pipe.style.left = '100vw';
        pipe.increase_score = '1';
        document.body.appendChild(pipe);
    }
    pipe_seperation++;
    animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    game_state = 'End';
    message.innerHTML = 'Game Over!<br>Tap to Restart';
    animationId = null; 
}
