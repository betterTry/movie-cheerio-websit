
'use strict'

var path = require('path');
var util = require('../libs/util')
var Wechat = require('../wechat/wechat')
var wechat_file = path.join(__dirname , '../config/wechat.txt');
var wechat_ticket_file = path.join(__dirname , '../config/wechat_ticket.txt');

var config = {
	wechat : {
		appID : "wx483c1e8ef78ed9e9",
		appsecret : "b2b9b5cfeeb77060e542768767941ede",
		token : "mxysl",
		getAccessToken : function(){
			return util.readFileAsync(wechat_file);
		},
		saveAccessToken : function(data){
			data = JSON.stringify(data);
			return util.writeFileAsync(wechat_file , data);
		},
		getTicket : function(){
			return util.readFileAsync(wechat_ticket_file);
		},
		saveTicket : function(data){
			data = JSON.stringify(data);
			return util.writeFileAsync(wechat_ticket_file , data);
		}
	}
	
}

exports.getWechat = function(){
	var wechatApi = new Wechat(config.wechat);
	return wechatApi;
}

exports.wechatOpt = config;