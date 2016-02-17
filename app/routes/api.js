var User = require('../models/user');
var Friendship = require('../models/friendship');
var FriendshipRequest = require('../models/friendshipRequest');
var mongoose= require('mongoose');

module.exports = function(app, express) {
	var apiRouter = express.Router();

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

	apiRouter.get('/me', function(req, res) {
		return res.json({success: true, user: req.user});
	});

	apiRouter.route('/users/:user_name')
		.get(function(req, res) {
			User.findOne({username: req.params.user_name}, function(err, friend) {
				if (err || !friend) return errorResponse(res, err);
				var areFriends = req.user.isFriendsWith(friend);
				if (!areFriends) {
					return res.json({success: true, username: friend.username, areFriends: areFriends});
				} else {
					friend.getLastLocation(function(err, location) {
						if (err || !location) return errorResponse(res, err);
						return res.json({success: true, username: friend.username, areFriends: areFriends, location: location});
					});
				}
			});
		});

	var friendshipRequestRoutes = require('./requestsFriendship')(app, express);
	apiRouter.use('/requests/friendship', friendshipRequestRoutes);

	return apiRouter;
};

function errorResponse(res, err) {
	if (err) console.log(err);
	return res.status(400).send({success: false});
}