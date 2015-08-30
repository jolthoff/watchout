//Initialize physics related variables
var sandboxWidth = 1000;
var sandboxHeight = 500;
var gravityStrength = 0;
var numNodes = 50;
var nodesArray = [];

//Initialize display related variables
var canvas = d3.select("body").append("svg")
    .attr('width', 1000)
    .attr('height', 500);
var background = canvas.append("rect")
    .attr('class', 'canvas')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'transparent');
var player = canvas.append("rect")
    .attr('fill', 'red')
    .attr('class', 'player')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', 20);

//Initialize collision and score related variables
var collisionCount = 0;
var curScore = 0;
var highScore = 0;
var collidedThisTick = false;

var randomRGB = function(){
  var red = Math.floor(Math.random()*255);
  var green = Math.floor(Math.random()*255);
  var blue = Math.floor(Math.random()*255);
  var a = (0.5 + Math.random()*0.5).toFixed(1)
  return 'rgba(' + red + ',' + green + ',' + blue + ',' + a + ')';
}

//Initialize nodesArray
for (var i = 0; i < numNodes; i++) {
  var randX = Math.random() * sandboxWidth;
  var randY = Math.random() * sandboxHeight;
  var randR = 5 + Math.random() * 15;
  nodesArray.push({x: randX, y: randY, r: randR})
}
nodesArray[0].fixed = true;

canvas.on('mousemove', function() {
  var pointer = d3.mouse(this);
  player.attr('x', pointer[0])
    .attr('y', pointer[1]);
  nodesArray[0].x = pointer[0];
  nodesArray[0].y = pointer[1];
});

canvas.selectAll('circle')
  .data(nodesArray.slice(1))
  .enter().append('circle')
  .attr('cx', function(d) {return d.x})
  .attr('cy', function(d) {return d.y})
  .attr('r', function(d) {return d.r})
  .style('fill', function() {return randomRGB()})
  .style('stroke', 'black')
  .style('stroke-width', 2);

//Starts physics
var force = d3.layout.force()
  .gravity(gravityStrength)
  .charge(function(d,i) {return i ? 0 : 100;}) 
  .nodes(nodesArray)
  .size([sandboxWidth, sandboxHeight])
  .friction(0.9)
  .theta(0.9)
  .alpha(0.5)
  .start();

force.on("tick", function(e) {
  var quadTree = d3.geom.quadtree(nodesArray),
    i = 0,
    n = nodesArray.length;
  while (i < n) {
    quadTree.visit(collide(nodesArray[i]));
    i++;
  }
  canvas.selectAll('circle')
    .attr('cx', function(d) { return d.x})
    .attr('cy', function(d) { return d.y}); 

  d3.select('.collisions').select('span').text(collisionCount);
  curScore += 1;
  d3.select('.high').select('span').text(highScore);
  d3.select('.current').select('span').text(curScore); 
  collideThisTick = false;
  
  force.resume();
});

function collide(node) {
  var R = node.r + 20;
  var nx1 = node.x - R;
  var nx2 = node.x + R;
  var ny1 = node.y - R;
  var ny2 = node.y + R;

  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var deltaX = node.x - quad.point.x,
        deltaY = node.y - quad.point.y,
        separation = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        radiusSum = node.r + quad.point.r;
      if (separation < radiusSum) {
        if(node.fixed) {
          if(!collidedThisTick)
            collisionCount++;
          collidedThisTick = true;
          highScore = Math.max(curScore, highScore);
          curScore = 0;
        }
        else {
          separation = (separation - radiusSum) / separation * .5;
          node.x -= deltaX *= separation;
          node.y -= deltaY *= separation;
          quad.point.x += deltaX;
          quad.point.y += deltaY;
        }
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

