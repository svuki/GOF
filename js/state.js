const state = makeObservable();
state.rate = 1000;
state.step_on = false;
state.grid_on = false;
state.cell_size = 10;
state.pattern = newEmptyGameState(30, 30);
state.gamestate = undefined;
state.rule = classic_rule; //By default the rule is B3/S23
state.save_list = [];


function toggle_step() {
    state.step_on = state.step_on ? false : true;
}

function toggle_grid() {
    state.grid_on = state.grid_on ? false : true;
}

function snapshot() {
    return {
	gamestate : state.gamestate,
	rule : state.rule,
    };
}

function load_snapshot(snapshot) {
    state.gamestate = snapshot.gamestate;
    state.rule = snapshot.rule;
}

function add_to_save_list(x) {
    state.save_list.push(x);
    state.notify("save_list");
}

//---------------------------------------------------------------
//----- Initializing the main canvas and the initial gamestate
//---------------------------------------------------------------
const gol_canvas = $(gol_canvas_id).get(0);
state.gamestate = GameStateFromCanvas(gol_canvas, 5);

//Create and Initialize main canvas set
const main_c_set = new Canvas_set(gol_canvas_id, 10);
main_c_set.initialize(state.gamestate,
		      10,
		      () => state.gamestate,
		      (g) => state.gamestate = g);

//Default behavior for clicks is to toggle the underlying cell.
//We override it here so that shift-clicking will copy in the currently saved pattern
$(main_c_set.over_canvas).unbind('click');
$(main_c_set.over_canvas).click( function(e) {
    if (e.shiftKey)  
	main_c_set.merge(state.pattern, e.offsetX, e.offsetY);
    else
	main_c_set.toggle(e.offsetX, e.offsetY);
});

state.addObserver('gamestate', main_c_set);
state.addObserver('grid_on', main_c_set);
state.addObserver('cell_size', main_c_set);
	
main_c_set.update = function(property) {
    switch(property) {
    case 'gamestate':
	this.project();
	break;
    case 'grid_on':
	this.toggle_grid();
	break;
    case 'cell_size':
	this.coordinate_handler.resize(state.cell_size);
	this.projector.resize(this.coordinate_handler);
	this.grid.resize(state.cell_size);
	break;
    }
}


//-----------------------------------------------------------------------
//------------- Rate of Game Evolution Control --------------------------
//-----------------------------------------------------------------------
const stepper = new RateController(state.rate, function() {
    state.gamestate = apply_rule(state.rule, state.gamestate);
});
				  
state.addObserver('rate', stepper);
state.addObserver('step_on', stepper);
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

//----------------------------------------------------------------------
//----------------- Setting up the small canvas-------------------------
//----------------------------------------------------------------------
const pattern_c_set = new Canvas_set(pattern_canvas_id, 10); 
pattern_c_set.initialize(state.pattern, 10,
			 () => state.pattern,
			 (g) => state.pattern = g);

pattern_c_set.toggle_grid();

state.addObserver('pattern', pattern_c_set);

pattern_c_set.update = function(property) {
    switch (property) {
    case 'pattern':
	const csize = auto_cell_size(pattern_c_set.under_canvas, state.pattern);
	this.change_gamestate(state.pattern, csize);
	this.grid.resize(csize);
	break;
    }
}



//-------------------------------------------------------------------
//------------------ RLE text area ----------------------------------
//-------------------------------------------------------------------


$(rle_textarea_id).val(patterns.backrake_1);
state.pattern = rle.decode(patterns.backrake_1).gamestate;

//------------------------------------------------------------------
//-------------------- Save List -----------------------------------
//------------------------------------------------------------------

const save_list = {
    update : function (property) {
	switch (property) {
	case 'save_list':
	    addToSaveList(state.save_list[state.save_list.length - 1]);
	    break;
	}
    }
}
state.addObserver("save_list", save_list);
