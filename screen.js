
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

        this.minimap = new MiniMap(this, 225, 150);
        this.modal = new Modal(this);
        this.gameover = new GameOver(this);

        this.stars = [];
        this.trees = [];

        this.createStars(-5 * cWidth, -1500, 10 * cWidth, groundPoint - 1000, 100);
        this.createTrees(-5 * cWidth, groundPoint - 10, 10 * cWidth, groundPoint - 0, 100);
    }

    createStars(xp, yp, width, height, spacing) {

        for (let x = xp; x < width; x += spacing) {
            for (let y = yp; y < height; y += spacing) {
                const star = {
                    x: x + Math.floor(Math.random() * spacing),
                    y: y + Math.floor(Math.random() * spacing),
                    r: Math.random() * 1.5,
                };
                this.stars.push(star);
            }
        }
    }

    createTrees(xp, yp, width, height, spacing) {

        for (let x = xp; x < width; x += spacing) {
            for (let y = yp; y < height; y += spacing) {
                const tree = {
                    x: x + Math.floor(Math.random() * spacing),
                    y: y + Math.floor(Math.random() * 0),
                    size: (60 + (30*Math.random()-0.5)).toFixed(0)
                };
                this.trees.push(tree);
            }
        }
        // No trees arround respawn point
        this.trees = this.trees.filter(tree => {
            return tree.x < cWidth / 2 - 400 || tree.x > cWidth / 2 + 400
        });
    }

    update(dt) {
        this.gameover.step(dt);
        this.modal.step(dt);
        this.minimap.step(dt);

    }

    draw(ctx) {

        this.gameover.draw(ctx);
        this.modal.draw(ctx);
        this.minimap.draw(ctx);

    }

    drawTarget(ctx) {
        var rect = canvas.getBoundingClientRect();

        ctx.save();
        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(this.x + this.offsetX - rect.left, this.y + this.offsetY - rect.top);

        ctx.strokeStyle = "rgb(255,255,255,0.3)";
        ctx.setLineDash([20, 20]);
        ctx.lineWidth = 12;

        let resource = game.resources
            .filter(resource => {
                return resource.name == game.mission.path[0]
            })[0];

        if (resource) {
            game.bases
            .filter(base => {
                return base.name == game.mission.path[1]
            })
            .forEach(base => {
                ctx.beginPath();
                ctx.moveTo(resource.x, resource.y);
                ctx.lineTo(base.x, base.y);
                ctx.stroke();
            });
        }

        ctx.restore();

    }

    drawItem(item) {
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
        ctx.beginPath();
        ctx.fillStyle = "rgba(135,206,235,0.5)";
        ctx.fillRect(-100 * cWidth, -10000, 200 * cWidth, 10000 + ground);

        ctx.beginPath();
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(-100 * cWidth, -1000 - 500, 200 * cWidth, 1000 + ground - 500);

        ctx.beginPath();

        ctx.fillStyle = "rgb(255, 255, 255)";
        this.stars.forEach(function (star) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        this.trees.forEach(function (tree) {
            ctx.font = tree.size +"px Verdana";
            ctx.beginPath();
            ctx.fillText("🌳", tree.x, tree.y);
        });

        // ground
        ctx.beginPath();
        ctx.moveTo(-100 * cWidth, ground);
        ctx.lineTo(100 * cWidth, ground);
        ctx.strokeStyle = "rgba(0,100,50,0.6)";
        ctx.stroke();
        ctx.fillStyle = "rgba(0,200,100,0.6)";
        ctx.fillRect(-100 * cWidth, ground, 200 * cWidth, this.height);
        ctx.restore();

        ctx.restore();
    }

    drawScore() {

        let spacer = 0,
        textSpacer = 30;

        let rx = 50; //cWidth - 600;
        let ry = 0;
        let w = 150;
        let h = 100;

        ctx.beginPath();
        ctx.fillStyle = "rgb(255,255,255,0.6)";
        ctx.roundRect(rx - 30, ry + 20, w, h, 20);
        ctx.fill();

        ctx.font = "bold 20px Verdana";
        ctx.textAlign = "left";
        ctx.fillStyle = "#000000";

        for (let index = 0; index <= game.lives-1; index++) {

            if (game.rocket.hasExploded && index == game.lives-1) {
                ctx.save();
                ctx.translate(rx + 10 + 25 * index, ry + 15);
                ctx.beginPath();
                ctx.fillText("🔥", -21, 42);
                ctx.stroke();
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(rx + 10 + 25 * index, ry + 15);
                ctx.rotate(-Math.PI / 4);
                ctx.beginPath();
                ctx.fillText("🚀", -45, 25);
                ctx.stroke();
                ctx.restore();
            }

        }

        ctx.fillStyle = "black";
        ctx.font = "26px Helvetica";

        ctx.beginPath();
        ctx.fillText("💳: " + game.score, rx - 10, ry + 95 + spacer++ * textSpacer);
        ctx.stroke();

    }

    drawMission() {

        let spacer = 0,
        textSpacer = 30;

        if (game.mission) {

            let rx = 50; //cWidth - 600;
            let ry = cHeight - 150;

            ctx.beginPath();
            ctx.fillStyle = "rgb(255,255,255,0.6)";
            //            ctx.fillRect(rx - 30, ry - 50, 450, 180, 20);
            ctx.roundRect(rx - 30, ry - 50, 450, 180, 20);
            ctx.fill();

            ctx.fillStyle = "black";
            ctx.font = "28px Helvetica";

            ctx.beginPath();
            ctx.fillText(game.rocket.name + " Mission " + (game.missionIndex + 1) + ":", rx, ry + spacer++ * textSpacer);
            ctx.stroke();

            spacer++

            ctx.font = "36px Helvetica";
            ctx.beginPath();
            ctx.fillText("Carry " + game.mission.path[0] + " to base " + game.mission.path[1], rx + 20, ry + spacer++ * textSpacer);
            ctx.stroke();

            if (game.mission.distanceToTarget) {
                ctx.font = "20px Helvetica";
                ctx.beginPath();
                ctx.fillText("Distance to target " + game.mission.distanceToTarget.toFixed(0) + " units ", rx + 20, ry + spacer++ * textSpacer);
                ctx.stroke();
            }
        }

    }

}
