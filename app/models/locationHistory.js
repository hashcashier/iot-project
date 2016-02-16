var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationHistorySchema = new Schema({
	user: {type: Schema.Types.ObjectId, required: true},
	location: {type: Schema.Types.ObjectId, required: true},
	registered: {type: Date, default: Date.now }
});

module.exports = mongoose.model('LocationHistory', LocationHistorySchema);