var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CampusSchema = new Schema({
	name: {type: String, required: true, index: { unique: true }},
	image: String,
	registered: {type: Date, default: Date.now }
});

module.exports = mongoose.model('Campus', UserSchema);