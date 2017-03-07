var Danmu = require('../app/models/danmu');

exports.find = function(id, cb){
	Danmu.findOne({socketid: id})
		.exec(function(err, user){
			if(err) cb(err);
			else {
				cb && cb(user);
			}
		})
}

exports.del = function(id, cb){
	Danmu.remove({socketid: id})
		.exec(function(err, user){
			if(err) cb(err);
			else cb && cb(user);
		})
}

exports.delName = function(name, cb){
	Danmu.remove({name: name})
		.exec(function(err, user){
			if(err) cb(err);
			else cb && cb(user);
		})
}

exports.findByRoom = function(id, room, cb){
	Danmu.findOne({socketid: id})
		.exec(function(err, user){
			if(err) console.log(err);
			else if (user){
				var _room = user.room;
				_room.each(function(index, item){
					if(item == room)
						_room[index] = room
				})
			}
		})
}

exports.delRoom = function(user, id){
	var _socketid = user.socketid;
	for(var i = 0 ; i < _socketid.length; i++){
		if(id == _socketid[i]){
			//匹配,删除i位置的sockid和room;
			user.socketid.splice(i, 1);
			user.room.splice(i, 1);
			break;
		}
	}
	user.save();
}