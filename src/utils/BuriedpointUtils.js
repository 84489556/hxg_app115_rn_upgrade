/**
 * 页面埋点工具类
 *
 * */
import { Platform } from "react-native";
import SQLite from './SQLiteHelper';
import UserInfoUtil from './UserInfoUtil';
import * as ScreenUtil from './ScreenUtil';
import DeviceInfo from 'react-native-device-info';
import { Utils } from './CommonUtils';
import * as Urls from '../actions/CYCommonUrl';
//import UmengAnalytics from 'react-native-umeng-analytics'
const UmengAnalytics = require('react-native').NativeModules.UmengAnalytics;
//const UmengAnalyticsModel = require('react-native').NativeModules.UmengAnalytics;


let sqLite = new SQLite();
let mTimer;

//AppMain的页面层级的默认页面
//如果App层级改变，这个也需要对应改变
export let AppMainLevel = {
    selectMainTab: "shouye",
    //看势tab,zixuangu 和hushen是它的两个tab，选中kanshi的tab时，0表示没有选中自选股，1表示选中沪深，反之，选中自选股tab,则自选股=1
    kanshi: {
        zixuangu: 0,
        hushen: 1,
    },
    //观点tab
    guandian: {
        zhuanjiafenxi: 1,
        redianjujiao: 0,
        zixun: {
            caijingbaodao: 1,
            zixuangu: 0,
            // kuaixun: 0,
            gongsixinwen: 0,
            gongsiyanjiu: 0,
            hangyeyanjiu: 0
        }
    },
    //首页tab
    shouye: 1,
    //打榜tab
    dabang: {
        zhangtingzhaban: {
            shichangqingxu: 1,
            bankuaifenxi: 0,
        },
        selectTab: "zhangtingzhaban",//因为打榜里面有两个tab，每个tab都有默认页面，所以设置一个值，保存现在选择的tab,默认是涨停炸版zhangtingzhaban
        jigoudiaoyan: {
            zuixindiaoyan: 1,
            yizhikanduo: 0,
            guanzhuhangye: 0,
            guanzhugegu: 0,
        }
    },
    //选股tab,每次进入的时候需要先设置默认值再存值
    xuangu: {
        tesezhibiaoxuangu: 1,
        //rediancelue:0,
        yanbaocelue: 0
    }
};


/**
 * 慧选股页面设置埋点数据的方法
 * @param Pagepath 这是一个数组[],存储现在需要显示页面的路径 比如：["shouye"] 或者["dabang"]
 */
export function setItemByPosition(pagePath) {
    switch (pagePath.length) {
        case 1:
            switch (pagePath[0]) {
                case "kanshi":
                    AppMainLevel.selectMainTab = "kanshi";
                    if (AppMainLevel.kanshi.zixuangu === 1) {
                        // console.log("页面====看势-自选股")
                        inSertToSQlite(PageMatchID.zixuangu);
                    } else if (AppMainLevel.kanshi.hushen === 1) {
                        //console.log("页面====看势-沪深")
                        inSertToSQlite(PageMatchID.hushen);
                    }
                    break;
                case "guandian":
                    AppMainLevel.selectMainTab = "guandian";
                    if (AppMainLevel.guandian.zhuanjiafenxi === 1) {
                        // console.log("页面====观点-专家分析")
                        inSertToSQlite(PageMatchID.zhuanjiafenxi);
                    } else if (AppMainLevel.guandian.redianjujiao === 1) {
                        //console.log("页面====观点-热点聚焦")
                        inSertToSQlite(PageMatchID.redianjujiao);
                    } else {
                        if (AppMainLevel.guandian.zixun.caijingbaodao === 1) {
                            //console.log("页面====观点-资讯-财经报道")
                            inSertToSQlite(PageMatchID.caijingbaodao);
                        } else if (AppMainLevel.guandian.zixun.zixuangu === 1) {
                            // console.log("页面====观点-资讯-自选股")
                            inSertToSQlite(PageMatchID.zixuan);
                        }
                        // else if (AppMainLevel.guandian.zixun.kuaixun === 1) {
                        //     //console.log("页面====观点-资讯-快讯")
                        //     inSertToSQlite(PageMatchID.kuaixun);
                        // }
                        else if (AppMainLevel.guandian.zixun.gongsixinwen === 1) {
                            //console.log("页面====观点-资讯-公司新闻");
                            inSertToSQlite(PageMatchID.gongsixinwen);
                        } else if (AppMainLevel.guandian.zixun.gongsiyanjiu === 1) {
                            //console.log("页面====观点-资讯-公司研究")
                            inSertToSQlite(PageMatchID.gongsiyanjiu);
                        } else if (AppMainLevel.guandian.zixun.hangyeyanjiu === 1) {
                            //console.log("页面====观点-资讯-行业研究")
                            inSertToSQlite(PageMatchID.hangyeyanjiu);
                        }
                    }
                    break;
                case "shouye":
                    AppMainLevel.selectMainTab = "shouye";
                    if (AppMainLevel.shouye === 1) {
                        //console.log("页面====首页")
                        inSertToSQlite(PageMatchID.shouye);
                    }
                    break;
                case "dabang":
                    AppMainLevel.selectMainTab = "dabang";
                    if (AppMainLevel.dabang.selectTab === "zhangtingzhaban") {
                        if (AppMainLevel.dabang.zhangtingzhaban.shichangqingxu === 1) {
                            //console.log("页面====打榜-涨停炸版-市场情绪")
                            inSertToSQlite(PageMatchID.shichangqingxu);
                        } else if (AppMainLevel.dabang.zhangtingzhaban.bankuaifenxi === 1) {
                            //console.log("页面====打榜-涨停炸版-板块分析")
                            inSertToSQlite(PageMatchID.bankuaifenxi);
                        }
                    } else if (AppMainLevel.dabang.selectTab === "jigoudiaoyan") {
                        if (AppMainLevel.dabang.jigoudiaoyan.zuixindiaoyan === 1) {
                            //console.log("页面====打榜-机构调研-最新调研")
                            inSertToSQlite(PageMatchID.zuixindiaoyan);
                        } else if (AppMainLevel.dabang.jigoudiaoyan.yizhikanduo === 1) {
                            //console.log("页面====打榜-机构调研-一致看多")
                            inSertToSQlite(PageMatchID.yizhikanduo);
                        } else if (AppMainLevel.dabang.jigoudiaoyan.guanzhuhangye === 1) {
                            //console.log("页面====打榜-机构调研-关注行业")
                            inSertToSQlite(PageMatchID.guanzhuhangye);
                        } else if (AppMainLevel.dabang.jigoudiaoyan.guanzhugegu === 1) {
                            //console.log("页面====打榜-机构调研-关注个股")
                            inSertToSQlite(PageMatchID.guanzhugegu);
                        }
                    }
                    break;
                case "xuangu":
                    AppMainLevel.selectMainTab = "xuangu";
                    if (AppMainLevel.xuangu.tesezhibiaoxuangu === 1) {
                        //console.log("页面====选股-特色指标选股")
                        inSertToSQlite(PageMatchID.tesezhibiaoxuangu);
                    } else if (AppMainLevel.xuangu.yanbaocelue === 1) {
                        //console.log("页面====选股-热点策略")
                        //inSertToSQlite(PageMatchID.rediancelue);
                        inSertToSQlite(PageMatchID.yanbaocelue);
                    }
                    // else if(AppMainLevel.xuangu.yanbaocelue===1){
                    //     //console.log("页面====选股-研报策略")
                    //     inSertToSQlite(PageMatchID.yanbaocelue);
                    // }
                    break;
            }
            break;
        case 2:
            switch (pagePath[0]) {
                case "kanshi":
                    AppMainLevel.selectMainTab = "kanshi";
                    switch (pagePath[1]) {
                        case "zixuangu":
                            AppMainLevel.kanshi = { zixuangu: 1, hushen: 0 };
                            //console.log("页面====看势-自选股");
                            inSertToSQlite(PageMatchID.zixuangu);
                            break;
                        case "hushen":
                            AppMainLevel.kanshi = { zixuangu: 0, hushen: 1 };
                            //console.log("页面====看势-自选股");
                            inSertToSQlite(PageMatchID.hushen);
                            break;
                    }
                    break;
                case "guandian":
                    AppMainLevel.selectMainTab = "guandian";
                    switch (pagePath[1]) {
                        case "zhuanjiafenxi":
                            AppMainLevel.guandian = {
                                zhuanjiafenxi: 1,
                                redianjujiao: 0,
                                zixun: {
                                    caijingbaodao: 1,
                                    zixuangu: 0,
                                    // kuaixun: 0,
                                    gongsixinwen: 0,
                                    gongsiyanjiu: 0,
                                    hangyeyanjiu: 0
                                }
                            };
                            //console.log("页面====观点-专家分析");
                            inSertToSQlite(PageMatchID.zhuanjiafenxi);
                            break;
                        case "redianjujiao":
                            AppMainLevel.guandian = {
                                zhuanjiafenxi: 0,
                                redianjujiao: 1,
                                zixun: {
                                    caijingbaodao: 1,
                                    zixuangu: 0,
                                    //kuaixun: 0,
                                    gongsixinwen: 0,
                                    gongsiyanjiu: 0,
                                    hangyeyanjiu: 0
                                }
                            };
                            //console.log("页面====观点-热点聚焦");
                            inSertToSQlite(PageMatchID.redianjujiao);
                            break;
                        case "zixun":
                            AppMainLevel.guandian.zhuanjiafenxi = 0;
                            AppMainLevel.guandian.redianjujiao = 0;

                            if (AppMainLevel.guandian.zixun.caijingbaodao === 1) {
                                //console.log("页面====观点-资讯-财经报道");
                                inSertToSQlite(PageMatchID.caijingbaodao);
                            } else if (AppMainLevel.guandian.zixun.zixuangu === 1) {
                                //console.log("页面====观点-资讯-自选股");
                                inSertToSQlite(PageMatchID.zixuan);
                            }
                            // else if (AppMainLevel.guandian.zixun.kuaixun === 1) {
                            //     //console.log("页面====观点-资讯-快讯");
                            //     inSertToSQlite(PageMatchID.kuaixun);
                            // }
                            else if (AppMainLevel.guandian.zixun.gongsixinwen === 1) {
                                //console.log("页面====观点-资讯-公司新闻");
                                inSertToSQlite(PageMatchID.gongsixinwen);
                            } else if (AppMainLevel.guandian.zixun.gongsiyanjiu === 1) {
                                //console.log("页面====观点-资讯-公司研究");
                                inSertToSQlite(PageMatchID.gongsiyanjiu);
                            } else if (AppMainLevel.guandian.zixun.hangyeyanjiu === 1) {
                                //console.log("页面====观点-资讯-行业研究");
                                inSertToSQlite(PageMatchID.hangyeyanjiu);
                            }
                            break;
                    }
                    break;
                // case "shouye": //当传入路径为两个长度时,则没有首页，首页只有一个层级
                // break;
                case "dabang":
                    AppMainLevel.selectMainTab = "dabang";
                    switch (pagePath[1]) {
                        case "zhangtingzhaban":
                            AppMainLevel.dabang.selectTab = "zhangtingzhaban";
                            if (AppMainLevel.dabang.zhangtingzhaban.shichangqingxu === 1) {
                                //console.log("页面====打榜-涨停炸版-市场情绪");
                                inSertToSQlite(PageMatchID.shichangqingxu);
                            } else if (AppMainLevel.dabang.zhangtingzhaban.bankuaifenxi === 1) {
                                //console.log("页面====打榜-涨停炸版-板块分析");;
                                inSertToSQlite(PageMatchID.bankuaifenxi);
                            }
                            break;
                        case "jigoudiaoyan":
                            AppMainLevel.dabang.selectTab = "jigoudiaoyan";
                            if (AppMainLevel.dabang.jigoudiaoyan.zuixindiaoyan === 1) {
                                //console.log("页面====打榜-机构调研-最新调研");
                                inSertToSQlite(PageMatchID.zuixindiaoyan);
                            } else if (AppMainLevel.dabang.jigoudiaoyan.yizhikanduo === 1) {
                                //console.log("页面====打榜-机构调研-一致看多");
                                inSertToSQlite(PageMatchID.yizhikanduo);
                            } else if (AppMainLevel.dabang.jigoudiaoyan.guanzhuhangye === 1) {
                                //console.log("页面====打榜-机构调研-关注行业");
                                inSertToSQlite(PageMatchID.guanzhuhangye);
                            } else if (AppMainLevel.dabang.jigoudiaoyan.guanzhugegu === 1) {
                                //console.log("页面====打榜-机构调研-关注行业");
                                inSertToSQlite(PageMatchID.guanzhuhangye);
                            }
                            break;
                    }
                    break;
                case "xuangu":
                    AppMainLevel.selectMainTab = "xuangu";
                    switch (pagePath[1]) {
                        case "tesezhibiaoxuangu":
                            AppMainLevel.xuangu = { tesezhibiaoxuangu: 1, yanbaocelue: 0 };
                            //console.log("页面====选股-特色指标选股");
                            inSertToSQlite(PageMatchID.tesezhibiaoxuangu);
                            break;
                        // case "rediancelue":
                        //     AppMainLevel.xuangu = {tesezhibiaoxuangu:0,  yanbaocelue:0};
                        //     //console.log("页面====选股-热点策略");
                        //     inSertToSQlite(PageMatchID.rediancelue);
                        //     break;
                        case "yanbaocelue":
                            AppMainLevel.xuangu = { tesezhibiaoxuangu: 0, yanbaocelue: 1 };
                            //console.log("页面====选股-研报策略");
                            inSertToSQlite(PageMatchID.yanbaocelue);
                            break;
                    }
                    break;
            }
            break;
        case 3:
            switch (pagePath[0]) {
                case "guandian":
                    AppMainLevel.selectMainTab = "guandian";
                    switch (pagePath[1]) {
                        case "zixun":
                            switch (pagePath[2]) {
                                case "caijingbaodao":
                                    AppMainLevel.guandian.zixun = { caijingbaodao: 1, zixuangu: 0, gongsixinwen: 0, gongsiyanjiu: 0, hangyeyanjiu: 0 };
                                    //console.log("页面====资讯-财经报道");
                                    inSertToSQlite(PageMatchID.caijingbaodao);
                                    break;
                                case "zixuangu":
                                    AppMainLevel.guandian.zixun = { caijingbaodao: 0, zixuangu: 1, gongsixinwen: 0, gongsiyanjiu: 0, hangyeyanjiu: 0 };
                                    //console.log("页面====资讯-自选股");
                                    inSertToSQlite(PageMatchID.zixuan);
                                    break;
                                // case "kuaixun":
                                //     AppMainLevel.guandian.zixun = { caijingbaodao: 0, zixuangu: 0, kuaixun: 1, gongsixinwen: 0, gongsiyanjiu: 0, hangyeyanjiu: 0 };
                                //     //console.log("页面====资讯-快讯");
                                //     inSertToSQlite(PageMatchID.kuaixun);
                                //     break;
                                case "gongsixinwen":
                                    AppMainLevel.guandian.zixun = { caijingbaodao: 0, zixuangu: 0, gongsixinwen: 1, gongsiyanjiu: 0, hangyeyanjiu: 0 };
                                    //console.log("页面====资讯-公司新闻");
                                    inSertToSQlite(PageMatchID.gongsixinwen);
                                    break;
                                case "gongsiyanjiu":
                                    AppMainLevel.guandian.zixun = { caijingbaodao: 0, zixuangu: 0, gongsixinwen: 0, gongsiyanjiu: 1, hangyeyanjiu: 0 };
                                    //console.log("页面====资讯-公司研究");
                                    inSertToSQlite(PageMatchID.gongsiyanjiu);
                                    break;
                                case "hangyeyanjiu":
                                    AppMainLevel.guandian.zixun = { caijingbaodao: 0, zixuangu: 0, gongsixinwen: 0, gongsiyanjiu: 0, hangyeyanjiu: 1 };
                                    //console.log("页面====资讯-行业研究");
                                    inSertToSQlite(PageMatchID.hangyeyanjiu);
                                    break;
                            }
                            break;
                    }
                    break;
                case "dabang":
                    AppMainLevel.selectMainTab = "dabang";
                    switch (pagePath[1]) {
                        case "zhangtingzhaban":
                            switch (pagePath[2]) {
                                case "shichangqingxu":
                                    AppMainLevel.dabang.zhangtingzhaban = { shichangqingxu: 1, bankuaifenxi: 0 };
                                    //console.log("页面====打榜-涨停炸版-市场情绪");
                                    inSertToSQlite(PageMatchID.shichangqingxu);
                                    break;
                                case "bankuaifenxi":
                                    AppMainLevel.dabang.zhangtingzhaban = { shichangqingxu: 0, bankuaifenxi: 1 };
                                    //console.log("页面====打榜-涨停炸版-板块分析");
                                    inSertToSQlite(PageMatchID.bankuaifenxi);
                                    break;
                            }
                            break;
                        case "jigoudiaoyan":
                            switch (pagePath[2]) {
                                case "zuixindiaoyan":
                                    AppMainLevel.dabang.jigoudiaoyan = { zuixindiaoyan: 1, yizhikanduo: 0, guanzhuhangye: 0, guanzhugegu: 0 };
                                    //console.log("页面====打榜-机构调研-最新调研");
                                    inSertToSQlite(PageMatchID.zuixindiaoyan);
                                    break;
                                case "yizhikanduo":
                                    AppMainLevel.dabang.jigoudiaoyan = { zuixindiaoyan: 0, yizhikanduo: 1, guanzhuhangye: 0, guanzhugegu: 0 };
                                    //console.log("页面====打榜-机构调研-一致看多");
                                    inSertToSQlite(PageMatchID.yizhikanduo);
                                    break;
                                case "guanzhuhangye":
                                    AppMainLevel.dabang.jigoudiaoyan = { zuixindiaoyan: 0, yizhikanduo: 0, guanzhuhangye: 1, guanzhugegu: 0 };
                                    //console.log("页面====打榜-机构调研-关注行业");
                                    inSertToSQlite(PageMatchID.guanzhuhangye);
                                    break;
                                case "guanzhugegu":
                                    AppMainLevel.dabang.jigoudiaoyan = { zuixindiaoyan: 0, yizhikanduo: 0, guanzhuhangye: 0, guanzhugegu: 1 };
                                    //console.log("页面====打榜-机构调研-关注个股");
                                    inSertToSQlite(PageMatchID.guanzhugegu);
                                    break;
                            }
                            break;
                    }
                    break;
            }
            break;
    }
}


/**
 * 直接传入Name来保存每一条记录
 *@param pageName 页面的名称对象结构{name:"这是页面名称",code:"12000012"}
 * */
export function setItemByName(pageName) {
    inSertToSQlite(pageName)
}

/**
 * 直接传入Name来保存每一条记录
 *@param pageName 页面的名称对象结构{name:"这是页面名称",code:"12000012"}
 * 这是用来储存点击事件的方法
 * */
export function setItemClickByName(pageName) {
    inSertClickToSQlite(pageName)
}

/**
 * 插入数据库的方法
 * @param pageBody 模块名称对应的模块ID {name:"这是页面名称",code:"12000012"}
 * 存入数据库的是传给CEM后台的
 * 这个统计还需要传给youmeng统计,但是友盟统计是需要给页面传入起始的页面名称
 * */

let saveNumber = 1;//这个值给友盟统计使用
let pageName = "";

export function inSertToSQlite(pageBody) {
    let newDateTemp = new Date().getTime();
    let ItemData = [];
    let items = {};
    items.accessType = "1";
    items.deviceId = DeviceInfo.getUniqueId() + "";
    items.deviceName = DeviceInfo.getDeviceName() + "";
    items.startTemp = newDateTemp + "";
    items.moduleId = pageBody.code;
    items.endTemp = newDateTemp + ""; //这里先暂时把起始时间存成一样的，最后提交的时候再两两时间戳相减计算时长
    items.userId = UserInfoUtil.getUserId() + "";
    items.userName = UserInfoUtil.getUserName() + "";
    items.userType = UserInfoUtil.getUserPermissions() + "";
    items.ipAdress = ScreenUtil.ipAdress;
    //(拓客需求新增)是否是拓客需要统计的需求，在拓客之前埋点是由CEM统计，现在拓客的一部分新的需求又改为新的后台统计，所以拓客的一些数据需要做出区分，新增字段
    //isTuoke, 如果为0表示不是拓客需求字段，1为拓客字段
    items.isTuoke = 0;//
    ItemData.push(items);

    //console.log("这是插入的数据",ItemData)
    sqLite.insertItemsData(ItemData);

    //下面的是给友盟统计使用的
    saveNumber++;
    if (Platform.OS === 'android') {
        if (saveNumber === 1) {
            //页面采集
            UmengAnalytics.beginLogPageView(pageBody.name);
            pageName = pageBody.name;
        } else {
            UmengAnalytics.endLogPageView(pageName);
            //页面采集
            UmengAnalytics.beginLogPageView(pageBody.name);
            pageName = pageBody.name;
        }
    }
}

export function inSertClickToSQlite(pageBody) {
    let newDateTemp = new Date().getTime();
    let ItemData = [];
    let items = {};
    items.accessType = "0";
    items.deviceId = DeviceInfo.getUniqueId() + "";
    items.deviceName = DeviceInfo.getDeviceName() + "";
    items.startTemp = newDateTemp + "";
    items.moduleId = pageBody.code;
    items.endTemp = newDateTemp + ""; //这里先暂时把起始时间存成一样的，最后提交的时候再两两时间戳相减计算时长
    items.userId = UserInfoUtil.getUserId() + "";
    items.userName = UserInfoUtil.getUserName() + "";
    items.userType = UserInfoUtil.getUserPermissions() + "";
    items.ipAdress = ScreenUtil.ipAdress;
    //(拓客需求新增)是否是拓客需要统计的需求，在拓客之前埋点是由CEM统计，现在拓客的一部分新的需求又改为新的后台统计，所以拓客的一些数据需要做出区分，新增字段
    //isTuoke, 如果为0表示不是拓客需求字段，1为拓客字段
    items.isTuoke = 0;//
    ItemData.push(items);

    //console.log("这是插入的数据",ItemData)
    sqLite.insertItemsData(ItemData);
}


/**
 * 此方法只用于首页的获取焦点时调用
 *
 * */
export function setItemByMianWillFoucs() {
    if (!global.db) {
        global.db = sqLite.open();
    }
    //console.log("获得焦点",AppMainLevel.selectMainTab)
    switch (AppMainLevel.selectMainTab) {
        case "kanshi":
            if (AppMainLevel.kanshi.zixuangu === 1) {
                //console.log("页面====看势-自选股")
                inSertToSQlite(PageMatchID.zixuangu);
            } else if (AppMainLevel.kanshi.hushen === 1) {
                //console.log("页面====看势-沪深")
                inSertToSQlite(PageMatchID.hushen);
            }
            break;
        case "guandian":
            if (AppMainLevel.guandian.zhuanjiafenxi === 1) {
                //console.log("页面====观点-专家分析")
                inSertToSQlite(PageMatchID.zhuanjiafenxi);
            } else if (AppMainLevel.guandian.redianjujiao === 1) {
                //console.log("页面====观点-热点聚焦")
                inSertToSQlite(PageMatchID.redianjujiao);
            } else {
                if (AppMainLevel.guandian.zixun.caijingbaodao === 1) {
                    //console.log("页面====观点-资讯-财经报道")
                    inSertToSQlite(PageMatchID.caijingbaodao);
                } else if (AppMainLevel.guandian.zixun.zixuangu === 1) {
                    //console.log("页面====观点-资讯-自选股")
                    inSertToSQlite(PageMatchID.zixuan);
                }
                // else if (AppMainLevel.guandian.zixun.kuaixun === 1) {
                //     //console.log("页面====观点-资讯-快讯")
                //     inSertToSQlite(PageMatchID.kuaixun);
                // }
                else if (AppMainLevel.guandian.zixun.gongsixinwen === 1) {
                    //console.log("页面====观点-资讯-公司新闻")
                    inSertToSQlite(PageMatchID.gongsixinwen);
                } else if (AppMainLevel.guandian.zixun.gongsiyanjiu === 1) {
                    //console.log("页面====观点-资讯-公司研究")
                    inSertToSQlite(PageMatchID.gongsiyanjiu);
                } else if (AppMainLevel.guandian.zixun.hangyeyanjiu === 1) {
                    //console.log("页面====观点-资讯-行业研究")
                    inSertToSQlite(PageMatchID.hangyeyanjiu);
                }
            }
            break;
        case "shouye":
            if (AppMainLevel.shouye === 1) {
                //console.log("页面====首页")
                inSertToSQlite(PageMatchID.shouye);

            }
            break;
        case "dabang":
            if (AppMainLevel.dabang.selectTab === "zhangtingzhaban") {
                if (AppMainLevel.dabang.zhangtingzhaban.shichangqingxu === 1) {
                    //console.log("页面====打榜-涨停炸版-市场情绪")
                    inSertToSQlite(PageMatchID.shichangqingxu);
                } else if (AppMainLevel.dabang.zhangtingzhaban.bankuaifenxi === 1) {
                    //console.log("页面====打榜-涨停炸版-板块分析")
                    inSertToSQlite(PageMatchID.bankuaifenxi);
                }
            } else if (AppMainLevel.dabang.selectTab === "jigoudiaoyan") {
                if (AppMainLevel.dabang.jigoudiaoyan.zuixindiaoyan === 1) {
                    //console.log("页面====打榜-机构调研-最新调研")
                    inSertToSQlite(PageMatchID.zuixindiaoyan);
                } else if (AppMainLevel.dabang.jigoudiaoyan.yizhikanduo === 1) {
                    //console.log("页面====打榜-机构调研-一致看多")
                    inSertToSQlite(PageMatchID.yizhikanduo);
                } else if (AppMainLevel.dabang.jigoudiaoyan.guanzhuhangye === 1) {
                    //console.log("页面====打榜-机构调研-关注行业")
                    inSertToSQlite(PageMatchID.guanzhuhangye);
                } else if (AppMainLevel.dabang.jigoudiaoyan.guanzhugegu === 1) {
                    //console.log("页面====打榜-机构调研-关注个股")
                    inSertToSQlite(PageMatchID.guanzhugegu);
                }
            }
            break;
        case "xuangu":
            if (AppMainLevel.xuangu.tesezhibiaoxuangu === 1) {
                //console.log("页面====选股-特色指标选股")
                inSertToSQlite(PageMatchID.tesezhibiaoxuangu);
            } else if (AppMainLevel.xuangu.yanbaocelue === 1) {
                //console.log("页面====选股-热点策略")
                //inSertToSQlite(PageMatchID.rediancelue);
                inSertToSQlite(PageMatchID.yanbaocelue);
            }
            // else if(AppMainLevel.xuangu.yanbaocelue===1){
            //     //console.log("页面====选股-研报策略")
            //
            // }
            break;
    }

}

/**
 * 走一个定时器,每5分钟请求一次
 * */
export function startTimeInterVal() {
    mTimer = setInterval(() => {
        //查询
        if (!global.db) {
            return;
        }
        global.db.transaction((tx) => {
            tx.executeSql("select * from BURIEDPOINT", [], (tx, results) => {
                if (results && results.rows && results.rows.length > 0) {
                    //然后从数组中区分出是否是拓客活动的数据
                    // sqLite.insertItemsData(lastItem);
                    let noTuokeDatas = [];
                    //  let isTuokeDatas = [];
                    //由于拓客活动统计的取消，这块暂时不改动
                    for (let i = 0; i < results.rows.length; i++) {
                        noTuokeDatas.push(results.rows.item(i))
                    }
                    //如果有拓客活动的埋点统计数据
                    if (noTuokeDatas.length > 0) {
                        //储存一个最后一条
                        let lastItem = [];
                        let items = {};
                        items.accessType = noTuokeDatas[noTuokeDatas.length - 1].accessType;
                        items.deviceId = noTuokeDatas[noTuokeDatas.length - 1].deviceId;
                        items.deviceName = noTuokeDatas[noTuokeDatas.length - 1].deviceName;
                        items.startTemp = noTuokeDatas[noTuokeDatas.length - 1].startTemp;
                        items.moduleId = noTuokeDatas[noTuokeDatas.length - 1].moduleId;
                        items.endTemp = noTuokeDatas[noTuokeDatas.length - 1].endTemp; //这里先暂时把起始时间存成一样的，最后提交的时候再两两时间戳相减计算时长
                        items.userId = noTuokeDatas[noTuokeDatas.length - 1].userId;
                        items.userName = noTuokeDatas[noTuokeDatas.length - 1].userName;
                        items.userType = noTuokeDatas[noTuokeDatas.length - 1].userType;
                        items.ipAdress = noTuokeDatas[noTuokeDatas.length - 1].ipAdress;
                        items.isTuoke = noTuokeDatas[noTuokeDatas.length - 1].isTuoke;
                        lastItem.push(items);

                        let submitDatas = [];//上传接口的数组
                        for (let i = 0; i < noTuokeDatas.length - 1; i++) {
                            let items = {};
                            //页面浏览
                            if (noTuokeDatas[i].accessType == "1") {
                                items.at = noTuokeDatas[i].accessType;
                                items.dc = noTuokeDatas[i].deviceId;
                                items.dn = noTuokeDatas[i].deviceName;
                                items.ets = noTuokeDatas[i].startTemp;
                                items.fmid = noTuokeDatas[i].moduleId;
                                items.ots = noTuokeDatas[i + 1].startTemp;
                                items.uid = noTuokeDatas[i].userId;
                                items.uname = noTuokeDatas[i].userName;
                                items.ut = noTuokeDatas[i].userType;
                                items.ip = noTuokeDatas[i].ipAdress;
                            } else if (noTuokeDatas[i].accessType == "0") {
                                //页面点击
                                items.at = noTuokeDatas[i].accessType;
                                items.dc = noTuokeDatas[i].deviceId;
                                items.dn = noTuokeDatas[i].deviceName;
                                items.ets = noTuokeDatas[i].startTemp;
                                items.fmid = noTuokeDatas[i].moduleId;
                                items.ots = noTuokeDatas[i + 1].startTemp;
                                items.uid = noTuokeDatas[i].userId;
                                items.uname = noTuokeDatas[i].userName;
                                items.ut = noTuokeDatas[i].userType;
                                items.ip = noTuokeDatas[i].ipAdress;
                                items.ts = noTuokeDatas[i].startTemp;//这个的点击事件也取获取焦点的开始时间
                            }
                            submitDatas.push(items)
                        }
                        //console.log("上传非活动后台CEMurl=",Urls.urlBuriedPoint+'accessRecordsApp')
                        //console.log("上传非活动后台CEM数据",submitDatas)
                        if (submitDatas && submitDatas.length > 0) {
                            Utils.post(Urls.urlBuriedPoint + 'accessRecordsApp', submitDatas,
                                (response) => {
                                    //console.log("CEM上传成功回调",response)
                                    //清除数据库
                                    sqLite.deleteData();
                                    //清除数据库后，重新插入之前最后到第一条
                                    sqLite.insertItemsData(lastItem);

                                }, (errorCallBack) => {
                                    console.log("上传失败回调", response)
                                })

                        }
                    }

                    // if(isTuokeDatas.length>0){
                    //
                    //     //储存一个最后一条
                    //     let lastItems = [];
                    //     let itemss ={};
                    //     itemss.accessType = isTuokeDatas[isTuokeDatas.length-1].accessType;
                    //     itemss.deviceId = isTuokeDatas[isTuokeDatas.length-1].deviceId;
                    //     itemss.deviceName = isTuokeDatas[isTuokeDatas.length-1].deviceName;
                    //     itemss.startTemp = isTuokeDatas[isTuokeDatas.length-1].startTemp;
                    //     itemss.moduleId = isTuokeDatas[isTuokeDatas.length-1].moduleId;
                    //     itemss.endTemp = isTuokeDatas[isTuokeDatas.length-1].endTemp; //这里先暂时把起始时间存成一样的，最后提交的时候再两两时间戳相减计算时长
                    //     itemss.userId = isTuokeDatas[isTuokeDatas.length-1].userId;
                    //     itemss.userName = isTuokeDatas[isTuokeDatas.length-1].userName;
                    //     itemss.userType = isTuokeDatas[isTuokeDatas.length-1].userType;
                    //     itemss.ipAdress = isTuokeDatas[isTuokeDatas.length-1].ipAdress;
                    //     itemss.isTuoke = isTuokeDatas[isTuokeDatas.length-1].isTuoke;
                    //
                    //     lastItems.push(itemss);
                    //
                    //     let submitDatass = [];//上传接口的数组
                    //     for(let i=0; i<isTuokeDatas.length-1; i++){
                    //         let itemsss = {};
                    //         //页面浏览
                    //         if(isTuokeDatas[i].accessType=="1"){
                    //             itemsss.at = isTuokeDatas[i].accessType;
                    //             itemsss.dc = isTuokeDatas[i].deviceId;
                    //             itemsss.dn = isTuokeDatas[i].deviceName;
                    //             itemsss.ets = isTuokeDatas[i].startTemp;
                    //             itemsss.fmid = isTuokeDatas[i].moduleId;
                    //             itemsss.ots = isTuokeDatas[i+1].startTemp;
                    //             itemsss.uid = isTuokeDatas[i].userId;
                    //             itemsss.uname = isTuokeDatas[i].userName;
                    //             itemsss.ut = isTuokeDatas[i].userType;
                    //             itemsss.ip = isTuokeDatas[i].ipAdress;
                    //         }else if(isTuokeDatas[i].accessType=="0"){
                    //             //页面点击
                    //             itemsss.at = isTuokeDatas[i].accessType;
                    //             itemsss.dc = isTuokeDatas[i].deviceId;
                    //             itemsss.dn = isTuokeDatas[i].deviceName;
                    //             itemsss.ets = isTuokeDatas[i].startTemp;
                    //             itemsss.fmid = isTuokeDatas[i].moduleId;
                    //             itemsss.ots = isTuokeDatas[i+1].startTemp;
                    //             itemsss.uid = isTuokeDatas[i].userId;
                    //             itemsss.uname = isTuokeDatas[i].userName;
                    //             itemsss.ut = isTuokeDatas[i].userType;
                    //             itemsss.ip = isTuokeDatas[i].ipAdress;
                    //             itemsss.ts = isTuokeDatas[i].startTemp;//这个的点击事件也取获取焦点的开始时间
                    //         }
                    //         submitDatass.push(itemsss)
                    //     }
                    //     if(submitDatass && submitDatass.length>0 ){
                    //         //let
                    //         //console.log("huodoong上传前数据",submitDatass);
                    //         Utils.post(Urls.urlTuokeBuriedPoint+'accessRecordActivePage/App',submitDatass,
                    //             (response)=>{
                    //                 //console.log("huodoong上传成功活动回调",response)
                    //                 //清除数据库
                    //                 sqLite.deleteData();
                    //                 //清除数据库后，重新插入之前最后到第一条
                    //                 sqLite.insertItemsData(lastItems);
                    //
                    //             },(errorCallBack)=>{
                    //                 console.log("上传失败回调",response)
                    //             })
                    //     }
                    // }
                }
            });
        }, (error) => {//打印异常信息
            console.log(error);
        });
        //1000 * 60 * 5
    }, 1000 * 20);
}
/**
 *  清除定时器
 * */
export function clearTimeInterVal() {
    mTimer && clearInterval(mTimer)
}

/**
 * 所有模块(页面)所对应的Id
 *
 * */
export let PageMatchID = {
    shouye: { name: "首页", code: "101000000" },//首页

    hushen: { name: "沪深", code: "202000000" },//首页看势沪深
    zixuangu: { name: "自选股", code: "203000000" },//首页看势自选股

    zhuanjiafenxi: { name: "专家分析", code: "302000000" },//首页观点专家分析
    redianjujiao: { name: "热点聚焦", code: "303000000" },//首页观点热点聚焦
    caijingbaodao: { name: "财经报道", code: "304010000" },//首页观点资讯财经报道
    zixuan: { name: "自选股", code: "304020000" },//首页观点资讯自选

    //kuaixun: { name: "快讯", code: "304030000" },//首页观点资讯快讯

    gongsixinwen: { name: "公司新闻", code: "304040000" },//首页观点资讯公司新闻
    gongsiyanjiu: { name: "公司研究", code: "304050000" },//首页观点资讯公司研究
    hangyeyanjiu: { name: "行业研究", code: "304060000" },//首页观点资讯行业研究

    shichangqingxu: { name: "市场情绪", code: "402010000" },//打榜涨停炸版市场情绪
    bankuaifenxi: { name: "板块分析", code: "402020000" },//打榜涨停炸版板块分析

    zuixindiaoyan: { name: "最新调研", code: "403010000" },//打榜机构调研最新调研
    yizhikanduo: { name: "一致看多", code: "403020000" },//打榜机构调研一致看多
    guanzhuhangye: { name: "关注行业", code: "403030000" },//打榜机构调研关注行业
    guanzhugegu: { name: "关注个股", code: "403040000" },//打榜机构调研关注个股

    tesezhibiaoxuangu: { name: "特色指标选股", code: "501010000" },//选股特色指标选股
    rediancelue: { name: "热点策略", code: "501020000" },//热点策略
    yanbaocelue: { name: "研报策略", code: "501030000" },//研报策略


    geguxiangqing: { name: "个股详情页面", code: "102000000" },//个股详情页面

    jiazhicelue: { name: "价值策略外层主页", code: "103000000" },//首页点击进入的价值策略主页
    jiazhiceluexiangqing: { name: "价值策略详情页面", code: "103040000" },//价值策略的详情页面
    guandianzhiboliebiao: { name: "观点直播列表", code: "103010000" },//观点直播列表

    jueceshizhanjiepanwangqi: { name: "决策实战解盘往期", code: "103030000" },//决策实战解盘往期
    shizhanjiepanwangqi: { name: "实战解盘往期", code: "103030000" },//实战解盘往期列表页面
    jueceshizhanjiepanxiangqing: { name: "决策实战解盘播放详情", code: "103031000" },//决策实战解盘播放详情
    shizhanjiepanxiangqing: { name: "实战解盘播放详情", code: "103031000" },//实战解盘播放详情页面

    zhuticeluexiangqing: { name: "主题策略详情页面", code: "103050000" },//主题策略详情页面
    zhibiaoxuexiliebiao: { name: "指标学习列表页面", code: "103060000" },//指标学习列表页面
    celueketangliebiao: { name: "策略课堂列表页面", code: "103061000" },//策略课堂列表页面
    chengzhangxuetangbofangxiangqing: { name: "成长学堂播放详情页面", code: "103070000" },//成长学堂播放详情页面

    zhulicelue: { name: "主力决策首页", code: "104000000" },//首页点击进入的主力决策首页

    zuixinlonghubang: { name: "最新龙虎榜", code: "104040100" },//主力决策进入龙虎榜最新龙虎榜
    longhumima: { name: "龙虎密码", code: "104040200" },//主力决策进入龙虎榜龙虎密码
    youzitupu: { name: "游资图谱", code: "104040300" },//主力决策进入龙虎榜游资图谱
    jigouzhongcang: { name: "机构重仓", code: "104040400" },//主力决策进入龙虎榜机构重仓

    zijinliuxiangtongjixiangqing: { name: "资金流向统计页面", code: "104050000" },//资金流向统计详情页面

    zuixinjiaoyi: { name: "高管交易榜最新交易", code: "104060100" },//高管交易榜最新交易
    jizhongmairu: { name: "高管交易榜集中买入", code: "104060200" },//高管交易榜集中买入
    chixumairu: { name: "高管交易榜持续买入", code: "104060100" },//高管交易榜持续买入
    shichangtongji: { name: "高管交易榜市场统计", code: "104060400" },//高管交易榜市场统计
    hangyetongji: { name: "高管交易榜行业统计", code: "104060500" },//高管交易榜行业统计

    zijinjiemixiangqing: { name: "资金揭秘详情页面", code: "104070000" },//资金揭秘详情页面
    zijinqiangrugegu: { name: "资金揭秘抢入个股", code: "104070100" },//资金揭秘详情页面

    shipinzhibojian: { name: "视频解盘", code: "107000000" },//视频直播间
    shouyitongjisousuo: { name: "收益统计搜索页面", code: "108000000" },//收益统计搜索页面

    tesezhibiaoxuanguxiangqing: { name: "特色指标选股详情页面", code: "501011000" },//特色指标选股详情页面

    yonghuzhongxinzhuye: { name: "用户中心主页", code: "601010000" },//用户中心主页
    huodongzhongxin: { name: "活动中心", code: "601020000" },//用户主页活动中心
    fuwushangcheng: { name: "服务商城", code: "601020000" },//用户主页服务商城
    zaixiankefu: { name: "在线客服", code: "801000000" },//用户主页在线客服
    xiaoxizhongxin: { name: "消息中心", code: "901000000" },//用户消息中心
    huodongxiangqing: { name: "活动详情", code: "111111111" },//用户活动详情页面

    zhuce: { name: "用户注册页面", code: "701000000" },//用户注册页面



    /**
     * 拓客活动新增页面
     * */
    //1.虽然是拓客活动新增，但是还是放在CEM后台去统计
    duotouqidong: { name: "多头启动首页点击", code: "109000000" },//首页多头启动入口点击，都是首页的入口，但是统计两次，因为后台不同
    duotouqidongxiangqing: { name: "多头启动详情页面", code: "109010000" },//多头启动详情页面
    weixinLogin: { name: "微信登录按钮点击", code: "111010000" },//微信登录按钮点击


    //2.拓客活动新增，但是还是放在焦军新的统计后台的埋点数据
    shouyetanchuang: { name: "首页弹窗浏览", code: "101010100" },//首页弹窗广告停留
    shouyetanchuangdianji: { name: "首页弹窗点击", code: "101010200" },//首页弹窗广告按钮点击
    houyetanchuangclose: { name: "首页弹窗关闭点击", code: "101010300" },//首页弹窗广告关闭按钮点击
    duotouqidong2: { name: "多头启动首页入口点击2", code: "101020100" },//都是首页的入口，但是统计两次，因为后台不同
    fenxiangyemian: { name: "分享页面停留", code: "102010100" },//分享页面停留
    fenxiangyemiandianji: { name: "分享页面点击", code: "102010200" },//分享页面分享按钮点击
    duotouqidongxiangqing2: { name: "多头启动详情页面2", code: "103010000" },//多头启动详情页面,因为后台设计模块不同，储存2次
    fenxiangxuanfudianji: { name: '多头启动分享悬浮按钮点击', code: '103010100' },//分享悬浮按钮点击




};