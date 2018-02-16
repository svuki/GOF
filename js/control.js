const grid_canvas = $("#grid-canvas").get(0);
const grid = new Grid(grid_canvas);
$("#toggle_grid_btn").click( () => grid.toggle() );
				   


//the zoom effect is achieved by increasing the displayed pixel size;
$("#zoom-slider").on( 'input', function() {set_new_pixel_size(this.value) });
function set_new_pixel_size(new_size) {
    grid.resize(new_size);
    gol_presenter.resize(new_size);
}


const gol_canvas = $("#gol-canvas").get(0);
const gol_presenter = new Presenter(gol_canvas);

$("#soup_btn").click( () => gol_presenter.soup() );
$("#reset_btn").click( () => gol_presenter.reset() );

const step_rcontrol = new RateController(1000, () => gol_presenter.step() );
$("#toggle_step_btn").click( () => step_rcontrol.toggle() )
$("#rate_slider").on( "input",
		      function() {
			  step_rcontrol.set_rate(this.value)});

//toggle cells
$("#grid-canvas").click( (e) => gol_presenter.click_cell(e.offsetX, e.offsetY));
