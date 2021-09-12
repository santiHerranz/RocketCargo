
class MiniMap {

    constructor(screen, w, h) {


        this.width = w;
        this.height = h;

        this.x = screen.width - this.width * 1 / 10 - w;
        this.y = screen.height - this.height * 1 / 10 - h;


        this.title = "MiniMap";
        this.color = "#282828";

    }

    step(dt) {

    }

    draw(ctx) {


        ctx.save();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = this.color;

        ctx.translate(this.x - 10, this.y - 20);

        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.fill();
        ctx.stroke();

        var halfH = this.height / 2;

        // text
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#FFF';
        var size = ctx.measureText(this.title);
        var x = 0 + this.width / 2 - size.width / 2;
        var y = 0 + 10;
        ctx.fillText(this.title, x, y);

        ctx.translate(10, 100);

        let ratioX = 0.035;
        let ratioY = 0.05;

        ctx.beginPath();
        ctx.fillStyle = "rgba(0,200,100,0.6)";
        ctx.fillRect(0 - 10, 5 + groundPoint * ratioX, this.width, (this.height - groundPoint) * ratioY);





        ctx.strokeStyle = "rgb(255,255,255,0.5)";
        ctx.setLineDash([2, 2]);
        ctx.lineWidth  = 3;

        let resource = game.resources
            .filter(resource => { return resource.name == game.mission.path[0] })[0];

        if (resource) {
            game.bases
                .filter(base => { return base.name == game.mission.path[1] })
                .forEach(base => {

                    ctx.beginPath();
                    ctx.moveTo(50 + resource.x * ratioX, resource.y * ratioX);
                    ctx.lineTo(50 + base.x * ratioX, base.y * ratioY);
                    ctx.stroke();
                });
        }

        game.bases
            .forEach(base => {
                if (base.visible) {
                    ctx.font = "bold 25px Verdana";
                    ctx.beginPath();
                    let size = ctx.measureText(this.name);
                    ctx.fillText(base.name, 35 + base.x * ratioX, base.y * ratioX - 5);
                }

            });

        game.resources
            .forEach(resource => {
                if (resource.visible) {
                    ctx.font = "bold 20px Verdana";
                    ctx.beginPath();
                    let size = ctx.measureText(this.name);
                    ctx.fillText(resource.name, 35 + resource.x * ratioX, resource.y * ratioX - 5);
                }

            });

            game.rockets.forEach(rocket => {
                ctx.beginPath();
                ctx.fillStyle = "rgb(255, 255, 50)";
                ctx.arc(50 + rocket.x * ratioX, 0 + rocket.y * ratioY, 5, 0, Math.PI * 2);
                ctx.fill();
            });
        ctx.restore();

    }





}