require('dotenv').config();
console.log(process.env.PRODUCTION);
const config = process.env.PRODUCTION == "FALSE" ? require('./environments/development.json') : require('./environments/production.json');
const port = config.port;
const express = require('express');
const app = express();
const morgan = require('morgan');
const game = require('./src/game')
const bearerToken = require('express-bearer-token');
const express = require('express');
const socket = require('socket.io');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const session = require('express-session');


var io = socket(server);

var sessionMiddleware = session({
	secret: "keyboard cat"
});

io.use(function (socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', function (socket) {
	var req = socket.request;
	socket.emit('news', { hello: 'world' });
  	socket.on('my other event', (data) => {
    console.log(data);
  });
});

app.use(sessionMiddleware);
app.use(cookieParser());

app.use(express.json());
app.use(morgan('combined'));

app.use(express.static('public'));

app.set('views', __dirname + 'public/views');

app.use(bearerToken());

app.use('/game', game);

app.get('/', function(req, res) {
	res.status(200);
	res.sendFile("index.html", { root: "/mnt/c/Users/Sookaz/Desktop/work/wordin/public/views/"})
});

app.listen(port, () => console.log(`Wordin server listening on port ${port}!`));