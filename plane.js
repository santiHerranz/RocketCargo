
class Plane extends Vehicle {

    constructor(pos, vel) {
        
        super(pos.x,pos.y, 1);

        this.name = "plane";
        this.velX = vel.x;
        this.velY = vel.y;

        this.Width = 108;
        this.Length = 32;

    }

    draw(ctx) {

        super.draw(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.velX > 0)
            ctx.scale(-1, 1)

//        ctx.beginPath();
//        ctx.drawImage(this.img, 0 - this.Width/2, 0-this.Length/2, this.Width, this.Length);

        ctx.rotate(Math.PI/4*5);
        ctx.font = "bold 80px Verdana";
		ctx.textAlign = "left";
		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.fillText("✈️", 0 , 0);
        ctx.stroke();


        ctx.restore();
    }

}
