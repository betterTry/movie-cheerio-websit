// JavaScript Document
'use strict'

var Koa = require('koa');

var mongoose = require('mongoose');
var fs = require('fs');
var moment = require('moment');


var dbUrl = 'mongodb://localhost/imooc';

mongoose.connect(dbUrl)

//models loading
var models_path = __dirname + '/app/models';
var walk = function(path){
	fs
		.readdirSync(path)
		.forEach(function(file){
			var newPath = path + '/' + file;
			var stat = fs.statSync(newPath)
			if(stat.isFile()){
				if(/(.*)\.(js|coffee)/.test(file)){
					require(newPath)
				}
			}
			else if(stat.isDirectory()){
				walk(newPath)
			}
		})
}
walk(models_path)

var menu = require('./wx/menu');
var wx = require('./wx/index');
var wechatApi = wx.getWechat()

wechatApi.deleteMenu().then(function(){
	return wechatApi.createMenu(menu)
}).then(function(msg){
})



var app = new Koa();
var Router = require('koa-router');
var router = new Router()
var bodyParser = require('koa-bodyparser');
var session = require('koa-session');
var User = mongoose.model('User');

var views = require('koa-views');


app.use(require('koa-static')('public'))
app.use(views(__dirname + '/app/views' , {
	extension : 'jade',
	locals : {
		moment : moment
	}
}))

app.keys = ['mxysl'];
app.use(session(app))
app.use(bodyParser())

app.use(function *(next){
	if(this.path === '/favicon.ico') return;
	var user = this.session.user;
	if(user && user._id){
		this.session.user = yield User.findOne({_id : user._id}).exec();
		this.state.user = this.session.user;
	}
	else{
		this.state.user = null
	}
	yield next;
})



//引入router,并且执行;
require('./config/routes')(router);
app
	.use(router.routes())
	.use(router.allowedMethods())



//将koa上下文对象传入http;
var server = require('http').Server(app.callback());
var danmu = require('./danmu/danmu');
//将server对象传入io,进行监听;
danmu.initialize(server);

server.listen(3100);

console.log('listening at PORT 3100...')