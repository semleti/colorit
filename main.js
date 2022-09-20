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
  WIDTH = Math.max(Number(document.getElementById("width").value) || WIDTH, 1);
  HEIGHT = Math.max(
    Number(document.getElementById("height").value) || HEIGHT,
    1
  );
  initializeBoard(WIDTH, HEIGHT);

  e.preventDefault();
  return false;
}

function randomColor() {
  return COLORS[
    Math.floor(
      Math.random() *
        Math.min(Math.max(Number(numColors.value) || 1, 1), COLORS.length)
    )
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

function updateCellsColor(board, color) {
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.linked) {
        cell.color = color;
      }
    });
  });
}

function clickCell(board, index, refresh, record = true) {
  if (record) {
    recordedMoves.push(index);
  }
  const color = getBoardColor(board, index);
  moves++;
  updateCellsColor(board, color);
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
      updateBoard(board, true);
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
  // use another algorithm, and shake a bit to see if improves or not
  // not with random, useless
  shaker: function (board) {
    const algo1 = "greedy";
    const boardCopy = JSON.parse(JSON.stringify(board));
    const boardCopy2 = JSON.parse(JSON.stringify(board));

    // first normal pass
    const recordedMoves = runAlgorithm(boardCopy, algo1);

    const copiedRecordedMoves = JSON.parse(JSON.stringify(recordedMoves));
    const boardReplayCopy = JSON.parse(JSON.stringify(board));

    // try repeatedOptimizations
    const newRecordedMoves = testRepeatedOptimizations(
      boardReplayCopy,
      copiedRecordedMoves,
      algo1
    );

    // display results, first improved, then original
    if (DELAY && copiedRecordedMoves.length > newRecordedMoves.length) {
      let i = 0;
      function app() {
        clickCell(board, newRecordedMoves[i], true, true);
        i++;
        if (i < newRecordedMoves.length) {
          setTimeout(app, 1000);
        } else {
          setTimeout(() => {
            for (let j = 0; j < board.length; j++) {
              board[j] = boardCopy2[j];
            }
            i = 0;
            app();
          }, 5000);
        }
      }
      app();
    }

    // each move, try something else and keep the better one
    // for (
    //   let moveNumber = 1;
    //   moveNumber < copiedRecordedMoves.length;
    //   moveNumber++
    // ) {
    //   for (let i = 0; i < moveNumber; i++) {
    //     clickCell(boardReplayCopy, copiedRecordedMoves[i], DELAY, false);
    //   }
    //   runAlgorithm(boardCopy, algo1);
    // }
  },
};

// run an algorithm given a specified board state
function runAlgorithm(board, algo, refresh) {
  const moves = [];
  while (true) {
    const index = algorithm[algo](board);
    if (isNaN(index)) {
      break;
    }
    moves.push(index);
    clickCell(board, index, refresh, false);
  }
  return moves;
}

// check if there are repeats like: caba and see if cba is better
function testRepeatedOptimizations(board, recordedMoves, algorithm) {
  let newRecordedMoves = [];
  for (
    let moveNumber = 0;
    moveNumber + 2 < recordedMoves.length;
    moveNumber++
  ) {
    const boardCopy = JSON.parse(JSON.stringify(board));
    if (
      getBoardColor(boardCopy, recordedMoves[moveNumber]) ===
      getBoardColor(boardCopy, recordedMoves[moveNumber + 2])
    ) {
      console.log("same: ", moveNumber);
      for (let i = 0; i < moveNumber; i++) {
        clickCell(boardCopy, recordedMoves[i], false);
        newRecordedMoves.push(recordedMoves[i]);
      }
      clickCell(boardCopy, recordedMoves[moveNumber + 1], false);
      newRecordedMoves.push(recordedMoves[moveNumber + 1]);
      newRecordedMoves = newRecordedMoves.concat(
        runAlgorithm(boardCopy, algorithm, false)
      );
      if (newRecordedMoves.length < recordedMoves.length) {
        console.log("smaller");
        recordedMoves = newRecordedMoves;
      }
    }
  }
  return recordedMoves;
}

function getBoardColor(board, index) {
  return board[Math.floor(index / WIDTH)][index % WIDTH].color;
}

initializeBoard(WIDTH, HEIGHT);
