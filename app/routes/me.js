var User 			= require('../models/user');
var Friendship 		= require('../models/friendship');
var Location 		= require('../models/location');
var LocationHistory = require('../models/locationHistory');

module.exports = function(app, express) {
	var meRouter = express.Router();

	meRouter.get('/', function(req, res) {
		return res.json({success: true, user: req.user});
	});

	meRouter.post('/location', function(req, res) {
		var beacon = req.body.beacon;
		Location.findOne({beacon: beacon}, function(err, location) {
			if (err || !location) return errorResponse(res, err);
			var locationHistory = new LocationHistory();
			locationHistory.user 		= req.user._id;
			locationHistory.location 	= location._id;
			locationHistory.save(function(err) {
				if (err) return errorResponse(res, err);
				return res.json({success: true});
			})
		});
	});

	meRouter.get('/friends', function(req, res) {
		Friendship
			.find({user: req.user._id})
			.select('friend -_id')
			.populate('friend', 'username -_id')
			.exec(function(err, friendships) {
				res.json({success: true, friends: friendships});
		});
	});

	return meRouter;
};

function errorResponse(res, err) {
	if (err) console.log(err);
	return res.status(400).send({success: false});
}