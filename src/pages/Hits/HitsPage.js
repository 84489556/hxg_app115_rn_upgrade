/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description:打榜Tab
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Button,
    StatusBar,
    TouchableOpacity,
    DeviceEventEmitter, Platform,
} from 'react-native';

import ScrollableTabView from "react-native-scrollable-tab-view";
import YDSegmentedTab from '../../components/YDSegmentedTab';
import AsyncStorage from '@react-native-community/async-storage';
import * as ScreenUtil from '../../utils/ScreenUtil';
//import  HitsTopNabigator from "./HitsTopNavigator";
import  LimitUpNavigator from "./LimitUpNavigator";
import  ResearchNavigator from "./ResearchNavigator";
import UserInfoUtil from "../../utils/UserInfoUtil";
import * as baseStyle from "../../components/baseStyle";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import { sensorsDataClickObject ,sensorsDataClickActionName} from '../../components/SensorsDataTool';

export default class HitsPage extends Component<Props> {

    constructor(props) {
        super(props);
        // 0 游客,  1,登录 ，3,4,5 三四五星用户
        let permissions = UserInfoUtil.getUserPermissions();
        let showDialog ;
        if(permissions=="0"){
            showDialog = true;
        }else {
            showDialog = false;
        }

        this.state = {
            defaultAnimationDialog: showDialog,
        }

    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {
        this.getIsLoginStatus =  DeviceEventEmitter.addListener('GET_ISLOGIN_STATUS', (index)=>{
            if(index!=undefined){
               // console.log("接收到打榜的tab切换",index)
                // 0 游客,  1,登录 ，3,4,5 三四五星用户
                let permissions = UserInfoUtil.getUserPermissions();
                let showDialog ;

                if(permissions=="0"){
                    showDialog = true;
                }else {
                    showDialog = false;
                }
                this.setState({
                    defaultAnimationDialog:showDialog
                },()=>{
                    if(Platform.OS==='ios'){
                        //ios需要渲染完成后再跳转
                        setTimeout(()=>{
                            this.mScrollableTabView.goToPage(index);
                        },100)
                    }else {
                        this.mScrollableTabView.goToPage(index);
                    }
                    DeviceEventEmitter.emit("DB_TAB_CHANGE",index);
                });

            }else {
                // 0 游客,  1,登录 ，3,4,5 三四五星用户
                let permissions = UserInfoUtil.getUserPermissions();
                let showDialog ;

                if(permissions=="0"){
                    showDialog = true;
                }else {
                    showDialog = false;
                }

                this.setState({
                    defaultAnimationDialog:showDialog
                });
                AsyncStorage.getItem('db_child_index', (error, result)=> {
                    if (error) {
                        //登录后,默认显示当前的位置
                        //记录现在的位置，默认设置选中位置
                        this.sendItemIndex(0);
                    }else {
                        let childObj =  JSON.parse(result);
                        if(childObj){
                            DeviceEventEmitter.emit("DB_TAB_CHANGE",childObj.indexPosition);
                        }

                    }
                })

            }
        });

    }

    // paddingTop: ScreenUtil.andStatusH,
    //<HitsTopNabigator tabLabel='高管交易榜' navigation={this.props.navigation} />
    render() {
        return (
            <View style={styles.container}>
                {Platform.OS === 'ios' ?
                    <View style={{ height: baseStyle.isIPhoneX ? 44 : 20, width: baseStyle.width }} /> :
                    <View style={{ height: StatusBar.currentHeight, width: baseStyle.width }} />}
                <ScrollableTabView
                    ref={ref => (this.mScrollableTabView = ref)}
                    style={{ backgroundColor: 'white' }}
                    initialPage={0}
                    locked={true}
                    renderTabBar={() =>
                        <YDSegmentedTab
                            style={styles.scrollViewtab}
                            onChangeTabs = {(index)=>{this.tabChangge(index) }}
                            tabNames={['涨停炸板', '机构调研']}
                        />
                    }>

                    <LimitUpNavigator tabLabel='涨停炸板' navigation={this.props.navigation}/>
                    <ResearchNavigator tabLabel='机构调研' navigation={this.props.navigation} />
                </ScrollableTabView>

                {this.state.defaultAnimationDialog===true ?
                    <View style={styles.modelStyle}>
                        <View style={styles.bgwhite}>
                            <View style={styles.upView} >
                                <Text style={{fontSize:ScreenUtil.setSpText(32),color:"#000"}}>此模块登录后可查看</Text>
                            </View>
                            <TouchableOpacity onPress={()=>{
                                sensorsDataClickObject.loginButtonClick.entrance = '打榜'
                                Navigation.pushForParams(this.props.navigation,"LoginPage", {callBack: ()=>{this.loginCallback()},})
                            }} style={styles.loginView} >
                                <Text style={{fontSize:ScreenUtil.setSpText(32),color:"#FF0000"}}>登录</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    :
                    <View/>
                }

            </View>
        )
    }
    /**
     * tab改变时的回调
     * */
    tabChangge(selectIndex){
        this.mScrollableTabView.goToPage(selectIndex)
        //console.log("change",selectIndex)
       // DeviceEventEmitter.emit("XG_TAB_CHANGE",selectIndex);
        //打榜tab切换
        DeviceEventEmitter.emit("DB_TAB_CHANGE",selectIndex);
        this.sendItemIndex(selectIndex);

        //增加页面埋点统计的记录
        switch (selectIndex) {
            case 0:
                this.sensorsAppear('涨停炸板');
                BuriedpointUtils.setItemByPosition(["dabang","zhangtingzhaban"]);
                break;
            case 1:
                this.sensorsAppear('机构调研');
                BuriedpointUtils.setItemByPosition(["dabang","jigoudiaoyan"]);
                break;
        }
    }


    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = '打榜'
        sensorsDataClickObject.adLabel.label_level = 1;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.page_source = '打榜';
        sensorsDataClickObject.adLabel.module_source = '打榜'
        sensorsDataClickObject.adLabel.is_pay = '免费';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)


        sensorsDataClickObject.adModule.entrance = '打榜';
        sensorsDataClickObject.adModule.module_name = label;
        sensorsDataClickObject.adModule.module_type = '打榜';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule)
    }



    /**
     * 点击储存现在的位置
     *
     * */
    sendItemIndex(index){
        let datas = {
            indexPosition:index
        };
        AsyncStorage.setItem('db_child_index', JSON.stringify(datas), function (error) {
            if (error) {
                //console.log("存储失败")
            }else {
                //console.log("存储完成")
            }
        })
    }

    /**
     * 登录页面跳转回调
     * */
    loginCallback(){
        if(this.state.defaultAnimationDialog === false){
            return;
        }
        // 0 游客,  1,登录 ，3,4,5 三四五星用户
        let permissions = UserInfoUtil.getUserPermissions();
        let showDialog ;
        if(permissions=="0"){
            showDialog = true;
        }else {
            showDialog = false;
        }
        this.setState({
            defaultAnimationDialog : showDialog,
        });
    }


    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this.getIsLoginStatus &&  this.getIsLoginStatus.remove();
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1
    },
    textStyle: {
        color: "#333333",
        fontSize: 12,
    },
    selectedTextStyle: {
        color: "black",
        fontSize: 12
    },
    scrollViewtab:{
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modelStyle:{
        width:ScreenUtil.screenW,
        height:Platform.OS==='ios'? ScreenUtil.screenH-49:ScreenUtil.screenH+50,
        backgroundColor:"rgba(0,0,0,0.5)",
        position:"absolute",
        left:0,
        top:0,
        justifyContent:"center",
        alignItems:"center"
    },
    bgwhite:{
        width:0.7*ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(260),
        borderRadius:ScreenUtil.scaleSizeW(12),
        backgroundColor:"#fff",
        justifyContent:"center",
        alignItems:"center",
    },
    upView:{
        flex:1,
        width:0.7*ScreenUtil.screenW,
        alignItems:"center",
        justifyContent:"center",
        borderColor:"#e8e8e8",
        borderBottomWidth:0.5
    },
    loginView:{
        width:ScreenUtil.screenW*0.7,
        alignItems:"center",
        justifyContent:"center",
        paddingVertical:ScreenUtil.scaleSizeW(20)
    }
});
