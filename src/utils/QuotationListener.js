import Yd_cloud from "../wilddog/Yd_cloud";


/*
    源达云行情数据解析字段对应关系：
    a:成交时间
    b:股票名称
    c:市场前缀+合约代码;以'\0'结尾，市场前缀两字节。
    d:交易状态
    e:昨收价
    f:当日总成交量（行情组给的是“股”。如果需要“总手”需要自己处理） 2019/6/28 与徐海涛、杨总确认通过 总手 = 当日总成交量 / 100 后取整
    g:当日总成交额（元）
    h:今开价
    i:最高价
    j:最低价
    k:最新价（元）
    l1~l5:申买价1;2;3;4;5
    m1~m5:申买量1;2;3;4;5
    n1~n5:申卖价1;2;3;4;5
    o1~o5:申卖量1;2;3;4;5
    p1~p5:申买笔数1;2;3;4;5(深交所特有)
    q1~q5:申卖笔数1;2;3;4;5(深交所特有)
    r:交易总笔数(深交所特有)
    s:基金T-1日净值
    t:基金实时参考净值
    u:现手
    v:内盘
    w:外盘
    x:涨跌（元）
    y:涨跌幅（%）
    z:均价
    aa:振幅
    ab:涨速%
    ac:涨停（价格）
    ad:跌停（价格）
    ae:委比（%）
    af:量比
    ag:3日涨幅
    ah:5日涨幅
    ai:上涨家数
    aj:下跌家数
    ak:换手（%）
    al:市盈率
    am:市净率
    an:流通市值
    ao:总市值
    ap:资金净额
    aq:领涨股
    ar:委差
    as1:1分钟涨跌幅（%）
    as5:5分钟涨跌幅（%）
    as15:15分钟涨跌幅（%）
    as30:30分钟涨跌幅（%）
*/

/**
 *  author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/9/23 17
 * description: 源达云行情监听工具类
 */
let refHXG = Yd_cloud().ref(MainPathYG);
let calander = refHXG.ref('openning_calendar_before');
let ydBaseUrl = Yd_cloud().ref('quote_provider_yun/');
let ydBaseZiJinUrl = Yd_cloud().ref('fund_flow_yun/fund-data/');

export default {


    /**
     * 慧选股源达云监听股票行情变化
     * @param stockArray 需要监听的股票数组["SZ300375","SZ300375","SZ300375"]
     * @param Callback 返回的
     */
    addListeners(stockArray, callBack) {
        if (stockArray && stockArray.length > 0) {
            for (let i = 0; i < stockArray.length; i++) {
                ydBaseUrl.ref(stockArray[i]).on("value", (response) => {
                    if (response.code == 0 && response.nodeContent) {
                        let stockMess = response.nodeContent.replace(/</g, "{").replace(/>/g, "}").replace(/\$/g, ":")
                        let objStockMess = JSON.parse(stockMess)
                        // console.log("股票回复===对象",objStockMess);
                        if (callBack) {
                            callBack(objStockMess)
                        }
                    }
                })
            }
        }
    },

    /**
     * 慧选股源达云解监听股票行情变化
     * @param stockArray 需要解监听的股票数组["SZ300375","SZ300375","SZ300375"]
     * @param callBack 一般不用回调
     */
    offListeners(stockArray, callBack) {
        if (stockArray && stockArray.length > 0) {
            for (let i = 0; i < stockArray.length; i++) {
                ydBaseUrl.ref(stockArray[i]).off('value', (response) => {

                })
            }
        }
    },


    /**
     * 慧选股源达云监听股票 资金 变化
     * @param stockArray 需要监听的股票数组["SZ300375","SZ300375","SZ300375"]
     * @param Callback 返回的
     */
    addListenersZiJin(stockArray, callBack) {
        if (stockArray && stockArray.length > 0) {
            for (let i = 0; i < stockArray.length; i++) {
                ydBaseZiJinUrl.ref(stockArray[i]).on("value", (response) => {
                    // console.log("股票回复===对象",response);
                    if (response.code == 0 && response.nodeContent) {
                        let stockMess = response.nodeContent;
                        stockMess.code = stockArray[i];
                        //console.log("股票回复===对象",objStockMess);
                        if (callBack) {
                            callBack(stockMess)
                        }
                    }
                })
            }
        }
    },

    /**
     * 慧选股源达云解监听股票 资金 变化
     * @param stockArray 需要解监听的股票数组["SZ300375","SZ300375","SZ300375"]
     * @param callBack 一般不用回调
     */
    offListenersZiJin(stockArray, callBack) {
        if (stockArray && stockArray.length > 0) {
            for (let i = 0; i < stockArray.length; i++) {
                ydBaseZiJinUrl.ref(stockArray[i]).off('value', (response) => {

                })
            }
        }
    },

    /**
     * 慧选股源达云获取股票代码的行情
     * @param stockArray 需要监听的股票数组["SZ300375","SZ300375","SZ300375"]
     * @param Callback 返回的[{},{},{}]
     */
    getStockListInfo(stockArray, callBack) {
        if (stockArray && stockArray.length > 0) {
            let stockNumber = 0;
            let stockList = [];
            for (let i = 0; i < stockArray.length; i++) {
                ydBaseUrl.ref(stockArray[i]).get((response) => {
                    if (response.code == 0 && response.nodeContent) {
                        let stockMess = response.nodeContent.replace(/</g, "{").replace(/>/g, "}").replace(/\$/g, ":");
                        let objStockMess = JSON.parse(stockMess);
                        stockList.push(objStockMess)
                    }
                    stockNumber++;
                    if (stockNumber === stockArray.length) {
                        if (callBack) {
                            callBack(stockList)
                        }
                    }
                });
            }
        }
    },
    /**
     * 慧选股源达云获取股票代码的资金信息
     * @param stockArray 需要监听的股票数组["SZ300375","SZ300375","SZ300375"]
     * @param Callback 返回的[{},{},{}]
     */
    getStockZJListInfo(stockArray, callBack) {
        if (stockArray && stockArray.length > 0) {
            let stockNumber = 0;
            let stockList = [];
            for (let i = 0; i < stockArray.length; i++) {
                ydBaseZiJinUrl.ref(stockArray[i]).get((response) => {
                    if (response.code == 0 && response.nodeContent) {
                        let stockMess = response.nodeContent;
                        stockMess.code = stockArray[i];
                        stockList.push(stockMess)
                    }
                    stockNumber++;
                    if (stockNumber === stockArray.length) {
                        if (callBack) {
                            callBack(stockList)
                        }
                    }
                });
            }
        }
    },


    /**
     * 获取当前是否是开盘的状态
     * @param callback 回调是否开盘 true 或者false
     * */
    isOpeningQuotation(callBack) {
        calander.orderByKey().limitToLast(1).firstLevel().get((response) => {
            if (response.code == 0) {
                //数据转换
                let Dates = Object.keys(response.nodeContent);
                if (Dates[Dates.length - 1] == this.getToDayDate()) {
                    //是交易日
                    if (this.getOpeningQuotation() === true) {
                        //开盘中
                        callBack(true);
                    } else {
                        //未开盘或者收盘了
                        callBack(true);
                    }
                } else {
                    //不是交易日
                    callBack(false);
                }
            }
        })
    },

    /**
     * 获取今天的日期
     * 返回为字符串
     * 20190828
     * */
    getToDayDate() {
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString();
        let day = date.getDate().toString();
        return year + '' + (month.length > 1 ? month : "0" + month) + (day.length > 1 ? day : "0" + day);
    },

    /**
     * 判断今天是否开盘,大于9点半开盘，小于9点半没开盘
     * 返回为布尔值
     * false未开盘，true开盘
     * */
    getOpeningQuotation() {
        let date = new Date();
        let hours = date.getHours().toString();
        let mintutes = date.getMinutes().toString();
        if (parseInt(hours) > 9) {
            return true;
        } else if (parseInt(hours) === 9) {
            if (parseInt(mintutes) >= 30) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}