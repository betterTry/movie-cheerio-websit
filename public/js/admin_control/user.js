//用户控制;


/* 
 * 用户删除按钮
 */
$('.nordels').click(function(e){
	//批量删除用户,如果此时为删除状态;
	var norUcell = $('.norUcell');
	var norUlist = $('.norUlist');
	if(norUlist.hasClass('ondels')){
		var name = [];
		var choosed = $('.norUbody .choosed');
		choosed.each(function(index , item){
			name.push($(item).find('.Uname').text())
		})
		$(this).text('批量删除').removeClass('.ondel');
		norUlist.removeClass('ondels');
		$('.norcancel').css('display', 'none');
		norUcell.each(function(index,  item){
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
	else {//如果不是删除状态;
		$(this).text('确认删除？').addClass('ondel');
		norUlist.addClass('ondels');
		$('.norcancel').css('display', 'block');
		norUcell.eq(0).addClass('choosed');
		norUcell.each(function(index,  item){
			$(item).click(function(){
				if($(this).hasClass('choosed'))
					$(this).removeClass('choosed');
				else
					$(this).addClass('choosed');
			})
		})
	}
})//批量删除用户结束;

$('.norcancel').click(function(){
	$('.nordels').text('批量删除').removeClass('ondel');
	$('.norUlist').removeClass('ondels');
	$('.norUcell').each(function(index,  item){
		$(item).unbind('click');
	})
	$('.choosed').removeClass('choosed');
	$(this).css('display', 'none');
})

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