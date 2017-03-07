// JavaScript Document
'use strict'

var fs = require('fs');
var Promise = require('bluebird');

exports.readFileAsync = function(fpath , encoding){
	return new Promise(function(resolve , reject){
		fs.readFile(fpath , encoding , function(err, content){
			if(err) reject(err)
			else resolve(content);
		})
	})
}
exports.writeFileAsync = function(fpath , content){
	return new Promise(function(resolve , reject){
		fs.writeFile(fpath , content , function(err){
			if(err)	 reject(err)
			else resolve()
		})
	})

}

var crypto = require('crypto');
//随机字符串;
var createNonce = function(){
	return Math.random().toString(36).substr(2,15)
}
//随机时间戳;
var createTimestamp = function(){
	return parseInt(new Date().getTime() / 1000 , 10) + ''
}
function _sign(noncestr , ticket , timestamp , url){
	var arr = [
		'noncestr=' + noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url=' + url
	]
	var str = arr.sort().join('&');
	var shasum = crypto.createHash('sha1');
	shasum.update(str)
	return shasum.digest('hex');
}
//返回签名;
exports.sign = function(ticket ,url){
	var noncestr = createNonce();
	var timestamp = createTimestamp();
	var signature = _sign(noncestr , ticket , timestamp , url);

	return {
		noncestr : noncestr,
		timestamp : timestamp,
		signature : signature
	}
}
