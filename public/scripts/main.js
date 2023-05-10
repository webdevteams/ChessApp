var rhit = rhit || {};

/** globals */
rhit.variableName = "";

rhit.whiteAuthManager = null;
rhit.blackAuthManager = null;

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}
/*
rhit.loginPageController = class {
	constructor() {
		document.querySelector("#loginButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}
*/

rhit.indexPageController = class {
	constructor() {

		document.querySelector("#loginButton").onclick = (event) => {
			window.location.href = "/whiteLogin.html";
		};

	}
}

rhit.whiteLoginPageController = class {
	constructor() {
		document.querySelector("#whiteLoginButton").onclick = (event) => {
			rhit.whiteAuthManager.signIn();
		};
	}
}

rhit.blackLoginPageController = class {
	constructor() {
		document.querySelector("#blackLoginButton").onclick = (event) => {
			rhit.blackAuthManager.signIn();
		};
	}
}

rhit.gameBoardPageController = class {
	constructor() {
		this.game = new rhit.Game();
		this.game.initializeGame();

		document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.whiteAuthManager.signOut();
			rhit.blackAuthManager.signOut();
		};

		
		this.pieceListeners();
		this.updateView();
	}

	pieceListeners(){
		const spaces = document.querySelectorAll("td img");
		for (const space of spaces) {
			space.onclick = (event) => {
				const i = parseInt(space.id.substring(0, 1));
				const j = parseInt(space.id.substring(1));

				let locations = new Array(1);
				const piece = this.game.getPieceAtLocation(i, j);

				locations = this.game.getMoves(piece, i, j, locations);
				console.log(locations);
				
				for (let x = 0; x < locations.length; x++) {
					document.getElementById(locations[x]).onclick = (event) => {
						console.log("clicked");
						this.game.board[i][j] = rhit.Game.Piece.NONE;
						const newi = parseInt(locations[x].substring(0, 1));
						const newj = parseInt(locations[x].substring(1));
						this.game.board[newi][newj] = piece;
						this.updateView();
						this.pieceListeners();
					}
				}
			}
		}
	}

	updateView() {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				let spaceID = i.toString() + j.toString();
				switch (this.game.board[i][j]) {
					case rhit.Game.Piece.NONE:
						document.getElementById(`${spaceID}`).src = "images/transparent.png";
						break;
					case rhit.Game.Piece.WHITE_ROOK:
						document.getElementById(`${spaceID}`).src = "images/RookWhite.png";
						break;
					case rhit.Game.Piece.BLACK_ROOK:
						document.getElementById(`${spaceID}`).src = "images/RookBlack.png";
						break;
					case rhit.Game.Piece.WHITE_KNIGHT:
						document.getElementById(`${spaceID}`).src = "images/KnightWhite.png";
						break;
					case rhit.Game.Piece.BLACK_KNIGHT:
						document.getElementById(`${spaceID}`).src = "images/KnightBlack.png";
						break;
					case rhit.Game.Piece.WHITE_BISHOP:
						document.getElementById(`${spaceID}`).src = "images/BishopWhite.png";
						break;
					case rhit.Game.Piece.BLACK_BISHOP:
						document.getElementById(`${spaceID}`).src = "images/BishopBlack.png";
						break;
					case rhit.Game.Piece.WHITE_QUEEN:
						document.getElementById(`${spaceID}`).src = "images/QueenWhite.png";
						break;
					case rhit.Game.Piece.BLACK_QUEEN:
						document.getElementById(`${spaceID}`).src = "images/QueenBlack.png";
						break;
					case rhit.Game.Piece.WHITE_KING:
						document.getElementById(`${spaceID}`).src = "images/KingWhite.png";
						break;
					case rhit.Game.Piece.BLACK_KING:
						document.getElementById(`${spaceID}`).src = "images/KingBlack.png";
						break;
					case rhit.Game.Piece.WHITE_PAWN:
						document.getElementById(`${spaceID}`).src = "images/PawnWhite.png";
						break;
					case rhit.Game.Piece.BLACK_PAWN:
						document.getElementById(`${spaceID}`).src = "images/PawnBlack.png";
						break;
				}
			}
		}
	}
}

rhit.leaderboardPageController = class {
	constructor() {
		document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.whiteAuthManager.signOut();
			rhit.blackAuthManager.signOut();
		};
	}
}

rhit.WhiteAuthManager = class {
	constructor() {
		this._whiteUser = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((whiteUser) => {
			this._whiteUser = whiteUser;
			console.log("this.whiteuser" + this._whiteUser)
			changeListener();
		});
	}

	signIn() {
		console.log("Sign in using rosefire");
		Rosefire.signIn("41b7b93b-3c9d-4f2c-83cb-e57e90cba145", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you have provided is not valid.');
				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}
			});
		});
	}

	signOut() {
		firebase.auth().signOut().catch(function (error) {
			console.log("Sign out error");
		});
		console.log("white signed out = " + !this.isWhiteSignedIn);
	}

	get isWhiteSignedIn() {
		return !!this._whiteUser;
	}

	get uidWhite() {
		return this._whiteUser.uid;
	}

}

rhit.BlackAuthManager = class {
	constructor() {
		this._blackUser = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((blackUser) => {
			this._blackUser = blackUser;
			changeListener();
		});
	}

	signIn() {
		console.log("Sign in using rosefire");
		Rosefire.signIn("41b7b93b-3c9d-4f2c-83cb-e57e90cba145", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you have provided is not valid.');
				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}
			});
		});
	}

	signOut() {
		firebase.auth().signOut().catch(function (error) {
			console.log("Sign out error");
		});
		console.log("black signed out = " + !this.isBlackSignedIn);
	}

	get isBlackSignedIn() {
		return !!this._blackUser;
	}

	get uidBlack() {
		return this._blackUser.uid;
	}
}

rhit.Game = class {

	static Piece = {
		WHITE_PAWN: "White pawn",
		WHITE_ROOK: "White rook",
		WHITE_KNIGHT: "White knight",
		WHITE_BISHOP: "White bishop",
		WHITE_QUEEN: "White queen",
		WHITE_KING: "White king",
		BLACK_PAWN: "Black pawn",
		BLACK_ROOK: "Black rook",
		BLACK_KNIGHT: "Black knight",
		BLACK_BISHOP: "Black bishop",
		BLACK_QUEEN: "Black queen",
		BLACK_KING: "Black king",
		NONE: ""
	}

	static State = {
		WHITE_TURN: "White's turn",
		BLACK_TURN: "Black's turn",
		WHITE_WIN: "White wins",
		BLACK_WIN: "Black wins",
		TIE: "Tie"
	}

	constructor() {
		this.state = rhit.Game.State.BLACK_TURN;
		this.board = new Array(8);
		for (let i = 0; i < 8; i++) {
			this.board[i] = new Array(8);
			for (let j = 0; j < 8; j++) {
				this.board[i][j] = rhit.Game.Piece.NONE;
			}
		}
	}

	initializeGame() {
		this.board[0][7] = rhit.Game.Piece.BLACK_ROOK;
		this.board[1][7] = rhit.Game.Piece.BLACK_KNIGHT;
		this.board[2][7] = rhit.Game.Piece.BLACK_BISHOP;
		this.board[3][7] = rhit.Game.Piece.BLACK_QUEEN;
		this.board[4][7] = rhit.Game.Piece.BLACK_KING;
		this.board[5][7] = rhit.Game.Piece.BLACK_BISHOP;
		this.board[6][7] = rhit.Game.Piece.BLACK_KNIGHT;
		this.board[7][7] = rhit.Game.Piece.BLACK_ROOK;
		for (let i = 0; i < 8; i++) {
			this.board[i][6] = rhit.Game.Piece.BLACK_PAWN;
		}

		this.board[0][0] = rhit.Game.Piece.WHITE_ROOK;
		this.board[1][0] = rhit.Game.Piece.WHITE_KNIGHT;
		this.board[2][0] = rhit.Game.Piece.WHITE_BISHOP;
		this.board[3][0] = rhit.Game.Piece.WHITE_QUEEN;
		this.board[4][0] = rhit.Game.Piece.WHITE_KING;
		this.board[5][0] = rhit.Game.Piece.WHITE_BISHOP;
		this.board[6][0] = rhit.Game.Piece.WHITE_KNIGHT;
		this.board[7][0] = rhit.Game.Piece.WHITE_ROOK;
		for (let j = 0; j < 8; j++) {
			this.board[j][1] = rhit.Game.Piece.WHITE_PAWN;
		}
		console.log(this.board);
	}

	placePieceAtLocation(piece, row, col) {
		if (this.state == rhit.Game.State.BLACK_WIN ||
			this.state == rhit.Game.State.WHITE_WIN ||
			this.state == rhit.Game.State.TIE) {
			return;
		}

		if (this.board[row][col] == rhit.Game.Piece.NONE) {
			this.board[row][col] = piece;
			return;
		}

		if (this.state == rhit.Game.State.BLACK_TURN) {
			if (this.board[row][col].includes("Black")) {
				return;
			} else { //Insert capture function later
				this.board[row][col] = piece;
				return;
			}
		}

		if (this.state == rhit.Game.State.WHITE_TURN) {
			if (this.board[row][col].includes("White")) {
				return;
			} else { //Insert capture function later
				this.board[row][col] = piece;
				return;
			}
		}
	}

	getMoves(piece, i, j, locations) {


		if (piece == rhit.Game.Piece.BLACK_PAWN) {
			locations = this.getBlackPawnMoves(i, j, locations);
			return locations;
		}
		if (piece == rhit.Game.Piece.WHITE_PAWN) {
			locations = this.getWhitePawnMoves(i, j, locations);
			return locations;
		}
		if (piece.includes("king")) {
			locations = this.getKingMoves(i, j, locations);
		}
		if (piece.includes("queen")) {
			locations = this.getQueenMoves(i, j, locations);
		}
		if (piece.includes("bishop")) {
			locations = this.getBishopMoves(i, j, locations);
		}
		if (piece.includes("knight")) {
			locations = this.getKnightMoves(i, j, locations);
		}
		if (piece.includes("rook")) {
			locations = this.getRookMoves(i, j, locations);
		}
	}

	getBlackPawnMoves(i, j, locations) {
		let loci = 0;

		let possiblei = i - 1; let possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i + 1; possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i; possiblej = j - 1;
		if (possiblei >= 0 && possiblei <= 7 && possiblej >= 0 && possiblej <= 7
			&& this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		return locations;
	}

	getWhitePawnMoves(i, j, locations) {
		let loci = 0;

		let possiblei = i - 1; let possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i + 1; possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i; possiblej = j + 1;
		if (possiblei >= 0 && possiblei <= 7 && possiblej >= 0 && possiblej <= 7
			&& this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		return locations;
	}

	getKingMoves(i, j, locations) {

	}

	getQueenMoves(i, j, locations) {

	}

	getBishopMoves(i, j, locations) {

	}

	getKnightMoves(i, j, locations) {

	}

	getRookMoves(i, j, locations) {

	}

	checkValid(i, j) {
		if (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
			return true;
		}
	}

	getPieceAtLocation(row, col) {
		return this.board[row][col];
	}

	getState() {
		return this.state;
	}
}

// rhit.checkForRedirects = function() {
// 	/* Model to follow from MovieQuotesAuth:
// 	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
// 		window.location.href = "/";
// 	}
// 	*/
// 	//If no one is logged in -> index

// 	//TODO: Find out where the query selectors should find the pages using IDs

// 	if (!document.querySelector("_________") && !rhit.fbAuthManager.isWhiteSignedIn) {
// 		window.location.href = "/";
// 	}

// 	//If white is signed in but black isn't -> black login page
// 	if (!document.querySelector("_________") && rhit.fbAuthManager.isWhiteSignedIn && !rhit.fbAuthManager.isBlackSignedIn) {
// 		window.location.href = "whiteLogin.html";
// 	}

// 	//If both sign in -> game page, and allow any page but the logins and index
// 	if (!document.querySelector("_________") && rhit.fbAuthManager.isWhiteSignedIn && rhit.fbAuthManager.isBlackSignedIn) {
// 		window.location.href = "gameBoard.html";
// 	}

// 	//TODO: Add redirects for the other pages, any besides the logins and index should be allowed if both users are signed in.

// }
rhit.initializePage = function () {

	if (document.querySelector("#indexPage")) {
		new rhit.indexPageController();
	}
	if (document.querySelector("#whiteLoginPage")) {



		rhit.whiteAuthManager.signOut();
		rhit.whiteAuthManager.beginListening(() => {
			isWhiteSignedIn = rhit.whiteAuthManager.isWhiteSignedIn;
			if (isWhiteSignedIn) {
				console.log("user " + rhit.whiteAuthManager.uidWhite);
				localStorage.clear();
				localStorage.setItem("whiteUserName", rhit.whiteAuthManager.uidWhite)
				window.location.href = "/blackLogin.html";
			}
		});

		new rhit.whiteLoginPageController();


	}

	if (document.querySelector("#blackLoginPage")) {


		rhit.blackAuthManager.signOut();
		rhit.blackAuthManager.beginListening(() => {
			isBlackSignedIn = rhit.blackAuthManager.isBlackSignedIn;
			if (isBlackSignedIn) {
				console.log("user " + rhit.blackAuthManager.uidBlack);
				localStorage.setItem("blackUserName", rhit.blackAuthManager.uidBlack);
				window.location.href = "/gameBoard.html"
			}
		});

		new rhit.blackLoginPageController();
	}
	if (document.querySelector("#gameBoardPage")) {
		new rhit.gameBoardPageController();
		console.log(`Signed in as: ${localStorage.getItem("whiteUserName")} and ${localStorage.getItem("blackUserName")}`);
	}

	if (document.querySelector("#leaderboardPage")) {
		new rhit.leaderboardPageController();
	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");


	rhit.whiteAuthManager = new rhit.WhiteAuthManager();
	rhit.blackAuthManager = new rhit.BlackAuthManager();


	rhit.initializePage();


};

rhit.main();