class BasketballGame {
  constructor() {
    this.startScreen = document.getElementById("startScreen");
    this.instructionsScreen = document.getElementById("instructionsScreen");
    this.gameScreen = document.getElementById("gameScreen");
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.startGameButton = document.getElementById("startGameButton");
    this.instructionsButton = document.getElementById("instructionsButton");
    this.hideInstructionsButton = document.getElementById("hideInstructionsButton");
    this.throwStartButton = document.getElementById("throwStartButton");
    this.throwButton = document.getElementById("throwButton");
    this.restartGameButton = document.getElementById("restartGameButton");
    this.movingBar = document.getElementById("movingBar");
    this.targetArea = document.getElementById("targetArea");
    this.result = document.getElementById("result");
    this.scoreDisplay = document.getElementById("score");
    this.attemptsDisplay = document.getElementById("attempts");
    this.highScoresDisplay = document.getElementById("highScoresDisplay"); // Added high scores display element
    this.speed = 100; // Default speed
    this.difficulty = 1; // Default difficulty level
    this.lastTime; // Tracks the last frame time
    this.direction = 1; // Direction of the moving Bar: 1 for right / -1 for left
    this.moving = false; // Controls the moving state of the Bar
    this.score = 0; // Tracks the Score on successful Shots
    this.attempts = 3; // Gets decremented by 1 for every miss, reaching 0 means game over
    this.gameState = "start"; // Initial game state
    this.gameContainer = document.getElementById("gameContainer");
    this.highScores = JSON.parse(localStorage.getItem("highScores")) || []; // Initialize highScores from local storage
    this.hitSound = new Audio("./sounds/hit.mp3");
    this.missSound = new Audio("./sounds/miss.mp3");
    this.timeoutInterval;
    this.hitSound.volume = 0.2;
    this.missSound.volume = 0.2;
  }

  initialize() {
    // Set up event listeners
    this.instructionsButton.addEventListener("click", () => this.showInstructions());
    this.hideInstructionsButton.addEventListener("click", () => this.hideInstructions());
    this.restartGameButton.addEventListener("click", () => this.restartGame());
    this.throwStartButton.addEventListener("click", () => this.startMovement());
    this.throwButton.addEventListener("click", () => this.throwBall());
  }

  showInstructions() {
    this.hideScreens();
    this.instructionsScreen.style.display = "block";
    this.gameState = "instructions";
  }

  hideInstructions() {
    this.instructionsScreen.style.display = "none";
    this.startScreen.style.display = "block";
    this.gameState = "start";
  }

  startGame() {
    this.startScreen.style.display = "none";
    this.instructionsScreen.style.display = "none";
    this.gameOverScreen.style.display = "none";
    this.gameScreen.style.display = "block";
    this.gameState = "game";
    this.initializeGame();
  }

  initializeGame() {
    this.score = 0;
    this.attempts = 3;
    this.scoreDisplay.textContent = this.score;
    this.attemptsDisplay.textContent = this.attempts;
    this.direction = 1; //Otherwise after a restart the bar might start moving to the left
  }

  adjustSpeed() {
    // Adjust speed based on difficulty level
    this.speed = 100 * this.difficulty; // Adjust the speed according to the difficulty level
  }

  startMovement() {
    this.moving = true;
    this.direction = 1; // Ensure direction is set to 1 when starting movement
    this.resetMovingBarPosition();
    this.moveBar();
  }

  resetMovingBarPosition() {
    this.movingBar.style.left = "0px"; // Reset bar position to start
    this.direction = 1; // Reset direction to default (moving to the right)
    this.lastTime = null; // Reset lastTime property
  }

  moveBar(timestamp) {
    if (!this.moving) return;

    const deltaTime = timestamp - (this.lastTime || timestamp);
    const currentPosition = parseFloat(this.movingBar.style.left) || 0;
    const containerWidth = this.gameContainer.offsetWidth;
    const barWidth = this.movingBar.offsetWidth;

    let newPosition = currentPosition + (this.speed * deltaTime * this.direction) / 1000;

    const leftBoundary = 0;
    const rightBoundary = containerWidth - barWidth;

    // Check if the ball reaches the left or right boundary
    if (newPosition <= leftBoundary) {
      newPosition = leftBoundary;
      this.direction = 1;
    } else if (newPosition >= rightBoundary) {
      newPosition = rightBoundary;
      this.direction = -1;
    }

    this.movingBar.style.left = newPosition + "px";

    this.lastTime = timestamp;
    requestAnimationFrame((timestamp) => this.moveBar(timestamp));
  }

  throwBall() {
    if (!this.moving || this.attempts <= 0) return;

    this.moving = false;
    let barPosition = this.movingBar.offsetLeft + this.movingBar.offsetWidth / 2;
    let targetStart = this.targetArea.offsetLeft;
    let targetEnd = this.targetArea.offsetLeft + this.targetArea.offsetWidth;

    if (barPosition >= targetStart && barPosition <= targetEnd) {
      this.result.textContent = "You Scored!";
      this.score++;
      this.scoreDisplay.textContent = this.score;
      this.gameScreen.style.display = "none";
      document.body.style.backgroundImage = "url(./images/basketballgoal.jpg)";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center";
      this.hitSound.play();
      setTimeout(() => {
        this.gameScreen.style.display = "block";
        document.body.style.backgroundImage = "none";
      }, 1500);
    } else {
      this.result.textContent = "You missed :(";
      this.attempts--;
      this.attemptsDisplay.textContent = this.attempts;
      console.log(this.attempts);
      this.gameScreen.style.display = "none";
      document.body.style.backgroundImage = "url(./images/basketballmiss.jpg)";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center";
      this.missSound.play();
      this.timeoutInterval = setTimeout(() => {
        // if (this.attempts > 0) {
        this.gameScreen.style.display = "block";
        document.body.style.backgroundImage = "none";
        // }
      }, 1500);

      if (this.attempts === 0) {
        console.log(this.attempts);
        clearTimeout(this.timeoutInterval);
        this.gameScreen.style.display = "none";
        this.gameOverScreen.style.display = "block";
        const playerName = prompt("Game Over! Please enter a name for the Highscorelist:");
        this.handleGameOver(playerName);
      }
    }
  }

  handleGameOver(playerName) {
    // Save the score as high score
    this.saveHighScore(playerName, this.score);

    this.updateHighScoresDisplay();
    this.hideScreens();
    this.gameOverScreen.style.display = "block";
    this.moving = false;
    this.movingBar.style.left = "0px";
    const totalAttemptsTaken = 3 + this.score;
    console.log(`Final Score: ${this.score}, Total Attempts: ${totalAttemptsTaken}`);
    document.getElementById("finalScore").textContent = `Final Score: ${this.score}`;
    document.getElementById("totalAttempts").textContent = `Total Attempts: ${totalAttemptsTaken}`;
  }

  saveHighScore(playerName, score) {
    this.highScores.push({ name: playerName, score: score });
    this.highScores.sort((a, b) => b.score - a.score); // Sort descending by score
    localStorage.setItem("highScores", JSON.stringify(this.highScores));
  }

  updateHighScoresDisplay() {
    const highScoresLists = document.getElementsByClassName("highScoresList");
    for (let highScoresList of highScoresLists) {
      highScoresList.innerHTML = "";

      // Add the heading "High Scores" above the list
      const heading = document.createElement("h2");
      heading.textContent = "High Scores";
      highScoresList.appendChild(heading);

      // Iterate over the top 10 high scores or less if there are fewer scores
      for (let i = 0; i < Math.min(10, this.highScores.length); i++) {
        const entry = this.highScores[i];
        const listItem = document.createElement("li");
        listItem.textContent = `${i + 1}. ${entry.name}: ${entry.score}`;
        highScoresList.appendChild(listItem);
      }
    }
  }
  restartGame() {
    this.hideScreens(); // Hide all screens except the start screen
    this.startScreen.style.display = "block";
    this.gameState = "start"; // Set game state to start
    this.initializeGame(); // Initialize the game
    console.log("test");
  }

  hideScreens() {
    this.startScreen.style.display = "none";
    this.instructionsScreen.style.display = "none";
    this.gameScreen.style.display = "none";
    this.gameOverScreen.style.display = "none";
  }
}

// Difficulty buttons
const easyButton = document.getElementById("easyButton");
const mediumButton = document.getElementById("mediumButton");
const hardButton = document.getElementById("hardButton");

easyButton.addEventListener("click", () => {
  startGameWithDifficulty(2.5);
});

mediumButton.addEventListener("click", () => {
  startGameWithDifficulty(5);
});

hardButton.addEventListener("click", () => {
  startGameWithDifficulty(10);
});

function startGameWithDifficulty(difficulty) {
  game.difficulty = difficulty;
  game.adjustSpeed();
  game.startGame();
}

// Create an instance of the game
const game = new BasketballGame();
game.initialize();
