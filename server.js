var express = require('express');
var app 	= express();
var config 	= require('./config/app');

var passport		= require('passport');
var cookieParser 	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var session 		= require('express-session');
var morgan 			= require('morgan');

var mongoose 	= require('mongoose');
var configMongo = require('./config/db');

mongoose.connect(configMongo.database);

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

require('./config/passport')(passport);

app.use(session({ secret: config.secret }));
app.use(passport.initialize());
app.use(passport.session());

require('./app/routes/routes.js')(app, __dirname, express, passport);

app.listen(config.port);
console.log('Server started on port ' + config.port);