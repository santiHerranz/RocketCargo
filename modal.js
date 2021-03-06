
class Modal {

    constructor(screen) {

        this.visible = false;
        this.title = "R O C K E T  C A R G O";


        this.color = "#282828";
        this.width = 600;
        this.height = 300;

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

        let spacer = 0, textSpacer = 25;

        ctx.save();


        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();


        // text
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#FFF';
        var size = ctx.measureText(this.title);
        var x = this.x + this.width / 2 - size.width / 2;
        var y = this.y + 50;
        ctx.fillText(this.title, x, y);




        ctx.translate(this.x+20, this.y+80);

        ctx.font = "bold 60px Helvetica";
        
        ctx.beginPath();
        ctx.fillText("🚀📦", this.width -200, 0 + spacer * textSpacer);
        ctx.stroke();

        ctx.font = "16px Helvetica";

        ctx.beginPath();
        ctx.fillText("Basic operation:", 0, 0 + spacer++ * textSpacer);
        ctx.stroke();

        spacer++;

        ctx.beginPath();
        ctx.fillText("Press F to refuel the Rocket at base", 0, 0 + spacer++ * textSpacer);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillText("Press W or UP to thrust the rocket", 0, 0 + spacer++ * textSpacer);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillText("Press A/D or LEFT/RIGHT to move the rocket when flying", 0, 0 + spacer++ * textSpacer);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillText("Press Q to activate FTS (Flight Termination System) if you run out of fuel", 0, 0 + spacer++ * textSpacer);
        ctx.stroke();        
        ctx.beginPath();
        ctx.fillText("Press H to show this info", 0, 0 + spacer++ * textSpacer);
        ctx.stroke();        

        ctx.restore();


        this.buttons.forEach(button => button.draw(ctx));
    }





}


class GameOver {

    constructor(screen) {

        this.visible = false;
        this.title = "G A M E  O V E R";


        this.color = "#282828";
        this.width = 600;
        this.height = 300;

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

        var a = new Button(this.x + this.width / 2 - 150 / 2, this.y + this.height * 0.8 - 50, 150, 20, 'Tweet score', bStyle
            , function () {
                if (!game.screen.gameover.visible) return;
                setTimeout(() => {
                    game.tweetScore();
                }, 200);

            });
        this.buttons.push(a);


        var a = new Button(this.x + this.width / 2 - 150 / 2, this.y + this.height * 0.8, 150, 20, 'New Game', bStyle
            , function () {
                if (!game.screen.gameover.visible) return;
                game.screen.gameover.visible = false;
                game.init();
            });
        this.buttons.push(a);


        
    }

    step(dt) {
        this.buttons.forEach(button => button.step(dt));
    }



    draw(ctx) {

        
        if (!this.visible) return;

        let spacer = 0, textSpacer = 25;

        ctx.save();


        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();


        // text
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#FFF';
        var size = ctx.measureText(this.title);
        var x = this.x + this.width / 2 - size.width / 2;
        var y = this.y + 50;
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
        this.isKeying = false;
    }

    step(dt) {
        if (!this.enabled) return;
        ///

        if (input.enter && typeof this.clickCB === 'function' && !this.isKeying) {
                this.clickCB();
                this.isKeying = true;
        } else {
            this.isKeying = false;
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



