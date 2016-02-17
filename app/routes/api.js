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

	apiRouter.route('/requests/friendship/:request_id')
		.put(function(req, res) {
			FriendshipRequest.findOne({_id: req.params.request_id, target: req.user._id}, function(err, friendshipRequest) {
				if (err || !friendshipRequest || friendshipRequest.responded) return errorResponse(res, err);

				var respond = function() {
					friendshipRequest.responded = true;
					friendshipRequest.save(function(err) {
						if (err) return errorResponse(res, err);
						return res.json({success: true});
					});
				};

				if (req.body.accept == 'yes') {
					var friendship = new Friendship();
					friendship.user = friendshipRequest.user;
					friendship.friend = friendshipRequest.target;
					friendship.save(function(err) {
						if (err) return errorResponse(res, err);
						var symmetricFriendship = new Friendship();
						symmetricFriendship.friend = friendshipRequest.user;
						symmetricFriendship.user = friendshipRequest.target;
						symmetricFriendship.save(function(err) {
							if (err) return errorResponse(res, err);
							return respond();
						});
					});
				} else {
					return respond();
				}
			})
		})
		.delete(function(req, res) {
			FriendshipRequest.remove({_id: req.params.request_id, user: req.user._id}, function(err) {
				if (err) return errorResponse(res, err);
				return res.json({success: true});
			})
		});

	apiRouter.post('/requests/friendship', function(req, res) {
		var friendname = req.body.friend;
		User.findOne({username: friendname}, function(err, friend) {
			if (err || !friend) return errorResponse(res, err);

			var friendshipRequest = new FriendshipRequest();
			friendshipRequest.user = req.user._id;
			friendshipRequest.target = friend._id;
			friendshipRequest.responded = false;
			friendshipRequest.save(function(err) {
				if (err)  return errorResponse(res, err);
				else return res.json({sucess: true});
			});
		});
	});

	return apiRouter;
};

function errorResponse(res, err) {
	if (err) console.log(err);
	return res.status(400).send({success: false});
}