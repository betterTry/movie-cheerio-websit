'use strict'

var Movie = require('../app/api/movie');
var help = '亲爱的 欢迎关注科幻电影世界\n' + 
			'回复 1 ~ 3，测试文字回复\n' + 
			'回复 4，测试图文回复\n' + 
			'回复 首页，进入电影首页\n' + 
			'回复 电影名字，查询电影信息\n' +
			'回复 语音，查询电影信息\n' + 
			'也可以点击<a href="http://6u72ougd2t.proxy.qqbrowser.cc/wechat/movie">语音查电影</a>';


exports.reply = function* (next){
	var message = this.weixin;

	if(message.MsgType === 'event'){
		if(message.Event === 'subscribe'){
			this.body = help;
		}
		else if(message.Event === 'unsubscribe'){
			console.log('无情取关');
			this.body = '';
		}
		else if(message.Event === 'LOCATION'){
			//用户初始上报的地理位置;
			console.log('上报了地理位置:'+ message.Latitude + '/' + message.Longitude)
		}
		else if(message.Event === 'CLICK'){
			var news = [];
			if(message.EventKey === 'movie_hot'){
				let movies = yield Movie.findHostMovies(-1 , 10)
				movies.forEach(function(movie){
					news.push({
						title : movie.title,
						description : movie.title,
						picUrl : movie.poster,
						url : 'http://6u72ougd2t.proxy.qqbrowser.cc/wechat/jump/' + movie._id
					})
				})
			}
			else if(message.EventKey === 'movie_cold'){
				let movies = yield Movie.findHostMovies(1 , 10);
				movies.forEach(function(movie){
					news.push({
						title : movie.title,
						description : movie.title,
						picUrl : movie.poster,
						url : 'http://6u72ougd2t.proxy.qqbrowser.cc/wechat/jump/' + movie._id
					})
				})
			}
			else if(message.EventKey === 'movie_crime'){
				let cat = yield Movie.findMoviesByCate('犯罪');
				cat.movies.forEach(function(movie){
					news.push({
						title : movie.title,
						description : movie.title,
						picUrl : movie.poster,
						url : 'http://6u72ougd2t.proxy.qqbrowser.cc/wechat/jump/' + movie._id
					})
				})
			}
			else if(message.EventKey === 'movie_cartoon'){
				let cat = yield Movie.findMoviesByCate('动画');
				cat.movies.forEach(function(movie){
					news.push({
						title : movie.title,
						description : movie.title,
						picUrl : movie.poster,
						url : 'http://6u72ougd2t.proxy.qqbrowser.cc/wechat/jump/' + movie._id
					})
				})
			}
			else if(message.EventKey === 'help'){
				news = help;
			}
			this.body = news;
		}
	}
	else if(message.MsgType === 'text'){
		var content = message.Content;
		var reply = '额，你说的 ' + message.Content + '太复杂了吧';
		if(content === '1'){
			reply = '天下第一'
		}
		else if(content === '2'){
			reply = '天下第二'
		}
		else if(content === '3'){
			reply = '天下第三'
		}
		else if(content === '4'){
			reply = [{
				title : '技术改变世界',
				description : '只是个描述而已',
				picUrl : 'http://imgsrc.baidu.com/forum/pic/item/0f36e7708675ac728718bf7b.jpg',
				url : 'http://baidu.com'
			},{
				title : 'Node js开发微信',
				description : '只是个描述而已',
				picUrl : 'http://imgsrc.baidu.com/forum/pic/item/0f36e7708675ac728718bf7b.jpg',	
				url : 'http://douyu.com'
			}]
		}
		else{
			var movies = yield Movie.searchByName(content)
			if(!movies || movies.length === 0 ){
				movies = yield Movie.searchByDouban(content)
			}
			if(movies && movies.length > 0){
				reply = []
				movies = movies.slice(0 , 5);
				movies.forEach(function(movie){
					reply.push({
						title : movie.title,
						description : movie.title,
						picUrl : movie.poster,
						url : 'http://6u72ougd2t.proxy.qqbrowser.cc/wechat/jump/' + movie._id
					})
				})
			}
			else{
				reply = '没有查询到与' + content + '匹配的电影，要不要换一个名字试试'
			}
		}
		this.body = reply;
	}
	else if(message.MsgType === 'voice'){
		var voiceText = message.Recongnition
		var movies = yield Movie.searchByName(content)

		if(!movies || movies.length === 0 ){
			movies = yield Movie.searchByDouban(content)
		}
		if(movies && movies.length > 0){
			reply = []
			movies = movies.slice(0 , 10)

			movies.forEach(function(movie){
				reply.push({
					title : movie.title,
					description : movie.title,
					picUrl : movie.poster,
					url : 'http://6u72ougd2t.proxy.qqbrowser.cc/wechat/jump/' + movie._id
				})
			})
		}
		else{
			reply = '没有查询到与' + content + '匹配的电影，要不要换一个名字试试'
		}
		this.body = reply;
	}
	yield next;
}
