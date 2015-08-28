// start slingin' some d3 here.
var Game = function(){
  this.boardState = {
    'playerState': {},
    'enemyStates': []
  };
  this.asteroidCount = 30;
  this.displayCanvas = d3.select("body").append("svg")
    .attr('width', 1000)
    .attr('height', 1000);
  this.gameBoard = this.displayCanvas.append("rect")
    .attr('class', 'gameboard')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'black');
  this.asteroids = this.displayCanvas.append("g");
  this.player = this.displayCanvas.append("circle")
    .attr('fill', 'yellow')
    .attr('class', 'player');
  this.runGame();
}

Game.prototype.runGame = function() {
  var counter = 0;
  this.createPlayer();
  this.createEnemies();
  setInterval(function() {
    this.updateBoard();
    this.renderBoard();
  }.bind(this), 1000);
}

Game.prototype.createPlayer = function() {
  var initX = 500;
  var initY = 500;
  var r = 18;
  this.player.attr('cx', initX)
    .attr('cy', initY)
    .attr('r', r);
  this.boardState.playerState = {
    'x': initX,
    'y': initY,
    'r': r
  };

  var drag = d3.behavior.drag()
    .on('dragstart', function() {
      d3.select(this).attr('fill', 'red');})
    .on('drag', function() { 
      d3.select(this).attr('cx', d3.event.x)
      .attr('cy', d3.event.y); })
    .on('dragend', function() { d3.select(this).attr('fill', 'yellow'); });

  this.player.call(drag);
}

Game.prototype.updateBoard = function() {
  for(var i = 0; i < this.boardState.enemyStates.length; i++) {
    var curEnemy = this.boardState.enemyStates[i];
    curEnemy.x += Math.random() * 1000 - 500;
    curEnemy.y += Math.random() * 1000 - 500;
    var clampedPosition = this.clampPosition(curEnemy.x, curEnemy.y);
    curEnemy.x = clampedPosition[0];
    curEnemy.y = clampedPosition[1];
  }
}

Game.prototype.clampPosition = function(x,y) {
  var leftBound = 0;
  var rightBound = this.displayCanvas.attr('width')-50;
  var upperBound = 0;
  var lowerBound = this.displayCanvas.attr('height')-50;

  x = Math.max(x, 0);
  x = Math.min(x, rightBound);
  y = Math.max(y, upperBound);
  y = Math.min(y, lowerBound);
  return[x,y];
}

Game.prototype.renderBoard = function() {
  var joinedAsteroids = this.asteroids.selectAll('.asteroid')
    .data(this.boardState.enemyStates, function(d, index) {return d.id;}); 
  
  joinedAsteroids.enter()
    .append("image")
    .attr('class', 'asteroid')
    .attr('x', function(d, i) {return d.x})
    .attr('y', function(d, i) {return d.y})
    .attr('height', function(d, i) {return d.n})
    .attr('width', function(d, i) {return d.n})
    .attr('id', function(d,i) {return d.id})
    .attr('xlink:href', 'asteroid.png');

  joinedAsteroids.transition()
    .duration(750)
    .attr('x', function(d, i) {return d.x})
    .attr('y', function(d, i) {return d.y});
    
  joinedAsteroids.exit().remove();
}

Game.prototype.createEnemies = function() {
  this.createAsteroids();
}

Game.prototype.createAsteroids = function() {
  for(var i = 0; i < this.asteroidCount; i++) {
    var x = Math.random() * this.displayCanvas.attr('width');
    var y = Math.random() * this.displayCanvas.attr('height');
    var n = Math.random() * 25 + 25;
    
    this.boardState.enemyStates.push({
      'x' : x,
      'y' : y,
      'n' : n,
      'id' : i
    });
  }
}

var newGame = new Game();