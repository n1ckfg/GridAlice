/*
* Nick Fox-Gieg / 218280800
* Assignment 1
* "GridAlice"
* No user interaction
* See MAIN CONTROLS below for interesting variables
*/

"use strict";

const dim = 256
let image = new field2D(dim);

// ---     MAIN CONTROLS     ---
// if you want to avoid chain reactions, try 0, 20, 100, 0.2
const delayCounter = 4;    // int, delays start of spread
const lifeCounter = 100;    // int, how long spread lasts
const respawnCounter = 200; // int, how long until retrigger
const globalChaos = 0.2;    // 0.0 = min, 1.0 = max
// ----
const oddsLerpSpeed = 0.005;
const oddsSuddenDeath = 0.06;
// -------------------------
let choose = 0;    // int
const maxChoices = 7;    // int
// ----
let startX, startY;    // float
let mainGrid = [];  // GridGuy[][] 
let setRules = "";    // string

let odds_X_Yplus1 = 0.0;
let odds_Xminus1_Y = 0.0;
let odds_X_Yminus1 = 0.0;
let odds_Xplus1_Y = 0.0;
let odds_Xplus1_Yplus1 = 0.0;
let odds_Xminus1_YminuX1 = 0.0;
let odds_Xplus1_Yminus1 = 0.0;
let odds_Xminus1_Yplus1 = 0.0;

let cur_odds_X_Yplus1 = 0.0;
let cur_odds_Xminus1_Y = 0.0;
let cur_odds_X_Yminus1 = 0.0;
let cur_odds_Xplus1_Y = 0.0;
let cur_odds_Xplus1_Yplus1 = 0.0;
let cur_odds_Xminus1_YminuX1 = 0.0;
let cur_odds_Xplus1_Yminus1 = 0.0;
let cur_odds_Xminus1_Yplus1 = 0.0;    

let target;    // Target
let firstRun = true;

function reset() {  
    target = new Target();  

    pixelOddsSetup();
    initGlobals();
    
    for (let y = 0; y < dim; y++) {
        for (let x = 0; x < dim; x++) {
            rulesInit(x, y);
            guysInit(x, y);
        }

        console.log("init line " + y + " / " + dim);
    }
}

function update(dt) {
    cur_odds_X_Yplus1 = util.lerp(cur_odds_X_Yplus1, odds_X_Yplus1, oddsLerpSpeed);
    cur_odds_Xminus1_Y = util.lerp(cur_odds_Xminus1_Y, odds_Xminus1_Y, oddsLerpSpeed);
    cur_odds_X_Yminus1 = util.lerp(cur_odds_X_Yminus1, odds_X_Yminus1, oddsLerpSpeed);
    cur_odds_Xplus1_Y = util.lerp(cur_odds_Xplus1_Y, odds_Xplus1_Y, oddsLerpSpeed);
    cur_odds_Xplus1_Yplus1 = util.lerp(cur_odds_Xplus1_Yplus1, odds_Xplus1_Yplus1, oddsLerpSpeed);
    cur_odds_Xminus1_YminuX1 = util.lerp(cur_odds_Xminus1_YminuX1, odds_Xminus1_YminuX1, oddsLerpSpeed);
    cur_odds_Xplus1_Yminus1 = util.lerp(cur_odds_Xplus1_Yminus1, odds_Xplus1_Yminus1, oddsLerpSpeed);
    cur_odds_Xminus1_Yplus1 = util.lerp(cur_odds_Xminus1_Yplus1, odds_Xminus1_Yplus1, oddsLerpSpeed);

    try {
        target.run();

        if (target.armResetAll) {
            resetAll();
            target.armResetAll = false;
        } 
        
        image.set(function(x, y) {
            rulesHandler(x, y);
            return mainGrid[x][y].run();
        });
    } catch (e) {
        console.log(e);
        window.location.reload();
    }
}

function draw(ctx) {
    image.draw();
}

function initGlobals() {
    // make mainGrid a 2D array
    for (var y = 0; y < dim; y++) {
        var mg = [];
        for (var x = 0; x < dim; x++) {
            var g = new GridGuy(x, y, setRules, globalChaos, delayCounter, lifeCounter, respawnCounter);
            mg.push(g);
        }
        mainGrid.push(mg);
    }
}

function rulesHandler(x, y) {  // int, int
    let sw = mainGrid[x][y].switchArray;  // bool[]
    if (sw[0] || sw[1] || sw[2] || sw[3] || sw[4] || sw[5] || sw[6] || sw[7]) return;

    if (mainGrid[x][y].clicked) {
        //these are direction probabilities
        mainGrid[x][y + 1].kaboom = diceHandler(1, cur_odds_X_Yplus1);
        mainGrid[x - 1][y].kaboom = diceHandler(1, cur_odds_Xminus1_Y);
        mainGrid[x][y - 1].kaboom = diceHandler(1, cur_odds_X_Yminus1);
        mainGrid[x + 1][y].kaboom = diceHandler(1, cur_odds_Xplus1_Y);
        mainGrid[x + 1][y + 1].kaboom = diceHandler(1, cur_odds_Xplus1_Yplus1);
        mainGrid[x - 1][y - 1].kaboom = diceHandler(1, cur_odds_Xminus1_YminuX1);
        mainGrid[x + 1][y - 1].kaboom = diceHandler(1, cur_odds_Xplus1_Yminus1);
        mainGrid[x - 1][y + 1].kaboom = diceHandler(1, cur_odds_Xminus1_Yplus1);
    }

    if (Math.random() < oddsSuddenDeath) {
        mainGrid[x][y].clicked = false;
        mainGrid[x][y].kaboom = false;
        mainGrid[x][y].hovered = false;
        mainGrid[x][y].delayCountDown = mainGrid[x][y].delayCountDownOrig;
        mainGrid[x][y].lifeCountDown = 0;
        mainGrid[x][y].respawnCountDown = mainGrid[x][y].respawnCountDownOrig;
    }
}

function diceHandler(v1, v2) {  // int, int
    let rollDice = random(v1);  // float
    return rollDice < v2;
}

function rulesInit(x, y) {  // int, int
    setRules = "";
    if (x == 0 && y == 0) {
        setRules = "NWcorner";
    } else if (x == dim - 1 && y == 0) {
        setRules = "NEcorner";
    } else if (x == 0 && y == dim - 1) {
        setRules = "SWcorner";
    } else if (x == dim - 1 && y == dim - 1) {
        setRules = "SEcorner";
    } else if (y == 0) {
        setRules = "Nrow";
    } else if (y == dim - 1) {
        setRules = "Srow";
    } else if (x == 0) {
        setRules = "Wrow";
    } else if (x == dim - 1) {
        setRules = "Erow";
    }
}

function guysInit(x, y) {  // int, int
    mainGrid[x][y] = new GridGuy(x, y, setRules, globalChaos, delayCounter, lifeCounter, respawnCounter);
}

function resetAll() {
    startX = 0;
    startY = 0;
    for (let y = 0; y < dim; y++) {
        for (let x = 0; x < dim; x++) {
            mainGrid[x][y].hovered = false;
            mainGrid[x][y].clicked = false;
            mainGrid[x][y].delayCountDown = mainGrid[x][y].delayCountDownOrig;
            mainGrid[x][y].lifeCountDown = mainGrid[x][y].lifeCountDownOrig;
            mainGrid[x][y].respawnCountDown = mainGrid[x][y].respawnCountDownOrig;
            mainGrid[x][y].fillColor = mainGrid[x][y].fillColorOrig;
        }
    }
    
    pixelOddsSetup();
}

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

let randomValues = new Array(8);  // float[]

function pixelOddsSetup() {
    for (let i = 0; i < randomValues.length; i++) {
        randomValues[i] = util.random(1);
    }

    choose = util.randomInt(maxChoices);
    console.log("choose: " + choose);
    
    switch (choose) {
    case 0: 
        // 0. CROSS | OK
        //delayCounter = 4;
        odds_Xminus1_YminuX1 = 0;//randomValues[0]; // x-1 y-1
        odds_X_Yminus1 = 0.5;//randomValues[1]; // x y-1
        odds_Xplus1_Yminus1 = 0;//randomValues[2]; // x+1 y-1
        odds_Xminus1_Y = 0.5;//randomValues[3]; // x-1 y
        odds_Xplus1_Y = 0.5;//randomValues[4]; // x+1 y
        odds_Xminus1_Yplus1 = 0;//randomValues[5]; // x-1 y+1
        odds_X_Yplus1 = 0.5;//randomValues[6]; // x y+1
        odds_Xplus1_Yplus1 = 0;//randomValues[7]; // x+1 y+1        
        break;
    case 1:
        // 1. WOT | ?
        //delayCounter = 4;
        odds_Xminus1_YminuX1 = randomValues[0]; // x-1 y-1
        odds_X_Yminus1 = 1;//randomValues[1]; // x y-1
        odds_Xplus1_Yminus1 = 1;//randomValues[2]; // x+1 y-1
        odds_Xminus1_Y = randomValues[3]; // x-1 y
        odds_Xplus1_Y = 0;//randomValues[4]; // x+1 y
        odds_Xminus1_Yplus1 = 1;//randomValues[5]; // x-1 y+1
        odds_X_Yplus1 = 0;//randomValues[6]; // x y+1
        odds_Xplus1_Yplus1 = randomValues[7]; // x+1 y+1
        break;
    case 2: 
        // 2. OCEAN | OK
        //delayCounter = 4;
        odds_Xminus1_YminuX1 = 0;//randomValues[0]; // x-1 y-1
        odds_X_Yminus1 = 0;//randomValues[1]; // x y-1
        odds_Xplus1_Yminus1 = 0.1 * randomValues[2]; // x+1 y-1
        odds_Xminus1_Y = randomValues[3]; // x-1 y
        odds_Xplus1_Y = randomValues[4]; // x+1 y
        odds_Xminus1_Yplus1 = 0.1 * randomValues[5]; // x-1 y+1
        odds_X_Yplus1 = 0;//randomValues[6]; // x y+1
        odds_Xplus1_Yplus1 = 0;//randomValues[7]; // x+1 y+1 
        break;
    case 3: 
        // 3. MOUNTAINS
        //delayCounter = 4;
        odds_Xminus1_YminuX1 = 0;//randomValues[0]; // x-1 y-1
        odds_X_Yminus1 = 0.1;//randomValues[1]; // x y-1
        odds_Xplus1_Yminus1 = 0;//randomValues[2]; // x+1 y-1
        odds_Xminus1_Y = 0;//randomValues[3]; // x-1 y
        odds_Xplus1_Y = 0;//randomValues[4]; // x+1 y
        odds_Xminus1_Yplus1 = randomValues[5]; // x-1 y+1
        odds_X_Yplus1 = 0.5;//randomValues[6]; // x y+1
        odds_Xplus1_Yplus1 = randomValues[7]; // x+1 y+1    
        break;
    case 4: 
        // 4. DROPS
        //delayCounter = 4;
        odds_Xminus1_YminuX1 = 0;//randomValues[0]; // x-1 y-1
        odds_X_Yminus1 = 0;//randomValues[1]; // x y-1
        odds_Xplus1_Yminus1 = 0;//randomValues[2]; // x+1 y-1
        odds_Xminus1_Y = 0;//randomValues[3]; // x-1 y
        odds_Xplus1_Y = 0;//randomValues[4]; // x+1 y
        odds_Xminus1_Yplus1 = 0.1 * randomValues[5]; // x-1 y+1
        odds_X_Yplus1 = 1;//randomValues[6]; // x y+1
        odds_Xplus1_Yplus1 = 0.1 * randomValues[7]; // x+1 y+1    
        break;
    case 5: 
        // 5. DROPS_REVERSE
        //delayCounter = 4;
        odds_Xminus1_YminuX1 = 0.1 * randomValues[0]; // x-1 y-1
        odds_X_Yminus1 = 1;//randomValues[1]; // x y-1
        odds_Xplus1_Yminus1 = 0.1 * randomValues[2]; // x+1 y-1
        odds_Xminus1_Y = 0;//randomValues[3]; // x-1 y
        odds_Xplus1_Y = 0;//randomValues[4]; // x+1 y
        odds_Xminus1_Yplus1 = 0; //randomValues[5]; // x-1 y+1
        odds_X_Yplus1 = 0;//randomValues[6]; // x y+1
        odds_Xplus1_Yplus1 = 0; //randomValues[7]; // x+1 y+1    
        break;
    case 6:
        // 6. ALL RANDOM
        //delayCounter = 4;
        odds_Xminus1_YminuX1 = randomValues[0]; // x-1 y-1
        odds_X_Yminus1 = randomValues[1]; // x y-1
        odds_Xplus1_Yminus1 = randomValues[2]; // x+1 y-1
        odds_Xminus1_Y = randomValues[3]; // x-1 y
        odds_Xplus1_Y = randomValues[4]; // x+1 y
        odds_Xminus1_Yplus1 = randomValues[5]; // x-1 y+1
        odds_X_Yplus1 = randomValues[6]; // x y+1
        odds_Xplus1_Yplus1 = randomValues[7]; // x+1 y+1
        break;
    }
}
"use strict";

class GridGuy {
    
    constructor(x, y, s, cc, dc, lc, rc) {    // float, float, float, float, string, float, int, int, int     
        this.rulesArray = [ "NWcorner", "NEcorner", "SWcorner", "SEcorner", "Nrow", "Srow", "Wrow", "Erow" ];  // string[] 
        this.switchArray = [ false, false, false, false, false, false, false, false ];  // bool[]  
        
        this.currentTime = util.millis();  // int
        this.birthTime = this.currentTime;

        this.colClicked = [0,0.5,1];
        this.colKaboom = [1,0.5,0];
        this.col = this.colClicked;
        this.hovered = false;
        this.clicked = false;
        this.kaboom = false;

        this.posX = x;  // float
        this.posY = y;  // float
        this.chaos = Math.abs(1.0 - cc);  // float

        this.applyRule = s;  // string

        this.delayCountDownOrig = util.randomInt(dc * this.chaos, dc);  // int
        this.delayCountDown = this.delayCountDownOrig;  // int
        this.lifeCountDownOrig = util.randomInt(lc * this.chaos, lc);  // int
        this.lifeCountDown = this.lifeCountDownOrig;  // int
        this.respawnCountDownOrig = util.randomInt(rc * this.chaos, rc);  // int
        this.respawnCountDown = this.respawnCountDownOrig;  // int
        
        for (let i = 0; i < this.rulesArray.length; i++) {
            if (this.applyRule == this.rulesArray[i]) {
                this.switchArray[i] = true;
            }
        }

        //strokeLines = true;
    }

    run() {
        this.update();
        
        if (this.clicked) {
            this.col = this.colClicked;
            return this.colClicked;
        } else if (this.kaboom) {
            let t = this.currentTime / 10000;
            this.col[0] = util.lerp(this.colClicked[0], this.colKaboom[0], t);
            this.col[1] = util.lerp(this.colClicked[1], this.colKaboom[1], t);
            this.col[2] = util.lerp(this.colClicked[2], this.colKaboom[2], t);
            
            return this.col;
        } else {
            return 0;
        }
    }

    update() {
        this.currentTime = util.millis();

        if (util.distance(target.posX, target.posY, this.posX, this.posY) < 2) {
            this.hovered = true;
            this.birthTime = this.currentTime;
            this.col = this.colClicked;
        } else {
            this.hovered = false;
        }

        if (this.hovered && target.clicked) this.mainFire();

        if (this.kaboom) {
            this.birthTime = this.currentTime;
        
            if (this.delayCountDown>0) {
                this.delayCountDown--;
            } else {
                this.kaboom = false;
                this.clicked = true;
                this.delayCountDown = this.delayCountDownOrig;
            }
        }

        if (this.clicked) {
            if (this.lifeCountDown > 0) {
                this.lifeCountDown--;
            } else {
                this.clicked = false;
            }
        }

        if (this.lifeCountDown == 0 && this.respawnCountDown > 0) {
            this.respawnCountDown--;
        } 
        else if (this.respawnCountDown == 0) {
            this.lifeCountDown = this.lifeCountDownOrig;
            this.respawnCountDown = this.respawnCountDownOrig;
        }
    }

    mainFire() {
        this.clicked = true;
        this.kaboom = false;
        this.delayCountDown = this.delayCountDownOrig;
        this.lifeCountDown = this.lifeCountDownOrig;
        this.respawnCountDown = this.respawnCountDownOrig;
    }

}
"use strict";

class Target {

    constructor() {
        this.speedMin = 0.01;  // float
        this.speedMax = 0.05;  // float
        this.speed;  // float
        this.clickOdds = 0.2;  // float
        this.chooseOdds = 0.05;  // float
        this.markTime = 0;  // int
        this.timeInterval = 200;  // int
    
        this.posX = dim/2;  // float
        this.posY = dim/2;  // float
        this.targetX;  // float
        this.targetY;  // float
        this.minDist = 5;  // int
        this.clicked = false;
        this.armResetAll = false;
        this.ready = true;

        this.pickTarget();
    }

    run() {
        this.posX = util.lerp(this.posX, this.targetX, this.speed);
        this.posY = util.lerp(this.posY, this.targetY, this.speed);
        
        if (util.millis() > this.markTime + this.timeInterval || util.distance(this.posX, this.posY, this.targetX, this.targetY) < this.minDist) {
            this.pickTarget();
        }
    }
    
    pickTarget() {
        this.markTime = util.millis();
        
        this.targetX = util.lerp(this.posX, util.randomRange(0, dim), 0.5);
        this.targetY = util.lerp(this.posY, util.randomRange(0, dim), 0.5);
        
        this.speed = util.randomRange(this.speedMin, this.speedMax);
        let r = util.random(1);
        if (r < this.clickOdds) this.clicked = !this.clicked;
        if (r < this.chooseOdds) this.armResetAll = true;
    }

}
"use strict";

class Util {

    constructor() {
        //
    }

    lerp (start, end, value){
        return (1 - value) * start + value * end
    }

    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }

    map(s, a1, a2, b1, b2) {
        return b1 + (s - a1) * (b2 - b1) / (a2 - a1);
    }

    millis() {
        return parseInt(now * 1000);
    }

    diceHandler(value) {
        return Math.random() < value;
    }

    random(value) {
        return Math.random() * value;
    }

    randomRange(value1, value2) {
        return this.map(Math.random(), 0, 1, value1, value2);
    }

    randomInt(value) {
        return parseInt(Math.random() * value);
    }

    randomRangeInt(value1, value2) {
        return parseInt(this.map(Math.random(), 0, 1, value1, value2));
    }

}

const util = new Util();

/*
Future directions--

I have a simple simulation of film chemistry I want to port to Alice Tk. I'll
use it to determine the initial conditions of a cellular automata grid, then
research the use of living bacteria in film chemistry and derive a second set of
CA rules. 

Description of the film system follows:

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 

200729 Fwd - The cinematographer of Knives Out ends the film-vs.-digital debate
self

https://www.polygon.com/2020/2/6/21125680/film-vs-digital-debate-movies-cinematography
http://www.yedlin.net/OnColorScience/

A counterargument:
https://www.redsharknews.com/production/item/3184-is-the-secret-of-emulating-film-all-in-the-display-prep
 

DoP Steve Yedlin and director Rian Johnson often mix film and video cameras in
the same movie. So they embarked on a ten-year project to track their use of
each and compare the results, including in The Last Jedi and Knives Out.
Yedlin--who also has some computer graphics background--compiled the results in
a demo reel called the "Display Prep Demo" and a paper called "On Color
Science". 

(In cinematography, "display prep" refers to the baseline set of color
(information that's known before shooting, most importantly the characteristics
(of a particular film, tape, or digital format decided by the original engineers
(who designed it. Display prep is distinct from "color timing," the now-rare
(step of making global processing decisions in the lab where the film negative
(is developed, and "color grading", the more familiar final step of applying
(additional (non-destructive) color choices in post-production.)

TL;DR Some qualified people believe this is the definitive proof that film and
video cameras with equivalent resolution and dynamic range, and using comparable
post-processing techniques, can produce mathematically identical final images.
Assuming this, a lot of the unique qualities of film are imparted outside the
camera, during chemical processing. Objectively, film can't be "more real" than
video because a camera negative is bright orange--the orange tint is removed
after the fact. 

Yedlin identifies four qualities of film post-processing that can be replicated
in software:

1. Halation Meaning "the generation of halos": the optical glow around the edges
of a dark object standing in front of a light source. The chemical properties of
film--not the optics of the camera--make halation primarily red, no matter what
the color of the light source, and this is one of the most distinctive aspects
of the medium.

2. Gate weave Film vibrates slightly while passing through even a mechanically
sound camera. While strictly speaking this reduces image quality due to blur, it
also brings a pleasing familiarity to the final image because it subtly evokes
the irregular saccadic vibrations of our own eyes.

3. Grain Grain patterns aren't truly random, but are influenced
probabilistically by the processes of exposure and processing. This is why a
clip of film grain overlaid on video, or a fully randomized digital grain
graphic, doesn't look quite right. Faithful analog grain processes can be
modeled and reproduced in software.

4. Color rendition Changing colors is the most familiar aspect of film
post-processing, and it's one that's solved digitally with LUTs and not linear
transformations: you need a LUT to represent "the sum of many differences"
typical of chemical processing. For example, it's not just that with a given
chemical processing technique "reds become more yellowish," but they become
"yellower and yellower" once you reach a certain brightness.

One important criticism of Yedlin's analysis is whether a LUT can be produced of
enough sophistication to match digital to film in all lighting conditions. If
the process can't be fully automated, then it's not revealing fundamental truths
about imaging, and just proves that an artist with sufficient skill in
post-processing can manually reproduce a film image with great accuracy.

Counter-counterargument, doesn't that merely introduce a new specialization to
video, much like a film color timer--making global processing decisions that sit
in a gray area in between production and post-production?



200710 Bleach and other effects
https://www.wired.com/2014/08/ajay-malghan-bleached/
https://en.m.wikipedia.org/wiki/Bleach_bypass
http://louisejohnsonphotography.blogspot.com/2012/10/bleaching-photographs.html
https://www.huffingtonpost.ca/entry/seung-hwan-oh_n_5877124
https://www.pinterest.co.uk/pin/493073859177974051/
https://www.pinterest.co.uk/eleanormpx/documenting-colour-with-bleach/

TODO look at openFrameworks watercolor examples

200706 Basic components of an artificial chemistry Four components: 1. A set S
of possible molecule types.  This set could be finite or infinite (as far as we
know, the set of possible molecules in the universe is infinite). Molecules
could be represented in the program as symbols, character strings, numbers,
lambda-expressions, trees, etc.

2. A set R of possible reaction rules. Input combinations of input molecules
produce combinations of output molecules; e.g. A + B -> 2C or A + 2B -> A + D.
Note that the second example is a catalytic reaction, since one of the inputs
(A) is preserved unchanged. A reaction may also have other conditions, such as
ambient temperature; and may have an associated probability ("rate constant")
and energetic cost.

3. A population P of molecules (drawn from S) that exist at any moment.

4. An algorithm A specifying how to apply reaction rules R to the population P.
The output of A is the population of the next instant (P'). A reaction may also
have other conditions, such as ambient temperature; and may have an associated
probability ("rate constant") and energetic cost. The reaction algorithm could
take into account spatial proximity, or it could assume that all chemicals
rapidly disperse (the "well-stirred reactor" model), in which reactions are
selected stochastically. On the other hand, if concentrations of molecules are
represented as continuous numbers, differential equations may be used.

An important design choice is how to define the reaction rules. For a finite
system these could be designed by hand (or to model a well-known physical
system). For an infinite system they must be derived on demand; this could be
done programmatically according to reactant structures, in an approximation to
molecule bonding mechanisms (or protein folding). For example, a simple
demonstration AC uses integer division to define reactions: each molecule type
is an integer (greater than one), and two molecules can react if they leave no
remainder after division (the long-term behavior of this system tends to
increase the concentration of prime numbers). Another possibility is to generate
reactions and rates randomly as needed.

The algorithm may also include a source and sink: the source is a continuous
input of new (base) molecules, and a sink is a gradual removal of molecules to
maintain population size. In addition, certain reactions may be filtered to make
the whole system more interesting (e.g. discarding reactions that produce
nothing more than one of their inputs).

~ ~ ~ ...How might this apply to film chemistry?
https://en.wikipedia.org/wiki/Photographic_processing
https://en.wikipedia.org/wiki/Photographic_developer
https://en.wikipedia.org/wiki/Photographic_fixer
https://en.m.wikipedia.org/wiki/Film_grain
https://en.wikipedia.org/wiki/Color_motion_picture_film

...There are four main types of film processing, from least to most complex: B&W
negative B&W reversal Color negative Color reversal

Each processing protocol has a standardized code. Film processing and printing
are coded separately. For instance the most popular negative process today is
called C-41 (Kodak, 1972); the standard paper print process is RA-4 (Kodak,
1955). The standard process for transparent slides is E-6 (Kodak, 1976). A
late-20th-century drugstore photo lab would have used these three almost
exclusively.



https://www.nde-ed.org/EducationResources/HighSchool/Radiography/developingfilm.htm
https://radiopaedia.org/articles/developer-solution
https://healthprofessions.udmercy.edu/academics/na/agm/phenvitc.htm
https://www.photo.net/discuss/threads/d-96.363361/
https://skrasnov.com/blog/film-developing-kodak-d76/
https://cinematography.com/index.php?/topic/34995-hand-processing/
https://www.photrio.com/forum/threads/kodak-d-96a.88209/
https://www.kodak.com/uploadedfiles/motion/US_plugins_acrobat_en_motion_support_processing_h2415_h2415.pdf
http://www.tmax100.com/photo/pdf/film.pdf
https://electronics.howstuffworks.com/film3.htm

The real B&W negative process: 1. Pre-wash (water, softens protective gelatin
layer) 2. Developer bath (developer solution + water, penetrates the gelatin
layer and converts exposed silver halide particles into metallic silver) 3. Stop
bath (acetic acid + water, neutralizes developer bath) 4. Fixer bath (ammonium
thiosulfate + water, dissolves unexposed particles) 5. Post-wash (water +
optional cleaning agents, removes fixer bath)

A simplified version of the B&W negative process can assume that: 1. A digital
B&W source image represents a set of initial exposure values in pixels. 2. The
simulation contains a set of silver halide particles. 3. Each particle can vary
an order of magnitude in size (0.2um-2um, usually 0.5-1um). 4. Each particle is
distributed randomly but clumps together with particles near it to form a grain
(15-25um) 5. Each pixel affects a corresponding subset of the silver halide
particles, with a chance to flip their state from "not exposed" to "exposed." 7.
The developer solution initially affects all particles equally. 8. The particles
subsequently interact with each other; a particle changing state changes the
odds for its neighbors. 9. The simulation ends with every silver halide particle
in the exposed state converting to metallic silver.

(Note that there's some disagreement in terminology regarding film grain: most
(sources refer to the individual silver halide crystals as particles and their
(groupings as grains.)

We can evaluate the steps in the process for our simplified version: 1. DISCARD
Pre-wash. Not simulated. 2. KEEP Developer bath. 3. DISCARD Stop bath.
Procedurally halt the developer simulation. 4. DISCARD Fixer bath. Procedurally
remove unexposed particles. 5. DISCARD Post-wash. Not simulated.

Developer solutions also have code names, of which D-76 (Kodak, 1927) is the
most common for negative development. Closely related are D-72, for paper
prints, and D-96, for motion picture film.

https://web.archive.org/web/20080110234342/http://silvergrain.org/Photo-Tech/d-76.html
http://www.afterness.com/kod_d76.html
https://www.timlaytonfineart.com/blog/2016/9/darkroom-daily-digest-how-to-make-an-eco-friendly-b-w-film-developer
https://www.timlaytonfineart.com/blog/2016/9/darkroom-daily-digest-how-to-make-an-eco-friendly-b-w-film-developer
https://imaging.kodakalaris.com/sites/uat/files/wysiwyg/pro/chemistry/j78.pdf
https://www.photrio.com/forum/threads/mixing-d76-powder-without-temperature.70447/
http://www.alexluyckx.com/blog/index.php/2020/01/20/developer-review-blog-no-01-kodak-d-76/
https://cinematography.net/edited-pages/1920s_Look.htm
https://www.photo.net/discuss/threads/d-96-d-76-whats-the-difference.120344/

Each developer solution has three to five active ingredients: 1,2. A developing
agent. Metol, phenidone, dimezone, or hydroquinone, used alone or in
combination. Historically, metol + hydroquinone was the most common. Modern
processes prefer phenidone, which is less toxic. 3. An alkaline agent that
creates the appropriately high pH. Sodium carbonate, borax, or sodium hydroxide.
4. An anti-oxidizing agent that protects the developing agents from atmospheric
oxygen. Sodium sulfite. 5. An optional restraining agent that protects unexposed
particles from fogging. Potassium bromide. Most important for sensitive film
like X-rays.

The recipe for D-76: Mix in order: 750mL warm (52C) water 2g metol 100g sodium
sulfite 5g hydroquinone 2g borax Add cold (20C) water to make 1L Dilute with
cold water to 2L for use

The precise water temperatures are not especially important to the
preparation--warm water helps the mixture to dissolve, but any value between 50C
and 60C is safe. However the solution should ideally be 20C at use, and warmer
temperatures at the time of developing the image (over 25C according to one
source) can cause problems.

We can evaluate the components of the formula for our simplified version: 1.
KEEP developing agent. 2. DISCARD alkaline agent. Assume correct environmental
pH. 3. DISCARD anti-oxidizing agent. Do not simulate atmospheric oxygen. 4.
DISCARD restraining agent. This was optional in the original formula.

So, from the whole system, we have now extracted a single essential interaction
that must be simulated: The developing agent from the D-76 solution converts
some of the unexposed silver halide particles into exposed particles based on
their latent exposure values.

Next: developing the latent image https://en.m.wikipedia.org/wiki/Latent_image
https://en.m.wikipedia.org/wiki/Silver_halide

The action of the light on the silver halide grains within the emulsion forms
sites of metallic silver in the grains. The basic mechanism by which this
happens was first proposed by R W Gurney and N F Mott in 1938. The incoming
photon liberates an electron, called a photoelectron, from a silver halide
crystal. Photoelectrons migrate to a shallow electron trap site (a sensitivity
site), where the electrons reduce silver ions to form a metallic silver speck. A
positive hole must also be generated but it is largely ignored. Subsequent work
has slightly modified this picture, so that 'hole' trapping is also considered
(Mitchell, 1957). Since then, understanding of the mechanism of sensitivity and
latent image formation has been greatly improved.

The key action is the conversion of silver halide crystals into metallic silver
by adding electrons (reduction).

Silver halide = a compound of silver and a halogen: silver bromide (AgBr),
silver chloride (AgCl), or silver iodide (AgI). Also silver fluoride (AgF), not
used in photography

Light energy knocks free an electron from a silver atom within the crystal. The
free electron added to another silver atom converts it to metallic silver. When
four atoms in the crystal are converted, this is usually the threshold that
triggers a latent image reaction.

When developer solution is added, the crystals that have acquired four or more
metallic silver atoms convert entirely to metallic silver. Film imaging is at
bottom a very high resolution one-bit process!

The transfer of exposure values from pixels to particles is stochastic: pixel
values represent a number of chances for a light ray to hit a particle. Four
hits on the particle flip its bit.

The particles affect their neighbors; a simple model is that when a threshold
number of particles within a grain group have flipped, all particles in that
group flip.
*/
