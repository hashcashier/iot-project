var path 	= require('path');
var jwt 	= require('jsonwebtoken');

module.exports = function(app, express) {
	app.use(express.static(path.join(app.get('rootpath'), 'public')));

	var authRoutes = require('./auth')(app, express);
	app.use('/auth', authRoutes);

	var apiRoutes = require('./api')(app, express);
	app.use('/api', function(req, res, next) {
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		if (token) {
			jwt.verify(token, app.get('config').secret, function(err, decoded) {
				if (err) {
					return res.status(403).send({
						success: false,
						message: 'Failed to authenticate token.'
					});
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			return res.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
	});
	app.use('/api', apiRoutes);

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
