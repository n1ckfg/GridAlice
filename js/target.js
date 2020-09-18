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
