

"use strict"; // strict mode

// Remove-dead-in-place. Returns the new length (== number of alive objects).
// Replaces `arr = arr.filter(o => o.life > 0)` which allocated a new array per
// call and was invoked on 6 arrays every single frame.
function compactAlive(arr) {
    let w = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].life > 0) {
            if (w !== i) arr[w] = arr[i];
            w++;
        }
    }
    arr.length = w;
    return w;
}

let time = 1;

class Timer {
    constructor() {
        this.endTime = 0;
    }
    Set(timeLeft = 0) {
        this.endTime = time + timeLeft;
    }
    Get() {
        return this.IsSet() ? time - this.endTime : 1e9;
    }
    IsSet() {
        return this.endTime > 0;
    }
    UnSet() {
        this.endTime = 0;
    }
    Elapsed() {
        return !this.IsSet() || time > this.endTime;
    }
}

let coinSoundTimer = new Timer();

class Game {
    constructor(x, y) {

        this.debug = false;

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


        setTimeout(() => {
             this.showHelp();
        }, 100);

        this.init();


    }

    tweetScore() {
        const TEXT_DIVIDER = " &nbsp;&#8901;&nbsp; ";
        const TWEET_PREFIX = "https://twitter.com/intent/tweet?text=";
        const TWEET_SUFFIX = "%0A%0APlay%20Rocket%20Cargo%20%23js13k%20game%20by%20%40santiHerranz%20here:%20js13kgames.com%2Fentries%2Frocket-cargo";

        window.open(TWEET_PREFIX + "Mission%20" + (this.missionIndex + 1) + "%20scoring%20" + this.score + "%20points" + TWEET_SUFFIX);
    }

    init() {

        this.gameover = false;

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

        this.missionIndex = 0;
        this.mission = this.missions[this.missionIndex];
        this.missionCompleted = false;

        // Fuel pumps
        this.bases.push(new Base("⛽", rp - 300, groundPoint, 100));
        this.bases.push(new Base("⛽", rp + 2900, groundPoint, 100));
        this._fuelPumpsDirty = true;

        this.newRocket(this.respawnPos);

        this.noFuel = false;

        this.stop = false;

    }

    interpolate(b, e, i) {
        return b + ((i / 0.99999) * (e - b));
    }

    UpdateAudio() {

        if (coinSoundTimer.IsSet() && coinSoundTimer.Elapsed()) {
            // coin sound plays twice quickly with higher pitch the second time
            PlaySound(10, 800)
            coinSoundTimer.UnSet();
        }
    }

    step(dt) {

        //this.UpdateAudio();

        this.screen.update(dt);

        if (this.stop)
            return;

        // In-place removal of dead objects. Avoids allocating 6 new arrays per
        // frame (big GC pressure win with lots of smoke/pieces on screen).
        compactAlive(this.smoke);
        compactAlive(this.rockets);
        let alivePlanes = compactAlive(this.planes);
        compactAlive(this.pieces);
        compactAlive(this.fires);
        compactAlive(this.labels);

        for (let i = 0; i < this.resources.length; i++) this.resources[i].visible = false;

        this.checkMissionStatus();


        let rocket = this.rocket;

        if (rocket.fuel > 0) {
            rocket.velX += rocket.thrust.x;
            rocket.velY -= rocket.thrust.y;

            rocket.fuel -= rocket.thrust.y;
            rocket.fuel = Math.max(0, rocket.fuel);
        } else {
            rocket.thrust.x = 0;
            rocket.thrust.y = 0;
            if (!this.noFuel) {
                this.playSound("NO_FUEL");
                this.noFuel = true;
            }
        }


        for (let i = 0; i < this.fires.length; i++) this.fires[i].step(dt);
        for (let i = 0; i < this.rockets.length; i++) this.rockets[i].step(dt);
        for (let i = 0; i < this.planes.length; i++) this.planes[i].step(dt);
        for (let i = 0; i < this.smoke.length; i++) this.smoke[i].step(dt);
        for (let i = 0; i < this.pieces.length; i++) this.pieces[i].step(dt);
        for (let i = 0; i < this.labels.length; i++) this.labels[i].step(dt);


        // Vertical Zoom with logic, no frustrum view
        let altitudePercent = (1 - this.rocket.altitude / this.rocket.altitudeMax);

        this.screen.scaleY = this.interpolate(0.45, 0.9, altitudePercent);
        this.screen.offsetY = this.interpolate(900, -100, altitudePercent);

        this.screen.scaleX = this.screen.scaleY;
        this.screen.x = this.interpolate(cWidth / 2, 0, altitudePercent) + this.rocket.velX / 8;

        this.screen.offsetX = -this.rocket.x + this.respawnPos.x;

        for (let i = 0; i < this.bases.length; i++) this.bases[i].color = this.bases[i].colorNormal;

        // Fuel pumps rarely change, so cache the subset.
        if (!this._fuelPumps || this._fuelPumpsDirty) {
            this._fuelPumps = [];
            for (let i = 0; i < this.bases.length; i++) {
                if (this.bases[i].name === "⛽") this._fuelPumps.push(this.bases[i]);
            }
            this._fuelPumpsDirty = false;
        }
        let fuelPump = this._fuelPumps;

        if (fuelPump.length > 0) {
            for (let r = 0; r < this.rockets.length; r++) {
                let rk = this.rockets[r];
                rk.canFuel = false;

                // Squared distance: avoids 2 sqrt per candidate per rocket.
                let nearest = fuelPump[0];
                let dxN = nearest.x - rk.x, dyN = nearest.y - rk.y;
                let nearestD2 = dxN * dxN + dyN * dyN;
                for (let i = 1; i < fuelPump.length; i++) {
                    let fp = fuelPump[i];
                    let dx = fp.x - rk.x, dy = fp.y - rk.y;
                    let d2 = dx * dx + dy * dy;
                    if (d2 < nearestD2) { nearest = fp; nearestD2 = d2; }
                }

                let reach = nearest.radius * 4;
                if (nearestD2 < reach * reach) {
                    nearest.color = nearest.colorActive;
                    rk.canFuel = true;
                } else {
                    nearest.color = nearest.colorNormal;
                }
            }
        }

        this.refuelRocket();

        // Rocket can take away the resource if
        // - Is at place
        // - The resource at place is the goal of the mission
        if (this.resources.length > 0) {
            for (let r = 0; r < this.rockets.length; r++) {
                let rk = this.rockets[r];

                let resource = this.resources[0];
                let dxN = resource.x - rk.x, dyN = resource.y - rk.y;
                let nearestD2 = dxN * dxN + dyN * dyN;
                for (let i = 1; i < this.resources.length; i++) {
                    let res = this.resources[i];
                    let dx = res.x - rk.x, dy = res.y - rk.y;
                    let d2 = dx * dx + dy * dy;
                    if (d2 < nearestD2) { resource = res; nearestD2 = d2; }
                }

                let reach = resource.radius * 3;
                if (nearestD2 < reach * reach) {
                    resource.color = resource.colorActive;

                    if (!rk.loaded || rk.load != resource.name) {
                        if (this.mission && resource.name == this.mission.path[0]) {
                            rk.loaded = true;
                            rk.load = resource.name;
                            resource.visible = false;
                            this.doing(rk, "PICKING");
                        }
                    }
                } else {
                    resource.color = resource.colorNormal;
                }
            }
        }

        // Base arrive
        for (let r = 0; r < this.rockets.length; r++) {
            let rk = this.rockets[r];
            if (rk.velY <= 0) continue;
            for (let b = 0; b < this.bases.length; b++) {
                if (this.collideRect(rk, this.bases[b])) {
                    rk.status = "based";
                    break;
                }
            }
        }

        for (let p = 0; p < this.planes.length; p++) {
            let plane = this.planes[p];
            for (let r = 0; r < this.rockets.length; r++) {
                let rk = this.rockets[r];
                if (this.collide(plane, rk)) {
                    rk.destroyVehicle();
                    plane.destroyVehicle();
                    this.doing(rk, "EXPLODING");
                }
            }
        }

        // remove out of view planes
        let rx = this.rocket.x;
        for (let p = 0; p < this.planes.length; p++) {
            let plane = this.planes[p];
            if (plane.x > rx + 1500 || plane.x < rx - 1500) plane.life = 0;
        }

        // Keep number of flying planes based on dificulty level. We already know
        // how many were alive this tick from compactAlive's return value.
        if (alivePlanes < this.dificulty) {
            this.newPlane();
        }

        // Rocket Respawn or game Over
        if (this.rocketRespawn && this.rockets.length === 0) {

            if (this.lives - 1 > 0) {
                setTimeout(() => {
                    this.newRocket(this.respawnPos);
                    this.rocketRespawn = true;
                    this.lives -= 1;
                    this.doing(rocket, "NEW_LIVE");

                }, 3500);
                this.rocketRespawn = false;
            } else {

                if (!this.gameover) {
                    setTimeout(() => {
                        this.showGameOver();
                    }, 1500);

                    this.gameover = true;

                    setTimeout(() => {
                        this.doing(this.rocket, "GAME_OVER");
                    }, 1000);
                }
            }

        }

    }

    draw(ctx) {
        ctx.clearRect(0, 0, cWidth, cHeight);

        // World-space pass: one transform shared by scene + all entities.
        this.screen.beginFrame();
        this.screen.beginWorld(ctx);
        this.screen.drawScene();
        this.screen.drawTarget(ctx);

        // One save/restore per list (not per item): keeps canvas state isolated
        // between different kinds of entities without paying the matrix cost of
        // a save+scale+translate+restore per entity like the old code did.
        let lists = [this.bases, this.resources, this.fires, this.pieces, this.rockets, this.planes, this.smoke, this.labels];
        for (let l = 0; l < lists.length; l++) {
            let arr = lists[l];
            if (arr.length === 0) continue;
            ctx.save();
            for (let i = 0; i < arr.length; i++) arr[i].draw(ctx);
            ctx.restore();
        }

        this.screen.endWorld(ctx);

        // Screen-space HUD pass.
        this.screen.draw(ctx);
        this.screen.drawMission(ctx);
        this.screen.drawScore(ctx);

    }

    thrusRocket() {
        let rocket = this.rocket;

        if (rocket) {
            if (rocket.velY > 100)
                rocket.thrust.y += rocket.landingThrust;
            else
                rocket.thrust.y += rocket.manualThrust;

        }
    }

    refuelRocket() {
        let rocket = this.rocket;
        if (rocket) {
            if (rocket.fuel < rocket.fuel_MAX && rocket.canFuel) {
                if (this.score > 0) {
                    rocket.fuel += rocket.fuel_MAX / 100;
                    this.score -= 0.5 * rocket.fuel_MAX / 100;
                    this.doing(rocket, 'FUELING');
                    this.noFuel = false;
                }
            }
        }
    }

    destroyRocket() {
        if (this.rocket){
            this.playSound('EXPLODING');
            this.rocket.destroyVehicle();
        }
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

        let aliveCount = 0;
        for (let i = 0; i < this.rockets.length; i++) if (this.rockets[i].life > 0) aliveCount++;
        if (aliveCount === 0) {
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

        this.noFuel = false;


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

    doing(who, what) {

        switch (what) {
        case 'TRUSTING':

            // if (coinSoundTimer.IsSet() && coinSoundTimer.Elapsed()) {
            //     // coin sound plays twice quickly with higher pitch the second time
            //     this.playSound('TRUSTING', 800);
            //     coinSoundTimer.UnSet();
            // }
            this.playSound('TRUSTING', 800);

            break;
        case 'EXPLODING':
            this.playSound('EXPLODING');
            this.exploding(who);
            break;
        case 'SMOKING':
            this.playSound('SMOKING');
            this.smoking(who);
            break;

        default:
            this.playSound(what);

            break;
        }

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
        this.playSound('DESTROYED');

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
        if (!this.mission) return;

        let resourceName = this.mission.path[0];
        for (let i = 0; i < this.resources.length; i++) {
            let r = this.resources[i];
            if (r.name === resourceName) {
                r.visible = !this.rocket.loaded || this.rocket.load !== resourceName;
                r.animate = true;
                break;
            }
        }

        let baseName = this.mission.path[1];
        for (let i = 0; i < this.bases.length; i++) {
            let b = this.bases[i];
            if (b.name !== baseName) continue;
            b.visible = true;
            b.animate = true;
            this.mission.distanceToTarget = -50 + b.distance(this.rocket);
            if (this.mission.distanceToTarget < b.radius && this.rocket.status == "based" && this.rocket.loaded && this.rocket.life > 0) {
                this.missionHasCompleted();
            }
            break;
        }
    }
    missionHasCompleted() {
        if (!this.missionCompleted) {

            // Here it goes mission complete sound
            this.doing(this.rocket, "MISSION_COMPLETED");

            setTimeout(() => {
                this.doing(this.rocket, this.mission.path[1]);
            }, 200);

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

        this.doing(this.rocket, "NEXT_MISSION");

    }

    //
    playSound(sound, p = 0) {

        switch (sound) {
        case "EXPLODING":
            zzfx(1.24, .15, 132, .1, 0, .4, 4, 2.5, 0, 0, 0, 0, 0, 0, 0, 1, .24, .37, 0, 0);
            break;
        case "FUELING":
            zzfx(...[, , 537, .02, .02, .22, 1, 1.59, -6.98, 4.97]);
            break;
        case "TRUSTING":
            zzfx(...[, , 224, .02, .02, .08, 1, 1.7, -13.9, , , , , , 6.7]);
            break;
        case "PICKING":
            zzfx(...[1.5, .5, 270, , .1, , 1, 1.5, , , , , , , , .1, .01]);
            break;
        case "NEXT_MISSION":
            //awzzfx(...[, , 172, .8, , .8, 1, .76, 7.7, 3.73, -482, .08, .15, , .14]);
            break;
        case "MISSION_COMPLETED":
            zzfx(...[, , 1675, , .06, .24, 1, 1.82, , , 837, .06]);
            break;
        case "GAME_OVER":
            zzfx(...[,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17]); // Game Over

            break;
                    case "👾":
            zzfx(...[, , 662, .82, .11, .33, 1, 0, , -0.2, , , , 1.2, , .26, .01]);
            break;
        case "👽":
            zzfx(...[, , 1675, , .06, .24, 1, 1.82, , , 837, .06]);
            break;
        case "🛰️":
            zzfx(...[, .5, 847, .02, .3, .9, 1, 1.67, , , -294, .04, .13, , , , .1]);
            break;
        case "🛸":
            zzfx(...[, , 103, .1, .35, .91, 1, .82, 9.3, -2.4, 2, .06, .08, , , .1, , .54, .09]); // Powerup 16
            break;
        case "NEW_LIVE":
            zzfx(...[, , 20, .04, , .6, , 1.31, , , -990, .06, .17, , , .04, .07]);
            break;

            case "NO_FUEL":
                zzfx(.2, .1, 1319, .05, .34, .9, 1,                3.6, .47); // ZzFX 74550
                break;
    
            

        default:
            break;
        }

    }

}
