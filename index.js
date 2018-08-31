const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const http = require('http');
const cors = require('cors');

//Modules

const Mongo = require('./modules/Mongo').init();
const Users = require('./modules/Users');
const Crypto = require('./modules/Crypto');
const Binance = require('./modules/Binance');
let binanceAPI = require('binance-api-node').default;

//Routers
var signin = require('./routes/signin');
var signup = require('./routes/signup');
var bots = require('./routes/bots');
var account = require('./routes/account');
var index = require('./routes/index');
var incomes = require('./routes/incomes');
var statistics = require('./routes/statistics');

var app = express();


// app.use(cors({
// 	origin: 'http://localhost:3000',
// 	credentials: true
//   }));
app.use(cookieParser());
app.use(expressSession({secret: 'kitty secret'}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');
// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
// 	res.header('Access-Control-Allow-Credentials', 'true')
// 	next();
// })

app.set('port', process.env.PORT || 9080)


app.get('/bots/getBotsList', bots)
app.post('/bots/add', bots)
app.post('/bots/delete', bots)
app.post('/bots/update', bots)
app.post('/bots/setStatus', bots)
app.post('/bots/orders/cancel', bots)
app.post('/bots/orders/cancelAll', bots)

app.get('/account/api', account)
app.post('/account/api', account)
app.delete('/account/api', account)

app.get('/signin', signin)
app.post('/signin', signin)
app.get('/signout', signin)
app.post('/signup', signup)

app.get('/incomes', incomes)
app.get('/statistics', statistics)



// пользовательская страница 404 
app.use(function(req, res){        
	res.status(404);        
	res.sendFile('404.html', {root: 'public/'}); 
});

// пользовательская страница 500 
app.use(function(err, req, res, next){        
	console.error(err.stack);        
	res.status(500);        
	res.sendFile('500.html', {root: 'public/'});  
}); 

//app.listen();
//app.server = http.createServer(app);
//app.listen(app.get('port'));