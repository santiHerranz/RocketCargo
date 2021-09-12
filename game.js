class Game {
    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.screen = new Screen(window.innerWidth * 1, window.innerHeight * 1, ctx);

        this.dificulty = 1;

        this.stop = false;
        this.dt = 10 / 100;

        this.wind = {x:0,y:0};

        this.planes = [];
        this.rockets = [];
        this.smoke = [];
        this.fires = [];
        this.pieces = [];
        this.bases = [];
        this.resources = [];
        
        this.rocket = null;
        this.lastRocketY = 0;

        this.rocketRespawn = true;
        this.respawnPos = { x: cWidth * 1 / 2, y: groundPoint };

        this.planeRespawn = true;

        let rp = this.respawnPos.x;

        this.resources.push(new Resource("🍔", "🏨", rp-1500, groundPoint));
        this.resources.push(new Resource("🧊", "🏭", rp-2700, groundPoint));
        this.resources.push(new Resource("💰", "🏦", rp-3400, groundPoint));
        this.resources.push(new Resource("📦", "🏰", rp+400, groundPoint));
        this.resources.push(new Resource("🎁", "🏠", rp+1500, groundPoint));
        this.resources.push(new Resource("🧻", "🏬", rp+2200, groundPoint));
        this.resources.push(new Resource("🩹", "🏥", rp+3600, groundPoint));

        this.bases.push(new Base("👾", rp-2500, groundPoint-1100));
        this.bases.push(new Base("👽", rp-1000, groundPoint-1100));
        this.bases.push(new Base("🛸", rp+1500, groundPoint-1100));
        this.bases.push(new Base("🛰️", rp+3500, groundPoint-1100));


        this.missionIndex = 0;
        this.missions = [];


        // Mission random generator
        for (let index = 0; index < 50; index++) {
            let r = this.resources[Math.floor(Math.random()*this.resources.length)].name;
            let c = this.bases[Math.floor(Math.random()*this.bases.length)].name;
            this.missions.push({ path: [r,c]});
        }
        this.missions = this.missions.sort((a, b) => {return 0.5 - Math.random()});

        // First mission always is Package to Alien
        this.missions.unshift({ path: ["📦","👽"]});

        this.mission = this.missions[this.missionIndex];
        this.missionCompleted = false;

        this.newRocket(this.respawnPos);

        // setTimeout(() => {
        //     this.showHelp();
        // },100);

    }

    interpolate(b, e, i) {
        return b + ((i / 0.99999) * (e - b));
    }

    step(dt) {

        this.screen.update(dt);

        if (this.stop) return;


        // remove death stuff
        this.smoke = this.smoke.filter(o => o.life > 0);
        this.rockets = this.rockets.filter(o => o.life > 0);
        this.planes = this.planes.filter(o => o.life > 0);
        this.pieces = this.pieces.filter(o => o.life > 0);
        this.fires = this.fires.filter(o => o.life > 0);
        

        this.bases.forEach(base => {
            base.animate = false;
        });
        this.resources.forEach(resource => {
            resource.visible = false;
        });


        this.checkMission();




        // Smoke self Interaction
        // let force = { x: 0.001, y: 0.0005 };
        // this.smoke.forEach(dot => {
        //     this.smoke.forEach(other => {
        //         if (dot.name != other.name)
        //             this.collideWithForce(dot, other, force);
        //     });

        // });        

        this.fires.forEach(o => o.step(dt));
        this.rockets.forEach(o => o.step(dt));
        this.planes.forEach(o => o.step(dt));
        this.smoke.forEach(o => o.step(dt));
        this.pieces.forEach(o => o.step(dt));


        // Vertical Zoom with logic, no frustrum view
        let altitudePercent = (1 - this.rocket.altitude / this.rocket.altitudeMax);

        this.screen.scaleY = this.interpolate(0.45, 0.9, altitudePercent);
        this.screen.offsetY = this.interpolate(900, -100, altitudePercent);

        this.screen.scaleX = this.screen.scaleY;
        this.screen.x = this.interpolate(cWidth / 2, 0, altitudePercent) + this.rocket.velX / 8;

        this.screen.offsetX = -this.rocket.x + this.respawnPos.x;

        this.bases.forEach(base => {
            base.color = base.colorNormal;
            base.step(dt);
        });

        // Rocket can fuel at base or at resource
        let places = [];
        this.bases.forEach(base => places.push(base));
        this.resources.forEach(resource => places.push(resource));
        if (places.length > 0) {
            this.rockets.forEach(rocket => {
                rocket.canFuel = false;

                let nearest = places[0];
                for (let index = 1; index < places.length; index++) {
                    if (places[index].distance(rocket) < nearest.distance(rocket))
                        nearest = places[index];
                }

                if (nearest != null) {
                    rocket.canFuel = (nearest.distance(rocket) < nearest.radius* 2);
                    nearest.color = (rocket.canFuel ? nearest.colorActive : nearest.colorNormal);
                }

            });
        }

        // Rocket can take away the resource
        if (this.resources.length > 0) {
            this.rockets.forEach(rocket => {

                let nearest = this.resources[0];
                for (let index = 1; index < this.resources.length; index++) {
                    if (this.resources[index].distance(rocket) < nearest.distance(rocket))
                        nearest = this.resources[index];
                }

                if (nearest != null) {
                    if ((nearest.distance(rocket) < nearest.radius*1.2) && (!rocket.loaded || rocket.load != nearest.resource) ) {
                        rocket.loaded = true;
                        rocket.load = nearest.name;
                        nearest.visible = false;
                    }
                }

            });
        }


        // TODO improve
        this.rockets.forEach(rocket => {
            this.bases.forEach(base => {
                if (rocket.velY > 0 && this.collide(rocket, base) ){
                    if (rocket.y > base.y-50)
                        rocket.y = base.y-50;
                        rocket.status = "based";
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

        // remove overview planes 
        this.planes.forEach(plane => {
            if ( plane.x > this.rocket.x+1500  ) plane.life = 0;
            if ( plane.x < this.rocket.x-1500 ) plane.life = 0;
        });

        // Keep number of flying planes based on dificulty level
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
        this.screen.drawTarget(ctx);
        this.bases.forEach(o => game.screen.drawItem(o));
        this.resources.forEach(o => game.screen.drawItem(o));
        this.fires.forEach(o => game.screen.drawItem(o));
        this.pieces.forEach(o => game.screen.drawItem(o));
        this.rockets.forEach(o => game.screen.drawItem(o));
        this.planes.forEach(o => game.screen.drawItem(o));
        this.smoke.forEach(o => game.screen.drawItem(o));
        this.screen.draw(ctx);
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



    showHelp() {
        this.screen.modal.visible = true;
        this.stop = true;
    }


    checkMission() {
        if (this.mission) {
            let resourceName = this.mission.path[0]
            let resource = this.resources.filter(resource => resource.name == resourceName)[0];
             if (resource != null) {
                resource.visible = true;
                resource.animate = true;     
             }      
             let baseName = this.mission.path[1];
            let base = this.bases.filter(base => base.name == baseName)[0];
            if (base != null) {
                base.visible = true;
                base.animate = true;
                this.mission.distanceToTarget = -50 + base.distance(this.rocket);
                if (this.mission.distanceToTarget < 50 && this.rocket.loaded && this.rocket.life > 0 ) {
                    this.missionHasCompleted();
                }
            }
        }
    }
    missionHasCompleted() {
        if (!this.missionCompleted) {
            setTimeout(() => {
                game.nextMission();
            }, 800);
            this.missionCompleted = true;
        }
    }

    nextMission(){
        this.missionIndex++;
        if (this.missionIndex > this.missions.length-1)
            this.missionIndex = 0;
        this.mission = this.missions[this.missionIndex];
        this.missionCompleted = false;
        this.rocket.loaded = false;
        this.dificulty ++;
    }


}