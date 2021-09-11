class Game {
    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.screen = new Screen(window.innerWidth * 1, window.innerHeight * 1, ctx);

        this.dificulty = 20;

        this.stop = false;
        this.dt = 10 / 100;

        this.wind = {x:0,y:0};

        this.planes = [];
        this.rockets = [];
        this.smoke = [];
        this.fires = [];
        this.pieces = [];
        this.bases = [];

        this.rocket = null;
        this.lastRocketY = 0;

        this.rocketRespawn = true;
        this.respawnPos = { x: cWidth * 1 / 2, y: groundPoint };

        this.planeRespawn = true;


        this.bases.push(new Base("A", this.respawnPos.x, groundPoint));
        this.bases.push(new Base("B", this.respawnPos.x+1000, groundPoint-1000));
        this.bases.push(new Base("C", this.respawnPos.x+2000, groundPoint));
        this.bases.push(new Base("D", this.respawnPos.x+3000, groundPoint-800));
        this.bases.push(new Base("E", this.respawnPos.x+4000, groundPoint));


        this.missionIndex = 0;
        this.missions = [];
        this.missions.push({ path: ["A", "C"], description: " to carry customer payloads" });
        this.missions.push({ path: ["C", "B"], description: " to carry customer payloads" });
        this.missions.push({ path: ["B", "D"], description: " to carry customer payloads" });
        this.missions.push({ path: ["D", "A"], description: " to carry customer payloads" });
        this.mission = this.missions[this.missionIndex];

        this.newRocket(this.respawnPos);

    }

    interpolate(b, e, i) {
        return b + ((i / 0.99999) * (e - b));
    }

    step(dt) {

        // remove death stuff
        this.smoke = this.smoke.filter(o => o.life > 0);
        this.rockets = this.rockets.filter(o => o.life > 0);
        this.planes = this.planes.filter(o => o.life > 0);
        this.pieces = this.pieces.filter(o => o.life > 0);
        this.fires = this.fires.filter(o => o.life > 0);
        

        this.checkMission();

        this.screen.update(dt);



        // Smoke self Interaction
        let force = { x: 0.001, y: 0.0005 };
        this.smoke.forEach(dot => {
            this.smoke.forEach(other => {
                if (dot.name != other.name)
                    this.collideWithForce(dot, other, force);
            });

        });        

        this.fires.forEach(o => o.step(dt));
        this.rockets.forEach(o => o.step(dt));
        this.planes.forEach(o => o.step(dt));
        this.smoke.forEach(o => o.step(dt));
        this.pieces.forEach(o => o.step(dt));


        if (this.stop) return;




        // Vertical Zoom with logic, no frustrum view
        let altitudePercent = (1 - this.rocket.altitude / this.rocket.altitudeMax);

        this.screen.scaleY = this.interpolate(0.45, 0.9, altitudePercent);
        this.screen.offsetY = this.interpolate(900, -100, altitudePercent);

        this.screen.scaleX = this.screen.scaleY;
        this.screen.x = this.interpolate(cWidth / 2, 0, altitudePercent) + this.rocket.velX / 8;

        this.screen.offsetX = -this.rocket.x + this.respawnPos.x;

        this.bases.forEach(base => {
            base.color = "rgb(50,50,50,0.3)";
            base.step(dt);
        });

        // Rocket can only fuel at base
        if (this.bases.length > 0) {
            this.rockets.forEach(rocket => {
                rocket.canFuel = false;

                let nearest = this.bases[0];
                for (let index = 1; index < this.bases.length; index++) {
                    if (this.bases[index].distance(rocket) < nearest.distance(rocket))
                        nearest = this.bases[index];
                }

                if (nearest != null) {
                    rocket.canFuel = (nearest.distance(rocket) < nearest.radius* 2);
                    nearest.color = (rocket.canFuel ? "rgb(200,50,50,0.6)" : "rgb(50,50,50,0.3)");
                }
            });
        }

        this.rockets.forEach(rocket => {
            this.bases.forEach(base => {
                if (this.collide(rocket, base) ){
                    if (rocket.y > base.y-50)
                        rocket.y = base.y-50;
                        rocket.velX *= 0.95
                        rocket.velY *= 0.95
                }
            });
        });

        this.planes.forEach(plane => {
            this.rockets
                .forEach(rocket => {
                    if (this.collide(plane, rocket)) {
                        rocket.destroyVehicle();
                        plane.destroyVehicle();
                    }
                });
            });

            this.planes.forEach(plane => {
                if ( plane.x > this.rocket.x+1500  ) plane.life = 0;
                if ( plane.x < this.rocket.x-1500 ) plane.life = 0;
            });

        if (this.planes.filter(o => o.life > 0).length < this.dificulty ) {
            this.newPlane();
        }        


        // Rocket Respawn
        if (this.rocketRespawn && this.rockets.filter(rocket => rocket.life > 0) == 0) {
            setTimeout(() => {
                this.newRocket(this.respawnPos);
                this.rocketRespawn = true;
            }, 4000);
            this.rocketRespawn = false;
        }

    }

    draw(ctx) {
        ctx.clearRect(0, 0, cWidth, cHeight);
        this.screen.drawScene();
        this.bases.forEach(o => game.screen.draw(o));
        this.fires.forEach(o => game.screen.draw(o));
        this.pieces.forEach(o => game.screen.draw(o));
        this.rockets.forEach(o => game.screen.draw(o));
        this.planes.forEach(o => game.screen.draw(o));
        this.smoke.forEach(o => game.screen.draw(o));
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
        if (this.rocket)
            this.rocket.thrusRocket();
    }

    refuelRocket() {
        if (this.rocket)
            this.rocket.refuelRocket();
    }

    destroyRocket() {
        if (this.rocket)
            this.rocket.destroyVehicle();
    }
    destroyPlanes() {
        this.planes[0].destroyVehicle();
        this.planes[1].destroyVehicle();
        this.planes[2].destroyVehicle();
        this.planes[3].destroyVehicle();
        this.planes[4].destroyVehicle();
    }

    moveRocket(value) {
        if (this.rocket)
            this.rocket.moveRocket(value);
    }



    newRocket(position) {

        position = position || { x: cWidth / 2, y: groundPoint };

        if (this.rockets.filter(rocket => rocket.life > 0) == 0) {
            let rocket = new Rocket(position.x, position.y);
            rocket.addListener(this);
            this.rockets.unshift(rocket);
            this.rocket = this.rockets[0];
        }

        this.screen.scaleX = 1.0;
        this.screen.scaleY = 1.0;
        this.screen.x = this.screen.x_original;
        this.screen.y = this.screen.y_original;

        return this.rocket;
    }

    newPlane() {
        let dir = (Math.random() >= 0.5);

        let x = dir?this.rocket.x-1500:this.rocket.x+1500;
        let y = groundPoint -180 - Math.random()*400;
        let vmin = Math.max(30,30+30*Math.random());
        let v =  {x: (dir?1:-1)*vmin ,y:0}

        let plane = new Plane({ x: x, y: y }, v);
        plane.addListener(this);
        this.planes.push(plane);        
    }

    smoking(emitter, count = 1) {

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

    exploding(vehicle) {

        let explodePos = vehicle.explodePosition();
        let smokeSize = 3;
        let smokeMass = 10;

        // A nice Fire
        let fire = new Fire(vehicle.x, vehicle.y);
        fire.addListener(this);
        this.fires.push(fire);

        // A lot of smoke
        for (let i = 0; i < 100; i++) {
            explodePos = { x: explodePos.x, y: explodePos.y };
            let vel = { x: (Math.random() - 0.5) * 15, y: (Math.random() - 0.5) * 15 };
            this.smoke.push(new SmokeParticle(explodePos.x, explodePos.y, vel, smokeSize, smokeMass));
        }

        // Break in a thousand pieces
        for (let y = 0; y < vehicle.side; y++) {
            for (let x = 0; x < vehicle.side; x++) {

                let img = new Image();
                img.src = vehicle.imageData;
                let pos = { x: explodePos.x, y: explodePos.y };
                let index = x + y * vehicle.side;

                let pieceSpeedX = 2.0 * (x * vehicle.w - vehicle.Width) + 50 * (Math.random() - 0.5);
                let pieceSpeedY = 0.5 * (y * vehicle.h - vehicle.Length) + 50 * (Math.random() - 0.5);
                let rotation = 360 * (Math.random() - 0.5) * 2 * Math.PI / 360;

                this.pieces.push(new Piece(img, pos, { w: vehicle.w, h: vehicle.h }, index, { x: pieceSpeedX, y: pieceSpeedY, r: rotation }, vehicle.side));

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

    collide(dot, otherDot) {
        var dx = otherDot.x - dot.x,
            dy = otherDot.y - dot.y,
            dist = Math.sqrt(dx * dx + dy * dy),
            minDist = dot.radius + otherDot.radius;
        if (dist < minDist) {
            return true;
        }
        return false;
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
        if (this.mission) {
            this.mission.distanceToTarget = -50 + game.bases.filter(base => base.name == game.mission.path[1])[0].distance(game.rocket);
            if (this.mission.distanceToTarget < 50 && game.rocket.life > 0 ) {
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
        this.missionIndex++;
        if (this.missionIndex > this.missions.length-1)
            this.missionIndex = 0;
        this.mission = this.missions[this.missionIndex];
    }


}