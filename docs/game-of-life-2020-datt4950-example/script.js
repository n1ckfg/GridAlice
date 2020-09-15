// create a 32 x 32 grid of cells:
let dim = 256;
let grid = new field2D(dim);
let gridnext = new field2D(dim);

// called at start, and whenever Enter key is pressed:
function reset() {
  grid.set(function() { return random(2); });
}

// called before rendering each frame
function update(dt) {
  gridnext.set(function(x, y) { 
    let C = grid.get(x, y);
    
    let N = grid.get(x, y-1);
    let NE = grid.get(x+1, y-1);
    let E = grid.get(x+1, y);
    let SE = grid.get(x+1, y+1);
    let S = grid.get(x, y+1);
    let SW = grid.get(x-1, y+1);
    let W = grid.get(x-1, y);
    let NW = grid.get(x-1, y-1);
    let total = N+NE+E+SE+S+SW+W+NW;
    
    if (C==1) { // alive
      if (total < 2) {
        return 0; //death by loneliness
      } else if (total > 3) {
        return 0; // death by overcrowding
      }
    } else if (C==0) { // dead
      if (total == 3) {
        return 1; // reproduction
      }
    }
    // else state remains same:
    return C;
  });
  
  let temp = grid;
  grid = gridnext;
  gridnext = temp;
}

// called to render graphics
function draw(ctx) {
  grid.draw();
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