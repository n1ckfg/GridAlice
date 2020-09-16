"use strict";

let dim = 48;
let grid = new field2D(dim);

// ---     MAIN CONTROLS     ---
// if you want to avoid chain reactions, try 0, 20, 100, 0.2
let delayCounter = 0;    // int, delays start of spread
let lifeCounter = 20;    // int, how long spread lasts
let respawnCounter = 50; // int, how long until retrigger
let globalChaos = 0.3;    // float, 0 = min, 1 = max
// -------------------------
let choose = 0;    // int
let maxChoices = 7;    // int
// ----
let startX, startY;    // float
let mainGrid = [];  // GridGuy[][] 
let setRules = "";    // string
let odds_X_Yplus1, odds_Xminus1_Y, odds_X_Yminus1, odds_Xplus1_Y, odds_Xplus1_Yplus1, odds_Xminus1_YminuX1, odds_Xplus1_Yminus1, odds_Xminus1_Yplus1;    // float

let target;    // Target
let firstRun = true;

function reset() { 
    if (firstRun) {
        pixelOddsSetup();
        initGlobals();
        
        grid.set(function(x, y) { 
            rulesInit(x, y);
            guysInit(x, y);
            return 0;
        });
        
        target = new Target(); 

        firstRun = false;
    } else {
        resetAll();
    }
}

function update(dt) {   
    target.run();

    if (target.armResetAll) {
        resetAll();
        target.armResetAll = false;
    }
        
    grid.set(function(x, y) { 
        rulesHandler(x, y);
        mainGrid[x][y].run();

        return mainGrid[x][y].color;
    });
}

function draw(ctx) {
    grid.draw();
}

function initGlobals() {
    startX = dim / 2;
    startY = dim / 2;

    // make mainGrid a 2D array
    for (let y = 0; y < dim; y++) {
        let mg = [];
        for (let x = 0; x < dim; x++) {
            let g = new GridGuy(startX, startY, setRules, globalChaos, delayCounter, lifeCounter, respawnCounter);
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
        mainGrid[x][y + 1].kaboom = diceHandler(1, odds_X_Yplus1);
        mainGrid[x - 1][y].kaboom = diceHandler(1, odds_Xminus1_Y);
        mainGrid[x][y - 1].kaboom = diceHandler(1, odds_X_Yminus1);
        mainGrid[x + 1][y].kaboom = diceHandler(1, odds_Xplus1_Y);
        mainGrid[x + 1][y + 1].kaboom = diceHandler(1, odds_Xplus1_Yplus1);
        mainGrid[x - 1][y - 1].kaboom = diceHandler(1, odds_Xminus1_YminuX1);
        mainGrid[x + 1][y - 1].kaboom = diceHandler(1, odds_Xplus1_Yminus1);
        mainGrid[x - 1][y + 1].kaboom = diceHandler(1, odds_Xminus1_Yplus1);
    }
}

function millis() {
    return parseInt(now * 1000);
}

function diceHandler(v1, v2) {  // int, int
    let rollDice = Math.random(v1);  // float
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
    mainGrid[x][y] = new GridGuy(startX, startY, setRules, globalChaos, delayCounter, lifeCounter, respawnCounter);
    console.log("init " + x + " " + y);
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

let randomValues = [];  // float[]

function pixelOddsSetup() {
    // temp
    for (let i = 0; i < 8; i++) {
        randomValues.push(Math.random(1));
    }

    choose = parseInt(Math.random(maxChoices));
    //console.log("choose: " + choose);
    
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

function lerp (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
}

function lerpVec (p1, p2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return new vec2(p1.x + (p2.x - p1.x) * amount, p1.y + (p2.y - p1.y) * amount);
}

function distance(x1, y1, x2, y2) {
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt( a*a + b*b );
}

function distanceVec(p1, p2) {
    let a = p1.x - p2.x;
    let b = p1.y - p2.y;
    return Math.sqrt( a*a + b*b );
}

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

class Target {

    constructor() {
        this.speedMin = 0.01;  // float
        this.speedMax = 0.05;  // float
        this.speed = this.speedMin;  // float
        this.clickOdds = 0.1;  // float
        this.chooseOdds = 0.01;  // float
        this.markTime = 0;  // int
        this.timeInterval = 200;  // int
    
        this.pos = new vec2(dim/2, dim/2);  // vec2
        this.goalPos = new vec2(dim/2, dim/2);  // vec2
        this.minDist = 5;  // int
        this.clicked = false;
        this.armResetAll = false;
        
        this.pickTarget();
    }

    run() {
        this.pos = lerpVec(this.pos, this.goalPos, this.speed);
        
        if (millis() > this.markTime + this.timeInterval || distanceVec(this.pos, this.goalPos) < this.minDist) {
            this.pickTarget();
        }
    }
    
    pickTarget() {
        this.markTime = millis();
        
        this.goalPos = lerpVec(this.pos, new vec2(Math.random(0, dim), Math.random(0, dim)), 0.5);
        
        this.speed = Math.random(this.speedMin, this.speedMax);
        let r = Math.random(1);
        if (r < this.clickOdds) this.clicked = !this.clicked;
        if (r < this.chooseOdds) this.armResetAll = true;
    }

}

class GridGuy {
    
    constructor(x, y, s, cc, dc, lc, rc) {    // float, float, float, float, string, float, int, int, int     
        this.rulesArray = [ "NWcorner", "NEcorner", "SWcorner", "SEcorner", "Nrow", "Srow", "Wrow", "Erow" ];  // string[] 
        this.switchArray = [ false, false, false, false, false, false, false, false ];  // bool[]  
        
        this.colorOff = [ 0.0, 0.0, 0.0, 1.0 ];
        this.color = this.colorOff;
        this.colorOn = [ 1.0, 1.0, 1.0, 1.0 ];
        this.birthTime = 0;  // int

        this.debugColors = false;
        this.strokeLines = false;
        this.hovered = false;
        this.clicked = false;
        this.kaboom = false;

        this.pos = new vec2(x, y);  // vec2
        this.chaos = Math.abs(1.0 - cc);  // float

        this.applyRule = s;  // string

        this.delayCountDownOrig = parseInt(Math.random(dc * this.chaos, dc));  // int
        this.delayCountDown = this.delayCountDownOrig;  // int
        this.lifeCountDownOrig = parseInt(Math.random(lc * this.chaos, lc));  // int
        this.lifeCountDown = this.lifeCountDownOrig;  // int
        this.respawnCountDownOrig = parseInt(Math.random(rc * this.chaos, rc));  // int
        this.respawnCountDown = this.respawnCountDownOrig;  // int
        
        for (let i = 0; i < this.rulesArray.length; i++) {
            if (this.applyRule == this.rulesArray[i]) {
                this.switchArray[i] = true;
            }
        }
    }

    run() {
        this.update();
        this.draw();
    }

    update() {
        let dist = distanceVec(this.pos, target.pos); 
        console.log(this.pos.x + " " + target.pos.x + " " + dist);
        if (dist < 1) {
            this.hovered = true;
            this.birthTime = millis();
        } else {
            this.hovered = false;
        }

        if (this.hovered && target.clicked) this.mainFire();

        if (this.kaboom) {
            this.birthTime = millis();
        
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

    draw() {
        if (this.clicked) {
            this.color = this.colorOn;
        } else {
            this.color = this.colorOff;
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

// --    END