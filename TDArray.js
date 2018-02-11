function mapmap (arr, f) {
    //applies f to each element of f, producing
    //a new 2D array. The arguments passed to f are
    // (val, row_index, col_index, arr)
    return arr.map( (arr, r) =>
		    (arr.map( (val, c) =>
			      f(val, r, c, arr))));
}

function arr_sum (arr) {
    ///returns the sume of the elements of arr
    return arr.reduce( (a, n) => a + n);
}

function range (x, y) {
    //if only passed one value, returns the [0, 1, ..., x - 1]
    //if passed two values returns [x, x + 1, ..., y]
    if (y) {
        return Array.from({length : y - x}, (v, i) => i + x);
    }
    else {
        return Array.from({length : x}, (v, i) => i);
    }
}

function TDArray (rows, cols=rows, init_fn=undefined, wrap=true) { 
    // Constructor for two dimensional arrays. 
    // init_fn is a function that is passed (row_index, col_index)
    // If no init_fn is specified, all elements are initialized to 0.
    // The boolean wrap determines whethers the rows and cols 'wrap' 
    // around: if wrap is true, then at(i, j) == at(i mod rows, j mod cols).

    var arr = [];
    for (i = 0; i < rows; i++){
	    arr.push(new Array(cols).fill(0));  
    }
  
    if (init_fn) {
        arr = mapmap(arr, (v, i, j) => init_fn(i, j));
    }
  
    // TODO: r and c only work if i > -rows and j > -cols
    // because x % n <= 0 if x <= 0 for any n
    var r = wrap ? (i) => (i + rows) % rows
                    : (i) => i;
    var c = wrap ? (j) => (j + cols) % cols
                    : (j) => j;
    this.rows = rows;
    this.cols = cols;	
    this.show = () => console.log(arr);
    this.at  = (i, j) => arr[r(i)][c(j)];
    this.set = (i, j, val) => arr[r(i)][c(j)] = val;
    this.sum = () => arr.reduce( (a, n) => a + arr_sum(n), 0);
    this.map = function (f) {
    return new TDArray(rows, 
                       cols, 
                       (i, j) => f(this.at(i,j), i, j, this), 
                       wrap);
    };
    this.for_each = (f) => {
	    for (i = 0; i < this.rows; i++) {
		    for (j = 0; j < this.cols; j++) {
		    	f(arr[i][j], i, j);
		    }
	    }
    }	
    this.row = (i) => arr[r(i)];
    this.col = (j) => arr.map( (a) => a[c(j)] );
    this.nbhood = function (i, j, row_d, col_d=row_d) {
        if (! wrap) {
             console.log("Warning: nbhood called on TDArray with wrap = false.");
        }
    
        let row_indices = range(i - row_d, i + 1 + row_d).map(r);
        let col_indices = range(j - col_d, j + 1 + col_d).map(c);
   
   // select the right rows
        let arrs = row_indices.map( (i) => 
                    col_indices.map ( (j) => 
                      this.at(i,j) ) );
    
        return new TDArray(2 * row_d + 1, 2 * col_d + 1,
                          (i, j) => arrs[i][j],
                          wrap);
    };
}

