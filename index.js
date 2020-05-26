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
								else if (updated.modifiedCount != 1) {
									io.sockets.sockets[socket.id].emit('error', "cannot add player");
								}
								else {
									database.findInCollection("game", {}, function(err, items) {
										if (err) {
											io.sockets.sockets[socket.id].emit('error', err);
										}
										else
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
		database.findInCollection("game", {}, function(err, items) {
			if (err) {
				io.sockets.sockets[socket.id].emit('error', err);
			}
			nbPlayer = items[0].players.length;
			var randPlayer = (Math.floor(Math.random() * nbPlayer));
			var voteTab = [];
			console.log(nbPlayer);
			items[0].players.forEach(function() {
				voteTab.push(0);
			});
			database.updateInCollection("game", {"type" : "gameRoom"}, {"$set": {"intruder": randPlayer, "voteTab" : voteTab}}, function(err, updated) {
				if (err)
					io.sockets.sockets[socket.id].emit('error', err);
				else if (updated.modifiedCount != 1) {
					io.sockets.sockets[socket.id].emit('error', "cannot set random intruder");
				}
			});
		});
		io.emit('startGame', "");
	});

	socket.on('getWord', function(data) {
		var user = data.user;
		var turn = data.turn;
		database.findInCollection("game", {}, function(err, items) {
			if (err)
				io.sockets.sockets[socket.id].emit('error', err);
			else {
				var wordComb = words.gameList[turn];
				var indexIntruder = items[0].intruder;
				var players = items[0].players;
				var indexPlayer = players.indexOf(user);
				if (indexPlayer == indexIntruder)
					io.sockets.sockets[socket.id].emit('getWord', wordComb.intruder);
				else
					io.sockets.sockets[socket.id].emit('getWord', wordComb.real);
			}
		});
	});

	socket.on('emitClue', function(data) {
		var user = data.user;
		var msg = data.msg;
		database.findInCollection("game", {}, function(err, items) {
			if (err)
				io.sockets.sockets[socket.id].emit('error', err);
			else {
				var players = items[0].players;
				var indexPlayer = players.indexOf(user);
				io.emit("getClue", {index : indexPlayer, msg : msg});
			}
		});
	});

	socket.on('switchToVote', function(data) {
		io.emit("switchToVote", "");
	});

	socket.on('addVote', function(data) {
		var playerId = data.id;
		database.findInCollection("game", {}, function(err, items) {
			if (err)
				io.sockets.sockets[socket.id].emit('error', err);
			else {
				var voteTab = items[0].voteTab;
				voteTab[playerId] = voteTab[playerId] + 1;
				database.updateInCollection("game", {"type" : "gameRoom"}, {"$set": {"voteTab": voteTab}}, function(err, updated) {
					if (err)
						io.sockets.sockets[socket.id].emit('error', err);
					else if (updated.modifiedCount != 1) {
						io.sockets.sockets[socket.id].emit('error', "cannot set random intruder");
					}
				});
				io.emit("addVote", {"id" : playerId, "nbVotes" : voteTab[playerId]});
			}
		});
	})

	socket.on('removeVote', function(data) {
		var playerId = data.id;
		database.findInCollection("game", {}, function(err, items) {
			if (err)
				io.sockets.sockets[socket.id].emit('error', err);
			else {
				var voteTab = items[0].voteTab;
				voteTab[playerId] = voteTab[playerId] - 1;
				database.updateInCollection("game", {"type" : "gameRoom"}, {"$set": {"voteTab": voteTab}}, function(err, updated) {
					if (err)
						io.sockets.sockets[socket.id].emit('error', err);
					else if (updated.modifiedCount != 1) {
						io.sockets.sockets[socket.id].emit('error', "cannot set random intruder");
					}
				});
				io.emit("removeVote", {"id" : playerId, "nbVotes" : voteTab[playerId]});
			}
		});
	})

	socket.on('submitVote', function(data) {
		var votes = data.votes.sort((a, b) => b.nbVotes - a.nbVotes);
		var mostVoted = votes[0];
		database.findInCollection("game", {}, function(err, items) {
			if (err)
				io.sockets.sockets[socket.id].emit('error', err);
			else {
				var players = items[0].players;
				var intruder = items[0].intruder;
			}
		});
	});

	socket.on('reset', function(data) {
		database.removeInCollection("game", {}, function(err, deleted) {
			if (err)
				io.sockets.sockets[socket.id].emit('error', err);
			else
				console.log(deleted);
		})

		database.removeInCollection("users", {}, function(err, deleted) {
			if (err)
				io.sockets.sockets[socket.id].emit('error', err);
			else
				console.log(deleted);
		})
		io.emit("onReset", "");
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