require('dotenv').config();
console.log(process.env.PRODUCTION);
const config = process.env.PRODUCTION == "FALSE" ? require('./environments/development.json') : require('./environments/production.json');
const port = config.port;
const express = require('express');
const app = express();
const morgan = require('morgan');
const game = require('./src/game')
const bearerToken = require('express-bearer-token');
const socket = require('socket.io');
const cookieParser = require('cookie-parser');
const session = require('express-session');

var server = app.listen(8000);
var io = require('socket.io').listen(server);

var sessionMiddleware = session({
	secret: "keyboard cat"
});

io.use(function (socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', function (socket) {
	socket.on('login', function(data) {
		console.log(data);
		io.sockets.sockets[socket.id].emit('logged', "Hello " + data + " !");
	});
});

app.use(sessionMiddleware);
app.use(cookieParser());

app.use(express.json());
app.use(morgan('combined'));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + 'public/views');

app.use(bearerToken());

app.use('/game', game);

app.get('/', function(req, res) {
	res.status(200);
	res.sendFile(__dirname + "/public/views/index.html")
});