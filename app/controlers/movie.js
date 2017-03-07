'use strict'

var fs = require('fs');
var path = require('path');
var Movie = require('../models/movie');
var Comment = require('../models/comment');
var Category = require('../models/category');
var koa_request = require('koa-request');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var _ = require('lodash');




var util = require('../../libs/util');
//admin save poster
exports.savePoster = function *(next){
	var posterData = this.request.body.files.uploadPoster;
	var filePath = posterData.path;
	var name = posterData.name;

	if(name){
		var data = yield util.readFileAsync(filePath);
		var timestamp = Date.now()
		var type = posterData.type.split('/')[1];
		var poster = timestamp + '.' + type;
		var newPath = path.join(__dirname , '../../', '/public/upload/' + poster);

		yield util.writeFileAsync(newPath , data)

		this.poster = poster;
	}
	yield next;
}

//admin save movie
exports.save = function *(next){
	var movieObj = this.request.body.fields || {}
	var _movie = {};

	if(this.poster){
		movieObj.poster = this.poster;
	}

	if(movieObj._id){
		var movie = yield Movie.findOne({_id : movieObj._id}).exec();
		_movie = _.extend(movie, movieObj);

		yield _movie.save()
		this.redirect('/movie/' + movie._id)
	}//更新电影
	else{
		_movie = new Movie(movieObj)
		var categoryId = movieObj.category;
		var categoryName = movieObj.categoryName;

		yield _movie.save()

		if(categoryId){
			var category = Category.findOne({_id : categoryId}).exec() 
			category.movies.push(movie._id);
			yield category.save();

			this.redirect('/movie/' + movie._id)
		}//category是更新的
		else if(categoryName){
			var category = new Category({
				name : categoryName,
				movies : [movie._id]
			})
			yield category.save()
			movie.category = category._id;
			yield movie.save()

			this.redirect('/movie/' + movie._id)
		}//category是新增的	
	}//新增电影
}


//后台录入页
exports.new = function *(next){
	var categories = yield Category.find({}).exec();
	
	yield this.render('pages/admin_movie' , {
		path : this._getPath,
		title : 'ysl 后台录入页',
		categories : categories,
		movie : {}
	})
}

//图片的提交
exports.poster = function *(next){
	var poster = this.request.body.files.upload;
	var filePath = poster.path;
	var name = poster.name;
	if(name){
		var type = poster.type.split('/')[1];
		var data = yield util.readFileAsync(filePath);
		var timestamp = Date.now();
		var newName = timestamp + '.' + type;
		var newPath = path.join(__dirname , '../../public/upload' , newName);
		yield util.writeFileAsync(newPath , data)
	}
	this.response.body = '/upload/'+newName;
}


//admin movie delete
exports.del =  function *(next){
	var name = this.request.body.name;
	var cate = this.request.body.cate;

	if(name){
		try{
			var movieid = yield Movie.find({name:{$in: name}} , {_id:1}).exec();

			yield Movie.remove({name : { $in: name}}).exec();
			
			yield delcate(movieid , cate);
			return this.response.body = {success : 1}
		}
		catch(err){
			console.log(err)
			return this.response.body = {success : 0}
		}
	}
}

// 爬虫
exports.cheerio = function *(next){
	var _movie = this.params.name;
	_movie = _movie.replace(/\s+/g,'');
	//判断客户端类型返回页面;
	if(this.url.indexOf('/m/') > -1){
		var _page = 'm_pages/movie_search';
	}
	else{
		var _page = 'pages/movie_search';
	}

	var options = {
		url :'http://www.soku.com/search_video/q_' + encodeURIComponent(_movie),
	}
	if(this.tool == 'ysl'){
		var resObj = yield Movie.find({name : new RegExp(_movie + '.*' , 'i')}).exec();
		if(resObj.length){
			resObj.forEach(function(item , index){
				if(item.type == 'variety'){
					resObj[index].s_items = item.s_items.slice(0,17);
				}
				else if(item.type == 'tv'){
					resObj[index].s_items = item.s_items.slice(0,100);
				}
			})
			return yield this.render(_page , {
				resObj : resObj,
				title : _movie + '_搜索结果',
				from : 'ysl'
			})
		}
		else{
			return yield this.render(_page , {
				noresult : true,
				from : 'ysl',
				title : _movie + '_搜索结果'
			})
		}
	}
	else{
		var response = yield koa_request(options);
		var data = response.body;
		var $ = cheerio.load(data);
		var s_dir = $('.s_dir');
		var resObj = [];
		if(s_dir.length){
			for(var i = 0;i < s_dir.length ;i++){
				var s_div = s_dir.eq(i).children().eq(0);
				var className = s_div.attr('class').split(' ')[0];
				var act = s_div.find('.s_act');
				var _resObj = {};
				if(act.length){
					_resObj = yield formatMoive($ , i);
					_resObj.type = 'movie';
					resObj.push(_resObj);
				}
				else if(className == 's_tv' && !act.length){
					_resObj = yield formatTv($ , i);
					_resObj.type = 'tv';
					if(this.tool == 'yuk')
						_resObj.s_items = _resObj.s_items.slice(0,100);
					resObj.push(_resObj);
				}
				else if(className == 's_variety' && !act.length){
					_resObj = yield formatVariety($ , i);
					_resObj.type = 'variety';
					if(this.tool == 'yuk')
						_resObj.s_items = _resObj.s_items.slice(0,17);
					resObj.push(_resObj);
				}
			}
		}
		if(resObj.length){
			if(this.tool == 'adm')
				return this.response.body = resObj;
			return yield this.render(_page , {
				resObj : resObj,
				title : _movie + '_搜索结果',
				from : 'yuk'
			})
		}
		else{
			if(this.tool == 'adm')
				return this.response.body = {noresult : true};
			return yield this.render(_page , {
				noresult : true,
				from : 'yuk',
				title : _movie + '_搜索结果'
			})
		}
	}
}

/*
 * 格式化movie
 * @params root:cheerio的根 , s: index
 * s_direct: 导演, s_area: 地区, s_figure: 演员等, s_figure_type: 演员等类型, intr_info: 简介
 */
function formatMoive(root , s){
	return new Promise(function(resolve , reject){
		var s_movie = root('.s_dir').eq(s).children().eq(0);
		var poster = s_movie.find('.s_target').find('img').attr('src');
		var c_highred = s_movie.find('.base_name').find('a').find('span').filter('.c_highred');
		var base_name = '';
		var base_name_span = s_movie.find('.base_name').find('a').text().trim();
		c_highred.each(function(index , item){
			var text = root(item).text();
			base_name += text;
			base_name_span = base_name_span.replace(text , '');
		})
		base_name_span = base_name_span.replace(/(\n+|\s+)/g,'');
		var base_type = s_movie.find('.base_type').text();
		var s_info = s_movie.find('.s_info');
		var s_direct = s_info.find('.s_direct').find('a').text();
		var s_area = s_info.find('.s_area').find('a').text();
		var s_figure = [];
		s_info.find('.s_figure').find('a').each(function(index , item){
			s_figure.push(root(item).text())
		})
		var s_figure_type = root('.s_figure').text().split('：')[0];
		var s_act = s_movie.find('.s_act');
		if(s_act.length){
			var link = s_movie.find('.s_act').eq(0).find('a').attr('href');
			
			if(/url=http:\/\//.test(link))
				var s_href = (link.match(/url.*html/i)|| link.match(/url.*\&/i))[0].replace('url=','');
			else
				var s_href = '/movie/id/' + link.replace(/.*?id_/,"").replace(/.html\?.*/,"");
		}
		else
			var s_href = 'none';
		var intr_info = s_info.find('.info_cont').find('span').attr('data-text');
		var resObj = {
			name : base_name + base_name_span,
			poster : poster,
			base_name : {
				name : base_name,
				span : base_name_span,
				base_type : base_type
			},
			s_info : {
				s_direct : s_direct,
				s_area : s_area,
				s_figure : s_figure,
				s_figure_type: s_figure_type,
				intr_info : intr_info
			},
			s_href : s_href
		}
		resolve(resObj)
	})
}


/*
 * 格式化tv
 * @params 同上
 * s_item: 每一个优酷id的数组;
 */
function formatTv(root , s){
	return new Promise(function(resolve , reject){
		var s_tv = root('.s_dir').eq(s).children().eq(0);
		var poster = s_tv.find('.s_target').find('img').attr('src');
		var c_highred = s_tv.find('.base_name').find('a').find('span').filter('.c_highred');
		var name = s_tv.find('.base_name').find('a').attr('_log_title');
		var base_name = '';
		var base_name_span = s_tv.find('.base_name').find('a').text().trim();
		c_highred.each(function(index , item){
			var text = root(item).text();
			base_name += text;
			base_name_span = base_name_span.replace(text , '');
		})
		base_name_span = base_name_span.replace(/(\n+|\s+)/g,'');
		var base_type = s_tv.find('.base_type').text();
		var s_info = s_tv.find('.s_info');
		var s_collect = s_info.find('.s_collect').find('em').text();
		var s_area = s_info.find('.s_area').find('a').text();
		var s_figure = [];
		s_info.find('.s_figure').find('a').each(function(index , item){
			s_figure.push(root(item).text())
		})
		var s_figure_type = root('.s_figure').text().split('：')[0];
		var intr_info = s_info.find('.info_cont').find('span').attr('data-text');
		var s_items = [];
		var _s_items = s_tv.find('.s_items').eq(0);
		if(_s_items.length) {
			_s_items.find('li').each(function(index , item){
				var link = root(item).find('a').attr('href');
				if(/javascript:;/.test(link)){
					return true;
				}
				else if(/url=http:\/\//.test(link))
					var _href = link.match(/url.*html/i)[0].replace('url=','');
				else
					var _href = '/movie/id/' + link.replace(/.*?id_/,"").replace(/.html\?.*/,"");
				s_items.push(_href)
			})
		}
		var resObj = {
			name : name,
			poster: poster,
			base_name: {
				name : base_name,
				span : base_name_span,
				base_type : base_type
			},
			s_info : {
				s_collect : s_collect,
				s_area : s_area,
				s_figure : s_figure,
				s_figure_type : s_figure_type,
				intr_info : intr_info,
			},
			s_items : s_items
		}
		resolve(resObj)
	})
}

/*
 * 格式化variety
 * @params
 * s_item:{
 *	href: 链接, reg: 日期, year: 年份, guest: 嘉宾, date: 时间 
 * }
 */
function formatVariety(root , s){
	return new Promise(function(resolve ,reject){
		var s_variety = root('.s_dir').eq(s).children().eq(0);
		var poster = s_variety.find('.s_target').find('img').attr('src');
		var c_highred = s_variety.find('.base_name').find('a').find('span').filter('.c_highred');
		var name = s_variety.find('base_name').find('a').attr('_log_title');
		var base_name = '';
		var base_name_span = s_variety.find('.base_name').find('a').text().trim();
		c_highred.each(function(index , item){
			var text = root(item).text();
			base_name += text;
			base_name_span = base_name_span.replace(text , '');
		})
		base_name_span = base_name_span.replace(/(\n+|\s+)/g,'');
		var base_type = s_variety.find('.base_type').text();
		var s_info = s_variety.find('.s_info');
		var s_collect = s_info.find('.s_collect').find('em').text();
		if(s_collect.indexOf('更新至') > -1){
			var year = s_collect.slice(3, 7);
			var _date = s_collect.slice(8);
		}

		var s_area = s_info.find('.s_area').find('a').text(); 
		var s_figure = [];
		s_info.find('.s_figure').find('a').each(function(index , item){
			s_figure.push(root(item).text())
		})
		var s_figure_type = s_variety.find('.s_figure').text().split('：')[0];
		var intr_info = s_info.find('.info_cont').find('span').attr('data-text'); 
		var s_items = [];
		var _hot = s_variety.find('.s_items').eq(0).find('.hot');
		var _hotlen = _hot.length;
		if(_hot){
			_hot.each(function(index , item){
				var s_hot = {};
				var elm = root(item);
				var link = elm.find('a').attr('href');
				if(/javascript:;/.test(link)){
					return true;
				}
				else if(/url=http:\/\//.test(link))
					s_hot.href = link.match(/url.*?html/i)[0].replace('url=','');
				else
					s_hot.href = '/movie/id/' + link.replace(/.*?id_/,"").replace(/.html\?.*/,"");
				s_hot.pic = elm.find('.pic').find('img').attr('src');
				s_hot.reg = elm.find('.tit').find('.reg').text();
				s_hot.tit = elm.find('a').attr('title');
				s_hot.year = year;
				var _guest = elm.find('p').find('span').text();
				s_hot.guest = elm.find('p').text().replace(_guest ,'');
				s_items.push(s_hot);
			})
		}
		var s_itemslen = s_variety.find('.s_items').eq(0).find('li').not('.all').length;
		for(var i = _hotlen ; i < s_itemslen ;i++){
			var elm = s_variety.find('.s_items').eq(0).find('li').eq(i);
			var s_li = {};
			var link = elm.find('a').attr('href');
			if(/javascript:;/.test(link)){
				continue;
			}
			else if(/url=http:\/\//.test(link))
				s_li.href = link.match(/url.*?html/)[0].replace('url=' , '');
			else
				s_li.href = '/movie/id/' + link.replace(/.*?id_/,"").replace(/.html\?.*/,"");
			s_li.reg = elm.find('.name').find('.reg').text();
			if(s_li.reg.replace('-','') > _date){
				s_li.year = year - 1;
			} else {
				s_li.year = year;
			}
 			s_li.tit = elm.find('a').attr('title');
			s_items.push(s_li);
		}
		var resObj = {
			name : base_name + base_name_span,
			poster: poster,
			base_name: {
				name : base_name,
				span : base_name_span,
				base_type : base_type
			},
			s_info : {
				s_collect : s_collect,
				s_area : s_area,
				s_figure : s_figure,
				s_figure_type : s_figure_type,
				intr_info : intr_info,
			},
			s_items : s_items
		}
		resolve(resObj)
	})
}

function delcate(movieid , cate){
	return function *(){
		if(/\d+/.test(cate))
			var _cate = yield Category.findOne({_id: cate}).exec();
		else
			var _cate = yield Category.findOne({name:cate}).exec();
		var movies = _cate.movies;
		console.log(movieid)
		for(var i = 0 ; i < movieid.length ; i++){
			for(var j = 0 ; j < movies.length ; j++){
				if(movieid[i]._id.toString() == movies[j].toString()){
					movies.splice(j,1)
					console.log('equal');
				}
			}
		}//删除cate中的movie;
		_cate.movies = movies;
		yield _cate.save();
	}
}//删除种类里面的电影id;



exports.showmovie = function *(next){
	var movie_id = this.params.id,
		name = this.request.query.n,
		index = this.request.query.i,
		date = this.request.query.d;

	var movie = yield Movie.findOne({name: name})
							.populate('category','name')
							.exec();


	var cate = '优酷'
	if(movie)
		if(movie.category)
			cate = movie.category.name;

	yield this.render('pages/showmovie' , {
		title: 'ysl_电影播放',
		movie: movie,
		movieid : movie_id,
		name: name,
		index: index,
		cate: cate,
		date: date
	})
}

exports.upload = function *(next){
	var _movie = this.request.body;
	if(_movie.type == 'variety'){
		var s_items = [];
		for(var i in _movie.s_items){
			s_items.push(_movie.s_items[i])
		}
		_movie.s_items = s_items;
	}//转换格式;

	//if _movie.type == tv 直接进行存储
	if(_movie.type == 'movie'){
		var cate = yield Category.findOne({name: '电影'}).exec();
		var cateid = cate._id;
		var movies = cate.movies;

		_movie.category = cateid;//更新cateid;
	}
	var movie = new Movie(_movie);
	if(_movie.type == 'movie'){
		movies.push(movie._id);
		cate.movies = movies;
		yield cate.save();
	}
	try{
		yield movie.save();
		this.response.body = {success: 1}
	}
	catch(err){
		console.log('uploda movie error');
		this.response.body = {success: 0}
	}
}

exports.postMovie = function *(){
	var movie = encodeURIComponent(this.request.body.m);
	var _tool = this.request.body.tool;
	if(_tool == '搜索' || _tool == '内站')
		var tool = 'ysl';
	else if(_tool == '优酷')
		var tool = 'yuk';

	this.redirect('/movie/' + movie + '?from=' + tool);
}


exports.tool = function *(next){
	var originalUrl = this.request.originalUrl;
	if(/admin/.test(originalUrl)){
		this.tool = 'adm';
		yield next;
	}
	else{
		this.tool = this.request.query.from;
		yield next;
	}
}


exports.pagination = function *(next){
	var movie = Movie.find({},{name: 1 , poster: 1}).skip((th-1) * 15).limit(15);
	this.response.body = movie;
}


