var testjinche = "liujinchen";
var vjcFun = {
	/** 
	 * 调用Js
	 * @date 2019/08/26
	 * @param {string} basepath
	 * @return null 无返回值 
	 */
	isdebug: vjc_config.debugerFlag,
	RemoteHost: vjc_config.RemoteHost,
	loadcss: function(basepath) {
		var maxLength = vjc_config.requireCss.length;
		for (var i = 0; i < (maxLength); i++) {
			var fileref = document.createElement("link")
			fileref.setAttribute("rel", "stylesheet")
			fileref.setAttribute("type", "text/css")
			fileref.setAttribute("href", basepath + vjc_config.requireCss[i]);
			document.getElementsByTagName("head")[0].appendChild(fileref);
		}
	},
	loadjs: function(basepath) {
		var maxLength = requireJs.length;
		for (var i = 0; i < (maxLength); i++) {
			var tempv = requireJs[i];
			var scripturl = basepath + tempv;
			if (
				tempv.indexOf("http://") > -1 ||
				tempv.indexOf("https://") > -1) {
				scripturl = tempv;
			}
			document.write('<script src="' + scripturl + '" type="text/javascript" charset="utf-8"></script>');
		}
	},
	/**
	 * 获取当前设备网络环境
	 */
	getNetWorkState: function getNetWorkState() {
		var NetStateStr = '未知';
		var types = {};
		types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
		types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
		types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
		types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
		types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
		types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
		types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";
		NetStateStr = types[plus.networkinfo.getCurrentType()];
		return NetStateStr; //=== "未知" || NetStateStr === "未连接网络" ? false : true;
	},
	DealAjaxResult: function DealAjaxResult(apiurl, service, result, okFun) {
		if (service.flag) {
			vjcFun.closeWait();
		}
		if (typeof okFun == "function"){
			if(vjc_config.debugerMode){
				console.log("请求接口回调的结果:" + apiurl);
				console.log(JSON.stringify(result));
			}
			result.apiurl = service.url;
			okFun(result);
		}
	},
	/**
	 * 错误处理函数 刷新或重试	 
	 * @date 2019/08/26
	 * @param id
	 * @param id
	 */
	DealError: function DealError(id, flag) {
		if (flag) {
			vjcFun.closeWait();
		} else {
			// mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
			// mui('#pullrefresh').pullRefresh().refresh(true);
			// mui('#pullrefresh').pullRefresh().endPullupToRefresh();
		}
		if (id) {
			document.querySelector("#" + id).innerHTML = "连接出错,<a id='reloadPage' href='javascript:void(0)' >点击重试</a>";
			mui("#" + id).on('tap', "#reloadPage", function() {
				mui('#pullrefresh').pullRefresh().pulldownLoading();
			});
		} else {
			mui.toast("网络失去联系,可以稍后再试");
		}
	},
	/**
	 * 全局Ajax函数
	 * id为刷新触发元素，flag为是否显示加载中》。。
	 * @service obj {checkupdate是否检查更新,path目录路径,url接口名}
	 * @serviceApi{url,method, //HTTP请求类型,data,dataType,timeout,checkupdate}
	 */
	vjmuiAjax: function vjmuiAjax(service, callBack, errdo) {
		var appDebug = localStorageUtils.getParam("MEMBER_appDebug") || '0';
		var LocalDicVer = localStorageUtils.getParam("LocalDicVer") || 1; //获取用户字典版本
		var token = localStorageUtils.getParam("MEMBER_TOKEN") || '';
		var Terminalsource = '';
		var getMember = member.getMember();
		var CurrentOrgID = 0,
			CurrentDepartmentID = 0,
			CurrentLearningStageID = 0;
		var ajaxheaders = {
			//'Content-Type': 'application/json;charset=utf-8',
			Terminalsource: 'app',
			token: localStorageUtils.getParam("MEMBER_TOKEN") || ''
		}
		if (getMember) {
			ajaxheaders.CurrentOrgID = getMember.CurrentOrgID || 0;
			ajaxheaders.CurrentDepartmentID = getMember.CurrentDepartmentID || 0;
			ajaxheaders.CurrentLearningStageID = 1 //getMember.LearningStageID||0;
		}
		var checkupdate = service.checkupdate || false;
		if (vjc_config.debugerMock||service.isdebuger){
			vjc_config.RemoteHost.apiurl = vjc_config.DebugHost.hostList[0];
			console.log("模拟接口调用" + vjc_config.RemoteHost.apiurl);
		}
		//获取当前网络状态
		if (!vjcFun.getNetWorkState()) {
			mui.toast('似乎已断开与互联网的连接');
			return false;
		}
		//false  是否使用上拉下拉
		var apiurl = vjc_config.RemoteHost.appUrl + service.url;
		if (vjc_config.debugerMock||service.isdebuger) { //本地模拟数据
			apiurl = vjc_config.DebugHost.appUrl + service.apiName + '.json?' + (new Date()).valueOf();
			console.log('apiurl'+apiurl);
		}
		if(vjc_config.debugerMode)console.info("统一请求");
		if(vjc_config.debugerMode)console.log("需要请求的服务器路径：" + apiurl);
		if(vjc_config.debugerMode)console.log("请求的参数：" + JSON.stringify(service));
		if(vjc_config.debugerMode)console.log("token：" + token);
		if(vjc_config.debugerMode)console.log("当前版本：" + LocalDicVer);
		if(vjc_config.debugerMode)console.groupEnd();
		if (service.flag) {
			plus.nativeUI.showWaiting("加载中...");
		}
		try {
			if (vjc_config.debugerMock) {
				service.method = 'get'
			}
			if(vjc_config.debugerMode)console.log(JSON.stringify(ajaxheaders));
			mui.ajax({
				url: apiurl,
				type: service.method, //HTTP请求类型
				headers: ajaxheaders,
				data: service.data,
				dataType: service.dataType || 'json', //服务器返回json格式数据
				timeout: 5000, //超时时间设置为5秒钟；
				success: function success(result) {
					console.log(result);
					if (result.code == '901') { //身份验证失败
						mui.toast("用户认证失败,请重新登录！");
						vjcFun.clearStorage('Auth');
						plus.runtime.restart();
					}
					if (checkupdate) {
						if (result.apiver > LocalDicVer) {
							if(vjc_config.debugerMode)console.log(JSON.stringify(result));
							if(vjc_config.debugerMode)console.log("api触发更新的接口:" + apiurl);
							if(vjc_config.debugerMode)console.log('接口版本：' + result.apiver + '，本地当前版本：' + LocalDicVer);
							if(vjc_config.debugerMode)console.log('api触发更新' + result.apiver + ':' + LocalDicVer);
							DicUpdate.init(function(UpdateList) {
								if(vjc_config.debugerMode)console.log('api更新内容' + JSON.stringify(UpdateList));
							});
						}
					} else {

					}
					vjcFun.DealAjaxResult(apiurl, service, result, callBack);
				},
				error: function error(xhr, type, errorThrown) {console.log('error');
					if (typeof(errdo) == "function") {
						errdo(xhr, type, errorThrown);
					} else {
						if (xhr) {
							if(vjc_config.debugerMode)console.log(xhr.status);
							if (xhr.status == 901 || xhr.status == 903) {
								mui.toast("用户认证失败,请重新登录！");
								vjcFun.clearStorage('Auth');
								plus.runtime.restart();
							}
						}
						if(vjc_config.debugerMode)console.log("遇到错误！需要请求的服务器路径：" + apiurl);
						if(vjc_config.debugerMode)console.log("错误请求的参数：" + JSON.stringify(service));
						if(vjc_config.debugerMode)console.info(JSON.stringify(type));
						if(vjc_config.debugerMode)console.info(JSON.stringify(xhr));
						if(vjc_config.debugerMode)console.info(JSON.stringify(errorThrown));
						vjcFun.DealError(service.msgid, service.flag);
					}
				}
			});

		} catch (e) {
			console.info(e.message);
		}
	},

	showWait: function showWait() {
		plus.nativeUI.showWaiting();
	},
	closeWait: function closeWait() {
		plus.nativeUI.closeWaiting();
	},
	dateToStr: function dateToStr(time) {
		var datetime = new Date();
		if (time) {
			datetime.setTime(time);
		}
		var datetime = new Date();
		datetime.setTime(time);
		var year = datetime.getFullYear();
		var month = datetime.getMonth() + 1;
		var date = datetime.getDate();
		var hour = datetime.getHours();
		var minute = datetime.getMinutes();
		var second = datetime.getSeconds();
		var mseconds = datetime.getMilliseconds();
		return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
	},
	/* 数字前加0 */
	ultZeroize: function ultZeroize(v, l) {
		var z = "";
		l = l || 2;
		v = String(v);
		for (var i = 0; i < l - v.length; i++) {
			z += "0";
		}
		return z + v;
	},
	pageName: function() { //取页面名函数
		var a = location.href;
		var b = a.split("/");
		var c = b.slice(b.length - 1, b.length).toString(String).split(".");
		return c.slice(0, 1);
	},
	/**
	 * 生成定长随机字符串
	 */
	getMessageCode: function getMessageCode(codeLength) {
		// 0-9的随机数  
		var arr = []; //容器  
		for (var i = 0; i < codeLength; i++) {
			//循环六次  
			var num = Math.random() * 9; //Math.random();每次生成(0-1)之间的数;  
			num = parseInt(num, 10);
			arr.push(num);
		}
		return arr.join("");;
	},
	//通用编辑
	/**
	 * UpdateOpt 
	 * **/
	goModifyEdit: function(options) {
		// console.log(JSON.stringify(options))
		if (this.isdebug) {
			console.log(JSON.stringify(options));
		}
		var edittype = options.type || 0;
		var default_options = {
			url: "/app/common/modify_edit.html",
			id: "modify_edit",
			//domqury: options.domqury || '',
			ParamName: options.ParamName || '',
			ParamValue: options.ParamValue || '',
			checktype: options.checktype || '', //校验
			label: options.label,
			UpdateOpt: options.UpdateOpt || {},
			//callbackmethods: options.callbackmethods || ''
		};

		mui.openWindow({
			url: default_options.url,
			id: default_options.id,
			extras: {
				ParamName: default_options.ParamName,
				ParamValue: options.ParamValue,
				checktype: options.checktype, //校验
				label: options.label,
				UpdateOpt: options.UpdateOpt || {},
				type: edittype
			}
		});
	},

	//统一编辑函数回传

	showModifyEdit: function(ParamName, LabelName, value, text) {
		vjcFun.app.$data.info_data[ParamName] = unescape(value);
		vjcFun.app.$data.info_data[LabelName] = unescape(text);
		// console.log(JSON.stringify(vjcFun.app.$data.info_data))
	},
	//统一日期选择函数
	/*
	 *可更新日期选择；
	 * @updateOpt {isupdate[bool,ParamName:string,IDName:string,]}
	 */
	comDateSelect: function(options) {
		var valueParam = options.ParamName;

		var LabelName=options.LabelName||valueParam;
		var vueParam=options.vueParam||'info_data';

		var _that = this;
		var picdateopt = {
			title: "请选择日期"
		};
		var updateOpt = options.updateOpt;
		//datetype date datetime time
		if (options.minDate) { //最小日期范围
			picdateopt.minDate = options.minDate;
		}
		if (options.ParamValue) { //当前日期
			picdateopt.date = options.ParamValue;
		}
		/*私有函数 选中后的操作*/
		function picked(pickvalue) {
			if (updateOpt) {
				//更新接口
				var apiParam = vjc_config.apiList[updateOpt.apiName];
				apiParam.data = updateOpt.apiData;
				apiParam.data[_that.ParamName] = pickvalue;
				vjcFun.vjmuiAjax(apiParam, function(result) {
					if (result.code && result.code == 1) {
						mui.toast(result.msg);
						vjcFun.app.$data[vueParam][valueParam] = pickvalue;
					} else {
						mui.toast(result.msg);
					}
				});
			} else {
				console.log(vueParam+':'+valueParam+':'+pickvalue);
				vjcFun.app.$data[vueParam][valueParam] = pickvalue;
				vjcFun.app.$data[vueParam][LabelName] = pickvalue;
			}
		}
		if(options.datetype == 'time'){
			plus.nativeUI.pickTime(function(et) {
				var getTime =  et.date.Format("hh:mm:00");
				//回传数据
				picked(getTime);
			}, function(et) {
				mui.toast("您没有选择时间");
			});
		}else{
			plus.nativeUI.pickDate(function(e) {
				//先弹出日期
				var d = e.date;
				var getDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " ";
				
				if (options.datetype == 'datetime') {
					plus.nativeUI.pickTime(function(et) {
						var getTime = getDate + et.date.Format("hh:mm:00");
						//回传数据
						picked(new Date(getTime).Format("yyyy-MM-dd hh:mm:00"));
					}, function(et) {
						mui.toast("您没有选择时间");
					}, {
						title: "请选择时间",
						is24Hour: true,
						time: d
					});
				} else {
					picked(new Date(getDate).Format("yyyy-MM-dd"));
				}
			}, function(e) {
				console.info("您没有选择日期");
			}, picdateopt);
		}
		
	},
	openView: function(toUrl) {
		if (!Object.assign) {
			Object.defineProperty(Object, "assign", {
				enumerable: false,
				configurable: true,
				writable: true,
				value: function(target, firstSource) {
					"use strict";
					if (target === undefined || target === null)
						throw new TypeError("Cannot convert first argument to object");
					var to = Object(target);
					for (var i = 1; i < arguments.length; i++) {
						var nextSource = arguments[i];
						if (nextSource === undefined || nextSource === null) continue;
						var keysArray = Object.keys(Object(nextSource));
						for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
							var nextKey = keysArray[nextIndex];
							var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
							if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
						}
					}
					return to;
				}
			});
		}
		mui.openWindow(
			Object.assign(toUrl, {
				show: {
					aniShow: "slide-in-right",
					duration: 300
				},
				waiting: {
					autoShow: true, //自动显示等待框，默认为true
					title: '正在加载中...', //等待对话框上显示的提示内容
				}
			})
		);
	},


	//统一选择更新函数
	creatPicker: function(options, callback) {
		var updateOpt = options.UpdateOpt || {
			isupdate: false
		}; //是否需要更新
		console.log(JSON.stringify(options));
		var Pickerlayer = options.layer || 1;
		var Pickerreturntype = options.returntype || 'obj';
		var newPicker = new mui.PopPicker({
			layer: Pickerlayer
		});
		newPicker.setData(options.Pickerdata);
		console.log('create');
		newPicker.show(function(items) {
			console.log('select');//
			var returnobj = items[Pickerlayer - 1];
			if (Pickerreturntype == 'array') {
				returnobj = items
			}
			console.log(JSON.stringify(returnobj));
			if (updateOpt.isupdate) {
				console.log(JSON.stringify(updateOpt));
				updateOpt.updateapi.data[updateOpt.ParamName] = returnobj.value;//
				updateOpt.updateapi.data[options.IDName] = options.vueData[options.IDName];
				console.log(JSON.stringify(updateOpt.updateapi.data)) //传参
				vjcFun.vjmuiAjax(updateOpt.updateapi, function(result) {
					if (result.code && result.code == 1) {
						mui.toast(result.msg);
						callback(returnobj);
					} else {
						mui.toast(result.msg);
					}
				});
			} else {
				callback(returnobj);
			}
		});
	},
	getArraybykey: function(getarray, key, val) { //获取根据键值条件数组中的值
		//console.log('getarrya'+val);
		var resultarr = [];
		for (var item in getarray) {
			if (getarray[item][key]) {
				if (getarray[item][key] == val) {
					resultarr.push(getarray[item]);
				}
			}
		}
		return resultarr;
	},
	/**
	 * 获取多选框值
	 * */
	getCheckBoxRes: function(className) {
		var rdsObj = document.getElementsByClassName(className);
		var checkVal = new Array();
		var k = 0;
		for (i = 0; i < rdsObj.length; i++) {
			if (rdsObj[i].checked) {
				checkVal[k] = rdsObj[i].value;
				k++;
			}
		}
		return checkVal;
	},
	/**
	 * 结束刷新操作
	 * @param {Object} id 需要结束的滚动区域
	 */
	vjmuiEndPulldownToRefresh: function muiHelperEndPulldownToRefresh(id) {
		console.log("#" + id + "");
		mui("#" + id + "").pullRefresh().endPulldown(); //结束刷新
		console.log('end2');
		mui("#" + id + "").pullRefresh().refresh(true); //重置上拉加载
	},
	/**
	 * 结束刷新操作
	 * @param {Object} id 需要结束的滚动区域
	 * @param {Boolean} flag标记是否可以继续加载
	 */
	vjmuiEndPullupToRefresh: function muiHelperEndPullupToRefresh(id,flag){
		mui("#" + id + "").pullRefresh().endPullup(); //设置是否存在更多数据
		mui("#" + id + "").pullRefresh().refresh(flag); 
	},
}

/**
 * 登录用户操作
 */
var member = {
	/**
	 * 获取权限函数
	 **/
	GetAuth: function() {
		var GetAuth = localStorageUtils.getParam('GetAuth', 'json');
		return GetAuth;		
	},
	isHasAuth: function(key, callback) {
		DB.get(INDEX_DB_KEY.USER_AUTH_STORE.KEY, function(result) {
			if (!result.data) {
				//mui.toast('无法获取权限,请稍后重试');
				return callback(false);
			}
			console.log(key);
			console.log(JSON.stringify(result.data))
			if (!result.data.data[key] == 1) {
				//mui.toast('您没有操作权限,请联系管理员');
				return callback(false);
			}
			return callback(true);
		});
	},
	isLogin: function isLogin() {
		if (localStorageUtils.getParam("MEMBER")) {
			return true;
		}
		return false;
	},
	getMember: function getMember() {
		if (this.isLogin()) {
			return localStorageUtils.getParam("MEMBER");
		} else {
			return null;
		}
	},
	memberLogin: function memberLogin(toLoginObj) {
		mui.openWindow(
			Object.assign(toLoginObj, {
				show: {
					aniShow: "slide-in-bottom",
					duration: 150
				}
			})
		);
	},
	memberLogout: function() {
		//muiCommon.clearStorage('Auth');
		localStorageUtils.clear();
		var wvs = plus.webview.all();
		for (var i = 0; i < wvs.length; i++) {
			var curid = plus.webview.currentWebview().id;
			if (curid != wvs[i].id && wvs[i].id != 'main') {
				console.log('closed' + i);
				plus.webview.close(wvs[i]);
			}
		}
		setTimeout(function() {
			console.log('restart');
			plus.runtime.restart();
			//plus.webview.currentWebview().close();
		}, 800);
	}
};

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
(function(d) {
	Date.prototype.Format = function(fmt) { //author: meizz 
			var o = {
				"M+": this.getMonth() + 1, //月份 
				"d+": this.getDate(), //日 
				"h+": this.getHours(), //小时 
				"m+": this.getMinutes(), //分 
				"s+": this.getSeconds(), //秒 
				"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
				"S": this.getMilliseconds() //毫秒 
			};
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" +
					o[k]).substr(("" + o[k]).length)));
			return fmt;
		},
		Array.prototype.removeByValue = function(val) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == val) {
					this.splice(i, 1);
					break;
				}
			}
		}
})();
/**
 * 本地存储Utils
 */
var localStorageUtils = {
	setParam: function setParam(name, value) {
		if (value) {
			plus.storage.setItem(name, value);
		}
	},
	getParam: function getParam(name, type) {
		var gettype = type || 'text';
		/**
		 * 键(key)对应应用存储的值，如果没有保存则返回null。
		 * @param 只有name为organ_user时返回对象，其他获取将返回字符串
		 */
		if (name === "MEMBER" || gettype == "json") 
		 {
			 if(typeof(plus)!='undefined'){
			 				 return JSON.parse(plus.storage.getItem(name));
			 }
			 return null;
		 }
		 
		else
		 {
			 if(typeof(plus)!='undefined'){
				 return plus.storage.getItem(name);
			 }
			 return null;
		 }
		 
	},
	removeParam: function removeParam(key) {
		/**
		 * 清除key存储数据
		 */
		return plus.storage.removeItem(key);
	},
	getLength: function getLength() {
		/**
		 * 获取应用存储区中保存的键值对的个数
		 */
		return plus.storage.getLength();
	},
	clear: function clear() {
		/**
		 * 清除应用所有的键值对存储数据
		 */
		return plus.storage.clear();
	},
	getAllKeys: function AllKeys() {
		/**
		 * 应用所有的键
		 */
		var keyNames = [];
		var numKeys = plus.storage.getLength();
		for (var i = 0; i < numKeys; i++) {
			keyNames[i] = plus.storage.key(i);
		}
		return keyNames;
	},

};


/**
 * 权限封装操作
 * @description  options.type  是否直接通过权限配置 page：对应关系用于集中权限配置 options.callback回调
 * @param {Object} options 需要结束的滚动区域
 * 
 */
vjcFun.AuthInit = function(options) { //权限判定函数
	DB.get(INDEX_DB_KEY.USER_AUTH_STORE.KEY, function(result) {
		var curpageName = vjcFun.pageName();
		for (var item in authsetting) {
			var curAset = authsetting[item];
			if (typeof(curAset) == 'object') {
				var domauth = vjcFun.getArraybykey(result.data, 'apiAuth', curAset.authapi)[0];
				if (options.type) {
					vjcFun.authreadydo({
						domauth: domauth,
						curAset: curAset
					});
				} else {
					if (curAset.page == curpageName) {
						vjcFun.authreadydo({
							domauth: domauth,
							curAset: curAset
						});
					}
				}
			}
		}
		options.callback();
	});
}

vjcFun.authreadydo = function(options) {
	var curAset = options.curAset;
	curAset = {};
	if (options.domauth.authValue != 1) {
		var domquery = curAset.dom;
		var domobj = mui(domquery);
		if (curAset.isintemplate) {
			var templatearr = document.getElementsByTagName('template');
			mui('template').each(function() {
				var domobjtemp = this.content.querySelectorAll(domquery);
				if (domobjtemp.length > 0) {
					domobj = domobjtemp;
				}
			});
			//			var template = document.getElementsByTagName('template')[0];
			//			domobj = template.content.querySelectorAll(domquery);
		}
		var domlength = domobj.length || 0;
		if (domlength > 0) {
			switch (curAset.type) {
				case 'view':
					for (var i = 0; i < domlength; i++) {
						domobj[i].classList.add('mui-hidden');
					}
					break;
				case 'tap':
					for (var i = 0; i < domlength; i++) {
						//console.log(domobj[i].innerHTML);
						domobj[i].classList.remove('mui-navigate-right');
						domobj[i].classList.add('mui-navigate');
						domobj[i].removeAttribute('v-tap');
					}
					break;
			}
		}
	}
}
vjcFun.getpickerdataFromtree = function(treeitem) {
	var temparr = [],
		getlevel = 1,
		resultdata = [];
	for (var i = 0; i < treeitem.length; i++) {
		if (treeitem[i].ParentID == 0) {
			resultdata.push({
				value: treeitem[i].ID,
				text: treeitem[i].Name
			});
		} else {
			temparr.push(treeitem[i]);
		}
	}
	console.log(JSON.stringify(temparr));
	if (temparr.length > 0) {
		//有二级
		getlevel = 2;
		for (var i = 0; i < resultdata.length; i++) {
			var temparr2 = [];
			for (var j = 0; j < temparr.length; j++) {
				if (temparr[j].ParentID == resultdata[i].value) {
					var tempobj = {
						value: temparr[j].ID,
						text: temparr[j].Name
					};

					//查找三级子集
					var temparr3 = [];
					for (var k = 0; k < temparr.length; k++) {
						//console.log('k:'+k+','+j);
						//console.log(temparr[k].ParentID+':'+temparr[j].ID);

						if (temparr[k].ParentID == temparr[j].ID) {
							temparr3.push({
								value: temparr[k].ID,
								text: temparr[k].Name
							});
						}
					}
					//console.log(JSON.stringify(temparr3));
					if (temparr3.length > 0) {
						//发现三级
						getlevel = 3;
						tempobj.children = temparr3;
					}

					temparr2.push(tempobj);
				}
			}
			resultdata[i].children = temparr2;
		}
	}
	return {
		data: resultdata,
		level: getlevel
	};
}
//$('.debugerbox').html('debuger:loadcss');
vjcFun.loadcss(vjc_config.basePath);
