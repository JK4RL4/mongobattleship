const express = require("express");
const router = express.Router();
router.use(express.urlencoded({extended: false}));
router.use(express.json());

router.post("/canJoin/:gameId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;

    dbConnection.collection(gameId).find({"joinGame": { $exists : true }}).toArray(function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
            if (data.length > 0) {
                if (data[0].joinGame < 2) {
                    dbConnection.collection(gameId).updateOne({"joinGame": 1}, {$set: {"joinGame": 2}}, function(err, data) {
                        if(err !== null) {
                            console.log(err),
                            res.send({mensaje: "Ha habido un error. " + err } );
                        } else {
                            res.send({canJoin: true});
                        } 
                    })
                } else {
                    res.send({canJoin: false});
                }
            } else {
                dbConnection.collection(gameId).insertOne({"joinGame": 1}, function(err, data) {
                    if(err !== null) {
                        console.log(err),
                        res.send({mensaje: "Ha habido un error. " + err } );
                    } else {
                        res.send({canJoin: true});
                    } 
                })
            }
		} 
    })
});

router.delete("/delete/:gameId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;

    dbConnection.dropCollection(gameId, function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
			res.send(data);
		} 
    })
});

router.get("/end/:gameId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;

    dbConnection.collection(gameId).find({"endGame": 1}).toArray(function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
            if (data.length > 0) {
                res.send({endGame: true});
            } else {
                res.send({endGame: false});
            }
		} 
    })
});

router.post("/end/:gameId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;

    dbConnection.collection(gameId).insertOne({"endGame": 1}, function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
			res.send(data);
		} 
    })
});

router.get("/enemyAttacks/:gameId/:playerId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;
    let playerId = req.params.playerId;

    dbConnection.collection(gameId).find({"player.id": playerId}).toArray(function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
			res.send(data);
		} 
    })
});


router.put("/attacks/:gameId/:playerId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;
    let playerId = req.params.playerId;
    let attacks = req.body.attacks;

    dbConnection.collection(gameId).update({"player.id": playerId}, {$set: {"player.attacks": attacks}}, function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
			res.send(data);
		} 
    })
});

router.get("/enemyShips/:gameId/:playerId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;
    let playerId = req.params.playerId;

    dbConnection.collection(gameId).find({"player.id": playerId}).toArray(function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
			res.send(data);
		} 
    })
});

router.put("/nextTurn/:gameId/:gameTurn/:nextTurn", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;
    let gameTurn = req.params.gameTurn;
    let nextTurn = req.params.nextTurn;

    dbConnection.collection(gameId).update({"gameTurn": gameTurn}, {$set: {"gameTurn": nextTurn}}, function(err, data) {
        if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
			res.send({gameTurn: nextTurn});
		} 
    })
});

router.get("/gameTurn/:gameId/:playerId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;
    let playerId = req.params.playerId;

    dbConnection.collection(gameId).find({"gameTurn": playerId}).toArray(function(err, data) {
		if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
			res.send(data);
		} 
    })
});

router.post("/newPlayer/:gameId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;
    let newPlayer = req.body;

    dbConnection.collection(gameId).insertOne(newPlayer, function(err, data) {
		if(err !== null) {
			console.log(err),
			res.send({mensaje: "Ha habido un error. " + err } );
		} else {
            res.send(data);
		} 
    })
});

router.post("/createNewGame", function(req, res) {
    let dbConnection = req.app.locals.db;

    dbConnection.collection("gameData").find().toArray(function(err, gameData) {
        if(err!=null) {
            console.log(err);
            res.send({mensaje: "error: " + err});
        } else {
            let updatedCounter = gameData[0].gameCounter + 1;
            let gameId = updatedCounter;
            let newGameId = "game" + gameId;

            dbConnection.collection("gameData").updateOne({"gameCounter": gameData[0].gameCounter}, {$set: {"gameCounter": updatedCounter}}, function(err, gameCreated) {
                if(err !== null) {
                    console.log(err),
                    res.send({mensaje: "Ha habido un error. " + err } );
                } else {
                    res.send({newGameId: newGameId});
                }
            })
        }
    })
});

router.post("/initiateGameTurns/:gameId", function(req, res) {
    let dbConnection = req.app.locals.db;
    let gameId = req.params.gameId;

    dbConnection.collection(gameId).insertOne({"gameTurn": "player1"}, function(err, data) {
        if(err !== null) {
            console.log(err),
            res.send({mensaje: "Ha habido un error. " + err } );
        } else {
            res.send({gameTurn: "player1"});
        }
    })
})

module.exports = router;