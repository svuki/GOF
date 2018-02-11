var canvas_width  = 900;
var canvas_height = 500;
var pixel_size    = 10;
var the_canvas = document.getElementById('gof-canvas');
var the_ctx = the_canvas.getContext('2d');
var the_gof = new Gof(classic_rule);




function draw_cell(ctx, val, i, j) {
	let to_canv_coord = (i) => i * pixel_size;
	let color = val ? 'black' : 'white';
	ctx.fillStyle = color;
	ctx.fillRect(to_canv_coord(i), to_canv_coord(j), 10, 10);

}

function apply_rule(rule_fn, tdarray){
  return tdarray.map ( rule_fn );
}

function Gof(rule) {
	this.rule = rule;
	this.cells = new TDArray(90, 50);
	this.next  = function () { this.cells = apply_rule(this.rule, this.cells); };
	//TODO: what to do for toggle of more than one possible val?
	this.toggle = (i, j) => {
		var val = this.cells.at(i,j) ? 0 : 1
		this.cells.set(i,j,val);
		draw_cell(the_ctx, val, i, j);
	}
	this.show = function() {this.cells.for_each ((val, i, j) => draw_cell(the_ctx, val, i, j));} 
	this.clear = () => {this.cells = this.cells.map( () => 0 );
			    this.show()}	
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


function to_gof_coord(x) { 
	return Math.floor( (x - 10) / pixel_size);
}

the_canvas.addEventListener('click', 
	    		(e) => {the_gof.toggle(to_gof_coord (e.clientX), to_gof_coord (e.clientY) )} )
var rate_cont = new SpeedController(n=1000, () => { the_gof.next(); the_gof.show()})
function toggle_go() {rate_cont.toggle()}
function reset() {the_gof.clear()}

var rate_slider = document.getElementById("rate-slider");
rate_slider.onchange = function() {rate_cont.set_rate(this.value)}


