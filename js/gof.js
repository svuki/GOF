// This file defines Gof and Decorate_gof. A Gof (game of life) is a two 
// dimensional array, a rule, which defines the next generation of the array.
// A decorated_gof is is a gof associated with a canvas. Interactions through
// a decoared_gof update what is displayed on the canvas.


function GameState (cells_tdarr) {
	this.cells = cells_tdarr;
}

function newEmptyGameState(rows, cols) {
    return new GameState(new TDArray(rows, cols, () => 0, wrap_b = true));
}

GameState.prototype.toggle = function(i,j) {
    const val = this.cells.at(i,j) === 0 ? 1 : 0;
    this.cells.set(i,j,val);
    return val;
}
GameState.prototype.clear = function () {
    this.cells = this.cells.map( () => 0 );
}
GameState.prototype.copy = function () {
    return new GameState(this.cells.rows, this.cells.cols, this.cells.copy())
}
GameState.prototype.soup = function () {
    //randomly fill the gameState with 1's and 0's
    this.cells = this.cells.map( () => Math.random() > 0.5 ? 1 : 0);
}
GameState.prototype.merge = function(otherGameState, i=0, j=0) {
    //takes the cells of otherGameState and copies them in such that
    //cells[0][0] of otherGameState is at [i][j] in this game state
    this.cells.merge(otherGameSate.cells, i, j);
}
GameState.prototype.map = function (f) {
    return new GameState(this.cells.map(f));
}


function Rule(s) {
    const matches = s.match("[B,b](.*)/[S,s](.*$)")
    this.b = matches[1].split("").map( (v) => parseInt(v, 10) );
    this.s = matches[2].split("").map( (v) => parseInt(v, 10) );
    this.string = s
    
}
const classic_rule = new Rule("B3/S23");

function rule_fn(rule) {
    return (val, i, j, tdarr) => {
	let sum = tdarr.nbhood(i,j,1,1).sum() - val;
	if (val === 0 && rule.b.includes(sum))
	    return 1;
	else if (val === 1 && rule.s.includes(sum))
	    return 1;
	else
	    return 0;
    }
}

function apply_rule(rule, gstate) {
    return gstate.map(rule_fn(rule));
}
    
function Game_of_life(initial_state, rule=classic_rule) {
    this.current_state = initial_state;
    this.rule = rule;
    this.toggle = (i,j) => this.current_state.toggle(i,j);
    this.step = function() {
	this.current_state = apply_rule(rule, this.current_state);
    }
    this.snapshot = function() {
	return {state : this.current_state,
		rule  : this.rule};
    }
}


    
