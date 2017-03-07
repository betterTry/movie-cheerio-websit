//类型控制
$('.cate>span').each(function(index , item){
	//切换种类;
	$(item).click(function(){
		btm('cate' , index);//移动选项underline;
		$('.catebtn').css('display' , 'none');
		$('.cate>span').removeClass('cated');
		$(this).addClass('cated');
		$(item).find('.catebtn').css('display',  'block');
		$('.c_listbox').each(function(i , item){
			if(i == index){
				$(item).css('display' , 'block');
			}
			else{
				$(item).css('display' , 'none');
			}
		})
	})
});//切换种类;
$('.cateadd').click(function(){
	//添加种类的区域;
	$('.addCateBox').css('display' , 'block');
	if(!$('.nocatelist').find('li').length){
		$.ajax({
			url : '/search/category/nocate',
			cache: true,
			success: function(results){
				if(results.length){
					$('.nocateinfo').css('display', 'none');
					var nocatelist = $('.nocatelist');

					$.each(results, function(index , item){
						var li = $('<li></li>').data('id' , item._id)
												.text(item.name)
												.append($('<span>添加</span>'))
												.appendTo(nocatelist);
					})
					//添加cate movie;
					$('.nocatelist span').each(function(index , item){
						$(item).click(function(){
							$.ajax({
								url : '/category/addMovie',
								method: 'POST',
								data: {
									id: $(this).parent().data('id'),
									cateid : $('.cate>.cated').data('cateid')
								},
								success: function(results){
									if(results.success){
										$(item).parent().remove();
										if(!$('.addCateBox').hasClass('uploaded'))
											$('.addCateBox').addClass('uploaded');
									}
								}
							})
						})
					})
				}
				else{
					$('.nocateinfo').css('display', 'block');
				}
			}
		})
	}
});
$('.catecho').each(function(index , item){
	//种类电影选择;
	$(item).click(function(){
		var c_item = $('.c_listbox').eq(index).find('.c_item');//获取到当前种类的电影;
		if(c_item.length){
			//如果当前种类有电影;
			if($(this).hasClass('on')){
				$(this).removeClass('on');
				c_item.removeClass('choosed');
				c_item.unbind('click');
			}
			else{
				$(this).addClass('on');
				c_item.eq(0).addClass('choosed');
				c_item.each(function(index, item){
					$(item).click(function(){
						if($(this).hasClass('choosed'))
							$(this).removeClass('choosed')
						else
							$(this).addClass('choosed');
					})
				})
				$(window).click(function(e){
					//取消选择;
					var c_listbox = $('.c_listbox').eq(index);
					var size = getWandH(c_listbox[0]);
					var pos = getPos(e);
					var w = size.w , h = size.h;
					var x = pos.x , y = pos.y;
					var _w = c_listbox.width() , _h = c_listbox.height();
					if((x < w || x > w + _w || y < h || y > h + _h) && e.target !== item){
						$('.catecho').removeClass('on');
						c_item.removeClass('choosed');
						c_item.unbind('click');
						$(window).unbind('click');//执行一次之后解除绑定;
					}
				});//如果在选择了之后鼠标点击了moviebox之外的区域，就取消本次选择;
			}
		}
	})
})//种类电影选择结束;

$('.catedel').each(function(index, item){
	//种类电影删除;
	$(item).click(function(){
		$('.addMovieBox').css('display' , 'none');
		var choosed = $('.c_list').eq(index).find('.choosed');//choosed的数量;
		if(choosed.length){
			var name = [];
			var cate = $('.cate>span').eq(index).data('cateid');
			choosed.each(function(index, item){
				name.push($(item).find('h5').text());
			})
			if($('.catecho').hasClass('on')){
				$.ajax({
					url: '/admin/movie/delete',
					method : 'POST',
					data: {
						name: name,
						cate: cate
					},
					success: function(results){
						console.log(results)
						if(results.success){
							location.reload(true);
						}
					}
				})
			}
		}
	})
})//种类电影删除;
$('.closeacb').click(function(){
	//关闭添加种类的区域;
	var addCateBox = $('.addCateBox');
	addCateBox.css('display' , 'none');
	if(addCateBox.hasClass('uploaded')){
		location.reload();
		addCateBox.removeClass('uploaded');
	}
})//关闭添加种类的区域;


/*
 * 分页
 */
void function(){
	var front = $('.front'),
		next = $('.next');
	if(front.length){
		front.each(function(index, item){
			//每一个front点击的时候;
			$(item).click(function(){
				var _self = $(this);
				var active = parseInt($(this).nextAll('.active').text());
				var page = active - 1;
				if(page){
					var cate = $('.cated').data('cateid');

					getCatePage(page , cate , index, function(){
						if(page == 1) {
							var _next = $('.next').eq(index)
							if(_next.hasClass('disabled')){
								_next.removeClass('disabled');
								_self.addClass('disabled');
							}
						}
						else{
							if(_self.hasClass('disabled'))
								_self.removeClass('disabled');
						}
					});
				}
				
			})
		});
		next.each(function(index, item){
			$(item).click(function(){
				var _self = $(this);
				var active = parseInt($(this).prevAll('.active').text());
				var length = $(this).prevUntil('.front').length;
				var page = active + 1;
				if(page <= length){
					var cate = $('.cated').data('cateid');

					getCatePage(page , cate , index, function(){
						if(page == length) {
							var _front = $('.front').eq(index);
							if(_front.hasClass('disabled')){
								_front.removeClass('disabled');
								_self.addClass('disabled')
							}
						}
						else{
							if(_self.hasClass('disabled')){
								_self.removeClass('disabled');
							}
						}
					})
				}
			})
		});
	}
}()

/*
 * 拿到cate每一页
 * @params page: 页数; cate: cateid ; index: 当前pagination;
 */
function getCatePage(page, cate , index , cb){
	$.ajax({
		url: '/search/cate/page?page=' + page + '&cate=' + cate,
		success: function(results){
			if(results){
				if(results.success){
					var movie = results.movie;
					var pagination = $('.pagination').eq(index)
					var th = pagination.find('.th');
					var c_list = pagination.prev();


					c_list.remove();

					var c_list = $('<div class="c_list clearfix"></div>');
					for(var i = 0 ; i < movie.length ; i++){
						var img = $('<img src="'+ movie[i].poster +'"/>');
						var h5 = $('<h5>' + movie[i].name + '</h5>');
						var p = $('<p>播放次数：（未上线）</p>');
						var m_item = $('<div class="c_item"></div>')
										.append(img)
										.append(h5)
										.append(p)
										.appendTo(m_list);
					}
					pagination.before(c_list);
					//更改 pagination 选中模式; 以及前后的disabled状态
					pagination.find('.active').removeClass('active');
					th.eq(page - 1).addClass('active');


					cb && cb();
					
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
