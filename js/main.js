"use strict";

// ---     MAIN CONTROLS     ---
// if you want to avoid chain reactions, try 0, 20, 100, 0.2
let delayCounter = 0;    // int, delays start of spread
let lifeCounter = 20;    // int, how long spread lasts
let respawnCounter = 50; // int, how long until retrigger
let globalChaos = 0.3;    // float, 0 = min, 1 = max
// -------------------------
let choose = 0;    // int
let maxChoices = 7;    // int
let numFrames = 50;    // int
let renderCounterMax = 1000;    // int
// ----
let pixelSize = 5;    // int
let sW = 640;    // int
let sH = 480;    // int
let fps = 60;    // int

let numColumns, numRows;    // int
let guyWidth, guyHeight, startX, startY;    // float
let mainGrid = [];  // GridGuy[][] 
let setRules = "";    // string
let odds_X_Yplus1, odds_Xminus1_Y, odds_X_Yminus1, odds_Xplus1_Y, odds_Xplus1_Yplus1, odds_Xminus1_YminuX1, odds_Xplus1_Yminus1, odds_Xminus1_Yplus1;    // float

let target;    // Target

function setup() {
    createCanvas(sW, sH);
    
    noCursor();

    frameRate(fps);

    pixelOddsSetup();
    initGlobals();
    
    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numColumns; x++) {
            rulesInit(x, y);
            guysInit(x, y);
        }
    }
    
    target = new Target();    
}

function draw() {
    target.run();
    if (target.armResetAll) {
        resetAll();
        target.armResetAll = false;
    }
    
    background(0);
    
    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numColumns; x++) {
            let loc = x + (y * numColumns);

            rulesHandler(x, y);
            mainGrid[x][y].run();
        }
    }  
}

function keyPressed() {
    resetAll();
}

function initGlobals() {
    numColumns = sW / pixelSize;
    numRows = sH / pixelSize;

    guyWidth = sW / numColumns;
    guyHeight = sH / numRows;

    startX = guyWidth / 2;
    startY = guyHeight / 2;

    // make mainGrid a 2D array
    for (var i = 0; i < numColumns; i++) {
        var mg = [];
        for (var j = 0; j < numRows; j++) {
            var g = new GridGuy(startX, startY, guyWidth, guyHeight, setRules, globalChaos, delayCounter, lifeCounter, respawnCounter);
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

function diceHandler(v1, v2) {  // int, int
    let rollDice = random(v1);  // float
    return rollDice < v2;
}

function rulesInit(x, y) {  // int, int
    setRules = "";
    if (x == 0 && y == 0) {
        setRules = "NWcorner";
    } else if (x == numColumns - 1 && y == 0) {
        setRules = "NEcorner";
    } else if (x == 0 && y == numRows - 1) {
        setRules = "SWcorner";
    } else if (x == numColumns - 1 && y == numRows - 1) {
        setRules = "SEcorner";
    } else if (y == 0) {
        setRules = "Nrow";
    } else if (y == numRows - 1) {
        setRules = "Srow";
    } else if (x == 0) {
        setRules = "Wrow";
    } else if (x == numColumns - 1) {
        setRules = "Erow";
    }
}

function guysInit(x, y) {  // int, int
    mainGrid[x][y] = new GridGuy(startX, startY, guyWidth, guyHeight, setRules, globalChaos, delayCounter, lifeCounter, respawnCounter);
    if (startX < width - guyWidth) {
        startX += guyWidth;
    } else {
        startX = guyWidth / 2;
        startY += guyHeight;
    }
    console.log("init " + x + " " + y);
}

function resetAll() {
    startX = 0;
    startY = 0;
    //currentFrame = 0;
    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numColumns; x++) {
            mainGrid[x][y].hovered = false;
            mainGrid[x][y].clicked = false;
            //mainGrid[x][y].kaboom = false;
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
    // temp
    for (let i = 0; i < randomValues.length; i++) {
        randomValues[i] = random(1);
    }

    choose = int(random(maxChoices));
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

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

class Target {

    constructor() {
        this.speedMin = 0.01;  // float
        this.speedMax = 0.05;  // float
        this.speed;  // float
        this.clickOdds = 0.1;  // float
        this.chooseOdds = 0.01;  // float
        this.markTime = 0;  // int
        this.timeInterval = 200;  // int
    
        this.posX = width/2;  // float
        this.posY = height/2;  // float
        this.targetX;  // float
        this.targetY;  // float
        this.minDist = 5;  // int
        this.clicked = false;
        this.armResetAll = false;
        
        this.pickTarget();
    }

    run() {
        this.posX = lerp(this.posX, this.targetX, this.speed);
        this.posY = lerp(this.posY, this.targetY, this.speed);
        
        if (millis() > this.markTime + this.timeInterval || dist(this.posX, this.posY, this.targetX, this.targetY) < this.minDist) {
            this.pickTarget();
        }
    }
    
    pickTarget() {
        this.markTime = millis();
        
        this.targetX = lerp(this.posX, random(0, width), 0.5);
        this.targetY = lerp(this.posY, random(0, height), 0.5);
        
        this.speed = random(this.speedMin, this.speedMax);
        let r = random(1);
        if (r < this.clickOdds) this.clicked = !this.clicked;
        if (r < this.chooseOdds) this.armResetAll = true;
    }

}

class GridGuy {
    
    constructor(x, y, w, h, s, cc, dc, lc, rc) {    // float, float, float, float, string, float, int, int, int     
        this.rulesArray = [ "NWcorner", "NEcorner", "SWcorner", "SEcorner", "Nrow", "Srow", "Wrow", "Erow" ];  // string[] 
        this.switchArray = [ false, false, false, false, false, false, false, false ];  // bool[]  
        this.fillColorArray = [ color(255, 0, 0), color(0, 255, 0), color(0, 0, 255), color(255, 0, 255), color(50), color(60), color(70), color(80) ];  // color[]          
        

        this.birthTime = millis();  // int
        this.alpha = 255;  // int
        
        this.fillColorOrig = color(0);
        this.fillColor = this.fillColorOrig; // int
        this.strokeColor;
        this.hoveredColor = color(0);
        this.clickedColor = color(random(21,87));

        this.debugColors = false;
        this.strokeLines = false;
        this.hovered = false;
        this.clicked = false;
        this.kaboom = false;

        this.posX = x;  // float
        this.posY = y;  // float
        this.guyWidth = w;  // float
        this.guyHeight = h;  // float
        this.chaos = abs(1.0 - cc);  // float

        this.applyRule = s;  // string

        this.delayCountDownOrig = int(random(dc * this.chaos, dc));  // int
        this.delayCountDown = this.delayCountDownOrig;  // int
        this.lifeCountDownOrig = int(random(lc * this.chaos, lc));  // int
        this.lifeCountDown = this.lifeCountDownOrig;  // int
        this.respawnCountDownOrig = int(random(rc * this.chaos, rc));  // int
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
        this.draw();
    }

    update() {
        if (dist(target.posX, target.posY, this.posX, this.posY) < this.guyWidth) {
            this.hovered = true;
            this.birthTime = millis();
            this.alpha = 255;
        } else {
            this.hovered = false;
        }

        if (this.hovered && target.clicked) this.mainFire();

        if (this.kaboom) {
            this.alpha = 255;
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

    mainFire() {
        this.clicked = true;
        this.kaboom = false;
        this.delayCountDown = this.delayCountDownOrig;
        this.lifeCountDown = this.lifeCountDownOrig;
        this.respawnCountDown = this.respawnCountDownOrig;
    }

    draw() {
        this.fillColor = this.fillColorOrig;
        noStroke();

        if (this.hovered && !this.clicked) {
            this.fillColor = this.hoveredColor;
        } else if (this.clicked) {
            this.fillColor = this.clickedColor;
        }

        this.alpha -= ((millis() - this.birthTime)/2);
        this.drawRect();
    }

    drawRect() {
        fill(this.fillColor, this.alpha);
        rectMode(CENTER);
        rect(this.posX, this.posY, this.guyWidth, this.guyHeight);
    }
    
    drawPoint() {
        stroke(this.fillColor, this.alpha);
        strokeWeight(this.guyWidth);
        point(this.posX, this.posY);
    }

    drawEllipse() {
        fill(this.fillColor, this.alpha);
        ellipseMode(CENTER);
        ellipse(this.posX, this.posY, this.guyWidth, this.guyHeight);
    }

}

// --    END