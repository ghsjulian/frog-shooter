const game = document.getElementById("game");
const hero = document.getElementById("hero");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const startAgain = document.querySelector(".start-again");

let heroX = window.innerWidth / 2 - 25; // center horizontally
let heroY = window.innerHeight - 70; // near bottom
hero.style.left = heroX + "px";
hero.style.top = heroY + "px";

var isGameOver = false;
let enemies = [];
let bullets = [];
let score = 0;
const enemySpeed = 1.8;

// Sounds
const shootSound = new Audio("gun-cocking-01.mp3");
const hitSound = new Audio(
    "explosion-01.mp3"
);
const gameOverSound = new Audio(
    "game-over.mp3"
);

// Touch drag for hero
let touchId = null;
game.addEventListener("touchstart", e => {
    if (isGameOver) return;
    const t = e.changedTouches[0];
    touchId = t.identifier;
    heroX = t.clientX - hero.offsetWidth / 2;
    heroY = t.clientY - hero.offsetHeight / 2;
    hero.style.left = heroX + "px";
    hero.style.top = heroY + "px";
});
game.addEventListener("touchmove", e => {
    if (isGameOver) return;
    for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
            heroX = t.clientX - hero.offsetWidth / 2;
            heroY = t.clientY - hero.offsetHeight / 2;
            heroX = Math.min(
                Math.max(heroX, 0),
                window.innerWidth - hero.offsetWidth
            );
            heroY = Math.min(
                Math.max(heroY, 0),
                window.innerHeight - hero.offsetHeight
            );
            hero.style.left = heroX + "px";
            hero.style.top = heroY + "px";
        }
    }
});
game.addEventListener("touchend", e => {
    if (isGameOver) return;
    for (let t of e.changedTouches) {
        if (t.identifier === touchId) touchId = null;
    }
});

// Spawn enemy
function spawnEnemy() {
    const enemy = document.createElement("div");
    const img = document.createElement("img");
    img.src = "frog.gif";
    enemy.classList.add("enemy");
    enemy.style.left = Math.random() * (window.innerWidth - 40) + "px";
    enemy.style.top = "-50px";
    enemy.appendChild(img);
    game.appendChild(enemy);
    enemies.push(enemy);
}

// Shoot bullet
function shootBullet() {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = heroX + hero.offsetWidth / 2 - 5 + "px";
    bullet.style.top = heroY + "px";
    game.appendChild(bullet);
    bullets.push(bullet);
    shootSound.currentTime = 0;
    shootSound.play();
}

// Update enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        const ex = enemy.offsetLeft + enemy.offsetWidth / 2;
        const ey = enemy.offsetTop + enemy.offsetHeight / 2;
        const hx = heroX + hero.offsetWidth / 2;
        const hy = heroY + hero.offsetHeight / 2;

        // Move enemy towards hero
        const dx = hx - ex;
        const dy = hy - ey;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemy.style.left = enemy.offsetLeft + (dx / dist) * enemySpeed + "px";
        enemy.style.top = enemy.offsetTop + (dy / dist) * enemySpeed + "px";

        // Collision with hero
        const er = enemy.getBoundingClientRect();
        const hr = hero.getBoundingClientRect();
        if (
            !(
                hr.right < er.left ||
                hr.left > er.right ||
                hr.bottom < er.top ||
                hr.top > er.bottom
            )
        ) {
            gameOver();
        }
    });
}

// Update bullets
function updateBullets() {
    bullets.forEach((bullet, bIndex) => {
        bullet.style.top = bullet.offsetTop - 8 + "px";
        if (bullet.offsetTop < -20) {
            bullet.remove();
            bullets.splice(bIndex, 1);
        } else {
            // Check collision with enemies
            enemies.forEach((enemy, eIndex) => {
                const er = enemy.getBoundingClientRect();
                const br = bullet.getBoundingClientRect();
                if (
                    !(
                        br.right < er.left ||
                        br.left > er.right ||
                        br.bottom < er.top ||
                        br.top > er.bottom
                    )
                ) {
                    // Blast effect
                    const blast = document.createElement("div");
                    const img = document.createElement("img");
                    img.src = "blust.gif";
                    blast.classList.add("blast");
                    blast.style.left = er.left + "px";
                    blast.style.top = er.top + "px";
                    blast.appendChild(img);
                    game.appendChild(blast);
                    setTimeout(() => blast.remove(), 300);

                    hitSound.currentTime = 0;
                    hitSound.play();

                    enemy.remove();
                    bullet.remove();
                    enemies.splice(eIndex, 1);
                    bullets.splice(bIndex, 1);

                    score += 10;
                    scoreEl.textContent = "Score: " + score;
                }
            });
        }
    });
}

// Game over
function gameOver() {
    isGameOver = true;
    hero.style.display = "none";

    gameOverEl.style.display = "flex";
    gameOverSound.play();
    enemies.forEach(e => e.remove());
    bullets.forEach(b => b.remove());
    enemies = [];
    bullets = [];
    score = 0
    cancelAnimationFrame(animationId);
}

// Touch to shoot
game.addEventListener("touchstart", () => {
    if (isGameOver) return;
    shootBullet();
});

// Start Again
startAgain.onclick = () => {
    isGameOver = false;
    scoreEl.textContent = "Scores : 0";
    hero.style.display = "block";
    gameOverEl.style.display = "none";
    gameLoop();
};

// Game loop
let animationId;
function gameLoop() {
    if (isGameOver) return;
    updateEnemies();
    updateBullets();
    animationId = requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1500);
gameLoop();
