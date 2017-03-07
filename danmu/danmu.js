var socketIo = require('socket.io');
var Danmu = require('../app/models/danmu');
var util = require('./util');

var danmu = {
	context: {}
};

danmu.danmu = function(){
	var _self = this;
	return function *(next){
		_self.context = this;
		yield next;
	}
}

//全部将方法附加在danmu对象上;
danmu.initialize = function(http){
	this.io = socketIo(http);
	this.ioListen();
}

danmu.ioListen = function(){
	var _self = this;
	//房间;

	this.io
		.on('connection', function(socket){

			var room = _self.context.request.path.replace('/movie/id/','');

			var _u = _self.context.session.user;

			var colorArr = ['#2c3e50', 'red', '#1e87f0', '#7ac84b', '#FF7F00', '#9b39f4', '#FF69B4'];


			//连接时就检查如果在未离开房间时，再次进入房间;
			Danmu.findOne({name: _u.name})
				.exec(function(err, user){
					if(err) console.log(err);
					else {
						if(user){
							//已经有user连接;
							var _room = user.room;
							// 是否重复进入房间的参数;
							var entered = false;
							for( var i = 0 ; i < _room.length; i++){
								if(_room[i] == room){

									//如果已经在房间room中,给原房间发送释放信息;
									var oldSocket =  _self.io.sockets.connected[user.socketid[i]];
									oldSocket.leave(_room[i]);
									
									//储存现在的信息;
									user.socketid.push(socket.id);
									user.room.push(room);
									user.save(function(){
										oldSocket.disconnect();
										
									});
									
									//加入房间并且欢迎信息;
									socket.join(room);
									_self.io.to(room).emit('enter', {name: user.name})

									
									//有可能需要将原来的释放,待做;
									entered = true;
									break;
								}
							}
							if(!entered){
								//如果没有重复进入房间;
								socket.join(room);
								_self.io.to(room).emit('enter', {name: user.name});
								user.socketid.push(socket.id);
								user.room.push(room);
								user.save();
							}
						} else {
							
							//在进入房间的一刻记录用户的信息;
							var _user = {
								name: _u.name,
								user: _u._id,
								socketid: [],
								room: []
							};
							_user.socketid.push(socket.id)
							_user.room.push(room);
							var danmuU = new Danmu(_user);
							danmuU.save(function(err, user){
								
								if(err) console.log(err)
								else{
									//若无存储错误,进入房间;
									socket.join(room);
									//发送进入广播;
									_self.io.to(room).emit('enter', {name: user.name})
								}
							})
						}
					}
				});//现在同一用户只在同一房间存在一个;
			
			//接收弹幕
			socket.on('danmu', function(msg){

				var id = this.id;
				var content = msg.content,
					room = msg.room,
					color = colorArr[msg.color];
				util.find(id, function(user){
					//如果内容不为空并且房间存在;
					if(!/^\s+$/.test(content) && content.length <= 30 && room)
						_self.io.to(room).emit('reply', {name: user.name , msg: content, color: color})
				})
			});

			socket.on('disconnect',function(){
				//离开时,删除用户;
				var id = this.id;
				Danmu.findOne({socketid: id})
					.exec(function(err, user){
						if(err) console.log(err);
						else{
							if(user){
								//如果有user,查看有没有在其他房间;
								if(user.room.length > 1){
									//如果在其他房间,离开房间,删除房间信息;
									util.delRoom(user, id)
								} else {
									
									console.log(room)
									//如果不在其他房间，直接删除Danmu;
									util.del(id);
								}
							} else {
								//有问题;
								console.log('there is a problem');
							}
						}
					})
				
			});
		});

}

module.exports = danmu;