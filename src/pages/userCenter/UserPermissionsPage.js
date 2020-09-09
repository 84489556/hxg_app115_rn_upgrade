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
import BaseComponent from '../BaseComponentPage'
import UserPermissions from '../../images/jsonMessage/UserPermissions.json';
import UserInfoUtil from '../../utils/UserInfoUtil'

let cloumnWidth = 80
class UserPermissionsPage extends BaseComponent{

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

        let permissions = UserInfoUtil.getUserPermissions();
        let activity = UserInfoUtil.getUserInfoReducer().activityPer;
        let cyPower = UserInfoUtil.getUserInfoReducer().cyPower
        //获取服务剩余天数
        let dayNumber = cyPower.numberDays;
        // permissions = 5;


        let messages = [];
        let permissionString = this.state.permissionText;

        if(permissions <= 1){
            messages = [];
            if(cyPower.permissions === undefined){
                permissionString = '暂无特殊权限';
            }else if(!cyPower.isStart){
                permissionString = '暂无特殊权限';
            }else if(cyPower.permissions >= 3 && dayNumber < 0){
                permissionString = '已到期';
            }else if(activity === DuoTou){
                messages = UserPermissions.duoTouQiDong;
            }
        }else if(permissions === 3){
            messages = UserPermissions.threeStar;
        }else if(permissions === 4){
            messages = UserPermissions.fourStar;
        }else if(permissions === 5){
            messages = UserPermissions.fiveStar;
        }

        this.setState({
            dataSource:messages,
            permissionText :permissionString
        })

    }


    _itemView(info,index){
        let name = info.name;
        return (
            <View key = {index}
                style={{flex:1,flexDirection:'row', alignItems:'center',
                    borderBottomColor:baseStyle.BLACK_000000_10,
                borderBottomWidth:1,
                    paddingTop:10,
                    paddingBottom:10
                }}>
                <Text style={[styles.textFont,{flex:1}]}>{name}
                <Text style={{fontSize:11}}>{info.item ? '\n' + info.item : ''}</Text>
                </Text>
                <Image source={require('../../images/userCenter/uc_permission_check.png')}/>
            </View>
        )
    }


    /**
     *创建cell
     */
    renderCell(item,index) {

        if(!item.item){
            return null;
        }

        let messageData = item.item;
        let text = messageData.name;
        let itemDate = messageData.items;

        return (
            <View style={styles.itemViewStyle}>
                <View style={{
                    width:cloumnWidth,
                    borderBottomColor:baseStyle.BLACK_000000_10,
                    borderBottomWidth:1}}>
                    <Text style={{fontSize:14,marginTop:10}}>{text}</Text>
                </View>
                <View style={{flex:1}}>

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

        //

        return (
            <NoDataPage
                content = {this.state.permissionText}
                source = {require('../../images/userCenter/uc_no_data.png')}
                isNoShow = {true}/>
        );
    }

    /**
     * header
     */
    _createHeaderComponent(){
        let messages = this.state.dataSource;
        if(messages.length <= 0){
            return null;
        }

        return (
            <View style={{
                flex:1,
                height:30,
                flexDirection:'row',
                backgroundColor:baseStyle.BLUE_0099FF_05,
                alignItems:'center'}}>
                <Text style={[styles.textFont,{marginLeft:14,width:cloumnWidth}]}>{'栏目'}</Text>
                <Text style={[styles.textFont,{flex:1}]}>{'功能'}</Text>
                <Text style={[styles.textFont,{marginRight:16}]}>{'权限'}</Text>
            </View>
        );
    }


    render() {
        let messages = this.state.dataSource;

        return <BaseComponent style={{flex:1}}>
            <PageHeader
                onBack={() => this.onBack()} navigation={this.props.navigation} titleText={'我的权限'}/>
            {
                messages.length > 0?
                <FlatList
                    data = {messages}
                    renderItem = {this.renderCell.bind(this)}
                    // ListEmptyComponent = {this._createEmptyView()}
                    ListHeaderComponent={this._createHeaderComponent()}
                    bounces={false}
                />:
                this._createEmptyView()
            }
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
        flexDirection:'row'
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
)(UserPermissionsPage)