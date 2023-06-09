var rhit = rhit || {};

rhit.whiteAuthManager = null;
rhit.blackAuthManager = null;

// From https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

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

rhit.deleteAccountController = class {
	constructor() {
		document.querySelector("#l1").innerHTML = `<input id="c1" type="checkbox">
		<span class="checkmark"></span>Delete Data: ${localStorage.getItem("blackUserName")}`;
		document.querySelector("#l2").innerHTML = `<input id="c2" type="checkbox">
		<span class="checkmark"></span>Delete Data: ${localStorage.getItem("whiteUserName")}`;

		document.getElementById("cancelDelete").onclick = (event) => {
			window.location.href = "/gameBoard.html";
		}

		document.getElementById("confirmDelete").onclick = async (event) => {
			this._ref = firebase.firestore().collection("Users");
			if (document.getElementById("c1").checked) {
				await this._ref.where("user", "==", `${localStorage.getItem("blackUserName")}`).get()
					.then((querySnapshot) => {
						this._ref.doc(querySnapshot.docs[0].id).delete().then(() => {
							console.log("Document successfully deleted!");
						}).catch((error) => {
							console.error("Error removing document: ", error);
						});
					});
			}
			if (document.getElementById("c2").checked) {
				await this._ref.where("user", "==", `${localStorage.getItem("whiteUserName")}`).get()
					.then((querySnapshot) => {
						this._ref.doc(querySnapshot.docs[0].id).delete().then(() => {
							console.log("Document successfully deleted!");
						}).catch((error) => {
							console.error("Error removing document: ", error);
						});
					});
			}

			rhit.whiteAuthManager.signOut();
			rhit.blackAuthManager.signOut();
			setTimeout(() => {window.location.href = "/index.html"}, "1000");
		}
	};
}

rhit.GameBoardPageController = class {
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

	pieceListeners() {
		const spaces = document.querySelectorAll("td img");
		for (const space of spaces) {
			const i = parseInt(space.id.substring(0, 1));
			const j = parseInt(space.id.substring(1));
			const piece = this.game.getPieceAtLocation(i, j);
			const state = this.game.getState();

			if ((piece != rhit.Game.Piece.NONE) && ((state == rhit.Game.State.WHITE_TURN && piece.includes("White")) || (state == rhit.Game.State.BLACK_TURN && piece.includes("Black")))) {

				space.onclick = (event) => {
					let locations = new Array(1);
					this.updateView();
					for (let cx = 0; cx < 8; cx++) {
						for (let cy = 0; cy < 8; cy++) {
							if (this.game.board[cx][cy] == rhit.Game.Piece.MOVABLE) {
								this.game.board[cx][cy] = rhit.Game.Piece.NONE;
							}
						}
					}
					this.updateView();
					this.pieceListeners();
					locations = this.game.getMoves(piece, i, j, locations);
					// console.log(locations);
					if (locations.length == 1 && locations[0] == undefined) {
						console.log("cannot move piece");
					} else {

						for (let x = 0; x < locations.length; x++) {
							const newi = parseInt(locations[x].substring(0, 1));
							const newj = parseInt(locations[x].substring(1));

							if (this.game.board[newi][newj] == rhit.Game.Piece.NONE) {
								this.game.board[newi][newj] = rhit.Game.Piece.MOVABLE;
								document.getElementById("" + newi + newj).src = "images/MoveableSpace.svg";
								document.getElementById("" + newi + newj).style = "display: block; margin-left: auto; margin-right: auto;; height: 40px; width:40px;"
							}


							if (this.game.board[newi][newj] != rhit.Game.Piece.NONE && this.game.board[newi][newj] != rhit.Game.Piece.MOVABLE) {
								document.getElementById("" + newi + newj).style = "border: 3px solid #ff0000;"
							}


							document.getElementById(locations[x]).onclick = (event) => {
								// console.log("clicked");
								this.game.board[i][j] = rhit.Game.Piece.NONE;
								this.game.board[newi][newj] = piece;
								for (let y = 0; y < locations.length; y++) {
									const noni = parseInt(locations[y].substring(0, 1));
									const nonj = parseInt(locations[y].substring(1));
									if (y != x && this.game.board[noni][nonj] == rhit.Game.Piece.MOVABLE) {
										this.game.board[noni][nonj] = rhit.Game.Piece.NONE;
									}
								}
								this.updateView();

								//win checking
								let wincount = 0;
								let opposite;
								if (this.game.getState() == rhit.Game.State.BLACK_TURN) {
									opposite = "White";
								} else if (this.game.getState() == rhit.Game.State.WHITE_TURN) {
									opposite = "Black";
								}
								for (let winx = 0; winx < 8; winx++) {
									for (let winy = 0; winy < 8; winy++) {
										if (this.game.board[winx][winy].includes(opposite)) {
											wincount++;
										}
									}
								}
								if (wincount == 0 && this.game.getState() == rhit.Game.State.BLACK_TURN) {
									this.game.state = rhit.Game.State.BLACK_WIN;
									document.getElementById("winTitle").innerHTML = "Black Wins!";
									document.getElementById("winText").innerHTML = "Congratulations. Would you like to submit your results?";
									$('#winModal').modal({
										backdrop: 'static',
										keyboard: false
									});
									document.getElementById("submitButton").onclick = (event) => {
										rhit.leaderboardPageController.updateOnGameOver();
										$('#winModal').modal('hide');
									}
								} else if (wincount == 0 && this.game.getState() == rhit.Game.State.WHITE_TURN) {
									this.game.state = rhit.Game.State.WHITE_WIN;
									document.getElementById("winTitle").innerHTML = "White Wins!";
									document.getElementById("winText").innerHTML = "Congratulations. Would you like to submit your results?";
									$('#winModal').modal({
										backdrop: 'static',
										keyboard: false
									});
									document.getElementById("submitButton").onclick = (event) => {
										rhit.leaderboardPageController.updateOnGameOver();
										$('#winModal').modal('hide');
									}
								}


								//turn switching
								if (this.game.getState() == rhit.Game.State.BLACK_TURN) {
									this.game.state = rhit.Game.State.WHITE_TURN;
								} else if (this.game.getState() == rhit.Game.State.WHITE_TURN) {
									this.game.state = rhit.Game.State.BLACK_TURN;
								}

								console.log(this.game.state);

								this.pieceListeners();
							}
						}
					}
				}
			} else {
				space.onclick = (event) => {

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
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.MOVABLE:
						document.getElementById(`${spaceID}`).src = "images/MoveableSpace.svg";
						document.getElementById(`${spaceID}`).style = "display: block; margin-left: auto; margin-right: auto;; height: 40px; width:40px;"
						break;
					case rhit.Game.Piece.WHITE_ROOK:
						document.getElementById(`${spaceID}`).src = "images/RookWhite.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.BLACK_ROOK:
						document.getElementById(`${spaceID}`).src = "images/RookBlack.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.WHITE_KNIGHT:
						document.getElementById(`${spaceID}`).src = "images/KnightWhite.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.BLACK_KNIGHT:
						document.getElementById(`${spaceID}`).src = "images/KnightBlack.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.WHITE_BISHOP:
						document.getElementById(`${spaceID}`).src = "images/BishopWhite.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.BLACK_BISHOP:
						document.getElementById(`${spaceID}`).src = "images/BishopBlack.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.WHITE_QUEEN:
						document.getElementById(`${spaceID}`).src = "images/QueenWhite.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.BLACK_QUEEN:
						document.getElementById(`${spaceID}`).src = "images/QueenBlack.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.WHITE_KING:
						document.getElementById(`${spaceID}`).src = "images/KingWhite.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.BLACK_KING:
						document.getElementById(`${spaceID}`).src = "images/KingBlack.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.WHITE_PAWN:
						document.getElementById(`${spaceID}`).src = "images/PawnWhite.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
					case rhit.Game.Piece.BLACK_PAWN:
						document.getElementById(`${spaceID}`).src = "images/PawnBlack.png";
						document.getElementById(`${spaceID}`).style = "";
						break;
				}
			}
		}
	}
}

rhit.LeaderboardPageController = class {
	constructor() {

		this.blackUsername = `${localStorage.getItem("blackUserName")}`;
		this.whiteUsername = `${localStorage.getItem("whiteUserName")}`;

		document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.whiteAuthManager.signOut();
			rhit.blackAuthManager.signOut();
		};

		this._ref = firebase.firestore().collection("Users");
		this.blackDocId = null;
		this.whiteDocId = null;

		this.players = []; // Array to store player information
	}

	//load data of top 5 users
	loadPlayerData() {
		return firebase.firestore().collection("Users").orderBy("wins", "desc").limit(5).get().then(querySnapshot => {
			querySnapshot.forEach(doc => {
				this.players.push(doc.data());
			})
		});
	}

	//add new player to database if doesn't exist already
	savePlayerData(playerName) {
		return this._ref.add({
				["games"]: 1,
				["lastUpdated"]: firebase.firestore.Timestamp.now(),
				["user"]: playerName,
				["wins"]: 0
			})
			.then(function (docRef) {
				if (playerName == rhit.leaderboardPageController.blackUsername) {
					rhit.leaderboardPageController.blackDocId = docRef.id;
				} else {
					rhit.leaderboardPageController.whiteDocId = docRef.id;
				}
			});
	}

	//self explanatory
	updateOnGameOver() {
		this._ref.where("user", "==", this.blackUsername).get()
			.then(async (querySnapshot) => {
				if (querySnapshot.empty) {
					await this.savePlayerData(rhit.leaderboardPageController.blackUsername);
				} else {
					rhit.leaderboardPageController.blackDocId = querySnapshot.docs[0].id;
					await this._ref.doc(rhit.leaderboardPageController.blackDocId).get().then(doc => {
						let games = doc.data().games + 1;
						this._ref.doc(rhit.leaderboardPageController.blackDocId).update({
							["lastUpdated"]: firebase.firestore.Timestamp.now(),
							["games"]: games
						});
					});
				}
			})
			.then(response => {
				this._ref.where("user", "==", this.whiteUsername).get()
					.then(async (querySnapshot) => {
						if (querySnapshot.empty) {
							await this.savePlayerData(rhit.leaderboardPageController.whiteUsername);
						} else {
							rhit.leaderboardPageController.whiteDocId = querySnapshot.docs[0].id;
							await this._ref.doc(rhit.leaderboardPageController.whiteDocId).get().then(doc => {
								let games = doc.data().games + 1;
								this._ref.doc(rhit.leaderboardPageController.whiteDocId).update({
									["lastUpdated"]: firebase.firestore.Timestamp.now(),
									["games"]: games
								});
							});
						}
					}).then(async response => {
						if (rhit.gameBoardPageController.game.state == rhit.Game.State.BLACK_WIN) {
							await this._ref.doc(rhit.leaderboardPageController.blackDocId).get().then(doc => {
								let wins = doc.data().wins + 1;
								this._ref.doc(rhit.leaderboardPageController.blackDocId).update({
									["lastUpdated"]: firebase.firestore.Timestamp.now(),
									["wins"]: wins
								});
							});
						} else {
							await this._ref.doc(rhit.leaderboardPageController.whiteDocId).get().then(doc => {
								let wins = doc.data().wins + 1;
								this._ref.doc(rhit.leaderboardPageController.whiteDocId).update({
									["lastUpdated"]: firebase.firestore.Timestamp.now(),
									["wins"]: wins
								});
							});
						}
					});
			});
	}

	//card elements for leaderboard.html - may need updating
	_createCard(player) {
		const cardTemplate = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${player.user}</h5>
                    <p class="card-text">Games Played: ${player.games}</p>
                    <p class="card-text">Wins: ${player.wins}</p>
                </div>
            </div>
        `;
		return htmlToElement(cardTemplate);
	}

	//given a list of players, populate this list on the HTML page leaderboard.html
	async populateLeaderboard() {
		const leaderboardContainer = document.getElementById("leaderboardContainer");
		while (leaderboardContainer.firstChild) {
			leaderboardContainer.removeChild(leaderboardContainer.firstChild);
		}
		await this.loadPlayerData();
		for (let i = 0; i < this.players.length; i++) {
			const cardElement = this._createCard(this.players[i]);
			leaderboardContainer.appendChild(cardElement);
		}
	}

	deleteBlackData() {
		this._ref.doc(rhit.leaderboardPageController.blackDocId).delete();
	}

	deleteWhiteData() {
		this._ref.doc(rhit.leaderboardPageController.whiteDocId).delete();
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
		NONE: "",
		MOVABLE: "movable"
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
			locations = this.getKingMoves(i, j, piece, locations);
			return locations;
		}
		if (piece.includes("queen")) {
			locations = this.getQueenMoves(i, j, piece, locations);
			return locations;
		}
		if (piece.includes("bishop")) {
			locations = this.getBishopMoves(i, j, piece, locations);
			return locations;
		}
		if (piece.includes("knight")) {
			locations = this.getKnightMoves(i, j, piece, locations);
			return locations;
		}
		if (piece.includes("rook")) {
			locations = this.getRookMoves(i, j, piece, locations);
			return locations;
		}
	}

	getBlackPawnMoves(i, j, locations) {
		let loci = 0;

		let possiblei = i - 1;
		let possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej) && this.board[possiblei][possiblej] == rhit.Game.Piece.NONE) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i + 1;
		possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej) && this.board[possiblei][possiblej] == rhit.Game.Piece.NONE) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i;
		possiblej = j - 1;
		if (possiblei >= 0 && possiblei <= 7 && possiblej >= 0 && possiblej <= 7 &&
			this.board[possiblei][possiblej].includes("White")) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		return locations;
	}

	getWhitePawnMoves(i, j, locations) {
		let loci = 0;

		let possiblei = i - 1;
		let possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej) && this.board[possiblei][possiblej] == rhit.Game.Piece.NONE) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i + 1;
		possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej) && this.board[possiblei][possiblej] == rhit.Game.Piece.NONE) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		possiblei = i;
		possiblej = j + 1;
		if (possiblei >= 0 && possiblei <= 7 && possiblej >= 0 && possiblej <= 7 &&
			this.board[possiblei][possiblej].includes("Black")) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		return locations;
	}
	/*
		Pawns can only move diagonally and attack forwards
		Knights move the same
		Swap movement of king and queen
		Bishops can’t move on sundays
		Rooks can only move a maximum of 5 spaces at once
		The queen, if removed, eliminates all pieces in a 3x3 radius, changes colors of pieces around it?
	*/

	getKingMoves(i, j, piece, locations) {
		let loci = 0;
		//diagonal upperleft i--, j++
		let possiblei = i - 1;
		let possiblej = j + 1;
		for (possiblei = i - 1; possiblei >= 0; possiblei--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej++;
		}
		//diagonal upperright i++, j++
		possiblei = i + 1;
		possiblej = j + 1;
		for (possiblei = i + 1; possiblei < 8; possiblei++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej++;
		}
		//diagonal lowerleft i--, j--
		possiblei = i - 1;
		possiblej = j - 1;
		for (possiblei = i - 1; possiblei >= 0; possiblei--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej--;
		}
		//diagonal lowerright, i++, j--
		possiblei = i + 1;
		possiblej = j - 1;
		for (possiblei = i + 1; possiblei < 8; possiblei++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej--;
		}
		//up j++
		possiblei = i;
		possiblej = j + 1;
		for (possiblej = j + 1; possiblej <= 7; possiblej++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
		}
		//right i++
		possiblei = i + 1;
		possiblej = j;
		for (possiblei = i + 1; possiblei <= 7; possiblei++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
		}
		//down j--
		possiblei = i;
		possiblej = j - 1;
		for (possiblej = j - 1; possiblej >= 0; possiblej--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
		}
		//left i--
		possiblei = i - 1;
		possiblej = j;
		for (possiblei = i - 1; possiblei >= 0; possiblei--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
		}

		return locations;
	}

	getQueenMoves(i, j, piece, locations) {
		let loci = 0;
		//upper left i--, j++
		let possiblei = i - 1;
		let possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		//up j++
		possiblei = i;
		possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		//upper right i++, j++
		possiblei = i + 1;
		possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		//right i++
		possiblei = i + 1;
		possiblej = j;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		//lower right i++, j--
		possiblei = i + 1;
		possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		//down j--
		possiblei = i;
		possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		//lower left i--, j--
		possiblei = i - 1;
		possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		//left i--
		possiblei = i - 1;
		possiblej = j;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}
		return locations;
	}

	getBishopMoves(i, j, piece, locations) {
		let loci = 0;
		//diagonal upperleft i--, j++
		let possiblei = i - 1;
		let possiblej = j + 1;
		for (possiblei = i - 1; possiblei >= 0; possiblei--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej++;
		}
		//diagonal upperright i++, j++
		possiblei = i + 1;
		possiblej = j + 1;
		for (possiblei = i + 1; possiblei < 8; possiblei++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej++;
		}
		//diagonal lowerleft i--, j--
		possiblei = i - 1;
		possiblej = j - 1;
		for (possiblei = i - 1; possiblei >= 0; possiblei--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej--;
		}
		//diagonal lowerright, i++, j--
		possiblei = i + 1;
		possiblej = j - 1;
		for (possiblei = i + 1; possiblei < 8; possiblei++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
			possiblej--;
		}
		return locations;
	}

	getKnightMoves(i, j, piece, locations) {
		let loci = 0;
		//top left i-1 j+2
		let possiblei = i - 1;
		let possiblej = j + 2;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		//top right i+1 j+2
		possiblei = i + 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		//right top i+2 j+1
		possiblei = i + 2;
		possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		//right bottom i+2 j-1
		possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		//bottom right i+1 j-2
		possiblei = i + 1;
		possiblej = j - 2;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		//bottom left i-1 j-2
		possiblei = i - 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		//left bottom i-2 j-1
		possiblei = i - 2;
		possiblej = j - 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		//left top i-2 j+1
		possiblej = j + 1;
		if (this.checkValid(possiblei, possiblej) && this.checkCapture(piece, possiblei, possiblej)) {
			locations[loci] = "" + possiblei + possiblej;
			loci++;
		}

		return locations;
	}

	getRookMoves(i, j, piece, locations) {
		let loci = 0;
		//up j++
		let possiblei = i;
		let possiblej = j + 1;
		for (possiblej = j + 1; possiblej <= j + 5; possiblej++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}

		}
		//right i++
		possiblei = i + 1;
		possiblej = j;
		for (possiblei = i + 1; possiblei <= i + 5; possiblei++) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
		}
		//down j--
		possiblei = i;
		possiblej = j - 1;
		for (possiblej = j - 1; possiblej >= j - 5; possiblej--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
		}
		//left i--
		possiblei = i - 1;
		possiblej = j;
		for (possiblei = i - 1; possiblei >= i - 5; possiblei--) {
			if (this.checkValid(possiblei, possiblej)) {
				if (!this.checkCapture(piece, possiblei, possiblej)) {
					break;
				}
				locations[loci] = "" + possiblei + possiblej;
				loci++;
				if (this.board[possiblei][possiblej] != rhit.Game.Piece.NONE) {
					break;
				}
			}
		}
		return locations;
	}

	checkValid(i, j) {
		if ((i >= 0 && i <= 7 && j >= 0 && j <= 7)) {
			return true;
		}
	}

	checkCapture(piece, i, j) {
		if (this.board[i][j] == rhit.Game.Piece.NONE) {
			return true;
		}
		if (piece.includes("White") && this.board[i][j].includes("Black")) {
			return true;
		}
		if (piece.includes("Black") && this.board[i][j].includes("White")) {
			return true;
		}
		return false;
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
		rhit.gameBoardPageController = new rhit.GameBoardPageController();
		rhit.leaderboardPageController = new rhit.LeaderboardPageController();
		console.log(`Signed in as: ${localStorage.getItem("whiteUserName")} and ${localStorage.getItem("blackUserName")}`);
	}

	if (document.querySelector("#leaderboardPage")) {
		if (!rhit.leaderboardPageController) {
			rhit.leaderboardPageController = new rhit.LeaderboardPageController();
		}
		rhit.leaderboardPageController.populateLeaderboard();
	}

	if (document.querySelector("#deleteAccountPage")) {
		new rhit.deleteAccountController();
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