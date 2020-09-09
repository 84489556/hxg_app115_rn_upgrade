/**
 * 配置信息（直接放在全局）
 * Created by jiagang on 15/11/4.
 */
'use strict'

var CryptoJS = require("crypto-js");
var appid = "091960b506d811e684090242ac1102a4";
var secret_key = "v1Lb7j2YAq97";
var short_id = "0000002f";
var expired_time = parseInt(new Date().getTime() / 1000) + 86400;
var rawMask = appid + "_" + expired_time + "_" + secret_key;
var hex_mask = CryptoJS.HmacSHA1(rawMask, secret_key);

var token = short_id + ":" + expired_time + ":" + hex_mask;

global.IsRelease = false;

// 云服务器配置信息配置到全局
//global.DZHYUN_ADDRESS = 'ws://v2.yundzh.com/ws?token=85dc0ade19b74a1ba4718112fd4b97fb';
global.DZHYUN_ADDRESS = 'wss://gw.yundzh.com/ws?token=' + token;

// 开发联调环境
//global.DZHYUN_ADDRESS = 'ws://10.15.144.101:80/ws';

// 测试联调环境
//global.DZHYUN_ADDRESS = 'ws://10.15.144.80/ws';

global.DZHYUN_DATA_TYPE = 'pb';

// 日志记录级别，可取值为all|info|debug|warn|error|none
global.LOG_LEVEL = 'all';

//源达云财源股票根节点
global.MainPathCaiYuan = IsRelease ? '/CaiYuanGuPiao' : '/CeshiCaiYuanGuPiao';
//源达云慧选股根节点
global.MainPathYG = IsRelease ? '/ydhxg/' : '/ydhxgtest/';
/**
 * 源达云慧选股根节点改变，因为1.1.5版本现在需要维护2个版本，所以部分的源达云节点改为MainPathYG2，此节点只针对于线上版本
 * */
global.MainPathYG2 = IsRelease ? '/ydhxg2/' : '/ydhxgtest/';
global.TaoXiPath = 'YuanDaGuPiao/TaoXi';

// 源达云提供的获取当前时间戳的地址
global.GetTimestampUrl = 'https://yun.ydtg.com.cn/node/getTime';

// 视频解盘(视频直播间)接口域名
// global.ZBJDomainName = IsRelease ? 'https://zbj-api.ydtg.com.cn' : 'https://csnewzbj.ydtg.com.cn:9995'; // 展视
global.ZBJDomainName = IsRelease ? 'https://mai-zbj-api.ydtg.com.cn' : 'https://ccvideo.zslxt.com:8800';


// 视频解盘(视频直播间)源达云节点地址
global.ZBJ_ydyun = IsRelease ? '/zbj/zbjcc/hxgzbj/' : '/zbjtest/zbjcc/hxgzbj/';  //展视测试  /zbjtest/hxgzbj/

// global.ZBJDomainName = 'https://yun.ydtg.com.cn'
global.ZBJ_rid = '15' // 根据rid来判断源达云节点，比如rid=15的直播间为慧选股直播间

global.ZBJ_roomid = IsRelease ? 'F2AB1F0D41534FAD9C33DC5901307461' : 'A78698E54570DBD79C33DC5901307461'; // 直播间房间id

global.DuoTou = '215'

