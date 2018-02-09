console.log("script running...");
var canvas_width  = 900;
var canvas_height = 500;
var canvas = document.getElementById('gof-canvas');
var ctx    = canvas.getContext('2d');


function showCells(arr) {
    for (r = 0; r < a_rows; r++) {
	for (c = 0; c < a_cols; c++) {
	    if (arr[r][c] === 1) {
		showPixel(r, c)
	    }
	}
    }
}

function modDec(n, m) {
    return (n - 1 + m) % m;
}
function modInc(n, m) {
    return (n + 1 + m) % m;
}

function neighbor_indices(row, col, rows, cols){
    // returns an array of 8 indices
    var rowDec = modDec(row, rows);
    var rowInc = modInc(row, rows);
    var colDec = modDec(col, cols);
    var colInc = modInc(col, cols);
    return [[rowDec, colDec],
	    [rowDec, col],
	    [rowDec, colInc],
	    [row, colDec],
	    [row, colInc],
	    [rowInc, colDec],
	    [rowInc, col],
	    [rowInc, colInc]];
}

function neighbor_vals(row, col, rows, cols, arr){
    return neighbor_indices(row, col, rows, cols)
           .map( (x) => arr[x[0]][x[1]] );
}

// arr.map (val, index, arr) ==> ...
// arr_outer.map (arr_inner, row, arr) ==> arr_inner, co
function mapmap (arr, f) {
    // f ( i , j , val ,arr
    return arr.map( (arr, r) =>
		    (arr.map( (val, c) =>
			      f(val, r, c, arr))));
}

function Cells(rows, cols, f = () => 0){
    // arr[i][j] is f(i, j)
    // if f is not specified, defaults to 0

    var arr = new Array();
    for (i = 0; i < rows; i++){
	arr.push(new Array(cols).fill(0));
    }
 
    arr = mapmap(arr, f);
    var ret =  {rows      : rows,
		cols      : cols,
		get_arr   : (()         => arr),
		set_arr   : (new_arr)   => arr = new_arr,
		at        : (r, c)      => arr[r][c],
		set       : (r, c, val) => arr[r][c] = val,
		for_each  : (f)         => mapmap (arr, f),
		map       : (f)         => cells(rows, cols, f),
		map_set   : (f)         => arr = mapmap(arr, f),
		nbhood    : (r, c)      => neighbor_vals(r, c, rows, cols, arr),
	       };
    ret.map_set = function(f) {arr = mapmap(arr, (val, i, j, a) => f(val, i, j, ret))};
    return ret;
}

function assert(bool, str) {
    if (bool) {
	return;
    }

    console.log(str);
}

function test_cells() {
    var t = Cells(3, 3, () => 0);
    assert(t.rows === 3, "Rows.");
    assert(t.cols === 3, "Cols.");
    assert(t.at(0, 0) === 0, "at() gets initialized value.");
    t.set(0, 0, 1);
    assert(t.at(0, 0,) === 1, "at() sees set values.");
    t.map_set( (r, c) => 3);
    assert(t.get_arr().every( (row) => (row.every( (x) => x == 3 ))), "imap_set sets the values.")
    console.log("Test completed.");
}
test_cells();
    
function zeroOrOne(){
    if (Math.random() >= 0.5) {
	return 1;
    }
    else {
	return 0;
    }
}

function decide_fate(val, sum_n) {
    if (val === 1 && (sum_n === 3 || sum_n === 4))
    {
	return 1;
    }
    else if (val === 0 && (sum_n === 4))
    {
	return 1;
    }
    else
    {
	return 0;
    }
}

function gof(pixel_size, canvas){
    var a_rows     = canvas_height / pixel_size;
    var a_cols     = canvas_width / pixel_size;
    var pixel_size = pixel_size;
    var cells      = Cells(a_rows, a_cols);
    var ctx        = canvas.getContext('2d');
    var show_pixel   = function showPixel(val, i, j){
	ctx.fillStyle = val ? "black" : "white";
	ctx.fillRect(j * pixel_size, i * pixel_size, pixel_size, pixel_size);
    }
  
    
    return {
	set        : (i, j) => cells.set(i,j, 1),
	pixel_size : ( () => pixel_size),
	cells      : ( () => cells ),
	map_set    : (f) => cells.map_set(f),
	display    : () => cells.for_each( show_pixel ),
	next       : () => cells.map_set( (val, i, j, cells) =>
					  decide_fate (val, cells
						       .nbhood(i, j)
						       .reduce( (acc, n) => acc + n ) ) ),
	ruleset    : undefined,
    };
}

window.setInterval( function () {
    g.next();
    g.display();
}, 1000);
		



var g = gof(10, canvas);
g.display();


function t() {
    flag = 0;
    g.map_set( (val, i, j) => zeroOrOne() );
    g.display();
}
