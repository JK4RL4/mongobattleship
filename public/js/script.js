document.addEventListener('DOMContentLoaded', () => {
    let game = {
        gameTurn: "",
        gameId: "",
        player: [
            {
                "id": "",
                "ships": [],
                "attacks": []
            },
            {
                "id": "",
                "ships": [],
                "attacks": []
            }
        ]
    }

    startGame(game);
    disableAttack();

    document.querySelectorAll(".ship-first-tile").forEach(element => {
        element.addEventListener("input", function() {
            let input = this.value;
            let inputId = this.id;
            let shipLength = parseInt(inputId.substring(4, 5));
            let options = [];

            if (input.length === 2) {
                options = calculateOptions(input, shipLength);
                options = checkOptions(options);
                showOptions(inputId, options);
            }
        })
    })

    document.querySelectorAll(".ship-tile-select").forEach(element => {
        element.addEventListener("change", function () {
            let selectId = this.id;
            let inputId = selectId.substring(0, selectId.indexOf("-select"));
            printShip(inputId, selectId);
        })
    })

    document.querySelector("#start").addEventListener("click", function(e){
        e.preventDefault();
        getSelectedTiles();
        createPlayer(game, this);
    });

    document.querySelector("#attack").addEventListener("click", function(){
        let attackedTile = document.querySelector(".attack-tile").value;
        if (game.player[0].attacks) {
            if (!game.player[0].attacks.includes(attackedTile)) {
                shoot(attackedTile, game);
            } else {
                container = document.querySelector(".container");
                feedbackPanel(container);
                let attackRepeatedPanel = document.querySelector(".feedback-content");
                attackRepeatedPanel.addElement("p", "id= class=end-text", "Ya has atacado esta casilla");
            }
        } else {
            shoot(attackedTile, game);
        }
    });

})

function shoot(attackedTile, game) {
    document.querySelector(".last-shot-tile").innerHTML = attackedTile;
    document.querySelector(".attack-tile").value = "";
    updatePlayerAttack(game, attackedTile);
    nextTurn(game);
}

function disableAttack () {
    let attackButton = document.querySelector("#attack");
    attackButton.classList.add("disabled");
    attackButton.disabled = true;
}

function enableAttack () {
    let attackButton = document.querySelector("#attack");
    attackButton.classList.remove("disabled");
    attackButton.disabled = false;
}

function startGame (game) {
    let container = document.querySelector(".container");
    let startPanel = feedbackPanel(container);
    let startPanelContent = document.querySelector(".feedback-content");
    let startPanelButton = document.querySelector(".feedback-button");
    let newGame = startPanelContent.addElement("button", "id=new-game-button class=start-panel-button", "Crear partida");
    let joinGame = startPanelContent.addElement("button", "id=join-game-button class=start-panel-button", "Unirse a partida");

    startPanelButton.classList.add("hidden");

    newGame.addEventListener("click", function () {
        document.querySelector("#player-name").innerHTML = "Jugador 1";
        document.querySelector("#enemy-name").innerHTML = "Jugador 2";
        game.player[1].id = "player2";
        createNewGame(game, "player1", newGame, joinGame, startPanelContent, startPanel);
    }) 

    joinGame.addEventListener("click", function () {
        document.querySelector("#player-name").innerHTML = "Jugador 2";
        document.querySelector("#enemy-name").innerHTML = "Jugador 1";
        game.player[1].id = "player1";
        updateStartPanel(game, "", "player2", newGame, joinGame, startPanelContent, startPanel);
    })
}

function updateStartPanel(game, gameId, player, newGame, joinGame, startPanelContent, startPanel) {
    newGame.classList.add("hidden");
    joinGame.classList.add("hidden");
    startPanelContent.addElement("p", "id= class=start-panel-text", "Id de la partida:");
    startPanelContent.addElement("input", "id= class=start-panel-input");
    game.gameId = gameId;
    document.querySelector(".start-panel-input").value = game.gameId;

    let play = startPanelContent.addElement("button", "id=join-game-button class=start-panel-button", "Jugar");

    play.addEventListener("click", function () {
        game.gameId = document.querySelector(".start-panel-input").value;
        game.player[0].id = player;
        document.querySelector(".feedback-background").remove();
        startPanel.remove();
        canJoin(game.gameId);
    })
}

function createPlayer (game) {
    game.player[0].ships = getPlayerShips();

    if (game.player[0].ships.length > 0) {
        let data = {
            "player": {
                "id": game.player[0].id,
                "ships": game.player[0].ships,
                "attacks": game.player[0].attacks
            }
        }
        
        let fetchData = {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
        
        fetch("/game/newPlayer/" + game.gameId, fetchData)
        .then(response => response.json())
        .then(function () {
            let startButton = document.querySelector("#start");
            startButton.disabled = "true";
            startButton.classList.add("disabled");
            checkTurn(game);
            if (game.player[0].id === "player2") {
                initiateGameTurns(game);
            }
        })
    }
}

function getPlayerShips() {
    let playerShips = calculateShips ();

    if (checkShips(playerShips)) {
        return playerShips;
    } else {
        let container = document.querySelector(".container");
        feedbackPanel(container);
        let feedbackContent = document.querySelector(".feedback-content");
        feedbackContent.addElement("p", "id= class=", "Los barcos no pueden coincidir en sus casillas.");
        return [];
    }
}

function calculateShips () {
    let playerShips = [];
    let previousElement;
    let calculateExtraTiles = false;

    document.querySelectorAll(".ship-tile").forEach(element => {
        let id = element.id;
        let shipLength = parseInt(id.substring(4, 5));

        playerShips.push(element.value);

        if (calculateExtraTiles) {
            for (let i = 2; i < shipLength; i++) {
                playerShips.push(calculateShipTile(i - 1, [previousElement.value, element.value]));
            }
            calculateExtraTiles = false;
        } else if (shipLength > 2) {
            previousElement = element;
            calculateExtraTiles = true;
        } 
    })

    return playerShips;
}

function checkShips (playerShips) {
    let check = true;

    playerShips.forEach(element => {   
        let i = 0;
        playerShips.forEach(duplicate => {
            if (element === duplicate) {
                i++;
            }
        })
        if (i > 1) {
            check = false;
        }
    })
        
    return check;
}

function calculateShipTile (increment, tileArray) {
    tileArray.sort();
    initialRow = parseInt(tileArray[0].substring(0, 1));
    initialColumn = parseInt(tileArray[0].substring(1));
    endRow = parseInt(tileArray[1].substring(0, 1));
    endColumn = parseInt(tileArray[1].substring(1));

    if (initialRow === endRow) {
        return String(initialRow) + String(initialColumn + increment);
    } else if (initialColumn === endColumn) {
        return String(initialRow + increment) + String(initialColumn);
    }
}

function calculateOptions (input, shipLength) {
    row = parseInt(input.substring(0, 1));
    column = parseInt(input.substring(1));
    let options = [];
    options.push(String(row + shipLength - 1) + String(column));
    options.push(String(row - shipLength + 1) + String(column));
    options.push(String(row) + String(column + shipLength - 1));
    options.push(String(row) + String(column - shipLength + 1));
    return options;
}

function checkOptions(options) {
    let validOptions = [];
    options.forEach(element => {
        if (validPositions.includes(element)) {
            validOptions.push(element);
        }
    })
    return validOptions;
}

function showOptions(inputId, options) {
    selectId = inputId.substring() + "-select";
    let shipSelect = document.querySelector("#" + selectId);
    clearOptions(shipSelect);
    options.forEach(element => {
        let option = document.createElement("option");
        option.text = element;
        shipSelect.add(option);
    })
    printShip(inputId, selectId);
}

function clearOptions (shipSelect) {
    let selectLength = shipSelect.length;
    for (let i = 0; i <= selectLength; i++) {
        shipSelect.remove(0);
    }
}

function getSelectedTiles () {
    document.querySelectorAll(".ship-tile-select").forEach(element => {
        let select = element;
        let selectId = element.id;
        let shipLength = parseInt(selectId.substring(4, 5));
        let inputId = selectId.substring(0, selectId.indexOf("-select") - 1) + shipLength;
        document.querySelector("#" + inputId).value = select.value;
    })
}

function printShip(inputId, selectId) {
    let startTile = document.querySelector("#" + inputId).value;
    let endTile = document.querySelector("#" + selectId).value;
    let startTileRow = parseInt(startTile.substring(0, 1));
    let startTileColumn = parseInt(startTile.substring(1));
    let endTileRow = parseInt(endTile.substring(0, 1));
    let endTileColumn = parseInt(endTile.substring(1));
    let shipId = selectId.substring(0, selectId.indexOf("-"));
    let ship = document.querySelectorAll("." + shipId + "-img");
    ship.forEach(element => element.classList.add("hidden"));

    if (startTileRow === endTileRow) {
        ship = document.querySelector("#" + shipId + "-img");
    } else {
        ship = document.querySelector("#" + shipId + "-img-vertical");
    }

    if (startTileRow <= endTileRow && startTileColumn <= endTileColumn) {
        ship.style.gridRowStart = startTileRow;
        ship.style.gridColumnStart = startTileColumn;
    } else {
        ship.style.gridRowStart = endTileRow;
        ship.style.gridColumnStart = endTileColumn;
    }

    if (startTileRow !== endTileRow) {
        ship.style.gridRowEnd = "span " + String(Math.abs(startTileRow - endTileRow) + 1);
    } else {
        ship.style.gridColumnEnd = "span " + String(Math.abs(startTileColumn - endTileColumn) + 1);
    }

    ship.classList.remove("hidden");
}

function createNewGame(game, player, newGame, joinGame, startPanelContent, startPanel) {
    let fetchData = {
        method: "POST",
    }
    
    fetch("/game/createNewGame", fetchData)
    .then(response => response.json())
    .then(data => updateStartPanel(game, data.newGameId, player, newGame, joinGame, startPanelContent, startPanel))
}

function checkTurn(game) {
    let turn;
    turn = setInterval(function(){ isMyTurn(game, turn); }, 2000);
}

function isMyTurn (game, turn) {
    let fetchData = {
        method: "GET",
    }

    fetch("/game/gameTurn/" + game.gameId + "/" + game.player[0].id, fetchData)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            game.gameTurn = data[0].gameTurn;
            updateGameTurn(game.gameTurn);
            getEnemyAttacks(game);
            enableAttack();
            clearInterval(turn);
            isTheEnd(game.gameId);
        }
    })
}

function initiateGameTurns (game) {
    let fetchData = {
        method: "POST",
    }
    
    fetch("/game/initiateGameTurns/" + game.gameId, fetchData)
    .then(response => response.json())
    .then(data => updateGameTurn(data.gameTurn))
}

function updateGameTurn (gameTurn) {
    switch (gameTurn) {
        case "player1":
            document.querySelector(".game-turn-player").innerHTML = "Jugador 1";
            break;
        case "player2":
            document.querySelector(".game-turn-player").innerHTML = "jugador 2";
            break;
    }
}

function nextTurn (game) {
    let nextTurn;
    let fetchData = {
        method: "PUT",
    }
    
    switch (game.gameTurn) {
        case "player1":
            nextTurn = "player2";
            break;
        case "player2":
            nextTurn = "player1";
            break;
    }

    fetch("/game/nextTurn/" + game.gameId + "/" + game.gameTurn + "/" + nextTurn, fetchData)
    .then(response => response.json())
    .then(data => {  
            game.gameTurn = data.gameTurn;
            disableAttack();
            updateGameTurn(game.gameTurn);
            checkTurn(game);
    })
}

function printAttacks (game, attacker, defender, playerBoard) {
    attacker.attacks.forEach(element => {
        let row = element.substring(0, 1);
        let column = element.substring(1);
        let attackedTile;

        if (defender.ships.includes(element)) {
            attackedTile = playerBoard.addElement("div", "id= class=attack-success");

        } else {
            attackedTile = playerBoard.addElement("div", "id= class=attack-fail");
        }
        attackedTile.style.gridRowStart = row;
        attackedTile.style.gridColumnStart = column;
    })

    if (attacker.id === game.player[0].id) {
        updateShotEffect(game.gameId, attacker, defender);
    }
}

function updateShotEffect (gameId, attacker, defender) {
    let lastAttack = attacker.attacks[attacker.attacks.length - 1];

    if (defender.ships.includes(lastAttack)) {
        if (checkSinked (defender.ships, attacker.attacks, lastAttack)) {
            document.querySelector(".last-shot-effect").innerHTML = "HUNDIDO";
            if (checkWin(attacker, defender)) {
                finishGame(gameId);
            }
        } else {
            document.querySelector(".last-shot-effect").innerHTML = "TOCADO";
        }
    } else {
        document.querySelector(".last-shot-effect").innerHTML = "AGUA";
    }            
}

function checkSinked (ships, attacks, lastAttack) {
    let ship = [];
    let attackIndex = ships.indexOf(lastAttack);
    let i = 0;
    let check = true;

    if (attackIndex < 2) {
        ship = getShip(ships, 0, 2);
    } else if (attackIndex < 5) {
        ship = getShip(ships, 2, 5);
    } else if (attackIndex < 8) {
        ship = getShip(ships, 5, 8);
    } else if (attackIndex < 12) {
        ship = getShip(ships, 8, 12);
    } else {
        ship = getShip(ships, 12, 17);
    }

    do {
        if (!attacks.includes(ship[i])) {
            check = false;
        }
        i++;
    } while (check && i < ship.length)

    return check;
}

function getShip (ships, shipFirstIndex, shipLastIndex) {
    let ship = [];
    for (i = shipFirstIndex; i < shipLastIndex; i++) {
        ship.push(ships[i]);
    }
    return ship;
}

function checkWin(attacker, defender) {
    let i = 0;
    let win = true;

    do {
        if (!attacker.attacks.includes(defender.ships[i])) {
            win = false;
        }
        i++;
    } while (win && i < defender.ships.length)

    return win;
}

function finishGame (gameId) {
    endPanel(gameId, "¡Has ganado!");

    let fetchData = {
        method: "POST",
    }
    
    fetch("/game/end/" + gameId, fetchData);
}

function endPanel(gameId, text){
    let container = document.querySelector(".container");
    let endPanel = feedbackPanel(container);
    let endPanelContent = document.querySelector(".feedback-content");
    let endPanelButton = document.querySelector(".feedback-button");

    endPanelButton.classList.add("hidden");
    endPanelContent.addElement("p", "id= class=end-text", text);

    let endGame = endPanelContent.addElement("button", "id=new-game-button class=end-panel-button", "Salir");
    endGame.addEventListener("click", function () {
        deleteGame(gameId);
    })
}

function deleteGame(gameId) {
    let fetchData = {
        method: "DELETE",
    }
    
    fetch("/game/delete/" + gameId, fetchData)
    .then(location.reload())
}

function isTheEnd (gameId) {
    let fetchData = {
        method: "GET",
    }
    
    fetch("/game/end/" + gameId, fetchData)
    .then(response => response.json())
    .then(data => {
        if (data.endGame) {
            endPanel(gameId, "¡Has perdido!");
        }
    })
}

function getEnemyShips (game) {
    let fetchData = {
        method: "GET",
    }
    
    fetch("/game/enemyShips/" + game.gameId + "/" + game.player[1].id, fetchData)
    .then(response => response.json())
    .then(data => {
        game.player[1].ships = data[0].player.ships;
        let enemyBoard = document.querySelector("#enemy-game-board");
        printAttacks(game, game.player[0], game.player[1], enemyBoard);
    })
}

function updatePlayerAttack(game, attackedTile) {
    game.player[0].attacks.push(attackedTile);
    data = {
        "attacks": game.player[0].attacks
    }

    let fetchData = {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }
    
    fetch("/game/attacks/" + game.gameId + "/" + game.player[0].id, fetchData)
    .then(response => response.json())
    .then(getEnemyShips(game))
}

function getEnemyAttacks (game) {
    let fetchData = {
        method: "GET",
    }
    
    fetch("/game/enemyAttacks/" + game.gameId + "/" + game.player[1].id, fetchData)
    .then(response => response.json())
    .then(data => {
        game.player[1].attacks = data[0].player.attacks;
        let playerBoard = document.querySelector("#player-game-board");
        printAttacks(game, game.player[1], game.player[0], playerBoard);
    })
}

function canJoin(gameId) {
    let fetchData = {
        method: "POST",
    }

    fetch("/game/canJoin/" + gameId, fetchData)
    .then(response => response.json())
    .then(data => {
        if (!data.canJoin) {
            let container = document.querySelector(".container");
            let fullPanel = feedbackPanel(container);
            let fullPanelContent = document.querySelector(".feedback-content");
            let fullPanelButton = document.querySelector(".feedback-button");
        
            fullPanelButton.classList.add("hidden");
            fullPanelContent.addElement("p", "id= class=end-text", "La partida está completa");
        
            let fullGame = fullPanelContent.addElement("button", "id= class=full-panel-button", "Volver");
            fullGame.addEventListener("click", function () {
                location.reload();
            })
        }
    })
}


//Add html element to DOM: elementFather.addElement(elementType, "id= class=", innerHTML)
Object.prototype.addElement = function (elementType, selector, innerHTML) {
    let elementFather = this;
    let htmlElement = document.createElement(elementType);
    let id, classes;
 
    if (selector) {
        id = selector.slice(selector.indexOf("id=") + 3, selector.indexOf(" "));
        classes = selector.slice(selector.indexOf("class=") + 6);
    }

    if (id) {
        htmlElement.id = id;
    }

    if (classes) {
        let classesArray = classes.split(" ");
        classesArray.forEach(element => {
            htmlElement.classList.add(element);
        })
    }

    if (innerHTML) {
        if (elementType === "img") {
            htmlElement.src = innerHTML;
        } else {
            htmlElement.innerHTML = innerHTML;
        }
    }

    elementFather.appendChild(htmlElement);
    return htmlElement;
}

//Create a feedback window: feedbackPanel (container, button)
function feedbackPanel (container, button) {
    let feedback = document.querySelector(".feedback-panel");
    let feedbackButton;

    if (feedback) {
        feedback.remove();
    } 

    if (button) {
        button.disabled = true;
    }
 
    feedbackBackground = container.addElement("div", "id= class=feedback-background");
    feedback = container.addElement("div", "id= class=feedback-panel");
    feedback.addElement("div", "id= class=feedback-content");
    feedbackButton = feedback.addElement("button", "id= class=feedback-button", "Volver");
    feedbackButton.addEventListener("click", function () {
        if (button) {
            button.disabled = false;
        }
        feedbackBackground.remove();
        feedback.remove();
    })

    return feedback;
}