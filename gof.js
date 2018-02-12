// This file defines Gof and Decorate_gof. A Gof (game of life) is a two 
// dimensional array, a rule, which defines the next generation of the array.
// A decorated_gof is is a gof associated with a canvas. Interactions through
// a decoared_gof update what is displayed on the canvas.


function apply_rule(rule_fn, tdarray){
  return tdarray.map ( rule_fn );
}

function Gof(cols, rows, rule=classic_rule) {
	this.generation = 0;
	this.rule = rule;
	this.cells = new TDArray(cols, rows);
	this.next  = function () { 
		this.cells = apply_rule(this.rule, this.cells); 
		this.generation++
	};
	//TODO: what to do for toggle of more than one possible val?
	this.toggle = (i, j) => {
		var val = this.cells.at(i,j) ? 0 : 1
		this.cells.set(i,j,val);
		return val;
	};
	this.clear = () => {
		this.cells = this.cells.map( () => 0 );
		this.generate = 0;
	};	
    this.copy = function() {
        let ret = new Gof(cols, rows, this.rule);
        ret.generation = this.generation; 
        ret.cells = this.cells.copy();
        return ret;
    }
} 

function classic_rule(val, i, j, td){
	let s = td.nbhood(i,j,1,1).sum();
        //because the value at (i,j) is included in the sum
        //we check for s == 3 or 4 instead of s == 2 or 3
        if (val === 1 && (s === 3 || s === 4)) {
         	return 1;
        }
        else if (val === 0 && s === 3){
                return 1;
        }
        return 0;
} 

const colors = {0 : 'white', 1: 'black' };

function draw_cell(ctx, cell_size, val, i, j) {
	let to_canv_coord = (i) => i * cell_size;
	let color = colors[val];
	ctx.fillStyle = color;
	ctx.fillRect(to_canv_coord(i), to_canv_coord(j), 10, 10);

}
function canvas_to_gof(canvas, cell_size=10) {
    //creates a game of life representation with corresponding dimensions
    //to the CANVAS and CELL_SIZE
    return new Gof(canvas.width / cell_size, canvas.height / cell_size);
}

function Decorated_gof(canvas, cell_size=10) {
    
    const ctx = canvas.getContext('2d');
    const from_canvas = (x) => Math.floor(x / cell_size);
    const to_canvas  = (i) => i * cell_size;
    let gof = canvas_to_gof(canvas, cell_size);
    const draw_cell = (val, i, j) => {
        let color = colors[val];
        ctx.fillStyle = color;
        ctx.fillRect(to_canvas(i), to_canvas(j), cell_size, cell_size);
    }
    this.show_gof = () => gof.cells.show();    
    
    this.toggle = (i,j) => {
        let val = gof.toggle(i,j);
        draw_cell(val, i, j);
    }
    
    this.show = () => gof.cells.for_each( draw_cell );
    this.next = () => { 
        gof.next(); 
        this.show();
    }
    
    this.clear = () => {
	    gof.clear();
	    this.show();
    }

    this.saved_pattern = undefined;
    this.handle = (e_down_coords, e_up_coords) => {
        const i0 = from_canvas(e_down_coords[0]);
        const j0 = from_canvas(e_down_coords[1]);
        const i1 = from_canvas(e_up_coords[0]);
        const j1 = from_canvas(e_up_coords[1]);

        // if the events occur in the same pixel, toggle it
        if (i0 === i1 && j0 === j1) {
            this.toggle(i0, j0);
        }

        else {
            this.saved_pattern = gof.cells.rect(i0, j0, i1, j1);
        }
    }
    this.handle_merge = function(x,y) {
        if (this.saved_pattern) {
            gof.cells.merge(this.saved_pattern, from_canvas(x), from_canvas(y));
            this.show();
        }
    }
    this.save_gof = function() {
        return gof.copy();
    }
    this.load_gof = function(new_gof) {
        gof = new_gof;
        this.show();
    }
    this.generation = () => gof.generation;        
}
    

