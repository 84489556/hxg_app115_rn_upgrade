/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/7 17
 * description:选择叠加条件页面
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    ImageBackground,
    StatusBar,
    InteractionManager, StyleSheet, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NavigationTitleView from "../../../components/NavigationTitleView";
import * as ScreenUtil from '../../../utils/ScreenUtil';
import FlowLayoutWrap from "../../../components/FlowLayoutWrap";
import FlowLayoutWrapTag from "../../../components/FlowLayoutWrapTag";
import BaseComponentPage from "../../../pages/BaseComponentPage";
import LinearGradient from 'react-native-linear-gradient';
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../../components/SensorsDataTool";
//import ShareView, { ShareType } from '../../../components/ShareView';

export default class VScreenCondition extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {
            stockRange: ["沪深A股", "上证A股", "深证A股", "中小板", "创业板", "科创板"],//选股范围条件

            special: ["放量上攻", "趋势共振", "震荡突破", "探底回升", "趋势反转", "背离反弹"],//特色指标

            valueStrategy: ["高成长", "高盈利", "高分红", "高送转", "低估值", "股东增持", "白马绩优", "业绩预增"],//价值策略

            rangeSelect: [],//储存选择的选股范围
            specialSelect: [],//储存选择的特色指标
            valueSelect: [],//储存选择的价值策略

            //这块主要是用来同步一下,已经选择的Index,用于刷新
            rangeSelectIn: [],//储存选择的选股范围Index
            specialSelectIn: [],//储存选择的特色指标Index
            valueSelectIn: [],//储存选择的价值策略Index

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
        // rangeSc:this.state.rangeSc,//选股范围数据 {tabName: "上证A股", tabIndex: 1}
        //     specialSc:this.state.specialSc,//特色指标数据
        //     valueSc:this.state.valueSc,//价值策略
        //设置选择数据
        let datas = this.props.navigation.state.params;
        let alreadyOne = [];
        if (datas && datas.rangeSc.length > 0) {
            for (let i = 0; i < datas.rangeSc.length; i++) {
                alreadyOne.push(datas.rangeSc[i].tabIndex)
            }
        }

        let alreadyTwo = [];
        if (datas && datas.specialSc.length > 0) {
            for (let i = 0; i < datas.specialSc.length; i++) {
                alreadyTwo.push(datas.specialSc[i].tabIndex)
            }
        }
        let alreadyThree = [];
        if (datas && datas.valueSc.length > 0) {
            for (let i = 0; i < datas.valueSc.length; i++) {
                alreadyThree.push(datas.valueSc[i].tabIndex)
            }
        }
        this.setState({
            rangeSelect: datas.rangeSc,
            specialSelect: datas.specialSc,
            valueSelect: datas.valueSc,

            rangeSelectIn: alreadyOne,
            specialSelectIn: alreadyTwo,
            valueSelectIn: alreadyThree,
        }, () => {
            //调用方法清除数据
            this.refs.stockRangeFl.setAlreadySelect();
            this.refs.specialFl.setAlreadySelect();
            this.refs.valueStrategyFl.setAlreadySelect();

        })


    }

    render() {
        //获取按钮背景色
        let selectStockbg = this.getBgColor();

        return (
            <BaseComponentPage style={styles.container}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"叠加条件"} />
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(70), justifyContent: "center", paddingHorizontal: ScreenUtil.scaleSizeW(30) }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000", fontWeight: "bold" }}>选股范围</Text>
                    </View>
                    <FlowLayoutWrap ref='stockRangeFl' activeIndex={this.state.rangeSelectIn} tagDatas={this.state.stockRange}
                        indexCallBack={(tab, index) => { }} isSingleSelect={false} callBackMany={(datas) => { this.setRanges(datas) }}
                        defaultIndex={0}
                    />
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(70), alignItems: "center", paddingHorizontal: ScreenUtil.scaleSizeW(30), flexDirection: "row" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000", fontWeight: "bold" }}>特色指标</Text>

                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            colors={['#FF3333', '#FF66CC']}
                            ref={ref => this.navBar = ref}
                            style={{
                                width: ScreenUtil.scaleSizeW(88), height: ScreenUtil.scaleSizeW(30), marginLeft: ScreenUtil.scaleSizeW(10),
                                borderRadius: ScreenUtil.scaleSizeW(30), justifyContent: "center", alignItems: "center"
                            }}>
                            <Text style={{ fontSize: ScreenUtil.setSpText(22), color: "#fff" }}>单选</Text>
                        </LinearGradient>
                    </View>
                    <FlowLayoutWrapTag ref='specialFl' activeIndex={this.state.specialSelectIn} tagDatas={this.state.special}
                        indexCallBack={(tab, index) => { this.setSpecials(tab, index) }} isSingleSelect={true} callBackMany={(datas) => { }}
                        defaultIndex={0}
                    />

                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(70), justifyContent: "center", paddingHorizontal: ScreenUtil.scaleSizeW(30) }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000", fontWeight: "bold" }}>价值策略</Text>
                    </View>

                    <FlowLayoutWrap ref='valueStrategyFl' activeIndex={this.state.valueSelectIn} tagDatas={this.state.valueStrategy}
                        indexCallBack={(tab, index) => { }} isSingleSelect={false} callBackMany={(datas) => { this.setValues(datas) }}
                        noCancle={this.props.navigation.state.params.keyWord + ""}
                    />
                </ScrollView>
                <View style={{
                    width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(88), borderTopWidth: ScreenUtil.scaleSizeW(1), borderTopColor: "#DDDDDE",
                    flexDirection: "row", alignItems: "center", justifyContent: "center"
                }}>
                    <TouchableOpacity onPress={() => { this.clearDatas() }} style={{ flexDirection: "row", height: ScreenUtil.scaleSizeW(88), justifyContent: "center", alignItems: "center" }}>
                        <Image style={{ width: ScreenUtil.scaleSizeW(30), height: ScreenUtil.scaleSizeW(32), resizeMode: "contain", marginLeft: ScreenUtil.scaleSizeW(30) }} source={require('../../../images/hits/reset_content.png')} />
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#333333", marginLeft: ScreenUtil.scaleSizeW(10) }}>恢复默认</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => { selectStockbg === "#f92400" ? this.screenContent() : null }} style={{
                        width: ScreenUtil.scaleSizeW(280), height: ScreenUtil.scaleSizeW(88),
                        backgroundColor: selectStockbg, alignItems: "center", justifyContent: "center"
                    }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#ffffff" }}>开始选股</Text>
                    </TouchableOpacity>
                </View>

            </BaseComponentPage>
        )
    }
    /**
     * 判断开始选股的背景颜色
     * */
    getBgColor() {

        let selectStockbg;
        //每次render都判断现在的值和上次筛选的值是否一样，不一样，背景显示红色,完全一样，显示灰色
        if (this.state.rangeSelect.length > 0) {
            let rangeArr = [];
            for (let i = 0; i < this.state.rangeSelect.length; i++) {
                rangeArr.push(this.state.rangeSelect[i].tabIndex)
            }
            if (rangeArr.toString() === this.state.rangeSelectIn.toString()) {
                selectStockbg = "#9a9a9a";
            } else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        } else {
            if (this.state.rangeSelectIn.length === 0) {
                selectStockbg = "#9a9a9a";
            } else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        }

        if (this.state.specialSelect.length > 0) {
            let rangeArr = [];
            for (let i = 0; i < this.state.specialSelect.length; i++) {
                rangeArr.push(this.state.specialSelect[i].tabIndex)
            }
            if (rangeArr.toString() === this.state.specialSelectIn.toString()) {
                selectStockbg = "#9a9a9a";
            } else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        } else {
            if (this.state.specialSelectIn.length === 0) {
                selectStockbg = "#9a9a9a";
            } else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        }
        if (this.state.valueSelect.length > 0) {
            let rangeArr = [];
            for (let i = 0; i < this.state.valueSelect.length; i++) {
                rangeArr.push(this.state.valueSelect[i].tabIndex)
            }
            if (rangeArr.toString() === this.state.valueSelectIn.toString()) {
                selectStockbg = "#9a9a9a";
            } else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        } else {
            if (this.state.valueSelectIn.length === 0) {
                selectStockbg = "#9a9a9a";
            } else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        }

        //最后再return 背景色
        return selectStockbg;

    }

    /**
     * 分享测试
     * */
    shareViews() {
        this.shareView.show();
    }

    /**
     * 设置选择的范围
     * */
    setRanges(datas) {
        this.setState({
            rangeSelect: datas
        })
    }
    /**
     * 特色指标的选择范围
     * */
    setSpecials(tab, index) {
        //console.log("特色指标选股回调",datas);
        let datas = [];
        datas.push({
            tabName: tab,
            tabIndex: index
        });
        this.setState({
            specialSelect: datas
        })
    }
    /**
     * 特色指标的选择范围
     * */
    setValues(datas) {
        this.setState({
            valueSelect: datas
        })
    }

    /**
     * 清除所有选择的数据
     * */
    clearDatas() {
        let tabsName = this.props.navigation.state.params.keyWord;
        let tabsIndex;
        switch (tabsName) {
            case "高成长":
                tabsIndex = 0;
                break;
            case "高盈利":
                tabsIndex = 1;
                break;
            case "高分红":
                tabsIndex = 2;
                break;
            case "高转送":
                tabsIndex = 3;
                break;
            case "低估值":
                tabsIndex = 4;
                break;
            case "股东增持":
                tabsIndex = 5;
                break;
            case "白马绩优":
                tabsIndex = 6;
                break;
            case "业绩预增":
                tabsIndex = 7;
                break;
            default:
                tabsIndex = 0;
                break;

        }

        this.setState({ rangeSelect: [{ tabName: "沪深A股", tabIndex: 0 }], specialSelect: [{ tabName: "放量上攻", tabIndex: 0 }], valueSelect: [{ tabName: tabsName, tabIndex: tabsIndex }] },
            () => {
                //调用方法清除数据
                this.refs.stockRangeFl.clearSelcetDatas();
                this.refs.specialFl.clearSelcetDatas();
                this.refs.valueStrategyFl.clearSelcetDatas();
            })
    }

    /**
     * 回调筛选
     * */
    screenContent() {
        if (this.props.navigation.state.params.selectCall) {
            this.props.navigation.state.params.selectCall(this.state.rangeSelect, this.state.specialSelect, this.state.valueSelect);

            this.sensorsAppear(this.state.rangeSelect, this.state.specialSelect, this.state.valueSelect);

            //返回
            Navigation.pop(this.props.navigation);
        }
    }
    sensorsAppear(rang, special, value) {
        this.appear('叠加价值策略', value);
        this.appear('叠加特色指标', special);
        this.appear('叠加范围条件', rang);
    }


    appear(type, content) {
        let contentValue = [];
        if (content) {
            for (let i = 0; i < content.length; i++) {
                contentValue.push(content[i].tabName)
            }
            sensorsDataClickObject.choiceCondition.condition_type = type;
            sensorsDataClickObject.choiceCondition.condition_content = contentValue;
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.choiceCondition, '', false);
        }
    }



    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
