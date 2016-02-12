var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationRequestSchema = new Schema({
	user: {type: ObjectId, required: true},
	target: {type: ObjectId, required: true},
	responded: Boolean,
	location: {type: ObjectId, required: true},
	registered: {type: Date, default: Date.now }
});

module.exports = mongoose.model('LocationRequest', LocationRequestSchema);