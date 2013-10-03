graham-scan
==========
Creates a convex hull using Graham's Scan

## Example

```javascript
var grahamScan = require("../grahamScan.js")

var points = [[0,0],[1,0],[1,1],[0,1],[.5,.5],[-1,-1]];

var boundaryPoints = grahamScan(points);

console.log(boundaryPoints);

//Prints out boundary points
```

## Install

    npm install graham-scan
    
## API

### `require("graham-scan")(points)`
Computes boundary points (ordered counter-clockwise) of points.

* `points` is an array of 2d points

**Returns** The boundary points.

## Credits
(c) 2013 Daniel Melanz. MIT License