class Game {
    constructor(x, y) {

        this.stop = true;
        this.debug = false;

        this.x = x;
        this.y = y;

        this.rocketRespawn = true;
        this.respawnPos = {
            x: cWidth * 1 / 2,
            y: groundPoint
        };

        this.screen = new Screen(window.innerWidth * 1, window.innerHeight * 1, ctx);

        this.wind = {
            x: 0,
            y: 0
        };

        this.planes = [];
        this.rockets = [];
        this.smoke = [];
        this.fires = [];
        this.pieces = [];
        this.bases = [];
        this.resources = [];
        this.labels = [];

        this.dificulty = 1;
        this.lives = 3;
        this.highScore = 0;
        this.score = 0;


        this.rocket = null;
        this.lastRocketY = 0;

        this.planeRespawn = true;

        setTimeout(() => {
            this.showHelp();
        },100);

        this.init();
    }

    init() {

        this.planes = [];
        this.rockets = [];
        this.smoke = [];
        this.fires = [];
        this.pieces = [];
        this.bases = [];
        this.resources = [];
        this.labels = [];

        this.rocket = null;
        this.lastRocketY = 0;

        this.dificulty = 1;
        this.lives = 3;
        this.highScore = 0;
        this.score = 0;

        let rp = this.respawnPos.x;

        this.resources.push(new Resource("🍔", "🏨", rp - 1500, groundPoint));
        this.resources.push(new Resource("🧊", "🏭", rp - 2700, groundPoint));
        this.resources.push(new Resource("💰", "🏦", rp - 3400, groundPoint));
        this.resources.push(new Resource("📦", "🏬", rp + 400, groundPoint));
        this.resources.push(new Resource("🎁", "🏠", rp + 1500, groundPoint));
        this.resources.push(new Resource("🧻", "🏬", rp + 2200, groundPoint));
        this.resources.push(new Resource("🩹", "🏥", rp + 3600, groundPoint));

        this.bases.push(new Base("👾", rp - 2500, groundPoint - 1100));
        this.bases.push(new Base("👽", rp - 1000, groundPoint - 1100));
        this.bases.push(new Base("🛸", rp + 1500, groundPoint - 1100));
        this.bases.push(new Base("🛰️", rp + 3500, groundPoint - 1100));

        this.missionIndex = 0;
        this.missions = [];

        // Mission random generator
        let lastCustomer = "";
        let lastResource = "";
        while (this.missions.length < 50) {
            let r = this.resources[Math.floor(Math.random() * this.resources.length)].name;
            let c = this.bases[Math.floor(Math.random() * this.bases.length)].name;
            if (c.name != '⛽' && lastResource != r && lastCustomer != c) {
                this.missions.push({
                    path: [r, c],
                    reward: 1000
                });
                lastResource = r;
                lastCustomer = c;
            }
        }


        this.mission = this.missions[this.missionIndex];
        this.missionCompleted = false;

        // Fuel pumps
        this.bases.push(new Base("⛽", rp - 300, groundPoint, 100));
        this.bases.push(new Base("⛽", rp + 2900, groundPoint, 100));

        this.newRocket(this.respawnPos);



        this.stop = false;

    }

    interpolate(b, e, i) {
        return b + ((i / 0.99999) * (e - b));
    }

    step(dt) {



        this.screen.update(dt);

        if (this.stop)
            return;

        // remove death stuff
        this.smoke = this.smoke.filter(o => o.life > 0);
        this.rockets = this.rockets.filter(o => o.life > 0);
        this.planes = this.planes.filter(o => o.life > 0);
        this.pieces = this.pieces.filter(o => o.life > 0);
        this.fires = this.fires.filter(o => o.life > 0);
        this.labels = this.labels.filter(o => o.life > 0);

        this.resources
        // .filter(res => {
        //     return res.building == "⛽"
        // })
        .forEach(resource => {
            resource.visible = false;
        });

        this.checkMissionStatus();

        this.fires.forEach(o => o.step(dt));
        this.rockets.forEach(o => o.step(dt));
        this.planes.forEach(o => o.step(dt));
        this.smoke.forEach(o => o.step(dt));
        this.pieces.forEach(o => o.step(dt));
        this.labels.forEach(o => o.step(dt));

        // Smoke self Interaction - (poor performace)
        // let force = { x: 0.001, y: 0.0005 };
        // this.smoke.forEach(dot => {
        //     this.smoke.forEach(otherDot => {
        //         if (dot.name != otherDot.name)
        //             this.collideWithForce(dot, otherDot, force);
        //     });
        // });


        // Vertical Zoom with logic, no frustrum view
        let altitudePercent = (1 - this.rocket.altitude / this.rocket.altitudeMax);

        this.screen.scaleY = this.interpolate(0.45, 0.9, altitudePercent);
        this.screen.offsetY = this.interpolate(900, -100, altitudePercent);

        this.screen.scaleX = this.screen.scaleY;
        this.screen.x = this.interpolate(cWidth / 2, 0, altitudePercent) + this.rocket.velX / 8;

        this.screen.offsetX = -this.rocket.x + this.respawnPos.x;

        this.bases.forEach(base => {
            base.color = base.colorNormal;
        });

        // Rocket can fuel only at fuel pump base
        let fuelPump = [];
        this.bases
        .filter(base => base.name == "⛽")
        .forEach(base => fuelPump.push(base));

        if (fuelPump.length > 0) {
            this.rockets.forEach(rocket => {
                rocket.canFuel = false;

                let nearest = fuelPump[0];
                for (let index = 1; index < fuelPump.length; index++) {
                    if (fuelPump[index].distance(rocket) < nearest.distance(rocket))
                        nearest = fuelPump[index];
                }

                if (nearest != null) {
                    if (this.distance(nearest, rocket) < nearest.radius * 4) {
                        nearest.color = nearest.colorActive;
                        rocket.canFuel = true;
                    } else {
                        nearest.color = nearest.colorNormal;
                    }
                }
            });
        }

        // Rocket can take away the resource if
        // - Is at place
        // - The resource at place is the goal of the mission
        if (this.resources.length > 0) {
            this.rockets.forEach(rocket => {

                let resource = this.resources[0];
                for (let index = 1; index < this.resources.length; index++) {
                    if (this.resources[index].distance(rocket) < resource.distance(rocket))
                        resource = this.resources[index];
                }

                if (resource != null) {

                    if (this.distance(resource, rocket) < resource.radius * 3) {
                        resource.color = resource.colorActive;

                        if (!rocket.loaded || rocket.load != resource.name) {

                            if (resource.name == this.mission.path[0]) {
                                rocket.loaded = true;
                                rocket.load = resource.name;
                                resource.visible = false;
                            }
                        }
                    } else {
                        resource.color = resource.colorNormal;
                    }

                }

            });
        }

        // Base arrive
        this.rockets.forEach(rocket => {
            this.bases.forEach(base => {
                if (rocket.velY > 0 && this.collideRect(rocket, base)) {
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

        // remove out of view planes
        this.planes.forEach(plane => {
            if (plane.x > this.rocket.x + 1500)
                plane.life = 0;
            if (plane.x < this.rocket.x - 1500)
                plane.life = 0;
        });

        // Keep number of flying planes based on dificulty level
        if (this.planes.filter(o => o.life > 0).length < this.dificulty) {
            this.newPlane();
        }

        // Rocket Respawn or game Over
        if (this.rocketRespawn && this.rockets.filter(rocket => rocket.life > 0) == 0) {

            if (this.lives-1 > 0) {
                setTimeout(() => {
                    this.newRocket(this.respawnPos);
                    this.rocketRespawn = true;
                    this.lives -= 1;
                }, 3500);
                this.rocketRespawn = false;
            } else {
                setTimeout(() => {
                    this.showGameOver();
                }, 2000);
            }

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
        this.labels.forEach(o => game.screen.drawItem(o));
        this.screen.draw(ctx);
        this.screen.drawMission(ctx);
        this.screen.drawScore(ctx);

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

        position = position || {
            x: cWidth / 2,
            y: groundPoint
        };

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

        this.fires = [];
        this.smoke = [];

        return this.rocket;
    }

    newPlane() {
        let dir = (Math.random() >= 0.5);

        let x = dir ? this.rocket.x - 1500 : this.rocket.x + 1500;
        let y = groundPoint - 180 - Math.random() * 400;
        let vmin = Math.max(30, 30 + 30 * Math.random());
        let v = {
            x: (dir ? 1 : -1) * vmin,
            y: 0
        }

        let plane = new Plane({
            x: x,
            y: y
        }, v);
        plane.addListener(this);
        this.planes.push(plane);

    }

    smoking(emitter, count = 8) {

        if (randNum(1, 3) == 1)
            return;

        let pos = emitter.smokingPosition();

        for (let i = 0; i < count; i++) {
            pos = {
                x: pos.x + (Math.random() - 0.5) * 20,
                y: pos.y
            };
            let vel = {
                x: 0,
                y: -10
            };
            if (emitter.thrust != null) {
                vel = {
                    x: emitter.thrust.x * 5 + (Math.random() - 0.5) * 5,
                    y: 0 - emitter.thrust.y * 1 + (Math.random() - 0.5) * 5
                };
            }
            this.smoke.push(new SmokeParticle(pos.x, pos.y, vel));
        }

    }

    exploding(vehicle) {

        // Here it goes the sound of a big explosion


        let explodePos = vehicle.explodePosition();
        let smokeSize = 3;
        let smokeMass = 0.1;

        // A nice Fire Ball
        let fire = new Fire(vehicle.x, vehicle.y);
        fire.addListener(this);
        this.fires.push(fire);

        // A lot of dense smoke falling down
        for (let i = 0; i < 100; i++) {
            explodePos = {
                x: explodePos.x,
                y: explodePos.y
            };
            let vel = {
                x: (Math.random() - 0.5) * 25,
                y: (Math.random() - 0.5) * 25
            };
            this.smoke.push(new SmokeParticle(explodePos.x, explodePos.y, vel, smokeSize, smokeMass));
        }

    }

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

    collideRect(rect1, rect2) {

        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y) {

            // collision detected!
            return true;
        }
        return false;
    }

    collideWithForce(dot, otherDot, force) {
        // still working on understanding this
        // lots of help from https://lamberta.github.io/html5-animation/
        var dx = otherDot.x - dot.x,
        dy = otherDot.y - dot.y,
        dist = Math.sqrt(dx * dx + dy * dy),
        minDist = dot.radius + otherDot.radius;
        if (dist < minDist) {
            var tx = dot.x + dx / dist * minDist,
            ty = dot.y + dy / dist * minDist,
            ax = (tx - otherDot.x),
            ay = (ty - otherDot.y);

            ax *= force.x; //0.001;
            ay *= force.y; //0.0005;

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

    showGameOver() {
        this.screen.gameover.visible = true;
        this.stop = true;
    }

    checkMissionStatus() {
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
                if (this.mission.distanceToTarget < base.radius && this.rocket.status == "based" && this.rocket.loaded && this.rocket.life > 0) {
                    this.missionHasCompleted();
                }
            }
        }
    }
    missionHasCompleted() {
        if (!this.missionCompleted) {

            // Here it goes mission complete sound
            this.score += this.mission.reward;
            if (this.score > this.highScore)
                this.highScore = this.score;


            this.labels.push(new Label(game.rocket.x, game.rocket.y, "+" + this.mission.reward));

            setTimeout(() => {
                game.nextMission();
            }, 200);
            this.missionCompleted = true;
        }
    }

    nextMission() {
        this.missionIndex++;
        if (this.missionIndex > this.missions.length - 1)
            this.missionIndex = 0;
        this.mission = this.missions[this.missionIndex];
        this.missionCompleted = false;
        this.rocket.loaded = false;
        this.dificulty++;

    }

}
