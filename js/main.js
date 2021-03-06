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
const musicOdds = 0.0001;
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

function getMagentaButton() {
    try {
        let angle = Math.atan2(target.pposY - target.posY, target.pposX - target.posX) * 180 / Math.PI;
        let button = parseInt(angle * (4.0/180.0) + 4);
        console.log("Trigger button " + button);
        buttonUp(button);
        buttonDown(button, false);
    } catch (e) { 
        console.log(e);
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

        if (Math.random() < musicOdds) {
            if (mainGrid[x][y + 1].kaboom) getMagentaButton(0); 
            if (mainGrid[x - 1][y].kaboom) getMagentaButton(1); 
            if (mainGrid[x][y - 1].kaboom) getMagentaButton(2); 
            if (mainGrid[x + 1][y].kaboom) getMagentaButton(3);
            if (mainGrid[x + 1][y + 1].kaboom) getMagentaButton(4); 
            if (mainGrid[x - 1][y - 1].kaboom) getMagentaButton(5); 
            if (mainGrid[x + 1][y - 1].kaboom) getMagentaButton(6); 
            if (mainGrid[x - 1][y + 1].kaboom) getMagentaButton(7);            
        }
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
