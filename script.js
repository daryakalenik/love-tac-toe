const GAME_CONFIG = {
  PLAYERS: {
    HUMAN: {
      symbol: "X",
      icon: "./assets/player1.png",
      label: "YOU",
    },
    COMPUTER: {
      symbol: "O",
      icon: "./assets/player2.png",
      label: "ME",
    },
  },
  MESSAGES: {
    TURN: {
      HUMAN: "your turn!",
      COMPUTER: "thinking...",
    },
    RESULTS: {
      WIN: {
        title: "you won!",
        body: "your prize is a free valentine's date with me",
        button: "claim",
        image: "./assets/win.gif",
      },
      LOSS: {
        title: "you lost!",
        body: "don't worry - i'll take you out on a valentine's date",
        button: "okay :3",
        image: "./assets/loss.gif",
      },
      DRAW: {
        title: "it's a tie!",
        body: "well... guess we need that date to break the tie",
        button: "deal",
        image: "./assets/draw.gif",
      },
    },
  },
  WIN_PATTERNS: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ],
};

const gameState = {
  board: Array(9).fill(""),
  currentPlayer: GAME_CONFIG.PLAYERS.HUMAN.symbol,
  isActive: false,
  isComputerThinking: false,
};

const elements = {
  board: document.querySelector(".board"),
  status: document.querySelector(".playground__status"),
  startButton: document.querySelector(".btn--start"),
  welcome: document.querySelector(".welcome"),
  playground: document.querySelector(".playground"),
  info: document.querySelector(".info"),
  windowControls: {
    minimize: document.querySelector(".btn--minimize"),
    close: document.querySelector(".btn--close"),
  },
};

elements.windowControls.minimize.addEventListener("click", () =>
    window.electronAPI.minimizeWindow()
);
elements.windowControls.close.addEventListener("click", () =>
    window.electronAPI.closeWindow()
);
elements.startButton.addEventListener("click", startGame);


function createIcon(player) {
  const icon = document.createElement("img");
  const playerConfig =
      player === GAME_CONFIG.PLAYERS.HUMAN.symbol
          ? GAME_CONFIG.PLAYERS.HUMAN
          : GAME_CONFIG.PLAYERS.COMPUTER;

  icon.src = playerConfig.icon;
  icon.classList.add("icon");
  return icon;
}

function startGame() {
  elements.welcome.style.display = "none";
  elements.playground.style.display = "flex";
  elements.info.style.flexFlow = "row nowrap";
  gameState.isActive = true;

  createGameBoard();
  createPlayerInfo();
  updateGameStatus(GAME_CONFIG.MESSAGES.TURN.HUMAN);
}

function createGameBoard() {
  elements.board.innerHTML = "";
  gameState.board.forEach((_, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = index;
    cell.addEventListener("click", handleCellClick);
    elements.board.appendChild(cell);
  });
}

function createPlayerInfo() {
  elements.info.innerHTML = Object.values(GAME_CONFIG.PLAYERS)
      .map(
          (player) => `
        <div class="player">
          <img src="${player.icon}" class="icon" alt="${player.label}">
          <p>${player.label}</p>
        </div>
      `
      )
      .join("");
}

function handleCellClick(event) {
  const index = event.target.dataset.index;

  if (
      !gameState.isActive ||
      gameState.isComputerThinking ||
      gameState.currentPlayer === GAME_CONFIG.PLAYERS.COMPUTER.symbol ||
      gameState.board[index]
  ) {
    return;
  }

  makeMove(index, GAME_CONFIG.PLAYERS.HUMAN.symbol);
  if (gameState.isActive) {
    computerMove();
  }
}

function makeMove(index, player) {
  gameState.board[index] = player;
  const cell = document.querySelector(`.cell[data-index="${index}"]`);
  cell.appendChild(createIcon(player));

  checkGameStatus();
}

function computerMove() {
  const timeout = Math.floor(Math.random() * 3000 + 1000);
  gameState.isComputerThinking = true;
  updateGameStatus(GAME_CONFIG.MESSAGES.TURN.COMPUTER);

  setTimeout(() => {
    const emptyIndexes = gameState.board
        .map((cell, index) => (cell === "" ? index : null))
        .filter((index) => index !== null);

    if (emptyIndexes.length > 0) {
      const randomIndex =
          emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
      makeMove(randomIndex, GAME_CONFIG.PLAYERS.COMPUTER.symbol);
    }

    if (gameState.isActive) {
      updateGameStatus(GAME_CONFIG.MESSAGES.TURN.HUMAN);
    }
    gameState.isComputerThinking = false;
  }, timeout);
}

function checkGameStatus() {
  for (const pattern of GAME_CONFIG.WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (
        gameState.board[a] &&
        gameState.board[a] === gameState.board[b] &&
        gameState.board[a] === gameState.board[c]
    ) {
      endGame(gameState.board[a]);
      return;
    }
  }

  if (!gameState.board.includes("")) {
    endGame("draw");
  }
}

function endGame(result) {
  gameState.isActive = false;
  const resultConfig =
      result === GAME_CONFIG.PLAYERS.HUMAN.symbol
          ? GAME_CONFIG.MESSAGES.RESULTS.WIN
          : result === GAME_CONFIG.PLAYERS.COMPUTER.symbol
              ? GAME_CONFIG.MESSAGES.RESULTS.LOSS
              : GAME_CONFIG.MESSAGES.RESULTS.DRAW;

  showGameResult(resultConfig);
}

function showGameResult(resultConfig) {
  elements.status.textContent = resultConfig.title;
  elements.board.innerHTML = `<img src="${resultConfig.image}" class="gif">`;
  elements.info.innerHTML = `
    <p>${resultConfig.body}</p>
    <button class="btn btn--finish">${resultConfig.button}</button>
  `;
  elements.info.style.flexFlow = "column nowrap";

  const resultButton = elements.info.querySelector(".btn--finish");
  resultButton.addEventListener("click", openCoupon);
}

function openCoupon() {
  const couponContainer = document.createElement("div");
  couponContainer.className = "coupon-container";
  couponContainer.innerHTML = `
    <img src="./assets/ticket.png" class="coupon"/>
    <button class="btn btn--reset">reset</button>
  `;

  document.body.appendChild(couponContainer);

  const resetButton = couponContainer.querySelector(".btn--reset");
  resetButton.addEventListener("click", () => {
    resetGame();
    document.body.removeChild(couponContainer);
  });
}

function resetGame() {
  Object.assign(gameState, {
    board: Array(9).fill(""),
    currentPlayer: GAME_CONFIG.PLAYERS.HUMAN.symbol,
    isActive: false,
    isComputerThinking: false,
  });
  startGame();
}

function updateGameStatus(message) {
  elements.status.textContent = message;
}
