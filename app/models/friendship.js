var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FriendshipSchema = new Schema({
	user: {type: Schema.Types.ObjectId, required: true},
	friend: {type: Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('Friendship', FriendshipSchema);