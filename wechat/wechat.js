
// JavaScript Document
//access_token的获取、更新和存储;
'use strict'
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var _ = require('lodash');
var util = require('./util');
var fs = require('fs');
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
var api = {
	accessToken : prefix + 'token?grant_type=client_credential',
	temporary : {
		upload : prefix + 'media/upload?',
		fetch : prefix + 'media/get?'
	},
	permanent : {
		upload : prefix + 'material/add_material?',
		uploadNews : prefix + 'material/add_news?',
		uploadNewsPic : prefix + 'media/uploadimg?',
		fetch : prefix + 'material/get_material?',
		del : prefix + 'material/del_material?', 
		update : prefix + 'material/update_news?',
		count : prefix + 'material/get_materialcount?',
		batch : prefix + 'material/batchget_material?'
	},
	group : {
		create : prefix + 'groups/create?',
		get : prefix + 'groups/get?',
		check : prefix + 'groups/getid?',
		update : prefix + 'groups/update?',
		move : prefix + 'groups/members/update?',
		batchupdate : prefix + 'groups/members/batchupdate?',
		del : prefix + 'groups/delete?'
	},
	user : {
		remark : prefix + 'user/info/updateremark?',
		fetch : prefix + 'user/info?',
		batchFetch : prefix + 'user/info/batchget?',
		list : prefix + 'user/get?'
	},
	mass : {
		group : prefix + 'message/mass/sendall?',
		openId : prefix + 'message/mass/send?',
		del : prefix + 'message/mass/delete?',
		preview : prefix + 'message/mass/preview?',
		check : prefix + 'message/mass/get?'
	},
	menu : {
		create : prefix + 'menu/create?',
		get : prefix + 'menu/get?',
		del : prefix + 'menu/delete?',
		current	: prefix + 'get_current_selfmenu_info?'
	},
	qrcode : {
		create : prefix + 'qrcode/create?',
		show : mpPrefix + 'showqrcode?'
	},
	shortURL : {
		create : prefix + 'shorturl?'
	},
	semanticUrl : 'https://api.weixin.qq.com/semantic/semproxy/search?',//语义理解功能URL;
	ticket : {
		get: prefix + 'ticket/getticket?'
	}
}



function Wechat(opts){
	var that = this;
	this.appID = opts.appID;
	this.appsecret = opts.appsecret;
	this.getAccessToken = opts.getAccessToken; 
	this.saveAccessToken = opts.saveAccessToken;//给自身属性;
	this.getTicket = opts.getTicket;
	this.saveTicket = opts.saveTicket;

	this.getAccessToken()
		.then(function(data){
			try{
				data = JSON.parse(data);
			}
			catch(e){

				return that.updateAccessToken()
			}
			if(that.isValidAccessToken(data)){
				return Promise.resolve(data)
			}
			else{
				return that.updateAccessToken();//更新票据;
			}
		})
		.then(function(data){
			that.access_token = data.access_token;//更新后的票据赋值给自身;
			that.expires_in = data.expires_in;
			that.saveAccessToken(data);//保存更新后的票据;
		})
}

//判断access_token是否过期;
Wechat.prototype.isValidAccessToken = function(data){
	if(!data || !data.access_token || !data.expires_in){
		return false;
	}
	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now  = (new Date().getTime());

	if(now < expires_in){
		return true;
	}
	else{
		return false;
	}
}

//更新access_token;
Wechat.prototype.updateAccessToken = function(){
	var appID = this.appID;
	var appsecret = this.appsecret;
	var url = api.accessToken + '&appid=' + appID + '&secret=' + appsecret;
	return new Promise(function(resolve , reject){
		request({url : url , json : true})
			.then(function(response){
				var data = response.body;
				var now = (new Date().getTime());
				var expires_in = now + (data.expires_in - 20) * 1000; //提前20s刷新;

				data.expires_in = expires_in;
				resolve(data);
		})
	})
	
}

//更新ticket;
Wechat.prototype.updateTicket = function(accessToken){
	var url = api.ticket.get + 'access_token=' + accessToken + '&type=jsapi';

	return new Promise(function(resolve , reject){
		request({url : url , json : true})
			.then(function(response){
				var data = response.body;
				var now = (new Date().getTime());
				var expires_in = now + (data.expires_in - 20) * 1000; //提前20s刷新;

				data.expires_in = expires_in;
				resolve(data);
		})

	})
	
}

//判断ticket是否过期;
Wechat.prototype.isValidTicket = function(data){
	if(!data || !data.ticket || !data.expires_in){
		return false;
	}
	var ticket = data.ticket;
	var expires_in = data.expires_in;
	var now  = (new Date().getTime());

	if(now < expires_in){
		return true;
	}
	else{
		return false;
	}
}

//获取access_token;
Wechat.prototype.fetchAccessToken = function(data){
	var that = this;
	return this.getAccessToken()
		.then(function(data){
			try{
				data = JSON.parse(data);
			}
			catch(e){
				return that.updateAccessToken()
			}
			if(that.isValidAccessToken(data)){
				return Promise.resolve(data)
			}
			else{
				return that.updateAccessToken();//更新票据;
			}
		})
		.then(function(data){
			that.saveAccessToken(data);//保存更新后的票据;
			return Promise.resolve(data);
		})
}

//获取JDK api的ticket;
Wechat.prototype.fetchTicket = function(accessToken){
	var that = this;
	return this.getTicket()
		.then(function(data){
			try{
				data = JSON.parse(data);
			}
			catch(e){
				return that.updateTicket(accessToken)
			}
			if(that.isValidTicket(data)){
				return Promise.resolve(data)
			}
			else{
				return that.updateTicket(accessToken);//更新票据;
			}
		})
		.then(function(data){
			that.saveTicket(data);//保存更新后的票据;
			return Promise.resolve(data);
		})
}

Wechat.prototype.uploadMaterial = function(type , material , permanent){
	var that = this;
	var form = {};
	var uploadUrl = api.temporary.upload;

	if(permanent){
		uploadUrl = api.permanent.upload;
		_.extend(form , permanent);//在上传的表单中添加额外的参数;
		
	}
	if(type === 'pic'){
		uploadUrl = api.permanent.uploadNewsPic;
	}
	if(type === 'news'){
		uploadUrl = api.permanent.uploadNews;
		form = material;
	}
	else{
		form.media = fs.createReadStream(material)
	}
	var appID = this.appID;
	var appsecret = this.appsecret;

	
	return new Promise(function(resolve , reject){
		that
			.fetchAccessToken()
			.then(function(data){
				var url = uploadUrl + 'access_token=' + data.access_token;
				if(!permanent){
					url += ('&type=' + type);
				}
				else{
					form.access_token = data.access_token;
				}
				var options = {
					method : 'POST',
					url : url,
					json : true
				}
				if(type === 'news'){
					options.body = form;
				}
				else{
					options.formData = form;
				}
				request(options)
					.then(function(response){
						var _data = response.body;
						if(_data){
							resolve(_data);
						}
						else{
							throw new Error('Upload material fails')
						}
				})
			})
			.catch(function(err){
				reject(err);
			})

	})
	
}

Wechat.prototype.fetchMaterial = function(mediaId , type , permanent){
	var that = this;
	var fetchUrl = api.temporary.fetch;

	if(permanent){
		fetchUrl = api.permanent.fetch;
	}
	
	return new Promise(function(resolve , reject){
		that
			.fetchAccessToken()
			.then(function(data){
				var url = fetchUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId;
				var form = {};
				var options = {method : 'POST' , url : url , json:true}
				if(permanent){
					form.media_id = mediaId
					form.access_token = data.access_token;
					options.body = form
				}
				else{
					if(type === 'video'){
						url = url.replace('https://' , 'http://')
					}
					url += '&media_id=' + mediaId
				}
				if(type === 'news' || type === 'video'){
					request(options).then(function(response){
						var _data = response.body
						if(_data){
							resolve(_data)
						}
						else{
							throw new Error('fetch material fails');
						}
					})
					.catch(function(err){
						reject(err)
					})
				}
				else{
					resolve(url)
				}
			})

	})
	
}

Wechat.prototype.deleteMaterial = function(mediaId){
	var that = this;
	var form = {
		media_id : mediaId
	}
	return new Promise(function(resolve , reject){
		that
			.fetchAccessToken()
			.then(function(data){
				var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId
				request({method : 'POST' , url : url , body : form , json: true}).
					then(function(response){
						var _data = response.body;
						if(_data){
							resolve(_data)
						}
						else{
							throw new Error('Delete material fails');
						}
					})
			})
	})
}

Wechat.prototype.updataMaterial = function(mediaId , news){
	var that = this;
	var form = {
		media_id : mediaId
	}

	_.extend(form , news)
	return new Promise(function(resolve , reject){
		that
			.fetchAccessToken()
			.then(function(data){
				var url = api.permanent.updata + 'access_token=' + data.access_token + '&media_id=' + mediaId
				request({method : 'POST' , url : url , body : form , json: true}).
					then(function(response){
						var _data = response.body;
						if(_data){
							resolve(_data)
						}
						else{
							throw new Error('Updata material fails');
						}
					})
			})
	})
}

Wechat.prototype.countMaterial = function(){
	var that = this;
	return new Promise(function(resolve , reject){
		that
			.fetchAccessToken()
			.then(function(data){
				var url = api.permanent.updata + 'access_token=' + data.access_token;
				request({method : 'GET' , url : url , json: true}).
					then(function(response){
						var _data = response.body;
						if(_data){
							resolve(_data)
						}
						else{
							throw new Error('Updata material fails');
						}
					})
			})
	})
}

Wechat.prototype.batchMaterial = function(options){
	var that = this;
	options.type = options.type || 'image';
	options.offset = options.offset || 0;
	options.count = options.count || 1;

	return new Promise(function(resolve , reject){
		that
			.fetchAccessToken()
			.then(function(data){
				var url = api.permanent.batch + 'access_token=' + data.access_token;
				request({method : 'POST' , url : url , body : options , json: true}).
					then(function(response){
						var _data = response.body;
						if(_data){
							resolve(_data)
						}
						else{
							throw new Error('Updata material fails');
						}
					})
					.catch(function(err){
						reject(err);
					})
			})
	})
}

Wechat.prototype.createGroup = function(name){
	var that = this;

	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.group.create + 'access_token=' + data.access_token;
				var form = {
					group : {
						name : name
					}
				}
				request({method : 'POST' , url : url , body : form , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('create Group fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
		})
	})
}

Wechat.prototype.getGroup = function(){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.group.get + 'access_token=' + data.access_token;
				request({url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('get Group fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.checkGroup = function(openid){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.group.check + 'access_token=' + data.access_token;
				var form = {
					openid : openid
				}
				request({method : 'POST' , url : url , body : form , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('check Group fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.updateGroup = function(id , name){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.group.update + 'access_token=' + data.access_token;
				var form = {
					group : {
						id : id,
						name : name
					}
				}
				request({method : 'POST' , url : url , body : form , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('update Group fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}


Wechat.prototype.moveGroup = function(openid , to){
	var that = this;

	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url , form;
				if(_.isArray(openid)){
					url = api.group.batchupdate + 'access_token=' + data.access_token;
					form = {
						openid_list : openid,
						to_groupid : to
					}
				}
				else{
					url = api.group.move + 'access_token=' + data.access_token;
					form = {
						openid : openid,
						to_groupid : to
					}
				}
				request({method : 'POST' , url : url , body : form , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('move Group fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.deleteGroup = function(id){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.group.del + 'access_token=' + data.access_token;
				var form = {
					group : {
						id : id,
					}
				}
				request({method : 'POST' , url : url , body : form , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('delete Group fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.remarkUser = function(openid , remark){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.user.remark + 'access_token=' + data.access_token;
				var form = {
					openid : openid,
					remark : remark
				}
				request({method : 'POST' , url : url , body : form , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('delete Group fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.fetchUser = function(openId ,lang){
	var that = this;
	lang = lang || 'zh_CN';
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url;
				var options ={
						json : true
					}
				
				if(_.isArray(openId)){
					options.url = api.user.batchFetch + 'access_token=' + data.access_token;
					var form = {
						user_list : openId
					}
					options.body = form;
					options.method = 'POST'
				}
				else{
					options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openId + '&lang=' + lang;
				}
				request(options)
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('Fetch username fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.listUser = function(openid){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.user.list + 'access_token=' + data.access_token;
				if(openid){
					url += '&next_openid=' + openid;
				}
				request({url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('list user fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.sendByGroup = function(type , message , groupId){
	var that = this;
	var msg = {
		filter : {},
		msgtype : type
	}
	msg[type] = message;
	if(!groupId){
		msg.filter.is_to_all = true
	}
	else{
		msg.filter.is_to_all = false;
		msg.filter.group_id = groupId;
	}
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.mass.group + 'access_token=' + data.access_token;
				
				request({method : 'POST' , body : msg , url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('list user fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.sendByOpenId = function(type , message , openIds){
	var that = this;

	var msg = {
		tourse : openIds,
		msgtype : type
	}
	msg[type] = message;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.mass.openId + 'access_token=' + data.access_token;
				request({method : 'POST' , body : msg , url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('send mass fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.deleteMass = function(msgId){
	var that = this;

	var msg = {msg_id : msgId}
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.mass.del + 'access_token=' + data.access_token;
				request({method : 'POST' , body : msg , url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('delete mass fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.previewMass = function(type , message , openId){
	var that = this;

	var msg = {
		tourse : openId,
		msgtype : type
	}
	msg[type] = message;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.mass.preview + 'access_token=' + data.access_token;
				request({method : 'POST' , body : msg , url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('preview mass fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.checkMass = function(msgId){
	var that = this;

	var form = { msg_id : msgId }
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.mass.check + 'access_token=' + data.access_token;
				request({method : 'POST' , body : form , url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('preview mass fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.createMenu = function(menu){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.menu.create + 'access_token=' + data.access_token;
				request({method : 'POST' , body : menu , url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('create menu fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.getMenu = function(){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.menu.get + 'access_token=' + data.access_token;
				request({url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('get menu fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.deleteMenu = function(){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.menu.del + 'access_token=' + data.access_token;
				request({url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('delete menu fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.getCurrentMenu = function(){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.menu.current + 'access_token=' + data.access_token;
				request({url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('get current menu fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.createQrcode = function(qr){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.qrcode.create + 'access_token=' + data.access_token;
				request({method : 'POST' , body : qr , url : url , json : true})
				.then(function(response){
					var _data = response.body;
					if(_data){
						resolve(_data)
					}
					else{
						throw new Error('create qrcode fails');
					}
				})
				.catch(function(err){
					reject(err);
				})
			})
	})
}

Wechat.prototype.showQrcode = function(ticket){
}
Wechat.prototype.createShorturl = function(longUrl , action){
	var that = this;
	action = action || 'long2short';
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.shortURL.create + 'access_token=' + data.access_token;
				var form = {
					action : action,
					long_url : longUrl
				}
				request({method : 'POST' , body : form , url : url , json : true})
					.then(function(response){
						var _data = response.body;
						if(_data){
							resolve(_data)
						}
						else{
							throw new Error('create shorturl fails');
						}
					})
			})
			.catch(function(err){
				reject(err)
			})
	})
}

//语义理解方法;
Wechat.prototype.semantic = function(semanticData){
	var that = this;
	return new Promise(function(resolve , reject){
		that.fetchAccessToken()
			.then(function(data){
				var url = api.semanticUrl + 'access_token=' + data.access_token;
				semanticData.appid = data.appID;

				request({method : 'POST' , body : semanticData , url : url , json : true})
					.then(function(response){
						var _data = response.body;
						if(_data){
							resolve(_data)
						}
						else{
							throw new Error('semantic fails');
						}
					})
			})
			.catch(function(err){
				reject(err)
			})
	})
}


Wechat.prototype.reply = function(){
	var content = this.body;
	var message = this.weixin;
	var xml = util.tpl(content , message)
	this.status = 200;
	this.type = 'application/xml';
	console.log(xml);
	this.body = xml;
}

module.exports = Wechat;