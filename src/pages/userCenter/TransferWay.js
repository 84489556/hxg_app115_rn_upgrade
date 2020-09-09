/**
 * Created by cuiwenjuan on 2019/8/12.
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
import BaseComponent from '../BaseComponentPage'
import TransferWayData from '../../images/jsonMessage/TransferWayData.json';
import UserInfoUtil from '../../utils/UserInfoUtil'

var imagePath = {
    uc_transfer_gh:require('../../images/userCenter/uc_transfer_gh.png'),
    uc_transfer_jh:require('../../images/userCenter/uc_transfer_jh.png'),
    uc_transfer_zh:require('../../images/userCenter/uc_transfer_zh.png'),
    uc_transfer_wx:require('../../images/userCenter/uc_transfer_wx.png'),
    uc_transfer_wxpay:require('../../images/userCenter/uc_transfer_wxpay.png'),
    uc_transfer_zfb:require('../../images/userCenter/uc_transfer_zfb.png'),
    uc_transfer_zfbpay:require('../../images/userCenter/uc_transfer_zfbpay.png'),
}

class TransferWay extends BaseComponent{

    constructor(props) {
        super(props);
        this.state = {
            dataSource:[],
            permissionText:'暂无特殊服务'
        }
    }

    componentWillMount() {
        super.componentWillMount();

        this._loadData();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    onBack(){
        Navigation.pop(this.props.navigation);
    }

    _loadData(){

        let transfers = TransferWayData.transferWay;
        this.setState({
            dataSource:transfers,
        })

    }


    _itemView(info,index){

        let nameTitle = info.nameTitle;
        let accountTitle = info.accountTitle;
        let bankTitle = info.bankTitle;
        let name = info.name;
        let account = info.account;
        let bank = info.bank;
        let image = info.image;
        let icon = info.icon;
        let imageS = imagePath[icon];
        let payImage = image && imagePath[image];
        let payText = '支付宝扫码支付';
        if(name === '微信支付'){
            payText = '微信扫码支付'
        }

        return (
            <View key = {index} style={{flexDirection:'row'}}>
                <Image
                    style={{marginTop:15,marginRight:10}}
                    source={imageS}/>

                <View  style={{flex:1,
                    borderTopColor:baseStyle.BLACK_000000_10,
                    borderTopWidth: index > 0 ? 1 : 0,
                    paddingTop:15,
                    paddingBottom:15
                }}>
                    <Text style={[styles.textFont,{flex:1}]}>{nameTitle+':'+name}</Text>
                    <Text style={[styles.textFont,{flex:1,marginTop:5,marginBottom:5}]}>{accountTitle+':'+account}</Text>
                    <Text style={[styles.textFont,{flex:1}]}>{bankTitle+':'+bank}</Text>

                    {
                        image &&  <View >
                            <Image
                                style={{marginTop:15,height:126,width:121}}
                                source={payImage}/>
                            <Text style={[styles.textFont,{width:121,textAlign:'center',marginTop:5}]}>{payText}</Text>

                        </View>
                    }


                </View>
            </View>
        )
    }


    /**
     *创建cell
     */
    renderCell(item) {

        if(!item.item){
            return null;
        }
        let messageData = item.item;
        let text = messageData.title;
        let itemDate = messageData.datas;

        return (
        <View>
            {
                item.index > 0 ? <View style={{backgroundColor:baseStyle.LINE_BG_F1,height:10,flex:1}}/> :null
            }
            <View style={styles.itemViewStyle}>
                <View style={{}}>
                    <Text style={{fontSize:20,marginTop:10}}>{text}</Text>
                </View>
                {
                    itemDate.map((info,index) => (
                        this._itemView(info, index)
                    ))
                }

            </View>
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
                onBack={() => this.onBack()} navigation={this.props.navigation} titleText={'汇款方式'}/>
            <FlatList
                data = {messages}
                renderItem = {this.renderCell.bind(this)}
                ListEmptyComponent = {this._createEmptyView()}
                bounces={false}
            />
        </BaseComponent>

    }

}


var styles = StyleSheet.create({
    textFont:{
        fontSize:12,
        color:baseStyle.BLACK_000000_60,
    },
    itemViewStyle:{
        paddingRight:16,
        paddingLeft:14,
        backgroundColor:"#fff",
        // flexDirection:'row'
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
)(TransferWay)