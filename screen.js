
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

        this.modal = new Modal(this);
    }

    translate(position) {

        var rect = canvas.getBoundingClientRect();

        position.x = position.x - this.x - this.screenOffsetX - rect.left;
        position.y = position.y - this.y - this.screenOffsetY - rect.top;

        return { x: position.x, y: position.y };
    }

    update(dt) {
        this.parallax.update(dt);
        this.modal.step(dt);

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

        this.modal.draw(ctx);

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

        if (game.currentMission) {
            this.ctx.fillText("Mission "+ (game.indexMission+1) +":", 100, 200 + spacer++ * textSpacer);
            this.ctx.stroke();
            this.ctx.fillText("Fly from base " + game.currentMission.path[0] + " to base " + game.currentMission.path[1] + " " + game.currentMission.description, 120, 200 + spacer++ * textSpacer);
            this.ctx.stroke();

            if (game.currentMission.distanceToTarget) {
                this.ctx.fillText("Distance to target " + game.currentMission.distanceToTarget.toFixed(0) + " units ", 120, 200 + spacer++ * textSpacer);
                this.ctx.stroke();
            }
        }

        if (game.currentRocket) {
            this.ctx.beginPath();
            this.ctx.font = "16px Helvetica";
            this.ctx.fillStyle = "Blue";

            // this.ctx.fillText("Screen: [" + game.screen.x.toFixed(1) + "," + game.screen.y.toFixed(1) + "] [" + game.screen.scaleX.toFixed(3) + "," + game.screen.scaleY.toFixed(3) + "]", 100, 250 + spacer++ * textSpacer);
            // this.ctx.stroke();
            this.ctx.fillText("Mouse: " + mousePosition.x.toFixed(1) + " " + mousePosition.y.toFixed(1), 100, 250 + spacer++ * textSpacer);
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






class Modal {

    constructor(screen) {

        this.visible = false;
        this.title = "";


        this.color = "#2869AD";
        this.width = 400;
        this.height = 200;

        this.x = screen.width / 2 - this.width / 2;
        this.y = screen.height / 2 - this.height / 2;

        this.buttons = [];

        var bStyle = {
            'default': {
                top: '#1879BD',
                bottom: '#084D79'
            },
            'hover': {
                top: '#678834',
                bottom: '#093905'
            },
            'active': {
                top: '#EB7723',
                bottom: '#A80000'
            }
        };

        var a = new Button(this.x + this.width / 2 - 50 / 2, this.y + this.height * 0.8, 50, 20, 'OK', bStyle
            , function () {
                if (!game.screen.modal.visible) return;

                console.log('OK');
                game.nextMission();
                game.screen.modal.visible = false;
                game.stop = false;
            });
        this.buttons.push(a);
    }

    step(dt) {
        this.buttons.forEach(button => button.step(dt));
    }

    draw(ctx) {

        if (!this.visible) return;

        ctx.save();


        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();

        var halfH = this.height / 2;

        // text
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#FFF';
        var size = ctx.measureText(this.title);
        var x = this.x + this.width / 2 - size.width / 2;
        var y = this.y + halfH;
        ctx.fillText(this.title, x, y);

        ctx.restore();


        this.buttons.forEach(button => button.draw(ctx));
    }





}


class Button {


    constructor(x, y, w, h, text, colors, clickCB, hud) {

        this.hud = hud;

        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.colors = colors;
        this.text = text;
        this.clickCB = clickCB;

        this.enabled = true;
        this.state = 'default';  // current button state

        this.isClicking = false;
    }

    step(dt) {
        if (!this.enabled) return;
        ///

        if (input.enter && typeof this.clickCB === 'function' && !this.isClicking) {
                this.clickCB();
                this.isClicking = true;
        } else {
            this.isClicking = false;
        }


        // check for hover
        if (mousePosition.x >= this.x && mousePosition.x <= this.x + this.width &&
            mousePosition.y >= this.y && mousePosition.y <= this.y + this.height) { //  - rect.top
            this.state = 'hover';

            // check for click
            if (mouseLeftPressed) {
                this.state = 'active';

                if (typeof this.clickCB === 'function' && !this.isClicking) {
                    this.clickCB();
                    this.isClicking = true;
                }
            }
            else {
                this.isClicking = false;
            }
        }
        else if (this.state == 'selected') {
            this.state = 'hover';
        }
        else {
            this.state = 'default';
        }



    }

    draw(ctx) {
        ctx.save();

        var colors = this.colors[this.state];
        var halfH = this.height / 2;

        // button
        ctx.fillStyle = colors.top;
        ctx.fillRect(this.x, this.y, this.width, halfH);
        ctx.fillStyle = colors.bottom;
        ctx.fillRect(this.x, this.y + halfH, this.width, halfH);

        // text
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#FFF';
        var size = ctx.measureText(this.text);
        var x = this.x + this.width / 2 - size.width * 0.65;
        var y = this.y + halfH + 3;
        ctx.fillText(this.text, x, y);

        ctx.restore();
    }
}



