var Movie = require('../models/movie');
var Category = require('../models/category');
var co = require('co');
var koa_request = require('koa-request');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var _ = require('lodash');

//index page
exports.findAll = function *(){
	var	categories = yield Category
		.find({})
		.populate({path : 'movies' , options : {limits :5}})
		.exec()
	return categories
}

exports.searchByCategory = function *(catId){
	var categories = yield Category
		.find({_id : catId})
		.populate({
			path : 'movies',
			select : 'title poster'
		})
		.exec()
	return categories;
}
exports.searchByName = function *(q){
	var movies = yield Movie
		.find({title : new RegExp(q + '.*' , 'i')})
		.exec()
	return movies
}

function updateMovies(movie){
	var options = {
		url : 'https://api.douban.com/v2/movie/subject/' + movie.doubanId,
		json : true
	}
	request(options).then(function(response){
		var data = response.body

		_.extend(movie , {
			country : data.countries[0],
			language : data.language,
			summary : data.summary
		})
		var genres = movie.genres
		if(genres && genres.length > 0 ){
			var cateArray = [];
			genres.forEach(function(genre){
				cateArray.push(function *(){
					var cat = yield Category
											.findOne({name: genre})
											.exec();
					if(cat){
						cat.movies.push(movie._id)
						yield cat.save()
					}
					else{
						cat = new Category({
							name : genre,
							movies : [movie._id]
						})
						cat = yield cat.save();
					}
					movie.category = cat._id;
					yield movie.save()
				})
			})
			co(function *(){
				yield cateArray
			})
		}
		else{
			movie.save()
		}
	})
}
exports.searchByDouban = function *(q){
	var options = {
		url : 'https://api.douban.com/v2/movie/search?q='
	}

	options.url += encodeURIComponent(q);
	var response = yield koa_request(options)
	var data = JSON.parse(response.body)
	var subjects = [];
	var movies = [];
	if(data && data.subjects){
		subjects = data.subjects
	}
	if(	subjects.length > 0){
		var queryArray = [];
		subjects.forEach(function(item){
			queryArray.push(function *(){
				var movie = yield Movie.findOne({doubanId : item.id})
				if(movie){
					movies.push(movie)
				}
				//如果存储了doubanId,那就从数据库中找出;
				else{
					var directors = item.directors || [];
					var director = directors[0] || {};
					movie = new Movie({
						director : director.name || '',
						title : item.title,
						doubanId : item.id,
						poster : item.images.large,
						year : item.year,
						genres : item.genres || []
					})
					movie = yield movie.save();
					movies.push(movie);
				}//如果没有,重新存储;
			})
			//queryArray为一个generator生成器的数组;
		})
		yield queryArray;
		//执行queryArray;
		movies.forEach(function(movie){
			updateMovies(movie);
		})

	}
	return movies;
}

exports.searchById = function *(id){
	var movie = yield Movie
						.findOne({_id : id})
						.exec()
	return movie
}


exports.findHostMovies = function *(hot , count){
	var movies = yield Movie
						.find({})
						.sort({'pv':hot})
						.limit(count)
						.exec()
	return movies;
}

exports.findMoviesByCate = function *(cat){
	var category = yield Category
							.findOne({name : cat})
							.populate({
								path : 'movies',
								select : 'title poster _id'
							})
							.exec()
	return category;	
}