
class Base extends Place {

	constructor(name, x, y, size = 200) {
		super(name, x, y, size);

	}

	draw(ctx) {


		super.draw(ctx);
		
		ctx.save();
		ctx.translate(this.x, this.y);

		ctx.font = "bold " + this.emojiSize + "px Verdana";
		ctx.textAlign = "left";
		ctx.fillStyle = "#000000";
		let size = ctx.measureText(this.name);
		ctx.beginPath();
		ctx.fillText(this.name, 0 - size.width / 2, 0 - 20);
		
		ctx.restore();

	}



}

