var User 			= require('../models/user');
var Location 		= require('../models/location');
var LocationHistory = require('../models/locationHistory');

module.exports = function(app, express) {
	var usersRouter = express.Router();

	usersRouter.route('/:user_name')
		.get(function(req, res) {
			User.findOne({username: req.params.user_name}, function(err, friend) {
				if (err || !friend) return errorResponse(res, err);
				req.user.isFriendsWith(friend, function(err, areFriends) {
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
		});

	return usersRouter;
};

function errorResponse(res, err) {
	if (err) console.log(err);
	return res.status(400).send({success: false});
}