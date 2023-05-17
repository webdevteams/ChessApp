// leaderboard.js
var rhit = rhit || {};

// Function to convert HTML string to DOM element
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}
  
  // Class representing a player entry
rhit.PlayerEntry = class {
    constructor(name, gamesPlayed, wins) {
        this.name = name;
        this.gamesPlayed = gamesPlayed;
        this.wins = wins;
    }
  }
  
  // Controller for the player entry logic
rhit.PlayerEntryController = class {
    constructor() {
        this.playerList = []; // Array to store player entries
    }
  
    // Method to update the player entry list
    updatePlayerEntry() {
        // Clear the leaderboard container
        const leaderboardContainer = document.getElementById('leaderboardContainer');
        leaderboardContainer.innerHTML = '';
        // Create and append player entry cards
        this.playerList.forEach((player) => {
            const card = this._createCard(player);
            leaderboardContainer.appendChild(card);
        });
    }
  
    // Method to create a player entry card
    _createCard(player) {
        const cardTemplate = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${player.name}</h5>
                <p class="card-text">Games Played: ${player.gamesPlayed}</p>
                <p class="card-text">Wins: ${player.wins}</p>
            </div>
        </div>
        `;
        return htmlToElement(cardTemplate);
    }
  }
  
  // Manager for player entries using Firebase
rhit.FbPlayerEntriesManager = class {
    // Add methods to handle player entry management with Firebase
    // ...

    // Example methods:
    // - addPlayerEntry(playerEntry)
    // - getPlayerEntries()
}
  
// Instantiate the player entry controller
const playerEntryController = new PlayerEntryController();
  
// Initialize the player entries manager
const playerEntriesManager = new FbPlayerEntriesManager();
  
// Fetch player entries from Firebase and update the list
playerEntriesManager.getPlayerEntries().then((entries) => {
    // Convert Firebase entries to PlayerEntry instances
    const playerList = entries.map((entry) => {
        return new PlayerEntry(entry.name, entry.gamesPlayed, entry.wins);
    });
    playerEntryController.playerList = playerList;
    playerEntryController.updatePlayerEntry();
});
  