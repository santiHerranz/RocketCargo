/**
 * smoke Particle Mass
 */
// Shared palette: no reason to allocate it on every single particle.
var SMOKE_COLORS = ['rgba(255,255,255,0.2)', 'rgba(200,200,200,0.2)', 'rgba(230,230,230,0.2)'];

var SmokeParticle = function (x, y, v, r = 1, mass = 0.001) {

    v = v || { x: 0, y: 0 }

    this.x = x;
    this.y = y;
    this.vx = v.x;
    this.vy = v.y;
    this.radius = r * 5;

    this.mass = mass;

    this.life = 100;
    this.fillColor = SMOKE_COLORS[(Math.random() * SMOKE_COLORS.length) | 0];
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
    // No save/restore: smoke particles only set fillStyle, which is harmless to
    // leak to the next entity in the batched world pass. We also drop stroke():
    // a transparent stroke with lineWidth 0 is a pure cost, no visible effect.
    ctx.fillStyle = this.fillColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
}



