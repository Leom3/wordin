require('dotenv').config();
console.log(process.env.PRODUCTION);
const config = process.env.PRODUCTION == "FALSE" ? require('./environments/development.json') : require('./environments/production.json');
const port = config.port;
const express = require('express');
const app = express();
const morgan = require('morgan');
const game = require('./src/game')
const bearerToken = require('express-bearer-token');

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