
class Vehicle {


    constructor(x, y, modelIndex = 0) {

        this.name = "vehicle";

  
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.width = 2*this.radius;
        this.height = 2*this.radius;


        this.life = 100;

        this.ground = y;

        this.velX = 0;
        this.velY = 0;

        this.lastY = this.y;


        this.hasExploded = false;

        this.listeners = [];




        let model = vehicleModels[modelIndex];

        this.name = model.name;
        this.imageData = model.imageData;
        this.imageWidth = model.width;
        this.imageHeight = model.height;
        this.fuelTank = model.tank;
        this.smokePosition = model.smoke;

        this.img = new Image();
        this.img.src = this.imageData;


        this.Width = 20;
        this.Length = 40;

        this.side = 8; //4; //32; //16; //

        this.w = this.imageWidth / this.side; //this.Width / this.side;
        this.h = this.imageHeight / this.side; //this.Length / this.side;


    }


    step(dt) {

        // apply forces	
        this.x += dt * this.velX;
        this.y += dt * this.velY;
    }


    draw(ctx) {

        ctx.save();
        ctx.translate(this.x, this.y);

        // ctx.beginPath(),
        // ctx.arc(0,0,this.radius,0,Math.PI*2);
        // ctx.stroke();
        // ctx.closePath();

        // ctx.rect(-this.width/2, -this.height/2, this.width, this.height);
        // ctx.stroke();


        ctx.restore();
    }




    destroyVehicle() {
        if (!this.hasExploded) {
            this.exploding();
            this.life = 0;
            this.hasExploded = true;
        }

    }



    addListener(listener) {
        this.listeners.push(listener);
    }
    smoking() {
        this.listeners.forEach(listener => {
            listener.smoking(this);
        });
    }
    exploding() {
        this.listeners.forEach(listener => {
            listener.exploding(this);
        });
    }

    smokingPosition() {
        return { x: this.x + this.smokePosition.x , y: this.y + this.smokePosition.y  };
    }

    explodePosition() {
        return { x: this.x, y: this.y };
    }

}


