/**
 * 首页
 * pp. create by 2019-05-17
 */
import React, { Component } from 'react';
import { DeviceEventEmitter, Image, ImageBackground, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { DISTANCE } from "../../../src/utils/fontRate";
import * as baseStyle from '../../components/baseStyle';
import RiskTipsFooterView from '../../components/RiskTipsFooterView';
import StockFormatText from "../../components/StockFormatText";
import ShareSetting from "../../modules/ShareSetting";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { commonUtil } from '../../utils/CommonUtils';
import QuotationListener from "../../utils/QuotationListener";
import UserInfoUtil from '../../utils/UserInfoUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import { PopupPromptView } from '../Course/IndexStudyCoursePage';
import ContentListView, { VIEW_POINT_FILTER_CONDITION_1, VIEW_POINT_FILTER_CONDITION_2 } from '../Listen/ContentListView';
import LinearGradient from 'react-native-linear-gradient';
import * as ScreenUtil from '../../utils/ScreenUtil';
import { sensorsDataClickObject,sensorsDataClickActionName } from '../../components/SensorsDataTool';
import moment from 'moment';

//只是Android 使用
import FastImage from 'react-native-fast-image'

const k_banner_height = (baseStyle.width - 20) * 0.366;
const IMAGE_DIR = '../../images/Home/';

export default class HomePage extends Component {
    constructor(props) {
        super(props)
        this.showLiveRoomInfoIndex = 0;

        this.state = {
            _quoteData: [
                { Obj: 'SH000001', ZhongWenJianCheng: '上证指数', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SZ399001', ZhongWenJianCheng: '深证成指', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SZ399006', ZhongWenJianCheng: '创业板指', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SZ399005', ZhongWenJianCheng: '中小板指', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SH000300', ZhongWenJianCheng: '沪深300', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
                { Obj: 'SH000016', ZhongWenJianCheng: '上证50', ZuiXinJia: '--', ZhangDie: '--', ZhangFu: '--' },
            ],
            refreshing: false,
            bannerData: [],
            livingRoomData: {}, // 直播间数据
        }
        this.indexCodes = []; // 首页指数代码
        this.state._quoteData.forEach(obj => {
            this.indexCodes.push(obj.Obj);
        });
        this.codesStr = ''; // 首页指数代码，用逗号分割

        for (const idx in this.indexCodes) {
            this.codesStr += this.indexCodes[idx];
            if (idx == this.indexCodes.length - 1) continue; // 不拼接最后的一个逗号分隔符
            this.codesStr += ',';
        }
    }
    componentDidMount() {
        this._addListeners();
        this._loadBannerData();
        this._loadLivingRoomData();
        YdCloud().ref(ZBJ_ydyun + 'classes').on('value', (snap) => {
            if (snap.code == 0) {
                this._loadLivingRoomData();
            }
        });
    }

    _getBannerRef() {
        let userPermission = UserInfoUtil.getUserPermissions();
        if (userPermission < 3) {
            this.bannerRef = YdCloud().ref(MainPathYG + 'YingXiaoHuoDong/GuangGaoWeiAPP/LunBoTu/MianFei');
        } else {
            this.bannerRef = YdCloud().ref(MainPathYG + 'YingXiaoHuoDong/GuangGaoWeiAPP/LunBoTu/FuFei/' + userPermission);
        }
    }
    _addListeners() {
        this.loginSuccessEmitter = DeviceEventEmitter.addListener('LOGIN_SUCCESS', () => {
            this._loginStateChange();
        });
        this.logoutSuccessEmitter = DeviceEventEmitter.addListener('LOGOUT_SUCCESS', () => {
            this._loginStateChange();
        });
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            this._loadQuoteData();
        });
        this.willBlurSubscription = this.props.navigation.addListener('willBlur', () => {
            this._unsubscribeQuoteData();
        });
        this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
            if (obj != 2) {
                this._unsubscribeQuoteData();
            } else {
                this._loadQuoteData();
                this._loadLivingRoomData();
            }
        });
    }
    componentWillUnmount() {
        this.appMainTabChange && this.appMainTabChange.remove();
        this.loginSuccessEmitter && this.loginSuccessEmitter.remove();
        this.logoutSuccessEmitter && this.logoutSuccessEmitter.remove();
        this.willFocusSubscription && this.willFocusSubscription.remove();
        this.willBlurSubscription && this.willBlurSubscription.remove();
    }
    // 取消订阅报价数据
    _unsubscribeQuoteData() {
        QuotationListener.offListeners(this.indexCodes);
    }
    _loadBannerData() {
        this._getBannerRef();
        this.bannerRef.orderByKey().get((snap) => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let bannerArray = this.bubbleSort(values);
                this.setState({ bannerData: bannerArray.reverse() });
            }
        });
    }
    _loadQuoteData() {
        QuotationListener.getStockListInfo(this.indexCodes, (stocks) => {
            for (let i = 0; i < this.state._quoteData.length; i++) {
                for (let j = 0; j < stocks.length; j++) {
                    if (this.state._quoteData[i].Obj == stocks[j].c) {
                        this.state._quoteData[i].ZuiXinJia = parseFloat(stocks[j].k).toFixed(2);
                        this.state._quoteData[i].ZhangDie = parseFloat(stocks[j].x).toFixed(2);
                        this.state._quoteData[i].ZhangFu = parseFloat(stocks[j].y).toFixed(2);
                    }
                }
            }
            this.setState({ _quoteData: this.state._quoteData });
        });
        QuotationListener.addListeners(this.indexCodes, (stock) => {
            for (let i = 0; i < this.state._quoteData.length; i++) {
                if (this.state._quoteData[i].Obj == stock.c) {
                    this.state._quoteData[i].ZuiXinJia = parseFloat(stock.k).toFixed(2);
                    this.state._quoteData[i].ZhangDie = parseFloat(stock.x).toFixed(2);
                    this.state._quoteData[i].ZhangFu = parseFloat(stock.y).toFixed(2);
                }
            }
            this.setState({});
        });
    }
    _loadLivingRoomData() {
        YdCloud().ref(ZBJ_ydyun + 'classes').orderByKey().get((snap) => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                if (values.length) {
                    let status = '', living = '', showLiveRoomInfoIndex = -1;
                    for (let i = 0; i < values.length; i++) {
                        if (values[i].status == 1) {
                            showLiveRoomInfoIndex = i;
                            break;
                        } else if (values[i].status == 2) {
                            showLiveRoomInfoIndex = i;
                            break;
                        } else if (values[i].status == 3 && i == values.length - 1) {
                            showLiveRoomInfoIndex = i;
                            break;
                        }
                    }
                    if (!values[showLiveRoomInfoIndex]) return;
                    if (values[showLiveRoomInfoIndex].status && values[showLiveRoomInfoIndex].status == 1) {
                        status = '解盘中';
                    } else if (values[showLiveRoomInfoIndex].status && values[showLiveRoomInfoIndex].status == 2) {
                        status = '未开始';
                    } else if (values[showLiveRoomInfoIndex].status && values[showLiveRoomInfoIndex].status == 3) {
                        if (values[showLiveRoomInfoIndex].hasvod && values[showLiveRoomInfoIndex].hasvod == 0) {
                            status = '文件上传中';
                        } else {
                            status = '回看';
                        }
                    }
                    if (values[values.length - 1].status && values[values.length - 1].status == 3) {
                        living = '回看';
                    }
                    else {
                        living = '解盘中';
                    }
                    this.setState({
                        livingRoomData: {
                            liveRoom_publishTime:values[showLiveRoomInfoIndex].update_time,
                            liveRoom_end: values[showLiveRoomInfoIndex].end,
                            liveRoom_start: values[showLiveRoomInfoIndex].start,
                            liveRoom_nickname: values[showLiveRoomInfoIndex].nickname,
                            liveRoom_title: values[showLiveRoomInfoIndex].title,
                            liveRoom_header: values[showLiveRoomInfoIndex].head,
                            liveRoom_status: status,
                            liveRoom_isliving: living,
                            liveRoom_descp: values[showLiveRoomInfoIndex].descp,
                        }
                    });
                } else {
                    this.cleanLivingRoomData();
                }
            } else {
                this.cleanLivingRoomData();
            }
        });
    }
    cleanLivingRoomData() {
        this.setState({
            livingRoomData: {
                liveRoom_end: undefined,
                liveRoom_start: undefined,
                liveRoom_nickname: undefined,
                liveRoom_title: undefined,
                liveRoom_header: undefined,
                liveRoom_status: undefined,
                liveRoom_isliving: undefined,
                liveRoom_descp: undefined,
            }
        });
    }
    bubbleSort(arr) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1 - i; j++) {
                if (arr[j].sort > arr[j + 1].sort) {        //相邻元素两两对比
                    var temp = arr[j + 1];        //元素交换
                    arr[j + 1] = arr[j];
                    arr[j] = temp;
                }
            }
        }
        return arr;
    }
    titleUI() {
        let check = UserInfoUtil.getUserInfoReducer().checkMessage > 0;

        let permissions = UserInfoUtil.getUserPermissions();
        let isNewTongZ = UserInfoUtil.hasNewTongZhi();
        let isNewChatMessage = UserInfoUtil.hasNewChatMessages();

        let imageUri = UserInfoUtil.getUserHeader();
        if (permissions < 1) {
            imageUri = 'default_header'
        }
        return (
            <View style={{ backgroundColor: '#fff' }}>
                {Platform.OS === 'ios' ?
                    <View style={{ height: baseStyle.isIPhoneX ? 44 : 20, width: baseStyle.width }} /> :
                    <View style={{ height: StatusBar.currentHeight, width: baseStyle.width }} />}
                <View style={{
                    height: 44,
                    width: baseStyle.width,
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <View style={{ position: 'absolute', height: 44, left: 0, width: baseStyle.width, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={{ fontSize: 17, color: '#000000' }}>源达·慧选股</Text>
                    </View>
                    <TouchableOpacity
                        style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={1}
                        onPress={() => {
                            Navigation.navigateForParams(this.props.navigation, 'UserCenter', { title: '设置' });
                        }}>
                        <Image style={{ width: 30, height: 30 }} resizeMode={'contain'} source={{ uri: imageUri }} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        {
                            !check && permissions > 1 && <TouchableOpacity
                                style={{ width: 38, height: 44, justifyContent: 'center', alignItems: 'center' }}
                                activeOpacity={1}
                                onPress={() => {
                                    Navigation.pushForParams(this.props.navigation, 'Customer', { title: '客服' });
                                }}>
                                <ImageBackground style={{ width: 18, height: 18 }} resizeMode={'contain'}
                                    source={require('../../images/Home/nav_customer_service_icon.png')} >
                                    {isNewChatMessage ? this._redPointView() : null}
                                </ImageBackground>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity
                            style={{ width: 38, height: 44, justifyContent: 'center', alignItems: 'center' }}
                            activeOpacity={1}
                            onPress={() => {
                                Navigation.pushForParams(this.props.navigation, 'UserMessage', { title: '消息' });
                            }}>
                            <ImageBackground style={{ width: 18, height: 18 }}
                                resizeMode={'contain'}
                                source={require('../../images/Home/nav_msg_icon.png')} >
                                {isNewTongZ ? this._redPointView() : null}
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
    _redPointView() {
        return (
            <View style={{
                backgroundColor: baseStyle.BLUE_LIGHT,
                position: 'absolute',
                top: -5,
                right: -5,
                borderColor: '#fff',
                width: commonUtil.rare(20),
                height: commonUtil.rare(20),
                borderRadius: commonUtil.rare(10),
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }} />
        );
    }
    _onRefresh = () => {
        this.setState({ refreshing: true });
        this._loadBannerData();
        this._loadLivingRoomData();
        setTimeout(() => {
            this.setState({ refreshing: false });
        }, 3000);
    }
    _renderBannerUI() {
        return (
            this.state.bannerData.length ?
                <View style={{ flex: 1, paddingTop: 10, paddingBottom: 5, backgroundColor: baseStyle.LINE_BG_F1 }}>
                    {this._bannerView()}
                </View>
                : this._lineUI()
        );
    }
    _bannerView() {
        let views = this.state.bannerData.map(
            (data, index) => {
                let imageData = data.image ? { uri: data.image } : require('../../images/icons/placeholder_bg_image.png');
                return (
                    <TouchableOpacity activeOpacity={1} key={index}
                        style={{ paddingLeft: 10, paddingRight: 10 }}
                        onPress={() => {
                            if (!data.link) return;
                            sensorsDataClickObject.adClick.ad_position = '首页轮播图';
                            sensorsDataClickObject.adClick.ad_title= data.name;
                            sensorsDataClickObject.adClick.ad_type = '轮播';
                            sensorsDataClickObject.adClick.page_source = '首页';
                            sensorsDataClickObject.adClick.position_number = index;
                            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adClick);
                            if (data.link.indexOf('tk/share_app') != -1) {
                                Navigation.pushForParams(this.props.navigation, 'DuoTouQiDongPage');
                            } else {
                                Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage', { url: data.link, name: data.name, showButton: data.ktqx });
                            }
                        }}>
                        {/*这里由于Android 10有闪动问题，Android暂时用Image*/}
                        <Image
                            style={{ flex: 1, height: k_banner_height, width: baseStyle.width - 20, borderRadius: 10, position: "absolute", top: 0, left: 10, resizeMode: "cover" }}
                            source={imageData}
                        />
                        <View style={{ height: 49, marginTop: k_banner_height - 49 }}>
                            <Image style={{ height: 49, width: baseStyle.width - 20, borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }} source={require("../../images/Home/home_banner_bottom_bg.png")}></Image>
                        </View>
                    </TouchableOpacity>
                )
            }
        );
        if (views.length <= 0) return
        return (
            <View style={{ height: k_banner_height, width: baseStyle.width }}>
                <Swiper
                    autoplay={true}
                    paginationStyle={{ bottom: 15, justifyContent: 'center', right: 5 }}
                    dotStyle={{ backgroundColor: 'rgba(255,255,255,0.3)', width: 5, height: 5 }}
                    activeDotStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', width: 15, height: 5 }}>
                    {views}
                </Swiper>
            </View >
        )
    };
    _renderIndexItem(code, index) {
        let data = null;
        for (let i = 0; i < this.state._quoteData.length; i++) {
            const element = this.state._quoteData[i];
            if (code == element.Obj) {
                data = element;
            }
        }
        if (!data) return;
        let up = data.ZhangFu || 0;
        let priceColor = up > 0 ? baseStyle.UP_COLOR : (up < 0 ? baseStyle.DOWN_COLOR : '#000000');

        return (
            <TouchableOpacity
                key={index}
                style={{
                    width: (ShareSetting.getDeviceWidthDP() - 40) / 3,
                    marginLeft: DISTANCE(5),
                    marginRight: DISTANCE(5),
                    paddingBottom: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 10,
                    flex: 1,
                    alignItems: 'center'
                }}
                activeOpacity={1}
                onPress={() => { this._onItemPress(data, index); }}>
                <StockFormatText style={{ marginTop: 8, color: '#000000', fontSize: 16 }} useDefault={true}>{data.ZhongWenJianCheng}</StockFormatText>
                <StockFormatText style={[styles.priceStyle, { color: priceColor }]} useDefault={true}>{data.ZuiXinJia}</StockFormatText>
                <View style={styles.riseContainerStyle}>
                    <StockFormatText sign={true} style={styles.riseStyle}>{data.ZhangDie}</StockFormatText>
                    <StockFormatText unit='%' sign={true} style={styles.riseStyle}>{data.ZhangFu / 100}</StockFormatText>
                </View>
            </TouchableOpacity>
        );
    }
    _renderIndexBar() {
        return (
            <ScrollView
                style={{ paddingTop: 5, paddingBottom: 10 }}
                contentContainerStyle={{ justifyContent: 'space-evenly', paddingHorizontal: DISTANCE(15) }}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
            >
                {this.indexCodes.map((value, index) => this._renderIndexItem(value, index))}
            </ScrollView>
        );
    }
    toMarketDetailPage(permission) {
        Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage', {
            permissions: permission,
            type: 'FuFeiYingXiaoYe',
            callBack: () => { }
        });
    }
    toLivingRoomPage(pageName) {
        let params = {
            title: this.state.livingRoomData.liveRoom_title,
            status: this.state.livingRoomData.liveRoom_status,
            laoshi: this.state.livingRoomData.liveRoom_nickname,
            start: this.state.livingRoomData.liveRoom_start,
            end: this.state.livingRoomData.liveRoom_end,
            header: this.state.livingRoomData.liveRoom_header,
            isliving: this.state.livingRoomData.liveRoom_isliving,
            descp: this.state.livingRoomData.liveRoom_descp,
            publishTime: this.state.livingRoomData.liveRoom_publishTime
        };
        Navigation.pushForParams(this.props.navigation, pageName, params);
        let dateStr = moment(new Date()).format('YYYY-MM-DD')
        sensorsDataClickObject.shareClick.publish_time = dateStr
        sensorsDataClickObject.shareClick.content_source = '视频解盘'
        sensorsDataClickObject.shareClick.content_name = this.state.livingRoomData.liveRoom_title

        sensorsDataClickObject.shareMethod.content_name = this.state.livingRoomData.liveRoom_title
        sensorsDataClickObject.shareMethod.publish_time = dateStr

        sensorsDataClickObject.videoPlay.entrance = '首页'
        sensorsDataClickObject.videoPlay.class_type = '视频解盘'        

      sensorsDataClickObject.adModule.entrance = '首页';
      sensorsDataClickObject.adModule.module_name = '视频解盘';
      sensorsDataClickObject.adModule.module_type = '观点';
      SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)

    }



    sensorsAppear(module_source,page_source,label,is_pay) {
        sensorsDataClickObject.adLabel.module_source = module_source;
        sensorsDataClickObject.adLabel.label_level = 1;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.page_source = page_source;
        sensorsDataClickObject.adLabel.is_pay = is_pay;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)
    }




    // 快捷功能入口点击事件
    _funcEntryOnItemPress(item) {
        let pageName = item.targetPageName;
        let permission = UserInfoUtil.getUserPermissions();
        if (item.title == '收益统计') {
            sensorsDataClickObject.searchClick.entrance = '收益统计'
            sensorsDataClickObject.sendSearchRequest.entrance = '收益统计'
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick)
            sensorsDataClickObject.adModule.entrance = '首页'
            sensorsDataClickObject.adModule.module_type = '观点'
            sensorsDataClickObject.adModule.module_name = '个股收益统计'
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
        }
        if (item.title == '涨停炸板') {
          this.sensorsAppear('打榜','打榜', item.title,'免费')
          sensorsDataClickObject.adModule.entrance = '首页';
          sensorsDataClickObject.adModule.module_name = '涨停炸板';
          sensorsDataClickObject.adModule.module_type = '打榜';
          SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
        }
        // 涨停炸板、机构调研、特色指标选股、研报策略、价值决策、主力决策
        if (item.title === '机构调研') {
            this.sensorsAppear('打榜','打榜', item.title,'免费')
        }
        if (item.title === '主力决策' || item.title === '风口决策') {
          sensorsDataClickObject.adModule.entrance = item.title;
          this.sensorsAppear('','首页', item.title,'')
        }
        if (item.title === '研报策略'){
            this.sensorsAppear('选股','选股', item.title,'免费')
            sensorsDataClickObject.adModule.entrance = '首页';
            sensorsDataClickObject.adModule.module_name = '研报策略';
            sensorsDataClickObject.adModule.module_type = '选股';
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
        }



        if (permission == 0) { // 游客
            if (item.title == '涨停炸板' || item.title == '机构调研' || item.title == '风口决策' || item.title == '主力决策') {
                sensorsDataClickObject.loginButtonClick.entrance = item.title
                Navigation.pushForParams(this.props.navigation, "LoginPage", {
                    callBack: () => {
                        permission = UserInfoUtil.getUserPermissions();
                        if (item.title == '风口决策') {
                            if (permission > 3) {
                                Navigation.pushForParams(this.props.navigation, pageName);
                            } else if (permission == 1 || permission == 3) {
                                this.toMarketDetailPage(4);
                            }
                        } else if (item.title == '主力决策') {
                            if (permission > 4) {
                                Navigation.pushForParams(this.props.navigation, pageName);
                            } else if (permission == 1 || permission == 3 || permission == 4) {
                                this.toMarketDetailPage(5);
                            }
                        } else if (item.title == '涨停炸板' && permission > 0) {
                            let obj = {};
                            obj.mainIndex = 3;
                            obj.childIndex = 0;
                            DeviceEventEmitter.emit("tabChangeListener", obj);
                            BuriedpointUtils.setItemByPosition(["dabang", "zhangtingzhaban"]);
                        } else if (item.title == '机构调研' && permission > 0) {
                            let obj = {};
                            obj.mainIndex = 3;
                            obj.childIndex = 1;
                            DeviceEventEmitter.emit("tabChangeListener", obj);
                            BuriedpointUtils.setItemByPosition(["dabang", "jigoudiaoyan"]);
                        }
                    }
                });
            } else if (item.title == '视频解盘') {//视频直播间
              this.toLivingRoomPage(pageName);
            } else if (item.title == '市场资讯') {


                sensorsDataClickObject.adModule.entrance = '首页';
                sensorsDataClickObject.adModule.module_name = '资讯';
                sensorsDataClickObject.adModule.module_type = '观点';
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule, '', false)

              DeviceEventEmitter.emit("tabChangeListener", { mainIndex: 1, childIndex: 2 });
                BuriedpointUtils.setItemByPosition(["guandian", "zixun"]);
            } else if (item.title == '研报策略') {
                let obj = {};
                obj.mainIndex = 4;
                obj.childIndex = 1;
                DeviceEventEmitter.emit("tabChangeListener", obj);
            } else {
                let params = {}
                if (item.title == '收益统计') {
                    params = {entrance:'收益统计'}
                }
                Navigation.pushForParams(this.props.navigation, pageName,params);
            }
        } else {
            if (item.title == '风口决策' && permission < 4) {
                this.toMarketDetailPage(4);
            } else if (item.title == '主力决策' && permission < 5) {
                this.toMarketDetailPage(5);
            } else if (item.title == '涨停炸板') {
                let obj = {};
                obj.mainIndex = 3;
                obj.childIndex = 0;
                DeviceEventEmitter.emit("tabChangeListener", obj);
                BuriedpointUtils.setItemByPosition(["dabang", "zhangtingzhaban"]);
            } else if (item.title == '机构调研') {
                let obj = {};
                obj.mainIndex = 3;
                obj.childIndex = 1;
                DeviceEventEmitter.emit("tabChangeListener", obj);

                sensorsDataClickObject.adModule.entrance = '首页';
                sensorsDataClickObject.adModule.module_name = '机构调研';
                sensorsDataClickObject.adModule.module_type = '打榜';
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)

                BuriedpointUtils.setItemByPosition(["dabang", "jigoudiaoyan"]);
            } else if (item.title == '研报策略') {
                let obj = {};
                obj.mainIndex = 4;
                obj.childIndex = 1;
                DeviceEventEmitter.emit("tabChangeListener", obj);
            } else if (item.title == '视频解盘') {//视频直播间
                this.toLivingRoomPage(pageName);
            } else if (item.title == '市场资讯') {
                DeviceEventEmitter.emit("tabChangeListener", { mainIndex: 1, childIndex: 2 });
                BuriedpointUtils.setItemByPosition(["guandian", "zixun"]);
            } else {
                let params = {}
                if (item.title == '收益统计') {
                    params = {entrance:'收益统计'}
                }
                Navigation.pushForParams(this.props.navigation, pageName,params);
            }
        }
    }
    _loginStateChange() {
        this._loadBannerData();
        this._loadLivingRoomData();
        this._loadQuoteData();
    }
    _renderFuncEntryPanel() {
        return (
            <HomePageFuncEntryPanel itemOnClick={item => this._funcEntryOnItemPress(item)} />
        )
    }
    _renderMarketStatusPanel() {
        return (
            <HomePageMarketStatusPanel />
        )
    }
    _renderDuoTouQiDong() {
        return (
            <HomePageDuoTouQiDongPanel navigation={this.props.navigation} />
        )
    }
    _renderOpinionLivingPanel() {
        return (
            <HomePageOpinionLivingPanel data={this.state.viewPointData} navigation={this.props.navigation} />
        )
    }
    _onItemPress(data, index) {
        let stocks = [];
        for(let i = 0; i < this.state._quoteData.length; i ++){
            stocks.push( Object.assign({},this.state._quoteData[i]));
        }
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: stocks,
            index: index,
            isPush: true,
        })
    }
    _renderGrowthClassroomPanel() {
        return (
            <HomePageGrowthClassroomPanel navigation={this.props.navigation} refreshing={this.state.refreshing} />
        )
    }
    _lineUI() {
        return (
            <View style={{ height: 8, width: baseStyle.width, backgroundColor: baseStyle.LINE_BG_F1 }}></View>
        );
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: baseStyle.LINE_BG_F1 }}>
                {this.titleUI()}
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                            colors={['#787D86', '#787D86', '#787D86', '#787D86']}
                            progressBackgroundColor="#ffffff"
                        />
                    }
                >
                    {this._renderFuncEntryPanel()}
                    {this._renderBannerUI()}
                    {this._renderIndexBar()}
                    {this._renderMarketStatusPanel()}
                     {/*{this._renderDuoTouQiDong()}*/}
                    {this._lineUI()}
                    {this._renderOpinionLivingPanel()}
                    {this._lineUI()}
                    {this._renderGrowthClassroomPanel()}
                    <RiskTipsFooterView type={0} />
                </ScrollView>
            </View>
        )
    }
}

/// 首页快捷功能入口组件
const PANEL_COLUMN = 4;
const PANEL_ITEM_WIDTH = (baseStyle.width - 3) / PANEL_COLUMN;
// 未登录、登录、三星用户的首页功能入口面板的数据
const FUNC_ENTRY_DATA_DEFAULT = [
    { title: '视频解盘', iconSrc: require(`${IMAGE_DIR}home_live_room_icon.png`), targetPageName: 'LiveRoom' },//视频直播间
    { title: '收益统计', iconSrc: require(`${IMAGE_DIR}home_income_statistics_icon.png`), targetPageName: 'ProfitStaSearch' },
    { title: '研报策略', iconSrc: require(`${IMAGE_DIR}home_research_strategy_icon.png`), targetPageName: '' },
    { title: '涨停炸板', iconSrc: require(`${IMAGE_DIR}home_daily_limit_icon.png`), targetPageName: '' },
    { title: '机构调研', iconSrc: require(`${IMAGE_DIR}home_institutional_research_icon.png`), targetPageName: '' },
    { title: '市场资讯', iconSrc: require(`${IMAGE_DIR}home_news_icon.png`), targetPageName: '' },
    { title: '风口决策', iconSrc: require(`${IMAGE_DIR}home_value_decision_icon.png`), targetPageName: 'TuyereDecisionPage' },
    { title: '主力决策', iconSrc: require(`${IMAGE_DIR}home_main_decision_icon.png`), targetPageName: 'MainDecisionPage' },
];
// 四星用户的首页功能入口面板的数据
const FUNC_ENTRY_DATA_FOUR = [
    { title: '风口决策', iconSrc: require(`${IMAGE_DIR}home_value_decision_icon.png`), targetPageName: 'TuyereDecisionPage' },
    { title: '视频解盘', iconSrc: require(`${IMAGE_DIR}home_live_room_icon.png`), targetPageName: 'LiveRoom' },//视频直播间
    { title: '收益统计', iconSrc: require(`${IMAGE_DIR}home_income_statistics_icon.png`), targetPageName: 'ProfitStaSearch' },
    { title: '研报策略', iconSrc: require(`${IMAGE_DIR}home_research_strategy_icon.png`), targetPageName: '' },
    { title: '涨停炸板', iconSrc: require(`${IMAGE_DIR}home_daily_limit_icon.png`), targetPageName: '' },
    { title: '机构调研', iconSrc: require(`${IMAGE_DIR}home_institutional_research_icon.png`), targetPageName: '' },
    { title: '市场资讯', iconSrc: require(`${IMAGE_DIR}home_news_icon.png`), targetPageName: '' },
    { title: '主力决策', iconSrc: require(`${IMAGE_DIR}home_main_decision_icon.png`), targetPageName: 'MainDecisionPage' },
];
// 五星用户的首页功能入口面板的数据
const FUNC_ENTRY_DATA_FIVE = [
    { title: '主力决策', iconSrc: require(`${IMAGE_DIR}home_main_decision_icon.png`), targetPageName: 'MainDecisionPage' },
    { title: '风口决策', iconSrc: require(`${IMAGE_DIR}home_value_decision_icon.png`), targetPageName: 'TuyereDecisionPage' },
    { title: '视频解盘', iconSrc: require(`${IMAGE_DIR}home_live_room_icon.png`), targetPageName: 'LiveRoom' },//视频直播间
    { title: '收益统计', iconSrc: require(`${IMAGE_DIR}home_income_statistics_icon.png`), targetPageName: 'ProfitStaSearch' },
    { title: '研报策略', iconSrc: require(`${IMAGE_DIR}home_research_strategy_icon.png`), targetPageName: '' },
    { title: '涨停炸板', iconSrc: require(`${IMAGE_DIR}home_daily_limit_icon.png`), targetPageName: '' },
    { title: '机构调研', iconSrc: require(`${IMAGE_DIR}home_institutional_research_icon.png`), targetPageName: '' },
    { title: '市场资讯', iconSrc: require(`${IMAGE_DIR}home_news_icon.png`), targetPageName: '' },
];

export class HomePageFuncEntryPanel extends Component {
    constructor(props) {
        super(props);
        this.permission = UserInfoUtil.getUserPermissions();
        if (this.permission == 4) {
            this.data = FUNC_ENTRY_DATA_FOUR;
        } else if (this.permission == 5) {
            this.data = FUNC_ENTRY_DATA_FIVE;
        } else {
            this.data = FUNC_ENTRY_DATA_DEFAULT;
        }
    }

    _onItemPress(item) {
        this.props.itemOnClick && this.props.itemOnClick(item);
    }

    shouldComponentUpdate() {
        let permission = UserInfoUtil.getUserPermissions();
        if (permission !== this.permission) {
            this.permission = permission;
            if (this.permission == 4) {
                this.data = FUNC_ENTRY_DATA_FOUR;
            } else if (this.permission == 5) {
                this.data = FUNC_ENTRY_DATA_FIVE;
            } else {
                this.data = FUNC_ENTRY_DATA_DEFAULT;
            }
            return true;
        }
        return false;
    }
    _renderAllItem() {
        var views = [];
        for (let i = 0; i < this.data.length; i++) {
            let element = this.data[i];
            let showSepratorLine = (i % PANEL_COLUMN) < PANEL_COLUMN - 1;
            views.push(
                <TouchableOpacity style={{ flexDirection: 'row' }} key={i} activeOpacity={1} onPress={() => {
                    this._onItemPress(element);
                }}>
                    <View style={[styles.panelItemStyle]}>
                        {Platform.OS === 'ios' ?
                            <Image
                                style={[styles.panelItemImageStyle]}
                                source={element.iconSrc}
                            />
                            :
                            <FastImage
                                style={[styles.panelItemImageStyle]}
                                source={element.iconSrc}
                            />
                        }
                        <Text style={styles.panelItemTextStyle}>{element.title}</Text>
                    </View>
                    {showSepratorLine ? <View style={{ width: 1, height: 50, top: 16, backgroundColor: '#0000001a' }}></View> : null}
                </TouchableOpacity>
            )
        }
        return views;
    }

    render() {
        return (
            <View style={styles.panelContainerStyle}>
                {this._renderAllItem()}
            </View>
        );
    }
}
/// 首页多头启动组件
/*
 * 股票信息显示逻辑：
 *              股票名称 股票代码   现价   涨幅
 * 有权限&无股票     x      x       x      x   (显示暂无股票)
 * 有权限&有股票  显示名称 显示代码 显示价格 显示涨幅
 * 无权限&有股票  ******  ******  ****** 显示涨幅
 * 无权限&无股票  ******  ******  ******    0
 */
export class HomePageDuoTouQiDongPanel extends Component {
    constructor(props) {
        super(props);
        //TODO:替换多头启动活动信息节点
        this.duoTouHuoDongRef = YdCloud().ref('cem/active/80/HD20200317141409274585');
        this.duoTouQiDongRef = YdCloud().ref(MainPathYG + 'DingJu/TeSeZhiBiaoXuanGu');
        this.permission = UserInfoUtil.getUserPermissions();
        this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou; // 是否多头启动用户
        this.state = {
            showDuoTouQiDong: false, // 是否显示多头启动入口
            huoDongStatus: 1, //  1: 未开始   2: 进行中   3: 已结束
            linkUrl: '', // 活动跳转链接
            huoDongName: '', // 活动名称
            intro: '暂无简介', // 多头启动策略简介内容
            marketCode: '--', // 股票代码
            secName: '--', // 股票名称
            presentPrice: 0, // 现价
            upDown: 0 // 涨幅
        }
    }
    componentWillReceiveProps() {
        if (this.permission != UserInfoUtil.getUserPermissions()) {
            this.permission = UserInfoUtil.getUserPermissions();
        }
        if (this.isDuoTouUser != (UserInfoUtil.getUserInfoReducer().activityPer === DuoTou)) {
            this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou;
        }
    }
    componentDidMount() {
        this._loadDuoTouHuoDongData();
        this._loadDuoTouQiDongStockInfoData();
    }
    componentWillUnmount() {
        this.duoTouQiDongRef.off('value');
        this.duoTouHuoDongRef.off('value');
        if (this.state.marketCode !== '--') {
            QuotationListener.offListeners([this.state.marketCode]);
        }
    }
    // 获取多头启动活动数据
    _loadDuoTouHuoDongData() {
        this.duoTouHuoDongRef.get(snap => {
            this._parseDuoTouHuoDongData(snap);
        });
        this.duoTouHuoDongRef.on('value', () => {
            this.duoTouHuoDongRef.get(snap => {
                this._parseDuoTouHuoDongData(snap);
            });
        })
    }
    // 获取多头启动股票数据
    _loadDuoTouQiDongStockInfoData() {
        this.duoTouQiDongRef.get(snap => {
            this._parseData(snap);
        });
        this.duoTouQiDongRef.on('value', () => {
            this.duoTouQiDongRef.get(snap => {
                this._parseData(snap);
            });
        });
    }
    _parseDuoTouHuoDongData(snap) {
        if (snap.code == 0) {
            let value = snap.nodeContent;
            if (value) {
                let state = value.state;
                ScreenUtil.duoTouQiDongStatus = state;
                ScreenUtil.duoTouQiDongName = value.subject;
                ScreenUtil.duoTouQiDongId = value.subject_id;
                if (state == 2) {
                    this.setState({ showDuoTouQiDong: true, huoDongStatus: state, linkUrl: value.APPline, huoDongName: value.subject });
                } else if (state == 3) {
                    if (this.permission >= 3 || this.isDuoTouUser) {
                        this.setState({ showDuoTouQiDong: true, huoDongStatus: state, linkUrl: value.APPline, huoDongName: value.subject });
                    } else {
                        this.setState({ showDuoTouQiDong: false, huoDongStatus: state });
                    }
                } else {
                    this.setState({ showDuoTouQiDong: false, huoDongStatus: state });
                }
            } else {
                ScreenUtil.duoTouQiDongStatus = 1;
                ScreenUtil.duoTouQiDongName = '';
                ScreenUtil.duoTouQiDongId = 0;
                this.setState({ showDuoTouQiDong: false, huoDongStatus: 1 });
            }
        } else {
            ScreenUtil.duoTouQiDongStatus = 1;
            ScreenUtil.duoTouQiDongName = '';
            ScreenUtil.duoTouQiDongId = 0;
            this.setState({ showDuoTouQiDong: false, huoDongStatus: 1 });
        }
    }
    _loadQuoteData() {
        if (this.state.marketCode == '--') return;
        QuotationListener.getStockListInfo([this.state.marketCode], (stocks) => {
            this.setState({
                presentPrice: parseFloat(stocks[0].k).toFixed(2),
                upDown: parseFloat(stocks[0].y).toFixed(2)
            });
        });
        QuotationListener.addListeners([this.state.marketCode], (stock) => {
            this.setState({
                presentPrice: parseFloat(stock.k).toFixed(2),
                upDown: parseFloat(stock.y).toFixed(2)
            });
        });
    }
    cleanData() {
        this.setState({
            intro: '暂无简介',
            marketCode: '--',
            secName: '--',
            presentPrice: 0,
            upDown: 0
        });
    }
    _parseData(snap) {
        if (snap.code == 0) {
            const values = Object.values(snap.nodeContent);
            let obj;
            values.forEach(element => {
                if (element.indicatorName == '多头启动') {
                    obj = element;
                }
            });
            if (obj) {
                this.setState({
                    intro: obj.indicatorReason || '暂无简介',
                    marketCode: obj.maxNetAmount.marketCode,
                    secName: obj.maxNetAmount.secName
                }, () => {
                    this._loadQuoteData();
                });
            } else {
                this.cleanData();
            }
        } else {
            this.cleanData();
        }
    }
    _onPress() {
        //不管点击后跳转那个地方，都记录一次点击事件
        BuriedpointUtils.setItemClickByName(BuriedpointUtils.PageMatchID.duotouqidong);
        if (this.permission == 0) {
            sensorsDataClickObject.loginButtonClick.entrance = '多头启动策略'
            Navigation.pushForParams(this.props.navigation, "LoginPage", {
                callBack: () => {
                    this.permission = UserInfoUtil.getUserPermissions();
                    if (this.permission == 0) return;
                    if (this.permission >= 3 || this.isDuoTouUser) {
                        Navigation.navigateForParams(this.props.navigation, "DTTargetDetailPage", { keyWord: '多头启动', intro: this.state.intro, from: '多头启动' });
                    } else {
                        Navigation.pushForParams(this.props.navigation, 'DuoTouQiDongPage');
                    }
                }
            });
        } else if (this.permission >= 3 || this.isDuoTouUser) {
            Navigation.navigateForParams(this.props.navigation, "DTTargetDetailPage", { keyWord: '多头启动', intro: this.state.intro, from: '多头启动' });
        } else {
            Navigation.pushForParams(this.props.navigation, 'DuoTouQiDongPage');
        }
    }
    _renderStockInfoView() {
        let priceColor = this.state.upDown > 0 ? baseStyle.UP_COLOR : (this.state.upDown < 0 ? baseStyle.DOWN_COLOR : baseStyle.SMALL_TEXT_COLOR);
        let hasPower = this.permission >= 3 || this.isDuoTouUser;
        let hasStock = this.state.marketCode !== '--';
        let updown = isNaN(this.state.upDown / 100) ? undefined : this.state.upDown / 100;
        return (
            <View style={{ flex: 1, flexDirection: "row", backgroundColor: 'rgba(255,255,255,0.8)', borderBottomLeftRadius: ScreenUtil.scaleSizeW(12), borderBottomRightRadius: ScreenUtil.scaleSizeW(12) }}>
                <View style={{ width: ScreenUtil.scaleSizeW(180), justifyContent: "center", marginLeft: ScreenUtil.scaleSizeW(50) }}>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#333333" }}>{hasPower && hasStock ? this.state.secName : '******'}</Text>
                    <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#666666", marginTop: ScreenUtil.scaleSizeW(5) }}>{(hasPower && hasStock) ? this.state.marketCode : '******'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(30) }}>
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <StockFormatText precision={2} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: priceColor }}>{(hasPower && hasStock) ? this.state.presentPrice : '******'}</StockFormatText>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>现价</Text>
                    </View>
                </View>
                <View style={{ flex: 1, justifyContent: "center", marginRight: ScreenUtil.scaleSizeW(50) }}>
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <StockFormatText precision={2} unit={"%"} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: priceColor }}>{updown}</StockFormatText>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#6d6d6d", marginTop: ScreenUtil.scaleSizeW(2) }}>涨幅</Text>
                    </View>
                </View>
            </View>
        )
    }
    render() {
        let hasPower = this.permission >= 3 || this.isDuoTouUser;
        let showInviteView = true;
        if (this.state.huoDongStatus == 2) {
            showInviteView = this.permission >= 3 ? false : true;
        } else {
            showInviteView = (this.permission >= 3 || this.isDuoTouUser) ? false : true;
        }
        return (
            <View style={{ height: showInviteView ? ScreenUtil.scaleSizeW(380) : ScreenUtil.scaleSizeW(305), backgroundColor: baseStyle.LINE_BG_F1 }}>
                <TouchableOpacity style={{position: 'absolute', top: showInviteView ? ScreenUtil.scaleSizeW(105) : ScreenUtil.scaleSizeW(30) }} activeOpacity={0.9} onPress={() => { this._onPress() }}>
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={["#FF6699", "#FF3333"]}
                        style={{
                            width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(40), height: ScreenUtil.scaleSizeW(245), borderRadius: ScreenUtil.scaleSizeW(12),
                            marginHorizontal: ScreenUtil.scaleSizeW(20)
                        }}>
                        <Image style={{ position: 'absolute', width: ScreenUtil.scaleSizeW(310), height: ScreenUtil.scaleSizeW(116), right: 0, top: 0, resizeMode: "stretch" }} source={require('../../images/hits/dtqd.png')} />
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(20) : ScreenUtil.scaleSizeW(16) }}>
                            <View style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(28), backgroundColor: "white", borderTopRightRadius: ScreenUtil.scaleSizeW(6), borderBottomRightRadius: ScreenUtil.scaleSizeW(6) }} />
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "white", marginLeft: ScreenUtil.scaleSizeW(10) }}>{'多头启动策略'}</Text>
                            <View style={{ flex: 1 }} />
                        </View>
                        <View style={{ height: ScreenUtil.scaleSizeW(40), marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(10) : ScreenUtil.scaleSizeW(6), marginBottom: ScreenUtil.scaleSizeW(12), marginHorizontal: ScreenUtil.scaleSizeW(26) }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(255,255,255,0.8)", }}
                                numberOfLines={1} ellipsizeMode={'tail'}>{this.state.intro}</Text>
                        </View>
                        {
                            hasPower && this.state.marketCode == '--' ?
                                <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)', borderBottomLeftRadius: ScreenUtil.scaleSizeW(12), borderBottomRightRadius: ScreenUtil.scaleSizeW(12) }}>
                                    <Text style={{ fontSize: 12, color: '#00000033', textAlign: 'center' }}>暂无股票</Text>
                                </View> :
                                this._renderStockInfoView()
                        }
                    </LinearGradient>
                </TouchableOpacity>
                {
                    showInviteView ?
                        <TouchableOpacity style={{ position: 'absolute', right: 35.5, top: ScreenUtil.scaleSizeW(30) }} activeOpacity={1} activeOpacity={0.9} onPress={() => { this._onPress() }}>
                            <Image source={require('../../images/Home/home_invate_friend_bg.png')}></Image>
                        </TouchableOpacity>
                        : null
                }
            </View>
        );
    }
}
/// 首页市场情绪组件
export class HomePageMarketStatusPanel extends Component {
    constructor(props) {
        super(props);
        this.lastTradingDayRef = YdCloud().ref(MainPathYG + 'ztzb/data-date');
        this.zhangTingRootRef = YdCloud().ref(MainPathYG + 'ztzb/line');
        this.daBanRootRef = YdCloud().ref(MainPathYG + 'ztzb/tracing');
        this.fooRef;
        this.state = {
            lastTradingDay: '',
            natureCount: 0,
            zhaBanCount: 0,
            yiZiCount: 0,
            successRate: 0,
            profitRate: 0
        }
    }
    componentDidMount() {
        this._loadLastTradingDayData();
    }
    // 获取涨停家数数据
    _fetchZhangTingData() {
        let date = this.state.lastTradingDay;
        let ziRanPath = MainPathYG + 'ztzb/line/' + date + '/all/up';
        YdCloud().ref(ziRanPath).orderByKey().limitToLast(1).get(x => {
            if (x.code == 0) {
                let values = Object.values(x.nodeContent);
                this.setState({ natureCount: values[0] ? values[0] : 0 })
            }
        });
        let yiZiPath = MainPathYG + 'ztzb/line/' + date + '/all/nonNaturalUp';
        YdCloud().ref(yiZiPath).orderByKey().limitToLast(1).get(x => {
            if (x.code == 0) {
                let values = Object.values(x.nodeContent);
                this.setState({ yiZiCount: values[0] ? values[0] : 0 })
            }
        });
        let zhaBanPath = MainPathYG + 'ztzb/line/' + date + '/all/burst';
        YdCloud().ref(zhaBanPath).orderByKey().limitToLast(1).get(x => {
            if (x.code == 0) {
                let values = Object.values(x.nodeContent);
                this.setState({ zhaBanCount: values[0] ? values[0] : 0 })
            }
        });
    }
    // 获取昨日打板数据
    _fetchDaBanData() {
        let date = this.state.lastTradingDay;
        let successRatePath = MainPathYG + 'ztzb/tracing/' + date + '/all/up-counter';
        YdCloud().ref(successRatePath).get((x) => {
            if (x.code == 0) {
                let value = x.nodeContent;
                value = value ? parseFloat(value * 100).toFixed(0) : 0;
                this.setState({ successRate: value })
            }
        });
        let profitRatePath = MainPathYG + 'ztzb/tracing/' + date + '/all/up-avg';
        YdCloud().ref(profitRatePath).get((x) => {
            if (x.code == 0) {
                let value = x.nodeContent;
                this.setState({ profitRate: value ? parseFloat(value).toFixed(2) : 0 })
            }
        });
    }
    // 获取最新交易日
    _loadLastTradingDayData() {
        this.lastTradingDayRef.orderByKey().limitToLast(1).get(snap => {
            if (snap.code == 0) {
                let date = snap.nodeContent;
                this.setState({ lastTradingDay: date }, () => {
                    this._fetchZhangTingData();
                    this._fetchDaBanData();
                    this._onTradingDayData();
                    this._onData();
                });
            }
        });
    }
    _onTradingDayData() {
        this.lastTradingDayRef.on('value', snap => {
            if (snap.code == 0) {
                let date = snap.nodeContent;
                this.setState({ lastTradingDay: date }, () => {
                    this._fetchZhangTingData();
                    this._fetchDaBanData();
                    this._onData();
                });
            }
        });
    }
    _onData() {
        let date = this.state.lastTradingDay;
        let zhangTingPath = MainPathYG + 'ztzb/line/' + date + '/all';
        YdCloud().ref(zhangTingPath).on('value', (x) => {
            if (x.code == 0) {
                let keys = Object.keys(x.nodeContent);
                let values = Object.values(x.nodeContent);
                if (keys[0] == 'up') {
                    this.setState({ natureCount: values[0] ? Object.values(values[0])[0] : 0 })
                } else if (keys[0] == 'nonNaturalUp') {
                    this.setState({ yiZiCount: values[0] ? Object.values(values[0])[0] : 0 })
                } else if (keys[0] == 'burst') {
                    this.setState({ zhaBanCount: values[0] ? Object.values(values[0])[0] : 0 })
                }
            }
        });
        let daBanPath = MainPathYG + 'ztzb/tracing/' + date + '/all';
        YdCloud().ref(daBanPath).on('value', (x) => {
            if (x.code == 0) {
                let keys = Object.keys(x.nodeContent);
                let values = Object.values(x.nodeContent);
                if (keys[0] == 'up-counter') {
                    let value = values[0];
                    value = value ? parseFloat(value * 100).toFixed(0) : 0;
                    this.setState({ successRate: value })
                } else if (keys[0] == 'up-avg') {
                    this.setState({ profitRate: values[0] ? parseFloat(values[0]).toFixed(2) : 0 })
                }
            }
        });
    }
    render() {
        let year = this.state.lastTradingDay && this.state.lastTradingDay.length >= 4 && this.state.lastTradingDay.substring(0, 4);
        let month = this.state.lastTradingDay && this.state.lastTradingDay.length >= 6 && this.state.lastTradingDay.substring(4, 6);
        let day = this.state.lastTradingDay && this.state.lastTradingDay.length >= 8 && this.state.lastTradingDay.substring(6, 8);
        let date = (year || '') + '-' + (month || '') + '-' + (day || '');
        return (
            <View style={styles.marketContainerStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
                        <Image style={{ width: 15, height: 15, marginLeft: 15, marginRight: 5 }} source={require(`${IMAGE_DIR}home_market_status_icon.png`)}></Image>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#000000' }}>市场情绪</Text>
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 15 }}>
                            <Image style={{ width: 11, height: 11, marginRight: 10 }} source={require(`${IMAGE_DIR}home_market_status_calendar_icon.png`)}></Image>
                            <Text style={{ fontSize: 12, color: '#00000066', marginRight: 15 }}>{date}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 20 }}>
                    <View style={{ flex: 1.3, borderRightColor: '#0000001A', borderRightWidth: 1 }}>
                        <Text style={styles.marketTextStyle3}>今日涨停家数</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            <View style={styles.marketTextContainerStyle}>
                                <Text style={styles.marketTextStyle1}>{this.state.natureCount}</Text>
                                <Text style={styles.marketTextStyle2}>自然</Text>
                            </View>
                            <View style={styles.marketTextContainerStyle}>
                                <Text style={styles.marketTextStyle1}>{this.state.yiZiCount}</Text>
                                <Text style={styles.marketTextStyle2}>一字</Text>
                            </View>
                            <View style={styles.marketTextContainerStyle}>
                                <Text style={styles.marketTextStyle1}>{this.state.zhaBanCount}</Text>
                                <Text style={styles.marketTextStyle2}>炸板</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <Text style={styles.marketTextStyle3}>昨日打板</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            <View style={styles.marketTextContainerStyle}>
                                <Text style={styles.marketTextStyle1}>{this.state.successRate}%</Text>
                                <Text style={styles.marketTextStyle2}>成功率</Text>
                            </View>
                            <View style={styles.marketTextContainerStyle}>
                                <Text style={[styles.marketTextStyle1, { color: this.state.profitRate >= 0 ? '#F92400' : '#339900' }]}>{this.state.profitRate}%</Text>
                                <Text style={styles.marketTextStyle2}>盈利率</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
/// 首页观点直播组件
export class HomePageOpinionLivingPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_day: ''
        };
    }
    _moreBtnOnClick() {

        sensorsDataClickObject.adModule.entrance = '首页'
        sensorsDataClickObject.adModule.module_name = '观点直播'
        sensorsDataClickObject.adModule.module_type = '观点';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)

        const permission = UserInfoUtil.getUserPermissions();
        const x = permission < 4 ? VIEW_POINT_FILTER_CONDITION_1 : VIEW_POINT_FILTER_CONDITION_2;
        Navigation.pushForParams(this.props.navigation, 'OpinionLivingPage', { filterCondition: x });
    }
    render() {
        const day = this.state.selected_day;
        const date = day.length >= 8 ? day.slice(0, 4) + '-' + day.slice(4, 6) + '-' + day.slice(6, 8) : '';
        const permission = UserInfoUtil.getUserPermissions();
        const x = permission < 4 ? VIEW_POINT_FILTER_CONDITION_1 : VIEW_POINT_FILTER_CONDITION_2;
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', height: 36, justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#0000001a', borderBottomWidth: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 15, height: 15, marginLeft: 15 }} source={require('../../images/Home/home_opinion_living_icon.png')} />
                        <Text style={{ fontSize: 15, color: '#000000', marginLeft: 6, fontWeight: '900' }}>观点直播</Text>
                        <Text style={{ fontSize: 12, color: '#999999', marginLeft: 6, marginBottom: -4 }}>{date}</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._moreBtnOnClick()}>
                        <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
                <ContentListView
                    navigation={this.props.navigation}
                    filterCondition={x}
                    limit={3}
                    showBtn={1}
                    calendarDataCallback={(selected_day) => {
                        this.setState({ selected_day: selected_day });
                    }} />
            </View>
        );
    }
}
/// 首页成长学堂组件
export class HomePageGrowthClassroomPanel extends Component {
    constructor(props) {
        super(props);
        this.permission = UserInfoUtil.getUserPermissions();
        this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou;
        this.littleWhiteClassRef = YdCloud().ref(MainPathYG + 'ZuiXinShuJu/XiaoBaiKeTang'); // 小白来了最新一节课节点对象
        this.bigCafeClassRef = YdCloud().ref(MainPathYG + 'ZuiXinShuJu/DaKaLaiLe'); // 大咖来了最新一节课节点对象
        this.state = {
            littleWhiteClassData: null, // 小白课堂数据
            bigCafeClassData: null, // 大咖来了数据
            indexStudyClassData: null, // 指标学习数据
            ceLveClassData: null, // 策略学堂数据
        }
    }
    componentDidMount() {
        this.loadData();
    }
    componentWillReceiveProps(nextProps) {
        if (this.isDuoTouUser != (UserInfoUtil.getUserInfoReducer().activityPer === DuoTou)) {
            this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou;
        }
        if (this.permission !== UserInfoUtil.getUserPermissions()) {
            this.permission = UserInfoUtil.getUserPermissions();
            this.loadData();
        } else if (nextProps.refreshing) {
            this.loadData();
        }
    }
    loadData() {
        this._loadData();
        this.fetchLatestData(MainPathYG + 'ZhiBiaoKeTangAll/');
        this.fetchLatestData(MainPathYG + 'ChengZhangKeTangAll/');
    }
    // 获取指标和策略最新数据
    async fetchLatestData(path) {
        const permission = this.permission;
        let permissions = [0, -2, 3];
        if (permission == 4) {
            permissions.push(4);
        } else if (permission == 5) {
            permissions.push(4);
            permissions.push(5);
        }
        await Promise.all(permissions.map(x => this._fetchLatestData(path + x))).then(x => {
            let values = [];
            // 过滤掉null
            x.forEach(element => {
                if (element) {
                    values.push(element);
                }
            });
            values.sort(function (a, b) {
                return b.createTime - a.createTime; // 倒序
            });
            if (path.indexOf('ZhiBiaoKeTangAll') != -1) {
                this.setState({ indexStudyClassData: values[0] });
            } else if (path.indexOf('ChengZhangKeTangAll') != -1) {
                this.setState({ ceLveClassData: values[0] });
            }
        });
    }
    // 获取最新一节课程数据
    _fetchLatestData(path) {
        return new Promise((resolve) => {
            YdCloud().ref(path).orderByKey().limitToLast(1).get(snap => {
                if (snap.code == 0) {
                    let values = Object.values(snap.nodeContent);
                    resolve(values[0]);
                } else {
                    resolve(null);
                }
            });
        })
    }
    _loadData() {
        this.littleWhiteClassRef.get(snap => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                this.setState({ littleWhiteClassData: values[0] })
            }
        })
        this.bigCafeClassRef.get(snap => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                this.setState({ bigCafeClassData: values[0] })
            }
        })
    }
    moreBtnOnClick() {
        Navigation.pushForParams(this.props.navigation, 'GrowthCoursePage');
    }
    // 课程点击跳转
    _itemOnClick(data, type) {
        let _type, key, optionParam = {};
        if (type == '小白课堂') {
            _type = 'LittleWhite';
            key = data.id;
            let path = MainPathYG + 'ZuiXinShuJu/XiaoBaiKeTang/' + key;
            optionParam = { kindId: data.set_id, path: path };
            sensorsDataClickObject.videoPlay.class_type = '股小白'
            sensorsDataClickObject.videoPlay.class_series = data.set
        } else if (type == '大咖来了') {
            _type = 'BigCafe';
            key = data.id;
            let path = MainPathYG + 'ZuiXinShuJu/DaKaLaiLe/' + key;
            optionParam = { path: path };
            sensorsDataClickObject.videoPlay.class_type = '股大咖'
        } else if (type == '指标学习') {
            _type = 'IndexStudy';
            key = data.createTime;
            let path = MainPathYG + 'ZhiBiaoKeTangAll/' + data.star + '/' + key;
            optionParam = { path: path, star: data.star, taoxiName: data.setsystem };
            sensorsDataClickObject.videoPlay.class_type = '指标学习'
            sensorsDataClickObject.videoPlay.class_series = data.setsystem
        } else {
            _type = 'Strategy';
            key = data.createTime;
            let path = MainPathYG + 'ChengZhangKeTangAll/' + data.star + '/' + key;
            optionParam = { path: path, star: data.star, taoxiName: data.setsystem };
            sensorsDataClickObject.videoPlay.class_type = '策略课堂'
            sensorsDataClickObject.videoPlay.class_series = data.setsystem
        }
        let timeStr = ''
        if (data.create_time) {
            timeStr = data.create_time.substring(0,10)                
        } else {
            timeStr = ShareSetting.getDate(parseInt(data.createTime),'yyyy-MM-dd')
        }
        sensorsDataClickObject.videoPlay.entrance = '首页'
        sensorsDataClickObject.videoPlay.class_name = data.title
        sensorsDataClickObject.videoPlay.publish_time = timeStr
        Navigation.pushForParams(this.props.navigation, 'CourseDetailPage', {
            key: key,
            type: _type,
            ...optionParam
        });
    }
    // 未付费用户点击课程
    itemOnClickForUnpaidUser(data, type) {
        if (this.isDuoTouUser) {
            if (this.permission < data.star) {
                if (this.prompt) {
                    this.prompt.show();
                } else {
                    this.setState({}, () => {
                        this.prompt && this.prompt.show();
                    });
                }
            } else {
                this._itemOnClick(data, type);
            }
        } else {
            if (this.permission < data.star || data.star == -2) {
                if (this.prompt) {
                    this.prompt.show();
                } else {
                    this.setState({}, () => {
                        this.prompt && this.prompt.show();
                    });
                }
            } else {
                this._itemOnClick(data, type);
            }
        }
    }
    itemOnClick(data, type) {
        if (data.id === undefined) return;
        if (type == '小白课堂' || type == '大咖来了') {
            this._itemOnClick(data, type);
        } else {
            if (this.permission == 0) { // 游客
                sensorsDataClickObject.loginButtonClick.entrance = '首页'+type
                Navigation.pushForParams(this.props.navigation, "LoginPage", {
                    callBack: () => {
                        if (this.permission == 0) return;
                        if (this.permission == 1) { // 未付费用户
                            this.itemOnClickForUnpaidUser(data, type);
                        } else { // 付费用户
                            this._itemOnClick(data, type);
                        }
                    }
                });
            } else if (this.permission == 1) { // 未付费用户
                this.itemOnClickForUnpaidUser(data, type);
            } else { // 付费用户
                this._itemOnClick(data, type);
            }
        }
    }

    _renderItem(item) {
        if (!item.data) return;
        let data = item.data;
        return (
            <TouchableHighlight underlayColor={'transparent'} onPress={() => this.itemOnClick(data, item.type)}>
                <View style={{ width: (baseStyle.width - 24) / 2, paddingBottom: 10 }}>
                    <ImageBackground style={{ height: (baseStyle.width - 28) / 2 / 16 * 9, justifyContent: 'flex-end', alignItems: 'flex-end', }} source={require('../../images/icons/placeholder_bg_image.png')}>

                        {Platform.OS === 'ios' ?
                            <Image
                                style={{ width: (baseStyle.width - 24) / 2, height: (baseStyle.width - 28) / 2 / 16 * 9, resizeMode: 'stretch', position: "absolute", left: 0, top: 0 }}
                                source={{ uri: data.cover && data.cover }}
                            />
                            :
                            <FastImage
                                style={{ width: (baseStyle.width - 24) / 2, height: (baseStyle.width - 28) / 2 / 16 * 9, position: "absolute", left: 0, top: 0 }}
                                source={{ uri: data.cover && data.cover }}
                                resizeMode={FastImage.resizeMode.stretch}
                            />
                        }

                        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', height: 18, width: 70, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 10 }}>{data.create_time && data.create_time.substr(0, 10)}</Text>
                        </View>

                    </ImageBackground>
                    <Text style={{ color: "#00000099", fontSize: 14, marginTop: 10, marginLeft: 10 }} numberOfLines={1}>{data.period}期: {data.title}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    _renderItem2(item) {
        if (!item.data) return;
        let data = item.data;
        let showLock = false;
        if (this.permission == 0 || this.permission == 1) {
            if (this.isDuoTouUser) {
                showLock = this.permission < data.star;
            } else {
                showLock = this.permission < data.star || data.star == -2;// star 值-2说明是多头启动权限的课程
            }
        }
        return (
            <TouchableHighlight style={{ height: 65, borderBottomColor: '#0000001A', borderBottomWidth: 1 }} underlayColor={'transparent'} onPress={() => this.itemOnClick(data, item.type)}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: 'white', borderBottomWidth: 1, paddingLeft: 15, paddingRight: 15 }}>
                    <View>
                        <Text style={{ fontSize: 15, color: '#000000' }}>{data.title}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            <Text style={{ fontSize: 12, color: '#999999' }}>{data.like}人已点赞</Text>
                            {showLock ? <Image style={{ width: 10, height: 12, marginLeft: 5 }} source={require('../../images/livelession/Growth/course_lock_icon.png')}></Image> : null}
                        </View>
                    </View>
                    <ImageBackground style={{ width: 80, height: 45, borderRadius: 10, overflow: 'hidden' }} source={require('../../images/icons/placeholder_bg_image.png')}>
                        {Platform.OS === 'ios' ?
                            <Image
                                style={{ width: 80, height: 45 }}
                                source={{ uri: data.cover_url && data.cover_url }}
                            />
                            :
                            <FastImage
                                style={{ width: 80, height: 45 }}
                                source={{ uri: data.cover_url && data.cover_url }}
                            />
                        }
                    </ImageBackground>
                </View>
            </TouchableHighlight>
        );
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 15, height: 15, marginLeft: 15 }} source={require('../../images/Home/home_growth_icon.png')} />
                        <Text style={{ fontSize: 15, color: '#000000', marginLeft: 6, fontWeight: '900' }}>成长学堂</Text>
                    </View>
                    <TouchableHighlight underlayColor={'transparent'} onPress={() => this.moreBtnOnClick()}>
                        <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                            <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={{}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 7, paddingRight: 7 }}>
                        {this._renderItem({ type: '小白课堂', data: this.state.littleWhiteClassData })}
                        {this._renderItem({ type: '大咖来了', data: this.state.bigCafeClassData })}
                    </View>
                    <View style={{ height: 1, width: baseStyle.width, backgroundColor: '#0000001A' }} />
                    <View>
                        {this._renderItem2({ type: '指标学习', data: this.state.indexStudyClassData })}
                        {this._renderItem2({ type: '策略学堂', data: this.state.ceLveClassData })}
                    </View>
                </View>
                {!this.prompt && <PopupPromptView ref={ref => this.prompt = ref} />}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    priceStyle: {
        fontWeight: '900',
        marginTop: 3,
        fontSize: 20
    },
    riseContainerStyle: {
        flexDirection: 'row',
        marginTop: 3,
        justifyContent: 'center'
    },
    riseStyle: {
        color: '#00000066',
        fontSize: 12,
        marginHorizontal: 5
    },
    panelContainerStyle: {
        backgroundColor: 'white',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 5
    },
    panelItemStyle: {
        alignItems: 'center',
        width: PANEL_ITEM_WIDTH,
        height: 75,
        paddingTop: 12
    },
    panelItemImageStyle: {
        width: 52,
        height: 52,
    },
    panelItemTextStyle: {
        marginTop: -5,
        color: '#00000066',
        fontSize: 12
    },
    marketContainerStyle: {
        backgroundColor: 'white',
        flex: 1,
    },
    marketTextStyle1: {
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
        color: '#F92400',
    },
    marketTextStyle2: {
        fontSize: 12,
        color: '#00000066',
        textAlign: 'center',
        marginTop: 10
    },
    marketTextStyle3: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000'
    },
    marketTextContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10.5
    }
})
