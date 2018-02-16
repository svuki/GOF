//functions related to projected game states on canvasas

const colors = {0 : 'white', 1: 'black'};

function draw_cell(ctx, cell_size, val, i, j, i_offset, j_offset) {
    const to_canv_x = (j) => j * cell_size + j_offset;
    const to_canv_y = (i) => i * cell_size + i_offset; 
    let color = colors[val];
    ctx.fillStyle = color;
    ctx.fillRect(to_canv_y(j), to_canv_x(i), cell_size, cell_size);
}

function calculate_rectangle(canvas, gstate, cell_size) {
    //Returns the coordinates of the centered rectangle of gstate's cells that can
    //be shown with the given cell_size on the canvas
    const canv_rows = canvas.height / cell_size;
    const canv_cols = canvas.width / cell_size;

    const total_rows = gstate.cells.rows;
    const total_cols = gstate.cells.cols;

    const i_offset = ((canv_rows - Math.floor(canv_rows)) / 2) * cell_size;
    const j_offset = ((canv_cols - Math.floor(canv_cols)) / 2) * cell_size;

    const row_offset = (total_rows - canv_rows) / 2;
    const col_offset = (total_cols - canv_cols) / 2;

    //find the coordinates of the centered rectange of cells that can
    //be drawn in the given canvas
    const i_0 = Math.ceil(row_offset);
    const j_0 = Math.ceil(col_offset);
    const i_1 = Math.ceil(total_rows - row_offset);
    const j_1 = Math.ceil(total_cols - col_offset);
    return { i_0 : i_0,
	     j_0 : j_0,
	     i_1 : i_1,
	     j_1 : j_1,
	     i_offset : i_offset,
	     j_offset : j_offset
	   };
}

function project_game_state(canvas, gstate, cell_size) {
    const ctx = canvas.getContext('2d');
    const coords = calculate_rectangle(canvas, gstate, cell_size);

    gstate.cells.rect(coords.i_0, coords.j_0, coords.i_1, coords.j_1).for_each(
	(val, i, j, tdarr) =>
	    draw_cell(ctx, cell_size, val, i, j, coords.i_offset, coords.j_offset) );
}

