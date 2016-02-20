var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
	name: {type: String, required: true},
	campus: {type: Schema.Types.ObjectId, required: true},
	public: Boolean,
	beacon: {type: String, required: true, index: { unique: true }},
	registered: {type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', LocationSchema);