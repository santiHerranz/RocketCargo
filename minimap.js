
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

        ctx.translate(this.x-10, this.y-20);

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

        let ratio = 0.035;

        ctx.beginPath();
        ctx.fillStyle = "rgba(0,200,100,0.6)";
        ctx.fillRect(0-10, 5+ groundPoint* ratio , this.width, (this.height-groundPoint)* ratio);



        game.rockets.forEach(rocket => {
            ctx.beginPath();
            ctx.fillStyle = "rgb(255, 255, 50)";
            ctx.arc(50 + rocket.x * ratio, 0 + rocket.y * ratio, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.strokeStyle = "rgb(255,255,255,0.5)";
        ctx.setLineDash([5, 15]);

        let resource = game.bases
            .filter(base => { return base.resource == game.mission.path[0] })[0];

        if (resource) {
                game.bases
                    .filter(base => { return base.name == game.mission.path[1] })
                    .forEach(base => {

                        ctx.beginPath();
                        ctx.moveTo(50 + resource.x * ratio, resource.y * ratio );
                        ctx.lineTo(50 + base.x * ratio, base.y * ratio );
                        ctx.stroke();
                    });
        }

        game.bases
            .forEach(base => {

                ctx.font = "bold 20px Verdana";
                ctx.textAlign = "left";
                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.beginPath();
                let size = ctx.measureText(this.name);
                ctx.fillText(base.name, 35 + base.x * ratio, base.y * ratio - 5);

            });


        ctx.restore();

    }





}