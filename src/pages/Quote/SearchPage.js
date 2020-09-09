'use strict';

import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    Platform,
    InteractionManager,
    TextInput,
    Dimensions,
    Keyboard,
    TouchableOpacity,
    BackHandler,
    DeviceEventEmitter,
    StatusBar,
    AppState,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import BasePage from '../BasePage.js';
import * as baseStyle from '../../components/baseStyle.js';
import DZHSearchStockList from './SearchStockList.js';
import Button from '../../components/Button.js';
import DetailPage from './DetailPage'
import dismissKeyboard from '../../../node_modules/react-native/Libraries/Utilities/dismissKeyboard';
import RATE from '../../utils/fontRate.js';
import Yd_cloud from '../../wilddog/Yd_cloud';
import YDAlert from '../../components/YDAlert'
import Toast, { DURATION } from 'react-native-easy-toast'
import ShareSetting from '../../modules/ShareSetting'
import { CustomTextInput } from '../../../node_modules_modify/react-native-custom-keyboard';
import CustomKeyboard from '../../keyboard/index.js';//用于自定义键盘

export class SearchPage extends BasePage {
    constructor(props) {
        super(props);
        this.hotStockAllData = [];
        this.tempListData = "";
        this.state = {
            isShowCustomKeyboard: true,
            isShowCustomKeyboardTabBar: false,
            focus: true,
            value: '',
            isShowHotStock: true,
            hotStockData: [],
            keyboardHeight: 0,
            isShowTempList: false,
            navigatorHeight: 0

        }

        this.hotStock_Ref = Yd_cloud().ref(MainPathYG + "HotStockList")

        //bind所有函数
        this._showKeyboardTabBar = this._showKeyboardTabBar.bind(this)
        this._hideKeyboard = this._hideKeyboard.bind(this)
        this._switchIMEToNumber = this._switchIMEToNumber.bind(this)
        this._switchIMEToABC = this._switchIMEToABC.bind(this)
        this._switchIMEToChinese = this._switchIMEToChinese.bind(this)
        this._hotStock = this._hotStock.bind(this)
        this._hotStockButton = this._hotStockButton.bind(this)
        // this._popToOptionalStockPage = this._popToOptionalStockPage.bind(this)
        this._clearContent = this._clearContent.bind(this)
        this._clearButton = this._clearButton.bind(this)
        this._handleAppStateChange = this._handleAppStateChange.bind(this)


        /*************************输入框为textview时用于刷新的方法群************************************/
        this.model = {
            _keys: [],
            _listeners: [],
            addKey(key) {
                this._keys.push(key);
                this._notify();
            },
            delKey() {
                this._keys.pop();
                this._notify();
            },
            clearAll() {
                this._keys = [];
                this._notify();
            },
            getKeys() {
                return this._keys;
            },
            onChange(listener) {
                if (typeof listener === 'function') {
                    this._listeners.push(listener);
                }
            },
            _notify() {
                this._listeners.forEach((listner) => {
                    listner(this);
                });
            }
        };
        /**********************************************************************************************************/
    }

    componentDidMount() {
        super.componentDidMount();
        this.model.onChange((model) => {
            const { setSearchContent } = this.props.actions;
            setSearchContent(model.getKeys().join(''))
        });
        this.model.clearAll();
    }


    componentWillUnmount() {
        //自定义键盘置位123
        AsyncStorage.setItem('isABC', 'false')
        //去除监听
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        //移除野狗监听
        // this.itemsRef.off()
        //清楚返回键监听
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);

        }
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.getFocusListener && this.getFocusListener.remove()

    }

    componentWillMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        //注册监听当从详情页返回时
        this.getFocusListener = DeviceEventEmitter.addListener('getFocus', (e) => {
            if (e === true) {
                // this.input && this.input.getFocus()
                // this.input1 && this.input1.focus()
            } else if (e === false) {
                //该事件从自定义键盘index发来 用于切换到系统键盘
                this.setState({ isShowCustomKeyboard: false })

            } else if (e === 'deleteInputContent') {
                this._clearContent();
                this.setState({ isShowTempList: true })
            } else if (e === 'SHOW') {
                this.refs.toast.show('添加自选成功')
            } else if (e === 'NOSHOW') {
                this.refs.toast.show('添加自选失败')
            }else if(e === 'MORESHOW') {
                this.refs.toast.show('最多添加100只自选股')
            }
        });

        //监听Android自带物理返回键
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
        //注册监听键盘事件
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));

        this.hotStock_Ref.orderByKey().limitToFirst(6).get((snap) => {
            if (snap.success) {
                let hotStockData = []
                this.hotStockAllData = []
                let values = Object.values(snap.nodeContent)
                for (let i = 0; i < values.length; i++) {
                    if (values[i].code.indexOf('S') == 0 || values[i].code.indexOf('s') == 0) {
                        hotStockData.push(values[i].name)
                        this.hotStockAllData.push({ 'Obj': values[i].code, 'ZhongWenJianCheng': values[i].name })
                    }
                }
                this.setState({ hotStockData: hotStockData })
            } else {
                //console.log('网络连接错误')
            }
        });
    }

    //弹出键盘回调
    _keyboardDidShow(e) {
        // console.log('键盘弹出来', JSON.stringify(e),this.state.navigatorHeight);
        if (Platform.OS == 'android') {
            // NativeModules.getnaviheight.getNaviHeight((naviHeight)=>{
            this.setState({ keyboardHeight: parseInt(e.endCoordinates.height) }, () => {
                if (this.input1) {
                    this.setState({ isShowCustomKeyboardTabBar: true })
                }
            })
            // });
        } else {
            this.setState({ keyboardHeight: parseInt(e.endCoordinates.height) }, () => {
                if (this.input1) this.setState({ isShowCustomKeyboardTabBar: true })
            })
        }
        //获取键盘高度

        // if (Platform.OS === 'android') {
        // this.setState({isShowCustomKeyboardTabBar:true})
        // }


    }

    //隐藏键盘回调
    _keyboardDidHide(e) {
        // console.log('键盘弹出来---_keyboardDidHide');
        //键盘隐藏的时候隐藏Tip
        this.setState({ isShowCustomKeyboardTabBar: false })


    }


    //清除浏览记录
    clearHistory() {
        const { clearHistoryStocks } = this.props.actions;
        clearHistoryStocks()
    }


    /*************************输入框为textview时用于键盘回调的方法群************************************/
    _handleClear() {
        this.model.clearAll();
    }

    _handleDelete() {
        this.model.delKey();
    }

    _handleClose() {
        // console.log('键盘弹出来---_handleClose');
        const { showKeyboard } = this.props.actions;
        showKeyboard(false)
    }

    _handleKeyPress(key) {
        // console.log('键盘弹出来---_handleKeyPress');
        this.model.addKey(key);
    }

    _toSH() {
        let obj = { Obj: 'SH000001', ZhongWenJianCheng: '上证指数' };
        this.props.navigator.push({ component: <DetailPage {...obj} fromPage={'searchPage'} /> })
    }

    _toSZ() {
        let obj = { Obj: 'SZ399001', ZhongWenJianCheng: '深证成指' };
        this.props.navigator.push({ component: <DetailPage {...obj} fromPage={'searchPage'} /> })
    }

    /**********************************************************************************************************/


    //键盘tip 在固定位置控制显示与否
    _showKeyboardTabBar() {
        if (this.state.isShowCustomKeyboardTabBar) {
            return (

                <View style={{
                    borderTopWidth: 1, borderTopColor: '#f1f1f1',
                    height: 39,
                    backgroundColor: '#ffffff',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    position: 'absolute',
                    top: baseStyle.height - (this.state.keyboardHeight + 39),
                    right: 0,
                    left: 0
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this._switchIMEToNumber()}>
                            <View style={{ height: 39, justifyContent: 'center' }}>
                                <Text
                                    style={{ fontSize: 15, color: '#333333', marginLeft: 20, marginRight: 20 }}>123</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this._switchIMEToABC()}>
                            <View style={{ height: 39, justifyContent: 'center' }}>
                                <Text
                                    style={{ fontSize: 15, color: '#333333', marginLeft: 20, marginRight: 20 }}>首字母</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this._switchIMEToChinese()}>
                            <View style={{ height: 39, justifyContent: 'center', backgroundColor: '#DDDDDE' }}>
                                <Text
                                    style={{ fontSize: 15, color: '#006acc', marginLeft: 20, marginRight: 20 }}>中文</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{}}>
                        <TouchableOpacity onPress={() => this._hideKeyboard()}>
                            <Image source={require('../../images/icons/sqjp.png')} style={{ marginRight: 15 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

    }


    //切换到数字键盘
    _switchIMEToNumber() {
        global.IsABC = "false";
        this.setState({ isShowCustomKeyboard: true, }, () => {
            DeviceEventEmitter.emit('ISABC', "false");
            this.input.getFocus()
            // this._hideKeyboard();
            // this.setState({isShowCustomKeyboardTabBar: false})

        })

        // this.setState({ isShowCustomKeyboard: true},()=>{
        //     this.setState({isShowCustomKeyboardTabBar: false},()=>{
        //         // AsyncStorage.setItem('isABC', 'false')
        //
        //     })
        // })




    }

    //切换到字母键盘
    _switchIMEToABC() {
        global.IsABC = "true";
        this.setState({ isShowCustomKeyboard: true, }, () => {
            DeviceEventEmitter.emit('ISABC', "true");
            this.input.getFocus()
            // this._hideKeyboard();
            // this.setState({isShowCustomKeyboardTabBar: false})
        })
        // this.setState({isShowCustomKeyboard: true},()=>{
        //     this.setState({isShowCustomKeyboardTabBar: false, },()=>{
        //         // AsyncStorage.setItem('isABC', 'true')
        //
        //     })
        // })
    }

    //当前键盘问中文键盘所以空实现
    _switchIMEToChinese() {
    }
    _handleAppStateChange(appState) {
        if (appState == 'background') {
            this.setState({ isShowCustomKeyboardTabBar: false }, () => {
                this._hideKeyboard();
            })
        }
    }
    //隐藏原生键盘
    _hideKeyboard() {
        dismissKeyboard()

    }

    //自定义textinput内容变化回调
    onChangeText = text => {
        //  console.log('搜索页面======== 输入内容'+text)
        const { searchResultList } = this.props.stateSearchResultList
        this.setState({ value: text });
        if (text != undefined) this.tempListData = text;
        if (text.length > 0) {
            this.setState({ isShowHotStock: false, isShowTempList: true })
        }
        if (text.length == 0) {
            this.setState({ isShowHotStock: true })
        }

    };


    //热搜股票view
    _hotStock() {
        if (this.state.isShowHotStock) {
            return (
                <View style={{ height: 143, backgroundColor: '#ffffff' }}>
                    <View style={{ height: 30, marginLeft: 15, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#666666' }}>热门股票：</Text>
                    </View>
                    <View style={{ borderBottomColor: '#f1f1f1', borderBottomWidth: 1 }}></View>
                    <View style={{ flex: 1, marginLeft: 15, marginRight: 15, marginTop: 12 }}>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                            {this._hotStockButton('#fc525a', '#fc525a', this.state.hotStockData[0], true, 0)}
                            {this._hotStockButton('#fe9350', '#fe9350', this.state.hotStockData[1], false, 1)}
                            {this._hotStockButton('#2289e7', '#2289e7', this.state.hotStockData[2], true, 2)}
                        </View>
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 15,
                            marginBottom: 12
                        }}>
                            {this._hotStockButton('#666666', '#666666', this.state.hotStockData[3], true, 3)}
                            {this._hotStockButton('#666666', '#666666', this.state.hotStockData[4], false, 4)}
                            {this._hotStockButton('#666666', '#666666', this.state.hotStockData[5], true, 5)}
                        </View>
                    </View>
                    <View style={{
                        borderBottomColor: '#f6f6f6',
                        borderBottomWidth: this.historyStocksLength > 0 ? 10 : 0
                    }}></View>
                </View>
            );
        }

    }

    //热搜股票button
    _hotStockButton(borderColor, textColor, textContent, isMiddle, i) {
        // let data = {'Obj': this.hotStockAllData[i], 'ZhongWenJianCheng': this.state.hotStockData[i]}
        let data = this.hotStockAllData[i]
        if (isMiddle) {
            return (
                <View style={{
                    flex: 1,
                    height: 32,
                    borderColor: borderColor,
                    borderWidth: 1,
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity onPress={() => this._hotToDetail(data)}>
                        <Text style={{ color: textColor, fontSize: 13 }}>{textContent}</Text>
                    </TouchableOpacity>
                </View>

            )
        } else {
            return (
                <View style={{
                    flex: 1,
                    height: 32,
                    borderColor: borderColor,
                    borderWidth: 1,
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 10,
                    marginRight: 10
                }}>
                    <TouchableOpacity onPress={() => this._hotToDetail(data)}>
                        <Text style={{ color: textColor, fontSize: 13 }}>{textContent}</Text>
                    </TouchableOpacity>
                </View>


            )
        }

    }

    //取消按钮 pop掉当前页面并置为自选股页签
    _popToOptionalStockPage() {
        // this.props.navigator.popToTop()
        Navigation.pop(this.props.navigation)
        // Navigation.popToTop(this.props.navigation,null)
        // DeviceEventEmitter.emit('pageToListener', true);
    }

    //清除输入框中内容
    _clearContent() {
        this.setState({ value: '', isShowHotStock: true });
    }

    //清除按钮
    _clearButton() {
        if (this.state.value != '') {
            return (
                <TouchableOpacity onPress={() => this._clearContent()}>
                    <View style={{ height: 30, paddingRight: 10, paddingLeft: 10, justifyContent: 'center' }}>
                        <Image source={require('../../images/icons/clear.png')} />
                    </View>
                </TouchableOpacity>
            )
        }
    }

    //弹出是否删除历史记录的提示框
    showDialog() {
        this.ydAlert.showAlert()
    }


    //拦截返回键
    onBackAndroid = () => {
        this._popToOptionalStockPage()
        return true;
    };


    //输入框获取焦点监听
    _getFocusListener() {
        // console.log('键盘弹出来---_getFocusListener');
        this.setState({ isShowCustomKeyboardTabBar: false })
    }

    render() {
        // console.log('键盘弹出来---render=');
        const { historyStocks } = this.props.stateHistory
        this.historyStocksLength = historyStocks.length
        let isShowClearHistory = true
        if (historyStocks.length > 0) {
            isShowClearHistory = true
        } else {
            isShowClearHistory = false
        }
        let statusBarHeight = 0;
        if (Platform.OS == 'ios') {
            statusBarHeight = baseStyle.isIPhoneX ? 44 : 20;
        } else {
            statusBarHeight = StatusBar.currentHeight;
        }
        let entrance = this.props.navigation.state.params && this.props.navigation.state.params.entrance == '股票详情' ? 'K线图' : this.props.navigation.state.params.entrance
        return (
            <View style={{ backgroundColor: baseStyle.TITLE_BACKGROUND_COLOR, flex: 1 }}>
                <Toast position={'center'} ref="toast" />

                <View style={{
                    backgroundColor: '#F92400',
                    flexDirection: 'row',
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: statusBarHeight,
                }}>
                    <View style={{
                        backgroundColor: '#ffffff',
                        flex: 1,
                        height: 30,
                        marginLeft: 15,
                        marginVertical: 10,
                        flexDirection: 'row',
                        borderColor: baseStyle.TITLE_BACKGROUND_COLOR,
                    }}>
                        <View style={{ marginLeft: 10, justifyContent: 'center' }}>
                            <Image source={require('../../images/icons/cy_search_gray.png')} />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 }}>
                            <CustomTextInput
                                ref={(c) => this.input = c}
                                style={{ height: 40, fontSize: RATE(28) }}
                                customKeyboardType='CustomKeyboard'
                                value={this.state.value}
                                onChangeText={this.onChangeText}
                                placeholder={'请输入股票代码/全拼/首字母'}
                                autoFocus={true}
                                maxLength={20}
                                underlineColorAndroid="transparent"
                            />
                            {this.state.isShowCustomKeyboard
                                ?
                                null
                                :
                                <View style={{ flex: 1, justifyContent: 'center', position: "absolute", backgroundColor: '#FFFFFF', left: 0, right: 0, top: 0, bottom: 0 }}>
                                    <TextInput
                                        ref={(c) => this.input1 = c}
                                        style={{ height: 40, fontSize: RATE(28) }}
                                        value={this.state.value}
                                        onChangeText={this.onChangeText}
                                        placeholder={'请输入股票代码/全拼/首字母'}
                                        autoFocus={true}
                                        maxLength={20}
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            }
                        </View>
                        {this._clearButton()}
                    </View>
                    <TouchableOpacity onPress={() => this._popToOptionalStockPage()}>
                        <View style={{ justifyContent: 'center', marginLeft: 15, marginRight: 15, height: 30 }}>
                            <Text style={{ fontSize: 16, color: baseStyle.WHITE }}>取消</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {
                    this.state.isShowTempList
                        ?
                        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                            <ScrollView keyboardShouldPersistTaps={true}>
                                <DZHSearchStockList
                                    onItemPress={(data) => this._pushToDetail(data)}
                                    oneData={(data) => this._pushToDetail(data)}
                                    style={{ flex: 1 }}
                                    params={this.tempListData && { input: this.tempListData }}
                                    entrance={entrance}
                                />

                            </ScrollView>
                        </View>
                        :
                        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                            {this._hotStock()}
                            <ScrollView keyboardShouldPersistTaps={true}>
                                <DZHSearchStockList
                                    onItemPress={(data) => this._pushToDetail(data, true)}
                                    style={{ flex: 1 }}
                                    params={this.state.value && { input: this.state.value }}
                                    entrance={entrance}
                                />
                                <View style={{ flex: 1, paddingTop: 10, paddingBottom: 10 }}>
                                    <Button onPress={this.showDialog.bind(this)} style={{ flex: 1 }}>
                                        {isShowClearHistory && this.state.value == '' ?
                                            <Text style={{ color: baseStyle.SMALL_TEXT_COLOR, textAlign: 'center' }}>清除历史数据</Text> :
                                            <View></View>}
                                    </Button>
                                </View>
                            </ScrollView>
                        </View>
                }


                {this._showKeyboardTabBar()}
                <YDAlert ref={(ref) => this.ydAlert = ref} surePress={() => {
                    this.clearHistory()
                }} message={'清除历史数据'} />
            </View>
        );
    }


    //热门股票
    _hotToDetail(data) {
        InteractionManager.runAfterInteractions(() => {
            this.input && this.input.loseFocus()
            this.input1 && this.input1.blur()

            let array = this.hotStockAllData;
            let index = array.indexOf(data);
            if (this.props.navigation.state.params && this.props.navigation.state.params.fromPage && this.props.navigation.state.params.fromPage == 'DetailPage') {
                DeviceEventEmitter.emit('searchPage', {
                    ...data,
                    array: array,
                    index: index,
                    isNull: this.state.value,
                });
                Navigation.pop(this.props.navigation);
            }
            else
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: array,
                    index: index,
                    isNull: this.state.value,
                    fromPage: 'searchPage'
                })

        });
    }

    //搜索列表数据
    _pushToDetail(data, isHistory) {
        InteractionManager.runAfterInteractions(() => {
            this.input && this.input.loseFocus()
            this.input1 && this.input1.blur()
            {/*this.props.navigator.push({*/ }
            {/*component: <DetailPage {...data} isNull={this.state.value}/>*/ }
            {/*})*/ }


            let array = this.props.stateSearchResultList.searchResultList;
            let index = array.indexOf(data);

            //判断展示的是否是历史搜索数据
            if (isHistory) {
                array = this.props.stateHistory.historyStocks
                if (this.props.stateHistory.historyStocks.length >= 10) {
                    array = this.props.stateHistory.historyStocks.slice(this.props.stateHistory.historyStocks.length - 10, this.props.stateHistory.historyStocks.length);
                }
            } else {
                let keywordType = this.state.value
                if (IsNumberString(this.state.value)) {
                    keywordType = '股票代码'
                } else {
                    // keywordType = data.ZhongWenJianCheng
                    keywordType = '板块名称'
                }
                sensorsDataClickObject.clickSearchResult.keyword = this.state.value
                sensorsDataClickObject.clickSearchResult.search_result_num = this.props.stateSearchResultList.searchResultList.length
                sensorsDataClickObject.clickSearchResult.keyword_type = keywordType
                sensorsDataClickObject.clickSearchResult.keyword_number = index + 1
                sensorsDataClickObject.clickSearchResult.label_name = '股票'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.clickSearchResult)
            }
            if (this.props.navigation.state.params && this.props.navigation.state.params.fromPage && this.props.navigation.state.params.fromPage == 'DetailPage') {
                // console.log("回调跳转详情");
                // console.log("data====", data);
                // console.log("array====", array);
                // console.log("index====", index);
                // console.log("this.state.value====", this.state.value);
                DeviceEventEmitter.emit('searchPage', {
                    ...data,
                    array: array,
                    index: index,
                    isNull: this.state.value,
                });
                Navigation.pop(this.props.navigation);
            }
            else {
                this.setState({ value: "", isShowTempList: false }, () => {

                    Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                        ...data,
                        array: array,
                        index: index,
                        isNull: this.state.value,
                        fromPage: 'searchPage'
                    })

                })
            }
        });
    }
}


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AllActions from '../../actions/AllActions'
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool.js';

export default connect((state) => ({
    stateKeyboard: state.KeyBoardReducer,
    stateHistory: state.HistoryReducer,
    stateSearchResultList: state.SearchReducer,
}),
    (dispatch) => ({
        actions: bindActionCreators(AllActions, dispatch)
    })
)(SearchPage)
