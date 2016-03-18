var User = require('../models/user');
var Friendship = require('../models/friendship');
var FriendshipRequest = require('../models/friendshipRequest');

module.exports = function(app, express) {
	var apiRouter = express.Router();

	apiRouter.route('/:request_id?')
		.get(function(req, res) {
			FriendshipRequest
			.find({target: req.user._id, responded: false})
			.select('target -_id')
			.populate('target', 'username -_id')
			.exec(function(err, requests) {
				if (err) return errorResponse(res, err);
				return res.json({success: true, requests: requests});
			});
		})
		.post(function(req, res) {
			var friendname = req.body.friend;
			User.findOne({username: friendname}, function(err, friend) {
				if (err || !friend) return errorResponse(res, err);

				var friendshipRequest = new FriendshipRequest();
				friendshipRequest.user = req.user._id;
				friendshipRequest.target = friend._id;
				friendshipRequest.responded = false;
				friendshipRequest.save(function(err) {
					if (err)  return errorResponse(res, err);
					return res.json({success: true});
				});
			});
		})
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

	return apiRouter;
};

function errorResponse(res, err) {
	if (err) console.log(err);
	return res.status(400).send({success: false});
}