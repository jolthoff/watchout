var shurikensCount = 15;
var canvas = d3.select("body").append("svg")
    .attr('width', 1000)
    .attr('height', 1000);
var background = canvas.append("rect")
    .attr('class', 'canvas')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'transparent');
var shurikens = canvas.append("g");
var player = canvas.append("circle")
    .attr('fill', 'yellow')
    .attr('class', 'player');
var collisionCount = 0;
var curScore = 0;
var highScore = 0;
var collidedThisTick = false;

var runGame = function() {
  createPlayer();
  setInterval(function() {
    updateBoard(createShurikens());
    updateScore();
    collidedThisTick = false;
  }.bind(this), 1000);
}

var createShurikens = function() {
  var result = [];
  for (var i = 0; i < shurikensCount; i++) {
    var x = Math.random() * canvas.attr('width');
    var y = Math.random() * canvas.attr('height');
    var n = 50;
    var clampedCoordinates = clampPosition(x,y);
    result.push({'id': i, 'x': clampedCoordinates[0], 'y': clampedCoordinates[1], 'n': n});
  }
  return result;
}

var createPlayer = function() {
  var initX = 500;
  var initY = 500;
  var r = 18;
  player.attr('cx', initX)
    .attr('cy', initY)
    .attr('r', r);
  
  var drag = d3.behavior.drag()
    .on('dragstart', function() {
      d3.select(this).attr('fill', 'red');})
    .on('drag', function() { 
      d3.select(this).attr('cx', d3.event.x)
      .attr('cy', d3.event.y); })
    .on('dragend', function() { d3.select(this).attr('fill', 'yellow'); });

  player.call(drag);
}

var clampPosition = function(x,y) {
  var leftBound = 0;
  var rightBound = canvas.attr('width')-50;
  var upperBound = 0;
  var lowerBound = canvas.attr('height')-50;

  x = Math.max(x, 0);
  x = Math.min(x, rightBound);
  y = Math.max(y, upperBound);
  y = Math.min(y, lowerBound);
  return[x,y];
}

var updateBoard = function(enemyData) {
  var joinedShurikens = canvas.select('g').selectAll('.shuriken')
    .data(enemyData, function(d, index) {return d.id;}); 
  
  joinedShurikens.enter()
    .append("rect")
    .attr('class', 'shuriken')
    .attr('fill', 'black')
    .attr('x', function(d, i) {return d.x})
    .attr('y', function(d, i) {return d.y})
    .attr('height', function(d, i) {return d.n})
    .attr('width', function(d, i) {return d.n})
    .attr('id', function(d,i) {return d.id});

  joinedShurikens.transition()
    .duration(1000)
    .tween('custom', tweenFunction);

  joinedShurikens.exit().remove();
  
  d3.select('.collisions').select('span').text(this.collisionCount);
  
}

var tweenFunction = function(shurikenEndData) {
  var shuriken = d3.select(this);
  var startPosition = {'x': parseFloat(shuriken.attr('x')), 'y': parseFloat(shuriken.attr('y')) };
  var endPosition = {'x': shurikenEndData.x, 'y': shurikenEndData.y};

  debugger;
  return function(t) {
    var tPosition;
    tPosition = {
      'x': startPosition.x + t*(endPosition.x - startPosition.x),
      'y': startPosition.y + t*(endPosition.y - startPosition.y)
    };
    checkCollision(tPosition.x, tPosition.y);
    updateScore();

    return shuriken.attr('x', tPosition.x).attr('y', tPosition.y);  //Function does not need to return, but explicitly returning for clarity
  }
}

var checkCollision = function (shurikenX, shurikenY) {
  var playerX = parseFloat(player.attr('cx'));
  var playerY = parseFloat(player.attr('cy'));
  var playerR = parseFloat(player.attr('r'));

  var diffX = playerX - shurikenX;
  var diffY = playerY - shurikenY;
  var radiusSum = playerR + 50;   //Hardcoded R for shuriken
  var separation = Math.sqrt(diffX*diffX + diffY*diffY);

  if(separation < radiusSum) {
    if (!collidedThisTick)
      collisionCount++;
    collidedThisTick = true;
    highScore = Math.max(curScore, highScore);
    curScore = 0;
    console.log('HIT');
    return true;
  }
  else
    return false;
}

var updateScore = function () {
  curScore += 1;
  d3.select('.high').select('span').text(highScore);
  d3.select('.current').select('span').text(curScore); 
}

runGame();



