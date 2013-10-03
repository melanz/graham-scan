;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(points) {

	if (points.length < 3) { 
		return points; 
	}
	
	var minimum = function(Q) { 
		// Find minimum y point (in case of tie select leftmost)         
		// Sort by y coordinate to ease the left most finding
		Q.sort(function(a,b) { 
			return a[1] - b[1]; 
		}); 

		var y_min = 1000000; 
		var smallest = 0; 
		for(var i=0; i < Q.length; ++i) { 
			var p = Q[i]; 
			if (p[1] < y_min) { 
				y_min = p[1]; 
				smallest= i; 
			} 
			else if (p[1] == y_min) { // Select left most 
				if (Q[i-1][0] > p[0]) {
					smallest = i;
				}
			}
		}
		return smallest;
	}

	var distance = function(a, b) {
		return (b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]);
	}

	var filter_equal_angles = function(p0, Q) {
		// => If two points have same polar angle remove the closet to p0
		// Distance can be calculated with vector length...
		for(var i=1; i < Q.length; i++) { 
			if (Q[i-1].polar == Q[i].polar) { 
				var d1 = distance(p0, Q[i-1]); 
				var d2 = distance(p0, Q[i]); 
				if (d2 < d1) {
					Q.splice(i, 1);
				} else {
					Q.splice(i-1, 1);
				}
			}
		}
	}

	var cartesian_angle = function(x, y) {
		if (x > 0 && y > 0)
			return Math.atan( y / x);
		else if (x < 0 && y > 0)
			return Math.atan(-x / y) + Math.PI / 2;
		else if (x < 0 && y < 0) 
			return Math.atan( y / x) + Math.PI; 
		else if (x > 0 && y < 0) 
			return Math.atan(-x / y) + Math.PI / 2 + Math.PI; 
		else if (x == 0 && y > 0)
			return Math.PI / 2;
		else if (x < 0 && y == 0) 
			return Math.PI; 
		else if (x == 0 && y < 0) 
		return Math.PI / 2 + Math.PI; 
		else return 0; 
	} 

	var calculate_angle = function(p1, p2) { 
		return cartesian_angle(p2[0] - p1[0], p2[1] - p1[1]) 
	}

	var calculate_polar_angles = function(p0, Q) { 
		for(var i=0; i < Q.length; i++) { 
			Q[i].polar = calculate_angle(p0, Q[i]); 
		}    
	}
	
	// Three points are a counter-clockwise turn 
	// if ccw > 0, clockwise if ccw < 0, and collinear if ccw = 0 
	var ccw = function(p1, p2, p3) { 
		return (p2[0] - p1[0])*(p3[1] - p1[1]) - (p2[1] - p1[1])*(p3[0] - p1[0]); 
	} 

	// Find minimum point 
	var Q = points.slice(); // Make copy 
	var minIndex = minimum(Q); 
	var p0 = Q[minIndex]; 
	Q.splice(minIndex, 1); // Remove p0 from Q
    
	// Sort by polar angle to p0              
	calculate_polar_angles(p0, Q); 
	Q.sort(function(a,b) { 
		return a.polar - b.polar; 
	});

	// Remove all with same polar angle but the farthest. 
    filter_equal_angles(p0, Q); 

    // Graham scan 
    var S = []; 
    S.push(p0); 
    S.push(Q[0]); 
    S.push(Q[1]); 
    for(var i=2; i < Q.length; ++i) { 
		var pi = Q[i]; 
		while(ccw(S[S.length - 2], S[S.length - 1], pi) <= 0) { 
			S.pop(); 
		} 
		S.push(pi); 
	}
	
	return S;
}

},{}],2:[function(require,module,exports){
var grahamScan = require("../grahamScan.js")

var scale = document.body.querySelector("#scale").value
var resetButton = document.body.querySelector("#reset");
var canvas = document.body.querySelector("#canvas");
var context = canvas.getContext("2d");
var points = new Array();
var boundaryPoints = new Array();

var timeStep = 0.01; // doesn't matter

function initialize() {   
    resetButton.addEventListener("click",reset);
    canvas.addEventListener("mousedown",addPoint,false);
	interval = setInterval(drawAll,1000*timeStep);
}

function drawAll() {
    scale = document.body.querySelector("#scale").value
    canvas.width = scale*2;
    canvas.height = scale*2;
    
    context.fillStyle = "rgb(255, 255, 255)"
    context.fillRect(0, 0, 400*scale/200, 400*scale/200)
    
	drawBoundary()
    drawPoints()
    boundaryPoints = grahamScan(points)
	drawConvexHull()
}

function convertCartesianToPixels(point) {
    var newPoint = [0, 0]
    newPoint[0] = scale*(point[0]+1)
    newPoint[1] = scale*(1-point[1])
    
    return newPoint
}

function convertPixelsToCartesian(point) {
    var newPoint = [0, 0]
    newPoint[0] = point[0]/scale-1
    newPoint[1] = 1-point[1]/scale
    
    return newPoint
}

function drawPoint(position) {
    var pos = convertCartesianToPixels(position)
    context.strokeStyle = "rgb(0, 0, 255)"
    context.beginPath();
    context.arc(pos[0],pos[1],2*scale/200,0,2*Math.PI)
    context.stroke();
}

function drawLine(startCart, endCart) {
    context.strokeStyle = "rgb(255, 0, 0)"
    var start = convertCartesianToPixels(startCart)
    var end = convertCartesianToPixels(endCart)
    context.moveTo(start[0],start[1])
    context.lineTo(end[0],end[1])
    context.stroke();
}

function drawConvexHull() {
	if(points.length>2) {
		for (var i=0;i<boundaryPoints.length-1;i++) {
			drawLine(boundaryPoints[i],boundaryPoints[i+1])
		}
		drawLine(boundaryPoints[boundaryPoints.length-1],boundaryPoints[0])
	}
}

function drawPoints() {
    for (var i=0;i<points.length;i++) {
        drawPoint(points[i])
    }
}

function drawBoundary() {
	drawLine([-1,-1],[-1,1])
	drawLine([-1,1],[1,1])
	drawLine([1,1],[1,-1])
	drawLine([1,-1],[-1,-1])
}

function reset() {
    clearInterval(interval)
    console.log("Resetting (dt = "+timeStep+")")
	
	points = new Array();
    interval = setInterval(drawAll,1000*timeStep)
}

function addPoint(event) {
    //console.log("Point added at px("+event.pageX+", "+event.pageY+")")
    var point = [0,0];
    point = convertPixelsToCartesian([event.pageX-canvas.offsetLeft, event.pageY-canvas.offsetTop])
    //position.push(point)
    //console.log(position)
    //initialPosition.push(point)
    console.log("Point added at ("+point[0]+", "+point[1]+")")
    console.log(" ");
	points.push(point);
}

initialize()



},{"../grahamScan.js":1}]},{},[2])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXERhbmllbFxcRHJvcGJveFxcQ1M1NThcXEhXM1xcZ3JhaGFtU2Nhbi5qcyIsIkM6XFxVc2Vyc1xcRGFuaWVsXFxEcm9wYm94XFxDUzU1OFxcSFczXFx2aXN1YWxpemVyXFx2aXN1YWxpemVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocG9pbnRzKSB7XHJcblxyXG5cdGlmIChwb2ludHMubGVuZ3RoIDwgMykgeyBcclxuXHRcdHJldHVybiBwb2ludHM7IFxyXG5cdH1cclxuXHRcclxuXHR2YXIgbWluaW11bSA9IGZ1bmN0aW9uKFEpIHsgXHJcblx0XHQvLyBGaW5kIG1pbmltdW0geSBwb2ludCAoaW4gY2FzZSBvZiB0aWUgc2VsZWN0IGxlZnRtb3N0KSAgICAgICAgIFxyXG5cdFx0Ly8gU29ydCBieSB5IGNvb3JkaW5hdGUgdG8gZWFzZSB0aGUgbGVmdCBtb3N0IGZpbmRpbmdcclxuXHRcdFEuc29ydChmdW5jdGlvbihhLGIpIHsgXHJcblx0XHRcdHJldHVybiBhWzFdIC0gYlsxXTsgXHJcblx0XHR9KTsgXHJcblxyXG5cdFx0dmFyIHlfbWluID0gMTAwMDAwMDsgXHJcblx0XHR2YXIgc21hbGxlc3QgPSAwOyBcclxuXHRcdGZvcih2YXIgaT0wOyBpIDwgUS5sZW5ndGg7ICsraSkgeyBcclxuXHRcdFx0dmFyIHAgPSBRW2ldOyBcclxuXHRcdFx0aWYgKHBbMV0gPCB5X21pbikgeyBcclxuXHRcdFx0XHR5X21pbiA9IHBbMV07IFxyXG5cdFx0XHRcdHNtYWxsZXN0PSBpOyBcclxuXHRcdFx0fSBcclxuXHRcdFx0ZWxzZSBpZiAocFsxXSA9PSB5X21pbikgeyAvLyBTZWxlY3QgbGVmdCBtb3N0IFxyXG5cdFx0XHRcdGlmIChRW2ktMV1bMF0gPiBwWzBdKSB7XHJcblx0XHRcdFx0XHRzbWFsbGVzdCA9IGk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gc21hbGxlc3Q7XHJcblx0fVxyXG5cclxuXHR2YXIgZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XHJcblx0XHRyZXR1cm4gKGJbMF0gLSBhWzBdKSAqIChiWzBdIC0gYVswXSkgKyAoYlsxXSAtIGFbMV0pICogKGJbMV0gLSBhWzFdKTtcclxuXHR9XHJcblxyXG5cdHZhciBmaWx0ZXJfZXF1YWxfYW5nbGVzID0gZnVuY3Rpb24ocDAsIFEpIHtcclxuXHRcdC8vID0+IElmIHR3byBwb2ludHMgaGF2ZSBzYW1lIHBvbGFyIGFuZ2xlIHJlbW92ZSB0aGUgY2xvc2V0IHRvIHAwXHJcblx0XHQvLyBEaXN0YW5jZSBjYW4gYmUgY2FsY3VsYXRlZCB3aXRoIHZlY3RvciBsZW5ndGguLi5cclxuXHRcdGZvcih2YXIgaT0xOyBpIDwgUS5sZW5ndGg7IGkrKykgeyBcclxuXHRcdFx0aWYgKFFbaS0xXS5wb2xhciA9PSBRW2ldLnBvbGFyKSB7IFxyXG5cdFx0XHRcdHZhciBkMSA9IGRpc3RhbmNlKHAwLCBRW2ktMV0pOyBcclxuXHRcdFx0XHR2YXIgZDIgPSBkaXN0YW5jZShwMCwgUVtpXSk7IFxyXG5cdFx0XHRcdGlmIChkMiA8IGQxKSB7XHJcblx0XHRcdFx0XHRRLnNwbGljZShpLCAxKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0US5zcGxpY2UoaS0xLCAxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBjYXJ0ZXNpYW5fYW5nbGUgPSBmdW5jdGlvbih4LCB5KSB7XHJcblx0XHRpZiAoeCA+IDAgJiYgeSA+IDApXHJcblx0XHRcdHJldHVybiBNYXRoLmF0YW4oIHkgLyB4KTtcclxuXHRcdGVsc2UgaWYgKHggPCAwICYmIHkgPiAwKVxyXG5cdFx0XHRyZXR1cm4gTWF0aC5hdGFuKC14IC8geSkgKyBNYXRoLlBJIC8gMjtcclxuXHRcdGVsc2UgaWYgKHggPCAwICYmIHkgPCAwKSBcclxuXHRcdFx0cmV0dXJuIE1hdGguYXRhbiggeSAvIHgpICsgTWF0aC5QSTsgXHJcblx0XHRlbHNlIGlmICh4ID4gMCAmJiB5IDwgMCkgXHJcblx0XHRcdHJldHVybiBNYXRoLmF0YW4oLXggLyB5KSArIE1hdGguUEkgLyAyICsgTWF0aC5QSTsgXHJcblx0XHRlbHNlIGlmICh4ID09IDAgJiYgeSA+IDApXHJcblx0XHRcdHJldHVybiBNYXRoLlBJIC8gMjtcclxuXHRcdGVsc2UgaWYgKHggPCAwICYmIHkgPT0gMCkgXHJcblx0XHRcdHJldHVybiBNYXRoLlBJOyBcclxuXHRcdGVsc2UgaWYgKHggPT0gMCAmJiB5IDwgMCkgXHJcblx0XHRyZXR1cm4gTWF0aC5QSSAvIDIgKyBNYXRoLlBJOyBcclxuXHRcdGVsc2UgcmV0dXJuIDA7IFxyXG5cdH0gXHJcblxyXG5cdHZhciBjYWxjdWxhdGVfYW5nbGUgPSBmdW5jdGlvbihwMSwgcDIpIHsgXHJcblx0XHRyZXR1cm4gY2FydGVzaWFuX2FuZ2xlKHAyWzBdIC0gcDFbMF0sIHAyWzFdIC0gcDFbMV0pIFxyXG5cdH1cclxuXHJcblx0dmFyIGNhbGN1bGF0ZV9wb2xhcl9hbmdsZXMgPSBmdW5jdGlvbihwMCwgUSkgeyBcclxuXHRcdGZvcih2YXIgaT0wOyBpIDwgUS5sZW5ndGg7IGkrKykgeyBcclxuXHRcdFx0UVtpXS5wb2xhciA9IGNhbGN1bGF0ZV9hbmdsZShwMCwgUVtpXSk7IFxyXG5cdFx0fSAgICBcclxuXHR9XHJcblx0XHJcblx0Ly8gVGhyZWUgcG9pbnRzIGFyZSBhIGNvdW50ZXItY2xvY2t3aXNlIHR1cm4gXHJcblx0Ly8gaWYgY2N3ID4gMCwgY2xvY2t3aXNlIGlmIGNjdyA8IDAsIGFuZCBjb2xsaW5lYXIgaWYgY2N3ID0gMCBcclxuXHR2YXIgY2N3ID0gZnVuY3Rpb24ocDEsIHAyLCBwMykgeyBcclxuXHRcdHJldHVybiAocDJbMF0gLSBwMVswXSkqKHAzWzFdIC0gcDFbMV0pIC0gKHAyWzFdIC0gcDFbMV0pKihwM1swXSAtIHAxWzBdKTsgXHJcblx0fSBcclxuXHJcblx0Ly8gRmluZCBtaW5pbXVtIHBvaW50IFxyXG5cdHZhciBRID0gcG9pbnRzLnNsaWNlKCk7IC8vIE1ha2UgY29weSBcclxuXHR2YXIgbWluSW5kZXggPSBtaW5pbXVtKFEpOyBcclxuXHR2YXIgcDAgPSBRW21pbkluZGV4XTsgXHJcblx0US5zcGxpY2UobWluSW5kZXgsIDEpOyAvLyBSZW1vdmUgcDAgZnJvbSBRXHJcbiAgICBcclxuXHQvLyBTb3J0IGJ5IHBvbGFyIGFuZ2xlIHRvIHAwICAgICAgICAgICAgICBcclxuXHRjYWxjdWxhdGVfcG9sYXJfYW5nbGVzKHAwLCBRKTsgXHJcblx0US5zb3J0KGZ1bmN0aW9uKGEsYikgeyBcclxuXHRcdHJldHVybiBhLnBvbGFyIC0gYi5wb2xhcjsgXHJcblx0fSk7XHJcblxyXG5cdC8vIFJlbW92ZSBhbGwgd2l0aCBzYW1lIHBvbGFyIGFuZ2xlIGJ1dCB0aGUgZmFydGhlc3QuIFxyXG4gICAgZmlsdGVyX2VxdWFsX2FuZ2xlcyhwMCwgUSk7IFxyXG5cclxuICAgIC8vIEdyYWhhbSBzY2FuIFxyXG4gICAgdmFyIFMgPSBbXTsgXHJcbiAgICBTLnB1c2gocDApOyBcclxuICAgIFMucHVzaChRWzBdKTsgXHJcbiAgICBTLnB1c2goUVsxXSk7IFxyXG4gICAgZm9yKHZhciBpPTI7IGkgPCBRLmxlbmd0aDsgKytpKSB7IFxyXG5cdFx0dmFyIHBpID0gUVtpXTsgXHJcblx0XHR3aGlsZShjY3coU1tTLmxlbmd0aCAtIDJdLCBTW1MubGVuZ3RoIC0gMV0sIHBpKSA8PSAwKSB7IFxyXG5cdFx0XHRTLnBvcCgpOyBcclxuXHRcdH0gXHJcblx0XHRTLnB1c2gocGkpOyBcclxuXHR9XHJcblx0XHJcblx0cmV0dXJuIFM7XHJcbn1cclxuIiwidmFyIGdyYWhhbVNjYW4gPSByZXF1aXJlKFwiLi4vZ3JhaGFtU2Nhbi5qc1wiKVxuXG52YXIgc2NhbGUgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoXCIjc2NhbGVcIikudmFsdWVcbnZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcihcIiNyZXNldFwiKTtcbnZhciBjYW52YXMgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpO1xudmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xudmFyIHBvaW50cyA9IG5ldyBBcnJheSgpO1xudmFyIGJvdW5kYXJ5UG9pbnRzID0gbmV3IEFycmF5KCk7XG5cbnZhciB0aW1lU3RlcCA9IDAuMDE7IC8vIGRvZXNuJ3QgbWF0dGVyXG5cbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7ICAgXG4gICAgcmVzZXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIscmVzZXQpO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsYWRkUG9pbnQsZmFsc2UpO1xuXHRpbnRlcnZhbCA9IHNldEludGVydmFsKGRyYXdBbGwsMTAwMCp0aW1lU3RlcCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdBbGwoKSB7XG4gICAgc2NhbGUgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoXCIjc2NhbGVcIikudmFsdWVcbiAgICBjYW52YXMud2lkdGggPSBzY2FsZSoyO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBzY2FsZSoyO1xuICAgIFxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCJyZ2IoMjU1LCAyNTUsIDI1NSlcIlxuICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgNDAwKnNjYWxlLzIwMCwgNDAwKnNjYWxlLzIwMClcbiAgICBcblx0ZHJhd0JvdW5kYXJ5KClcbiAgICBkcmF3UG9pbnRzKClcbiAgICBib3VuZGFyeVBvaW50cyA9IGdyYWhhbVNjYW4ocG9pbnRzKVxuXHRkcmF3Q29udmV4SHVsbCgpXG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRDYXJ0ZXNpYW5Ub1BpeGVscyhwb2ludCkge1xuICAgIHZhciBuZXdQb2ludCA9IFswLCAwXVxuICAgIG5ld1BvaW50WzBdID0gc2NhbGUqKHBvaW50WzBdKzEpXG4gICAgbmV3UG9pbnRbMV0gPSBzY2FsZSooMS1wb2ludFsxXSlcbiAgICBcbiAgICByZXR1cm4gbmV3UG9pbnRcbn1cblxuZnVuY3Rpb24gY29udmVydFBpeGVsc1RvQ2FydGVzaWFuKHBvaW50KSB7XG4gICAgdmFyIG5ld1BvaW50ID0gWzAsIDBdXG4gICAgbmV3UG9pbnRbMF0gPSBwb2ludFswXS9zY2FsZS0xXG4gICAgbmV3UG9pbnRbMV0gPSAxLXBvaW50WzFdL3NjYWxlXG4gICAgXG4gICAgcmV0dXJuIG5ld1BvaW50XG59XG5cbmZ1bmN0aW9uIGRyYXdQb2ludChwb3NpdGlvbikge1xuICAgIHZhciBwb3MgPSBjb252ZXJ0Q2FydGVzaWFuVG9QaXhlbHMocG9zaXRpb24pXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwicmdiKDAsIDAsIDI1NSlcIlxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5hcmMocG9zWzBdLHBvc1sxXSwyKnNjYWxlLzIwMCwwLDIqTWF0aC5QSSlcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3TGluZShzdGFydENhcnQsIGVuZENhcnQpIHtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCJyZ2IoMjU1LCAwLCAwKVwiXG4gICAgdmFyIHN0YXJ0ID0gY29udmVydENhcnRlc2lhblRvUGl4ZWxzKHN0YXJ0Q2FydClcbiAgICB2YXIgZW5kID0gY29udmVydENhcnRlc2lhblRvUGl4ZWxzKGVuZENhcnQpXG4gICAgY29udGV4dC5tb3ZlVG8oc3RhcnRbMF0sc3RhcnRbMV0pXG4gICAgY29udGV4dC5saW5lVG8oZW5kWzBdLGVuZFsxXSlcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3Q29udmV4SHVsbCgpIHtcblx0aWYocG9pbnRzLmxlbmd0aD4yKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8Ym91bmRhcnlQb2ludHMubGVuZ3RoLTE7aSsrKSB7XG5cdFx0XHRkcmF3TGluZShib3VuZGFyeVBvaW50c1tpXSxib3VuZGFyeVBvaW50c1tpKzFdKVxuXHRcdH1cblx0XHRkcmF3TGluZShib3VuZGFyeVBvaW50c1tib3VuZGFyeVBvaW50cy5sZW5ndGgtMV0sYm91bmRhcnlQb2ludHNbMF0pXG5cdH1cbn1cblxuZnVuY3Rpb24gZHJhd1BvaW50cygpIHtcbiAgICBmb3IgKHZhciBpPTA7aTxwb2ludHMubGVuZ3RoO2krKykge1xuICAgICAgICBkcmF3UG9pbnQocG9pbnRzW2ldKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhd0JvdW5kYXJ5KCkge1xuXHRkcmF3TGluZShbLTEsLTFdLFstMSwxXSlcblx0ZHJhd0xpbmUoWy0xLDFdLFsxLDFdKVxuXHRkcmF3TGluZShbMSwxXSxbMSwtMV0pXG5cdGRyYXdMaW5lKFsxLC0xXSxbLTEsLTFdKVxufVxuXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgICBjbGVhckludGVydmFsKGludGVydmFsKVxuICAgIGNvbnNvbGUubG9nKFwiUmVzZXR0aW5nIChkdCA9IFwiK3RpbWVTdGVwK1wiKVwiKVxuXHRcblx0cG9pbnRzID0gbmV3IEFycmF5KCk7XG4gICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChkcmF3QWxsLDEwMDAqdGltZVN0ZXApXG59XG5cbmZ1bmN0aW9uIGFkZFBvaW50KGV2ZW50KSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIlBvaW50IGFkZGVkIGF0IHB4KFwiK2V2ZW50LnBhZ2VYK1wiLCBcIitldmVudC5wYWdlWStcIilcIilcbiAgICB2YXIgcG9pbnQgPSBbMCwwXTtcbiAgICBwb2ludCA9IGNvbnZlcnRQaXhlbHNUb0NhcnRlc2lhbihbZXZlbnQucGFnZVgtY2FudmFzLm9mZnNldExlZnQsIGV2ZW50LnBhZ2VZLWNhbnZhcy5vZmZzZXRUb3BdKVxuICAgIC8vcG9zaXRpb24ucHVzaChwb2ludClcbiAgICAvL2NvbnNvbGUubG9nKHBvc2l0aW9uKVxuICAgIC8vaW5pdGlhbFBvc2l0aW9uLnB1c2gocG9pbnQpXG4gICAgY29uc29sZS5sb2coXCJQb2ludCBhZGRlZCBhdCAoXCIrcG9pbnRbMF0rXCIsIFwiK3BvaW50WzFdK1wiKVwiKVxuICAgIGNvbnNvbGUubG9nKFwiIFwiKTtcblx0cG9pbnRzLnB1c2gocG9pbnQpO1xufVxuXG5pbml0aWFsaXplKClcblxuXG4iXX0=
;