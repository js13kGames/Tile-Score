var interact = require('interact-js');
var Tile = require('./Tile');

var DIRECTIONS = {
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3
};

var TILE_TYPES = {
  EARTH: 0,
  WIND: 1,
  FIRE: 3,
  WATER: 4
};

var NUM_TILE_TYPES = Object.keys(TILE_TYPES).length;

function Grid($el, fieldSize, fieldTiles) {
  var grid = this;
  var i = -1, len = fieldTiles * fieldTiles, tile;

  this.$el = $el;
  this.fieldSize = fieldSize;
  this.fieldTiles = fieldTiles;
  this.tileSize = fieldSize / fieldTiles;
  this.tiles = [];

  while (++i < len) {
    tile = grid.tiles[i] = new Tile(grid, Math.floor(Math.random() * NUM_TILE_TYPES));
    tile.$el.style.transform = 'translate(' + (grid.colOf(tile) * this.tileSize)  + 'px,' + (grid.rowOf(tile) * this.tileSize) + 'px)';
    grid.$el.appendChild(tile.$el);
  }

  interact.on('drag', grid.$el, Grid.prototype.onDrag.bind(grid));

  this.updateScore();
}

Grid.prototype.rowOf = function (tile) {
  var index = this.tiles.indexOf(tile);

  if (index < 0) {
    throw new Error('Tile is not on this grid');
  }

  return Math.floor(index / this.fieldTiles);
};

Grid.prototype.colOf = function (tile) {
  var index = this.tiles.indexOf(tile);

  if (index < 0) {
    throw new Error('Tile is not on this grid');
  }

  return index % this.fieldTiles;
};

Grid.prototype.updateScore = function () {
  this.score = this.tiles.reduce(function (totalScore, tile) {
    tile.updateScore();

    return totalScore + tile.score;
  }, 0);
};

Grid.prototype.updateAppearance = function () {
  var tileTypes = this.tiles.reduce(function (types, tile) {
    return types + tile.type;
  }, '');

  if (this.lastTileTypes && tileTypes === this.lastTileTypes) {
    return;
  }

  this.lastTileTypes = tileTypes;

  this.tiles.forEach(function (tile) {
    tile.updateAppearance();
  });
};

Grid.prototype.swap = function (a, b) {
  var tempType;

  tempType = this.tiles[a].type;
  this.tiles[a].type = this.tiles[b].type;
  this.tiles[b].type = tempType;

  this.updateScore();
};

Grid.prototype.onDrag = function (interaction) {
  var grid = this;

  var delta = interaction.getMoveDelta();
  var index, row, col, direction;

  if (interaction.isResolved) {
    return;
  }

  if (interaction.sourceIndex == null) {
    interaction.sourceIndex = grid.tiles.map(function (tile) {
      return tile.$el;
    }).indexOf(interaction.target);
  }

  if (!interaction.totals) {
    interaction.totals = {x: 0, y: 0, d: 0};
  }

  interaction.totals.x += delta.x;
  interaction.totals.y += delta.y;
  interaction.totals.d = Math.max(Math.abs(interaction.totals.x), Math.abs(interaction.totals.y));

  if (interaction.totals.d < (grid.tileSize / 8)) {
    return;
  }

  if (Math.abs(interaction.totals.x) > Math.abs(interaction.totals.y)) {
    direction = DIRECTIONS[interaction.totals.x < 0 ? 'LEFT' : 'RIGHT'];
  } else {
    direction = DIRECTIONS[interaction.totals.y < 0 ? 'UP' : 'DOWN'];
  }

  interaction.isResolved = true;
  index = interaction.sourceIndex;
  row = grid.rowOf(grid.tiles[index]);
  col = grid.colOf(grid.tiles[index]);

  switch (direction) {
    case DIRECTIONS.UP:
      if (row > 0) {
        grid.swap(index, index - this.fieldTiles);
      }
      break;
    case DIRECTIONS.DOWN:
      if (row < (grid.fieldTiles - 1)) {
        grid.swap(index, index + this.fieldTiles);
      }
      break;
    case DIRECTIONS.LEFT:
      if (col > 0) {
        grid.swap(index, index - 1);
      }
      break;
    case DIRECTIONS.RIGHT:
      if (col < (grid.fieldTiles - 1)) {
        grid.swap(index, index + 1);
      }
      break;
    default:
      break;
  }
};

module.exports = Grid;