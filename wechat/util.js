
//javascript document;
'use strict'

var xml2js = require('xml2js');
var Promise = require('bluebird');
var tpl = require('./tpl');

exports.parseXMLAsync = function(xml){
	return new Promise(function(resolve , reject){
		xml2js.parseString(xml , {trim : true } , function(err , content){
			if(err) reject(err)
			else resolve(content)
		})
	})
}

function formatMessage(result){
	var message = {};
	if(typeof result === 'object'){
		var keys = 	Object.keys(result);
		for(var i = 0 ; i < keys.length ; i++){
			var key = keys[i];
			var item = result[key];

			if(!(item instanceof Array) || item.length === 0 ){
				continue;
			}//不是数组或者为空;
			if(item.length == 1){
				var val = item[0];

				if(typeof val === 'object'){
					message[key] = formatMessage(val)
				}
				else{
					message[key] = (val || '').trim();
				}
			}//数组长度为1.判断是否对象，是就进行格式化;
			else{
				message[key] = [];
				for(var j = 0 ; j  < item.length ; j++){
					message[key].push(formatMessage(item[j]))
				}
			}//如果值为多值数组，每一个都进行格式化;
		}
	}
	return message;
}//格式化结果;message中的每一项都是对象或者数组;数组中又是对象;

exports.formatMessage = formatMessage;

exports.tpl = function(content , message){
	var info = {};
	var type = 'text';
	var fromUserName = message.FromUserName;
	var toUserName = message.ToUserName;

	if(Array.isArray(content)){
		type = 'news';
	}
	content = content || {};
	type = content.type || type ; 
	info.content = content;
	info.createTime = new Date().getTime();
	info.msgType = type;
	info.toUserName = fromUserName;
	info.fromUserName = toUserName;
	//info为要替换的参数;
	return tpl.compiled(info);
	
}