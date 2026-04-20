
function Fire(x, y, v) {

  v = v || { x: 0, y: 3 } // fire ball falling

  this.x = x;
  this.y = y;
  this.vx = v.x;
  this.vy = v.y;

  this.radius = 20;

  this.lifeMax = 300;
  this.life = this.lifeMax;

  this.max = 50;
  this.speed = 1.5;
  this.size = 20;

  this.fireWidth = 50;

  this.particles = [];

  this.listeners = [];

  this.showLifeIndicator = true;

}

Fire.prototype.addListener = function (listener) {
  this.listeners.push(listener);
}

Fire.prototype.smokingPosition = function () {
  return { x: this.x, y: this.y };
}

Fire.prototype.step = function (dt) {

  this.vy += gravity;

  this.vx += game.wind.x;
  this.vy += game.wind.y;

  // apply forces	
  this.x += dt * this.vx;
  this.y += dt * this.vy;

  if (this.y > groundPoint)
    this.y = groundPoint + 20;

  for (var i = 0; i < 1; i++) {
    //Adds a particle at the position, with random horizontal and vertical speeds
    var p = new FireParticle(this.x + (Math.random() - 0.5) * this.fireWidth, this.y, ((Math.random() - 0.5) * this.speed) / 2, 0 - Math.random() * 2 * this.speed);
    this.particles.push(p);
  }

  this.smoking(this);

  this.life -= 1;
}

Fire.prototype.draw = function (ctx) {

  ctx.save();

  // We only flip globalCompositeOperation twice instead of once per particle.
  // Previous half: "xor", second half: "lighter" (keeps the original look).
  let particles = this.particles;
  let n = particles.length;
  let half = n >> 1;
  let invMax = 1 / this.max;
  let halfSize = this.size / 2;

  if (n > 0) ctx.globalCompositeOperation = "xor";

  for (let i = 0; i < n; i++) {
    if (i === half) ctx.globalCompositeOperation = "lighter";

    let p = particles[i];
    // Starts red-orange and fades toward grey / transparent as life grows.
    let life2 = p.life * 2;
    let aged = (this.max - p.life) * invMax;
    ctx.fillStyle = "rgba(" + (260 - life2) + "," + (life2 + 50) + "," + life2 + "," + (aged * 0.4) + ")";

    ctx.beginPath();
    ctx.arc(p.x, p.y, aged * halfSize + halfSize, 0, 2 * Math.PI);
    ctx.fill();

    p.x += p.xs;
    p.y += p.ys;
    p.life++;
  }

  // Remove expired particles in one pass at the end instead of splicing inside
  // the render loop (each splice is O(n), and it was also corrupting the
  // xor/lighter boundary when particles were removed mid-iteration).
  let w = 0;
  for (let i = 0; i < n; i++) {
    if (particles[i].life < this.max) {
      if (w !== i) particles[w] = particles[i];
      w++;
    }
  }
  particles.length = w;

  ctx.restore();

}


Fire.prototype.smoking = function () {
  this.listeners.forEach(listener => {
    listener.smoking(this);
  });
}



function FireParticle(x, y, xs, ys) {
  this.x = x;
  this.y = y;
  this.xs = xs;
  this.ys = ys;
  this.life = 0;
}





