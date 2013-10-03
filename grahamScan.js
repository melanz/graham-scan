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
