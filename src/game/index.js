require('dotenv').config();
const config = process.env.PRODUCTION == "FALSE" ? require('../../environments/development.json') : require('../../environments/production.json');
const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', function(req, res) {
	res.status(200);
	res.sendFile("game.html", { root: "/mnt/c/Users/Sookaz/Desktop/work/wordin/public/views/"})
});

module.exports = router;