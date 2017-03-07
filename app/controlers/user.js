var User = require('../models/user');
var Movie = require('../models/movie');
var Category = require('../models/category');
var Online = require('../models/online');

//注册
exports.signup = function *(next){
	var _user = this.request.body;
	var _path = _user.path;
	var user = yield User.findOne({name:_user.username}).exec();
	if(user && user.length !== 0){
		this.redirect('/signin')
	}
	else{
		_user.name = _user.username;
		var user = new User(_user);
		yield user.save();
		this.session.user = user;
		this.response.body = 'success';
	}
}

//登录
exports.signin = function *(next){
	var _user = this.request.body;
	var _path = _user.path;
	var name = _user.username;
	var password = _user.password;
	var user = yield User.findOne({name : name}).exec();
	if(!user){
		return this.response.body = 'none';
		console.log('none')
	}
	var online = yield Online.findOne({name: name}).exec();
	if(online){

	}
	var isMatch = yield user.comparePassword(password);

	if(isMatch){
		this.session.user = user;
		return this.response.body = 'success';
	}
	else{
		return this.response.body = 'failed';
	}
}

exports.logout = function *(next){

	var _path = encodeURI(this.request.query.p || '/');

	if(/\/user\/private|\/admin/.test(_path)){
		_path = '/'
	}
	delete this.session.user;
	this.redirect(_path);
}



//登录
exports.showSignin = function *(next){
	yield this.render('pages/signin', {
			title : '登录页面'
	})
}
//注册
exports.showSignup = function *(next){
	yield this.render('pages/signup' , {
		title : '注册页面'
	})
}

//midware for user
exports.signinRequired = function *(next){
	var user = this.session.user;
	if(!user){
		this.redirect('/signin')
	}
	else{
		yield next
	}
}
 
exports.adminRequired = function *(next){
	var user = this.session.user;
	if(user.role <= 10){
		this.redirect('/signin')
	}
	else{
		yield next
	}
}



exports.controler = function *(next){
	var page = this.params.page || 'movie';

	return yield this.render('pages/admin', {
		page: page,
		title : '管理员中心'
	})
}


/*
 * 得到管理页面中每一页的数据;
 */
exports.getAdminPage = function *(next){


}

exports.checkUsername = function *(next){
	var _user = this.request.body;
	if(/^[\u4e00-\u9f45\w]{6,15}$/.test(_user.username)){
		if(/^(?=.*?[a-zA-Z])(?=.*?[0-9])\S{6,20}$/.test(_user.password)){
			yield next;
		}
		else{
			this.response.body = 'failed'
		}
	}
	else{
		this.response.body = 'failed'
	}
}

exports.private = function *(next){
	var user = this.session.user;
	if(this.url.indexOf('/m/') > -1){
		var _page = 'm_pages/m_private';
	}
	else {
		var _page = 'pages/private';
	}
	yield this.render(_page , {
		user: user,
		title : '个人中心'
	})
}


exports.del = function *(next){
	var name = this.request.body.name;
	if(name){
		try{
			yield User.remove({name : {$in: name}}).exec();
			return this.response.body = {success:1}
		}
		catch(err){
			console.log('use delete error');
			return this.response.body = {success:0}
		}
	}
	else{
		return this.response.body = 'nouser';
	}
}
exports.delete = function *(next){
	var name = this.query.user;
	if(name){
		try{
			yield User.remove({name : name}).exec();
			return this.response.body = {success:1}
		}
		catch(err){
			console.log('use delete error');
			return this.response.body = {success:0}
		}
	}
	else{
		return this.response.body = 'nouser';
	}
}

exports.si = function *(next){
	yield this.render('pages/m_signin' , {
		title: '登录',
		si : true
	})
}
exports.su = function *(next){
	yield this.render('pages/m_signin' , {
		title: '注册',
	})
}

