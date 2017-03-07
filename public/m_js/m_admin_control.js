$(function(){
	$('.slider_nav > li').each(function(index , item){
		//slide_nav的选择效果;
		$(item).click(function(){
			$('.slider_nav > li').removeClass('active');
			$(this).addClass('active');
			$('.something > div').each(function(i , elem){
				if(i == index){
					$(elem).css('display' , 'block');
				}
				else{
					$(elem).css('display' , 'none');
				}
			})
		})
	});
		
		
	//用户控制	
	$('.user').click(function(e){
	//获取普通用户信息
		if(!$('.userbox .norUrow').length){
			$.ajax({
				url : '/search/user/all',
				cache: true,
				success : function(results){
					var _userAll = results.userAll;
					var _userAdm = results.userAdm;
					var all = [];
					var adm = [];
					$.each(_userAll , function(index , item){
						var norUcell = $('<div class="norUcell"></div>');
						var Uname = $('<em class="Uname">' + item + '</em>').appendTo(norUcell);
						var Udel = $('<em class="Udel">注销</em>').appendTo(norUcell);
						all.push(norUcell);
						Udel.click(function(){
							//注销用户事件;
							$.ajax({
								url : '/user/delete?user=' + item,
								method : 'DELETE',
								success: function(results){
									if(results){
										if(results.success){
											$('.userbox .norUrow').remove();
											$('.user').click();
										}
										else if(results.success == 0){

										}
									}
								}
							})
						})
					})
					$.each(_userAdm , function(index , item){
						var norUcell = $('<div class="norUcell"></div>');
						var Uname = $('<em class="Uname">' + item + '</em>').appendTo(norUcell);
						var Udel = $('<em class="Udel">注销</em>').appendTo(norUcell);
						adm.push(norUcell);
					})
					var alllen = all.length;
					var admlen = adm.length;
					for(var i = 0 ;i < alllen ; i++) {
						if(i % 2 == 0 && i != 0){
							var norUrow = $('<div class="norUrow"></div>')
												.append(all[i - 2])
												.append(all[i - 1])
												.appendTo($('.norUbody'));
							if(i == alllen - 1){
								var norUrow = $('<div class="norUrow"></div>')
													.append(all[i])
													.appendTo($('.norUbody'));
							}
						}
						else if(i == alllen - 1){
							var norUrow = $('<div class="norUrow"></div>')
													.append(all[i-1])
													.append(all[i])
													.appendTo($('.norUbody'));
						}
					}
					for(var i = 0 ; i < admlen ; i++){
						if(i % 2 == 0 && i != 0){
							var norUrow = $('<div class="norUrow"></div>')
												.append(adm[i - 2])
												.append(adm[i - 1])
												.appendTo($('.adminUbody'));
							if(i == admlen - 1){
								var norUrow = $('<div class="norUrow"></div>')
													.append(adm[i])
													.appendTo($('.adminUbody'));
							}
						}
						else if(i == admlen - 1){
							var norUrow = $('<div class="norUrow"></div>')
													.append(adm[i-1])
													.append(adm[i])
													.appendTo($('.adminUbody'));
						}
					}
				},
				error : function(){
					console.log('err')
				}
			})
		}
	});//点击查询用户;
	$('.nordels').click(function(e){
		//批量删除用户;
		if($(this).hasClass('ondels')){
			var name = [];
			var choosed = $('.norUbody .choosed');
			choosed.each(function(index , item){
				name.push($(item).find('.Uname').text())
			})
			$(this).text('批量删除').removeClass('ondels');
			$('.norUcell').each(function(index,  item){
				$(item).unbind('click');
			})
			if(choosed.length){
				$.ajax({
					url : '/user/delete/',
					data: {
						name : name
					},
					method : 'POST',
					success: function(results){
						if(results){
							if(results.success){
								$('.userbox .norUrow').remove();
								$('.user').click();
							}
							else if(results.success == 0){

							}
						}
					}
				});
			}
		}
		else{
			$(this).text('确认删除？').addClass('ondels');
			$('.norUcell').eq(0).addClass('choosed')
			$('.norUcell').each(function(index,  item){
				$(item).click(function(){
					if($(this).hasClass('choosed'))
						$(this).removeClass('choosed');
					else
						$(this).addClass('choosed');
				})
			})
		}
	})//批量删除用户结束;
,
	$('.usercate>span').each(function(index , item){
		$(item).click(function(){
			if($(this).hasClass('norU')){
				$('.nordels').css('display', 'block');
				$('.admAdd').css('display' , 'none');
			}
			else{
				$('.nordels').css('display' , 'none');
				$('.admAdd').css('display' , 'block');
			}
			btm('usercate' , index);
			$('.Ulist').each(function(i , item){
				if(i == index){
					$(item).css('display' , 'table');
				}
				else{
					$(item).css('display' , 'none');
				}
			})
		})
	});//切换普通用户和管理员;

	//类型控制
	$('.cate>span').each(function(index , item){
		//切换种类;
		$(item).click(function(){
			btm('cate' , index);//移动选项underline;
			$('.catebtn').css('display' , 'none');
			$('.cate>span').removeClass('cated');
			$(this).addClass('cated');
			$(item).find('.catebtn').css('display',  'block');
			$('.c_list').each(function(i , item){
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
			var c_item = $('.c_list').eq(index).find('.c_item');//获取到当前种类的电影;
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
						console.log(e)
						//取消选择;
						var c_list = $('.c_list').eq(index);
						var size = getWandH(c_list[0]);
						var pos = getPos(e);
						var w = size.w , h = size.h;
						var x = pos.x , y = pos.y;
						var _w = c_list.width() , _h = c_list.height();
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
				var cate = $('.cate>span').eq(index).text().trim();
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
						},success: function(results){
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



	//电影控制
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
	$('.addbtn').click(function(){
		$('.addMovieBox').css('display' , 'block');
	});
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
					}
				})
			}
		}
	});//删除电影;

	$('.closeBtn').click(function(){
		$('.addMovieBox').css('display' , 'none');
	});
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
	
	$('.th').click(function(){
		
	})

	//查找movie
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
							
							s_add.click(function(){
								$.ajax({
									url : '/admin/movie/upload',
									method : 'POST',
									data : item,
									success : function(result){
										if(result.success){
											$('.addState').addClass('suc');
											setTimeout(function(){
												$('.addState').removeClass('suc');
											},500);
										}
										else{
											$('.addState').css('display' , 'block');
											setTimeout(function(){
												$('.addState').css('display' , 'none');
											},500);
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

})


//功能函数
function btm(elm , index){
	$('.'+elm+' .btm').css({'-webkit-transform' : 'translateX(' + index*60 + 'px)',
					'-moz-transform' : 'translateX(' + index*60 + 'px)',
					'-ms-transform' : 'translateX(' + index*60 + 'px)',
					'transform: ' : 'translateX(' + index*60 + 'px)'})
}
function getWandH(elem){
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
	var w = 0 , h = 0;
	do{
		w += elem.offsetLeft;
		h += elem.offsetTop;
	}
	while((elem = elem.offsetParent) && elem.tagName !== 'BODY' )
	return {w: w + scrollX , h: h + scrollY}
}

