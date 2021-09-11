

function Fire(x, y, v) {

  v = v || { x: 1, y: 3 }

  this.x = x;
  this.y = y;
  this.vx = v.x;
  this.vy = v.y;

  this.radius = 20;

  this.lifeMax = 300;
  this.life = this.lifeMax;

  this.max = 50;
  this.speed = 0.5;
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


  //Makes the colors add onto each other, producing
  //that nice white in the middle of the fire
  for (i = 0; i < this.particles.length; i++) {



    if (i < this.particles.length / 2) {
      ctx.globalCompositeOperation = "xor";
    }
    else
      ctx.globalCompositeOperation = "lighter";


    //Set the file colour to an RGBA value where it starts off red-orange, but progressively gets more grey and transparent the longer the particle has been alive for
    let r = (260 - (this.particles[i].life * 2));
    let g = ((this.particles[i].life * 2) + 50);
    let b = (this.particles[i].life * 2);
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (((this.max - this.particles[i].life) / this.max) * 0.4) + ")";

    ctx.beginPath();
    //Draw the particle as a circle, which gets slightly smaller the longer it's been alive for
    ctx.arc(this.particles[i].x, this.particles[i].y, (this.max - this.particles[i].life) / this.max * (this.size / 2) + (this.size / 2), 0, 2 * Math.PI);
    ctx.fill();

    //Move the particle based on its horizontal and vertical speeds
    this.particles[i].x += this.particles[i].xs;
    this.particles[i].y += this.particles[i].ys;

    this.particles[i].life++;
    //If the particle has lived longer than we are allowing, remove it from the array.
    if (this.particles[i].life >= this.max) {
      this.particles.splice(i, 1);
      i--;
    }
  }
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





