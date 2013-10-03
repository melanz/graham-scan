var grahamScan = require("../grahamScan.js")

var points = [[0,0],[1,0],[1,1],[0,1],[.5,.5],[-1,-1]];

var boundaryPoints = grahamScan(points);

console.log(boundaryPoints);