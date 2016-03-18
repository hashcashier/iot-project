var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Friendship = require('./friendship');

var FriendshipRequestSchema = new Schema({
	user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
	target: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
	responded: Boolean,
	registered: {type: Date, default: Date.now }
});

FriendshipRequestSchema.statics.accept = function(user, target, callback) {
	
}

var FriendshipRequest = mongoose.model('FriendshipRequest', FriendshipRequestSchema);

FriendshipRequestSchema.pre('save', function(next, done) {
	var self = this;
	var userId = new mongoose.Types.ObjectId(self.user);
	var targetId = new mongoose.Types.ObjectId(self.target);
	if (this.isNew) {
		Friendship.findOne({user: userId, friend: targetId}, function(err, friendship) {
			if (err) done(err);
			else if (friendship) {
				self.invalidate('target', 'Can not request friendship with an existing friend.');
				done(new Error('Can not request friendship with a friend.'));
			} else {
				FriendshipRequest.findOne({$and: [
					{responded: false},
					{$or: [
						{user: userId, target: targetId},
						{target: userId, user: targetId}]}]},
					function(err, request) {
						if (err) done(err);
						else if (request) {
							self.invalidate('target', 'A friendship request is already pending.');
							done(new Error('A friendship request is already pending.'));				
						} else {
							next();
						}
				});
			}
		});
	} else {
		next();
	}
});

module.exports = FriendshipRequest;