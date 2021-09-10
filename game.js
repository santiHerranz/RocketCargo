class Game {
    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.screen = new Screen(window.innerWidth * 1, window.innerHeight * 1, ctx);



        this.stop = false;
        this.dt = 10 / 100;

        this.wind = { x: 0, y: 0 };

        this.rockets = [];
        this.smoke = [];
        this.fires = [];
        this.pieces = [];
        this.bases = [];

        this.currentModel = 0;
        this.currentRocket = null;
        this.lastRocketY = 0;


        this.autorespawn = true;
        this.respawnPosition = { x: cWidth * 1 / 2, y: groundPoint };

        this.relativePos = this.respawnPosition;

        this.bases.push(new Base("A", this.relativePos.x, groundPoint));
        this.bases.push(new Base("B", this.relativePos.x+1000, groundPoint));
        this.bases.push(new Base("C", this.relativePos.x+2000, groundPoint));
        this.bases.push(new Base("D", this.relativePos.x+3000, groundPoint));
        this.bases.push(new Base("E", this.relativePos.x+4000, groundPoint));


        this.indexMission = 0;
        this.missions = [];
        this.missions.push({ path: ["A", "C"], description: " to carry customer payloads" });
        this.missions.push({ path: ["C", "B"], description: " to carry customer payloads" });
        this.missions.push({ path: ["B", "D"], description: " to carry customer payloads" });
        this.missions.push({ path: ["D", "A"], description: " to carry customer payloads" });
        this.currentMission = this.missions[this.indexMission];

        this.newRocket(this.respawnPosition);


    }

    interpolate(b, e, i) {
        return b + ((i / 0.99999) * (e - b));
    }

    step(dt) {

        // remove death stuff
        this.smoke = this.smoke.filter(particle => particle.life > 0);
        this.rockets = this.rockets.filter(rocket => rocket.life > 0);
        this.pieces = this.pieces.filter(piece => piece.life > 0);
        this.fires = this.fires.filter(fire => fire.life > 0);
        

        this.checkMission();

        this.screen.update(dt);



        // Smoke self Interaction
        let force = { x: 0.001, y: 0.0005 };
        this.smoke.forEach(dot => {
            this.smoke.forEach(otherDot => {
                if (dot.name != otherDot.name)
                    this.collideWithForce(dot, otherDot, force);
            });

        });        

        this.fires.forEach(fire => fire.step(dt));
        this.rockets.forEach(rocket => rocket.step(dt));
        this.smoke.forEach(particle => particle.step(dt));
        this.pieces.forEach(piece => piece.step(dt));


        if (this.stop) return;

        // Vertical Zoom with logic, no frustrum view
        let altitudePercent = (1 - this.currentRocket.altitude / this.currentRocket.altitudeMax);

        this.screen.scaleY = this.interpolate(0.45, 1.0, altitudePercent);
        this.screen.screenOffsetY = this.interpolate(900, -100, altitudePercent);

        this.screen.scaleX = this.screen.scaleY;
        this.screen.x = this.interpolate(cWidth / 2, 0, altitudePercent) + this.currentRocket.velX / 8;

        this.screen.screenOffsetX = -this.currentRocket.x + this.respawnPosition.x;

        this.bases.forEach(base => {
            base.color = "rgb(50,50,50,0.3)";
            base.step(dt);
        });





        // Rocket can only fuel at base
        if (this.bases.length > 0) {
            this.rockets.forEach(rocket => {
                rocket.canFuel = false;

                let nearestBase = this.bases[0];
                for (let index = 1; index < this.bases.length; index++) {
                    if (this.bases[index].distance(rocket) < nearestBase.distance(rocket))
                        nearestBase = this.bases[index];
                }

                if (nearestBase != null) {
                    rocket.canFuel = (nearestBase.distance(rocket) < nearestBase.SafeDistance * 2);
                    nearestBase.color = (rocket.canFuel ? "rgb(200,50,50,0.6)" : "rgb(50,50,50,0.3)");
                }

            });

        }


        // Auto Respawn
        if (this.autorespawn && this.rockets.filter(rocket => rocket.life > 0) == 0) {
            setTimeout(() => {
                this.newRocket(this.respawnPosition);
                this.autorespawn = true;
            }, 4000);
            this.autorespawn = false;
        }

    }

    draw(ctx) {

        ctx.clearRect(0, 0, cWidth, cHeight);

        this.screen.drawScene();

        this.bases.forEach(base => game.screen.draw(base));

        this.fires.forEach(particle => game.screen.draw(particle));
        this.pieces.forEach(piece => game.screen.draw(piece));
        this.rockets.forEach(rocket => game.screen.draw(rocket));
        this.smoke.forEach(particle => game.screen.draw(particle));


    }

    event(type, position) {
        if (type == "mousedown") {
        }
    }


    mouseMoveEvent(position) {
        var screenPosition = game.screen.translate(position);
    }
    mouseClickLeftEvent(position) {
        var screenPosition = game.screen.translate(position);
    }
    mouseClickRightEvent(position) {
        var screenPosition = game.screen.translate(position);
    }

    mouseUpEvent(position) {

        var screenPosition = game.screen.translate(position);

    }

    thrusRocket() {
        if (this.currentRocket)
            this.currentRocket.thrusRocket();
    }

    refuelRocket() {
        if (this.currentRocket)
            this.currentRocket.refuelRocket();
    }

    destroyRocket() {
        if (this.currentRocket)
            this.currentRocket.destroyRocket();
    }
    moveRocket(value) {
        if (this.currentRocket)
            this.currentRocket.moveRocket(value);
    }



    newRocket(position) {

        position = position || { x: cWidth / 2, y: groundPoint };

        if (this.rockets.filter(rocket => rocket.life > 0) == 0) {
            let rocket = new Rocket(position.x, position.y, this.currentModel);
            rocket.addListener(this);
            this.rockets.unshift(rocket);
            this.currentRocket = this.rockets[0];
        }

        this.screen.scaleX = 1.0;
        this.screen.scaleY = 1.0;
        this.screen.x = this.screen.x_original;
        this.screen.y = this.screen.y_original;

        this.fires = [];
        this.smoke = [];

        return this.currentRocket;
    }

    smoking(emitter, count = 5) {

        let pos = emitter.smokingPosition();

        for (let i = 0; i < count; i++) {
            pos = { x: pos.x + (Math.random() - 0.5) * 20, y: pos.y };
            let vel = { x: 0, y: 0 };
            if (emitter.thrust != null) {
                vel = { x: emitter.thrust.x * 5 + (Math.random() - 0.5) * 5, y: 0 - emitter.thrust.y * 1 + (Math.random() - 0.5) * 5 };
            }
            this.smoke.push(new SmokeParticle(pos.x, pos.y, vel));
        }



    }

    exploding(rocket) {

        let explodePosition = rocket.explodePosition();
        let smokeParticleSize = 3;
        let smokeParticleMass = 10;

        // A lot of Fire
        let fire = new Fire(rocket.x, rocket.y);
        fire.addListener(this);
        this.fires.push(fire);

        // A lot of smoke
        for (let i = 0; i < 100; i++) {
            explodePosition = { x: explodePosition.x, y: explodePosition.y };
            let vel = { x: (Math.random() - 0.5) * 15, y: (Math.random() - 0.5) * 15 };
            this.smoke.push(new SmokeParticle(explodePosition.x, explodePosition.y, vel, smokeParticleSize, smokeParticleMass));
        }

        // Break in a thousand pieces
        for (let y = 0; y < rocket.side; y++) {
            for (let x = 0; x < rocket.side; x++) {

                let img = new Image();
                img.src = rocket.imageData;
                let pos = { x: explodePosition.x, y: explodePosition.y };
                let index = x + y * rocket.side;

                let pieceSpeedX = 2.0 * (x * rocket.w - rocket.Width) + 50 * (Math.random() - 0.5);
                let pieceSpeedY = 0.5 * (y * rocket.h - rocket.Length) + 50 * (Math.random() - 0.5);
                let rotation = 360 * (Math.random() - 0.5) * 2 * Math.PI / 360;

                this.pieces.push(new Piece(img, pos, { w: rocket.w, h: rocket.h }, index, { x: pieceSpeedX, y: pieceSpeedY, r: rotation }, rocket.side));

            }
        }


    }

    /////////////////

    distance(dot, otherDot) {
        var dx = otherDot.x - dot.x,
            dy = otherDot.y - dot.y,
            dist = Math.sqrt(dx * dx + dy * dy);
        return dist;
    }


    collideWithForce(dot, otherDot, force) {
        var dx = otherDot.x - dot.x,
            dy = otherDot.y - dot.y,
            dist = Math.sqrt(dx * dx + dy * dy),
            minDist = dot.radius + otherDot.radius;
        if (dist < minDist) {
            var tx = dot.x + dx / dist * minDist,
                ty = dot.y + dy / dist * minDist,
                ax = (tx - otherDot.x),
                ay = (ty - otherDot.y);

            ax *= force.x;
            ay *= force.y;

            dot.vx -= ax;
            dot.vy -= ay;
            otherDot.vx += ax;
            otherDot.vy += ay;
            return true;
        }
        return false;
    }



    checkMission() {
        if (this.currentMission) {
            this.currentMission.distanceToTarget = -50 + game.bases.filter(base => base.name == game.currentMission.path[1])[0].distance(game.currentRocket);
            if (this.currentMission.distanceToTarget < 50 && game.currentRocket.grounded && game.currentRocket.life > 0 ) {
                this.missionCompleted();
            }
        }
    }
    missionCompleted() {
        game.stop = true;
        this.screen.modal.title = "M I S S I O N  C O M P L E T E D !"
        this.screen.modal.visible = true;
    }

    nextMission(){
        this.indexMission++;
        if (this.indexMission > this.missions.length-1)
            this.indexMission = 0;
        this.currentMission = this.missions[this.indexMission];
    }


}