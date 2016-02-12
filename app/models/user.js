// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema
var UserSchema = new Schema({
	fbid: {type: String, required: true, index: { unique: true }},
	name: String,
	registered: {type: Date, default: Date.now }
});

// return the model
module.exports = mongoose.model('User', UserSchema);