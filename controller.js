const gof_canvas = document.getElementById('gof-canvas');
const grid_canvas = document.getElementById('grid-canvas');
const rate_slider = document.getElementById('rate-slider');

const control = {
    grid_canvas : grid_canvas,
    gof_canvas : gof_canvas,
    grid : new Grid(grid_canvas),
    current_gof : new Decorated_gof(gof_canvas),
    r_control : new RateController(1000, 
                                   function() {control.current_gof.next();}),
    saves   : [],
    button0 : () => toggle_gof_on(),
    button1 : () => reset_gof(),
    button2 : () => toggle_grid(),
    button3 : () => save(),
};



function toggle_gof_on() {control.r_control.toggle()};
function reset_gof() {control.current_gof.clear()};
function toggle_grid() {control.grid.toggle()};

rate_slider.onchange = function() {control.r_control.set_rate(this.value)}
    
//Handle toggling pixels by clicking and copying regions by dragging
function toggler(decorate_gof){ 
    let down_event = undefined;

    return function(e) {
        if (e.type === "mousedown") {
            if (e.shiftKey) {
                console.log("merging!")
                control.current_gof.handle_merge(e.offsetX, e.offsetY);
            }
            else {
                down_event = [e.offsetX, e.offsetY];
            }
        }
        else if (e.type === "mouseup" 
                 && down_event !== undefined
                 && e.shiftKey === false) {
            decorate_gof.handle(down_event, [e.offsetX, e.offsetY]);
        }
    }
}

const mouse_click_handler = toggler(control.current_gof);

grid_canvas.addEventListener('mousedown', 
            (e) => mouse_click_handler(e));
grid_canvas.addEventListener('mouseup', 
            (e) => mouse_click_handler(e));


//Saving and resotoring
const save_list = document.getElementById('save-list');
let save_counter = 0;

function restore(n) {
    let gof = control.saves[n];
    control.current_gof.load_gof(gof);
}


function save() {
	control.saves.push(control.current_gof.save_gof());
	save_list.insertAdjacentHTML('beforeend', 
              "<li id=save" + save_counter + "> New Save </li>")
	const elem = document.getElementById("save" + save_counter);
    let val = save_counter;
	elem.addEventListener('click', () => restore(val));
	save_counter++;
}


