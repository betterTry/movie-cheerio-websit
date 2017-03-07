$(function(){
	$('#siusername').blur(function(){
		//登录用户名验证
		var username = $(this).val();
	});
	$('#sipassword').blur(function(){
		//登录密码验证
		var password = $(this).val();
	});
	$('#su_username').blur(function(){
		//注册用户名验证
		checkUsername()
	});
	$('#su_password').blur(function(){
		//注册密码验证
		checkPassword()
	});
	$('#su_password').focus(function(){
		checkUserNull();
	});
	$('#su_passwordCopy').blur(function(){
		checkCopy();
	});
	$('#su_passwordCopy').focus(function(){
		checkUserNull();
	});
	$('#btn_su').click(function(e){
		//提交注册按钮
		if(checkUsername()){
			if(checkPassword()){
				if(checkCopy()){
					if(checkbox()){
						$.ajax({
							url : '/user/signup',
							cache : false,
							method : 'POST',
							data : {
								username: $('#su_username').val(),
								password: $('#su_password').val(),
								path: $('.inphd').val()
							},
							success : function(result , status){
								if(result == 'failed'){
									$('.sutip').css('display','block');
									setTimeout(function(){
										$('.sutip').css('display','none');
									},1000)
								}
								else if(result == 'success'){
									location.href = $('.inphd').val();
								}
							},
							error : function(){
								$('.sutip').css('display','block');
								setTimeout(function(){
									$('.sutip').css('display','none');
								},1000)
							}
						})
					}
					else{
						console.log(false)
						$('#protocollabel').focus();
					}
				}
				else{
					$('#su_passwordCopy').focus();
				}
			}
			else{
				$('#su_password').focus();
			}
		}
		else{
			$('#su_username').focus();
		}
	});

	$('#btn_si').click(function(e){
		//提交登录按钮
		if(sicheckUsername()){
			if(sicheckPassword()){
				$.ajax({
					url: '/user/signin',
					cache : false,
					method: 'POST',
					data: {
						username: $('#si_username').val(),
						password: $('#si_password').val(),
						path: $('.inphd').val()
					},
					success: function(result){
						if(result == 'failed'){
							$('.sitip .tiptxt').text('用户名或密码错误')
							$('.sitip').css('display','block');
							setTimeout(function(){
								$('.sitip').css('display','none');
							},1000)
						}
						else if(result == 'none'){
							$('.sitip .tiptxt').text('该用户名尚未注册');
							$('.sitip').css('display' , 'block');
							setTimeout(function(){
								$('.sitip').css('display', 'none');
							},1000)
						}
						else if(result == 'success'){
							location.href = $('.inphd').val();
						}
					},
					error: function(){
						$('.sitip .tiptxt').text('登录失败请重试');
						$('.sitip').css('display' , 'block');
						setTimeout(function(){
							$('.sitip').css('display' , 'none');
						},1000)
					}
				})
			}
			else{
				$('#si_password').focus();
				$('#si_password').blur(function(){
					sicheckPassword();
				})
			}
		}
		else{
			$('#si_username').focus();
			$('#si_username').blur(function(){
				sicheckUsername();
			})
		}
	})

})

function checkUsername(){
	var username = $('#su_username').val();
	var length = username.length;
	// \u2E80-\uFE4F 可以扩展字符
	if(/^[\u4e00-\u9f45\w]{6,15}$/.test(username)){
		$('.suinfo_user').addClass('p_hidden').text("");
		return true;
	}
	else if(length > 15){
		$('.suinfo_user').text('用户名不能超过15个长度')
						.removeClass('p_hidden');
		return false;
	}
	else if(length < 6){
		$('.suinfo_user').text('用户名不能少于6个长度')
						.removeClass('p_hidden');
		return false;
	}
	else{
		$('.suinfo_user').text('用户名中含有非法字符')
						.removeClass('p_hidden');
		return false;
	}
}

function checkPassword(){
	
	var password = $('#su_password').val();
	var length = password.length;
	if(/^(?=.*?[a-zA-Z])(?=.*?[0-9])\S{6,20}$/.test(password)){
		$('.suinfo_code').addClass('p_hidden').text("");
		return true;
	}
	else if(length > 20){
		$('.suinfo_code').text('密码不能超过20个长度')
						.removeClass('p_hidden');
		return false;
	}
	else if(length < 6){
		$('.suinfo_code').text('密码不能少于6个长度')
						.removeClass('p_hidden');
		return false;
	}
	else{
		$('.suinfo_code').text('密码中必须包含数字和字母')
						.removeClass('p_hidden');
		return false;
	}
}

function checkCopy(){
	var su_passwordCopy = $('#su_passwordCopy').val();
	var su_password = $('#su_password').val();
	if(su_passwordCopy === su_password){
		$('.suinfo_copy').text('').addClass('p_hidden');
		return true;
	}
	else{
		$('.suinfo_copy').text('与上面密码不相等')
						.removeClass('p_hidden');
		return false;
	}
}

function checkUserNull(){
	if(!$('#su_username').val()){
		$('.suinfo_user').text('用户名不能为空')
						.removeClass('p_hidden');
		return false;
	}
}

function checkbox(){
	return document.getElementById('protocol').checked;
}

/* sign in*/
function sicheckUsername(){
	var si_username = $('#si_username').val();
	var length = si_username.length;
	if(length > 15){
		$('.siinfo_user').text('用户名过长').removeClass('p_hidden');
		return false;
	}
	else if(length < 6 && !/^(ysl|mxy)$/.test(si_username)){
		$('.siinfo_user').text('用户名过短').removeClass('p_hidden');
		return false;
	}
	else{
		$('.siinfo_user').text('').addClass('p_hidden');
		return true;
	}
}

function sicheckPassword(){
	var si_password = $('#si_password').val();
	var length = si_password.length;
	if(length > 20){
		$('.siinfo_code').text('密码过长').removeClass('p_hidden');
		return false;
	}
	else if(length < 6 && $('#si_username').val() !== 'ysl'){
		$('.siinfo_code').text('密码过短').removeClass('p_hidden');
		return false;
	}
	else{
		$('.siinfo_code').text('').addClass('p_hidden');
		return true;
	}
}