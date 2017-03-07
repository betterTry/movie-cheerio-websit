var User = require('../models/user');
var Movie = require('../models/movie');
var getAdminPage = require('../api/getAdminPage');


exports.sMovie = function *(next){
	var movieAll = yield Movie.find({}).exec();
	var _movieAll = [];
	
}

exports.nocate = function *(next){
	var movie = yield Movie.find({category: null} , {name:1 , _id:1}).exec();
	return this.response.body = movie;
}


exports.moviePage = function *(next){
	var page = this.request.query.page;
	if(page){
		var movie = yield Movie.find({type: 'movie'},{name:1, poster:1}).skip((page-1) * 15).limit(15).exec();
		if(movie.length){
			return this.response.body = {
				success: 1,
				movie: movie
			}
		}
		else{
			return this.response.body = {success: 0}
		}
	}
}

exports.catePage = function *(next){
	var page = this.request.query.page,
		cate = this.request.query.cate;
	if(page){
		var movie = yield Category.find({_id: cate})
								.populate('movies', 'name poster -_id', {skip: (page-1) * 15 , limit: 15})
								.exec();
		if(movie.length){
			return this.response.body = {
				success: 1,
				movie: movie
			}
		}
		else{
			return this.response.body = {success: 0}
		}
	}
}



exports.getAdminPage = function *(next){
	var page = this.request.query.page || 'movie';

	var results;
	if (page == 'movie')
		results = yield getAdminPage.getMovie();
	else if (page == 'user')
		results = yield getAdminPage.getUser();
	else if (page == 'cate')
		results = yield getAdminPage.getCate();
	yield this.render('pages/admin_control_page', {
		page: page,
		results : results
	});
}
