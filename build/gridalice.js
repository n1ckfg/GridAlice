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