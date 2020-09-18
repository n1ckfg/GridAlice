"use strict";

class GridGuy {
    
    constructor(x, y, s, cc, dc, lc, rc) {    // float, float, float, float, string, float, int, int, int     
        this.rulesArray = [ "NWcorner", "NEcorner", "SWcorner", "SEcorner", "Nrow", "Srow", "Wrow", "Erow" ];  // string[] 
        this.switchArray = [ false, false, false, false, false, false, false, false ];  // bool[]  
        
        this.birthTime = util.millis();  // int
        
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
            return 1;
        } else {
            return 0;
        }
    }

    update() {
        if (util.distance(target.posX, target.posY, this.posX, this.posY) < 2) {
            this.hovered = true;
            this.birthTime = util.millis();
        } else {
            this.hovered = false;
        }

        if (this.hovered && target.clicked) this.mainFire();

        if (this.kaboom) {
            this.birthTime = util.millis();
        
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
