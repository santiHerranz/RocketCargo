
class Vehicle {

    constructor(x, y, modelIndex = 0) {

        this.name = "vehicle";

        this.x = x;
        this.y = y;
        this.radius = 30;
        this.width = 2 * this.radius;
        this.height = 2 * this.radius;

        this.life = 100;

        this.ground = y;

        this.velX = 0;
        this.velY = 0;

        this.lastY = this.y;

        this.hasExploded = false;

        this.listeners = [];

        this.name = "";
        this.imageWidth = 60;
        this.imageHeight = 60;
        this.smokePosition = {
            x: 0,
            y: 10
        };

        this.Width = 20;
        this.Length = 40;

    }

    step(dt) {

        // apply forces
        this.x += dt * this.velX;
        this.y += dt * this.velY;
    }

    draw(ctx) {

        ctx.save();
        ctx.translate(this.x, this.y);

        if (game.debug) {
            ctx.beginPath(),
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();

            ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.stroke();

        }

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
        return {
            x: this.x + this.smokePosition.x,
            y: this.y + this.smokePosition.y
        };
    }

    explodePosition() {
        return {
            x: this.x,
            y: this.y
        };
    }

}
