var User 	= require('../models/user');
var jwt 	= require('jsonwebtoken');

module.exports = function(app, express) {
	var apiRouter = express.Router();

	// Need a token to access the API
	apiRouter.use(function(req, res, next) {
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

	// Always find out who is making the request first
	apiRouter.use(function(req, res, next) {
		User.findOne({username: req.decoded.username}, function(err, user) {
			if (err || !user) return errorResponse(res, err);
			req.user = user;
			next();
		});
	});

	apiRouter.get('/', function(req, res) {
		return res.json({success: true});
	});

	var meRoutes = require('./me')(app, express);
	apiRouter.use('/me', meRoutes);

	var usersRoutes = require('./users')(app, express);
	apiRouter.use('/users', usersRoutes);

	var friendshipRequestRoutes = require('./requestsFriendship')(app, express);
	apiRouter.use('/requests/friendship', friendshipRequestRoutes);

	return apiRouter;
};

function errorResponse(res, err) {
	if (err) console.log(err);
	return res.status(400).send({success: false});
}