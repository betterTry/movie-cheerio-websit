// JavaScript Document
'use strict'

var sha1 = require('sha1');
var gerRawBody = require('raw-body');
var Wechat = require('./wechat'); 
var util = require('./util');

module.exports = function(opts , handler){
	var wechat = new Wechat(opts);
	return function *(next){
		var token = opts.token;
		var signature = this.query.signature;
		var nonce = this.query.nonce;
		var timestamp = this.query.timestamp;
		var echostr = this.query.echostr;
		var str = [token , timestamp , nonce].sort().join('');
		var sha = sha1(str);
		if(this.method === 'GET'){
			if(sha === signature){
				this.body = echostr;
			}
			else{
				this.body = 'wrong';
			}
		}
		//如果是一个post请求;
		else if(this.method === 'POST'){
			if(sha !== signature){
				this.body = 'wrong';
				return false;
			}
			var data = yield gerRawBody(this.req, {
				length : this.lenth,
				limit : '1mb',
				encoding : this.charset
			})
			var content = yield util.parseXMLAsync(data);
			var message = util.formatMessage(content.xml);
			//得到数据;

			console.log(message)

			this.weixin = message;
			this.text = 1;
			
			yield handler.call(this , next)
			//通过reply.reply解析成包裹回复信息的xml之后，返回给wechat.reply;

			wechat.reply.call(this)
		}
	}

}