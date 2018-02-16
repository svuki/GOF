function make_thumbnail(x_size, y_size, gstate) {
    const canvas = document.createElement('canvas');
    canvas.width = x_size;
    canvas.height = y_size;
    canvas.class = "saved-state-thumbnail";
    const pixel_size = x_size <= gstate.cells.cols ? 1 : Math.floor(x_size / gstate.cells.cols);
    project_game_state(canvas, gstate, pixel_size);
    return canvas
}
    
