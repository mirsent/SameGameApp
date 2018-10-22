var url = 'http://samegame.ineinv.com/index.php/Home/';

(function($, owner) {
	
	/**
	 * 用户验证
	 **/
	owner.check = function(memberInfo, callback) {
		callback = callback || $.noop;
		memberInfo = memberInfo || {};
		memberInfo.mail = memberInfo.mail || '';
		if (!checkEmail(memberInfo.mail)) {
			return callback('邮箱地址不合法');
		}
		// 验证邮箱
		mui.post(url+'Login/check_email',{
				mail: memberInfo.mail
			},function(data){
				if (data.status == 1) {
					return callback(1); // 已注册
				} else {
					return callback(2); // 未注册
				}
			},'json'
		);
	};
	
	var checkEmail = function(mail) {
		mail = mail || '';
		var pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	    var domains= [
	    	"qq.com",
			"outlook.com",
	    	"163.com",
	    	"vip.163.com",
			"126.com",
	    	"263.net",
	    	"yeah.net",
	    	"sohu.com",
	    	"sina.cn",
	    	"sina.com",
	    	"eyou.com",
	    	"gmail.com",
	    	"hotmail.com",
	    	"42du.cn"
	    ];
	    if(pattern.test(mail)) {
	        var domain = mail.substring(mail.indexOf("@")+1);
	        for(var i = 0; i< domains.length; i++) {
	            if(domain == domains[i]) {
	                return true;
	            }
	        }
	    }
	    return false;
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.mail = regInfo.mail || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.password.length < 6 || regInfo.password.length > 18) {
			return callback('密码长度在6至18位之间');
		}
		
		mui.post(url+'Login/register',{
				mail: regInfo.mail,
				password: regInfo.password
			},function(data){
				if (data.status == 1) {
					return callback(1); // 注册成功
				} else {
					return callback('注册失败,请稍后重试'); // 注册失败
				}
			},'json'
		);
	};
	
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.mail = loginInfo.mail || '';
		loginInfo.password = loginInfo.password || '';
		
		mui.post(url+'Login/login',{
				mail: loginInfo.mail,
				password: loginInfo.password
			},function(data){
				if (data.status == 1) {
					// 会员信息存入缓存
					plus.storage.setItem('member_id', data.data.id);
					plus.storage.setItem('member_name', data.data.member_name);
					console.log('会员信息', JSON.stringify(data.data))
					return callback(1); // 登录成功
				} else {
					return callback('密码错误');
				}
			},'json'
		);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));