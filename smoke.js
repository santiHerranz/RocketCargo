/**
 * smoke Particle Mass
 */
var SmokeParticle = function (x, y, v, r = 1, mass = 0.001) {

    this.name = Math.random().toString(36).substr(2, 9);

    var smokeColors = ['rgba(255,255,255,0.2)', 'rgba(200,200,200,0.2)', 'rgba(230,230,230,0.2)'];

    v = v || { x: 0, y: 0 }

    this.x = x;
    this.y = y;
    this.vx = v.x;
    this.vy = v.y;
    this.radius = r * 5;

    this.mass = mass;

    this.life = 100;
    this.strokeColor = smokeColors[randNum(0, smokeColors.length - 1)];
    this.fillColor = smokeColors[randNum(0, smokeColors.length - 1)];
}

SmokeParticle.prototype.step = function (dt) {

    this.vy += gravity * this.mass;

    this.vx += game.wind.x;
    this.vy += game.wind.y;

    // apply forces	
    this.x += dt * this.vx;
    this.y += dt * this.vy;

    if (this.y > groundPoint) {
         this.y = groundPoint;
         this.vy *= -1;
    }

    this.life -= 1;

    if (this.radius < 30) {
        this.radius += 0.1;
    }
}

SmokeParticle.prototype.draw = function (ctx) {

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.strokeStyle = this.strokeColor;
    ctx.fillStyle = this.fillColor;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}



