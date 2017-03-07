'use strict'
var MovieApi = require('../api/movie');
var Movie = require('../models/movie');
var Category = require('../models/category');

//index page
exports.index = function *(next){
	var results = [];
	//最新更新
	var newUp = yield Movie.find({}).sort({'meta.updateAt' : -1}).limit(5);
	results.push({movie: newUp , title: '最新更新', className: 'newUp'});
	
	var movie = yield Category.findOne({name: '电影'})
							.populate({path:'movies', options:{sort: {'meta.updateAt': -1} , limit: 5}})
	results.push({movie: movie , title: '电影' , className: 'movie'});

	var variety = yield Category.findOne({name: '综艺'})
								.populate({path:'movies', options:{sort: {'meta.updateAt': -1} , limit: 5}})
	results.push({movie: variety , title: '综艺', className: 'variety'});

	var tv = yield Category.findOne({name: '电视剧'})
							.populate({path:'movies', options:{sort: {'meta.updateAt': -1} , limit: 5}})
							.exec();
	results.push({movie: tv , title: '电视剧', className: 'tv'});

	var ani = yield Category.findOne({name: '动画'})
							.populate({path:'movies', options:{sort: {'meta.updateAt': -1} , limit: 5}})
							.exec();
	results.push({movie: ani , title: '动画', className: 'ani'});


	yield this.render('pages/index' , {
		path : this._getPath,
		title : 'ysl 电影小网站',
		results : results
	})
}


exports.judgeAgent = function *(next){
	var agent = this.header['user-agent'];
	var path = this.url;
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
	for(var i = 0 ; i < Agents.length ; i++){
		if(agent.indexOf(Agents[i]) > 0){
			return this.redirect('/m' + path);
		}
	}
	yield next;
}

