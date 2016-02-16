var User = require('../models/user');
var Friendship = require('../models/friendship');
var FriendshipRequest = require('../models/friendshipRequest');

module.exports = function(app, express) {
	var apiRouter = express.Router();

	// Always find out who is making the request first
	apiRouter.use(function(req, res, next) {
		User.findOne({username: req.decoded.username}, function(err, user) {
			if (err) throw err;
			if (!user) return dataBaseError(res);
			req.user = user;
			next();
		});
	});

	apiRouter.get('/', function(req, res) {
		return res.json({success: true, user: req.user});
	});

	apiRouter.route('/users/:user_name')
		.get(function(req, res) {
			User.findOne({username: req.params.user_name}, function(err, friend) {
				if (err) throw err;
				if (!friend) return dataBaseError(res);
				var areFriends = req.user.isFriendsWith(friend);
				if (!areFriends) {
					return res.json({success: true, username: friend.username, areFriends: areFriends});
				} else {
					friend.getLastLocation(function(err, location) {
						if (err) throw err;
						if (!location) return dataBaseError(res);
						return res.json({success: true, username: friend.username, areFriends: areFriends, location: location});
					});
				}
			});
		});

	apiRouter.route('/requests/friendship/:request_id')
		.put(function(req, res) {

		})
		.delete(function(req, res) {

		});

	apiRouter.post('/requests/friendship', function(req, res) {
		var friendname = req.body.friend;
		User.findOne({username: friendname}, function(err, friend) {
			if (err) throw err;
			if (!friend) return dataBaseError(res);
			FriendshipRequest.createRequest(req.user, friend, function(success) {
				return res.json({success: success});
			});
		});
	});

	return apiRouter;
};

function dataBaseError(res) {
	return res.status(403).send({
		success: false,
		message: 'Database error.'
	});
}