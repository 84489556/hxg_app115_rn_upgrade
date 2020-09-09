'use strict';

import React, { Component } from 'react';
import {
    PanResponder,
    View,
    StyleSheet,
    DeviceEventEmitter,
    Modal,
    Dimensions,
    Text,
    NativeEventEmitter,
    NativeModules
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import _KLineChart from './YDKLineChart';
import * as baseStyle from '../../components/baseStyle';
import BaseComponentPage from '../BaseComponentPage';
import Loading from '../../components/Loading';
import { VerticalLine, HorizontalLine } from '../../components/PriceBox';
import ShareSetting from '../../modules/ShareSetting';
import { historyCandleStick } from './YDHistoryCandleStick';

/* 
 * recognized figer number
 * 0,tap
 * 1,pan
 * 2,pinch
 */
let _recognized = 0;

let _loopFormula = ShareSetting.getLoopFormula();

let _defaultIndexOfKLineNumber = 5;

//k线的缩放根数按照斐波那契数列进行缩放
const _KLineNumberInScreenArray = [5, 8, 13, 21, 34, 55, 89, 144, 233, 250];
// let _defaultIndexOfKLineNumber = ShareSetting.getIndexOfKLineNumber();
const { NativeToRNEventEmitter } = NativeModules;
const nativeToRNEventEmitter = new NativeEventEmitter(NativeToRNEventEmitter);

class KlineChart extends BaseComponentPage {
    constructor(props) {
        super(props);
        let newLength = props.chartData.length;
        //初始化的时候将k线缩放状态调整为5级
        // _defaultIndexOfKLineNumber = 5;
        let show = _KLineNumberInScreenArray[_defaultIndexOfKLineNumber];

        // let show = _KLineNumberInScreenArray[ ShareSetting.getIndexOfKLineNumber()];
        let startposinit = newLength - show;
        if (startposinit < 0) startposinit = 0;
        this.state = {
            mainFormula: props.mainFormula || '蓝粉彩带',
            viceFormula: props.viceFormula || '操盘提醒',
            showCount: show,
            startPos: startposinit,
            legendPos: -1,
            priceboxStyle: {},
            vertiacllineStyle: {},
            priceboxData: null,
            chartLoc: props.chartLoc || '底部出击',
            onPanEndPos: startposinit,
            panEnd: false,
            //新加关于k线缩放的属性
            pShowCount: show,
            showModal: false,
            modalText: '',
            //是否获取到所有的k线数据
            KlineAllData: false,
        };

        this.layout = {};
        this.isFetching = false;
        this.showPriceBox = false;
        this.panEnd = false;
        this.priceboxStyle = {
            opacity: 0,
            left: null,
            right: null
        };
        this.verticallineStyle = {
            opacity: 0,
            left: null,
            height: 0
        };
        this.horizontallineStyle = {
            opacity: 0,
            top: null,
            width: 0
        };

        //this._lastPinchDiff=0;
        this.zooming = false
        this._tapStartTime = 0;
        this.currentDate = 0;
        this.loopNumber = _loopFormula.indexOf(ShareSetting.getCurrentAssistFormulaName());
        this.loopNumber1 = _loopFormula.indexOf(ShareSetting.getCurrentVice2FormulaName());

        // 用于标识是否手势缩放
        this.panendend = false;
        // 用于标识是否滑动
        this.panTag = 0;
        this.currentDate = 0;
        this.splitChartData = [];


        this.pShowCount = show;
        //记录
        this.moveDx = 0;
    }

    componentWillReceiveProps(nextProps) {
        this.isFetching = false;
        // this.splitChartData = [];
        let newLength = nextProps.chartData.length;
        let oldLength = this.props.chartData.length;
        let showLast = this.state.startPos + this.state.showCount >= oldLength;
        //if (this.props.isBig) {
        // let show = Math.min(newLength, _KLineNumberInScreenArray[_defaultIndexOfKLineNumber]);
        // let show = Math.min(newLength, _KLineNumberInScreenArray[ ShareSetting.getIndexOfKLineNumber()]);
        // this.setState({'showCount': show});
        // if (newLength - this.state.showCount > 0) {
        //     this.setState({ startPos: newLength - show });
        // } else {
        //     this.setState({ startPos: 0 });
        // }
        if (newLength > 200 && newLength - this.state.showCount > 0) {
            // console.log('onPanResponderMove' + this.state.onPanEndPos);
            this.setState({
                onPanEndPos: this.state.onPanEndPos + newLength - oldLength
            });
        }
        //}
        /*else*/ if (newLength - oldLength == 1 && showLast) {
            this.setState({ startPos: newLength - this.state.showCount });
        } else if (
            newLength > oldLength &&
            this.props.chartData[oldLength - 1].ShiJian ===
            nextProps.chartData[newLength - 1].ShiJian
        ) {
            this.setState({
                startPos: this.state.startPos + newLength - oldLength
            });
        }

        let usePos = this.showPriceBox ? this.state.legendPos : -1;
        if (nextProps.mainFormula &&
            ((this.state.mainFormula !== nextProps.mainFormula && nextProps.mainFormula)
                || (this.state.viceFormula !== nextProps.viceFormula && nextProps.viceFormula)
                || (this.state.chartLoc !== nextProps.chartLoc && nextProps.chartLoc))) {
            this.setState(
                {
                    mainFormula: nextProps.mainFormula,
                    viceFormula: nextProps.viceFormula,
                    chartLoc: nextProps.chartLoc ? nextProps.chartLoc : this.state.chartLoc
                },
                () => {
                    this.getMainFormulaData(
                        usePos,
                        [
                            this.state.mainFormula,
                            this.state.viceFormula,
                            this.state.chartLoc
                        ],
                        this.props.onMainFmlResult
                    );
                }
            );
        }
    }

    ///Gesture recognition begin

    componentWillMount() {

        //if (!this.props.isBig) return;
        // console.log('添加监听--------');
        _loopFormula = ShareSetting.getLoopFormula();
        // K线操作通知
        this.biggerListener = DeviceEventEmitter.addListener('bigger', () => {
            this.controlKline(0);
        });
        this.smallerListener = DeviceEventEmitter.addListener('smaller', () => {
            this.controlKline(1);
        });
        this.olderListener = DeviceEventEmitter.addListener('older', () => {
            this.controlKline(2);
        });
        this.laterListener = DeviceEventEmitter.addListener('later', () => {
            this.controlKline(3);
        });
        this.kLineListener = nativeToRNEventEmitter.addListener('KLineCrossNotification', (data) => {
            let curKlineIndex = data.curKlineIndex;
            let stickData = this.props.chartData[curKlineIndex];
            let previousStickData = this.props.chartData[curKlineIndex - 1];
            previousStickData = previousStickData > 0 ? previousStickData : 0;
            this.props.callbackF(stickData, previousStickData);

            // let stickData = Object.assign({}, this.props.chartData[legendPos])
            this.props.callbackHeadTime(stickData.ShiJian)
        });
        this.nextFormula = nativeToRNEventEmitter.addListener('nextFormulaNotification', (data) => {
            let formula = data.formula;
            if ("vice" == formula) {
                this.loopNumber++;
                if (this.loopNumber >= _loopFormula.length) {
                    this.loopNumber = 0;
                }
                this.props.callback2(this.loopNumber);
            } else if ("vice2" == formula) {
                this.loopNumber1++;
                if (this.loopNumber1 >= _loopFormula.length) {
                    this.loopNumber1 = 0;
                }
                this.props.callback1(this.loopNumber1);
            }
        });
        return;
        this.KlineAllDataListener = DeviceEventEmitter.addListener('KlineAllData', () => {
            this.setState({
                KlineAllData: true,
            })
        });
        this.notFullListener = DeviceEventEmitter.addListener('notFull', () => {
            this.setState({
                KlineAllData: false,
            })
        });

        // const {stateUserInfo} = this.props;
        // const {UserInfoReducer} = this.props;
        this._panResponder = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (evt, gestureState) => false,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onMoveShouldSetPanResponder: (evt, gestureState) => {

                if (gestureState.numberActiveTouches == 2)   //两点手势则处理
                {
                    return true;
                }
                return false;
            },


            onPanResponderGrant: (evt, gestureState) => {
                // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！

                let myDate = new Date();
                let t = myDate.getTime();
                this._tapStartTime = t;
                _recognized = 0;

                //evt 时间在定时器里面调用为空  所以定义evt.nativeEvent   在定时器中使用
                let event = evt.nativeEvent;

                // 长按显示光标
                // console.debug('onPanResponderMove onPanResponderGrant ');
                this.longPressTimer = setTimeout(() => {
                    if (!this.showPriceBox) {
                        this.props.callbackScrollTouch &&
                            this.props.callbackScrollTouch(false);
                        this.handleTap(event, gestureState);
                    }
                    // console.debug('onPanResponderMove 长按事件还是单击事件 ');
                }, 300);

                if (gestureState.numberActiveTouches > 2) {
                    //如果屏幕上有两个以上手机不做任何操作
                    return;
                }

                if (evt && evt.nativeEvent.touches.length === 2) {
                    this.zooming = true
                }

            },

            onPanResponderMove: (evt, gestureState) => {

                //除开始手势，的其他手势都移除定时器
                this.longPressTimer && clearTimeout(this.longPressTimer);
                //时间tcha  判断滑动开始的点击时间。
                // 一个手指滑动：tcha<200 视为单击移动滑动scroll。tcha>200视为长按移动 滑动十字光标
                let myDate = new Date();
                //滑动过程的时间戳
                let t = myDate.getTime();
                //滑动过程的时间戳减去点击开始的时间戳，事件触发所用的时间戳
                let tcha = t - this._tapStartTime;
                //大于200处于滑动状态中
                if (tcha >= 200 && tcha <= 500) {//500解决卡顿
                    //滑动锁定
                    this.props.callbackScrollTouch &&
                        this.props.callbackScrollTouch(false);
                }
                else if (this.showPriceBox && tcha <= 500) {//如果十字光标显示，500解决卡顿
                    //锁定外部scroll的滑动
                    this.props.callbackScrollTouch &&
                        this.props.callbackScrollTouch(false);
                }
                //一根手指
                if (
                    gestureState.numberActiveTouches === 1 &&
                    _recognized !== 1
                ) {
                    if (tcha > 100) {
                        let diffx = Math.abs(gestureState.dx);
                        let diffy = Math.abs(gestureState.dy);
                        if (diffx > 10 || diffy > 10) {
                            this._onPanStart(evt);
                            _recognized = 1;
                            this.moveDx = gestureState.moveX;
                        }
                    }

                }
                //两个手指 进行缩放操作
                else if (
                    gestureState.numberActiveTouches === 2 &&
                    _recognized !== 2
                ) {
                    let touches = evt.nativeEvent.touches;
                    if (touches.length == 2) {
                        //去除十字光标
                        if (this.showPriceBox) {
                            this.handleTap(evt, gestureState);
                        }
                        this.props.callbackScrollTouch && this.props.callbackScrollTouch(false);
                        this._onPinchStart(evt.nativeEvent, gestureState);
                        _recognized = 2;
                    }
                }
                else if (gestureState.numberActiveTouches > 2) {
                    //如果屏幕上有两个以上手机不做任何操作
                    return;
                }
                else {
                    //Moving
                    if (_recognized === 1) {
                        //平移操作
                        if (this.showPriceBox) {
                            //十字光标移动
                            this._onCrossMove(evt, gestureState);
                        } else {
                            //k线移动

                            this._onPanMove(evt, gestureState);
                        }
                    } else if (_recognized === 2) {
                        this.props.callbackScrollTouch && this.props.callbackScrollTouch(false);
                        //缩放操作
                        let dateNow = new Date().getTime();
                        if (dateNow - this.currentDate < 150) {
                            return;
                        }
                        this._onPinchMove(evt.nativeEvent, gestureState);
                    }
                }
            },

            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                // 用户放开了所有的触摸点，且此时视图已经成为了响应者。一般来说这意味着一个手势操作已经成功完成。

                //任何手势放开后 都设置外层scroll可以滑动
                this.props.callbackScrollTouch &&
                    this.props.callbackScrollTouch(true);
                //手势放开移除定时器
                this.longPressTimer && clearTimeout(this.longPressTimer);

                if (_recognized === 1) {
                    this._onPanEnd(evt, gestureState);
                } else if (_recognized === 2) {
                    this._onPinchEnd();
                } else if (_recognized === 0) {
                    let myDate = new Date();
                    let t = myDate.getTime();
                    let tcha = t - this._tapStartTime;
                    let diffx = Math.abs(gestureState.dx);
                    let diffy = Math.abs(gestureState.dy);

                    if (diffx <= 10 && diffy <= 10) {
                        if (tcha < 300) {
                            // console.debug('onPanResponderMove Tap');

                            //现在单点出现 十字光标
                            // if (this.showPriceBox) {
                            //     this.handleTap(evt, gestureState);
                            // }
                            // if (!this.showPriceBox) {
                            //     // this.changeToLandscape(evt, gestureState);
                            // } else {
                            //     this.handleTap(evt, gestureState);
                            // }

                            this.handleTap(evt, gestureState);
                        } else {
                            this.handleTap(evt, gestureState);
                        }
                    }
                }

                //this._lastPinchDiff = 0;
                this.zooming = false
                this._tapStartTime = 0;
                _recognized = 0;
            },

            onPanResponderTerminate: (evt, gestureState) => {
                // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
                // console.debug(
                //     'onPanResponderMove 另一个组件已经成为了新的响应者，所以当前手势将被取消。'
                // );
                this.longPressTimer && clearTimeout(this.longPressTimer);
            },

            onShouldBlockNativeResponder: (evt, gestureState) => {
                // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
                // 默认返回true。目前暂时只支持android。
                this.longPressTimer && clearTimeout(this.longPressTimer);
                return this.showPriceBox || this.zooming;
            }
        });
    }

    componentWillUnmount() {

        // console.log('去除监听-----');
        this.biggerListener && this.biggerListener.remove();
        this.smallerListener && this.smallerListener.remove();
        this.olderListener && this.olderListener.remove();
        this.laterListener && this.laterListener.remove();
        this.kLineListener && this.kLineListener.remove();
        return;
        this.KlineAllDataListener && this.KlineAllDataListener.remove();
        this.notFullListener && this.notFullListener.remove();
    }
    ///Gesture recognition end

    // 控制栏控制方法
    controlKline = (flag) => {
        // console.log('控制条 == controlKline', flag);
        switch (flag) {
            case 0://放大
                {
                    this.refs && this.refs.kchart && this.refs.kchart.zoomIn();
                }
                break;
            case 1://缩小
                {
                    this.refs && this.refs.kchart && this.refs.kchart.zoomOut();
                }
                break;
            case 2://左移
                {
                    this.refs && this.refs.kchart && this.refs.kchart.moveLeft();
                }
                break;
            case 3://右移
                {
                    this.refs && this.refs.kchart && this.refs.kchart.moveRight();
                }
                break;
        }
    };

    //转横屏 以及附图点击事件
    changeToLandscape(e, s) {
        if (e && e.nativeEvent && e.nativeEvent.locationY) {
            let a = Math.round(e.nativeEvent.locationY);
            if (this.layout.height > 400) {
                if (
                    a > (this.layout.height * 3) / 6 &&
                    a < (this.layout.height * 3) / 4
                ) {
                    // let f = _loopFormula[this.loopNumber];
                    // ShareSetting.selectFormula(f);
                    // this.setState({ viceFormula: f });
                    this.loopNumber++;
                    if (this.loopNumber >= _loopFormula.length) {
                        this.loopNumber = 0;
                    }
                    this.props.callback2(this.loopNumber);
                    // this.getMainFormulaData(-1,this.props.onMainFmlResult);
                } else if (a > (this.layout.height * 3) / 4) {
                    // let f = _loopFormula[this.loopNumber1];
                    // ShareSetting.selectFormula(f);
                    // this.setState({ chartLoc: f });
                    this.loopNumber1++;
                    if (this.loopNumber1 >= _loopFormula.length) {
                        this.loopNumber1 = 0;
                    }
                    this.props.callback1(this.loopNumber1);
                } else {
                    // this.timer = setTimeout(()=>{
                    //     Orientation.lockToLandscapeLeft();
                    //     this.timer && clearTimeout();
                    // },500);
                    // Orientation.lockToLandscapeLeft();
                }
            } else {
                if (a > (this.layout.height * 3) / 4) {
                    // let f = _loopFormula[this.loopNumber];
                    // ShareSetting.selectFormula(f);
                    // this.setState({ viceFormula: f });
                    this.loopNumber++;
                    if (this.loopNumber >= _loopFormula.length) {
                        this.loopNumber = 0;
                    }
                    this.props.callback2(this.loopNumber);
                    // this.getMainFormulaData(-1,this.props.onMainFmlResult);
                } else {
                    // this.timer = setTimeout(()=>{
                    //     Orientation.lockToLandscapeLeft();
                    //     this.timer && clearTimeout();
                    // },500);
                    // Orientation.lockToLandscapeLeft();
                }
            }
        }
    }

    //光标的展示和隐藏  附图点击事件
    handleTap(e, s) {
        // console.log('onPanResponderMove 展示光标 或隐藏贯标');
        if (e && e.nativeEvent && e.nativeEvent.locationY) {
            let a = Math.round(e.nativeEvent.locationY);
            if (this.layout.height > 400) {
                if (
                    a > (this.layout.height * 3) / 6 &&
                    a < (this.layout.height * 3) / 4
                ) {
                    // let f = _loopFormula[this.loopNumber];
                    // ShareSetting.selectFormula(f);
                    // this.setState({ viceFormula: f });
                    this.loopNumber++;
                    if (this.loopNumber >= _loopFormula.length) {
                        this.loopNumber = 0;
                    }
                    this.props.callback2(this.loopNumber);
                    // this.getMainFormulaData(-1,this.props.onMainFmlResult);
                } else if (a > (this.layout.height * 3) / 4) {
                    this.loopNumber1++;
                    if (this.loopNumber1 >= _loopFormula.length) {
                        this.loopNumber1 = 0;
                    }
                    this.props.callback1(this.loopNumber1);
                } else {
                    this._onTap(e, s);
                }
            } else {
                if (a > (this.layout.height * 3) / 4) {
                    // let f = _loopFormula[this.loopNumber];
                    // ShareSetting.selectFormula(f);
                    // this.setState({ viceFormula: f });
                    this.loopNumber++;
                    if (this.loopNumber >= _loopFormula.length) {
                        this.loopNumber = 0;
                    }
                    this.props.callback2(this.loopNumber);
                    // this.getMainFormulaData(-1,this.props.onMainFmlResult);
                } else {
                    this._onTap(e, s);
                }
            }
        } else {
            this._onTap(e, s);
        }
    }

    componentDidMount() {
        this.getMainFormulaData(
            -1,
            [
                this.state.mainFormula,
                this.state.viceFormula,
                this.state.chartLoc
            ],
            this.props.onMainFmlResult
        );
    }

    componentDidUpdate(prevProps, prevState) {

    }

    getMainFormulaData = (pos, formulas, callback) => {
        return this.refs && this.refs.kchart && this.refs.kchart.getMainFormulaData(pos, formulas, callback);
    }

    render() {
        // console.debug( {dataLength: this.props.chartData.length,
        //                 showCount:this.state.showCount,
        //                 startPos:this.state.startPos,
        //                 legendPos:this.state.legendPos});
        return (
            <View style={{ flex: 1 }}>
                <View
                    // {...this._panResponder.panHandlers}
                    style={styles.flex}
                    onLayout={this._onLayout.bind(this)}
                // {...this.props.handlers}
                >
                    <_KLineChart
                        ref="kchart"
                        // ref={(kchart) => {
                        // this.kchart = kchart
                        // }}
                        style={styles.flex}
                        chartData={{
                            chartType: 'kline',
                            split: this.props.split,
                            stkInfo: this.props.stkInfo,
                            tempPeriod: this.props.tempPeriod,
                            color: {
                                ShangZhangYanSe: baseStyle.RED,
                                XiaDieYanSe: baseStyle.GREEN,
                                BeiJingYanSe: baseStyle.WHITE
                            },
                            chartData: this.props.chartData,
                        }}
                        onSplitDataBlock={(event) => {
                            this.splitChartData = event.nativeEvent.chartData;
                            {/*console.log('除复权回调 ==',event.nativeEvent,this.splitChartData);*/ }
                        }}
                        isLand={this.props.isLand}
                        callbackF={this.props.callbackF}
                        callback1={this.props.callback1}
                        callback2={this.props.callback2}
                        callbackPriceBox={this.props.callbackPriceBox}
                        callbackHeadTime={this.props.callbackHeadTime}
                        callbackScrollTouch={this.props.callbackScrollTouch}
                        chartLoc={this.state.chartLoc}
                        mainName={this.state.mainFormula}
                        viceName={this.state.viceFormula}
                        showCount={this.state.showCount}
                        startPos={
                            this.panEnd
                                ? this.state.onPanEndPos
                                : this.state.startPos
                        }
                        legendPos={this.state.legendPos}
                    />
                    {1 === 1 ? (
                        <View />
                    ) : (
                            <PriceBox
                                style={[styles.pricebox, this.state.priceboxStyle]}
                                data={this.state.priceboxData}
                            />
                        )}

                    <VerticalLine
                        style={[
                            styles.verticalline,
                            this.state.verticallineStyle
                        ]}
                    />
                    <HorizontalLine
                        style={[
                            styles.horizontalline,
                            this.state.horizontallineStyle
                        ]}
                    />
                </View>
                <Modal
                    supportedOrientations={['portrait', 'landscape']}
                    animationType={'fade'}
                    transparent={true}
                    visible={this.state.showModal}
                >
                    <View
                        style={{
                            position: 'absolute',
                            top: (Dimensions.get('window').height - 60) / 2,
                            left: (Dimensions.get('window').width - 150) / 2,
                            width: 150,
                            height: 50,
                            borderRadius: 5,
                            backgroundColor: 'black',
                            opacity: 0.8,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Text style={{ color: 'white' }}>
                            {this.state.modalText}
                        </Text>
                    </View>
                </Modal>
            </View>
        );
    }

    _onLayout(event) {
        this.layout = event.nativeEvent.layout;
        if (this.props.hammer) {
            const mc = this.props.hammer;
            let pan = mc.get('pan');
            if (pan) {
                let threshold =
                    event.nativeEvent.layout.width / this.state.showCount;
                pan.options.threshold = threshold;
            }
        }
    }

    //移动光标方法
    _onCrossMove(e, s) {
        // console.log('onPanResponderMove  _onCrossMove'+s.moveX +'locationY='+e.nativeEvent.locationY+' s.dy='+ s.dy);
        if (
            s.moveX > this.layout.width ||
            e.nativeEvent.locationY > this.layout.height ||
            e.nativeEvent.locationY < 0
        ) {
            // console.log('onPanResponderMove  _onCrossMove >>>>>>>> return ----------')
            return;
        }
        // console.log('onPanResponderMove  _onCrossMove >>>>>>>>')
        e &&
            e.nativeEvent &&
            e.nativeEvent.locationY &&
            this._showPriceBox(s.moveX + 10, e.nativeEvent.locationY);
        // this._showPriceBox(s.moveX, e.nativeEvent.locationY + s.dy);
        //移动光标，在y轴上的线移动幅度不和手指的位置相同，现在将+s.dy去掉
    }

    //移动k线方法
    _onPanStart(e) {
        // console.log('onPanResponderMove  _onPanStart');
        if (!this.showPriceBox) {
            if (this.panEnd) {
                this.lastStartPos = this.state.onPanEndPos;
            } else {
                this.lastStartPos = this.state.startPos;
            }
        }
    }

    _onPanMove(e, s) {


        if (!this.showPriceBox /*&& this.lastStartPos*/) {
            let kWidth = this.layout.width / this.state.showCount;
            let moveCount = -Math.round(s.dx / (kWidth * 3 / 5));

            let show = this.state.showCount;
            let newLast = Math.min(
                this.lastStartPos + show - 1 + moveCount,
                this.props.chartData.length - 1
            );
            let newPos = Math.max(newLast - show + 1, 0);

            if (newPos != this.state.startPos) {
                this.setState({ startPos: newPos, onPanEndPos: newPos });
                // console.debug({newPos});
                //获取一次数据
                // this._onGestureEnd()
            }
            if (this.state.showModal === true) {
                return;
            }
            // this.controlKline(2);
            // this.controlKline(3);
            //滑动的产生的位移，当前x坐标
            let nowDx = s.moveX;

            if (newPos + show >= this.props.chartData.length && (nowDx - this.moveDx < 0)) {
                this.moveDx = 0;
                //最新k线,当弹窗消失后才可以再次显示
                if (!this.state.showModal) {
                    if (this.panTag === 0 || this.panendend) {
                        this.setState({
                            showModal: true,
                            modalText: '已经是最新K线！'
                        }, () => {
                            DeviceEventEmitter.emit('isLimited');
                            this.panendend = false;
                            this.panTag = 0;
                            setTimeout(() => {
                                this.setState({
                                    showModal: false
                                })
                            }, 1000);
                        })
                    }
                }

            }
            else if (newPos < 1 && (nowDx - this.moveDx > 0)) {
                // if(this.state.KlineAllData||this.isFetching){
                if (this.state.KlineAllData) {
                    this.moveDx = 0;
                    //提示最老k线
                    if (!this.state.showModal) {
                        // if (this.panTag === 0 || this.panendend) {
                        this.setState({
                            showModal: true,
                            modalText: '已经是最老K线！'
                        }, () => {
                            DeviceEventEmitter.emit('isLimited');
                            this.panendend = false;
                            this.panTag = 0;
                            setTimeout(() => {
                                this.setState({
                                    showModal: false
                                })
                            }, 1000);
                        });
                        this.isFetching = false;
                        // }
                    }
                }
                // else {
                //     //没有到最后就去获取一次数据
                //     if( this.state.startPos < 1 && this.props.fetchMore && !this.isFetching ){
                //         this.props.fetchMore();
                //         this.isFetching = true;
                //     }
                // }

            }

        }
    }

    _onPanEnd(e, s) {
        this.moveDx = 0;
        // console.debug('_onPanEnd');
        if (!this.showPriceBox /*&& this.lastStartPos*/) {
            let kWidth = this.layout.width / this.state.showCount;
            let moveCount = -Math.round(s.dx / (kWidth * 3 / 5));

            let show = this.state.showCount;
            let newLast = Math.min(
                this.lastStartPos + show - 1 + moveCount,
                this.props.chartData.length - 1
            );
            let newPos = Math.max(newLast - show + 1, 0);

            if (newLast + 1 !== this.props.chartData.length) {
                this.panEnd = true;
                this.setState({
                    // startPos: newPos,
                    onPanEndPos: newPos,
                    panEnd: true
                });
            } else {
                this.panEnd = false;
                this.setState({
                    // startPos: newPos,
                    onPanEndPos: newPos,
                    panEnd: false
                });
            }
            this._onGestureEnd(e);
        }
    }

    _onPanCancel(e) {
        // console.debug('_onPanCancel');
    }

    getPinchDistance(x0, x1, y0, y1) {
        //x0-x1的平方+y0-y1的平方的开方 勾股定理返回手指间的移动距离
        return Math.pow((Math.pow(Math.abs(x0 - x1), 2) + Math.pow(Math.abs(y0 - y1), 2)), 0.5)
    }

    //双指缩放的事件调用的方法
    _onPinchStart(e, s) {
        if (e.touches[0].pageX !== undefined) {
            if (e.touches[1].pageX !== undefined) {
                //k线宽度
                let kWidth = this.layout.width / this.state.showCount;
                if (this.panEnd) {
                    this.lastStartPos = this.state.onPanEndPos;
                } else {
                    this.lastStartPos = this.state.startPos;
                    // this.lastStartPos = this.state.startPos + Math.abs(count - this.state.showCount);
                }
                this.lastShowCount = this.state.showCount;
                this.lastKWidth = kWidth;

                //放大的点的x轴位置为两手指中间
                this.lastCenterX =
                    (e.touches[1].locationX + e.touches[0].locationX) / 2;
                //小于等于 x，且与 x 最接近的整数
                this.lastCenterPos = Math.floor(
                    this.lastStartPos + this.lastCenterX / kWidth
                );
                //获取手势操作的手指间距离？
                this.lastDistance = this.getPinchDistance(e.touches[0].pageX, e.touches[1].pageX, e.touches[0].pageY, e.touches[1].pageY)

            }
        }
    }
    //按照斐波那契数列进行缩放
    _onPinchMove(e, s) {
        if (e.touches[0].pageX !== undefined) {
            if (e.touches[1].pageX !== undefined) {
                //获取最终移动的距离
                let distance = this.getPinchDistance(e.touches[0].pageX, e.touches[1].pageX, e.touches[0].pageY, e.touches[1].pageY)
                if (Math.abs(distance - this.lastDistance) < 20) return
                this.currentDate = new Date().getTime();
                //1 首先判断数放大还是缩小
                if ((distance - this.lastDistance) < 0) {//缩小
                    if (this.state.showModal === true) {
                        return;
                    }
                    this.controlKline(1);
                    // _defaultIndexOfKLineNumber = Math.min(_defaultIndexOfKLineNumber+1,_KLineNumberInScreenArray.length-1)
                }
                else {//放大
                    if (this.state.showModal === true) {
                        return;
                    }
                    this.controlKline(0);
                    // _defaultIndexOfKLineNumber = Math.max(_defaultIndexOfKLineNumber-1,0)
                }
                this.lastDistance = distance;
            }
        }
        // let newShowCount = _KLineNumberInScreenArray[_defaultIndexOfKLineNumber]
        //
        // let newKWidth = this.layout.width / newShowCount;
        // let leftCount = Math.floor(((e.touches[1].locationX + e.touches[0].locationX) /2) / newKWidth);
        // let leftPos = Math.max(this.lastCenterPos - leftCount, 0)
        // if( leftPos != this.state.startPos || newShowCount != this.state.showCount){
        //
        //     if (this.panEnd) {
        //         this.setState({ onPanEndPos: leftPos, showCount: newShowCount },()=>{
        //             this.currentDate = new Date().getTime();
        //         });
        //     } else {
        //         this.setState({ startPos: leftPos, showCount: newShowCount },()=>{
        //             this.currentDate = new Date().getTime();
        //         });
        //     }
        //
        // }
        //
        // this.lastDistance = distance

    }

    _onPinchEnd(e) {
        // console.debug('_onPinchEnd');
        this._onGestureEnd(e);
    }

    _onPinchCancel(e) {
        // console.debug('_onPinchCancel');
        this._onGestureEnd(e);
    }

    //展示光标 或隐藏光标
    _onTap(e, s) {
        // console.debug('onPanResponderMove _onTap');
        this.showPriceBox = !this.showPriceBox;
        // this.showPriceBox = true;

        this.props.callbackPriceBox(this.showPriceBox);
        if (e && e.nativeEvent && e.nativeEvent.locationY)
            this._showPriceBox(s.x0, e.nativeEvent.locationY);
        else if (e && e.locationY) this._showPriceBox(s.x0, e.locationY);
        else this._showPriceBox(s.x0, s.y0);
    }

    _hidenPriceBox() {

        this.props.callbackPriceBox(false);
        this.priceboxStyle.opacity = 0.0;
        // this.setState({
        //     priceboxStyle: Object.assign({}, this.priceboxStyle)
        // });

        this.verticallineStyle.opacity = 0.0;
        // this.setState({
        //     verticallineStyle: Object.assign({}, this.verticallineStyle)
        // });
        this.props.callbackF(null, null);
        // this.setState({ legendPos: -1 });
        this.lastVerticalPos = -1;

        // this.getMainFormulaData(
        //     -1,
        //     [
        //         this.state.mainFormula,
        //         this.state.viceFormula,
        //         this.state.chartLoc
        //     ],
        //     this.props.onMainFmlResult
        // );

        this.horizontallineStyle.opacity = 0.0;
        this.setState({
            legendPos: -1,
            priceboxStyle: Object.assign({}, this.priceboxStyle),
            verticallineStyle: Object.assign({}, this.verticallineStyle),
            horizontallineStyle: Object.assign({}, this.horizontallineStyle)
        });
    }

    //十字光标的位置
    _showPriceBox(xPos, yPos) {
        // console.debug('onPanResponderMove _showPriceBox');
        if (!this.lastVerticalPos) this.lastVerticalPos = -1;

        let kWidth = this.layout.width / this.state.showCount;
        let stickPos = Math.floor((xPos - 15) / kWidth);
        let currentVerticalPos = (stickPos + 0.5) * kWidth;

        let currentHorizontalPos = yPos - 0;

        // if (
        //     currentVerticalPos === this.lastVerticalPos &&
        //     this.showPriceBox == true
        // ) {
        //     return;
        // } else {
        //     this.lastVerticalPos = currentVerticalPos;
        // }
        this.lastVerticalPos = currentVerticalPos;

        let onLeft = xPos < this.layout.width / 2;
        if (this.showPriceBox) {
            if (onLeft) {
                this.priceboxStyle.right = 0;
                this.priceboxStyle.left = null;
            } else {
                this.priceboxStyle.right = null;
                this.priceboxStyle.left = 0;
            }
            this.priceboxStyle.opacity = 0.8;
            this.verticallineStyle.opacity = 1.0;
            this.verticallineStyle.height = this.layout.height;
            this.verticallineStyle.left = currentVerticalPos;
            let legendPos = this.panEnd ? this.state.onPanEndPos + stickPos : this.state.startPos + stickPos;

            //控制legendPos 大约0去数组里面取值，不然报数组溢出
            if (legendPos >= 0) {
                //模拟器 以下2行卡顿
                let stickData = Object.assign({}, this.props.chartData[legendPos])
                this.props.callbackHeadTime(stickData.ShiJian)

                let previousStickData = Object.assign({}, this.props.chartData[legendPos - 1])

                if (this.splitChartData.length > 0) {
                    let splitData = Object.assign({}, this.splitChartData[legendPos])
                    let previousSplitData = Object.assign({}, this.splitChartData[legendPos - 1])

                    stickData.ShouPanJia = splitData.ShouPanJia;
                    stickData.KaiPanJia = splitData.KaiPanJia;
                    stickData.ZuiDiJia = splitData.ZuiDiJia;
                    stickData.ZuiGaoJia = splitData.ZuiGaoJia;
                    stickData.ChengJiaoLiang = splitData.ChengJiaoLiang;

                    previousStickData.ShouPanJia = previousSplitData.ShouPanJia;
                    previousStickData.KaiPanJia = previousSplitData.KaiPanJia;
                    previousStickData.ZuiDiJia = previousSplitData.ZuiDiJia;
                    previousStickData.ZuiGaoJia = previousSplitData.ZuiGaoJia;
                    previousStickData.ChengJiaoLiang = previousSplitData.ChengJiaoLiang;
                }

                this.props.callbackF(stickData, previousStickData);


                this.horizontallineStyle.opacity = 1.0;
                this.horizontallineStyle.width = this.layout.width;
                this.horizontallineStyle.top = currentHorizontalPos;


                this.setState({
                    priceboxStyle: Object.assign({}, this.priceboxStyle),
                    verticallineStyle: Object.assign({}, this.verticallineStyle),
                    legendPos: legendPos,
                    horizontallineStyle: Object.assign({}, this.horizontallineStyle),
                    priceboxData: Object.assign(
                        {},
                        this.props.chartData[this.state.startPos + stickPos]
                    )
                });
            }

        } else {
            this._hidenPriceBox();
        }
    }

    _onGestureEnd(e) {
        if (
            (this.state.startPos < 120 || this.state.onPanEndPos < 120) &&
            this.props.fetchMore &&
            !this.isFetching
        ) {
            this.props.fetchMore();
            this.isFetching = true;
        }
    }

}


export class DZHKlineChart extends Component {
    static defaultProps = {
        serviceUrl: '/quote/kline'
    };

    constructor(props) {
        super(props);

        this.period = '1day';
        this.isFull = false;

        this.defaultParams = {
            // period: '1day',
            split: 0,
            start: -460,
            sub: true
        };
        this.state = {
            findex: -1,//从最后一根开始获取数据
            floatButtonBottom: 0,
            sideBtnBottom: 0,
            splitStr: 1,
        };

        this.layout = {};
        this.showSlider = false;
        this.fetchMoreCount = 0;
    }

    componentWillUnmount() {
        this.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
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

    componentWillReceiveProps(nextProps) {
        let curParams = Object.assign(
            {},
            this.defaultParams,
            this.props.params
        );
        let nextParams = Object.assign(
            {},
            this.defaultParams,
            nextProps.params
        );
        if (
            require('lodash/eq')(
                curParams,
                nextParams
            ) /*curParams !== nextParams*/
        ) {
            this.kdata = [];
        }
        if (nextProps.name && this.props.name != nextProps.name) {
            this.kdata = [];
        }
        if (
            nextParams.obj !== curParams.obj ||
            nextParams.period !== curParams.period
        ) {
            this.kdata = [];
            this.setState({ data: null });
            this.defaultParams.start = -460;
            this.isFull = false;
        }
        // console.debug('this.kdata length :', this.kdata.length);
        // super.componentWillReceiveProps(nextProps);

        // 判断是否需要重新订阅数据
        if (this.props.serviceUrl !== nextProps.serviceUrl || JSON.stringify(this.props.params) !== JSON.stringify(nextProps.params)) {
            this._query(nextProps);
        }

    }

    adapt(returndata) {
        let data = this._detailData(returndata);
        if (this.period !== this.props.params.period) {
            this.kdata && this.kdata.splice(0, this.kdata.length);
            this.period = this.props.params.period;
        }

        if (data.length > 0) {

            data = data[0].Data || [];
            if (!this.kdata) {
                this.kdata = data;
            }
            else {
                while (this.kdata.length > 0) {
                    if (this.comparePeriod(this.kdata[this.kdata.length - 1].ShiJian,
                        data[0].ShiJian,
                        this.props.params.period ||
                        this.defaultParams.period) >= 0) {
                        this.kdata.pop();
                    }
                    else {
                        break;
                    }
                }
                data.forEach(stick => this.kdata.push(stick));
            }
            this.isFull = this.kdata.length != Math.abs(this.defaultParams.start);
            if (this.isFull) {
                // //已经加载完数据了
                DeviceEventEmitter.emit('KlineAllData');
            } else {
                DeviceEventEmitter.emit('notFull');
            }
            return Object.assign([], this.kdata);
        }
        return false;
    }

    comparePeriod(time1, time2, period) {
        // let t1 = new Date(time1*1000);
        // let t2 = new Date(time2*1000);
        // console.debug(t1,t2);

        if (
            period === '1min' ||
            period === '5min' ||
            period === '15min' ||
            period === '30min' ||
            period === '60min' ||
            period === '120min'
        ) {
            return time1 - time2;
        } else if (period === '1day') {
            let day1 = parseInt(time1 / 86400);
            let day2 = parseInt(time2 / 86400);
            return day1 - day2;
        } else if (period === 'week') {
            let day1 = parseInt(time1 / 86400);
            let day2 = parseInt(time2 / 86400);
            let week1 = parseInt((day1 + 3) / 7);
            let week2 = parseInt((day2 + 3) / 7);
            // console.log('周 ===== '+week1+'////// ='+week2+'///// ='+(week1 - week2))
            // return week1 - week2;
            //时间戳进行对比，不同就追加到后面。 以前的判断会将倒数第二个数据删除点
            return time1 - time2;
        } else if (period === 'month') {
            let date1 = new Date(time1 * 1000);
            let date2 = new Date(time2 * 1000);

            // console.log('k线 ==== 月份时间错 = ',time1,time2,date1,date2);
            return (
                (time1 - time2)
                // (date1.getYear() - date2.getYear()) * 12 +
                // (date1.getMonth() - date2.getMonth())
            );
        }
    }

    fetchMore() {
        this.defaultParams.start *= 2;
        // this._query(this.props);
        this._fetchHistoryStick(this.props);
    }
    _fetchHistoryStick(props) {

        // console.log('历史行情数据====  length',this.state.data.length);
        if (this.state.data && this.state.data.length > 0) {

            let stick = this.state.data[0];
            let timeStamp = stick.ShiJian;
            let code = props.params.obj;
            let period = this._returnTempPeriod(props);
            historyCandleStick.request(timeStamp.toString(), code, '0', period.toString(), this.fetchMoreCount.toString(), (resultData) => {
                // console.log('历史行情数据==== 111',this.state.data.length);
                if (!(resultData instanceof Error)) {
                    this.fetchMoreCount++;
                    // console.log('历史行情数据==== 2222',this.state.data.length);
                    Promise.resolve(this.adaptHistory(resultData)).then((data) => {
                        if (data !== false) {
                            this.setState({ data });
                        }
                        // 触发事件
                        let onData = this.props.onData;
                        (typeof onData === 'function') && onData(data);
                    });
                }
            })

        }
    }

    _detailDataHistory(data) {

        if (data.entitiesArray_Count <= 0) {
            return;
        }
        let newData = [];

        data.entitiesArray.map((item) => {
            let tempData = {
                ShiJian: item.time,
                KaiPanJia: this._keepTwoDecimal(item.open),
                ZuiGaoJia: this._keepTwoDecimal(item.high),
                ZuiDiJia: this._keepTwoDecimal(item.low),
                ShouPanJia: this._keepTwoDecimal(item.close),
                ChengJiaoLiang: this._keepTwoDecimal(item.volume),
                ChengJiaoE: this._keepTwoDecimal(item.amount),
                fpVolume: this._keepTwoDecimal(item.fpVolume),
                fpAmount: this._keepTwoDecimal(item.fpAmount),
                ChengJiaoBiShu: 0,
                ChiCang: 0,
                ZengCang: 0,
                JieSuanJia: 0,
            };
            newData.push(tempData);
        });


        if (this.state.data && this.state.data.length >= 0) {
            let newData1 = Object.assign([], this.state.data);
            newData.push.apply(newData, newData1)
        }

        let adaptData = [];
        adaptData.push({ "Obj": data.label, "Data": newData });

        // console.log('行情历史数据 = data',adaptData,this.state.data);
        return adaptData;
    }

    adaptHistory(returndata) {
        // console.log('行情历史数据 = returndata',this.kdata.length);
        let data = this._detailDataHistory(returndata);
        if (this.period !== this.props.params.period) {
            this.kdata && this.kdata.splice(0, this.kdata.length);
            this.period = this.props.params.period;
        }
        if (data.length > 0) {

            data = data[0].Data || [];
            if (!this.kdata) {
                this.kdata = data;
            }
            else {
                while (this.kdata.length > 0) {
                    if (this.comparePeriod(this.kdata[this.kdata.length - 1].ShiJian,
                        data[0].ShiJian,
                        this.props.params.period ||
                        this.defaultParams.period) >= 0) {
                        this.kdata.pop();
                    }
                    else {
                        break;
                    }
                }
                data.forEach(stick => this.kdata.push(stick));
            }
            this.isFull = this.kdata.length != Math.abs(this.defaultParams.start);
            if (this.isFull) {
                // //已经加载完数据了
                DeviceEventEmitter.emit('KlineAllData');
            } else {
                DeviceEventEmitter.emit('notFull');
            }
            return Object.assign([], this.kdata);
        }
        return false;
    }


    cancel() {

        this._request && this._request.cancel();
        this._request = null;
    }
    _query(props) {
        // 取消上次请求
        this.cancel();

        // 重新请求
        if (props.params) {
            // 记录上一次请求参数
            let tempPeriod = 0;
            if (props.params.period === '1day') {
                tempPeriod = 5;
            } else if (props.params.period === 'week') {
                tempPeriod = 6;
            } else if (props.params.period === 'month') {
                tempPeriod = 7;
            } else if (props.params.period === '1min') {
                tempPeriod = 0;
            } else if (props.params.period === '5min') {
                tempPeriod = 1;
            } else if (props.params.period === '15min') {
                tempPeriod = 2;
            } else if (props.params.period === '30min') {
                tempPeriod = 3;
            } else if (props.params.period === '60min') {
                tempPeriod = 4;
            }
            this._request = connection.request('FetchCandleStickNative', {
                label: props.params.obj,
                period: tempPeriod,
                split: 0,
                start: this.state.findex,
                time: 0,
                count: this.defaultParams.start,
                subscribe: this.defaultParams.sub
            }, (returndata) => {
                if (!(returndata instanceof Error)) {
                    Promise.resolve(this.adapt(returndata)).then((data) => {
                        if (data !== false) {
                            this.setState({ data });
                        }
                        // 触发事件
                        let onData = this.props.onData;
                        (typeof onData === 'function') && onData(data);
                    });
                }
            });
            return this._request;
        }

    }

    _returnTempPeriod(props) {
        // 重新请求
        // 记录上一次请求参数
        let tempPeriod = 0;
        if (props.params) {
            if (props.params.period === '1day') {
                tempPeriod = 5;
            } else if (props.params.period === 'week') {
                tempPeriod = 6;
            } else if (props.params.period === 'month') {
                tempPeriod = 7;
            } else if (props.params.period === '1min') {
                tempPeriod = 0;
            } else if (props.params.period === '5min') {
                tempPeriod = 1;
            } else if (props.params.period === '15min') {
                tempPeriod = 2;
            } else if (props.params.period === '30min') {
                tempPeriod = 3;
            } else if (props.params.period === '60min') {
                tempPeriod = 4;
            }
        }
        return tempPeriod;
    }

    _detailData(data) {

        if (data.entitiesArray_Count <= 0) {
            return;
        }
        let newData = [];
        data.entitiesArray.map((item) => {
            let stickEntity = item.sticks;
            let fundFlow = item.fundLow
            let tempData = {
                ShiJian: stickEntity.time,
                KaiPanJia: this._keepTwoDecimal(stickEntity.open),
                ZuiGaoJia: this._keepTwoDecimal(stickEntity.high),
                ZuiDiJia: this._keepTwoDecimal(stickEntity.low),
                ShouPanJia: this._keepTwoDecimal(stickEntity.close),
                ChengJiaoLiang: this._keepTwoDecimal(stickEntity.volume),
                ChengJiaoE: this._keepTwoDecimal(stickEntity.amount),
                fpVolume: this._keepTwoDecimal(stickEntity.fpVolume),
                fpAmount: this._keepTwoDecimal(stickEntity.fpAmount),
                ChengJiaoBiShu: 0,
                ChiCang: 0,
                ZengCang: 0,
                JieSuanJia: 0,
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
        let adaptData = [];
        adaptData.push({ "Obj": data.label, "Data": newData });
        return adaptData;
    }
    _keepTwoDecimal(num) {
        let result = parseFloat(num);
        if (isNaN(result)) {
            return 0.00;
        }
        result = Math.round(num * 100) / 100;
        return result;
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState;
    }

    render() {
        if (!this.state.data) {
            return <Loading style={{ marginTop: 30 }} />;
        } else {
            return (
                <View style={[styles.flex]}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <KlineChart
                            ref="klc"
                            //style={[{flex:1}, this.props.style]}
                            chartData={this.state.data}
                            stkInfo={{
                                Obj: this.props.params.obj,
                                MingCheng: this.props.name || ''
                            }}
                            split={this.props.params.type === 1 ? this.state.splitStr : 0}
                            tempPeriod={this._returnTempPeriod(this.props)}
                            fetchMore={this.fetchMore.bind(this)}
                            callback={this.props.callback}
                            chartLoc={this.state.chartLoc}
                            mainFormula={this.state.mainFormula}
                            viceFormula={this.state.viceFormula}
                            {...this.props}
                        />
                    </View>
                </View>
            );
        }
    }

    _hidenPriceBox1 = () => {
        this.refs && this.refs.klc && this.refs.klc._hidenPriceBox();
    }

    _onPickFormula(formula) {
        // console.debug(formula);
        if (formula.chartLoc) {
            this.setState({ chartLoc: formula.chartLoc });
            ShareSetting.selectVice2Formula(formula.chartLoc);
            AsyncStorage.setItem('chartLoc', formula.chartLoc);
        } else if (ShareSetting.isMainFormula(formula)) {
            this.setState({ mainFormula: formula });
            ShareSetting.selectFormula(formula);
            AsyncStorage.setItem('mainFormula', formula);
        } else {
            this.setState({ viceFormula: formula });
            ShareSetting.selectFormula(formula);
            AsyncStorage.setItem('viceFormula', formula);
        }
    }

    _onChangeEmpower(split) {
        //现在只有除权有数据，这里统一设置为除权
        if (this.defaultParams.split !== split) {
            this.defaultParams.split = split;
            this.setState({ splitStr: split })
            // this._query(this.props);
        }
    }

    _onChangeDefaultIndex(number) {
        _defaultIndexOfKLineNumber = number;
    }
}

var styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    icon: {
        width: 30,
        height: 30
    },
    pannel: {
        flex: 1,
        width: 60,
        height: 30,
        position: 'absolute',
        //right: 0,
        //top: 0,
        flexDirection: 'row',
        opacity: 0.5,
        backgroundColor: 'transparent'
    },
    pricebox: {
        flex: 1,
        width: 95,
        height: 120,
        position: 'absolute',
        left: 0,
        top: 0,
        flexDirection: 'row',
        opacity: 0.0,
        backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR
    },
    verticalline: {
        flex: 1,
        position: 'absolute',
        opacity: 0.0,
        width: 0.5,
        top: 0,
        backgroundColor: baseStyle.DARK_GRAY
    },
    horizontalline: {
        flex: 1,
        position: 'absolute',
        opacity: 0.0,
        height: 0.5,
        left: 0,
        backgroundColor: baseStyle.DARK_GRAY
    }
});
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AllActions from '../../actions/UserInfoAction'
import { connection } from './YDYunConnection';

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,

}),
    (dispatch) => ({
        userInfo: bindActionCreators(AllActions, dispatch)
    })
)(KlineChart)