/**
 * Created by cuiwenjuan on 2019/7/31.
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
import NoDataPage from '../NoDataPage'
import ShareSetting from '../../modules/ShareSetting'
import BaseComponent from '../BaseComponentPage'
import Yd_cloud from '../../wilddog/Yd_cloud'
import HXGLargeList  from '../../components/HXGLargeList'


let refPath = Yd_cloud().ref(MainPathYG+'YingXiaoHuoDong/ChanPinFuWu');
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"
class ServiceMall extends BaseComponent{

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
    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.fuwushangcheng);
        });
    }
    onBack(){
        Navigation.pop(this.props.navigation);
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
                        //判断app链接为空,删除
                        if(banner.data.link2 && banner.data.link2!=""){
                            messageArray.push(banner);
                        }
                    }

                    // console.log('消息 === dataSourceArray', JSON.stringify(messageArray));
                    Array.prototype.push.apply(dataSourceArray, messageArray.reverse());

                    this.setState({
                        dataSource: dataSourceArray,
                    });
                    callBack()
                }else {
                    callBack(true)
                }
            }else {
                callBack(true)
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
                    let banner = {data: messageData, _key: keyIndex}
                    //判断app链接为空,删除
                    if(banner.data.link2 && banner.data.link2!=""){
                        messageArray.push(banner);
                    }
                }
                    //console.log("获取列表",messageArray.reverse())
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



    _onCellSelected(info){
        if(!info){return null}
        Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage',{name:info.name,url:info.link,showButton:info.ktqx})
    }


    /**
     *创建cell
     */
    renderCell(item,index) {

        if(!item.data){
            return null;
        }
        let time = ShareSetting.getDate(item._key,'today');

        let messageData = item.data;
        let imageLink = messageData.image;
        let text = messageData.name;


        return (
            <View style={styles.itemViewStyle}>
                <TouchableOpacity style={{ flex:1}}
                                  onPress={() => this._onCellSelected(messageData)}>
                    <Image
                        style={{
                            height:204,
                            width:commonUtil.width - 12,
                            // backgroundColor:'#ffa9d9',
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

                </TouchableOpacity>
            </View>
        )
    }


    /**
     * 空布局
     */
    _createEmptyView() {
        return (
            <NoDataPage content = {'当前无推荐服务'} isNoShow = {true}/>
        );
    }


    render() {
        let messages = this.state.dataSource;

        return <BaseComponent style={{flex:1}}>
            <PageHeader
                onBack={() => this.onBack()} navigation={this.props.navigation} titleText={'服务商城'}/>
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
)(ServiceMall)