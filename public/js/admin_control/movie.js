//电影控制

/* 
 * 电影筛选;
 */
$('.m_sortbox').mouseover(function(){
	$('.m_sort').addClass('m_show');
})
$('.m_sortbox').mouseout(function(e){
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
	var x = e.pageX || e.clientX + scrollX , y = e.pageY || e.clientY + scrollY;
	var w = getWandH(this).w , h = getWandH(this).h;
	var _w = $(this).outerWidth() , _h = $(this).outerHeight();
	if(x > w && x < w+_w && y > h && y < h+_h){}
	else{
		$('.m_sort').removeClass('m_show');
	}
});

/*
 * 电影录入框
 */
$('.addbtn').click(function(){
	$('.addMovieBox').css('display' , 'block');
});
/*
 * 电影删除 
 */
$('.delbtn').click(function(){
	$('.addMovieBox').css('display' , 'none');
	//如果选的有值;
	if($('.m_list .choosed').length){
		var name = [];
		$('.m_list .choosed').each(function(index, item){
			name.push($(item).find('h5').text())
		})
		if($('.chobtn').hasClass('on')){
			$.ajax({
				url : '/admin/movie/delete',
				method : 'POST',
				data:{
					name : name,
					cate : '电影'
				},
				success: function(results){
					if(results.success){
						location.reload(true);					
					}
					else{
						console.log('delete err')
					}
				}
			})
		}
	}
});//删除电影;

/*
 * 关闭电影录入框
 */
$('.closeBtn').click(function(){
	var addMovieBox = $('.addMovieBox');
	if(addMovieBox.hasClass('uploaded')){
		location.reload();
		addMovieBox.removeClass('uploaded');
	}
	addMovieBox.css('display' , 'none');
});
/*
 * 电影选择按钮
 */
$('.chobtn').click(function(){
	if($(this).hasClass('on')){
		var m_list = $('.m_item');
		$(this).removeClass('on');
		m_list.removeClass('choosed');
		m_list.unbind('click');//解除绑定的click事件;
	}
	else{
		$(this).addClass('on');
		var m_item = $('.m_item');
		m_item.eq(0).addClass('choosed');
		m_item.each(function(index, item){
			$(item).click(function(){
				if($(this).hasClass('choosed'))
					$(this).removeClass('choosed')
				else
					$(this).addClass('choosed');
			})
		})
		$(window).click(function(e){
			//取消选择;
			var moviebox = $('.moviebox');
			var size = getWandH(moviebox[0]);
			var pos = getPos(e);
			var w = size.w , h = size.h;
			var x = pos.x , y = pos.y;
			var _w = moviebox.width() , _h = moviebox.height();
			if(x < w || x > w + _w || y < h || y > h + _h){
				$('.chobtn').removeClass('on');
				m_item.removeClass('choosed');
				m_item.unbind('click');
				$(window).unbind('click');//执行一次之后解除绑定;
			}
		});//如果在选择了之后鼠标店家了moviebox之外的区域，就取消本次选择;
	}
});

/* 
 * 前进和后退
 */
void function(){
	var length = $('.pagination .th').length;
	var front = $('#front'),
		next = $('#next');
	if(front.length){
		$('#front').click(function(){
			var active = parseInt($('.pagination .active').text());
			var page = active - 1;
			if(page){
				getPage(page);
			}
		})
		$('#next').click(function(){
			var active = parseInt($('.pagination .active').text());
			var page = active + 1;
			if(page <= length ){
				getPage(page);
			}
		})
	}

}();

// 换页
window.onhashchange = function(){
	var hash = window.location.hash.replace(/#page/,'');
	if(hash && !/#+/.test(hash)){//当哈希存在时
		getPage(parseInt(hash));

		var chobtn = $('.chobtn');
		if(chobtn.hasClass('on')){
			chobtn.removeClass('on');
		}
	}
}

/*
 * 拿到页面
 * @param page:页面数
 */
function getPage(page){
	$.ajax({
		url: '/search/movie/page?page=' + page,
		success: function(results){
			if(results){
				if(results.success){
					var movie = results.movie;
					var th = $('.pagination .th');

					$('.m_list').remove();

					var m_list = $('<div class="m_list clearfix"></div>');
					for(var i = 0 ; i < movie.length ; i++){
						var img = $('<img src="'+ movie[i].poster +'"/>');
						var h5 = $('<h5>' + movie[i].name + '</h5>');
						var p = $('<p>播放次数：（未上线）</p>');
						var m_item = $('<div class="m_item"></div>')
										.append(img)
										.append(h5)
										.append(p)
										.appendTo(m_list);
					}
					$('.m_sort').after(m_list);
					//更改 pagination 选中模式; 以及前后的disabled状态
					$('.pagination .active').removeClass('active');
					th.eq(page - 1).addClass('active');

					var disabled = $('.pagination .disabled');
					if(page == 1 || page == th.length){
						var front = $('#front'),
							next = $('#next');
						if(page == 1){
							front.addClass('disabled');
							if(next.hasClass('disabled'))
								next.removeClass('disabled');
						}
						else{
							next.addClass('disabled');
							if(front.hasClass('disabled'))
								front.removeClass('disabled');
						}
					}
					else{
						if(disabled)
							disabled.removeClass('disabled');
					}
				}
				else{
					console.log('get page err')
				}
			}
		},
		error: function(err){
			console.log('get page err')
		}
	})
}

/*
 * 查找电影
 */
$('#s_btn').click(function(){
	//输入的不是空格就查询;
	if(!/^\s*$/.test($('#s_movie').val())){
		$.ajax({
			url: '/admin/search/' + $('#s_movie').val(),
			cache: true,
			beforeSend: function(){
				$('.loading').addClass('rotate');
			},
			success: function(results){
				$('.s_dir').remove();
				$('.loading').removeClass('rotate');
				if(results.length){
					$.each(results , function(index,  item){
						var _s_des = item.s_info.s_collect || '导演：'+item.s_info.s_direct;
						var s_name = $('<h5 class="s_name"></h5>').text(item.name);
						var s_des = $('<p class="s_des"></p>').text(_s_des);
						var s_area = $('<p class="s_area"></p>').text('地区：'+item.s_info.s_area);
						var s_figure_type = item.s_info.s_figure_type;
						var length = item.s_info.s_figure.length;
						var _s_figure = s_figure_type + '：';
						var s_add = $('<span class="s_add"><a>录入</a></span>')
						for(var i = 0 ; i < length ; i++){
							_s_figure += item.s_info.s_figure[i];
							if(i !== length-1)
								_s_figure += '/'
						}
						var s_figure = $('<p class="s_figure"></p>').text(_s_figure);
						var sInfo = $('<div class="sInfo"></div>')
											.append(s_name)
											.append(s_des)
											.append(s_area)
											.append(s_figure)
											.append(s_add);
						var img = $('<img>').attr('src' , item.poster);
						var searchRe = $('.searchRe');
						var s_update = $('<p class="s_update" style="display:none"></p>').text(JSON.stringify(item));
						var s_dir = $('<div class="s_dir clearfix"></div>')
											.append(img)
											.append(sInfo)
											.append(s_update)
											.appendTo(searchRe);
						
						var addMovieBox = $('.addMovieBox');
						//添加电影;
						s_add.click(function(){
							$.ajax({
								url : '/admin/movie/upload',
								method : 'POST',
								data : item,
								success : function(result){
									if(result.success){
										$('.addState').addClass('suc');

										if(!addMovieBox.hasClass('uploaded')){
											addMovieBox.addClass('uploaded');
										}
										setTimeout(function(){
											$('.addState').removeClass('suc');
										},1000);
									}
									else{
										$('.addState').css('display' , 'block');
										setTimeout(function(){
											$('.addState').css('display' , 'none');
										},1000);
									}
								}
							})
						})
					})
				}
			},
			error: function(){
				console.log('未查询到结果');
			}
		})
	}
});//查询电影结束