
//功能函数
function btm(elm , index){
	$('.'+elm+' .btm').css({'-webkit-transform' : 'translateX(' + index*80 + 'px)',
					'-moz-transform' : 'translateX(' + index*80 + 'px)',
					'-ms-transform' : 'translateX(' + index*80 + 'px)',
					'transform: ' : 'translateX(' + index*80 + 'px)'})
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

