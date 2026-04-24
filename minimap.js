
class MiniMap {

    constructor(screen, w, h) {

        this.width = w;
        this.height = h;

        this.x = screen.width - this.width * 1 / 10 - w;
        this.y = screen.height - this.height * 1 / 10 - h;

        this.color = "#282828";
        this.ratioX = 0.03;
        this.ratioY = 0.08;
        this.originX = 50;
        this.iconX = 35;
        this.twoPi = Math.PI * 2;
    }

    step(dt) {

    }

    draw(ctx) {

        let ratioX = this.ratioX;
        let ratioY = this.ratioY;
        let originX = this.originX;
        let iconX = this.iconX;
        let bases = game.bases;
        let resources = game.resources;
        let rockets = game.rockets;
        let mission = game.mission;

        ctx.save();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = this.color;

        ctx.translate(this.x - 10, this.y - 20);

        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.fill();
        ctx.stroke();

        ctx.translate(20, 75);

        ctx.beginPath();
        ctx.fillStyle = "rgba(0,200,100,0.6)";
        ctx.fillRect(0 - 20, 5 + groundPoint * ratioY, this.width, (this.height / 2 - groundPoint) * ratioY);


        ctx.strokeStyle = "rgb(255,255,255,0.5)";
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 3;

        let resource = null;
        let resourceName = mission.path[0];
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].name === resourceName) {
                resource = resources[i];
                break;
            }
        }

        if (resource) {
            let targetName = mission.path[1];
            let resourceX = originX + resource.x * ratioX;
            let resourceY = resource.y * ratioY;
            for (let i = 0; i < bases.length; i++) {
                let base = bases[i];
                if (base.name === targetName) {
                    ctx.beginPath();
                    ctx.moveTo(resourceX, resourceY);
                    ctx.lineTo(originX + base.x * ratioX, base.y * ratioY);
                    ctx.stroke();
                }
            }
        }

        // Customers position
        ctx.font = "bold 25px Verdana";
        for (let i = 0; i < bases.length; i++) {
            let base = bases[i];
            if (base.visible) {
                ctx.fillText(base.name, iconX + base.x * ratioX, base.y * ratioY - 5);
            }
        }

        // Resources position
        ctx.font = "bold 20px Verdana";
        for (let i = 0; i < resources.length; i++) {
            let resource = resources[i];
            if (resource.visible) {
                ctx.fillText(resource.name, iconX + resource.x * ratioX, resource.y * ratioY - 5);
            }
        }

        // Rocket position
        ctx.fillStyle = "rgb(255, 255, 50)";
        for (let i = 0; i < rockets.length; i++) {
            let rocket = rockets[i];
            ctx.beginPath();
            ctx.arc(originX + rocket.x * ratioX, rocket.y * ratioY, 5, 0, this.twoPi);
            ctx.fill();
        }
        ctx.restore();

    }





}