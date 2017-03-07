'use strict'

var Index = require('../app/controlers/index');
var User = require('../app/controlers/user');
var Movie = require('../app/controlers/movie');
var Wechat = require('../app/controlers/wechat');
var Game = require('../app/controlers/game');
var Comment = require('../app/controlers/comment');
var Category = require('../app/controlers/category');
var Search = require('../app/controlers/search');
var koa_body = require('koa-body');
var danmu = require('../danmu/danmu');


module.exports = function(router){

	//index
	router.get('/', Index.judgeAgent , Index.index);
	router.get('/m', Index.index);
	//user
	router.post('/user/signup' , User.checkUsername , User.signup);
	router.post('/user/signin' , User.checkUsername , User.signin);
	router.get('/logout' , User.logout);

	router.get('/user/private' , Index.judgeAgent, User.signinRequired , User.private);
	router.get('/m/user/private' , User.signinRequired , User.private);

	router.post('/user/delete/' , User.signinRequired , User.adminRequired , User.del);
	router.delete('/user/delete' , User.signinRequired, User.adminRequired , User.delete);
	//movie
	router.post('/admin/movie' , User.signinRequired , User.adminRequired , koa_body({multipart : true}) ,  Movie.savePoster , Movie.save);
	router.post('/admin/movie/poster' , koa_body({multipart : true}) , Movie.poster)

	router.post('/movie/search/' , Movie.postMovie)

	router.get('/movie/:name' , Index.judgeAgent , Movie.tool , Movie.cheerio);
	router.get('/m/movie/:name' , Movie.tool, Movie.cheerio);/* 手机 */

	/* 显示电影 */
	router.get('/movie/id/:id' , danmu.danmu() , Movie.showmovie);

	

	router.post('/admin/movie/upload' , User.signinRequired , User.adminRequired , Movie.upload)
	router.post('/admin/movie/delete/' , User.signinRequired , User.adminRequired , Movie.del)
	//admin

	
	router.get('/admin/control' , Index.judgeAgent, User.signinRequired , User.adminRequired , User.controler)
	router.get('/m/admin/control' , User.signinRequired , User.adminRequired , User.controler);/* 手机 */
	
	router.get('/admin/control/movie/page:th' , User.signinRequired , User.adminRequired , Movie.pagination)
	/* 管理中的每一栏 */
	router.get('/admin/control/:page', Index.judgeAgent, User.signinRequired , User.adminRequired , User.controler)



	router.delete('/admin/movie/list' , User.signinRequired , User.adminRequired , Movie.del)
	router.get('/admin/search/:name' , User.signinRequired , User.adminRequired , Movie.tool ,  Movie.cheerio)
	
	

	//comment
	router.post('/user/comment' , User.signinRequired , Comment.save)
	//catetory
	router.post('/category/addMovie' , User.signinRequired , User.adminRequired , Category.addMovie);

	//wechat
	router.get('/wechat/movie' , Game.guess)
	router.get('/wechat/movie/:id' , Game.find)
	router.get('/wechat/jump/:id' , Game.jump)
	router.get('/wx' , Wechat.hear)
	router.post('/wx' , Wechat.hear)

	//search
	/* 查找未分类的电影 */
	router.get('/search/category/nocate' , Search.nocate);
	/* 查找管理页中每一页的内容 */
	router.get('/search/movie/page', User.signinRequired , User.adminRequired, Search.moviePage)
	router.get('/search/cate/page', User.signinRequired, User.adminRequired, Search.catePage)

	/* 查找 管理页中每一大页面的数据 */
	router.get('/search/adminpage' , User.signinRequired, User.adminRequired , Search.getAdminPage)

	//si&su
	router.get('/signin' , User.si);
	router.get('/signup' , User.su);



}
