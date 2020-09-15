// Template page for developing minimal artificial life simulations
// see http://alicelab.world/digm5950/labs.html for more documentation

// global declarations here

// called at start, and whenever Enter key is pressed:
function reset() {
    // (re)initialization here
}

// called before rendering each frame
// dt is the time in seconds since the last update()
// (the global variable `now` gives the time since start in seconds)
// updates can be 'paused' using the spacebar
function update(dt) {
    // simulation code here
}

// called to render graphics
// ctx is  an HTML5 canvas 2D rendering context
// Escape key will toggle fullscreen
function draw(ctx) {
    // rendering code here
}


// called when any mouse (or touch) events happen
// kind is the event type (down, up, move, etc.)
// pt is a normalized mouse coordinate
// id refers to any button pressed/released
function mouse(kind, pt, id) {

}

// called when any key events happen
// kind is the event type (down, up, etc.)
// key is the key (or keycode) pressed/released
function key(kind, key) {
  
}