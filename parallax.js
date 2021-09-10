// from Franks laboratory https://www.youtube.com/watch?v=Mg7ibYWhjPI
class Parallax {
    constructor() {

        this.bglayerClouds = new Image();
        this.bglayerClouds.src = 'layer-3.png'; // Clouds

        this.layers = [];
        this.layers.push(new ParallaxLayer(this.bglayerClouds, 0.4));

    }
    update(dt) {
        this.layers.forEach(layer => layer.update(dt));
    }
    draw(ctx) {
        this.layers.forEach(layer => { layer.draw(ctx); });
    }
}

class ParallaxLayer {
    constructor(image, speedModifier) {

        this.x = 0;
        this.y = groundPoint - 720; // TODO ugly dependency
        this.width = 4200;
        this.height = 200;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = parallaxSpeed.x * speedModifier;
    }
    update() {
        this.speed = parallaxSpeed.x * this.speedModifier;

        if (this.x <= -this.width) this.x = 0;
        if (this.x > this.width) this.x = 0;

        this.x = Math.floor(this.x - this.speed);
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x+this.width, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x-this.width, this.y, this.width, this.height);
    }
}

