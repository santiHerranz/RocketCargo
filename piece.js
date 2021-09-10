
class Piece {
    constructor(img, pos, size, index, vel, side) {

        this.img = img;
        this.init = pos;
        this.x = pos.x;
        this.y = pos.y;
        this.w = size.w;
        this.h = size.h;
        this.index = index;
        this.t = 0;


        this.velX = vel.x;
        this.velY = vel.y;
        this.velRotation = vel.r;
        this.rotation = 0;

        this.side = side;

        this.life = 500;

    }
    step(dt) {

        this.velY += gravity;

        // apply forces	
        this.x += dt * this.velX;
        this.y += dt * this.velY;
        this.rotation += dt * this.velRotation;

        if (this.y > groundPoint+50) {
            this.y = groundPoint+50;
            this.velY = 0;
            this.velX = 0;
            this.velRotation = 0;
        }

        this.life -= 1;
    }

    draw(ctx) {

        if (this.img != null) {
            ctx.save();
            ctx.translate(this.x - this.w, this.y - this.h);
            ctx.rotate(this.rotation)

            // How to resize then crop an image with canvas https://stackoverflow.com/a/26015533/8237107
            ctx.drawImage(this.img, (this.index % this.side).toFixed(0) * this.w, Math.floor(this.index / 8).toFixed(0) * this.h, this.w, this.h, 0, 0, this.w, this.h);

            ctx.restore();
        }
    }
}