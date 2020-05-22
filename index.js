require('dotenv').config();
console.log(process.env.PRODUCTION);
const config = process.env.PRODUCTION == "FALSE" ? require('./environments/development.json') : require('./environments/production.json');
const port = config.port;
const express = require('express');
const app = express();
const morgan = require('morgan');
const bearerToken = require('express-bearer-token');
const socket = require('socket.io');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const database = require('./src/database');
const words = require('./src/words.json');

var server = app.listen(8000);
var io = require('socket.io').listen(server);

var sessionMiddleware = session({
	secret: "keyboard cat"
});

io.use(function (socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
});

io.sockets.on('connection', function (socket) {
	database.findInCollection("game", {}, function(err, items) {
		if (err) {
			io.sockets.sockets[socket.id].emit('error', err);
		}
		if (items && items.length > 0)
			io.emit('players', items[0].players);
	});
	socket.on('login', function(data) {
		console.log(data);
		var username = data;
		socketId = socket.id
		database.findOneInCollection("users", {"username" : username}, function(err, user) {
			if (err) {
				console.log(err);
				io.sockets.sockets[socket.id].emit('error', err);
			}
			else {
				if (user) {
					console.log("already logged");
					io.sockets.sockets[socket.id].emit('used', "Username " + username  + " already used !");
				}	
				else {
					database.findInCollection("game", {}, function(err, items) {
						if (err) {
							io.sockets.sockets[socket.id].emit('error', err);
						}
						console.log(items);
						if (items.length <= 0) {
							database.insertInCollection("game", {"host" : username, "socketId" : socketId, "type" : "gameRoom", players : [username]}, function(err, game) {
								if (err)
									io.sockets.sockets[socket.id].emit('error', err);
								else {
									database.insertInCollection("users", {"username" : username, "socketId" : socketId}, function(err, game) {
										if (err)
											io.sockets.sockets[socket.id].emit('error', err);	
										else {
											io.sockets.sockets[socket.id].emit('loggedHost', username);
											io.emit('players', [username]);
										}
									});
								}
							});
						}
						else {
							database.insertInCollection("users", {"username" : username, "socketId" : socketId}, function(err, game) {
								if (err)
									io.sockets.sockets[socket.id].emit('error', err);
							});
	
							database.updateInCollection("game", {"type" : "gameRoom"}, {"$push": {"players": username}}, function(err, updated) {
								if (err)
									io.sockets.sockets[socket.id].emit('error', err);
								if (updated.modifiedCount != 1) {
									io.sockets.sockets[socket.id].emit('error', "cannot add player");
								}
								else {
									database.findInCollection("game", {}, function(err, items) {
										if (err) {
											io.sockets.sockets[socket.id].emit('error', err);
										}
										io.emit('players', items[0].players);
									})
								}
							});
						}
					});
				}
			}
		});
	});

	socket.on('startGame', function(nbTurn) {
		io.emit('startGame', "test");
		database.findInCollection("game", {}, function(err, items) {
			if (err) {
				io.sockets.sockets[socket.id].emit('error', err);
			}
			nbPlayer = items[0].players.length;
			if (!nbTurn || nbTurn == "") {
				nbTurn = 20;
			}
			console.log("NBTURN : " + nbTurn);
			console.log("NBPLLAYER : " + nbPlayer);
			var randTab = [];
			for (var i = 0; i != nbTurn; i++) {
				randTab.push(Math.floor(Math.random() * nbPlayer));
				console.log(randTab);
			}
			console.log(randTab);
			database.updateInCollection("game", {"type" : "gameRoom"}, {"$set": {"randTab": randTab}}, function(err, updated) {
				if (err)
					io.sockets.sockets[socket.id].emit('error', err);
				if (updated.modifiedCount != 1) {
					io.sockets.sockets[socket.id].emit('error', "cannot add randtab");
				}
			});
		});
	});

	socket.on('getWord', function(data) {
		var user = data.user;
		var turn = data.turn;
		database.findInCollection("game", {}, function(err, items) {
			var wordComb = words.gameList[turn];
			var rand = items[0].randTab[turn];
			var players = items[0].players;
			var indexPlayer = players.indexOf(user);
			if (indexPlayer == rand)
				io.sockets.sockets[socket.id].emit('getWord', wordComb.intruder);
			else
				io.sockets.sockets[socket.id].emit('getWord', wordComb.real);
		});
	});

	socket.on('emitClue', function(data) {
		var user = data.user;
		var msg = data.msg;
		database.findInCollection("game", {}, function(err, items) {
			var players = items[0].players;
			var indexPlayer = players.indexOf(user);
			io.emit("getClue", {index : indexPlayer, msg : msg});
		});
	});
});

app.use(sessionMiddleware);
app.use(cookieParser());

app.use(express.json());
app.use(morgan('combined'));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + 'public/views');

app.use(bearerToken());

app.get('/', function(req, res) {
	res.status(200);
	res.sendFile(__dirname + "/public/views/index.html")
});