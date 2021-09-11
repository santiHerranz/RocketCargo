
class Plane {
    constructor(pos, vel) {

        this.x = pos.x;
        this.y = pos.y;
        this.w = 20;
        this.h = 40;
        this.radius = 30;

        this.velX = vel.x;
        this.velY = vel.y;

        this.life = 500;

        let model = rocketModels[0];

        this.name = model.name;
        this.imageData = model.imageData;
        this.imageWidth = model.width;
        this.imageHeight = model.height;
        this.fuelTank = model.tank;
        this.smokePosition = model.smoke;

        
        this.listeners = [];

    }

    step(dt) {

        //this.velY += gravity;

        // apply forces	
        this.x += dt * this.velX;
        this.y += dt * this.velY;

        this.smoking(1);

        if (this.status == "crashed") {
            this.grounded = true;
            this.y = groundPoint - 50;
            this.velX = 0;
            this.velY = 0;
        }
    }

    draw(ctx) {

        ctx.save();
        ctx.translate(this.x, this.y);

        let img = new Image();
        img.src = this.imageData;

        ctx.drawImage(img, 0 - this.w * 2, 0, this.w * 4, this.h * 2);

        ctx.restore();
    }

    destroyPlane() {
        if (!this.hasExplode) {
            this.exploding();
            this.life = 0;
            this.hasExplode = true;
        }

    }


    addListener(listener) {
        this.listeners.push(listener);
    }
    smoking(count) {
        this.listeners.forEach(listener => {
            listener.smoking(this, count);
        });
    }
    exploding() {
        this.listeners.forEach(listener => {
            listener.exploding(this);
        });
    }

    smokingPosition() {
        return { x: this.x, y: this.y };
    }

    explodePosition() {
        return { x: this.x, y: this.y };
    }
}