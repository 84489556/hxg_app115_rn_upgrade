/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description: 选股tab
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet, DeviceEventEmitter, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ScrollableTabView, { ScrollableTabBar } from "react-native-scrollable-tab-view";
import YDSegmentedTab from '../../components/YDSegmentedTab';

import * as ScreenUtil from '../../utils/ScreenUtil';
import SpecialNavigator from "./SpecialNavigator";
//import  ValueStrategy from "./ValueStrategy";
import HotTuyerePages from './HotTuyerePages'

import ResearchStrategy from "./ResearchStrategy";
import UserInfoUtil from "../../utils/UserInfoUtil";
//import BaseComponentPage from "../../pages/BaseComponentPage";
import * as baseStyle from "../../components/baseStyle";
//import QuotationListener from "../../utils/QuotationListener";
import TargetSelectStock from './SpecialSelectStock/TargetSelectStock';
import * as BuriedpointUtils from '../../utils/BuriedpointUtils';
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool';

export default class StockSelectPage extends Component<Props> {

    constructor(props) {
        super(props);
        // 0 游客,  1,登录 ，3,4,5 三四五星用户
        let permissions = UserInfoUtil.getUserPermissions();
        //let permissions = 3;
        let showPosition;
        if (permissions == 0 || permissions == 1) {
            showPosition = 1;
        } else {
            showPosition = 0;
        }
        //默认选择的tab
        this.state = {
            permissions: permissions,//当前用户的权限
            selectedTab: showPosition,
        };

        //直接修改AppMainLevel中选股选中的默认值
        let newState = {
            tesezhibiaoxuangu: showPosition === 0 ? 1 : 0,
            //rediancelue:0,
            yanbaocelue: showPosition === 2 ? 1 : 0
        }
        BuriedpointUtils.AppMainLevel.xuangu = newState;
        //然后回调到AppMain,去存储
        this.props.setBuriedpoint && this.props.setBuriedpoint();


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
        this.getIsLoginStatusXg = DeviceEventEmitter.addListener('GET_ISLOGIN_STATUS_XG', (index) => {
            if (index != undefined) {
                //跳转后，手动通知现在tab的位置
                if (Platform.OS === 'ios') {
                    //ios需要渲染完成后再跳转
                    setTimeout(() => {
                        this.myScrollTab.goToPage(index);
                    }, 100)
                } else {
                    this.myScrollTab.goToPage(index);
                }

                DeviceEventEmitter.emit("XG_TAB_CHANGE", index);
                //记录现在的位置，默认设置选中位置
                this.sendItemIndex(index);
                //直接修改AppMainLevel中选股选中的默认值
                let newState = {
                    tesezhibiaoxuangu: index == 0 ? 1 : 0,
                    //rediancelue:index==1? 1: 0,
                    yanbaocelue: index == 1 ? 1 : 0
                }
                BuriedpointUtils.AppMainLevel.xuangu = newState;
                //然后回调到AppMain,去存储
                this.props.setBuriedpoint && this.props.setBuriedpoint();
            } else {
                // 0 游客,  1,登录 ，3,4,5 三四五星用户
                let permissions = UserInfoUtil.getUserPermissions();

                //let permissions = 3;
                if (permissions == 0) {

                    //未登录，只能显示最后一个tab,每次点击选股时判断
                    if (this.state.selectedTab !== 1) {
                        this.setState({
                            permissions: 0,
                            selectedTab: 1
                        }, () => {
                            if (this.myScrollTab) {
                                this.myScrollTab.goToPage(1);
                                //记录现在的位置，默认设置选中位置
                                this.sendItemIndex(1);
                                //直接修改AppMainLevel中选股选中的默认值
                                BuriedpointUtils.AppMainLevel.xuangu = { tesezhibiaoxuangu: 0, yanbaocelue: 1 };
                                //然后回调到AppMain,去存储
                                this.props.setBuriedpoint && this.props.setBuriedpoint();

                            }

                        })
                    } else {
                        //直接修改AppMainLevel中选股选中的默认值
                        BuriedpointUtils.AppMainLevel.xuangu = { tesezhibiaoxuangu: 0, yanbaocelue: 1 };
                        //然后回调到AppMain,去存储
                        this.props.setBuriedpoint && this.props.setBuriedpoint();
                    }
                } else {
                    AsyncStorage.getItem('xg_child_index', (error, result) => {
                        if (error) {
                            //登录后,默认显示当前的位置
                            //记录现在的位置，默认设置选中位置
                            this.sendItemIndex(0);
                            this.setState({
                                permissions: permissions,
                                selectedTab: 0
                            }, () => {
                                this.myScrollTab.goToPage(0);
                                //直接修改AppMainLevel中选股选中的默认值
                                let newState = {
                                    tesezhibiaoxuangu: 1,
                                    //rediancelue:0,
                                    yanbaocelue: 0
                                }
                                BuriedpointUtils.AppMainLevel.xuangu = newState;
                                //然后回调到AppMain,去存储
                                this.props.setBuriedpoint && this.props.setBuriedpoint();
                            });
                        } else {
                            let childObj = JSON.parse(result);
                            //console.log("取到的值",childObj)
                            if (childObj) {
                                this.setState({
                                    permissions: permissions,
                                    selectedTab: childObj.indexPosition
                                }, () => {
                                    this.myScrollTab.goToPage(childObj.indexPosition);
                                    DeviceEventEmitter.emit("XG_TAB_CHANGE", childObj.indexPosition);

                                    //直接修改AppMainLevel中选股选中的默认值
                                    let newState = {
                                        tesezhibiaoxuangu: childObj.indexPosition == 0 ? 1 : 0,
                                        //rediancelue:childObj.indexPosition==1? 1: 0,
                                        yanbaocelue: childObj.indexPosition == 1 ? 1 : 0
                                    }
                                    BuriedpointUtils.AppMainLevel.xuangu = newState;
                                    //然后回调到AppMain,去存储
                                    this.props.setBuriedpoint && this.props.setBuriedpoint();
                                });

                            }

                        }
                    })
                }
            }
        });

    }

    /**
     * 点击储存现在的位置
     *
     * */
    sendItemIndex(index) {
        let datas = {
            indexPosition: index
        };
        AsyncStorage.setItem('xg_child_index', JSON.stringify(datas), function (error) {
            if (error) {
                //console.log("存储失败")
            } else {
                //console.log("存储完成")
            }
        })
    }
    //{this.getValueView()}
    render() {
        return (
            <View style={styles.container}>
                {Platform.OS === 'ios' ?
                    <View style={{ height: baseStyle.isIPhoneX ? 44 : 20, width: baseStyle.width }} /> :
                    <View style={{ height: StatusBar.currentHeight, width: baseStyle.width }} />}
                <ScrollableTabView
                    ref={ref => (this.myScrollTab = ref)}
                    style={{ backgroundColor: "#f6f6f6" }}
                    initialPage={this.state.selectedTab}
                    locked={true}
                    renderTabBar={() =>
                        <YDSegmentedTab
                            onChangeTabs={(index) => { this.tabChangge(index) }}
                            style={{ backgroundColor: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center', }}
                            tabNames={['特色指标选股', '研报策略']}
                        />
                    }>
                    {this.getSpecialView()}

                    <ResearchStrategy tabLabel='研报策略' navigation={this.props.navigation} />
                </ScrollableTabView>
            </View>
        )
    }
    /**
     * 获取特色指标选股的View，或者去开通的页面
     * */
    getSpecialView() {
        let permissions = this.state.permissions;
        if (permissions == 1) {
            return (
                <View tabLabel='特色指标选股' style={styles.chargeViewout}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#626262" }}>您暂无权限查看当前功能</Text>
                    <TouchableOpacity onPress={() => { this.specialToMarketing() }} style={styles.chargeInnerView}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(34), color: "#ffffff" }}>去开通</Text>
                    </TouchableOpacity>
                </View>
            )
        } else {
            sensorsDataClickObject.videoPlay.entrance = '特色指标选股分类名称'
            sensorsDataClickObject.videoPlay.class_type = '指标学习'
            return <TargetSelectStock tabLabel='指标选股' navigation={this.props.navigation} />
            // return  <SpecialNavigator tabLabel='特色指标选股' navigation={this.props.navigation}/>
        }
    }
    /**
     * 特色指标选股跳转去营销页面
     *
     * */
    specialToMarketing() {
        Navigation.navigateForParams(this.props.navigation, "MarketingDetailPage", {
            name: "开通权限",
            permissions: 3,
            type: 'FuFeiYingXiaoYe',
            callBack: () => { this.specialCallBack() }
        })
    }
    /**
     * 特色指标选股跳转营销页面后的回调
     * */
    specialCallBack() {
        //console.log("跳转营销页面后的回调")
    }

    /**
     * 获取价值策略的View，或者去开通的页面
     * */
    getValueView() {
        let permissions = this.state.permissions;
        if (permissions == 1) {
            return (
                <View tabLabel='热点策略' style={styles.chargeViewout}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#626262" }}>您暂无权限查看当前功能</Text>
                    <TouchableOpacity onPress={() => { this.valueToMarketing() }} style={styles.chargeInnerView}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(34), color: "#ffffff" }}>去开通</Text>
                    </TouchableOpacity>
                </View>
            )
        } else {
            // return  <ValueStrategy  tabLabel='价值策略' navigation={this.props.navigation}/>
            return <HotTuyerePages tabLabel='热点策略' navigation={this.props.navigation} />
        }
    }
    /**
     * 价值策略跳转去营销页面
     * */
    valueToMarketing() {
        Navigation.navigateForParams(this.props.navigation, "MarketingDetailPage", {
            name: "开通权限",
            permissions: 3,
            type: 'FuFeiYingXiaoYe',
            callBack: () => { this.valueCallBack() }
        })
    }
    /**
     * 价值策略跳转营销页面后的回调
     * */
    valueCallBack() {

    }

    /**
     * tab改变时的回调
     * */
    tabChangge(selectIndex) {

        if (selectIndex === this.state.selectedTab) {
            return;
        }
        let permissions = UserInfoUtil.getUserPermissions();
        //console.log("切换权限========",permissions);
        //let permissions = 3;
        if (permissions == 0) {
            sensorsDataClickObject.loginButtonClick.entrance = selectIndex == 0 ? '特色指标选股' : '研报策略'
            Navigation.navigateForParams(this.props.navigation, "LoginPage", { callBack: () => { this.loginCallback(selectIndex) } })
            return;
        } else {
            //这里需要每次点击的时候需要判断权限是否有变化，有变化的话需要刷新页面，因为出现了，首页点击重新登录时，权限先变成0，切换到选股tab时，特色指标选股item已经渲染成
            //3星权限页面了，然后在点击特色指标选股的时候，登录权限回来变成了1，这时就会渲染成 1星用户渲染三星页面
            //所以现在修改为，每次切换，会直接去拿最新权限和当前页面权限对比,如果不同，则刷新页面，相同则直接切换
            if (permissions == this.state.permissions) {
                this.sendItemIndex(selectIndex);
                this.myScrollTab.goToPage(selectIndex)
            } else {
                this.setState({
                    permissions: permissions,
                    selectedTab: selectIndex
                }, () => {
                    this.sendItemIndex(selectIndex);
                    this.myScrollTab.goToPage(selectIndex);
                })
            }
        }
        this.state.selectedTab = selectIndex;
        //console.log("change",selectIndex)
        DeviceEventEmitter.emit("XG_TAB_CHANGE", selectIndex);
        // this.sendItemIndex(selectIndex);
        this.saveBuriedPoint(selectIndex);


    }

    saveBuriedPoint(selectIndex) {
        //增加页面埋点统计的记录
        switch (selectIndex) {
            case 0:
                this.sensorsAppear('特色指标选股')
                BuriedpointUtils.setItemByPosition(["xuangu", "tesezhibiaoxuangu"]);
                break;
            case 1:
                // BuriedpointUtils.setItemByPosition(["xuangu","rediancelue"]);
                this.sensorsAppear('研报策略')
                BuriedpointUtils.setItemByPosition(["xuangu", "yanbaocelue"]);
                break;
            // case 2:
            //     BuriedpointUtils.setItemByPosition(["xuangu","yanbaocelue"]);
            //     break;
        }
    }

    sensorsAppear(label) {
        sensorsDataClickObject.adLabel.first_label = label;
        sensorsDataClickObject.adLabel.label_level = 1;
        sensorsDataClickObject.adLabel.label_name = label;
        sensorsDataClickObject.adLabel.page_source = '选股';
        sensorsDataClickObject.adLabel.module_source = '选股';

        if (label === '特色指标选股') {
            sensorsDataClickObject.adLabel.is_pay = '多空决策';
        } else {
            sensorsDataClickObject.adLabel.is_pay = '免费';
        }
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adLabel)


        if (label == '研报策略') {
            sensorsDataClickObject.adModule.entrance = '选股'
            sensorsDataClickObject.adModule.module_type = '选股'
            sensorsDataClickObject.adModule.module_name = label;
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adModule);
        }


    }



    //登录回调
    loginCallback(selectIndex) {
        let permissions = UserInfoUtil.getUserPermissions();
        if (permissions == 0) {
            //未登录,不用做任何操作

        } else if (permissions == 1) {
            //已经登录，但是没有付费
            this.setState({
                permissions: 1,
                selectedTab: selectIndex
            }, () => {
                this.sendItemIndex(selectIndex);
                this.myScrollTab.goToPage(selectIndex);
            })
        } else {
            this.setState({
                permissions: permissions,
                selectedTab: selectIndex
            }, () => {
                this.sendItemIndex(selectIndex);
                this.myScrollTab.goToPage(selectIndex);
            })

        }
        this.saveBuriedPoint(selectIndex);
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this.getIsLoginStatusXg && this.getIsLoginStatusXg.remove();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    textStyle: {
        color: "#333333",
        fontSize: 12,
    },
    selectedTextStyle: {
        color: "black",
        fontSize: 12
    },
    chargeViewout: {
        width: ScreenUtil.screenW,
        marginTop: ScreenUtil.scaleSizeW(344),
        justifyContent: "center",
        alignItems: "center",
    },
    chargeInnerView: {
        width: ScreenUtil.scaleSizeW(300),
        height: ScreenUtil.scaleSizeW(80),
        marginTop: ScreenUtil.scaleSizeW(54),
        justifyContent: "center", alignItems: "center",
        borderRadius: ScreenUtil.scaleSizeW(10),
        backgroundColor: "#f91e00"
    }
});
