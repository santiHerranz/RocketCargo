
class Plane extends Vehicle {

    constructor(pos, vel) {
        
        super(pos.x,pos.y);

        this.name = "plane";
        this.velX = vel.x;
        this.velY = vel.y;

        let model = rocketModels[1];

        this.imageData = model.imageData;
        this.imageWidth = model.width;
        this.imageHeight = model.height;

        this.Width = 108;
        this.Length = 32;

        this.side = 4; //32; //16; //8; //

    }

    draw(ctx) {
        
        super.draw(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.velX > 0)
            ctx.scale(-1, 1)

        let img = new Image();
        img.src = this.imageData;
        ctx.drawImage(img, 0 - this.Width/2, 0-this.Length/2, this.Width, this.Length);

        ctx.restore();
    }

}
