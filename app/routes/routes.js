var path 	= require('path');

module.exports = function(app, express, passport) {
	app.use(express.static(path.join(app.get('rootpath'), 'public')));

	var authRoutes = require('./auth')(app, express, passport);
	app.use('/auth', authRoutes);

	app.get('/', function(req, res) {
		res.sendFile(path.join(app.get('rootpath'), 'public/index/views/index.html'));
	});

	app.get('/app', isLoggedIn, function(req, res) {
		res.sendFile(path.join(app.get('rootpath'), 'public/app/views/index.html'));
	});

	app.get('*', function(req, res) {
		res.status(400).send("Client made a bad request to the server.");
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}