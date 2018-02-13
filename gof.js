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


