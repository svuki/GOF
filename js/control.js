//buttons and sliders
$("#toggle_grid_btn").click( () => toggle_grid() );
$("#soup_btn").click( () => set_gamestate(state.gamestate.soup()) );
$("#zoom-slider").on( 'input', function() { set_cell_size(this.value) });
$("#reset_btn").click( () => set_gamestate(state.gamestate.clear()) );
$("#toggle_step_btn").click( () => toggle_step() );
$("#rate_slider").on( 'input',
		      function() {
			  set_rate(this.value)});


