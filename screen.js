
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

        // Cached per-frame state. getBoundingClientRect forces a layout reflow, so
        // we call it once at the start of each render instead of per drawn item.
        this._rectLeft = 0;
        this._rectTop = 0;
        this._worldActive = false;
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

    // Cache the canvas position once per frame. getBoundingClientRect triggers
    // a forced layout synchronously, so calling it per item is the single most
    // expensive thing the old renderer did.
    beginFrame() {
        var rect = canvas.getBoundingClientRect();
        this._rectLeft = rect.left;
        this._rectTop = rect.top;
    }

    // Apply the world-space transform once, then draw every world object inside
    // the block, then call endWorld. Avoids save/scale/translate/restore per item.
    beginWorld(ctx) {
        ctx.save();
        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(this.x + this.offsetX - this._rectLeft, this.y + this.offsetY - this._rectTop);
        this._worldActive = true;
    }

    endWorld(ctx) {
        ctx.restore();
        this._worldActive = false;
    }

    drawTarget(ctx) {
        // Assumes beginWorld() is active.
        ctx.strokeStyle = "rgb(255,255,255,0.3)";
        ctx.setLineDash([20, 20]);
        ctx.lineWidth = 12;

        let missionResourceName = game.mission && game.mission.path[0];
        let missionBaseName = game.mission && game.mission.path[1];
        if (!missionResourceName) { ctx.setLineDash([]); return; }

        let resource = null;
        for (let i = 0; i < game.resources.length; i++) {
            if (game.resources[i].name === missionResourceName) { resource = game.resources[i]; break; }
        }

        if (resource) {
            for (let i = 0; i < game.bases.length; i++) {
                let base = game.bases[i];
                if (base.name !== missionBaseName) continue;
                ctx.beginPath();
                ctx.moveTo(resource.x, resource.y);
                ctx.lineTo(base.x, base.y);
                ctx.stroke();
            }
        }

        ctx.setLineDash([]);
    }

    // Kept for backward compatibility in case any code still calls it directly,
    // but the main render path now batches all items under a single beginWorld.
    drawItem(item) {
        if (this._worldActive) {
            item.draw(ctx);
            return;
        }
        this.beginFrame();
        this.beginWorld(ctx);
        item.draw(ctx);
        this.endWorld(ctx);
    }

    drawScene() {
        // Assumes beginWorld() is active.
        var ground = groundPoint;

        // sky
        ctx.fillStyle = "rgba(135,206,235,0.5)";
        ctx.fillRect(-100 * cWidth, -10000, 200 * cWidth, 10000 + ground);

        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(-100 * cWidth, -1000 - 500, 200 * cWidth, 1000 + ground - 500);

        // Compute visible world bounds to cull background decorations.
        var invSX = 1 / this.scaleX;
        var invSY = 1 / this.scaleY;
        var worldLeft = -(this.x + this.offsetX - this._rectLeft);
        var worldTop  = -(this.y + this.offsetY - this._rectTop);
        var viewLeft   = worldLeft * invSX - 200;
        var viewRight  = (worldLeft + cWidth) * invSX + 200;
        var viewTop    = worldTop * invSY - 200;
        var viewBottom = (worldTop + cHeight) * invSY + 200;

        // Stars: share a single path so the GPU batches fills.
        ctx.fillStyle = "rgb(255, 255, 255)";
        for (let i = 0; i < this.stars.length; i++) {
            let s = this.stars[i];
            if (s.x < viewLeft || s.x > viewRight || s.y < viewTop || s.y > viewBottom) continue;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Trees: group by font size so we only change ctx.font a handful of times
        // per frame instead of once per tree.
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        let currentFont = "";
        for (let i = 0; i < this.trees.length; i++) {
            let t = this.trees[i];
            if (t.x < viewLeft || t.x > viewRight) continue;
            let f = t.size + "px Verdana";
            if (f !== currentFont) {
                ctx.font = f;
                currentFont = f;
            }
            ctx.fillText("🌳", t.x, t.y);
        }

        // ground
        ctx.beginPath();
        ctx.moveTo(-100 * cWidth, ground);
        ctx.lineTo(100 * cWidth, ground);
        ctx.strokeStyle = "rgba(0,100,50,0.6)";
        ctx.stroke();
        ctx.fillStyle = "rgba(0,200,100,0.6)";
        ctx.fillRect(-100 * cWidth, ground, 200 * cWidth, this.height);
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
