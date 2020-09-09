/**
 * Created by cuiwenjuan on 2019/7/29.
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
import {commonUtil,getTime,toast} from '../../utils/CommonUtils'
import *as baseStyle from '../../components/baseStyle'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import NoDataPage from '../NoDataPage'
import ShareSetting from '../../modules/ShareSetting'
import BaseComponent from '../BaseComponentPage'
import Yd_cloud from '../../wilddog/Yd_cloud'
import HXGLargeList from '../../components/HXGLargeList'

let refPath = Yd_cloud().ref(MainPathYG+'YingXiaoHuoDong/ChanPinHuoDong');
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"

class ActivityCenter extends BaseComponent{

    constructor(props) {
        super(props);
        this.state = {
            dataSource:[],
        }
        this.fiveStartNumber = 30;
        this.firstKey = "";
    }

    componentWillMount() {
        super.componentWillMount();
        this._firstLoadMessage();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.willFocusSubscription && this.willFocusSubscription.remove();

    }

    onBack(){
        Navigation.pop(this.props.navigation);
    }
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.huodongzhongxin);
        });
    }

    _loadMessage(callBack){
        var pg = this;

        refPath.orderByKey().endAt(this.firstKey).limitToLast(this.fiveStartNumber+1).get((snapshot) => {
            // console.log('活动中心 === loadMore',JSON.stringify(snapshot.nodeContent));
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
                        let banner = {data: messageData, _key: keyIndex}
                        if(!this._returnEndOrNoStart(messageData,true)){
                            if(banner.data.link2 && banner.data.link2!=""){
                                messageArray.push(banner);
                            }
                        }
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
        refPath.orderByKey().limitToLast(this.fiveStartNumber).get((snapshot) => {
            if(snapshot.nodeContent){
                pg.firstKey = "";
                let messageArray = [];
                let messageS = snapshot.nodeContent
                // console.log('活动中心 === ',JSON.stringify(snapshot.nodeContent));

                for(let keyIndex in messageS) {
                    if (pg.firstKey === "") pg.firstKey = keyIndex;

                    let messageData = messageS[keyIndex];
                    let banner = {data: messageData, _key: keyIndex};

                    if(!this._returnEndOrNoStart(messageData,true)){
                        //判断app链接为空,删除
                        if(banner.data.link2 && banner.data.link2!=""){
                            messageArray.push(banner);
                        }
                    }

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


    //判断是否开放 或者已经结束 isEnd true：判断是否结束
    _returnEndOrNoStart(messageData,isEnd) {
        let startTime = messageData.startTime;
        let endTime = messageData.endTime;
        let newTime = Date.parse(new Date());

        if(isEnd){
           if(newTime > this._getTimeStamp(endTime))
               return true;
           else
               return false;
        }else {
            if (newTime > this._getTimeStamp(startTime))
                return true;
            else
                return false;
        }
    }

   _getTimeStamp(time){
       let date = time.substring(0, 19);
        date = time.replace(/-/g, '/');
       let tim = new Date(date).getTime();
       return tim;
    }

    _onCellSelected(info){
       if(!info){return null}

       if(info.isStating){
           Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage',{name:info.name,url:info.link2,showButton:info.ktqx})
           // toast('活动详情页');
       }else {
           toast('活动未开始，请期待')
       }
    }




// {"endTime":"2019-08-23 00:00:00",
// "image":"http://192.168.1.107/image/1564392744982.jpg",
// "link":"http://localhost:3033/#/productActivity",
// "name":"活动5",
// "startTime":"2019-07-29 17:31:00"}
    /**
     *创建cell
     */
    renderCell(item,index) {

        if(!item.data){
            return null;
        }
        
        let itemData = item.data
        
        let time = ShareSetting.getDate(itemData._key,'today');

        let messageData = item.data;
        let imageLink = messageData.image;
        let text = messageData.name;
        let startTime = messageData.startTime;
        let isStarting = this._returnEndOrNoStart(messageData);
        messageData.isStating = isStarting;


        return (
            <View style={styles.itemViewStyle}>
                <TouchableOpacity style={{ flex:1}}
                                  onPress={() => this._onCellSelected(messageData)}>
                    <Image
                        style={{
                        height:204,
                        width:commonUtil.width - 12,
                        // backgroundColor:'#cccccc',
                        }}
                        resizeMode = {'contain'}
                        source={{uri:imageLink}}/>

                    <View style={{flex:1,justifyContent:'center'}}>
                        <Text style={{
                            marginLeft:10,
                            fontSize:15,
                            color:baseStyle.BLACK,
                            // backgroundColor:'#cd92ff'
                        }}>{text}</Text>
                    </View>

                    {
                        isStarting ?
                            <View style={styles.blackViewStyle}>
                                <Image source={require('../../images/userCenter/uc_activity_on.png')}/>
                                <View style={{flex:1}}/>
                                <Text style={{marginLeft:5,fontSize:12,color:'#fff'}}>{'进行中'}</Text>
                            </View>
                            :
                            <View style={[styles.blackViewStyle,{left:0}]}>
                                <Image source={require('../../images/userCenter/uc_activity_noStart.png')}/>
                                <Text style={{marginLeft:5,fontSize:12,color:'#fff'}}>{'未开始'}</Text>
                                <View style={{flex:1}}/>
                                <Text style={{fontSize:12,color:'#fff'}}>{'开始时间：'+startTime}</Text>
                            </View>
                    }

                </TouchableOpacity>
            </View>
        )
    }

    /**
     * 空布局
     */
    _createEmptyView() {
        return (
        <NoDataPage content = {'暂无任何活动，敬请期待'} isNoShow = {true}/>
        );
    }

    render() {
        let messages = this.state.dataSource;

        return <BaseComponent style={{flex:1}}>
            <PageHeader
                onBack={() => this.onBack()} navigation={this.props.navigation} titleText={'活动中心'}/>
            {messages.length > 0 ?
                <HXGLargeList
                    // style={{backgroundColor:baseStyle.BLACK_000000_10}}
                    data = {messages}
                    renderItem = {this.renderCell.bind(this)}
                    heightForIndexPath = {() => 254}
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
    itemViewStyle:{
        marginRight:6,
        marginLeft:6,
        marginTop:10,
        backgroundColor:"#fff",
        height:244,
        borderRadius:5,
        overflow:'hidden'
    },

    blackViewStyle:{
        height:30,
        position: 'absolute',
        right:0,
        bottom:40,
        backgroundColor:baseStyle.BLACK_000000_60,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingLeft:10,
        paddingRight:10
    },
});



import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(ActivityCenter)