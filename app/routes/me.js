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
		var beacons = req.body.beacons.split(",");
		console.log(beacons)

		Location.find({beacon: {$in: beacons} }, function(err, locations) {
			if (err || !locations || locations.length == 0)
				return errorResponse(res, err);
			console.log(locations)

			var done = false;
			//for (var beacon in beacons) {
			for (var i = 0; i < beacons.length; i++) {
				var beacon = beacons[i]
				console.log("BEACON")
				console.log(beacon)
				locations.forEach(function(location) {
				console.log("LOCATION")
					console.log(location)

					if (location.beacon != beacon) {
						return;
					}

					console.log(location)

					var locationHistory = new LocationHistory();
					locationHistory.user 		= req.user._id;
					locationHistory.location 	= location._id;
					locationHistory.save(function(err) {
						if (err) return errorResponse(res, err);
						return res.json({success: true, location: location.name});
					})
					done = true;
				})

				if (done)
					break;
			}
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