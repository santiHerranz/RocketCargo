
class Base {
	constructor(name, x,y, r = 100) {
		this.name = name;
		this.color = "rgb(200,50,50,0.3)";
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.radius = r;
		this.life = 100.0;		
        this.SafeDistance = this.radius*0.5;
	}

	step(dt) {

	}

	draw() {

		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.ellipse(this.x, this.y+30, this.radius, this.radius*0.2, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();

		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.ellipse(this.x, this.y+26, this.SafeDistance, this.SafeDistance*0.2, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();

        ctx.font = "bold 34px Verdana";
        ctx.textAlign = "left";
        ctx.fillStyle = "#000000";
		let size = ctx.measureText(this.name);
        ctx.fillText(this.name, this.x - size.width/2, this.y+80);
        ctx.restore();
	}


	

	

    inSafeDistance(otherDot) {
		var dist = this.distance(otherDot);
		var minDist = this.SafeDistance + otherDot.radius;
	if (dist < minDist) {
		return true;
	}
	return false;
	}


    distance(position) {
		var dx = position.x - this.x,
			dy = position.y - this.y,
			dist = Math.sqrt(dx * dx + dy * dy);
		return dist;
	}	
}