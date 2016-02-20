var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var Friendship = require('./friendship');
var LocationHistory = require('./locationHistory');

var UserSchema = new Schema({
	username: { type: String, required: true, index: { unique: true }},
	password: { type: String, required: true, select: false },
	registered: { type: Date, default: Date.now, select: false }
});

UserSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) return next();
	bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});

UserSchema.methods.comparePassword = function(password) {
	var user = this;
	return bcrypt.compareSync(password, user.password);
};

UserSchema.methods.isFriendsWith = function(friend, callback) {
	var user = this;
	Friendship.findOne({user: user._id, friend: friend._id}).count(callback);
};

UserSchema.methods.getLastLocation = function(callback) {
	var user = this;
	LocationHistory.find({user: user._id}).sort({registered: -1}).limit(1).exec(callback);
};

module.exports = mongoose.model('User', UserSchema);