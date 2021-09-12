
class Place {
	constructor(name, x, y, size = 200) {

		this.name = name;
		this.colorNormal = "rgb(90,100,90,0.4)";
		this.colorActive = "rgb(90,100,90,0.7)";
		this.color = this.colorNormal

		this.visible = true;

		this.x = x;
		this.y = y;
		this.radius = 30;
        this.width = 2*this.radius;
        this.height = 2*this.radius;

		this.type = (y == groundPoint ? Place.TYPE.GROUND : Place.TYPE.SPACE);
		this.emojiSize = size;
	}

	step(dt) {
	}

	draw() {

		ctx.save();
		ctx.translate(this.x, this.y);


		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;

        let r = this.radius*4;

        ctx.beginPath();
        ctx.ellipse(0, 0+32, r, r * 0.2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0+34 + 1, r / 2, r / 2 * 0.2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();


        // ctx.strokeStyle = "red";

		// ctx.beginPath(),
        // ctx.arc(0,0,this.radius,0,Math.PI*2);
        // ctx.stroke();
        // ctx.closePath();

        // ctx.rect(-this.width/2, -this.height/2, this.width, this.height);
        // ctx.stroke();

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

Place.TYPE = { GROUND: "GROUND", SPACE: "SPACE" };