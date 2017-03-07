'use strict'

var Promise = require('bluebird');
var Movie = require('../models/movie');
var User = require('../models/user');
var Category = require('../models/category');

//查找movie;
exports.getMovie = function(){
	return new Promise(function(resolve , reject){
		Movie.find({type:'movie'} , {name: 1 , poster: 1})
			.exec(function(err , movies){
				
				if(err) reject(err);
				else{
					var movielen = movies.length;
					movies = movies.slice(0, 15);
					resolve({movies: movies , movielen: movielen});
				} 
			})
	})
}

exports.getUser = function(){
	return new Promise(function(resolve, reject){
		
		User.find({role: {$lte: 10}}, {name: 1,_id:0})
			.exec(function(err ,userall){
				if(err) reject(err);
				else{
					User.find({role: {$gt: 10}}, {name: 1,_id:0}).exec(function(err , useradm){
						if(err) reject(err);
						else{
							var _userAll = userall;
							var _userAdm = useradm;
							resolve({userAll : _userAll , userAdm : _userAdm})
						}
					});
				}
			});
	})
}

exports.getCate = function(){
	return new Promise(function(resolve, reject){

		Category.find({name : {$not: /电影/}})
				.populate({path: 'movies'})
				.exec(function(err , cates){
					if (err) reject(err);
					else {
						for( var i = 0 ; i < cates.length; i++){
							cates[i].len = cates[i].movies.len;//加上真实个数;
							cates[i].movie = cates[i].movies.slice(0,15);
						}
						resolve(cates);
					}
				})
	})
}