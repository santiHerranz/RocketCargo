
class Screen {


    constructor(width, height, ctx) {

        this.ctx = ctx;

        this.screenOffsetX = 0;
        this.screenOffsetY = 0;

        this.width = width;
        this.height = height;
        this.height_original = height;

        this.scaleX = this.width / cWidth;
        this.scaleY = this.height / cHeight;

        this.x = (cWidth - this.width) / 2;
        this.x_original = this.x;
        this.y = (cHeight - this.height) / 2;
        this.y_original = this.y;

        this.parallax = new Parallax();
    }

    translate(position) {

        var rect = canvas.getBoundingClientRect();

        position.x = position.x - this.x - this.screenOffsetX - rect.left;
        position.y = position.y - this.y - this.screenOffsetY - rect.top;

        return { x: position.x, y: position.y };
    }

    update(dt) {
        this.parallax.update(dt);
    }

    draw(item) {
        var rect = canvas.getBoundingClientRect();

        this.ctx.save();
        this.ctx.scale(this.scaleX, this.scaleY);
        this.ctx.translate(this.x + this.screenOffsetX - rect.left, this.y + this.screenOffsetY - rect.top);
        item.draw(this.ctx)
        this.ctx.restore();
    }



    drawScene() {
        this.ctx.save();

        var rect = canvas.getBoundingClientRect();

        this.ctx.scale(this.scaleX, this.scaleY);
        this.ctx.translate(this.x + this.screenOffsetX - rect.left, this.y - rect.top + this.screenOffsetY);

        var ground = groundPoint;

        // sky
        this.ctx.fillStyle = "rgba(135,206,235,0.5)";
        this.ctx.fillRect(-100 * cWidth, -10000, 200 * cWidth, 10000 + ground);


        this.parallax.draw(ctx);


        // ground
        this.ctx.beginPath();
        this.ctx.moveTo(-100 * cWidth, ground);
        this.ctx.lineTo(100 * cWidth, ground);
        this.ctx.strokeStyle = "rgba(0,100,50,0.6)";
        this.ctx.stroke();
        this.ctx.fillStyle = "rgba(0,200,100,0.6)";
        this.ctx.fillRect(-100 * cWidth, ground, 200 * cWidth, this.height);



        this.ctx.restore();

        this.ctx.save();


        this.ctx.beginPath();
        this.ctx.font = "32px Helvetica";
        this.ctx.fillStyle = "black";
        this.ctx.fillText("Rocket Cargo", 100, 100);
        this.ctx.stroke();

        let spacer = 0, textSpacer = 20;

        this.ctx.beginPath();
        this.ctx.font = "18px Helvetica";
        this.ctx.fillStyle = "black";
        this.ctx.fillText("Fly rockets, fly safe", 100, 130 + spacer++ * textSpacer);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.font = "16px Helvetica";
        this.ctx.fillStyle = "black";
        this.ctx.fillText("Press F to refuel the Rocket at base", 100, 150 + spacer++ * textSpacer);
        this.ctx.stroke();
        this.ctx.fillText("Press W or UP to thrust the rocket", 100, 150 + spacer++ * textSpacer);
        this.ctx.stroke();
        this.ctx.fillText("Press A/D or LEFT/RIGHT to move the rocket when flying", 100, 150 + spacer++ * textSpacer);
        this.ctx.stroke();
        this.ctx.fillText("Press Q to activate FTS (Flight Termination System)", 100, 150 + spacer++ * textSpacer);
        this.ctx.stroke();

        this.ctx.fillText("Missions:", 100, 200 + spacer++ * textSpacer);
        this.ctx.stroke();
        this.ctx.fillText("Hop from base to base to carry customer payloads.", 120, 200 + spacer++ * textSpacer);
        this.ctx.stroke();


        if (game.currentRocket) {
            this.ctx.beginPath();
            this.ctx.font = "16px Helvetica";
            this.ctx.fillStyle = "Blue";

            this.ctx.fillText("Screen: [" + game.screen.x.toFixed(1) + "," + game.screen.y.toFixed(1) + "] [" + game.screen.scaleX.toFixed(3) + "," + game.screen.scaleY.toFixed(3) + "]", 100, 250 + spacer++ * textSpacer);
            this.ctx.stroke();
            this.ctx.fillText("Ship: " + game.currentRocket.name, 100, 250 + spacer++ * textSpacer);
            this.ctx.stroke();
            this.ctx.fillText("Distance: " + (game.currentRocket.distanceTavelled).toFixed(1), 100, 250 + spacer++ * textSpacer);
            this.ctx.stroke();
            this.ctx.fillText("Altitude: " + game.currentRocket.altitude.toFixed(0) + "/" + game.currentRocket.altitudeMax.toFixed(0), 100, 250 + spacer++ * textSpacer);
            this.ctx.stroke();
            this.ctx.fillText("Mass: " + game.currentRocket.mass.toFixed(1), 100, 250 + spacer++ * textSpacer);
            this.ctx.stroke();
            this.ctx.fillText("Vertical velocity: " + game.currentRocket.velY.toFixed(1), 100, 250 + spacer++ * textSpacer);
            this.ctx.stroke();
            this.ctx.fillText("Horizontal velocity: " + game.currentRocket.velX.toFixed(1), 100, 250 + spacer++ * textSpacer);
            this.ctx.stroke();

        }

        this.ctx.restore();

    }




}
