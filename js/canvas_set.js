// This file contains a constructor for game of life canvases. These structures
// consist of two overlaid canvases. The bottom canvas handles the display of
// gamestates while the top canvas handles the display of grids and click detection.


function Canvas_set(canvas_id, cell_size=10) {
    this.under_canvas = $(canvas_id).get(0);

    if (this.under_canvas === undefined)
	throw ("Error: Canvas_set passed invalid canvas-id: " + canvas_id);

    //create and initialize the top canvas directly on top of the exiting canvas
    let o_canvas = document.createElement('canvas');
    o_canvas.height = this.under_canvas.height;
    o_canvas.width = this.under_canvas.width;
    $(o_canvas).css('position', 'absolute');
    $(o_canvas).css('top', $(canvas_id).css('top'));
    $(o_canvas).css('left', $(canvas_id).css('left'));
    $(o_canvas).css('z-index', 1 + parseInt($(canvas_id).css('z-index')));
    this.under_canvas.after(o_canvas);
    this.over_canvas = o_canvas;
   
    this.set_gamestate = undefined;
    this.get_gamestate = undefined;
    
    //a projector is used to handle displaying of gamestates 
    this.projector = new Projector(this.under_canvas); //initialized in initialize()
    this.grid = new Grid(this.over_canvas, cell_size);

    // a coordiante handler is used to manage mappings beetween (x,y) position clicks on
    // the over canvas and (i, j) logical indicies in the gamestate. This mapping changes with
    // every change in displayed cell size.
    this.coordinate_handler = undefined; //set in initialize()
    
    this.initialize = function(gamestate, cell_size, getter, setter) {
	this.set_gamestate = setter;
	this.get_gamestate = getter;
	this.coordinate_handler = new Coordinate_handler(this.under_canvas,
							 gamestate, cell_size);
	this.projector.initialize(gamestate, this.coordinate_handler);
	
    }

    this.change_gamestate = function(gamestate, cell_size){
	// change_gamestate is used when one wants to project a new gamestate of
	// different dimensions than the last gamestate
	this.coordinate_handler = new Coordinate_handler(this.under_canvas,
							 gamestate, cell_size);
	this.projector.resize(this.coordinate_handler, gamestate);
    }
    
    this.toggle = function(x,y) {
	let i = this.coordinate_handler.y_i(y);
	let j = this.coordinate_handler.x_j(x);
	let a = this.get_gamestate().toggle(i,j);
	this.set_gamestate(a);
    }

    //By default, clicking toggles the underlying cell
    $(this.over_canvas).click( (e) => this.toggle(e.offsetX, e.offsetY));

    this.merge = function(otherGameState, x, y) {
	// copies in the data in otherGameState into the current gamestate
	// at the logical index (i,j) corresponding to the canvas coordinates (x,y)
	let i = this.coordinate_handler.y_i(y);
	let j = this.coordinate_handler.x_j(x);

	this.set_gamestate(this.get_gamestate().merge(otherGameState, i, j));
    }

    this.project = function() {
	// displays the current game_state onto the under_canvas
	this.projector.project(this.get_gamestate());
    }
    this.toggle_grid = function() {
	// show/hide the grid
	this.grid.toggle();
    }
}



    
