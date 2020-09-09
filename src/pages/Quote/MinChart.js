'use strict'

import React, { Component } from 'react';
import { DeviceEventEmitter, Image, NativeEventEmitter, NativeModules, PanResponder, Platform, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AllActions from '../../actions/AllActions';
import BaseComponent from '../../components/BaseComponent.js';
import * as baseStyle from '../../components/baseStyle.js';
import Button from '../../components/Button.js';
import Loading from '../../components/Loading.js';
import ShareSetting from '../../modules/ShareSetting.js';
import { Utils } from '../../utils/CommonUtils';
import { HorizontalLine, VerticalLine } from './PriceBox.js';
import YDMinChart from './YDMinChart';
import { connection } from './YDYunConnection';

const { NativeToRNEventEmitter } = NativeModules;
const nativeToRNEventEmitter = new NativeEventEmitter(NativeToRNEventEmitter);
const XDate = require('xdate');
/* 
* recognized figer number
* 0,tap
* 1,pan
* 2,pinch
*/
let _recognized = 0;

/* 
* 科创板分时盘后交易数据根数
*/
let _fixedNumber = 25

class MinChart extends BaseComponent {

  styleSheet = StyleSheet.create({
    chart: {
      flex: 1
    }
  });

  constructor(props) {
    super(props);

    this.state = {
      showCount: 0,
      legendPos: -1,
      vertiacllineStyle: {},
      mainName: this.props.mainName,
      viceName: this.props.viceName,
      curCrossY: 0
    };

    this.verticallineStyle = {
      opacity: 0,
      left: null,
      height: 0,
    };

    this.horizontallineStyle = {
      opacity: 0,
      top: null,
      width: 0,
    }
    this.isLoaded = false;
    this.layout = {};
    this.showPriceBox = false;
    this.timer = null;
    this.showCount1 = 241;
    this.yiChongData = { str: '一冲: 0.00', color: '#3399FF' };
    this.erChongData = { str: '双冲: 0.00', color: '#FF3333' };
  }

  componentDidMount() {
    this.isLoaded = true;
    this.getMainFormulaData(-1, this.props.onMainFmlResult);
    if (this.props.isKeChuangStock) {
      this.showCount1 += _fixedNumber
    }
    this.minListener = nativeToRNEventEmitter.addListener('MinMainResult', (data) => {
      if (data.name == '一冲') {
        let yiChong = { str: data.name + ': ' + data.value, color: '#3399FF' };
        let erChong = { str: '双冲: 0.00', color: '#FF3333' };
        this.yiChongData = yiChong;
        this.erChongData = erChong;
      } else if (data.name == '双冲') {
        let erChong = { str: data.name + ': ' + data.value, color: '#FF3333' };
        this.erChongData = erChong;
      }
      this.getMainFormulaData(-1, this.props.onMainFmlResult);
    });
    this.minCrossListener = nativeToRNEventEmitter.addListener('MinCrossNotification',(data) => {
      let stickPos = data.curKlineIndex;
      // if (this.showPriceBox) {
        this.getMainFormulaData(stickPos, this.props.onMainFmlResult);
      // } else {
      //   this.getMainFormulaData(-1, this.props.onMainFmlResult);
      // }
    });
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
    this.minListener && this.minListener.remove();
  }

  componentWillMount() {
    // this._panResponder = PanResponder.create({
    //   // 要求成为响应者：
    //   onStartShouldSetPanResponder: (evt, gestureState) => true,
    //   onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    //   onMoveShouldSetPanResponder: (evt, gestureState) => true,
    //   onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    //   onPanResponderGrant: (evt, gestureState) => {
    //     // 开始手势操作。
    //     let myDate = new Date();
    //     let t = myDate.getTime();
    //     this._tapStartTime = t;
    //     // 长按显示光标
    //     let event = evt.nativeEvent;
    //     if (!this.showPriceBox) {
    //       this.longPressTimer = setTimeout(() => {
    //         this.props.callbackScrollTouch && this.props.callbackScrollTouch(false);
    //         this._onTap(event, gestureState);
    //       }, 300)
    //     }
    //   },
    //   onPanResponderMove: (evt, gestureState) => {
    //     //除开始手势，的其他手势都移除定时器
    //     this.longPressTimer && clearTimeout(this.longPressTimer);
    //     //recognition
    //     let myDate = new Date();
    //     let t = myDate.getTime();
    //     let tcha = t - this._tapStartTime;
    //     if (gestureState.numberActiveTouches === 1 && _recognized !== 1) {
    //       if (tcha >= 100) {
    //         this.props.callbackScrollTouch && this.props.callbackScrollTouch(false);
    //         let diffx = Math.abs(gestureState.dx);
    //         let diffy = Math.abs(gestureState.dy);
    //         if (diffx > 10 || diffy > 10) {
    //           this._onPanStart(evt);
    //           _recognized = 1;
    //         }
    //       } else if (this.showPriceBox) {//如果十字光标显示
    //         //锁定外部scroll的滑动
    //         this.props.callbackScrollTouch &&
    //           this.props.callbackScrollTouch(false);
    //       }
    //     } else if (gestureState.numberActiveTouches === 2 && _recognized !== 2) {
    //       let touches = evt.nativeEvent.touches;
    //       if (touches.length == 2) {
    //         _recognized = 2;
    //       }
    //     }
    //     //Moving
    //     else {
    //       if (_recognized === 1) {
    //         if (this.showPriceBox) {
    //           this._onCrossMove(evt, gestureState);
    //         } else {
    //           this._onPanMove(evt, gestureState);
    //         }
    //       } else if (_recognized === 2) {
    //         //this._onPinchMove(evt.nativeEvent,gestureState);
    //       }
    //     }
    //   },
    //   onPanResponderTerminationRequest: (evt, gestureState) => true,
    //   onPanResponderRelease: (evt, gestureState) => {
    //     // 用户放开了所有的触摸点，且此时视图已经成为了响应者。一般来说这意味着一个手势操作已经成功完成。
    //     this.state.curCrossY = 0;
    //     //任何手势放开后 都设置外层scroll可以滑动
    //     this.props.callbackScrollTouch && this.props.callbackScrollTouch(true);
    //     //除开始手势，的其他手势都移除定时器
    //     this.longPressTimer && clearTimeout(this.longPressTimer);
    //     if (_recognized === 1) {
    //       this._onPanEnd(evt);
    //     } else if (_recognized === 2) {
    //       //this._onPinchEnd();
    //     } else if (_recognized === 0) {
    //       let myDate = new Date();
    //       let t = myDate.getTime();
    //       let tcha = t - this._tapStartTime;
    //       let diffx = Math.abs(gestureState.dx);
    //       let diffy = Math.abs(gestureState.dy);
    //       if (diffx <= 10 && diffy <= 10) {
    //         if (tcha < 300) {
    //           //现在逻辑 无光标单点显示  有光标单点隐藏
    //           this._onTap(evt, gestureState);

    //           //原先逻辑 无光标单点横竖屏转换，有的话单点隐藏光标
    //           // if (!this.showPriceBox) {
    //           //
    //           //   //原先单点切换横屏
    //           //   // if( Platform.OS === 'android'){
    //           //   //   //Orientation.manualChangeScreenDirection(true);
    //           //   //     Orientation.lockToLandscape();
    //           //   // }else{
    //           //   //     if (this.isLoaded) {
    //           //   //       // this.timer = setTimeout(()=>{
    //           //   //       //     Orientation.lockToLandscapeLeft();
    //           //   //       //     this.timer && clearTimeout();
    //           //   //       // },500);
    //           //   //       Orientation.lockToLandscapeLeft();
    //           //   //     }
    //           //   //
    //           //   // }
    //           // }
    //           // else {
    //           //   this._onTap(evt,gestureState);
    //           // }
    //         }
    //         else {
    //           // this._onTap(evt,gestureState);
    //         }
    //       }
    //     }
    //     this._tapStartTime = 0;
    //     _recognized = 0;
    //   },
    //   onPanResponderTerminate: (evt, gestureState) => {
    //     // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
    //   },
    //   onShouldBlockNativeResponder: (evt, gestureState) => {
    //     // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
    //     // 默认返回true。目前暂时只支持android。
    //     return this.showPriceBox;
    //   },
    // });
  }

  componentWillReceiveProps(nextProps) {
    if (Platform.OS === 'android') {

    } else {
      if (this.state.showCount !== nextProps.chartData.length) {
        this.setState({ showCount: nextProps.chartData.length });
      }
    }

    if (this.props.isKeChuangStock !== nextProps.isKeChuangStock) {
      if (nextProps.isKeChuangStock)
        this.showCount1 += _fixedNumber
      else
        this.showCount1 = 241
    }
    // 切换主图指标或附图指标
    if (this.state.mainName !== nextProps.mainName || this.state.viceName !== nextProps.viceName) {
      this.setState({ mainName: nextProps.mainName, viceName: nextProps.viceName }, () => {
        this.getMainFormulaData(-1, this.props.onMainFmlResult);
      });
    }

    if (this.state.legendPos == -1) {
      let curItem = this.props.chartData[this.props.lastDataIndex];
      let nextItem = nextProps.chartData[nextProps.lastDataIndex];

      if (this.props.lastDataIndex != nextProps.lastDataIndex ||
        require('lodash/eq')(curItem, nextItem) == false) {
        this.getMainFormulaData(-1, this.props.onMainFmlResult, nextProps.chartData);
      }
    }
  }

  _onLayout(event) {
    this.layout = event.nativeEvent.layout;
  };

  _onTap(e, s) {
    this.showPriceBox = !this.showPriceBox;
    // if (e && e.nativeEvent && e.nativeEvent.locationY) this._showPriceBox(s.x0,e.nativeEvent.locationY);
    // else this._showPriceBox(s.x0,s.y0);
    if (e && e.nativeEvent && e.nativeEvent.locationY) {
      this._showPriceBox(s.x0, e.nativeEvent.locationY);
    } else if (e && e.locationY) {
      this._showPriceBox(s.x0, e.locationY);
    } else this._showPriceBox(s.x0, s.y0);
  };

  _onCrossMove(e, s) {
    if (Platform.OS == 'ios') {
      if (s.moveX > this.layout.width || e.nativeEvent.locationY > this.layout.height || e.nativeEvent.locationY < 0) {
        return;
      }
      // e && e.nativeEvent && e.nativeEvent.locationY && this._showPriceBox(s.moveX, e.nativeEvent.locationY);
      e && e.nativeEvent && e.nativeEvent.locationY && this._showPriceBox(e.nativeEvent.locationX, e.nativeEvent.locationY);
    } else {
      // console.warn('locationY=' + e.nativeEvent.locationY, 's.dy=' + s.dy, 'this.state.curCrossY=' + this.state.curCrossY);
      if (e && e.nativeEvent && e.nativeEvent.locationY && this.state.curCrossY <= 0) {
        this.state.curCrossY = e.nativeEvent.locationY;
      }
      if (s.moveX > this.layout.width || this.state.curCrossY + s.dy - 25 > this.layout.height || this.state.curCrossY + s.dy < 4) {
        return;
      }
      e && e.nativeEvent && e.nativeEvent.locationY && this._showPriceBox(s.moveX + 15, this.state.curCrossY + s.dy - 5);
      // if (s.moveX > this.layout.width ||e.nativeEvent.locationY+ s.dy > this.layout.height || e.nativeEvent.locationY+ s.dy < 0) {
      //   return;
      // }
      // e && e.nativeEvent && e.nativeEvent.locationY && this._showPriceBox(s.moveX, e.nativeEvent.locationY+ s.dy);
    }
  };

  _onPanStart(e) {
  };

  _onPanMove(e, s) {
  };

  _onPanEnd(e) {
  };

  _onPanCancel(e) {
  };

  _showPriceBox(xPos, yPos) {
    if (!this.lastVerticalPos) this.lastVerticalPos = -1;
    // let kWidth = this.layout.width / this.state.showCount;
    let kWidth = this.layout.width / this.showCount1;
    let stickPos = Math.floor(xPos / kWidth);
    let currentVerticalPos = (stickPos + 0.5) * kWidth;
    let currentHorizontalPos = yPos - 0;
    // if( currentVerticalPos === this.lastVerticalPos && this.showPriceBox == true) {
    //   return;
    // }
    // else {
    //   this.lastVerticalPos = currentVerticalPos;
    // }
    this.lastVerticalPos = currentVerticalPos;
    if (this.showPriceBox) {
      this.verticallineStyle.opacity = 1.0;
      if (Platform.OS === 'android') {
        this.verticallineStyle.height = this.layout.height + 20;
      } else {
        this.verticallineStyle.height = this.layout.height;
      }
      this.verticallineStyle.left = currentVerticalPos;
      this.setState({ 'verticallineStyle': Object.assign({}, this.verticallineStyle) });
      this.setState({ legendPos: stickPos });
      this.horizontallineStyle.opacity = 1.0;
      this.horizontallineStyle.width = this.layout.width;
      this.horizontallineStyle.top = currentHorizontalPos;
      this.setState({ 'horizontallineStyle': Object.assign({}, this.horizontallineStyle) });
      this.getMainFormulaData(stickPos, this.props.onMainFmlResult);
    } else {
      this.verticallineStyle.opacity = 0.0;
      this.setState({ 'verticallineStyle': Object.assign({}, this.verticallineStyle) });
      this.setState({ legendPos: -1 });
      this.lastVerticalPos = -1;
      this.horizontallineStyle.opacity = 0.0;
      this.setState({ 'horizontallineStyle': Object.assign({}, this.horizontallineStyle) });
      this.getMainFormulaData(-1, this.props.onMainFmlResult);
    }
  }

  formatData(idx, chartData) {
    let result = [];
    let item;
    for (let i = 0; i < chartData.length; ++i) {
      if (chartData[i].ChengJiaoJia == null) {
        if (idx < 0 || idx >= i) {
          idx = i - 1;
        }
        break;
      }
    }
    if (idx != -1) {
      item = chartData[idx];
    } else {
      if (chartData && chartData.length > 0) {
        let theLastOne = chartData.length - 1;
        item = chartData[theLastOne];
      }
    }
    if (Platform.OS == 'ios') {
      if (this.state.mainName == '分时走势') {
        if (item && item.ChengJiaoJia !== null) {
          let zhangFu = new Number(100 * (item.ChengJiaoJia - this.props.stkInfo.ZuoShou) / this.props.stkInfo.ZuoShou);
          if (isNaN(zhangFu) || !isFinite(zhangFu)) {
            zhangFu = 0;
          }
          let date = new XDate(item.ShiJian * 1000);
          // 根据涨幅确定当前显示颜色
          let zhangfuColor = '';
          if (zhangFu > 0) {
            zhangfuColor = '#F54F4F'
          } else if (zhangFu === 0) {
            zhangfuColor = '#828282'
          } else {
            zhangfuColor = '#379637'
          }
          result.push({ str: '时间:' + date.toString('HH:mm'), color: undefined });
          result.push({ str: '现价:' + item.ChengJiaoJia.toFixed(2), color: undefined });
          if (this.props.isDaPan === 1) { // 等于1为个股
            result.push({ str: '均价:' + item.JunJia.toFixed(2), color: '#FF690F' });
          }
          result.push({ str: '涨幅:' + ((zhangFu == 0) ? '--' : zhangFu.toFixed(2) + '%'), color: zhangfuColor });
        } else {
          result.push({ str: '时间:--', color: undefined });
          result.push({ str: '现价:--', color: undefined });
          if (this.props.isDaPan === 1) { // 等于1为个股
            result.push({ str: '均价:--', color: '#FF690F' });
          }
          result.push({ str: '涨幅:--', color: '#379637' });
        }
      } else if (this.state.mainName == '分时冲关') {
        if (item && item.ChengJiaoJia !== null) {
          result.push(this.yiChongData);
          result.push(this.erChongData);
          result.push({ str: '现价:' + item.ChengJiaoJia.toFixed(2), color: undefined });
          if (this.props.isDaPan === 1) { // 等于1为个股
            result.push({ str: '均价:' + item.JunJia.toFixed(2), color: '#FF690F' });
          }
        } else {
          result.push({ str: '现价:--', color: undefined });
          if (this.props.isDaPan === 1) { // 等于1为个股
            result.push({ str: '均价:--', color: '#FF690F' });
          }
        }
      }
    } else {
      if (item && item.ChengJiaoJia !== null) {
        let zhangFu = new Number(100 * (item.ChengJiaoJia - this.props.stkInfo.ZuoShou) / this.props.stkInfo.ZuoShou);
        if (isNaN(zhangFu) || !isFinite(zhangFu)) {
          zhangFu = 0;
        }
        let date = new XDate(item.ShiJian * 1000);
        // 根据涨幅确定当前显示颜色
        let zhangfuColor = '';
        if (zhangFu > 0) {
          zhangfuColor = '#F54F4F'
        } else if (zhangFu === 0) {
          zhangfuColor = '#828282'
        } else {
          zhangfuColor = '#379637'
        }
        result.push({ str: '时间:' + date.toString('HH:mm'), color: undefined });
        result.push({ str: '现价:' + item.ChengJiaoJia.toFixed(2), color: undefined });
        if (this.props.isDaPan === 1) { // 等于1为个股
          result.push({ str: '均价:' + item.JunJia.toFixed(2), color: '#FF690F' });
        }
        result.push({ str: '涨幅:' + ((zhangFu == 0) ? '--' : zhangFu.toFixed(2) + '%'), color: zhangfuColor });
      } else {
        result.push({ str: '时间:--', color: undefined });
        result.push({ str: '现价:--', color: undefined });
        if (this.props.isDaPan === 1) { // 等于1为个股
          result.push({ str: '均价:--', color: '#FF690F' });
        }
        result.push({ str: '涨幅:--', color: '#379637' });
      }
    }
    let viceResult = [];
    if (this.state.viceName == '成交量') {
      if(item && item.ChengJiaoLiang !== null) {
        viceResult.push({ str: '成交量:' + this._formatNumber(item.ChengJiaoLiang / 100), color: '#333333' });
      }
    } else if (this.state.viceName == '资金流入') {
      viceResult.push({ str: '大单(万元):' + this._formatNumber((item.superIn - item.superOut) + (item.largeIn - item.largeOut)), color: '#FF33CC' });
      viceResult.push({ str: '中单(万元):' + this._formatNumber(item.mediumIn - item.mediumOut), color: '#FF9933' });
      viceResult.push({ str: '小单(万元):' + this._formatNumber(item.littleIn - item.littleOut), color: '#3399FF' });
    }
    return { main: result, vice: viceResult };
  }
  _formatNumber(num) {
    let isNegative = num < 0;
    num = Math.abs(num);
    let unit = "";
    if (num > 10000 * 10000) {
      num = num / (10000 * 10000);
      unit = "亿";
    } else if (num > 10000) {
      num = num / (10000);
      unit = "万";
    }
    // 对num取整
    let i = Math.round(num);
    // 若取整后的数与原数相等，则说明原数小数点后均为0
    if (i == num) {
      return isNegative ? '-' + num + unit : num + unit;//  [NSString stringWithFormat:@"-%.0f%@", num, unit] : [NSString stringWithFormat:@"%.0f%@", num, unit];
    } else {
      return isNegative ? '-' + num.toFixed(2) + unit : num.toFixed(2) + unit;// [NSString stringWithFormat:@"-%.2f%@", num, unit] : [NSString stringWithFormat:@"%.2f%@", num, unit];
    }
  }

  getMainFormulaData(pos, callback, chartData) {
    return callback && callback(this.formatData(pos, chartData || this.props.chartData));
  }

  render() {
    return (
      // <View {...this._panResponder.panHandlers} style={styles.flex} onLayout={this._onLayout.bind(this)}>
      <View  style={styles.flex} onLayout={this._onLayout.bind(this)}>

        <YDMinChart style={this.getStyles('chart')}
          mainName={this.state.mainName}
          viceName={this.state.viceName}
          circulateEquityA={this.props.circulateEquityA}
          getData={(event) => {
            let legendData = {
              shijian: event.nativeEvent.shijian,
              shijia: event.nativeEvent.chengjiaojia,
              junjia: event.nativeEvent.junjia,
              zuoshou: event.nativeEvent.zuoshou,
            }
            DeviceEventEmitter.emit('getDataListener', legendData);
          }}
          chartData={{
            chartType: 'min',
            stkInfo: this.props.stkInfo,
            color: {
              ShangZhangYanSe: baseStyle.UP_COLOR,
              XiaDieYanSe: baseStyle.DOWN_COLOR,
              BeiJingYanSe: baseStyle.WHITE
            },
            chartData: this.props.chartData,
            JYShiJianDuan: this.props.timeSection,
          }}

          legendPos={this.state.legendPos}

        />
        {/* <VerticalLine style={[styles.verticalline, this.state.verticallineStyle]} />
        <HorizontalLine style={[styles.horizontalline, this.state.horizontallineStyle]} /> */}
      </View>
    );
  }
}

export class DZHMinChart extends Component {

  static defaultProps = {
    serviceUrl: '/quote/min'
  };

  constructor(props) {
    super(props);

    this.defaultParams = {
      sub: true
    };

    this.state = {
      floatButtonBottom: 0,
      wudangButtonBottom: 0,
      wudangIsOpen: true,
      code: null
    };


  }

  componentDidMount() {
    this._query(this.props);
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this._query(this.props);
      }
    );
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload => {
        this.cancel();
      }
    );
  }
  componentWillUnmount() {
    this.cancel();
    this.willFocusSubscription.remove();
    this.willBlurSubscription.remove();
  }

  componentWillReceiveProps(nextProps) {
    // 判断是否需要重新订阅数据
    if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
      this._query(nextProps);
      this._minTime = null;
    }
  }

  cancel() {
    this.requestMinData && this.requestMinData.cancel();
    this.requestMinData = null;
  }

  query() {
    this._query(this.props);
  }

  getFinancialData(stockcode) {

    let url = 'https://newf10.ydtg.com.cn/apis/fis/v1/skf10/sk/shareStructures?gpdm='
      + stockcode.substring(2, 8) + '&page=1&size=1';

    Utils.get(url, (res) => {

      if (res.data.result.length > 0) {

        let temLtag = (res.data.result[0].ltag);
        this.setState({
          circulateEquityA: temLtag,
        })

      }
    }, (error) => {
      console.log(error)
    });

  }

  _getMinData(props) {
    // 取消上次请求
    this.cancel();

    // 先查询昨收和其它股票信息，查询完成后再订阅分时数据
    if (props.params && props.params.obj) {
      this.getFinancialData(props.params.obj)
      this.requestMinData = connection.request('FetchMinDataNative',
        { label: props.params.obj, days: 0, subscribe: this.defaultParams.sub },
        (returndata) => {

          if (!(returndata instanceof Error)) {
            if (returndata.label === this.state.code) {
              Promise.resolve(this.adapt(returndata)).then((data) => {
                if (data !== false) {
                  this.setState({ data });
                }
                // 触发事件
                let onData = this.props.onData;
                (typeof onData === 'function') && onData(data);
              });
            }
          }

        });

      return this.requestMinData;
    }
  }

  _query(props) {

    // 先查询昨收和其它股票信息，查询完成后再订阅分时数据
    if (props.params) {
      this._getMinData(props);
      this.setState({ code: props.params.obj })

    }
  }

  /**
   * 处理数据
   * @param data
   * @returns {*}
   * @private
   */
  _detailData(data) {
    let count = 0;
    let dataArray = [];
    let adaptData = [];
    if (Platform.OS === 'ios') {
      count = data.entitiesArray_Count;
      dataArray = data.entitiesArray;
    } else {
      count = data.entitiesCount;
      dataArray = data.entitiesList;
    }
    if (count < 0) {
      return;
    }
    if (count === 0) {
      adaptData.push({ "Obj": data.label, "Data": [] });
    } else {
      let newData = [];
      dataArray.map((item) => {
        let minItem = item.minEntity
        let fundFlow = item.fundFlow
        let tempData = {
          // ChengJiaoE : this._keepTwoDecimal(item.amount),//成交额
          // ChengJiaoJia:this._keepTwoDecimal(item.price),//成交价
          // ChengJiaoLiang : this._keepTwoDecimal(item.volume/100),//成交量
          // JunJia:this._keepTwoDecimal(item.meanPrice),//均价
          JunJia: minItem.meanPrice,//均价
          ChengJiaoE: minItem.amount,//成交额
          ChengJiaoJia: minItem.price,//成交价
          ChengJiaoLiang: minItem.volume,//成交量
          DuoKongXian: 0,//？
          Id: 0,//？
          LingXianZhiBiao: 0,//领先指标
          ShiJian: minItem.time,//时间
          WeiTuoMaiChuZongLiang: 0,//委托卖出
          WeiTuoMaiRuZongLiang: 0,//委托买入
          TradeType: minItem.tradeTypeValue,//科创板增加交易类型
          //资金流入流出数据
          initialized: true,
          littleIn: fundFlow.littleIn,
          littleOut: fundFlow.littleOut,
          mediumIn: fundFlow.mediumIn,
          mediumOut: fundFlow.mediumOut,
          hugeIn: fundFlow.hugeIn,
          hugeOut: fundFlow.hugeOut,
          largeIn: fundFlow.largeIn,
          largeOut: fundFlow.largeOut,
          superIn: fundFlow.superIn,
          superOut: fundFlow.superOut,
          total: fundFlow.total
        };
        newData.push(tempData);
      });
      adaptData.push({ "Obj": data.label, "Data": newData });
    }

    //昨收 数据的处理
    let info = {
      Obj: this.props.params.obj,
      MingCheng: this.props.params.ZhongWenJianCheng || '',
      ZuoShou: data.lastClose,
      ShiFouTingPai: this.props.statusPaused || 0,
      ShiJian: Math.round(new Date() / 1000),
      CirculateEquityA: 0
    };
    this.setState({ stkInfo: info });
    const { setStockInfo } = this.props.actions;
    setStockInfo(info);
    return adaptData;
  }

  adapt(returndata) {
    let data = this._detailData(returndata);
    if (data.length > 0) {
      let newDay = XDate(new Date()).toString('yyyyMMdd');
      let first = { KaiShiShiJian: 930, JieShuShiJian: 1130, KaiShiRiQi: newDay, JieShuRiQi: newDay };
      let second = { KaiShiShiJian: 1300, JieShuShiJian: 1500, KaiShiRiQi: newDay, JieShuRiQi: newDay }
      if (!this.shijianduan) {
        this.shijianduan = [];
        this.shijianduan.push(first);
        this.shijianduan.push(second);
      }
      const { setJYShiJianDuan } = this.props.actions
      const { minDatum } = this.props.stateMinChart
      for (var i = 0; i < data.length; i++) {
        let found = minDatum.find(each => each.code === data[i].Obj)
        if (!(found && found.minJYShiJianDuan && found.minJYShiJianDuan.length > 0)) {
          setJYShiJianDuan(data[i].Obj, this.shijianduan)
        }
      }

      data = data[0].Data || [];
      if (!this._minTime) {
        this._minTime = [];
        this._minData = [];

        let start = data.length > 0 && data[0].ShiJian * 1000;

        // 默认开始时间当天9:30
        let now = start ? new Date(start) : new Date();
        now.setTime(now.getTime() + ((now.getTimezoneOffset() - (-480)) * 60000));
        now.setHours(9);
        now.setMinutes(30);
        now.setSeconds(0);
        now.setMilliseconds(0);
        now.setTime(now.getTime() - ((now.getTimezoneOffset() - (-480)) * 60000));

        let startTime = now.getTime(), time = startTime, oneMinute = 1 * 60 * 1000;

        let otherNumber = 0
        let isKeChuangStock = ShareSetting.isKeChuangStock(this.state.code)
        if (isKeChuangStock) {
          otherNumber = _fixedNumber
        }

        for (let i = 0, length = 4 * 60 + otherNumber; i <= length; i++) {

          let shiJian = parseInt(time / 1000);
          this._minTime.push(shiJian);
          this._minData.push({
            ShiJian: shiJian,
            ChengJiaoJia: null,
            ChengJiaoLiang: null,
            ChengJiaoE: null,
            JunJia: null,
            TradeType: null
          });
          time = time + oneMinute;

          // 中午跳过90分钟
          if (i === (2 * 60)) {
            time += 90 * oneMinute;
          }

          // 跳过科创板盘后空白时间段
          if (i === (4 * 60) && isKeChuangStock) {
            time += 5 * oneMinute;
          }
        }
      }
      if (data.length !== 0) {
        if (this._minData[0].JunJia === null) {
          //如果第一条数据为空
          this._minData[0].JunJia = data[0].JunJia;
          this._minData[0].ChengJiaoE = 0;
          this._minData[0].ChengJiaoLiang = 0;
          this._minData[0].ShiJian = this._minTime[0];
          this._minData[0].ChengJiaoJia = this.state.stkInfo.ZuoShou;
          this.lastDataIndex = 0;
        }
      }
      if (data.length > 1) {
        data.forEach((eachData) => {
          let time = eachData.ShiJian;
          let index = this._minTime.indexOf(time);
          if (index >= 0) {
            while (index - this.lastDataIndex > 1) {
              // this._minData[this.lastDataIndex + 1].ShiJian = this._minData[this.lastDataIndex].ShiJian + 60;
              this._minData[this.lastDataIndex + 1].ChengJiaoJia = this._minData[this.lastDataIndex].ChengJiaoJia;
              this._minData[this.lastDataIndex + 1].ChengJiaoLiang = 0;
              this._minData[this.lastDataIndex + 1].ChengJiaoE = 0;
              this._minData[this.lastDataIndex + 1].JunJia = this._minData[this.lastDataIndex].JunJia;
              this.lastDataIndex++;
            }
            this._minData[index] = eachData;
            this.lastDataIndex = index;
          }
        });
        return Object.assign([], this._minData);
      } else {
        let time = data[0].ShiJian;
        let index = this._minTime.indexOf(time);
        if (index >= 0) {
          this._minData[index] = data[0];
          this.lastDataIndex = index;
        }
        return Object.assign([], this._minData);
      }

    }
    return false;
  }

  _keepTwoDecimal(num) {
    let result = parseFloat(num);
    if (isNaN(result)) {
      return 0.00;
    }
    result = Math.round(num * 100) / 100;
    return result;
  }

  _onLayout(event) {
    this.layout = event.nativeEvent.layout;
    this.setState({ floatButtonBottom: this.layout.height / 3 });
    this.setState({ wudangButtonBottom: this.layout.height / 2 })
  };

  _onWuDangButtonPress() {
    this.props.callback()
    let b = ShareSetting.isDisplayBuySellComponent()
    this.setState({ wudangIsOpen: b })
  }

  render() {
    const floatbuttonStyle = {
      width: 32,
      height: 32,
      position: 'absolute',
      right: 5, bottom: this.state.floatButtonBottom - 32,
    };

    const wudangbuttonStyle = {
      // width: 40,
      // height: 20,
      position: 'absolute',
      right: 0, bottom: this.state.wudangButtonBottom,
      borderColor: baseStyle.TABBAR_BORDER_COLOR,
      borderWidth: 0
    }

    let min_data = this.state.data
    let min_stock_info = this.state.stkInfo

    if (Platform.OS === "ios") {
      if (min_stock_info && min_stock_info.ShiFouTingPai !== this.props.statusPaused) {
        min_stock_info.ShiFouTingPai = this.props.statusPaused
      }
    }

    let min_shijianduan = this.shijianduan

    if (min_data && min_stock_info && min_shijianduan) {
    }
    else if (!(min_data && min_stock_info && min_shijianduan)) {

      const { minDatum } = this.props.stateMinChart

      if (this.state.code && minDatum && minDatum.length > 0) {
        let code = this.state.code
        let found = minDatum.find(eachItem => code === eachItem.code)
        if (found && found.minChartData && found.minStockInfo && found.minJYShiJianDuan) {
          min_data = found.minChartData
          min_stock_info = found.minStockInfo
          min_shijianduan = found.minJYShiJianDuan
        }
        else {
          return <Loading></Loading>
        }

      }
      else {
        return <Loading></Loading>
      }
    }
    else {
      return <Loading />
    }

    let wdBtnImage = require("../../images/icons/arrow_move_right.png")
    if (ShareSetting.isDisplayBuySellComponent()) {
      wdBtnImage = require("../../images/icons/arrow_move_left.png")
    }

    let isKeChuangStock = ShareSetting.isKeChuangStock(this.state.code)
    min_stock_info.CirculateEquityA = this.state.circulateEquityA

    return (
      <View style={{ flex: 1 }} onLayout={this._onLayout.bind(this)}>
        <MinChart
          style={this.props.style}
          chartData={min_data}
          timeSection={min_shijianduan}
          stkInfo={min_stock_info}
          onMainFmlResult={this.props.onMainFmlResult}
          callbackScrollTouch={this.props.callbackScrollTouch}
          lastDataIndex={this.lastDataIndex}
          isDaPan={this.props.isDaPan}
          isKeChuangStock={isKeChuangStock}
          mainName={this.props.mainName}
          viceName={this.props.viceName}
          circulateEquityA={this.state.circulateEquityA}
        />

        {
          (Platform.OS === 'android' && this.props.isDaPan == 1) ? (

            <View style={[wudangbuttonStyle]}>
              <Button style={{ flex: 1 }} onPress={this._onWuDangButtonPress.bind(this)}>
                <Image source={wdBtnImage} style={styles.iconStyle} />
              </Button>
            </View>
          ) : (
              <View />
          )
        }
      </View>
    );


  }
}

var styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  verticalline: {
    flex: 1,
    position: 'absolute',
    opacity: 0.0,
    width: 0.5,
    top: 0,
    backgroundColor: baseStyle.DARK_GRAY,
  },
  horizontalline: {
    flex: 1,
    position: 'absolute',
    opacity: 0.0,
    height: 0.5,
    left: 0,
    backgroundColor: baseStyle.DARK_GRAY,
  }
});


function HOCFactory() {
  return class HOC extends React.Component {
    getWrappedInstance = () => {
      if (this.props.forwardRef) {
        return this.wrappedInstance;
      }
    }

    setWrappedInstance = (ref) => {
      this.wrappedInstance = ref;
    }

    render() {

      let props = {
        ...this.props
      };
      if (this.props.forwardRef) {
        props.ref = this.setWrappedInstance;
      }

      return <DZHMinChart {...props} />
    }
  }
}

export default connect((state) => ({
  stateMinChart: state.MinChartReducer
}),
  (dispatch) => ({
    actions: bindActionCreators(AllActions, dispatch)
  }), null,
  { forwardRef: true }
)(HOCFactory())