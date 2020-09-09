/**
 * Created by cuiwenjuan on 2019/8/19.
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

let refPath = Yd_cloud().ref(MainPathYG+'ZhuTiTouZi/ZhuTiBanKuai');
//只是Android 使用
import FastImage from 'react-native-fast-image'

class MainReportPage extends BaseComponent{

    constructor(props) {
        super(props);
        this.state = {
            dataSource:this.props.navigation.state.params.allReport ? this.props.navigation.state.params.allReport :[],
        }
        // this.fiveStartNumber = 20;
        // this.firstKey = "";
    }

    componentWillMount() {
        super.componentWillMount();
       // this._firstLoadMessage();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    onBack(){
        Navigation.pop(this.props.navigation);
    }


    _loadMessage(callBack){
        // var pg = this;
        //
        // refPath.orderByKey().endAt(this.firstKey).limitToLast(this.fiveStartNumber+1).get((snapshot) => {
        //     // console.log('活动中心 === loadMore',JSON.stringify(snapshot.nodeContent));
        //     if(snapshot.nodeContent){
        //         let keys =  Object.keys(snapshot.nodeContent);
        //         if(keys.length > 1) {
        //             var toDropKey = pg.firstKey;
        //             pg.firstKey = "";
        //
        //             let messageArray = [];
        //             let dataSourceArray = Array.from(this.state.dataSource);
        //             let messageS = snapshot.nodeContent
        //             // console.log('消息 === ',JSON.stringify(snapshot));
        //             for (let keyIndex in messageS) {
        //                 if (toDropKey !== "") {
        //                     if (keyIndex === toDropKey) {
        //                         continue;
        //                     }
        //                 }
        //                 if (pg.firstKey === "") pg.firstKey = keyIndex;
        //
        //                 let messageData = messageS[keyIndex];
        //                 let banner = {data: messageData, _key: keyIndex}
        //                 messageArray.push(banner);
        //             }
        //
        //             Array.prototype.push.apply(dataSourceArray, messageArray.reverse());
        //
        //             this.setState({
        //                 dataSource: dataSourceArray,
        //             },()=>{callBack()});
        //         }else {
        //             callBack(true);
        //         }
        //     }else {
        //         callBack(true);
        //     }
        // })

        callBack(true);

    }

    _firstLoadMessage(callBack){
        // var pg = this;
        // refPath.orderByKey().limitToLast(this.fiveStartNumber).get((snapshot) => {
        //     if(snapshot.nodeContent){
        //         pg.firstKey = "";
        //         let messageArray = [];
        //         let messageS = snapshot.nodeContent
        //         // console.log('活动中心 === ',JSON.stringify(snapshot.nodeContent));
        //
        //         for(let keyIndex in messageS) {
        //             if (pg.firstKey === "") pg.firstKey = keyIndex;
        //
        //             let messageData = messageS[keyIndex];
        //             let banner = {data: messageData, _key: keyIndex}
        //             messageArray.push(banner);
        //         }
        //
        //         // console.log('消息 === message',JSON.stringify(messageArray));
        //         this.setState({
        //             dataSource: messageArray.reverse(),
        //         });
        //         callBack();
        //     }else {
        //         callBack();
        //     }
        // })

        //之前是加载节点的主题报告，现在直接使用上个页面传递的主题报告
        this.setState({
            dataSource:this.state.dataSource
        },()=>{
            if(callBack){
                callBack(true);
            }
        })
    }

    _onCellSelected(info){
        if(!info){return null}

        Navigation.pushForParams(this.props.navigation, 'MainReportDetailPage',{key:info})
    }

    /**
     *创建cell
     */
    // <Image style={{width:commonUtil.width - 30, height:154, backgroundColor:baseStyle.BLACK_000000_10}} source={{uri:imageUrl}}/>
    renderCell(item,index) {

        if(!item.data){
            return null;
        }

        let reportData = item.data;
        let imageUrl = reportData.theme_pic;
        let name = reportData.theme_name;
        let time = ShareSetting.getDate(reportData.create_time,'jztz');


        return (
            <View style={styles.itemViewStyle}>
                <TouchableOpacity style={{
                    flex:1,
                    backgroundColor:'#fff',
                    padding:10,
                    borderRadius:10,
                    paddingTop:15
                }}
                     onPress={() => this._onCellSelected(item._key)}>


                    {Platform.OS === 'ios' ?
                        <Image
                            style={{width:commonUtil.width - 30, height:154, backgroundColor:baseStyle.BLACK_000000_10}}
                            source={{uri: imageUrl}}
                        />
                        :
                        <FastImage
                            style={{width:commonUtil.width - 30, height:154, backgroundColor:baseStyle.BLACK_000000_10}}
                            source={{uri: imageUrl}}
                            //resizeMode={FastImage.resizeMode.stretch}
                        />
                    }
                    <View style={{flexDirection:'row',justifyContent:'space-between', alignItems:'center',height:30}}>
                        <Text style={{fontSize: ScreenUtil.setSpText(28),       color:baseStyle.BLACK_333333}}>{name}</Text>
                        <Text style={{fontSize: ScreenUtil.setSpText(24),color:baseStyle.BLACK_99}}>{time}</Text>
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
            <NoDataPage isNoShow = {true}/>
        );
    }

    render() {
        let messages = this.state.dataSource;

        return <BaseComponent style={{flex:1}}>
            <PageHeader
                onBack={() => this.onBack()} titleText={'主题解读列表'}/>
            {/*<View style={{width:commonUtil.width,height:8, backgroundColor:baseStyle.LINE_BG_F6}}/>*/}
            {messages.length > 0 ?
                <HXGLargeList
                    // style={{backgroundColor:baseStyle.BLACK_000000_10}}
                    data = {messages}
                    renderItem = {this.renderCell.bind(this)}
                    heightForIndexPath = {() => 215}
                    allLoaded={true}
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
        // backgroundColor:"#b0ff86",
        height:215,
        overflow:'hidden',
        paddingRight:5,
        paddingLeft:5,
        paddingTop:8,
    },
});



import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import * as ScreenUtil from "../../utils/ScreenUtil";

export default connect((state) => ({
        stateUserInfo: state.UserInfoReducer,
    }),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(MainReportPage)