var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


var DanmuSchema = new Schema({
	name: {
		type: String,
		unique: true
	},
	user: {
		type: ObjectId,
		ref: 'User'
	},
	socketid:[String],
	room: [String]
})


module.exports = DanmuSchema;