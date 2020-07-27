const Launchpad = require('launchpad-mini');
const pad = new Launchpad();

const SIZE = 8;
let start = true;
let speed = 500;

let grid = rand();
let copyGrid = clearGrid();

gameLoop();

async function gameLoop() {
  await pad.connect();

  while (true) {
    await frame();

    if (start) {
      copyGrid = clearGrid();
      gameLogic();
      grid = copyGrid;
      pad.reset(0);
      pad.col(pad.red, pad.fromPattern(printGrid()));
    }
    pad.setColors([
      [0, 8, start ? Launchpad.Colors.green : Launchpad.Colors.red],
      [1, 8, Launchpad.Colors.amber],
      [2, 8, Launchpad.Colors.amber],
      [7, 8, Launchpad.Colors.yellow]
    ]);
  }
}

pad.on('key', k => {
  //start stop
  if (k.x === 0 && k.y === 8 && k.pressed) {
    start = !start;
  }
  //clear
  if (k.x === 3 && k.y === 8 && k.pressed) {
    grid = clearGrid()
    if (!start) {
      pad.col(pad.red, pad.fromPattern(printGrid()));
    }
  }
  //slow
  if (k.x === 2 && k.y === 8 && k.pressed) {
    speed = speed - 200;
  }
  //speed
  if (k.x === 1 && k.y === 8 && k.pressed) {
    speed = speed + 200;
  }
  //rand
  if (k.x === 7 && k.y === 8 && k.pressed) {
    grid = rand();
    pad.reset(0);
    pad.col(pad.red, pad.fromPattern(printGrid()));
  }

  if (k.x < 8 && k.y < 8 && k.pressed) {

    if (grid[k.x][k.y] === 1) {
      grid[k.x][k.y] = 0;
    } else {
      grid[k.x][k.y] = 1;
    }
    if (!start) {
      pad.reset(0);
      pad.col(pad.red, pad.fromPattern(printGrid()));
    }
  }
});

function gameLogic() {
  for (var i = 1; i < SIZE - 1; i++) {
    for (var j = 1; j < SIZE - 1; j++) {
      let count = 0;

      count += grid[i - 1][j - 1]; //top left
      count += grid[i - 1][j]; //top center
      count += grid[i - 1][j + 1]; //top right

      count += grid[i][j - 1]; //middle left
      count += grid[i][j + 1]; //middle right

      count += grid[i + 1][j - 1]; //bottom left
      count += grid[i + 1][j]; //bottom center
      count += grid[i + 1][j + 1]; //bottom right

      if (grid[i][j] === 1) {
        if (count === 2 || count === 3) {
          copyGrid[i][j] = 1;
        } else {
          copyGrid[i][j] = 0;
        }
      } else {
        if (count === 3) {
          copyGrid[i][j] = 1;
        }
      }
    }
  }
}

// Wait for current speed before drawing next frame
async function frame() {
  return new Promise(resolve => setTimeout(() => {
    resolve();
  }, speed));
}

// Converts data to Launch Pad format
function printGrid() {
  let ret = [];
  grid.forEach((row, index) => {
    ret.push('r' + index + ' ' + row.map(i => {
      if (i === 1) {
        return 'x';
      }
      return ' ';
    }).join(''));
  });
  return ret;
}

// Create random starting seed
function rand() {
  let ret = []
  for (var i = 0; i < SIZE; i++) {
    ret[i] = Array.from({ length: SIZE }, () => Math.round(Math.random()));
  }
  return ret;
}

// Clears the grid
function clearGrid() {
  return Array.from(Array(SIZE), _ => Array(SIZE).fill(0));
}