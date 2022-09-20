// delay consecutive algorithm moves for display purposes
const DELAY = false;
let WIDTH = 6;
let HEIGHT = 6;

// list of colors to choose from
const COLORS = [
  "red",
  "green",
  "blue",
  "orange",
  "purple",
  "yellow",
  "magenta",
  "lime",
  "pink",
];

document.getElementById("refresh").addEventListener("click", refresh);
const numColors = document.getElementById("numColors");
const counterElement = document.getElementById("counter");

// refresh the board
function refresh(e) {
  WIDTH = Number(document.getElementById("width").value) || WIDTH;
  HEIGHT = Number(document.getElementById("height").value) || HEIGHT;
  initializeBoard(WIDTH, HEIGHT);

  e.preventDefault();
  return false;
}

function randomColor() {
  return COLORS[
    Math.floor(Math.random() * Math.min(Number(numColors.value), COLORS.length))
  ];
}

let board;
const squares = [];
let boardElement = document.getElementById("board");

let cellCounter = 0;
let moves = 0;
let recordedMoves = [];

function initializeBoard(width, height) {
  moves = 0;
  recordedMoves = [];
  const numOfSquares = width * height;
  boardElement.style.setProperty("--width", width);

  // create additional cells
  while (squares.length < numOfSquares) {
    const d = document.createElement("div");
    d.classList.add("cell");
    boardElement.appendChild(d);
    let index = squares.length;
    d.addEventListener("click", () => clickCell(board, index, true));
    squares.push(d);
  }

  // remove additional squares
  while (squares.length > numOfSquares) {
    const d = squares.pop();
    boardElement.removeChild(d);
  }

  board = Array.from(Array(HEIGHT), () => new Array(WIDTH).fill("blue"));
  board.forEach((row, index) => {
    board[index] = row.map(() => {
      return { color: randomColor(), interactive: false };
    });
  });

  board[0][0].linked = true;
  cellCounter = 1;

  updateBoard(board, true);
}

// update board after modifications happened
function updateBoard(board, refresh) {
  updateCellsLinked(board);
  updateCellsInteractive(board);

  if (refresh) {
    updateBoardElement(board, squares);
  }
}

function updateCellsLinked(board) {
  board.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      updateCellLinked(board, cell, rowIndex, columnIndex);
    });
  });
  counterElement.innerHTML = `${cellCounter}/${
    WIDTH * HEIGHT
  } - ${moves} moves`;
  if (cellCounter >= WIDTH * HEIGHT) {
    console.log("COMPLETED");
  }
}

function updateCellLinked(board, cell, rowIndex, columnIndex) {
  if (cell.linked || cell.color !== board[0][0].color) {
    return;
  }
  cell.linked =
    board[Math.max(0, rowIndex - 1)][columnIndex].linked ||
    board[Math.min(board.length - 1, rowIndex + 1)][columnIndex].linked ||
    board[rowIndex][Math.max(0, columnIndex - 1)].linked ||
    board[rowIndex][Math.min(board[0].length - 1, columnIndex + 1)].linked;
  // check cells in left and upwards directions
  if (cell.linked) {
    cellCounter++;
    if (rowIndex > 0) {
      updateCellLinked(
        board,
        board[Math.max(0, rowIndex - 1)][columnIndex],
        rowIndex - 1,
        columnIndex
      );
    }
    if (columnIndex > 0) {
      updateCellLinked(
        board,
        board[rowIndex][Math.max(0, columnIndex - 1)],
        rowIndex,
        columnIndex - 1
      );
    }
  }
}

function updateCellsInteractive(board) {
  board.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      updateCellInteractive(board, cell, rowIndex, columnIndex);
    });
  });
}

function updateCellInteractive(board, cell, rowIndex, columnIndex) {
  if (cell.linked) {
    cell.interactive = false;
    return;
  }
  if (cell.interactive) {
    return;
  }
  cell.interactive =
    board[Math.max(0, rowIndex - 1)][columnIndex].linked ||
    board[Math.min(board.length - 1, rowIndex + 1)][columnIndex].linked ||
    board[rowIndex][Math.max(0, columnIndex - 1)].linked ||
    board[rowIndex][Math.min(board[0].length - 1, columnIndex + 1)].linked ||
    board[rowIndex][Math.min(board[0].length - 1, columnIndex + 1)].linked ||
    // chain interactive cells
    (board[Math.max(0, rowIndex - 1)][columnIndex].interactive &&
      board[Math.max(0, rowIndex - 1)][columnIndex].color === cell.color) ||
    (board[Math.min(board.length - 1, rowIndex + 1)][columnIndex].interactive &&
      board[Math.min(board.length - 1, rowIndex + 1)][columnIndex].color ===
        cell.color) ||
    (board[rowIndex][Math.max(0, columnIndex - 1)].interactive &&
      board[rowIndex][Math.max(0, columnIndex - 1)].color === cell.color) ||
    (board[rowIndex][Math.min(board[0].length - 1, columnIndex + 1)]
      .interactive &&
      board[rowIndex][Math.min(board[0].length - 1, columnIndex + 1)].color ===
        cell.color);
  // check cells in left and upwards directions
  if (cell.interactive) {
    if (rowIndex > 0) {
      updateCellInteractive(
        board,
        board[Math.max(0, rowIndex - 1)][columnIndex],
        rowIndex - 1,
        columnIndex
      );
    }
    if (columnIndex > 0) {
      updateCellInteractive(
        board,
        board[rowIndex][Math.max(0, columnIndex - 1)],
        rowIndex,
        columnIndex - 1
      );
    }
  }
}

function updateBoardElement(board, squares) {
  let i = 0;
  board.forEach((row) => {
    row.forEach((cell) => {
      squares[i].style.setProperty("--color", cell.color);
      squares[i].setAttribute("data-interactive", cell.interactive);
      i++;
    });
  });
}

function updateCellsColor(color) {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.linked) {
        cell.color = color;
      }
    });
  });
}

function clickCell(board, index, refresh) {
  recordedMoves.push(index);
  const color = squares[index].style.getPropertyValue("--color");
  moves++;
  updateCellsColor(color);
  updateBoard(board, refresh);
}

document.getElementById("solve").addEventListener("click", solveClick);
function solveClick() {
  if (!DELAY) {
    console.time("solve");
  }
  solve();
  if (!DELAY) {
    console.timeEnd("solve");
  }
}

// solve the board automatically using specified algorithm
function solve() {
  console.log(`solving using: ${document.getElementById("select").value}`);
  const index = algorithm[document.getElementById("select").value](board);
  if (isNaN(index)) {
    if (!DELAY) {
      updateBoard(true);
    }
    return;
  }

  clickCell(board, index, DELAY);
  if (DELAY) {
    setTimeout(solve, 1000);
  } else {
    solve();
  }
}

const algorithm = {
  random: function (board) {
    let interactives = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell.interactive) {
          interactives.push(rowIndex * WIDTH + columnIndex);
        }
      });
    });
    if (!interactives.length) {
      return;
    }
    return interactives[Math.floor(Math.random() * interactives.length)];
  },
  greedy: function (board) {
    let interactives = {};
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell.interactive) {
          if (!interactives[cell.color]) {
            interactives[cell.color] = {
              index: rowIndex * WIDTH + columnIndex,
              count: 1,
            };
          } else {
            interactives[cell.color].count++;
          }
        }
      });
    });
    if (!Object.values(interactives).length) {
      return;
    }
    let biggest = Object.values(interactives)[0];
    Object.values(interactives).forEach((active) => {
      if (active.count > biggest.count) {
        biggest = active;
      }
    });
    return biggest.index;
  },
  shaker: function () {
    // use another algorithm, and shake a bit to see if improves or not
    // not with random, useless
  },
};

initializeBoard(WIDTH, HEIGHT);
