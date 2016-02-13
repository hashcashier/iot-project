var path 	= require('path');

module.exports = function(app, serverDir, express, passport) {
	app.use(express.static(path.join(serverDir, 'public')));

	var authRoutes = require('./auth')(app, express, passport);
	app.use('/auth', authRoutes);

	app.get('/', function(req, res) {
		res.sendFile(path.join(serverDir, 'public/app/views/index.html'));
	});

	app.get('*', function(req, res) {
		res.status(400).send("Client made a bad request to the server.");
	});
};