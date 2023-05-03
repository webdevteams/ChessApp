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
			console.log("TODO: Sign in then redirect to black login page");
			rhit.whiteAuthManager.signIn();
			
		};
	}
}

rhit.blackLoginPageController = class {
	constructor() {
		document.querySelector("#loginButton").onclick = (event) => {
			console.log("TODO: Sign in then redirect to gameboard page");

		};
	}
}

rhit.WhiteAuthManager = class {
	constructor() {
		//Need to save two users
		this._whiteUser = null;
	}
	//Need a function for every user
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((whiteUser) => {
			this._whiteUser = whiteUser;
			changeListener();
		});
	}
	//TODO: change it so there's a sign in for White and a sign in for black
	signIn() {
		console.log("Sign in using rosefire");
		Rosefire.signIn("6516ed7b-7a30-4c92-9c6b-f4b7179ab9b9", (err, rfUser) => {
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
	//change it so if both users are signed in, it signs both users out at once.
	signOut() {
		firebase.auth().signOut().catch(function (error) {
			console.log("Sign out error");
		});
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
	//Need a function for every user
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((blackUser) => {
			this._blackUser = blackUser;
			changeListener();
		});
	}
	//TODO: change it so there's a sign in for White and a sign in for black
	signIn() {
		console.log("Sign in using rosefire");
		Rosefire.signIn("6516ed7b-7a30-4c92-9c6b-f4b7179ab9b9", (err, rfUser) => {
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
	//change it so if both users are signed in, it signs both users out at once.
	signOut() {
		firebase.auth().signOut().catch(function (error) {
			console.log("Sign out error");
		});
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



/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	var isWhiteSignedIn;
	var isBlackSignedIn;
	rhit.whiteAuthManager = new rhit.WhiteAuthManager();
	rhit.whiteAuthManager.beginListening(() => {
		isWhiteSignedIn = rhit.whiteAuthManager.isWhiteSignedIn;
	});

	rhit.blackAuthManager = new rhit.BlackAuthManager();
	rhit.blackAuthManager.beginListening(() => {
		isBlackSignedIn = rhit.blackAuthManager.isBlackSignedIn;
	});


	console.log(`Is signed in: ${isWhiteSignedIn && isBlackSignedIn}`);


	if (document.querySelector("#indexPage")) {
		new rhit.indexPageController();
	}
	if (document.querySelector("#whiteLoginPage")) {
		new rhit.whiteLoginPageController();
	}
	if (document.querySelector("#blackLoginPage")) {
		new rhit.blackLoginPageController();
	}
	// if(document.querySelector("#gameBoardPage")){
	// 	new rhit.indexPageController();
	// }
	// if(document.querySelector("#leaderboardPage")){
	// 	new rhit.indexPageController();
	// }

};

rhit.main();