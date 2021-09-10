var KEY = {
	D: 68,
	W: 87,
	A: 65,
	S: 83,
	F: 70,
	N: 78,
	M: 77,
	RIGHT: 39,
	UP: 38,
	LEFT: 37,
	DOWN: 40,
	Q: 81,
	ESPACE: 32,
	ENTER: 13
};

var inputState = {RELEASED:0,ACTIVE:1,INACTIVE:2}

var input = {
	right: false,
	up: false,
	left: false,
	down: false,
	espace: false,
	enter: false,
	shoot: false,
	refuel: false,
	new: false,
	model: inputState.RELEASED,
	quit: inputState.RELEASED,

	state: inputState
};

