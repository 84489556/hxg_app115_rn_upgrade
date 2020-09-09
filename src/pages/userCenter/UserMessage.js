/**
 * Created by cuiwenjuan on 2017/8/21.
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList,
    StyleSheet,
    Platform,
    DeviceEventEmitter,
    Linking,
} from 'react-native';

import PageHeader from '../../components/NavigationTitleView'
import {commonUtil,getReaderMessage,setReaderMessage} from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import NoDataPage from '../NoDataPage'
import ShareSetting from '../../modules/ShareSetting'
import PullListView, { RefreshState } from '../../components/PullListView';
import BaseComponent from '../BaseComponentPage'
import Yd_cloud from '../../wilddog/Yd_cloud'
import LinearGradient from 'react-native-linear-gradient';
import HXGLargeList  from '../../components/HXGLargeList'
import UserInfoUtil from '../../utils/UserInfoUtil'

let refPath = Yd_cloud().ref(MainPathYG+'XiaoXiZhongXin');
// let refPath = Yd_cloud().ref('/CeshiCaiYuanGuPiao');

let gongGao = '公告';
let reDianJuJiao = '热点聚焦';
import * as ScreenUtil from '../../utils/ScreenUtil';
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"

class UserMessage extends BaseComponent{

    constructor(props) {
        super(props);
        this.state = {
            dataSource:[],
            isReaderMessages:[],
        }

        this.fiveStartNumber = 50;
        this.firstKey = "";
    }

    componentWillMount() {
        super.componentWillMount();
        UserInfoUtil.readTongZhi();

        this.pageName = '消息';

        getReaderMessage((isReaderArray)=>{
            let messages   = isReaderArray ?isReaderArray :[];
            this.setState({isReaderMessages :messages});
        })

        this._firstLoadMessage();
        // this._loadMessage();
        //页面监听
        this.messageIsReade = DeviceEventEmitter.addListener('messageIsReade', (key) => {
            let message = Array.from(this.state.isReaderMessages)
            if(message.indexOf(key) < 0){
                message.push(key);
                setReaderMessage(message);
                this.setState({
                    isReaderMessages:message
                })
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.messageIsReade && this.messageIsReade.remove();
        this.willFocusSubscription && this.willFocusSubscription.remove();

    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.xiaoxizhongxin);
            sensorsDataClickObject.adModule.entrance = ''
            sensorsDataClickObject.adModule.module_name = '消息中心';
            sensorsDataClickObject.adModule.module_type = '其它';
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
        });
    }

    onBack(){
        Navigation.pop(this.props.navigation);
    }

    _loadMessage(callBack){
        var pg = this;
        const {stateUserInfo} = this.props;
        let permissions =  stateUserInfo.permissions;

        refPath.orderByKey().endAt(this.firstKey).limitToLast(this.fiveStartNumber+1).get((snapshot) => {
            // console.log('消息中心 === loadMore',JSON.stringify(snapshot.nodeContent));
            if(snapshot.nodeContent){
                let keys =  Object.keys(snapshot.nodeContent);
                if(keys.length > 1) {
                    var toDropKey = pg.firstKey;
                    pg.firstKey = "";

                    let messageArray = [];
                    let dataSourceArray = Array.from(this.state.dataSource);
                    let messageS = snapshot.nodeContent
                    // console.log('消息 === ',JSON.stringify(snapshot));
                    for (let keyIndex in messageS) {
                        if (toDropKey !== "") {
                            if (keyIndex === toDropKey) {
                                continue;
                            }
                        }
                        if (pg.firstKey === "") pg.firstKey = keyIndex;

                        let messageData = messageS[keyIndex];

                        if(permissions < 4){
                            if( messageData.type === reDianJuJiao ){continue;}
                        }

                        let banner = {data: messageData, _key: keyIndex}
                        messageArray.push(banner);
                    }

                    Array.prototype.push.apply(dataSourceArray, messageArray.reverse());

                    this.setState({
                        dataSource: dataSourceArray,
                    },()=>{callBack()});
                }else {
                    callBack(true);
                }
            }else {
                callBack(true);
            }
        })
    }

    _firstLoadMessage(callBack){
        var pg = this;
        const {stateUserInfo} = this.props;
        let permissions =  stateUserInfo.permissions;
        refPath.orderByKey().limitToLast(this.fiveStartNumber).get((snapshot) => {
            if(snapshot.nodeContent){
                pg.firstKey = "";
                let messageArray = [];
                let messageS = snapshot.nodeContent
                // console.log('消息中心 === ',JSON.stringify(snapshot.nodeContent));

                for(let keyIndex in messageS) {
                    if (pg.firstKey === "") pg.firstKey = keyIndex;

                    let messageData = messageS[keyIndex];
                    if(permissions < 4){
                        if( messageData.type === reDianJuJiao ){continue;}
                    }
                    let banner = {data: messageData, _key: keyIndex}
                    messageArray.push(banner);
                }

                // console.log('消息 === message',JSON.stringify(messageArray));
                this.setState({
                    dataSource: messageArray.reverse(),
                });
                callBack();
            }else {
                callBack();
            }
        })
    }


    onCellSelected(Object){

        let name = Object.data ? Object.data.type : '' ;
        let key = Object.data ? Object.data.id : '';
        let tongZhiKey = Object ? Object._key : null;

        switch (name){
            case gongGao:
                Navigation.pushForParams(this.props.navigation, 'GongGaoDetail', {
                    wilddogPath: key,
                    tongZhiKey:tongZhiKey,
                })
                break;
            case reDianJuJiao:
                Navigation.pushForParams(this.props.navigation, 'HotFocusDetailPage', { id: key });
                break;
            default:
                return;
        }
        this.setReaderDetail(tongZhiKey);

    }

    //详情页面获取数据判读通知是否已读
    setReaderDetail(tongZhiKey) {
        if (tongZhiKey || tongZhiKey !== '') {
            DeviceEventEmitter.emit('messageIsReade', tongZhiKey);
            getReaderMessage((isReaderArray) => {
                let messages = isReaderArray ? isReaderArray : [];
                if (messages.indexOf(tongZhiKey) < 0) {
                    messages.push(tongZhiKey);
                    setReaderMessage(messages);
                }
            })
        }
    }


    /**
     *创建cell
     */
    renderCell(item) {

        if(!item.data){
            return null;
        }
        let itemData = item.data;
        let leix = itemData.type? itemData.type :''
        let titleSt = leix;

        let content = itemData.content;
        let time = ShareSetting.getDate(itemData.id,'today');
        let colors = ['#ff0000', '#FF6666'];
        if(leix === gongGao){
            titleSt = '官方公告';
            content = itemData.title
        }else {
            titleSt = '更新提醒';
            colors = ['#3399ff', '#66ccff'];
        }

        //判断是否已读
        let index =  this.state.isReaderMessages.indexOf(item._key)
        let isReaded = index < 0 ? false : true;

        return (
            <View style={{paddingHorizontal:ScreenUtil.scaleSizeW(12),width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(268)}}>
                <View style={{height:ScreenUtil.scaleSizeW(68),justifyContent:'center',alignItems:'center'}}>
                    <Text style={{
                        fontSize:ScreenUtil.setSpText(24),
                        color:baseStyle.BLACK_99,
                    }}>{time}</Text>
                </View>
                <TouchableOpacity style={{backgroundColor:'#fff',overflow:'hidden',height:ScreenUtil.scaleSizeW(200)}}
                                  onPress={() => this.onCellSelected(item)}
                                  activeOpacity ={0.6}>


                    <View style={{flexDirection:'row',alignItems:'center'}}>

                        {
                            isReaded? null:

                                <View
                                    style={{backgroundColor:'#ff1e6a',
                                        width:ScreenUtil.scaleSizeW(20),
                                        height:ScreenUtil.scaleSizeW(20),
                                        borderRadius:ScreenUtil.scaleSizeW(10),
                                        marginLeft:ScreenUtil.scaleSizeW(18),
                                    }}/>
                        }


                        <LinearGradient
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            colors={colors}
                            style={{
                                //这个渐变背景底部设置圆角好像有点问题，所以现在这么处理
                                height: ScreenUtil.scaleSizeW(100),
                                width:ScreenUtil.scaleSizeW(180),
                                paddingTop:ScreenUtil.scaleSizeW(50),
                                // borderBottomRightRadius:ScreenUtil.scaleSizeW(20),
                                // borderBottomLeftRadius:ScreenUtil.scaleSizeW(20),
                                borderRadius:ScreenUtil.scaleSizeW(20),
                                marginTop:-ScreenUtil.scaleSizeW(50),
                                marginLeft:ScreenUtil.scaleSizeW(18),
                                justifyContent: 'center', alignItems: 'center'
                            }}
                        >
                            <Text style={{fontSize: ScreenUtil.setSpText(30), color: '#ffffff' }}>{titleSt}</Text>
                        </LinearGradient>
                    </View>
                    <Text
                        numberOfLines={1}
                        style={{
                        fontSize: ScreenUtil.setSpText(24),
                        color:baseStyle.BLACK_666666,
                        lineHeight:ScreenUtil.scaleSizeW(40),
                        marginLeft:ScreenUtil.scaleSizeW(18),
                        marginTop:ScreenUtil.scaleSizeW(25),
                        // backgroundColor:'#cd92ff',
                    }}>
                        {content}
                    </Text>

                    <View style={{
                        flex:1,
                        borderTopWidth:0.5,
                        borderTopColor:baseStyle.LIGHTEN_GRAY,
                        height:ScreenUtil.scaleSizeW(64),
                        justifyContent:'center',
                        alignItems:'flex-end',
                        marginTop:ScreenUtil.scaleSizeW(20)
                    }}>
                        <Text style={{
                            fontSize: ScreenUtil.setSpText(24),
                            color:baseStyle.BLACK_99,
                            marginRight:ScreenUtil.scaleSizeW(20)
                        }}>
                            {'进入详情 >'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }


    /**
     * 空布局
     */
    _createEmptyView() {
        return (
            <NoDataPage content = {'暂无任何消息'} isNoShow = {true}/>
        );
    }

    _getRowHeight(item){
        return  ScreenUtil.scaleSizeW(268);
    }


    render() {
        let messages = this.state.dataSource;

        return <BaseComponent style={{flex:1}}>
            <PageHeader
                onBack={() => this.onBack()} navigation={this.props.navigation} titleText={'消息中心'}/>
            {messages.length > 0 ?
                <HXGLargeList
                    // style={{backgroundColor:baseStyle.BLACK_000000_10}}
                    data = {messages}
                    renderItem = {this.renderCell.bind(this)}
                    heightForIndexPath = {(item) => this._getRowHeight(item)}
                    onLoading = {(callBack) => this._loadMessage(callBack)}
                    onRefresh = {(callBack) => this._firstLoadMessage(callBack)}
                />
                :
                this._createEmptyView()
            }
        </BaseComponent>

    }

}


var styles = StyleSheet.create({
    textStyle:{
        marginTop:commonUtil.rare(20),
        fontSize:RATE(32),
    },
});



import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(UserMessage)
