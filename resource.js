class Resource extends Place {
	constructor(name, building, x, y) {
		super(name, x, y);

		this.building = building;

		this.visible = false;

	}



	draw(ctx) {


		ctx.save();
		ctx.translate(this.x, this.y);



		ctx.font = "bold " + this.emojiSize + "px Verdana";
		ctx.textAlign = "left";
		let size = ctx.measureText(this.building);
		ctx.beginPath();
		ctx.fillText(this.building, 0 - size.width / 2, 0 - 40);

		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;


		if (this.visible) {
			ctx.font = "bold 40px Verdana";
			ctx.textAlign = "left";
			ctx.fillStyle = "#000000";
			let size = ctx.measureText(this.name);
			ctx.beginPath();
			ctx.fillText(this.name, 0 - size.width / 2, 0 + 80);

		}


		ctx.restore();

		super.draw(ctx);

	}

}