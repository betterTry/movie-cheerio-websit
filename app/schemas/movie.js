var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var MovieSchema = new Schema({
	name : {
		type: String,
		unique : true
	},
	type : String,
	category : {
		type: ObjectId,
		ref: 'Category',
	},
	poster : String,
	base_name : {
		name : String,
		span : String,
		base_type : String,
	},
	s_info : {
		s_collect : String,
		s_direct : String,
		s_area : String,
		s_figure : [String],
		s_figure_type : String,
		intr_info : String
	},
	s_href : String,
	s_items: [Schema.Types.Mixed],
	meta : {
		createAt : {
			type : Date,
			default : Date.now()
		},
		updateAt : {
			type : Date,
			default : Date.now()
		}
	}
})

MovieSchema.pre('save' , function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else{
		this.meta.update = Date.now()
	}
	next()
})

module.exports = MovieSchema;
