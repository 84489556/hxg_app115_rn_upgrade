/**
 * Created by cuiwenjuan on 2019/2/22.
 */


//刘世雄
// 客服回复
let urlIMRelease = 'https://chat.zslxt.com/';
let urlIMDebug = 'https://cs.zslxt.com:9008/';
export const urlIM = IsRelease ? urlIMRelease : urlIMDebug;


//用户中心 (修改用户信息，注册登录，版本信息)
//let userInfoUrlDebug = 'http://cs.zslxt.com:9007/';
let userInfoUrlDebug = 'https://cs-hxg-api.zslxt.com/';
let userInfoUrlRelease = 'https://hxg-api.yd.com.cn/';
export const urlUserInfo = IsRelease ? userInfoUrlRelease : userInfoUrlDebug;

//版本更新的接口
let checkUpdateDebug = 'http://cs.zslxt.com:9007/';
let checkUpdateRelease = 'https://api.zslxt.com/';
export const checkUpdate = IsRelease ? checkUpdateRelease : checkUpdateDebug;
////////////////////////////////////////////////////////////////////////////

//周伟
//各个模块点赞浏览地址 自选股操作

//老的部分接口
let ydgpURL2Release = 'https://ydgpapp.zslxt.com/web/';//财源线上的
let ydgpURL2Debug = 'http://192.168.11.103:8089/';//'http://61.235.151.220:8089/';//测试地址
export const urlYDGP = IsRelease ? ydgpURL2Release : ydgpURL2Debug;

//////////////////////////////////////////////////////////////////////////////////////

//新行情,资讯
let F10Url = 'http://cdnapp.ydtg.com.cn/'

export const urlNews = F10Url;

//个股公告，个股资讯
let geGuNewsUrl = 'https://cdnapp.ydtg.com.cn/'
export const urlGeGuNews = geGuNewsUrl;

//资讯详情页
let detailNewsRelease = 'http://newf10.zslxt.com/wap/other/news.html';
let detailNewsDebug = 'http://cs.zslxt.com:9009/wap/other/news.html';
export const urlDetailNews = IsRelease ? detailNewsRelease : detailNewsDebug;


//慧选股 接口根地址
let hxgURLRelease = 'https://ydhxg-prod-api.yd.com.cn';
let hxgURLDebug = 'http://ydhxg-api.yd.com.cn:8443';
export const urlHXG = IsRelease ? hxgURLRelease : hxgURLDebug;

//慧选股 选股模块 地址
//20200708慧选股1.1.5版本，根域名改为ydhxg-prod-admin2.yd.com.cn，只针对于线上版本
let xgModuleURLRelease = 'https://ydhxg-prod-admin2.yd.com.cn/api';
let xgModuleURLDebug = 'http://ydhxg-api.yd.com.cn:9091';
export const urlHXG_xg = IsRelease ? xgModuleURLRelease : xgModuleURLDebug;



//慧选股 点赞，理解 接口地址
let hxgZanUrlRelease = 'https://ydhxg-prod.yd.com.cn/';
let hxgZanUrlDebug = 'http://ydhxg-api.yd.com.cn:8089/';
export const urlHXG_zan = IsRelease ? hxgZanUrlRelease : hxgZanUrlDebug;


//源达云地址
//我的订单
let userOrderDebug = '/cem/test/'
let userOrderRelease = '/cem/'
export const userOrderRef = IsRelease ? userOrderRelease : userOrderDebug;

//单点登录
let appSSORelease = '/HuiXuanGu/'
let appSSODebug = '/HuiXuanGuTest/'
export const appSSORef = IsRelease ? appSSORelease : appSSODebug;

//多头服务
let duoTouRelease = '/UserCenter/'
let duoTouDebug = '/UserCenter/test/'
export const duoTouRef = IsRelease ? duoTouRelease : duoTouDebug;

//IM客服 源达云节点地址
let refIMDebug = '/CeshiHuiXuanGu/'
let refIMRelease = '/HuiXuanGu/'
export const appIMRef = IsRelease ? refIMRelease : refIMDebug;

//营销页
let marketingUrlDebug = 'https://cs.zslxt.com:9008/index/message_reminder/save'
let marketingUrlRelease = 'https://cem.zslxt.com:8443/index/message_reminder/save'
export const urlHXG_marketing = IsRelease ? marketingUrlRelease : marketingUrlDebug;

//意见返回
let refFeedBackUrlDebug = 'http://192.168.11.241/tsjywap/sendmailJson.php'
let refFeedBackUrlRelease = 'https://www.yd.com.cn/tsjywap/sendmailJson.php'
export const urlFeedBack = IsRelease ? refFeedBackUrlRelease : refFeedBackUrlDebug;;

// 埋点访问接口
let urlBuriedPointRelease = 'http://ydlog-api.yd.com.cn/';
let urlBuriedPointDebug = 'http://59.110.217.152:1114/';
export const urlBuriedPoint = IsRelease ? urlBuriedPointRelease : urlBuriedPointDebug;

// 埋点访问接口
let urlTuokeBuriedPointRelease = 'http://ydlog-api.yd.com.cn/';
let urlTuokeBuriedPointDebug = 'http://59.110.217.152:1114/';
export const urlTuokeBuriedPoint = IsRelease ? urlTuokeBuriedPointRelease : urlTuokeBuriedPointDebug;
let prodUrlDebug = 'http://ydhxg-web.yd.com.cn/';
//20200708慧选股1.1.5版本，根域名改为ydhxg-prod-web2.yd.com.cn，只针对于线上版本
let prodUrlRelease = 'https://ydhxg-prod-web2.yd.com.cn/';
export const ydhxgProdUrl = IsRelease ? prodUrlRelease : prodUrlDebug;

// 分享下载链接
export const AppDownloadURL = ydhxgProdUrl + 'app-download';

//资讯详情页面域名
let newsUrlDebug = 'http://ydhxg-cdn.yd.com.cn';
let newsUrlRelease = 'https://ydhxg-prod-cdn.yd.com.cn/';
export const newsHxgProdUrl = IsRelease ? newsUrlRelease : newsUrlDebug;