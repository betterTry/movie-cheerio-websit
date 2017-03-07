'use strict'
var Category = require('../models/category');
var Movie = require('../models/movie');

//category

exports.addMovie = function *(next){
	var data = this.request.body;
	if(data){
		var id = data.id;
		var cateid = data.cateid;
		var cate = yield Category.findOne({_id : cateid}).exec();
		var movie = yield Movie.findOne({_id : id}).exec();
		cate.movies.push(id);
		movie.category = cateid;
		try{
			yield cate.save();
			yield movie.save();
			return this.response.body = {success:1}
		}
		catch(err){
			console.log(err)
			return this.response.body = {success:0}
		}
		
	}
	else{
		return this.response.body = {success:-1}
	}
}
