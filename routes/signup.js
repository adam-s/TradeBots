var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.post('/signup', (req, res, next) => {
	let user = {
		password: req.body.pass
		,name: req.body.name
	}
	Users.create(user, 'users', (data) => {
		res.header('Access-Control-Allow-Origin', '*')
		res.send(data);
	});
});

module.exports = router;