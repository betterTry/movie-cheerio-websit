$(function(){
	$('.sign').keydown(function(e){
		var length = $(this).val().length;
		if(length >= 30 && e.keyCode != 8){
			$('.signinfo').addClass('more');
			return false;
		}
		if(length >= 30 && e.keyCode == 8){
			$('.signinfo').removeClass('more');
		}
		// $(this).val().match(/[\u4e00-\u9fa5]+/g).forEach(function(item){
		//		clen += item.length 
		//})
		// if(length >= 50 && clen >= 30)
	})
	$('.navlist>li').each(function(index , item){
		$(item).click(function(){
			width = $(this).width();
			$('.underline').css('-webkit-transform' , 'translateX(' + index * width + 'px)')
		})
	})
})
