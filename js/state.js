const state = {
    rate : 1000,
    step_on: false,
    grid_on: false,
    cell_size : 10,
    pattern : undefined,
    gamestate : undefined,
    rule : undefined,
    
    observers : {
	rate : [],
	step_on : [],
	grid_on : [],
	cell_size : [],
	pattern : [],
	gamestate : [],
	rule : []
    },
    
    add_observer : function(property, obj) {
	//Property is a string corresponding to one of the elements of state.observers,
	//obj is the object subscribing to updates
	if (! this.observers.hasOwnProperty(property))
	    console.log("Error, attempted to add observer to state for nonexistent property: " + property);
	else
	    this.observers[property].push(obj);
    },
    notify : function(property) {
	//Property is a string corresponding to one of the elements of state.observers
	if (! property in this.observers)
	    console.log("Error, state attempted to notify on nonexistent property: " + property);
	else
	    this.observers[property].forEach( (it) => it.update(property) );
    }
	
}


function set_rate(new_rate) {
    state.rate = new_rate;
    state.notify( "rate" );
}

function toggle_step() {
    state.step_on = state.step_on ? false : true;
    state.notify("step_on");
}

function toggle_grid() {
    state.grid_on = state.grid_on ? false : true;
    state.notify("grid_on");
}

function set_cell_size(new_size) {
    state.cell_size = new_size;
    state.notify("cell_size");
}

function set_gamestate(new_state) {
    state.gamestate = new_state;
    state.notify("gamestate");
}

function get_gamestate() {
    return state.gamestate;
}

function set_rule(new_rule) {
    state.rule = new_rule;
    state.notify("rule");
}




///Get Canvases
const grid_canvas = $("#grid-canvas").get(0);
const gol_canvas = $("#gol-canvas").get(0);

//Set initial game state: the maximum zoom size is 5
state.gamestate = GameStateFromCanvas(gol_canvas, 5);

//By default, the rule is B3/S23
state.rule = classic_rule;

//Create and Initialize main canvas set
console.log("making main_canvas");
const main_canvas = new Canvas_set(gol_canvas, grid_canvas, 10);
console.log("ok, initializing it");
main_canvas.initialize(state.gamestate);

///Create the stepper which controls the rate the game of life evolves at
const stepper = new RateController(state.rate, () =>
				   set_gamestate(apply_rule(state.rule, state.gamestate)));
state.add_observer('rate', stepper);
state.add_observer('step_on', stepper);
stepper.update = function(property) {
    switch (property) {
    case 'rate':
	this.set_rate(state.rate);
	break;
    case 'step_on':
	this.toggle();
	break;
    }
}
