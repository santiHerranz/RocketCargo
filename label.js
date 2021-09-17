class Label {

    constructor(x, y, text) {


        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 20;

        this.velX = 0;
        this.velY = 0;

        this.text = text;

        this.life = 100;

    }

    step(dt) {

        this.velY -= gravity;

        // apply forces
        this.x += dt * this.velX;
        this.y += dt * this.velY;

        this.life -= 3;
    }

    draw(ctx) {

        ctx.save();
        ctx.translate(this.x, this.y-120);

        // if (game.debug) {
        //     ctx.beginPath(),
        //     ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        //     ctx.stroke();
        // }


        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.font = "bold 26px Helvetica";
        ctx.fillText( this.text, 0-this.width / 2, 0+this.height / 2);
        ctx.stroke();

        ctx.font = "bold 26px Helvetica";
        ctx.fillStyle = "yellow";
        ctx.fillText( this.text, -3-this.width / 2, -2+this.height / 2);
        ctx.stroke();

        ctx.restore();
    }



}
