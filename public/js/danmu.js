$(function(){

	var socket = io('ws://localhost:3100/',{'reconnection': false});
	var room = location.pathname.replace('/movie/id/','');
	
	var danmuform = $('#danmuform');
	var emitarea = $('#emitarea');
	var danmuwrap =$('.danmuwrap');
	danmuform.submit(function(){
		var color = $('.selected').data('color');
		var msg = {
			content: emitarea.val(),
			room: room,
			color: color
		}

		socket.emit('danmu', msg);
		emitarea.val('');

		return false;
	});
	emitarea.keydown(function(e){
		if(e.keyCode == '13' && !/^\s+&/.test(emitarea.val())){
			danmuform.submit();
			return false;
		} else if (emitarea.val().length > 30){
			//大于30个字,不能发送;
			return false;
		} else{
			return true;
		}
	})

	socket.on('reply', function(msg){
		util.addDanmu(msg);
	})

	socket.on('enter', function(msg){
		util.coming(msg);
	})

	//断开连接时
	socket.on('disconnect', function(){
		
		util.disconnect();
	})

	var util = {
		addDanmu: function(msg){
			var name = msg.name,
				text = msg.msg,
				color = msg.color;
			var span = $('<span></span>').text(name + ' : ');
				p = $('<p class="danmutext" style="color:' + color + '"></p>').text(text).prepend(span);
			danmuwrap.append(p);
			this.scrolltoBottom()
		},
		coming: function(msg){
			var name = msg.name;
			var span = $('<span></span>').text(name);
				p = $('<p class="danmutext danmuenter"></p>').text('进来喽~').prepend(span);
			danmuwrap.append(p);
			this.scrolltoBottom()
		},
		disconnect: function(){
			$('#danmuform').addClass('disconnect');
			$('#emitarea').attr('placeholder', '');
		},
		scrolltoBottom: function(){
			var showdanmu = $('.showdanmu');
			 var height = danmuwrap.height();
			 var _scrollTop = height - showdanmu.height();
			 showdanmu.scrollTop(_scrollTop+10)
		}
	}

	/* 功能 */
	$('#danmufont').click(function(){
		var danmufontarea = $('#danmufontarea');
		if(danmufontarea.hasClass('show')){
			danmufontarea.removeClass('show');
		} else {
			danmufontarea.addClass('show');
		}
	});
	$('.danmucolor').each(function(index, item){
		$(item).click(function(){
			if(!$(this).hasClass('selected')){
				$('.selected').removeClass('selected');
				$(this).addClass('selected');
			}
		})
		
	})
})