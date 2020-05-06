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
const database = require('./src/database')

var server = app.listen(8000);
var io = require('socket.io').listen(server);

var sessionMiddleware = session({
	secret: "keyboard cat"
});

io.use(function (socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
});

//Usefull mongo functions
//database.findOneInCollection("Wallets", {"userId" : user_id, "walletType" : "coinbase"}, function(err, wallet) {}
//database.insertInCollection("Wallets", walletData, function(err, wallet) {
//database.updateInCollection("Wallets", {"userId" : userId, "walletType" : "coinbase"}, {"$set": {accessToken: tokens.access_token, refreshToken: tokens.refresh_token}}, function(err, updated) {
//	if (err) {
//		return 84;
//	}
//	if (updated.modifiedCount != 1) {
//		return 84;
//	}

io.on('connection', function (socket) {
	socket.on('login', function(data) {
		console.log(data);
		var username = data.username;
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
										else
											io.sockets.sockets[socket.id].emit('logginHost', username);
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
									console.log("ERROR UPDATING2");
								}
								else {
									io.sockets.sockets[socket.id].emit('loggin', username);
								}
							});
						}
					});	
				}
			}
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
	res.sendFile(__dirname + "/public/views/test.html")
});