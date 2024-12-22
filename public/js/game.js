// Colors
const black = "#432E54";
const navy = "#4B4376";
const maroon = "#AE445A";
const peach = "#E8BCB9";
const MIN_SPEED = 1;
let MAX_SPEED = 1;

const $gameOverlay = document.getElementById("game-overlay");
const $score = document.getElementById("score");
const $gameOver = document.getElementById("game-over");
const $finalScore = document.getElementById("final-score");

class Puddle {
    constructor() {
        this.puddleHeight = 0;
    }

    display() {
        push();
        fill(peach);
        rect(0, height - this.puddleHeight, width, this.puddleHeight);
        pop();
    }

    addDrop() {
        this.puddleHeight++;
    }
}

class Catcher {
    constructor(radius) {
        this.radius = radius;
    }

    updatePosition(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }

    display() {
        push();
        fill(maroon);
        strokeWeight(2);
        stroke(peach);
        circle(this.posX, this.posY, this.radius * 2);
        pop();
    }

    intersectsCircle(otherCircle) {
        return (
            dist(this.posX, this.posY, otherCircle.posX, otherCircle.posY) <=
            this.radius + otherCircle.radius
        );
    }
}

class RainDrop {
    constructor(minSpeed, maxSpeed) {
        console.log("Constructor called with min speed", minSpeed, "and max speed", maxSpeed);
        this.radius = 8;
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.randomizeDrop();
    }

    randomizeDrop() {
        this.posX = random(this.radius, width - this.radius);
        this.posY = -this.radius * 4;
        this.xSpeed = random(-0.1, 0.1);
        console.log("Drop properties, min speed", this.minSpeed, "and max speed", this.maxSpeed);

        this.ySpeed = random(this.minSpeed, this.maxSpeed);
    }

    display() {
        push();
        fill(peach);
        noStroke();
        for (let i = 0; i <= this.radius; i++) {
            circle(
                this.posX,
                this.posY - i * ((this.ySpeed / this.maxSpeed) * 4),
                this.radius * 2 - i * 2
            );
        }
        pop();
    }

    move() {
        this.posX += this.xSpeed;
        this.posY += this.ySpeed;
    }

    reachedBottom(puddle) {
        return this.posY >= height - puddle.puddleHeight - this.radius * 4;
    }
}

class Timer {
    constructor(totalTime) {
        this.totalTime = totalTime;
        this.startTime = millis();
    }

    start() {
        this.startTime = millis();
    }

    hasFinished() {
        return millis() - this.startTime >= this.totalTime;
    }
}

let catcher = null;
let drops = [];
let timer = null;
let puddle = null;
let score = 0;
let isGameOver = false;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("sketch-holder");
    catcher = new Catcher(32);
    timer = new Timer(5000); // Adjust the spawn time if needed
    puddle = new Puddle();
    initGame();
}

function initGame() {
    drops = [];
    puddle.puddleHeight = 0;
    MAX_SPEED = 1;
    score = 0;
    $gameOverlay.style.display = "block"
    $gameOver.style.display = "none";
    if($score)
        $score.textContent = 0;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function gameOver() {
    $gameOverlay.style.display = "none";
    $gameOver.style.display = "block";
    $finalScore.textContent = score;
}

function draw() {
    background(black);

    if(isGameOver) {
        gameOver();
        return;
    }

    catcher.updatePosition(mouseX, mouseY);
    catcher.display();

    if (timer.hasFinished()) {
        console.log("Creating new drop with min speed", MIN_SPEED, "and max speed", MAX_SPEED);
        drops.push(new RainDrop(MIN_SPEED, MAX_SPEED));
        MAX_SPEED = Math.log2(drops.length);
        console.log(MAX_SPEED)
        timer.start();
    }

    drops.forEach((drop) => {
        drop.move();
        drop.display();

        if (drop.reachedBottom(puddle)) {
            drop.randomizeDrop();
            puddle.addDrop();
        }

        if (catcher.intersectsCircle(drop)) {
            drop.randomizeDrop();
            score++;
            if($score)
                $score.textContent = score;
        }
    });

    puddle.display();
    if(puddle.puddleHeight >= height) {
        isGameOver = true;
    }
}