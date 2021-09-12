class Resource extends Base {
	constructor(name, building, x, y) {
        super(name, x, y);

		this.building = building;

		//this.visible = false;
		this.emojiSize = 30;
	}


	
	draw() {

		ctx.save();
		ctx.translate(this.x, this.y);



			ctx.font = "bold 200px Verdana";
			ctx.textAlign = "left";
			ctx.fillStyle = "#000000";
			let size = ctx.measureText(this.building);
			ctx.beginPath();
			ctx.fillText(this.building, 0 - size.width / 2, 0 - 40);			

			ctx.strokeStyle = this.color;
			ctx.fillStyle = this.color;
	
			ctx.beginPath();
			ctx.ellipse(0, 0 + 30, this.radius, this.radius * 0.2, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.ellipse(0, 0 + 26, this.radius / 2, this.radius / 2 * 0.2, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();


		if (this.visible) {
			ctx.font = "bold 50px Verdana";
			ctx.textAlign = "left";
			ctx.fillStyle = "#000000";
			let size = ctx.measureText(this.name);
			ctx.beginPath();
			ctx.fillText(this.name, 0 - size.width / 2, 0 + 80);
	
		}


		ctx.restore();
	}

}