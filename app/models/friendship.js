var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FriendshipSchema = new Schema({
	user: {type: Schema.Types.ObjectId, required: true},
	friend: {type: Schema.Types.ObjectId, required: true},
	registered: {type: Date, default: Date.now }
});

var Friendship = mongoose.model('Friendship', FriendshipSchema);

FriendshipSchema.pre('save', function(next, done) {
	var self = this;
	if (this.isNew) {
		Friendship.findOne({user: self.user, friend: self.friend}, function(err, friendship) {
			if (err) done(err);
			else if (friendship) {
				self.invalidate('target', 'Friendship records must be unique.');
				done(new Error('Friendship records must be unique.'));
			} else {
				next();
			}
		});
	}
});

module.exports = Friendship;