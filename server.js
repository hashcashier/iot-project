var express = require('express');
var app 	= express();
var config 	= require('./config/app');

app.set('config', config);
app.set('rootpath', __dirname);

var bodyParser 		= require('body-parser');
var morgan 			= require('morgan');

var mongoose 	= require('mongoose');
var configMongo = require('./config/db');

mongoose.connect(configMongo.database);

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./app/routes/routes.js')(app, express);

app.listen(config.port);
console.log('Server started on port ' + config.port);