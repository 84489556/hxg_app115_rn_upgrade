"use strict";
import React, { Component } from "react";
import { DeviceEventEmitter, NativeEventEmitter, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, AppState, NativeModules } from "react-native";
import Toast from "react-native-easy-toast";
import Orientation from "react-native-orientation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AllActions from "../../actions/AllActions";
import * as cyURL from "../../actions/CYCommonUrl";
import RequestInterface from "../../actions/RequestInterface";
import * as baseStyle from "../../components/baseStyle";
import DateFormatText from "../../components/DateFormatText";
import ExpandedView, { TouchFlag } from "../../components/ExpandedView";
import ModalDropdown from "../../components/ModalDropdown.js";
import NavigationTitleView from '../../components/NavigationTitleView';
import { YDAnnouncementList, YDNewsList } from "../../components/NewsList";
import StockInfoView from "../../components/StockInfoView";
import StockPriceView from "../../components/StockPriceView";
import { StaticTabBarItem } from "../../components/TabBar";
import TabBarOriginal from "../../components/TabBarOriginal";
import UpDownButton from "../../components/UpDownButton";
import ShareSetting from "../../modules/ShareSetting";
import BaseComponentPage from '../../pages/BaseComponentPage';
import { PopupPromptView } from '../../pages/Course/IndexStudyCoursePage';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { isBQuote, isLandscape, Utils } from "../../utils/CommonUtils";
import { has } from '../../utils/IndexCourseHelper';
import UserInfoUtil from "../../utils/UserInfoUtil";
import NoUsedPage, { hangQing_detail } from "../NoUsedPage";
import ChartHeader from "./ChartHeader.js";
import ConstituentListForFundFlow from "./ConstituentListForFundFlow";
import ConstituentList from "./ConstituentList_iOS";
import { getStockCodeType } from "./DownLoadStockCode";
import { DZHKlineChart } from "./KlineChart";
import DZHMinChart from "./MinChart";
import PanKou from "./PanKou";
import { connection } from "./YDYunConnection";
import { WebView } from 'react-native-webview';
import { sensorsDataClickObject, sensorsDataClickActionName } from "../../components/SensorsDataTool";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';

const graphHeight = 325;
const icon_move_right = require("../../images/icons/arrow_move_right.png");
const icon_move_left = require("../../images/icons/arrow_move_left.png");

const _secondButtonsThreshold = 4;

const { YDYunChannelModule } = NativeModules;
const YDYunChannelModuleEmitter = new NativeEventEmitter(YDYunChannelModule);

export class DetailPage extends BaseComponentPage {
  constructor(props) {
    super(props);
    this.state = {
      objs: [],
      obj: null,
      type: null,
      time: null,
      scalesPageToFit: true,
      f10Url: "",
      earningsUrl: '', // 个股收益统计url
      showPanKou: true,
      f10Height: baseStyle.height,
      priceboxData: null,
      previousPriceboxData: null,
      curGraphIndex: 0,
      chartHeaderData: [],
      viceHeaderData: [],
      viceHeaderData1: [],
      refresh: 0,
      showPriceBox: false,
      scrollTouch: true, //scroll是否禁止滑动  为解决滑动十字光标时 移动scroll
      zhangF: 0, //0 ：降序，由大到小  1：升序，有小到大  2：默认排序
      xianJ: 2,
      curMinMainFormulaIdx: 0,
      curMinFutuFormulaIdx: 0,
      curKLineIndexCombination: 0, // 当前选择的指标组合，默认选中主升浪
    };
    this.layout = {};
    ShareSetting.reset();
    ShareSetting.setCurGraphIndex(0);
    //用来记录循环切换股票的变量
    this.loopStock = 0;
    this._onDropDownMenu = this._onDropDownMenu.bind(this);
    this.renderRow4ModalDropdown = this.renderRow4ModalDropdown.bind(this);
    this.getDropdownRef = this.getDropdownRef.bind(this);
    this.lineHeightDropdown = 25; // 下拉选择框item高度
    this.optionDropdown = ["1分", "5分", "15分", "30分", "60分"];
    //横屏按钮是否被点击
    this.BeClick = false;
    this.changeFlag = true;
    //底部tab初始索引
    this.tabIndex = 0;
    //引导图
    isUseGesture:'0';
  }

  pageWillActive() {
    // 切换前加载动态行情数据
    this.preLoad = true;
    if (this.props.navigation.state.params.tabIndex) {
      this.tabIndex = this.props.navigation.state.params.tabIndex
    }
    let obj = this.props.navigation.state.params.Obj;
    //新加股票切换列表数组
    let objs = this.props.navigation.state.params.array ? this.props.navigation.state.params.array : [];
    let name = this.props.navigation.state.params.ZhongWenJianCheng;
    //获取当前的显示股票在列表中的位置，并判断是否超过101支
    this.loopStock = parseInt(this.props.navigation.state.params.index);
    let formatArray = [];
    let temp1 = [];
    let temp2 = [];
    let temp3 = [];
    if (objs.length > 100) {
      //够101只股票
      if (this.loopStock > 50) {
        if (objs.length - this.loopStock < 50) {
          temp1 = objs.slice(this.loopStock, objs.length);//当前到最后
          temp2 = objs.slice(this.loopStock - 50, this.loopStock);//前50到当前
          temp3 = objs.slice(0, 50 - (objs.length - this.loopStock));//0到前几个
          temp1 = temp1.concat(temp3);
          formatArray = temp2.concat(temp1);
        } else {
          temp1 = objs.slice(this.loopStock, this.loopStock + 50);
          temp2 = objs.slice(this.loopStock - 50, this.loopStock);
          formatArray = temp2.concat(temp1);
        }
      } else {
        temp1 = objs.slice(this.loopStock, this.loopStock + 50);
        temp2 = objs.slice(0, this.loopStock);
        temp3 = objs.slice(objs.length - (50 - this.loopStock), objs.length);
        temp3 = temp3.concat(temp2);
        formatArray = temp3.concat(temp1);
      }
      this.loopStock = 50;
    } else {
      //不够100只股票
      formatArray = objs;
    }
    this.setState({
      obj: obj,
      f10Url: this.makeF10Url(obj),
      earningsUrl: this.makeEarningUrl(obj),
      //将传过来的数组进行处理放入要切换的数组中
      objs: formatArray,
      ZhongWenJianCheng: name
    });
    Orientation.lockToPortrait();
    // Orientation.unlockAllOrientations();
  }

  pageDidActive() {
    let obj = this.props.navigation.state.params.Obj;
    // 记录股票查看历史
    const { addHistoryStock } = this.props.actions;
    if (this.props.navigation.state.params.fromPage && this.props.navigation.state.params.fromPage == "searchPage") {
      addHistoryStock({ Obj: obj, ZhongWenJianCheng: this.props.navigation.state.params.ZhongWenJianCheng });
    }

    this.setState({ curGraphIndex: ShareSetting.getCurGraphIndex() });
    this.refs.periodTab && this.refs.periodTab.changeActiveTab(ShareSetting.getCurGraphIndex());

    if (ShareSetting.getCurGraphIndex() > 0) {
      if (this.refs.kchart) {
        this.refs.kchart._onPickFormula(
          ShareSetting.getCurrentMainFormulaName()
        );
        this.refs.kchart._onPickFormula(
          ShareSetting.getCurrentAssistFormulaName()
        );

        let splitName = ShareSetting.getCurrentEmpowerName();
        let split = ShareSetting.getEmpowerIndexByName(splitName);
        this.refs.kchart._onChangeEmpower(split);
      }
    }

    // 切换后加载分时图和新闻数据
    this.postLoad = true;

    this.forceUpdate();
    this._getStockType(this.props.navigation.state.params.Obj);
  }
  // 获取商品类型 个股或指数
  _getStockType(code) {
    getStockCodeType(code, value => {
      if (value === 0) {
        this.setState({ type: 0 });
      } else {
        this.setState({ type: 1 });
      }
    });
  }
  componentWillMount() {
    this.landListener = DeviceEventEmitter.addListener("landOut", value => {
      if (value) {
        Orientation.removeOrientationListener(this._orientationDidChange);
      }
    });
  }

  componentDidMount() {
    this.pageWillActive();
    this.pageDidActive();
    // DeviceEventEmitter.emit("pageName", "行情新闻");

    Utils.postToHotStock(
      RequestInterface.HXG_BASE_URL + '/hotStockCodes/hotStock',
      this.props.navigation.state.params.Obj,
      this.props.navigation.state.params.ZhongWenJianCheng
    );

    this._setDefaultFomulaData();

    //k线设置页面设置前后复权通知
    this.listenerKLine = DeviceEventEmitter.addListener("KLineSetPage", info => {
      let split = ShareSetting.getEmpowerIndexByName(info);
      this.refs.kchart && this.refs.kchart._onChangeEmpower(split);
    });
    this.listenerSearchPage = DeviceEventEmitter.addListener("searchPage", info => {
      const { addHistoryStock } = this.props.actions;
      let data = info;
      addHistoryStock({ Obj: data.Obj, ZhongWenJianCheng: data.ZhongWenJianCheng });
      if (data) {
        this.setState({
          obj: data.Obj,
          objs: data.array,
          ZhongWenJianCheng: data.ZhongWenJianCheng,
          isShowChaJiaTime: false,
          f10Url: this.makeF10Url(data.Obj),
          earningsUrl: this.makeEarningUrl(data.Obj)
        });
      }
    });

    this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
      //插入一条数据
      BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.geguxiangqing);
    });

    AppState.addEventListener('change', this._handleAppStateChange);

    let retryCount = 0
    this.hannelModuleListener = YDYunChannelModuleEmitter.addListener('fetchDataErrorEvent', ev => {
      this._cancel()
      if (retryCount <= 5) {
        this.retryTimer = setTimeout(() => {
          this._requery()
        }, 3000);
      }
    })

    //引导图
    AsyncStorage.getItem('ISUSEGESTRUE', (errs, result) => {
      if (!errs) {
         this.setState({isUseGesture:result});
       }
   })

  }

  //应用前后台监听方法
  _handleAppStateChange = (nextAppState) => {

    if (nextAppState === 'active') {
      NetInfo.fetch().then((connectionInfo) => {
        if (connectionInfo.type != 'none' && connectionInfo.type != 'NONE') {
          //console.log('stock-http---_handleAppStateChange-----'+nextAppState );
          this._requery()
        }
      });
    } else if (nextAppState === 'background') {
      //进入后台时，取消当前的连接
      this._cancel()
    } else if (nextAppState === 'inactive') {
      //进入后台时，储存一个上次退出时间，ios有过渡时间的方法，在这个方法做操作
      // 只要退出后台就断开连接   回到前台重新连接  不做时间记录
    }
  };

  _requery = () => {
    //进回到前台时，开启当前页面的连接
    this.headTitleTimeView && this.headTitleTimeView.query()
    this.sis && this.sis._requery();
    this.spv && this.spv._requery();
    DeviceEventEmitter.emit('requeryRequestData');
    this.pankou && this.pankou.requery()
    this.minChart && this.getMinInDetailPageRef() && this.getMinInDetailPageRef().query();
    this.refs && this.refs.kchart && this.refs.kchart._query()
  }

  _cancel = () => {
    this.headTitleTimeView && this.headTitleTimeView.cancel()
    this.sis && this.sis.cancel();
    this.spv && this.spv.cancel();
    DeviceEventEmitter.emit('cancelRequstData');
    this.pankou && this.pankou.cancel()
    this.minChart && this.getMinInDetailPageRef() && this.getMinInDetailPageRef().cancel();
    this.refs && this.refs.kchart && this.refs.kchart.cancel()
    // connection.resetInit();
  }

  getMinInDetailPageRef() {
    let ref = this.minChart && this.minChart.getWrappedInstance()
    return  ref
}

  // 初始化默认选中的指标
  _setDefaultFomulaData() {
    let first = "蓝粉彩带"
    let second = "底部出击"
    let third = "操盘提醒"

    AsyncStorage.multiGet(["mainFormula", "viceFormula", "chartLoc"], (error, result) => {
      // 判断权限
      if (ShareSetting.isMainTarget(result[0][1])) {
        first = result[0][1];
      }
      if (ShareSetting.isLoopTarget(result[1][1])) {
        second = result[1][1];
      }
      if (ShareSetting.isLoopTarget(result[2][1])) {
        third = result[2][1];
      }

      ShareSetting.selectFormula(first);
      ShareSetting.selectFormula(second);
      ShareSetting.selectVice2Formula(third);

      //默认指标组合
      if (first == '蓝粉彩带' && second == '底部出击' && third == '操盘提醒') {
        this.setState({ curKLineIndexCombination: 0 });
      } else if (first == '蓝粉彩带' && second == '底部出击' && third == '主力动态') {
        this.setState({ curKLineIndexCombination: 1 });
      } else {
        this.setState({ curKLineIndexCombination: -1 });
      }
    });
  }
  componentWillUnmount() {
    Orientation.removeOrientationListener(this._orientationDidChange);
    this.landListener.remove();
    this.listenerKLine && this.listenerKLine.remove();
    this.listenerSearchPage && this.listenerSearchPage.remove();
    this.willFocusSubscription && this.willFocusSubscription.remove();
    this.hannelModuleListener && this.hannelModuleListener.remove()
    this.retryTimer && clearTimeout(this.retryTimer)
    AppState.removeEventListener('change', this._handleAppStateChange);
    //离开页面事重置默认缩放比例
    ShareSetting.setIndexOfKLineNumber(5);
    //离开页面事重置默认缩放比例
    this.refs && this.refs.kchart && this.refs.kchart._onChangeDefaultIndex(5);
    const { callback } = this.props.navigation.state.params;
    if (typeof callback === "function") {
      callback();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.obj !== this.state.obj) {
      this._getStockType(nextState.obj)
    }
    return true;
  }

  // 从横屏接收回传数据
  returnFromLand = landObj => {
    Orientation.unlockAllOrientations();
    let a = ShareSetting.getCurrentEmpowerName();
    let split = ShareSetting.getEmpowerIndexByName(a);
    this.refs.kchart && this.refs.kchart._onChangeEmpower(split);
    let array = [];
    array = landObj.array && landObj.array;
    this.loopStock = landObj.index;
    array.map((item, index) => {
      if (index !== 2) {
        if (this.refs.kchart) {
          this.refs.kchart._onPickFormula(item);
        }
      } else {
        // 接收传递的周期栏index
        if (this.state.curGraphIndex !== item) {
          ShareSetting.setCurGraphIndex(item);
          this.setState({ curGraphIndex: item }, () => {
            this.refs.dropDown && this.getDropdownRef().select(item - _secondButtonsThreshold);
          });
        }
      }
    });
    this.setState({
      obj: landObj.obj,
      objs: landObj.objs,
      ZhongWenJianCheng: landObj.ZhongWenJianCheng,
      f10Url: this.makeF10Url(landObj.obj),
      earningsUrl: this.makeEarningUrl(landObj.Obj)
    });
  };
  _onMinMainDropDownMenu(idx, lableText) {
    this.setState({ curMinMainFormulaIdx: idx })
    this.sensorsAddIndex("主图指标", lableText, 'K线分时')
  }

  _onMinFutuDropDownMenu(idx, lableText) {
    this.setState({ curMinFutuFormulaIdx: idx })
    this.sensorsAddIndex("副图指标", lableText, 'K线分时')
  }
  sensorsAddIndex(type, name, entrance) {
    sensorsDataClickObject.addIndex.index_name = name;
    sensorsDataClickObject.addIndex.index_type = type;
    sensorsDataClickObject.addIndex.entrance = entrance;
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addIndex);

  }

  //新增下拉控件方法
  _onDropDownMenu(idx, lableText) {
    sensorsDataClickObject.adKClick.stock_code = this.state.obj;
    sensorsDataClickObject.adKClick.function_zone = '分时K线区';
    sensorsDataClickObject.adKClick.content_name = lableText;
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)
    this.setState({ curGraphIndex: Number(idx) + _secondButtonsThreshold });
    ShareSetting.setCurGraphIndex(Number(idx) + _secondButtonsThreshold);
    this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();
  }
  //新增下拉控件方法
  renderRow4ModalDropdown(rowData, rowID, highlighted, width) {
    return (
      <View style={{ width: width, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center", height: this.lineHeightDropdown }}>
        <Text style={{ color: highlighted ? baseStyle.WHITE : baseStyle.WHITE, fontSize: 12 }}>{rowData}</Text>
      </View>
    );
  }

  _orientationDidChange = orientation => {
    AsyncStorage.getItem("routeName").then(value => {
      if (orientation == "LANDSCAPE" && value.indexOf("DetailPage") === 0) {

      } else if (orientation === "PORTRAIT") {
        this.setState({ refresh: 1, curGraphIndex: ShareSetting.getCurGraphIndex() });
        this.refs.dropDown && this.getDropdownRef().select(ShareSetting.getCurGraphIndex() - _secondButtonsThreshold);
      }
    });
  };
  _renderTitle() {
    let strs = this.state.ZhongWenJianCheng && this.state.ZhongWenJianCheng.split("(");
    let strName = "";
    if (strs) {
      strName = strs[0];
    }
    let strTitleObj = this.state.obj && this.state.obj.substring(2, 8);
    let strTitleParams = this.props.navigation.state.params.obj && this.props.navigation.state.params.obj.substring(2, 8);
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          {this.state.objs.length > 1 ? (
            <TouchableOpacity
              style={{ marginRight: 10, height: 40, width: 40, alignItems: "flex-end", justifyContent: "center" }}
              onPress={() => {
                if (this.changeFlag) {
                  this.changeFlag = false;
                  if (parseInt(this.loopStock) === 0) {
                    this.loopStock = this.state.objs.length - 1;
                    let data = this.state.objs[this.loopStock];
                    if (data) {
                      this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();
                      this.setState({
                        obj: data.Obj,
                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                        isShowChaJiaTime: false,
                        f10Url: this.makeF10Url(data.Obj),
                        earningsUrl: this.makeEarningUrl(data.Obj)
                      }, () => {
                        this.timer = setTimeout(() => {
                          this.changeFlag = true;
                          clearTimeout(this.timer);
                          this.timer = undefined;
                        }, 1000);
                      });
                    } else {
                      this.timer = setTimeout(() => {
                        this.changeFlag = true;
                        clearTimeout(this.timer);
                        this.timer = undefined;
                      }, 1000);
                    }
                  } else {
                    this.loopStock--;
                    let data = this.state.objs[this.loopStock];
                    if (data) {
                      this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();
                      this.setState({
                        obj: data.Obj,
                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                        isShowChaJiaTime: false,
                        f10Url: this.makeF10Url(data.Obj),
                        earningsUrl: this.makeEarningUrl(data.Obj)
                      }, () => {
                        this.timer = setTimeout(() => {
                          this.changeFlag = true;
                          clearTimeout(this.timer);
                          this.timer = undefined;
                        }, 1000);
                      });
                    } else {
                      this.timer = setTimeout(() => {
                        this.changeFlag = true;
                        clearTimeout(this.timer);
                        this.timer = undefined;
                      }, 1000);
                    }
                  }
                }
              }}>
              <Image source={require("../../images/icons/pre_btn.png")} />
            </TouchableOpacity>
          ) : null}
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: '#000000', fontSize: 16 }}>{strName}</Text>
              <Text style={{ marginLeft: 10, color: '#000000', fontSize: 16 }}>{this.state.obj ? strTitleObj : strTitleParams}</Text>
            </View>
            {this.state.isShowChaJiaTime ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start" }}>
                <DateFormatText style={{ fontSize: 12, color: '#00000066' }} format="YYYY-MM-DD" dateTime={this.state.kline_time}></DateFormatText>
              </View>
            ) : this.props.ShiJian === 0 ? (
              <View />
            ) : (
                  <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-start" }}>
                    <HeadTitleTime
                      ref={ref => (this.headTitleTimeView = ref)}
                      navigation={this.props.navigation}
                      timeColor={'#00000066'}
                      curGraphIndex={this.state.curGraphIndex}
                      showPriceBox={this.state.showPriceBox}
                      time={this.state.time ? this.state.time : this.props.ShiJian}
                      params={
                        this.postLoad && (this.state.obj ? { obj: this.state.obj } : { obj: this.props.navigation.state.params.Obj })
                      } />
                  </View>
                )}
          </View>
          {this.state.objs.length > 1 ? (
            <TouchableOpacity
              style={{ marginLeft: 10, height: 40, width: 40, alignItems: "flex-start", justifyContent: "center" }}
              onPress={() => {
                if (this.changeFlag) {
                  this.changeFlag = false;
                  if (parseInt(this.loopStock) === this.state.objs.length - 1) {
                    this.loopStock = 0;
                    let data = this.state.objs[this.loopStock];
                    if (data) {
                      this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();
                      this.setState({
                        obj: data.Obj,
                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                        showPriceBox: false,
                        f10Url: this.makeF10Url(data.Obj),
                        earningsUrl: this.makeEarningUrl(data.Obj)
                      }, () => {
                        this.timer = setTimeout(() => {
                          this.changeFlag = true;
                          clearTimeout(this.timer);
                          this.timer = undefined;
                        }, 1000);
                      });
                    } else {
                      this.timer = setTimeout(() => {
                        this.changeFlag = true;
                        clearTimeout(this.timer);
                        this.timer = undefined;
                      }, 1000);
                    }
                  } else {
                    this.loopStock++;
                    let data = this.state.objs[this.loopStock];
                    if (data) {
                      this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();
                      this.setState({
                        obj: data.Obj,
                        ZhongWenJianCheng: data.ZhongWenJianCheng,
                        showPriceBox: false,
                        f10Url: this.makeF10Url(data.Obj),
                        earningsUrl: this.makeEarningUrl(data.Obj)
                      }, () => {
                        this.timer = setTimeout(() => {
                          this.changeFlag = true;
                          clearTimeout(this.timer);
                          this.timer = undefined;
                        }, 1000);
                      });
                    } else {
                      this.timer = setTimeout(() => {
                        this.changeFlag = true;
                        clearTimeout(this.timer);
                        this.timer = undefined;
                      }, 1000);
                    }
                  }
                }
              }}>
              <Image source={require("../../images/icons/next_btn.png")} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  openNewsPage(title, news) {
    let data;
    if (title == "新闻") {
      data = {
        title: news.xwbt,
        source: news.xwly,
        date: news.xwrq,
        url: cyURL.urlDetailNews + "?url=" + news.url
      };
    } else {
      data = {
        title: news.ggbt,
        source: news.ggly,
        date: news.ggrq,
        url: cyURL.urlNews + news.fjdz.substring(0, 1) == "/" ? news.fjdz.substring(1) : news.fjdz
      };
    }
    Navigation.pushForParams(this.props.navigation, "NewsDetailPage", {
      news: data,
      title
    });
  }

  makeF10Url(obj) {
    if (obj === undefined) return '';
    var market = obj.substr(0, 2);
    var code = obj.substr(2, 6);
    var url = `https://emh5.eastmoney.com/html/?color=w&fc=${code}${
      market == 'SH' ? '01' : market == 'SZ' ? '02' : '00'
      }`;
    return url;
  }

  makeEarningUrl(obj) {
    if (obj === undefined) return '';
    var url = cyURL.ydhxgProdUrl + 'sytj?code=' + obj
    return url;
  }

  _displayBuySellComponent() {
    let b = !this.state.showPanKou;
    this.setState({ showPanKou: b });
  }

  _dataCallback(priceData, previousPriceData) {
    let mmain = ShareSetting.getCurrentMainFormulaName();
    let vvice = ShareSetting.getCurrentAssistFormulaName();
    let vvice1 = ShareSetting.getCurrentVice2FormulaName();
    this.setState({}, () => {
      if (this.refs.kchart) {
        this.refs.kchart._onPickFormula(mmain);
        this.refs.kchart._onPickFormula(vvice);
        this.refs.kchart._onPickFormula({ chartLoc: vvice1 });
      }
    });
  }

  _dataCallback1(priceData, previousPriceData) {
    this.setState({ priceboxData: priceData, previousPriceboxData: previousPriceData });
  }

  getPeriodText() {
    let text = "1day";
    if (this.state.curGraphIndex === 1) text = "1day";
    if (this.state.curGraphIndex === 2) text = "week";
    if (this.state.curGraphIndex === 3) text = "month";
    if (this.state.curGraphIndex === 4) text = "1min";
    if (this.state.curGraphIndex === 5) text = "5min";
    if (this.state.curGraphIndex === 6) text = "15min";
    if (this.state.curGraphIndex === 7) text = "30min";
    if (this.state.curGraphIndex === 8) text = "60min";

    return text;
  }

  _popToSearchPage() {
    Navigation.pushForParams(this.props.navigation, "SearchPage", {
      fromPage: "DetailPage",
      entrance: '股票详情'
    });
    sensorsDataClickObject.searchClick.entrance = 'K线图'
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick)
  }

  // 详情页面图片上面的view 展示股票实时价格 涨跌幅等信息
  renderDynaComponent() {
    let Obj = this.state.obj;
    let ZhongWenJianCheng = this.state.ZhongWenJianCheng;
    let personalButton = UserInfoUtil.isPersonStock(Obj) ?
      <TouchableOpacity style={{ flex: 1 }} onPress={() => {
        if (this.state.obj && this.state.obj !== undefined) {
          UserInfoUtil.deletePersonStock(Obj, ZhongWenJianCheng, () => {
            this.refs.toast && this.refs.toast.show("已删除");
          }, () => {
            this.refs.toast && this.refs.toast.show("移除失败");
          });
        }
      }}>
        <Image source={require("../../images/icons/detail2_personal_remove.png")} />
      </TouchableOpacity> :
      <TouchableOpacity style={{ flex: 1 }} onPress={() => {
        if (this.state.obj && this.state.obj !== undefined) {
          UserInfoUtil.addPersonStock(Obj, () => {
            sensorsDataClickObject.addStock.stock_code = this.state.obj;
            sensorsDataClickObject.addStock.stock_name = this.state.ZhongWenJianCheng;
            sensorsDataClickObject.addStock.page_source = '个股详情'
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addStock);
            this.refs.toast && this.refs.toast.show("已添加");
          }, (error) => {
            this.refs.toast && this.refs.toast.show(error);
          });
        }
      }}>
        <Image source={require("../../images/icons/detail2_personal_add.png")} />
      </TouchableOpacity>
    return (
      <View>
        <View style={{ backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, paddingRight: 12 }} >
          <View style={{ flex: 1 }}>
            <StockPriceView
              navigation={this.props.navigation}
              onData={() => { }}
              ref={ref => (this.spv = ref)}
              params={this.preLoad && this.state.obj && { obj: this.state.obj }}
              dynaData={this.state}
              priceboxData={this.state.priceboxData}
              previousPriceboxData={this.state.previousPriceboxData}
              isHorz={0}
            />
          </View>
          <View style={{ position: "absolute", right: 12 }}>{personalButton}</View>
        </View>
        <StockInfoView
          navigation={this.props.navigation}
          onData={() => { }}
          ref={ref => (this.sis = ref)}
          params={this.preLoad && this.state.obj && { obj: this.state.obj }}
          dynaData={this.state}
          priceboxData={this.state.priceboxData}
          previousPriceboxData={this.state.previousPriceboxData}
          isHorz={0}
        />
      </View>
    );
  }

  // 接收到子组件传递的值，调用刷新方法
  callbackChartLoc = item => {
    let loopFormulas = ShareSetting.getLoopFormula();
    let formula = loopFormulas[item];
    let chartLoc = { chartLoc: formula };
    if (this.refs.kchart) {
      this.refs.kchart._onPickFormula(chartLoc);
    }

    let first = ShareSetting.getCurrentMainFormulaName();
    let second = ShareSetting.getCurrentAssistFormulaName();
    let third = ShareSetting.getCurrentVice2FormulaName();

    ShareSetting.selectFormula(first);
    ShareSetting.selectFormula(second);
    ShareSetting.selectVice2Formula(third);
    this.sensorsAddIndex('副图标指标', third, 'K线页副图1点击')
    //指标组合
    if (first == '蓝粉彩带' && second == '底部出击' && third == '操盘提醒') {
      this.setState({ curKLineIndexCombination: 0 });
    } else if (first == '蓝粉彩带' && second == '底部出击' && third == '主力动态') {
      this.setState({ curKLineIndexCombination: 1 });
    } else {
      this.setState({ curKLineIndexCombination: -1 });
    }
  };
  // 接收到子组件传递的值，调用刷新方法
  callbackVice = item => {
    let loopFormulas = ShareSetting.getLoopFormula();
    let formula = loopFormulas[item];
    if (this.refs.kchart) {
      this.refs.kchart._onPickFormula(formula);
    }

    let first = ShareSetting.getCurrentMainFormulaName();
    let second = ShareSetting.getCurrentAssistFormulaName();
    let third = ShareSetting.getCurrentVice2FormulaName();

    ShareSetting.selectFormula(first);
    ShareSetting.selectFormula(second);
    ShareSetting.selectVice2Formula(third);
    this.sensorsAddIndex('副图标指标', second, 'K线页副图2点击')
    //指标组合
    if (first == '蓝粉彩带' && second == '底部出击' && third == '操盘提醒') {
      this.setState({ curKLineIndexCombination: 0 });
    } else if (first == '蓝粉彩带' && second == '底部出击' && third == '主力动态') {
      this.setState({ curKLineIndexCombination: 1 });
    } else {
      this.setState({ curKLineIndexCombination: -1 });
    }
  };

  callbackPriceBox = item => {
    this.setState({ showPriceBox: item });
  };
  // k线查价日期回调
  callbackHeadTime = item => {
    this.setState({ kline_time: item, isShowChaJiaTime: true });
  };

  //监控 外层scroll是否禁止滑动
  callbackScrollTouch = item => {
    if (this.state.enableScrollViewScroll === false && item === false) return;
    this.setState({ scrollTouch: item });
  };

  // 用于接收子页面回传数据
  returnData = array => {
    if (!array.length) return;
    let first = array[0], second = array[1], third = array[2];
    this.sensorsAdCIndex(first, second, third)
    if (first == '蓝粉彩带' && second == '底部出击' && third == '操盘提醒') {
      this.setState({ curKLineIndexCombination: 0 });
    } else if (first == '蓝粉彩带' && second == '底部出击' && third == '主力动态') {
      this.setState({ curKLineIndexCombination: 1 });
      // } else if (first == '九转战法' && second == 'MACD') {
      //   this.setState({ curKLineIndexCombination: 2 });
    } else {
      this.setState({ curKLineIndexCombination: -1 });
    }
    array.map((item, i) => {
      if (i === 2) {
        let chartLoc = { chartLoc: item };
        if (this.refs.kchart) {
          this.refs.kchart._onPickFormula(chartLoc);
        }
      } else {
        if (this.refs.kchart) {
          this.refs.kchart._onPickFormula(item);
        }
      }
    });
  };



  sensorsAdCIndex(main, first, second) {

    sensorsDataClickObject.adCIndex.main_name = main;
    sensorsDataClickObject.adCIndex.main_type = '主图指标';

    sensorsDataClickObject.adCIndex.futu1_name = first;
    sensorsDataClickObject.adCIndex.futu1_type = '副图1';

    sensorsDataClickObject.adCIndex.futu2_name = second;
    sensorsDataClickObject.adCIndex.futu2_type = '副图2';
    sensorsDataClickObject.adCIndex.combine_results = main + '+' + first + '+' + second;
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adCIndex);




  }

  // 弹出指标选择页面
  choseNormPage = () => {
    this.props.navigation.navigate("ChoseChartNorm", {
      choseData: {
        main: this.state.chartHeaderData[0],
        vice: this.state.viceHeaderData[0],
        vice1: this.state.viceHeaderData1[0]
      },
      returnData: this.returnData
    });
  };
  _onLayout(event) {
    this.layout = event.nativeEvent.layout;
  }

  // 学指标播放按钮事件
  _toPlayVideo(name) {
    Navigation.pushForParams(this.props.navigation, "TargetStudyPage", {
      name: name,
      fromPage: "DetailPage",
      refreshOrientionListener: () => {
        this.setState({ refresh: 1 });
      }
    });
  }

  getDropdownRef() {
    return this.refs && this.refs.dropDown && this.refs.dropDown.getWrappedInstance()
  }

  _minMainDropDownMenuOnSelect(idx, value) {

  }
  // 主升浪：{蓝粉彩带，底部出击，操盘提醒 }, 九转组合：{九转战法，MACD}, 蓝粉买点：{蓝粉彩带， 底部出击，主力动态}
  kLineIndexCombinationOnChanged(value, index) {
    if (this.state.curKLineIndexCombination == index) return;
    this.setState({}, () => {
      let permission = UserInfoUtil.getUserPermissions();
      if (index == 0) {
        this.refs.kchart._onPickFormula('蓝粉彩带');
        this.refs.kchart._onPickFormula('底部出击');
        this.refs.kchart._onPickFormula({ chartLoc: '操盘提醒' });
        this.setState({ curKLineIndexCombination: index });
        this.sensorsAddIndex('组合指标', '主升浪')
      } else {
        if (permission >= 3) {
          this.refs.kchart._onPickFormula('蓝粉彩带');
          this.refs.kchart._onPickFormula('底部出击');
          this.refs.kchart._onPickFormula({ chartLoc: '主力动态' });
          this.setState({ curKLineIndexCombination: index });
          this.sensorsAddIndex('组合指标', '蓝粉买点')
        } else if (permission == 1) {
          //电话提示框
          this.prompt && this.prompt.show();
        } else {
          sensorsDataClickObject.loginButtonClick.entrance = '行情详情'
          Navigation.pushForParams(this.props.navigation, 'LoginPage', {})
        }
      }


    });
  }
  // 设置/切换 图表 分时 日K 周K 月K
  renderKLineDropDown() {
    let tabs = [
      ShareSetting.getGraphPeriodNameByIndex(0),
      ShareSetting.getGraphPeriodNameByIndex(1),
      ShareSetting.getGraphPeriodNameByIndex(2),
      ShareSetting.getGraphPeriodNameByIndex(3)];
    return (
      <SegmentedView tabs={tabs} selectedIndex={this.state.curGraphIndex} tabOnChange={index => {
        if (index < _secondButtonsThreshold) {
          this.refs.dropDown && this.getDropdownRef().select(-1);
        }
        this.setState({ curGraphIndex: index });
        ShareSetting.setCurGraphIndex(index);
        this._dataCallback(null, null);
        this.refs && this.refs.kchart && this.refs.kchart._hidenPriceBox1();
        this.sensorsAppear(index)
      }} />
    );
  }
  // 分时主图指标选择框
  renderMinMainDropDown() {
    let mainoptions = ShareSetting.getMinMainFormula();
    return (
      <View style={{ borderColor: '#0000001a', borderWidth: 1, width: 72, height: 20, justifyContent: 'center' }}>
        <ModalDropdown
          supportedOrientations={['portrait']}
          ref="min_main_dropDown"
          forwardRef
          defaultValue={mainoptions[this.state.curMinMainFormulaIdx]}
          defaultIndex={0}
          onSelect={(idx, value) => this._onMinMainDropDownMenu(idx, value)}
          style={{
            width: 70,
            justifyContent: "center",
          }}
          textStyle={{
            textAlign: "center",
            fontSize: 12,
            color: '#000000'
          }}
          buttonStyle={{
            height: 20,
            justifyContent: "center",
            alignItems: "center"
          }}
          dropdownStyle={{
            height: 80,
            width: 70,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 16,
          }}
          options={mainoptions}
          renderRow={(rowData, rowID, highlighted) =>
            this.renderRow4ModalDropdown(rowData, rowID, highlighted, 70)
          }
          itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
          itemActiveOpacity={0.5}
        />
      </View>
    );
  }

  sensorsAppear(index) {
    switch (index) {
      case 0:
        sensorsDataClickObject.adKClick.content_name = '分时';
        break;
      case 1:
        sensorsDataClickObject.adKClick.content_name = '日K';
        break;
      case 2:
        sensorsDataClickObject.adKClick.content_name = '周K';
        break;

    }
    sensorsDataClickObject.adKClick.stock_code = this.state.obj;
    sensorsDataClickObject.adKClick.function_zone = '分时K线区';
    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)
  }

  // 分时副图指标选择框
  renderMinViceDropDown() {
    let futuoptions = ShareSetting.getMinFutuFormula();
    return (
      <View style={{ borderColor: '#0000001a', borderWidth: 1, width: 72, height: 20, justifyContent: 'center' }}>
        <ModalDropdown
          ref="min_vice_dropDown"
          forwardRef
          defaultValue={futuoptions[this.state.curMinFutuFormulaIdx]}
          defaultIndex={0}
          onSelect={(idx, value) => this._onMinFutuDropDownMenu(idx, value)}
          style={{
            width: 70,
            justifyContent: "center"
          }}
          textStyle={{
            textAlign: "center",
            fontSize: 12,
            color: '#000000'
          }}
          buttonStyle={{
            height: 20,
            justifyContent: "center",
            alignItems: "center"
          }}
          dropdownStyle={{
            height: 80,
            width: 70,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 16,
          }}
          options={futuoptions}
          renderRow={(rowData, rowID, highlighted) =>
            this.renderRow4ModalDropdown(rowData, rowID, highlighted, 70)
          }
          itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
          itemActiveOpacity={0.5}
        />
      </View>
    );
  }
  // 分时主图header
  _renderMinMainChartHeader() {
    let permission = UserInfoUtil.getUserPermissions();
    let mainName = ShareSetting.getMinMainFormula()[this.state.curMinMainFormulaIdx];
    return (
      permission >= 4 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
        <View style={{ flexDirection: 'row', height: 25, justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E5E5', paddingRight: this.state.showPanKou && this.state.type === 1 ? 15 : 0 }}>
          {this.renderMinMainDropDown()}
          <ChartHeader style={{ position: 'absolute', left: 80 }} items={this.state.chartHeaderData} />
          {
            has(mainName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(ShareSetting.getMinMainFormula()[this.state.curMinMainFormulaIdx]) }}>
              <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
              <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
            </TouchableOpacity>
          }
        </View> :
        <View style={{ flexDirection: 'row', height: 25, justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E5E5', paddingRight: this.state.showPanKou && this.state.type === 1 ? 15 : 0 }}>
          <ChartHeader items={this.state.chartHeaderData} />
          {
            has(mainName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(ShareSetting.getMinMainFormula()[this.state.curMinMainFormulaIdx]) }}>
              <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
              <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
            </TouchableOpacity>
          }
        </View>
    );
  }
  // 分时副图header
  _renderMinViceChartHeader() {
    let permission = UserInfoUtil.getUserPermissions();
    let viceTop = (graphHeight - 10 - 25 - 20 - 24) * 3 / 4 + 20 - 0.5;
    let viceName = ShareSetting.getMinFutuFormula()[this.state.curMinFutuFormulaIdx];
    return (
      permission == 5 && this.state.type == 1 && !isBQuote(this.state.obj.substr(2, 6)) ?
        <View style={{ width: (this.state.type == 1 && this.state.showPanKou) ? baseStyle.width - 15 - 125 : baseStyle.width - 30, position: 'absolute', height: 24, top: viceTop, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {this.renderMinViceDropDown()}
          <ChartHeader style={{ position: 'absolute', height: 20, left: 80, width: baseStyle.width - (has(viceName) ? 185 : 110), overflow: 'hidden' }} items={this.state.viceHeaderData} />
          {
            has(viceName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(ShareSetting.getMinFutuFormula()[this.state.curMinFutuFormulaIdx]) }}>
              <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
              <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
            </TouchableOpacity>
          }
        </View> :
        <View style={{ width: (this.state.type == 1 && this.state.showPanKou) ? baseStyle.width - 15 - 125 : baseStyle.width - 30, position: 'absolute', height: 24, top: viceTop, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ChartHeader style={{ height: 20 }} items={this.state.viceHeaderData} />
          {
            has(viceName) && <TouchableOpacity style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 5, borderLeftColor: '#99999966', borderLeftWidth: 1, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => { this._toPlayVideo(ShareSetting.getMinFutuFormula()[this.state.curMinFutuFormulaIdx]) }}>
              <Image style={{ marginLeft: 5, marginRight: 5, height: 16, width: 16 }} source={require('../../images/icons/zhibiao_bofang.png')} />
              <Text style={{ color: '#006ACC', fontSize: 12 }}>学指标</Text>
            </TouchableOpacity>
          }
        </View>
    );
  }

  //图表 📈
  renderChart() {
    let permission = UserInfoUtil.getUserPermissions();
    let dropDownTextclr = '#000000';
    let selectedDropDown = false;
    if (this.state.curGraphIndex > 3) {
      selectedDropDown = true;
      dropDownTextclr = '#F92400';
    }
    let periodText = this.getPeriodText();
    let tabBarSingleWidth = baseStyle.width / 6;
    // 主升浪：{蓝粉彩带，底部出击，操盘提醒 }, 蓝粉买点：{蓝粉彩带， RSI}
    let kLineIndexCombination = ['主升浪', '蓝粉买点'];
    let combinationName = kLineIndexCombination[this.state.curKLineIndexCombination];
    let viceName = ShareSetting.getCurrentAssistFormulaName();
    let vice2Name = ShareSetting.getCurrentVice2FormulaName();
    return (
      <View>
        <View style={{ flexDirection: "row", borderBottomColor: '#E5E5E5', borderBottomWidth: 1 }}>
          <View style={{ width: tabBarSingleWidth * _secondButtonsThreshold }}>
            {this.renderKLineDropDown()}
          </View>
          <View style={{ alignItems: "center", justifyContent: "center", width: tabBarSingleWidth }}>
            <ModalDropdown
              ref="dropDown"
              forwardRef
              defaultValue={"1分"}
              defaultIndex={this.state.curGraphIndex - _secondButtonsThreshold}
              onSelect={(idx, value) => this._onDropDownMenu(idx, value)}
              style={{
                width: tabBarSingleWidth,
                justifyContent: "center"
              }}
              textStyle={{
                textAlign: "center",
                fontSize: 15,
                color: dropDownTextclr
              }}
              buttonStyle={{
                height: 40,
                fontSize: 16,
                justifyContent: "center",
                alignItems: "center"
              }}
              dropdownStyle={{
                height: this.lineHeightDropdown * 5 + 4,
                width: 40,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 36,
                marginRight: 15
              }}
              options={this.optionDropdown}
              renderRow={(rowData, rowID, highlighted) =>
                this.renderRow4ModalDropdown(rowData, rowID, highlighted, 40)
              }
              itemUnderlayColorDropdown={baseStyle.TABBAR_BORDER_COLOR}
              itemActiveOpacity={0.5}
            />
            {selectedDropDown && <View style={{ width: 15, height: 3, borderRadius: 2.5, marginLeft: -10, backgroundColor: '#F92400' }} />}
          </View>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", alignItems: "center", height: 40, width: 40 }}
            hitSlop={{ top: 20, left: 10, bottom: 20, right: 20 }}
            onPress={() => {
              Navigation.pushForParams(this.props.navigation, "KLineSetPage", { curGraphIndex: this.state.curGraphIndex });
              sensorsDataClickObject.adKClick.stock_code = this.state.obj;
              sensorsDataClickObject.adKClick.function_zone = '分时K线区';
              sensorsDataClickObject.adKClick.content_name = '设置';
              SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adKClick)
            }}
          >
            <Image source={require("../../images/hq_kSet_set.png")} />
          </TouchableOpacity>
        </View>
        {
          this.state.curGraphIndex > 0 ? (
            <View
              onLayout={this._onLayout.bind(this)}
              style={{ height: 450, paddingLeft: 15, paddingRight: 15, paddingBottom: 5 }} >
              <DZHKlineChart
                callback={this._dataCallback.bind(this)}
                callbackF={this._dataCallback1.bind(this)}
                params={
                  this.state.obj && {
                    obj: this.state.obj,
                    period: periodText,
                    type: this.state.type
                  }
                }
                name={this.props.navigation.state.params.ZhongWenJianCheng}
                callback1={item => {
                  this.callbackChartLoc(item);
                }}
                callback2={item => {
                  this.callbackVice(item);
                }}
                callbackPriceBox={item => {
                  this.callbackPriceBox(item);
                }}
                callbackHeadTime={item => {
                  this.callbackHeadTime(item);
                }}
                callbackScrollTouch={item => {
                  this.callbackScrollTouch(item);
                }}
                navigation={this.props.navigation}
                ref="kchart"
                onMainFmlResult={data =>
                  this.setState({
                    chartHeaderData: data.main,
                    viceHeaderData: data.vice,
                    viceHeaderData1: data.vice1
                  })
                }
              />
              <ChartHeader
                style={{ position: "absolute", top: 0, left: 15, height: 30, width: baseStyle.width - 30, borderColor: baseStyle.LINE_BG_F1, borderTopWidth: 0 }}
                toPlayVideo={() => {
                  this._toPlayVideo(this.state.chartHeaderData[0].str);
                }}
                items={this.state.chartHeaderData}
                index={this.state.curGraphIndex}
                choseNormPage={this.choseNormPage}
              />
              {this._expandedView()}
              <ChartHeader
                style={{ height: 30, position: "absolute", top: 450 / 2 + 12.5, left: 15, width: baseStyle.width - 30, borderColor: baseStyle.LINE_BG_F1, borderTopWidth: 1 }}
                toPlayVideo={() => {
                  this._toPlayVideo(this.state.viceHeaderData[0].str);
                }}
                items={this.state.viceHeaderData}
                index={this.state.curGraphIndex}
                choseNormPage={this.choseNormPage}
              />
              {
                // B股不显示指标 副图1
                isBQuote(this.state.obj.substr(2, 6)) && ShareSetting.isBUnable(viceName) ?
                  <View pointerEvents='none'
                    style={{
                      height: 70, position: "absolute", top: 450 / 2 + 12.5 + 30, left: 15, width: baseStyle.width - 30, borderColor: baseStyle.LINE_BG_F1, borderTopWidth: 1,
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                    <Text style={{ alignItems: 'center', justifyContent: 'center', color: '#003366', fontSize: 12 }}>本指标不适用于当前品种</Text>
                  </View>
                  : null
              }
              <ChartHeader
                style={{ height: 30, position: "absolute", bottom: 79, left: 15, width: baseStyle.width - 30, borderColor: baseStyle.LINE_BG_F1, borderTopWidth: 1 }}
                toPlayVideo={() => {
                  this._toPlayVideo(this.state.viceHeaderData1[0].str);
                }}
                items={this.state.viceHeaderData1}
                index={this.state.curGraphIndex}
                choseNormPage={this.choseNormPage}
              />
              {
                // B股不显示指标 副图2
                isBQuote(this.state.obj.substr(2, 6)) && ShareSetting.isBUnable(vice2Name) ?
                  <View pointerEvents='none'
                    style={{
                      height: 70, position: "absolute", bottom: 79 - 70, left: 15, width: baseStyle.width - 30, borderColor: baseStyle.LINE_BG_F1, borderTopWidth: 1,
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                    <Text style={{ alignItems: 'center', justifyContent: 'center', color: '#003366', fontSize: 12 }}>本指标不适用于当前品种</Text>
                  </View>
                  : null
              }
            </View>
          ) : (
              <View style={{ height: graphHeight, justifyContent: "flex-end", paddingLeft: 15, paddingBottom: 10, paddingRight: this.state.showPanKou && this.state.type === 1 ? 0 : 15 }} >
                {this._renderMinMainChartHeader()}
                <View
                  style={{ flexDirection: "row", flex: 1 }}>
                  <View
                    //onLayout={(event) =>}
                    style={{ flex: 3, justifyContent: 'flex-end', borderBottomColor: '#E5E5E5', borderBottomWidth: 1 }}>
                    <DZHMinChart
                      ref={ref => (this.minChart = ref)}
                      forwardRef
                      navigation={this.props.navigation}
                      isDaPan={this.state.type}
                      mainName={ShareSetting.getMinMainFormulaNameByIndex(this.state.curMinMainFormulaIdx)}
                      viceName={ShareSetting.getMinFutuFormulaNameByIndex(this.state.curMinFutuFormulaIdx)}
                      params={
                        this.postLoad &&
                        this.state.obj && {
                          obj: this.state.obj
                        }
                      }
                      callbackScrollTouch={item => {
                        this.callbackScrollTouch(item);
                      }}
                      onMainFmlResult={data => {
                        this.setState({ chartHeaderData: data.main, viceHeaderData: data.vice })
                      }}
                    />
                    {// 盘口开关
                      this.state.type === 1 &&
                      <TouchableOpacity style={{ flex: 0, position: "absolute", alignSelf: "flex-end", top: 130 }} onPress={this._displayBuySellComponent.bind(this)}>
                        <Image source={this.state.showPanKou ? icon_move_left : icon_move_right} />
                      </TouchableOpacity>
                    }
                    {this.changeToLandscapeButton("chart")}
                    {this._renderMinViceChartHeader()}
                  </View>
                  {this.state.type === 1 && this.state.showPanKou === true && (
                    <View style={{ flex: 0, borderLeftWidth: 1, borderLeftColor: baseStyle.WUDANG_BORDER_COLOR, width: 125, backgroundColor: "#fff" }} >
                      <PanKou navigation={this.props.navigation} activeColor={"#F92400"} obj={this.postLoad && this.state.obj} ref={ref => (this.pankou = ref)} />
                      <View style={{ height: 1, width: 110, backgroundColor: baseStyle.WUDANG_BORDER_COLOR }} />
                    </View>
                  )}
                </View>
                {// 引导图
                      !this.state.isUseGesture&&(
                        <View style={{flex:1, position:'absolute',alignItems:'center',justifyContent: 'center'}}>
                        <TouchableOpacity onPress={() => {
                            AsyncStorage.setItem('ISUSEGESTRUE', '1', (errs) => {
                                if (!errs ) {
                                    this.setState({isUseGesture:'1'})
                                }    
                            });
                        }}>
                    <Image style={{ width:baseStyle.width }}
                    source={require('../../images/Marketing/gesture_guid.png')} />
                    </TouchableOpacity>
                    </View>
                  )
                }
              </View>
            )
        }
        {
          this.state.curGraphIndex > 0 ?
            <View style={{ height: 35, flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#99CCFF1a', paddingLeft: 5, paddingRight: 5 }}>
              {kLineIndexCombination.map((value, index) => {
                let btnWidth = (baseStyle.width - 30) / kLineIndexCombination.length;
                let isSelected = (this.state.curKLineIndexCombination == index);
                let shadowStyle = StyleSheet.create({
                  style: { shadowColor: '#3366991a', shadowOffset: { width: 0, height: 2 }, shadowRadius: 3, shadowOpacity: 0.8 }
                });
                return (
                  <TouchableOpacity
                    style={[{ flexDirection: 'row', width: btnWidth, height: 25, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, backgroundColor: isSelected ? '#ffffff' : '#0000000d' }, isSelected ? shadowStyle.style : null]}
                    activeOpacity={1}
                    onPress={() => this.kLineIndexCombinationOnChanged(value, index)} key={index}>
                    <Text style={{ fontSize: 12, color: isSelected ? '#F92400' : '#333333' }}>{value}</Text>
                    {has(combinationName) && isSelected ?
                      <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { this._toPlayVideo(value) }}>
                        <Image style={{ width: 16, height: 16, marginLeft: 15, marginRight: 10 }} source={require('../../images/icons/zhibiao_bofang.png')} />
                        <Text style={{ fontSize: 12, color: '#1D69F1' }}>学指标</Text>
                      </TouchableOpacity>
                      : null
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
            : null
        }
      </View >
    );
  }

  changeToLandscapeButton(indexS) {
    let distanceTop = indexS === "chart" ? 320 / 2 : 450 / 2 - 20 - 12;
    let distanceRight = indexS === "chart" ? 0 : 15;
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.BeClick === false) {
            this.BeClick = true;
            this._mineChangeToLandscape();
            this.timerBig = setTimeout(() => {
              this.BeClick = false;
              this.timerBig && clearTimeout(this.timerBig);
            }, 500);
          }
        }}
        style={{ position: "absolute", top: distanceTop, right: distanceRight }}
      >
        <Image style={{ flexDirection: "column", alignItems: "center" }} source={require("../../images/icons/land_icon.png")} />
      </TouchableOpacity>
    );
  }

  _mineChangeToLandscape = () => {
    if (this.BeClick === false) return;
    isLandscape(true);
    this.refs.dropDown && this.getDropdownRef().hide();
    Navigation.pushForParams(this.props.navigation, "LandscapePage", {
      //能够切换数组
      Objs: this.state.objs,
      index: this.loopStock,
      formulas: [
        ShareSetting.getCurrentMainFormulaName(),
        ShareSetting.getCurrentAssistFormulaName()
      ],
      returnFromLand: this.returnFromLand,
      transition: "LandscapePage",
      Obj: this.state.obj,
      ZhongWenJianCheng: this.state.ZhongWenJianCheng
    });
    this.setState({ obj: this.state.obj });
  };

  renderNews() {
    return (
      <View style={{ flex: 1 }}>
        <TabBarOriginal style={newsTabStyle} smallBottom={true} lastIndex={this.tabIndex}>
          <StaticTabBarItem title="新闻" style={{ height: 200, flex: 1 }}>
            <YDNewsList
              params={
                this.postLoad && this.state.obj && { obj: this.state.obj }
              }
              onPressItem={this.openNewsPage.bind(this, "新闻")}
            />
          </StaticTabBarItem>
          <StaticTabBarItem title="公告" style={{ height: 200, flex: 1 }}>
            <YDAnnouncementList
              params={this.state.obj && { obj: this.state.obj }}
              onPressItem={this.openNewsPage.bind(this, "公告")}
            />
          </StaticTabBarItem>
          <StaticTabBarItem title="F10" style={{ height: 200, flex: 1 }}>
            <View style={{ flex: 1 }}>
              <WebView
                ref={'f10_webview'}
                useWebKit={true}
                style={{ flex: 1, height: this.state.f10Height }}
                source={{ uri: this.state.f10Url }}
                onMessage={e => {
                  this.handleMessage(e);
                }}
                scalesPageToFit={this.state.scalesPageToFit}
                injectedJavaScript={injectedJavaScript5}
                onNavigationStateChange={this.onNavigationStateChange.bind(
                  this
                )}
                scrollEnabled={false}
              />
            </View>
          </StaticTabBarItem>
          <StaticTabBarItem title="收益统计" style={{ height: 200, flex: 1 }}>
            <View style={{ flex: 1 }} onStartShouldSetResponderCapture={() => {
              this.setState({ touchWeb: true })
            }}>
              <WebView
                ref={'income_webview'}
                useWebKit={true}
                style={{ flex: 1, height: 380 }}
                onLoadEnd={this.webViewLoaded}
                onMessage={e => {
                  this.handleMessage(e);
                }}
                javaScriptEnabled={true}
                automaticallyAdjustContentInsets={true}
                source={{ uri: this.state.earningsUrl }}
                scalesPageToFit={this.state.scalesPageToFit}
                injectedJavaScript={injectedJavaScript5}
                scrollEnabled={false}
              />
            </View>
          </StaticTabBarItem>
        </TabBarOriginal>
      </View>
    );
  }

  webViewLoaded = () => {
    let jsstr = `
            var body = document.getElementsByClassName('theme-w fixed-body');
            window.ReactNativeWebView.postMessage(JSON.stringify({page: document.URL, body: body, height: document.body.clientHeight, ht:document.documentElement.clientHeight}));
        `;
    setTimeout(() => {
      this.refs["webview"] && this.refs["webview"].injectJavaScript(jsstr);
    }, 500);
  };

  handleMessage = e => {
    let decodeValue = decodeURIComponent(decodeURIComponent(e.nativeEvent.data));
    //const data = JSON.parse(decodeValue);
    let data;
    try {
      data = JSON.parse(decodeValue);
    } catch (e) {
      return;
    }
    let hasBoxBody = false;
    if (data.height) {
      let h = data.height;
      if (data.page) {
        if (
          data.page.indexOf("/fhrz") !== -1 ||
          data.page.indexOf("/gsds") !== -1
        ) {
          h = data.height + 20;
        }
      }
      this.setState({ f10Height: h });
    }
    if (data.body) {
      let bodys = data.body;
      for (const obj in bodys) {
        if (obj) {
          hasBoxBody = true;
        }
      }
      if (hasBoxBody) {
        // 2019-04-15 by 李帅
        // 修复 iOS8中 webview 高度的 bug，原因是因为 onMessage() 回调中返回的 data.body 不一样，iOS8中返回 {length: 0}，非iOS8中 返回 {}
        let systemVersion = UserInfoUtil.getSystemVersion();
        if (systemVersion.substring(0, 1) === "8") {
          if (data.height < baseStyle.height) {
            this.setState({ f10Height: baseStyle.height });
          }
        } else if (data.height > baseStyle.height) {
          this.setState({ f10Height: baseStyle.height });
        }
      }
    }
  };

  renderIndexQuote() {
    if (this.props.navigation.state.params.isFromFundFlow) {
      return (
        <View style={{ flex: 1 }}>
          <ConstituentListForFundFlow
            // ref="ConstituentListForFundFlow"
            code={this.state.obj}
            name={this.state.ZhongWenJianCheng}
            // mainkey={"chengfenguForFundFlow"}
            navigation={this.props.navigation}
            renderHeaderComponent={
              <View>
                {this.renderDynaComponent()}
                <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6 }} />
                {this.renderChart()}
              </View>}
          />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <ConstituentList
            ref="ConstituentList"
            code={this.state.obj}
            mainkey={"chengfengu"}
            navigation={this.props.navigation}
            renderHeaderComponent={this.renderHeadView()}
            con_scrollEnabled={this.state.scrollTouch}
            zhangF={this.state.zhangF}
            xianJ={this.state.xianJ}
          />
        </View>
      );
    }
  }
  renderSingleStock() {
    return (
      <ScrollView
        style={{ backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR, flex: 1 }}
        scrollEventThrottle={16}
        canCancelContentTouches={this.state.scrollTouch}
        scrollEnabled={this.state.scrollTouch}
        onMomentumScrollEnd={this._scrollToEnd}
        showsVerticalScrollIndicator={false}
        onScroll={event => {
          let offsetY = event.nativeEvent.contentOffset.y;
          let contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
          let oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
          let offsetYMax = contentSizeHeight - oriageScrollHeight;
          if (offsetY + 1 > offsetYMax) {
            this.setState({ enableScrollViewScroll: false });
          }
        }}
      >
        {this.renderDynaComponent()}
        <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6 }} />
        {this.renderChart()}
        <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6 }} />
        {this.state.type === 1 && this.renderNews()}
      </ScrollView>
    );
  }
  _scrollToEnd(e) {
    let offsetY = e.nativeEvent.contentOffset.y; //滑动距离
    let contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
    let oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
    if (offsetY + oriageScrollHeight >= contentSizeHeight) {
      DeviceEventEmitter.emit("scroll2End");
    }
  }
  //涨跌榜 排序按钮
  changeListZF() {
    if (this.state.zhangF === 2) {
      this.setState({ xianJ: 2, zhangF: 0 });
    } else {
      this.setState({ zhangF: this.state.zhangF === 1 ? 0 : 1 });
    }
  }

  //最新价排序按钮
  changeListXJ() {
    if (this.state.xianJ === 2) {
      this.setState({ zhangF: 2, xianJ: 0 });
    } else {
      this.setState({ xianJ: this.state.xianJ === 1 ? 0 : 1 });
    }
  }

  //详情页面的为列表的头部view
  renderHeadView() {
    return (
      <View>
        {this.renderDynaComponent()}
        <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6 }} />
        {this.renderChart()}
        <View style={{ height: 10, backgroundColor: baseStyle.LINE_BG_F6 }} />
        <View style={{ height: 40, borderBottomWidth: 1, borderBottomColor: baseStyle.LINE_BG_F1, justifyContent: "center", alignItems: "center" }} >
          <Text style={{ fontSize: 15 }}>成分股</Text>
        </View>
        <View
          style={{
            backgroundColor: baseStyle.WHITE,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            height: 25,
            marginLeft: 12,
            marginRight: 12,
            borderBottomWidth: 1,
            borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
          }}
        >
          <Text style={{ flex: 1, color: baseStyle.BLACK_70, fontSize: 12, textAlign: "left" }}>名称</Text>
          <UpDownButton
            onPress={() => this.changeListXJ()}
            desc={this.state.xianJ}
            title={"现价"}
            containerStyle={{ flex: 0.5, alignItems: "flex-end" }}
          />
          <UpDownButton
            onPress={() => this.changeListZF()}
            desc={this.state.zhangF}
            title={"涨跌幅"}
            containerStyle={{ flex: 1, alignItems: "flex-end" }}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <BaseComponentPage style={{ flex: 1, backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR }}>
        <NavigationTitleView navigation={this.props.navigation} onBack={
          this.props.back ||
          (() => {
            Navigation.pop(this.props.navigation);
            DeviceEventEmitter.emit("getFocus", true);
            ShareSetting.reset();
          })
        } titleView={
          <View style={{ height: 44, justifyContent: 'center', alignItems: 'center' }}>
            {this.state.type != null && this._renderTitle()}
          </View>
        } rightTopView={
          <TouchableOpacity style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._popToSearchPage()}>
            <Image source={require("../../images/icons/cy_search_gray.png")} />
          </TouchableOpacity>
        } />
        {this.state.type === 0 && this.renderIndexQuote()}
        {this.state.type === 1 && this.renderSingleStock()}
        <Toast position={"center"} ref="toast" />
        <NoUsedPage where={hangQing_detail} />
        {/* {<PopupPromptView ref='prompt' />} */}
        {!this.prompt && <PopupPromptView ref={ref => this.prompt = ref} />}

      </BaseComponentPage>
    );
  }

  onNavigationStateChange(navState) {
    let jsstr = `
            var body = document.getElementsByClassName('theme-w fixed-body');
            window.ReactNativeWebView.postMessage(JSON.stringify({page: document.URL, body: body, height: document.body.clientHeight, ht:document.documentElement.clientHeight}));
        `;
    setTimeout(() => {
      this.refs.f10_webview && this.refs.f10_webview.injectJavaScript(jsstr);
    }, 500);
  }
  //按钮组件放大缩小平移全屏
  _expandedView() {
    return (
      <ExpandedView
        styles={{ position: "absolute", top: 450 / 2 - 20 - 15 - 20, left: 5 }}
        bigPress={() => this.controlKlineChart(0)}
        smallPress={() => this.controlKlineChart(1)}
        oldPress={() => this.controlKlineChart(2)}
        latePress={() => this.controlKlineChart(3)}
        landPress={() => {
          if (this.BeClick === false) {
            this.BeClick = true;
            this._mineChangeToLandscape();
            this.timerBig = setTimeout(() => {
              this.BeClick = false;
              this.timerBig && clearTimeout(this.timerBig);
            }, 500);
          }
        }}
      />
    );
  }

  //放大缩小平移全屏 发送给原生中控件调用
  controlKlineChart = flag => {
    switch (flag) {
      case TouchFlag.bigger:
        DeviceEventEmitter.emit("bigger");
        break;
      case TouchFlag.smaller:
        DeviceEventEmitter.emit("smaller");
        break;
      case TouchFlag.older:
        DeviceEventEmitter.emit("older");
        break;
      case TouchFlag.later:
        DeviceEventEmitter.emit("later");
        break;
    }
  };
}

// 注入脚本, 否则postmessage不生效
var injectedJavaScript5 = `
    (${String(function () {
  var originalPostMessage = window.postMessage;
  var patchedPostMessage = function (message, targetOrigin, transfer) {
    originalPostMessage(message, targetOrigin, transfer);
  };
  patchedPostMessage.toString = function () {
    return String(Object.hasOwnProperty).replace(
      "hasOwnProperty",
      "postMessage"
    );
  };
  window.postMessage = patchedPostMessage;
})})();
`;

class HeadTitleTime extends Component {
  static defaultProps = {
    serviceUrl: "/stkdata",
    timeColor: baseStyle.BLACK_70
  };

  defaultParams = {
    sub: 1,
    field: ["ShiJian", "ShiFouTingPai"]
  };

  constructor(props) {
    super(props);
    this.state = {
      time: props.time
    };
  }

  componentWillUnmount() {
    this.cancel();
    this.willFocusSubscription.remove();
    this.willBlurSubscription.remove();
  }

  componentDidMount() {
    this._query(this.props);

    this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
      this._query(this.props);
    });
    this.willBlurSubscription = this.props.navigation.addListener("willBlur", () => {
      this.cancel();
    });
  }

  componentWillReceiveProps(nextProps) {
    // 判断是否需要重新订阅数据
    if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
      this._query(nextProps);
    }
  }

  adapt(returnData) {
    let data = this._detailData(returnData);
    return data && data[0];
  }

  /**
   * 处理数据
   * @param data
   * @returns {*}
   * @private
   */
  _detailData(data) {
    let adaptData = [];
    let stockMessage = {};
    if (data) {
      stockMessage.ShiJian = data.time;
      stockMessage.ShiFouTingPai = data.status;
      adaptData.push(stockMessage);
    }
    return adaptData;
  }

  query = () => {
    this._query(this.props);
  }

  cancel = () => {
    if (this._request && this._request.qid && this.props.params.obj) {
      connection.unregister(this._request.qid, this.props.params.obj);
    }
  }

  _unsubcribes(objS) {
    if (objS) {
      this._unsubRequest = connection.request("FetchFullQuoteNative", {
        subcribes: "",
        unsubcribes: objS,
        subscribe: false
      }, returndata => {
        if (!(returndata instanceof Error)) {
          Promise.resolve(this.adapt(returndata)).then(data => {
            if (data !== false) {
              this.setState({ data });
            }
            // 触发事件
            let onData = this.props.onData;
            typeof onData === "function" && onData(data);
          });
        }
      });
    }
  }
  _query(props) {
    this.cancel();
    if (props.params && props.params.obj) {
      this.obj = props.params.obj;
      this._request = connection.register("FetchFullQuoteNative", props.params.obj, returndata => {
        if (!(returndata instanceof Error)) {
          if (returndata.quote.label === this.obj) {
            Promise.resolve(this.adapt(returndata.quote)).then(data => {
              if (data !== false) {
                this.setState({ data });
              }
              // 触发事件
              let onData = this.props.onData;
              typeof onData === "function" && onData(data);
            });
          }
        }
      });
    }
  }

  render() {
    let d = this.state.data;
    if (d) {
      if (d.ShiFouTingPai === 8) {
        return (
          <View>
            <Text style={{ fontSize: 12, color: this.props.timeColor }}>停牌</Text>
          </View>
        );
      } else {
        return (
          <View>
            <DateFormatText style={{ fontSize: 12, color: this.props.timeColor }} format="YYYY-MM-DD HH:mm:ss">{d.ShiJian}</DateFormatText>
          </View>
        );
      }
    } else {
      return (
        <View>
          <DateFormatText style={{ fontSize: 12, color: this.props.timeColor }} format="YYYY-MM-DD HH:mm:ss">{this.state.time}</DateFormatText>
        </View>
      );
    }
  }
}

let newsTabStyle = StyleSheet.create({
  container: { margin: 0 },
  tabBar: { marginBottom: 4, height: 40 },
  tabBarItem: { borderBottomWidth: 0 },
  tabBarItemLabel: { fontSize: 15, color: baseStyle.BLACK_100 },
  tabBarItemSelected: {
    backgroundColor: baseStyle.WHITE,
    borderBottomWidth: 2,
    borderBottomColor: baseStyle.TABBAR_BORDER_COLOR
  },
  tabBarItemLabelSelected: { color: "#F92400" },
  smallBottom: {
    backgroundColor: "#F92400",
    height: 2,
    width: 33,
    bottom: 0,
    position: "absolute"
  }
});

export default connect(
  state => ({
    userInfo: state.UserInfoReducer
  }),
  dispatch => ({
    actions: bindActionCreators(AllActions, dispatch)
  })
)(DetailPage);

export class SegmentedView extends BaseComponentPage {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: this.props.selectedIndex || 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedIndex != this.state.selectedIndex) {
      this.setState({ selectedIndex: nextProps.selectedIndex });
    }
  }
  _tabOnChange(index) {
    if (this.state.selectedIndex !== index) {
      this.setState({ selectedIndex: index }, () => {
        this.props.tabOnChange && this.props.tabOnChange(index);
      });
    }
  }

  render() {
    if (!this.props.tabs || !this.props.tabs.length) return null;
    return (
      <View style={{ height: 42, flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {this.props.tabs.map((value, index) => {
          let isSelected = this.state.selectedIndex == index ? true : false;
          let textColor = isSelected ? '#F92400' : '#000000';
          let fontSize = isSelected ? 16 : 15;
          return (
            <TouchableOpacity key={index} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => this._tabOnChange(index)}>
              <Text style={{ fontSize: fontSize, color: textColor }}>{value}</Text>
              {isSelected ? <View style={{ position: 'absolute', top: 42 - 3, width: 15, height: 3, backgroundColor: '#F92400', borderRadius: 3 / 2 }}></View> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}
