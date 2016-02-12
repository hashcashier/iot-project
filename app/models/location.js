var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
	name: {type: String, required: true},
	campus: {type: ObjectId, required: true},
	public: Boolean,
	beacons: [String],
	registered: {type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', LocationSchema);