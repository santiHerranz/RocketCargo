
class Base {
	constructor(name, x, y) {

		this.name = name;
		this.colorNormal = "rgb(255,255,255,0.5)";
		this.colorActive = "rgb(255,255,255,0.9)";
		this.color = this.colorNormal

		this.visible = true;
		this.animate = false;

		this.x = x;
		this.y = y;
		this.radius = 80;
		

		this.type = (y == groundPoint ? Base.TYPE.GROUND : Base.TYPE.SPACE);
		this.emojiSize = 200;

	}

	step(dt) {



	}

	draw() {

		ctx.save();
		ctx.translate(this.x, this.y);

		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;

		ctx.beginPath();
		ctx.ellipse(0, -4, this.radius, this.radius * 0.2, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(0, 0, this.radius / 2, this.radius / 2 * 0.2, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();

		// ctx.beginPath();
		// ctx.fillRect(0, 0+26, this.radius*2, this.radius/2);
		// ctx.stroke();

		ctx.font = "bold " + this.emojiSize + "px Verdana";
		ctx.textAlign = "left";
		ctx.fillStyle = "#000000";
		let size = ctx.measureText(this.name);
		ctx.beginPath();
		ctx.fillText(this.name, 0 - size.width / 2, 0 - 50);



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

Base.TYPE = { GROUND: "GROUND", SPACE: "SPACE" };