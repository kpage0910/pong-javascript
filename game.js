const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Audio
const bounceSound = new Audio("sounds/bounce-sound.wav");
bounceSound.volume = 0.5;
const scoreSound = new Audio("sounds/score_sound.wav");
scoreSound.volume = 0.5;
const gameOverSound = new Audio("sounds/game_over.wav");
gameOverSound.volume = 0.5;

// Game constants
const BALL_RADIUS = 10;
const BALL_INITIAL_SPEED = 2.3;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_OFFSET = 30;
const PLAYER_PADDLE_SPEED = 3;
const COMPUTER_PADDLE_SPEED = 2;
const WINNING_SCORE = 10;

// Ball state
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = BALL_INITIAL_SPEED;
let dy = BALL_INITIAL_SPEED;

// Paddle state
let computerPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let playerPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;

// Input state
let upPressed = false;
let downPressed = false;

// Game state
let playerScore = 0;
let computerScore = 0;
let gameState = "start"; // "start", "playing", "gameover"

// Event listeners
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
canvas.addEventListener("click", handleCanvasClick);

function handleKeyDown(e) {
  if (e.key === "ArrowUp") upPressed = true;
  if (e.key === "ArrowDown") downPressed = true;
}

function handleKeyUp(e) {
  if (e.key === "ArrowUp") upPressed = false;
  if (e.key === "ArrowDown") downPressed = false;
}

function handleCanvasClick() {
  if (gameState === "start") {
    startGame();
  } else if (gameState === "gameover") {
    resetGame();
  }
}

function startGame() {
  gameState = "playing";
  update();
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
  resetBall();
  playerPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
  computerPaddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
  gameState = "playing";
  update();
}

function resetBall() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  dx = BALL_INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  dy = BALL_INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function drawPaddles() {
  ctx.fillStyle = "white";

  // Left paddle (computer)
  ctx.fillRect(PADDLE_OFFSET, computerPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Right paddle (player)
  ctx.fillRect(
    canvas.width - PADDLE_WIDTH - PADDLE_OFFSET + 5,
    playerPaddleY,
    PADDLE_WIDTH,
    PADDLE_HEIGHT
  );
}

function drawNet() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  const dashHeight = 15;
  const gap = 10;
  for (let y = 0; y < canvas.height; y += dashHeight + gap) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, y);
    ctx.lineTo(canvas.width / 2, y + dashHeight);
    ctx.stroke();
  }
}

function drawScores() {
  ctx.font = "48px 'Arcade Classic', Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  // Player score (right side)
  ctx.fillText(playerScore, canvas.width / 2 + 60, 60);
  // Computer score (left side)
  ctx.fillText(computerScore, canvas.width / 2 - 60, 60);
}

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "60px 'Arcade Classic', Arial";
  ctx.textAlign = "center";
  ctx.fillText("PONG", canvas.width / 2, canvas.height / 2 - 50);

  ctx.font = "30px 'Arcade Classic', Arial";
  ctx.fillText("Click to Start", canvas.width / 2, canvas.height / 2 + 20);

  ctx.font = "20px 'Arcade Classic', Arial";
  ctx.fillText(
    "Use Arrow Keys to Move Paddle",
    canvas.width / 2,
    canvas.height / 2 + 80
  );
  ctx.fillText("First to 10 Wins", canvas.width / 2, canvas.height / 2 + 110);
}

function drawBall() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, 2 * Math.PI);
  ctx.fill();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawPaddles();
  drawScores();
  drawBall();
}

function checkGameOver() {
  if (playerScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
    render();
    ctx.font = "48px 'Arcade Classic', Arial";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.fillText(
      playerScore === WINNING_SCORE ? "Player Wins!" : "Computer Wins!",
      canvas.width / 2,
      canvas.height / 2 - 30
    );
    ctx.font = "30px 'Arcade Classic', Arial";
    ctx.fillStyle = "white";
    ctx.fillText(
      "Click to Play Again",
      canvas.width / 2,
      canvas.height / 2 + 30
    );
    playSound(gameOverSound);
    gameState = "gameover";
    return true;
  }
  return false;
}

function updateBallPosition() {
  x += dx;
  y += dy;
}

function checkWallCollision() {
  if (y + BALL_RADIUS > canvas.height || y - BALL_RADIUS < 0) {
    dy = -dy;
    playSound(bounceSound);
  }
}

function checkPaddleCollision() {
  const rightPaddleX = canvas.width - PADDLE_WIDTH - PADDLE_OFFSET + 5;
  const leftPaddleX = PADDLE_OFFSET;

  // Player paddle collision (right)
  if (
    dx > 0 &&
    x + BALL_RADIUS > rightPaddleX &&
    x + BALL_RADIUS < canvas.width - PADDLE_OFFSET + 5 &&
    y + BALL_RADIUS > playerPaddleY &&
    y - BALL_RADIUS < playerPaddleY + PADDLE_HEIGHT
  ) {
    dx = -dx;
    x = rightPaddleX - BALL_RADIUS;
    playSound(bounceSound);
  }

  // Computer paddle collision (left)
  if (
    dx < 0 &&
    x - BALL_RADIUS < leftPaddleX + PADDLE_WIDTH &&
    x - BALL_RADIUS > leftPaddleX &&
    y + BALL_RADIUS > computerPaddleY &&
    y - BALL_RADIUS < computerPaddleY + PADDLE_HEIGHT
  ) {
    dx = -dx;
    x = leftPaddleX + PADDLE_WIDTH + BALL_RADIUS;
    playSound(bounceSound);
  }
}

function checkScore() {
  // Ball goes past right paddle (player misses)
  if (x + BALL_RADIUS > canvas.width) {
    computerScore++;
    playSound(scoreSound);
    resetBall();
  }

  // Ball goes past left paddle (computer misses)
  if (x - BALL_RADIUS < 0) {
    playerScore++;
    playSound(scoreSound);
    resetBall();
  }
}

function updatePlayerPaddle() {
  if (upPressed) {
    playerPaddleY -= PLAYER_PADDLE_SPEED;
    if (playerPaddleY < 0) playerPaddleY = 0;
  }
  if (downPressed) {
    playerPaddleY += PLAYER_PADDLE_SPEED;
    if (playerPaddleY + PADDLE_HEIGHT > canvas.height) {
      playerPaddleY = canvas.height - PADDLE_HEIGHT;
    }
  }
}

function updateComputerPaddle() {
  const targetY = y;

  if (targetY < computerPaddleY + PADDLE_HEIGHT / 2) {
    computerPaddleY -= COMPUTER_PADDLE_SPEED;
    if (computerPaddleY < 0) computerPaddleY = 0;
  } else if (targetY > computerPaddleY + PADDLE_HEIGHT / 2) {
    computerPaddleY += COMPUTER_PADDLE_SPEED;
    if (computerPaddleY + PADDLE_HEIGHT > canvas.height) {
      computerPaddleY = canvas.height - PADDLE_HEIGHT;
    }
  }
}

function update() {
  if (gameState !== "playing") return;

  if (checkGameOver()) return;

  updateBallPosition();
  checkWallCollision();
  checkPaddleCollision();
  checkScore();
  updatePlayerPaddle();
  updateComputerPaddle();

  render();
  requestAnimationFrame(update);
}

// Show start screen
drawStartScreen();
