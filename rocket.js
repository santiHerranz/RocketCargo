
class Rocket extends Vehicle {


    constructor(x, y) {
        super(x, y);



        this.loaded = false;
        this.load = "";

        this.status = "landed";

        this.altitude = 0;
        this.altitudeMax = 1500;


        this.distanceTavelled = 0;

        this.thrustAngle = Math.PI;


        this.thrust = { x: 0, y: 0 };
        this.isThrusting = false;

        this.fuelTank = { x: 60, y: -10, w: 7, h: 52, color: 'red' };

        this.fuel_MAX = 4000;
        this.fuel = this.fuel_MAX * 2 / 3;
        this.grounded = true;
        this.canFuel = false;

        this.manualThrust = gravity * 2.0;
        this.landingThrust = gravity * 2.0;

        this.landingConstraints = { dx: 50, dy: 50 };


        this.Width = 20;
        this.Length = 40;

        // Explode in 8x8 pieces
        this.side = 8;

    }


    step(dt) {


        if (this.status == "flying") {
            this.velY += gravity;
        }






        this.thrustAngle = Math.atan2(this.thrust.x, this.thrust.y) + Math.PI / 2;

        this.isThrusting = false;
        if (Math.abs(this.thrust.x) > 0 || Math.abs(this.thrust.y) > 0) {
            this.status = "flying";
            this.grounded = false;
            this.hasExploded = false;
            this.isThrusting = true;

            this.doing('SMOKING');
            this.doing('TRUSTING');
        }

        this.thrust.x = 0;
        this.thrust.y = 0;


        super.step(dt);


        // Max altitude
        this.altitude = -this.y + this.ground - 50;
        if (this.altitude > this.altitudeMax) {
            this.y = -this.altitudeMax + this.ground - 50;
            this.velY = 0;
        }

        this.distanceTavelled += dt * Math.abs(this.velX);


        if (this.status == "flying" && this.y > groundPoint - 50) {
            if (this.velY > this.landingConstraints.dy || this.velX > this.landingConstraints.dx) {
                this.doing('EXPLODING');
                this.life = 0;
                this.hasExploded = true;
            } else {
                this.status = "landed";
                this.grounded = true;
            }
        }

        if (this.status == "landed" || this.status == "crashed") {
            this.grounded = true;
            this.y = groundPoint - 50;
            this.velX = 0;
            this.velY = 0;
        }

        if (this.status == "based") {
            this.grounded = true;
            this.velX = 0;
            this.velY = 0;
        }


        this.lastStatus = this.status;

    }


    draw(ctx) {
        super.draw(ctx);

        if (this.isThrusting)
            this.drawExhaustPlume(this);


        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-Math.PI/4);

        ctx.font = "bold 64px Verdana";
		ctx.textAlign = "left";
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.fillText("🚀", -45 , 25);
        ctx.stroke();

        ctx.restore();

        this.drawRocket(ctx);


    }


    drawRocket() {

        this.throttle = this.isThrusting ? 1 : 0;
        this.gimbalAngle = -this.thrustAngle;

        var L = this.Length;
        var W = this.Width;
        ctx.save();
        ctx.translate(this.x, this.y);


        ctx.lineWidth = L / 40;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Fuel tank
        let tankWidth = this.fuelTank.w; //W / 4;
        let tankHeigth = this.fuelTank.h; //L * 2 / 4;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(this.fuelTank.x - tankWidth * 2, this.fuelTank.y - L / 2, tankWidth, tankHeigth);
        ctx.fillStyle = this.fuelTank.color;  //"rgba(206,135,235,0.6)";
        ctx.fillRect(this.fuelTank.x - tankWidth * 2, this.fuelTank.y - L / 2 + tankHeigth * (1 - (this.fuel / this.fuel_MAX)), tankWidth, tankHeigth * (this.fuel / this.fuel_MAX));
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.strokeRect(this.fuelTank.x - tankWidth * 2, this.fuelTank.y - L / 2, tankWidth, tankHeigth);
        ctx.restore();

        if (this.loaded) {
            ctx.save();
            ctx.font = "50px Verdana";
            ctx.textAlign = "center";
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.fillText(this.load, this.x , this.y-50);
            ctx.restore();
        }

    }

    drawExhaustPlume(ship) {

        const SHIP_SIZE = 30; // ship height in pixels

        ctx.fillStyle = "red";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = SHIP_SIZE / 15;

        const SIZE = SHIP_SIZE / 3;

        var flamex = [];
        var flamey = [];

        var radians = ship.thrustAngle;

        let plumeLength =  0.5*(ship.radius*4/5 + ship.radius*1/5 *Math.random());
        var x = 0 + Math.cos(radians - Math.PI * 2) * plumeLength;
        var y = 0 + this.Length + Math.sin(radians - Math.PI * 2) * plumeLength;

        flamex[1] = x + Math.cos(radians - Math.PI * 2) * SIZE * 4;
        flamey[1] = y + Math.sin(radians - Math.PI * 2) * SIZE * 4;

        flamex[2] = x + Math.cos(radians - Math.PI * 7 / 4) * SIZE;
        flamey[2] = y + Math.sin(radians - Math.PI * 7 / 4) * SIZE;

        flamex[3] = x + Math.cos(radians - Math.PI * 2) * SIZE / 2;
        flamey[3] = y + Math.sin(radians - Math.PI * 2) * SIZE / 2;

        flamex[4] = x + Math.cos(radians + Math.PI * 7 / 4) * SIZE;
        flamey[4] = y + Math.sin(radians + Math.PI * 7 / 4) * SIZE;

        ctx.save();
        ctx.translate(this.x, this.y+10);

        // draw flame
        ctx.beginPath();
        ctx.moveTo(flamex[0], flamey[0]);
        for (var i = 0, j = flamex.length - 1;
            i < flamex.length;
            j = i++) {
            ctx.lineTo(flamex[j], flamey[j]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }




    moveRocket(value) {
        if (!this.grounded && this.fuel > 0) {
            this.thrust.x += value;
        }
    }



    doing(what) {
        this.listeners.forEach(listener => {
            listener.doing(this, what);
        });
    }


    smokingPosition() {
        return { x: this.x + this.smokePosition.x + 20 * Math.cos(this.thrustAngle), y: this.y + this.smokePosition.y + 40 + 20 * Math.sin(this.thrustAngle) };
    }

}


