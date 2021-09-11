
class Screen {


    constructor(width, height, ctx) {

        ctx = ctx;

        this.offsetX = 0;
        this.offsetY = 0;

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

        this.modal = new Modal(this);
    }

    translate(position) {

        var rect = canvas.getBoundingClientRect();

        position.x = position.x - this.x - this.offsetX - rect.left;
        position.y = position.y - this.y - this.offsetY - rect.top;

        return { x: position.x, y: position.y };
    }

    update(dt) {
        this.parallax.update(dt);
        this.modal.step(dt);

    }

    draw(item) {
        var rect = canvas.getBoundingClientRect();

        ctx.save();
        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(this.x + this.offsetX - rect.left, this.y + this.offsetY - rect.top);
        item.draw(ctx)
        ctx.restore();
    }



    drawScene() {
        ctx.save();

        var rect = canvas.getBoundingClientRect();

        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(this.x + this.offsetX - rect.left, this.y - rect.top + this.offsetY);

        var ground = groundPoint;

        // sky
        ctx.fillStyle = "rgba(135,206,235,0.5)";
        ctx.fillRect(-100 * cWidth, -10000, 200 * cWidth, 10000 + ground);


        this.parallax.draw(ctx);


        // ground
        ctx.beginPath();
        ctx.moveTo(-100 * cWidth, ground);
        ctx.lineTo(100 * cWidth, ground);
        ctx.strokeStyle = "rgba(0,100,50,0.6)";
        ctx.stroke();
        ctx.fillStyle = "rgba(0,200,100,0.6)";
        ctx.fillRect(-100 * cWidth, ground, 200 * cWidth, this.height);



        ctx.restore();

        ctx.save();

        this.modal.draw(ctx);

        ctx.beginPath();
        ctx.font = "32px Helvetica";
        ctx.fillStyle = "black";
        ctx.fillText("Rocket Cargo", 100, 100);
        ctx.stroke();

        let spacer = 0, textSpacer = 20;

        ctx.beginPath();
        ctx.font = "18px Helvetica";
        ctx.fillStyle = "black";
        ctx.fillText("Fly rockets, fly safe", 100, 130 + spacer++ * textSpacer);
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "16px Helvetica";
        ctx.fillStyle = "black";
        ctx.fillText("Press F to refuel the Rocket at base", 100, 150 + spacer++ * textSpacer);
        ctx.stroke();
        ctx.fillText("Press W or UP to thrust the rocket", 100, 150 + spacer++ * textSpacer);
        ctx.stroke();
        ctx.fillText("Press A/D or LEFT/RIGHT to move the rocket when flying", 100, 150 + spacer++ * textSpacer);
        ctx.stroke();
        ctx.fillText("Press Q to activate FTS (Flight Termination System)", 100, 150 + spacer++ * textSpacer);
        ctx.stroke();

        if (game.mission) {
            ctx.fillText("Mission "+ (game.missionIndex+1) +":", 100, 200 + spacer++ * textSpacer);
            ctx.stroke();
            ctx.fillText("Fly from base " + game.mission.path[0] + " to base " + game.mission.path[1] + " " + game.mission.description, 120, 200 + spacer++ * textSpacer);
            ctx.stroke();

            if (game.mission.distanceToTarget) {
                ctx.fillText("Distance to target " + game.mission.distanceToTarget.toFixed(0) + " units ", 120, 200 + spacer++ * textSpacer);
                ctx.stroke();
            }
        }

        if (game.rocket) {
            ctx.beginPath();
            ctx.font = "16px Helvetica";
            ctx.fillStyle = "Blue";

            // ctx.fillText("Screen: [" + game.screen.x.toFixed(1) + "," + game.screen.y.toFixed(1) + "] [" + game.screen.scaleX.toFixed(3) + "," + game.screen.scaleY.toFixed(3) + "]", 100, 250 + spacer++ * textSpacer);
            // ctx.stroke();
            ctx.fillText("Mouse: " + mousePosition.x.toFixed(1) + " " + mousePosition.y.toFixed(1), 100, 250 + spacer++ * textSpacer);
            ctx.stroke();
            ctx.fillText("Ship: " + game.rocket.name, 100, 250 + spacer++ * textSpacer);
            ctx.stroke();
            ctx.fillText("Distance: " + (game.rocket.distanceTavelled).toFixed(1), 100, 250 + spacer++ * textSpacer);
            ctx.stroke();
            ctx.fillText("Altitude: " + game.rocket.altitude.toFixed(0) + "/" + game.rocket.altitudeMax.toFixed(0), 100, 250 + spacer++ * textSpacer);
            ctx.stroke();
            ctx.fillText("Mass: " + game.rocket.mass.toFixed(1), 100, 250 + spacer++ * textSpacer);
            ctx.stroke();
            ctx.fillText("Vertical velocity: " + game.rocket.velY.toFixed(1), 100, 250 + spacer++ * textSpacer);
            ctx.stroke();
            ctx.fillText("Horizontal velocity: " + game.rocket.velX.toFixed(1), 100, 250 + spacer++ * textSpacer);
            ctx.stroke();

        }

        ctx.restore();

    }




}





