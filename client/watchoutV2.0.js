var sandboxWidth = 1000;
var sandboxHeight = 1000;
var gravityStrength = 0;
var numNodes = 100;

var nodesArray = [];

for (var i = 0; i < numNodes; i++) {
  var randX = Math.random() * sandboxWidth;
  var randY = Math.random() * sandboxHeight;
  var randR = 5 + Math.random() * 15;
  nodesArray.push({x: randX, y: randY, r: randR})
}

var force = d3.layout.force()
  .gravity(gravityStrength)
  .charge(function(d,i) {return i ? 0 : 1500;}) 
  .nodes(nodesArray)
  .size([sandboxWidth, sandboxHeight])
  .friction(0.2)
  .theta(0.8)
  .alpha(0.1)
  .start();

nodesArray[0].x = 500;
nodesArray[0].y = 500;


var mouse = nodesArray[0];
mouse.radius = 0;
mouse.fixed = true;

var randomRGB = function(){
  var red = Math.floor(Math.random()*255);
  var green = Math.floor(Math.random()*255);
  var blue = Math.floor(Math.random()*255);
  var a = (0.5 + Math.random()*0.5).toFixed(1)
  return 'rgba(' + red + ',' + green + ',' + blue + ',' + a + ')';
}
var display = d3.select('body').append('svg')
  .attr('width', sandboxWidth)
  .attr('height', sandboxHeight);
  
  display.selectAll('circle')
    .data(nodesArray.slice(1))
    .enter().append('circle')
      .attr('cx', function(d) {return d.x})
      .attr('cy', function(d) {return d.y})
      .attr('r', function(d) {return d.r})
      .style('fill', function() {return randomRGB()})
      .style('stroke', 'black')
      .style('stroke-width', 2);

force.on("tick", function(e) {
  var quadTree = d3.geom.quadtree(nodesArray),
    i = 0,
    n = nodesArray.length;
  while (++i < n) {
    quadTree.visit(collide(nodesArray[i]));
  }

  display.selectAll('circle')
    .attr('cx', function(d) { return d.x})
    .attr('cy', function(d) { return d.y});
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
        separation = (separation - radiusSum) / separation * .5;
        node.x -= deltaX *= separation;
        node.y -= deltaY *= separation;
        quad.point.x += deltaX;
        quad.point.y += deltaY;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

display.on('mousemove', function() {
  var pointer = d3.mouse(this);
  mouse.px = pointer[0]
  mouse.py = pointer[1]
  force.resume();
})
