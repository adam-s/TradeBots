let express = require('express');
let Mongo = require('../modules/Mongo');
let Users = require('../modules/Users');
var router = express.Router();

router.get('/bots/getBotsList', (req, res, next) => {
	let user = {name: req.cookies.user.name};
	Users.getBotList(user, data => res.json(data));
});

router.post('/bots/add', (req, res, next) => {
	let user = {name: req.cookies.user.name};
	Users.setBot(user, req.body, data => res.json(data));
});

router.post('/bots/delete', (req, res, next) => {
	let user = {name: req.cookies.user.name};
	Users.setBot(user, req.body.botID, data => res.json(data));
})

module.exports = router;