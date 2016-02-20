var Location = require('../models/location');
var Campus = require('../models/campus');

module.exports = function(app, express) {
	var testRouter = express.Router();

	testRouter.get('/campus', function(req, res) {
		var campus = new Campus();
		campus.name = "GUC";
		campus.image = "GUC LOGO";
		campus.save(function(err) {
			if (err) return errorResponse(res, err);
			return res.json({success: true});
		})
	});

	testRouter.get('/location', function(req, res) {
		Campus.findOne({}, function(err, campus) {
			if (err | !campus) return errorResponse(res, err);
			var location = new Location();
			location.name = 'C1';
			location.campus = campus._id;
			location.public = true;
			location.beacon = "ABCD";
			location.save(function(err) {
				if (err) return errorResponse(res, err);
				return res.json({success: true});
			})
		})
	});

	return testRouter;
};


function errorResponse(res, err) {
	if (err) console.log(err);
	return res.status(400).send({success: false});
}