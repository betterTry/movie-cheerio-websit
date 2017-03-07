var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
	name : {
		unique : true,
		type :String
	},
	openid : String,
	password : String,
	// 0 : normal,
	// 1 : verified,
	// 2 : professional
	role : {
		type : Number,
		default : 0
	},
	collections : [{type: ObjectId , ref: 'Movie_s'}],
	sign : String,
	meta : {
		createAt : {
			type : Date,
			default : Date.now()
		},
		updateAt : {
			type : Date,
			default : Date.now()
		}
	},
	head : {
		type : String,
		default : '/img/head/小男孩.jpg'
	}
})

UserSchema.pre('save' , function(next){
	var user = this;
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else{
		this.meta.updateAt = Date.now()
	}
	bcrypt.genSalt( SALT_WORK_FACTOR, function(err , salt){
		//产生盐;
		if(err) return next(err)
		//哈希密码;
		bcrypt.hash(user.password , salt , function(err , hash){
			if(err) return next(err)
			user.password = hash;
			next()
		})
	})
})

UserSchema.methods = {
	comparePassword : function(_password){
		var password = this.password;
		return function(cb){
			bcrypt.compare(_password , password , function(err , isMatch){
				cb(err , isMatch)
			})
		}
	}

}

//以上都是实例方法，要在实例中进行调用
UserSchema.statics = {
	

}//静态方法，直接在模型里面调用

module.exports = UserSchema