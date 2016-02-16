var User = require('../models/user');
var Friendship = require('../models/friendship');

module.exports = function(app, express) {
	var apiRouter = express.Router();

	// Always find out who is making the request first
	apiRouter.use(function(req, res, next) {
		User.findOne({username: req.decoded.username}, function(err, user) {
			if (!user) {
				return dataBaseError(res);
			} else {
				req.user = user;
				next();
			}
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
				var areFriends = isFriendsWith(req.user, friend);
				console.log("RESULT: " + areFriends);
				return res.json({success: true, username: friend.username, areFriends: areFriends});
			});
		});

	return apiRouter;
};

function isFriendsWith(user, friend) {
	return Friendship.findOne({user: user._id, friend: friend._id}).count() > 0;
}

function dataBaseError(res) {
	return res.status(403).send({
		success: false,
		message: 'Database error.'
	});
}