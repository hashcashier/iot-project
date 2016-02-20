var path 	= require('path');

module.exports = function(app, express) {
	app.use(express.static(path.join(app.get('rootpath'), 'public')));

	var authRoutes = require('./auth')(app, express);
	app.use('/auth', authRoutes);

	var apiRoutes = require('./api')(app, express);
	app.use('/api', apiRoutes);

	var testRoutes = require('./test')(app, express);
	app.use('/test', testRoutes);

	app.get('/', function(req, res) {
		res.sendFile(path.join(app.get('rootpath'), 'public/index/views/index.html'));
	});

	app.get('/app', function(req, res) {
		res.sendFile(path.join(app.get('rootpath'), 'public/app/views/index.html'));
	});

	app.get('*', function(req, res) {
		res.status(400).send("Client made a bad request to the server.");
	});
};
