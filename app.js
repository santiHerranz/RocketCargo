
var canvas = document.createElement("canvas");
canvas.id = 'canvas';
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;// - 15
canvas.height = window.innerHeight; // - 15
document.body.appendChild(canvas);
cWidth = canvas.width;
cHeight = canvas.height;


// gravity and stuff
var gravity = 0.98;
var dt = 20 / 100;

var groundPoint = cHeight - (cHeight / 10);


var game = new Game(cWidth / 2, groundPoint - 600);


function randNum(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


// mouse event variables
var mousePosition = {
	x: 0,
	y: 0
};
var mouseLeftPressed = false;
var mouseRightPressed = false;

canvas.addEventListener('mousemove', function (event) {

	mousePosition.x = (event.offsetX || event.layerX);
	mousePosition.y = (event.offsetY || event.layerY);
});

canvas.addEventListener('mousedown', function (event) {
	mouseLeftPressed = true;
});

canvas.addEventListener('mouseup', function (event) {
	mouseLeftPressed = false;
	mouseRightPressed = false;
});


canvas.addEventListener('contextmenu', function (event) {
	event.preventDefault();
	event.stopPropagation();
	return false;
});

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

var update = function (dt) {

	if (input.up) {
		game.thrusRocket();
	}

	if (input.quit == input.state.ACTIVE) {
		game.destroyRocket();
		input.quit = input.state.INACTIVE;
	}

	if (input.new == input.state.ACTIVE) {
		game.newRocket();
		input.new = input.state.INACTIVE;
	}
	if (input.help) {
		game.showHelp();
	}
	if (input.left) {
		game.moveRocket(-1);
	}
	if (input.right) {
		game.moveRocket(+1);
	}

	if (input.refuel) {
		game.refuelRocket();
	}

	game.step(dt);

}

var main = function () {
	update(dt);
	game.draw(ctx);
	requestAnimationFrame(main);
}


var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;




function onkeydown(evt) {
	var code = evt.keyCode;

	//console.log(code);

	if (code == KEY.D || code == KEY.RIGHT) input.right = true;
	if (code == KEY.W || code == KEY.UP) input.up = true;
	if (code == KEY.A || code == KEY.LEFT) input.left = true;
	if (code == KEY.S || code == KEY.DOWN) input.down = true;

	if (code == KEY.ESPACE) input.espace = true;
	if (code == KEY.ENTER) input.enter = true;
	if (code == KEY.H) input.help = true;
	if (code == KEY.F1) input.help = true;
	if (code == KEY.F) input.refuel = true;

	// Once
	if (code == KEY.N && input.new == input.state.RELEASED) input.new = input.state.ACTIVE;
	if (code == KEY.M && input.model == input.state.RELEASED) input.model = input.state.ACTIVE;
	if (code == KEY.Q && input.quit == input.state.RELEASED) input.quit = input.state.ACTIVE;

}


function onkeyup(evt) {
	var code = evt.keyCode;

	//console.log(code);

	if (code == KEY.D || code == KEY.RIGHT) input.right = false;
	if (code == KEY.W || code == KEY.UP) input.up = false;
	if (code == KEY.A || code == KEY.LEFT) input.left = false;
	if (code == KEY.S || code == KEY.DOWN) input.down = false;


	if (code == KEY.ESPACE) { input.espace = false; }
	if (code == KEY.ENTER) input.enter = false;
	if (code == KEY.H) input.help = false;
	if (code == KEY.F1) input.help = false;
		if (code == KEY.F) input.refuel = false;

	if (code == KEY.N) input.new = input.state.RELEASED;
	if (code == KEY.M) input.model = input.state.RELEASED;
	if (code == KEY.Q) input.quit = input.state.RELEASED;

}



addEventListener('keydown', onkeydown);
addEventListener('keyup', onkeyup);




  CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
	if (width < 2 * radius) radius = width / 2;
	if (height < 2 * radius) radius = height / 2;
	this.beginPath();
	this.moveTo(x + radius, y);
	this.arcTo(x + width, y, x + width, y + height, radius);
	this.arcTo(x + width, y + height, x, y + height, radius);
	this.arcTo(x, y + height, x, y, radius);
	this.arcTo(x, y, x + width, y, radius);
	this.closePath();
	return this;
  }


  main();














