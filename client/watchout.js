// start slingin' some d3 here.
var Game = function(){
  this.boardState = {
    'playerState': {},
    'enemyStates': []
  };
  this.shurikensCount = 30;
  this.displayCanvas = d3.select("body").append("svg")
    .attr('width', 1000)
    .attr('height', 1000);
  this.gameBoard = this.displayCanvas.append("rect")
    .attr('class', 'gameboard')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'transparent');
  this.shurikens = this.displayCanvas.append("g");
  this.player = this.displayCanvas.append("circle")
    .attr('fill', 'yellow')
    .attr('class', 'player');
  this.collisionCount = 0;
  this.curScore = 0;
  this.highScore = 0;
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

  setInterval(function() {
    this.score();
    this.collisionDetection();
  }.bind(this), 500);
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
  var joinedshurikens = this.shurikens.selectAll('.shuriken')
    .data(this.boardState.enemyStates, function(d, index) {return d.id;}); 
  
  joinedshurikens.enter()
    .append("rect")
    .attr('class', 'shuriken')
    .attr('x', function(d, i) {return d.x})
    .attr('y', function(d, i) {return d.y})
    .attr('height', function(d, i) {return d.n})
    .attr('width', function(d, i) {return d.n})
    .attr('id', function(d,i) {return d.id})
    .append('animate')
    .attr('attributeName', 'transform')
    .attr('type', 'rotate')
    .attr('from', '0deg')
    .attr('to', '360deg.')
    .attr('dur', '1s')
    .attr('repeatCount', 'indefinite');

  joinedshurikens.transition()
    .delay(1000)
    .attr('x', function(d, i) {return d.x})
    .attr('y', function(d, i) {return d.y});

  
  d3.select('.collisions').select('span').text(this.collisionCount);
  joinedshurikens.exit().remove();
}

Game.prototype.createEnemies = function() {
  this.createShurikens();
}

Game.prototype.checkCollision = function (dThreeObject) {
  var dThreePlayer = d3.select('.player');

  var shurikenX = dThreeObject.attr('x') + dThreeObject.attr('width') / 2;
  var shurikenY = dThreeObject.attr('y') + dThreeObject.attr('width') / 2;
  var shurikenR = dThreeObject.attr('width') / 2;
  var playerX = dThreePlayer.attr('cx');
  var playerY = dThreePlayer.attr('cy');
  var playerR = dThreePlayer.attr('r');

  var diffX = playerX - shurikenX;
  var diffY = playerY - shurikenY;
  var radiusSum = parseFloat(playerR) + parseFloat(shurikenR);
  var separation = Math.sqrt(diffX*diffX + diffY*diffY);

  if((separation-5) < radiusSum) {
    this.collisionCount++;
    this.highScore = Math.max(this.curScore, this.highScore);
    this.curScore = 0;
    return true;
  }
  else
    return false;
}

Game.prototype.score = function () {
  this.curScore += 1;
  d3.select('.high').select('span').text(this.highScore);
  d3.select('.current').select('span').text(this.curScore);
  
}

Game.prototype.collisionDetection = function() {
  var joinedshurikens = this.shurikens.selectAll('.shuriken')[0];
  for (var i = 0; i < joinedshurikens.length; i++) {
    this.checkCollision(d3.select(joinedshurikens[i]));
  }
}


Game.prototype.createShurikens = function() {
  for (var i = 0; i < this.shurikensCount; i++) {
    var x = Math.random() * this.displayCanvas.attr('width');
    var y = Math.random() * this.displayCanvas.attr('height');
    var n = 30;
    
    this.boardState.enemyStates.push({
      'x' : x,
      'oldX' : x,
      'y' : y,
      'oldY' : y,
      'n' : n,
      'id' : i
    });
  }
}

var newGame = new Game();