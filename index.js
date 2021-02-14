const express = require("express");
const mongodb = require("mongodb");
const app = express();

let game = require("./routes/game");
let MongoClient = mongodb.MongoClient;

app.use("/game", game);
app.use(express.static("public"));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

MongoClient.connect( "mongodb://127.0.0.1:27017", function(err, client) {
	if(err!==null) {
		console.log(err);
	} else {
        app.locals.db = client.db("battleship");
	}
} );

app.listen(3000);