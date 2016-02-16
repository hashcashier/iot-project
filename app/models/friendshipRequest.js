var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Friendship = require('./friendship');

var FriendshipRequestSchema = new Schema({
	user: {type: Schema.Types.ObjectId, required: true},
	target: {type: Schema.Types.ObjectId, required: true},
	responded: Boolean,
	registered: {type: Date, default: Date.now }
});

FriendshipRequestSchema.methods.createRequest = function(user, target, callback) {
	Friendship.findOne({user: user._id, friend: target._id}, function(err, friendship) {
			console.log("Well?");
		if (err) throw err;
		if (friendship) return callback(false);
		FriendshipRequest.findOne(
				{$and: [
					{responded: false},
					{$or: [
						{user: user._id, target: target._id},
						{target: user._id, user: target._id}]}]},
				function(err, request) {
			if (err) throw err;
			if (request) return callback(false);
			var friendshipRequest = new FriendshipRequest();
			friendshipRequest.user = user._id;
			friendshipRequest.target = target._id;
			friendshipRequest.responded = false;
			friendshipRequest.save(function(err) {
				if (err)
					return callback(false);
				return callback(true);
			});
		});
	});
}

FriendshipRequestSchema.methods.accept = function(user, target, callback) {
	
}

module.exports = mongoose.model('FriendshipRequest', FriendshipRequestSchema);