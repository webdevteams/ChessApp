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
		document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.whiteAuthManager.signOut();
			rhit.blackAuthManager.signOut();
		};
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
				window.location.href = "/gameBoard.html"
			}
		});

		new rhit.blackLoginPageController();
	}
	if(document.querySelector("#gameBoardPage")){
		new rhit.gameBoardPageController();
		console.log(rhit.whiteAuthManager);
		console.log(`Signed in as: ${rhit.whiteAuthManager.uidWhite} and ${rhit.blackAuthManager.uidBlack}`);
	}

	if(document.querySelector("#leaderboardPage")){
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