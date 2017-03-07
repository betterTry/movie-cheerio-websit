var moogoose = require('mongoose');
var Schema = moogoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var OnlineSchema = new Schema({
	name: {
		type: String,
		unique: true
	},
	user: {
		type: ObjectId,
		ref: 'User'
	}
})

module.exports = OnlineSchema;