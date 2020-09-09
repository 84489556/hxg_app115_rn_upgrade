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
    StyleSheet,
    ScrollView
} from 'react-native';

import  NavigationTitleView from "../../../components/NavigationTitleView";
import * as ScreenUtil from '../../../utils/ScreenUtil';
import  FlowLayoutWrap from "../../../components/FlowLayoutWrap";
import  BaseComponentPage from "../../../pages/BaseComponentPage";
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../../components/SensorsDataTool";

export default class VScreenCondition extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {
            stockRange:["沪深A股","上证A股","深证A股","中小板","创业板","科创板"],//选股范围条件
            haveSt:["是","否",],//是否包含ST股

            rangeSelect:[],//储存选择的选股范围
            haveStSelect:"否",//储存是否ST股

            //这块主要是用来同步一下,已经选择的Index,用于刷新
            rangeSelectIn:[],//储存选择的选股范围Index
            haveStSelectIn:1,//储存是否ST股 //默认index=1


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
        //设置选择数据
        let datas = this.props.navigation.state.params;
        let alreadyOne = [];
        if(datas && datas.rangeSc.length>0){
            for (let i= 0;i<datas.rangeSc.length ;i++){
                alreadyOne.push(datas.rangeSc[i].tabIndex)
            }
        }
        //新增ST股
        let alreadyFour = 1;//默认为1
        if(datas && datas.haveStSc){
            datas.haveStSc =="是" ? alreadyFour = 0 : alreadyFour =1;
        }

        this.setState({
            rangeSelect :datas.rangeSc,
            haveStSelect :datas.haveStSc,

            rangeSelectIn:alreadyOne,
            haveStSelectIn:alreadyFour,
        },()=>{
            //调用方法设置数据
            this.refs.stockRangeFl.setAlreadySelect();1
            this.refs.haveStFl.setAlreadySelect();

        });
       // this.addListeners();
    }
    // addListeners(){
    //     this.willFocusSubscription = this.props.navigation.addListener(
    //         'willFocus',
    //         () => {
    //
    //             console.log("获取焦点+++++++++++++=============外层")
    //
    //         }
    //     );
    //     this.willBlurSubscription = this.props.navigation.addListener(
    //         'willBlur',
    //         () => {
    //             console.log("失去焦点+++++++++++++=============外层")
    //         }
    //     );
    // }

    render() {
        //获取按钮背景色
        let selectStockbg = this.getBgColor();
        return (
            <BaseComponentPage style={styles.container} navigation={this.props.navigation}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"叠加条件"} noDivider={true}/>
                <ScrollView style={{flex:1}}>
                    <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(70),justifyContent:"center",paddingHorizontal:ScreenUtil.scaleSizeW(30)}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000",fontWeight:"bold"}}>选股范围</Text>
                    </View>
                    <FlowLayoutWrap  ref='stockRangeFl' activeIndex={this.state.rangeSelectIn} tagDatas={this.state.stockRange} indexCallBack={(tab,index)=>{}}
                                     isSingleSelect={false} callBackMany={(datas)=>{this.setRanges(datas)}} defaultIndex={0}/>

                    <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(70),justifyContent:"center",paddingHorizontal:ScreenUtil.scaleSizeW(30)}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000",fontWeight:"bold"}}>包含ST股</Text>
                    </View>
                    <FlowLayoutWrap ref='haveStFl' activeIndex={this.state.haveStSelectIn} defaultIndex={1} tagDatas={this.state.haveSt}
                                    indexCallBack={(tab,index)=>{this.setHaveSt(tab)}} isSingleSelect={true} callBackMany={(datas)=>{}}/>

                </ScrollView>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(88),borderTopWidth:ScreenUtil.scaleSizeW(1),borderTopColor:"#DDDDDE",
                    flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                    <TouchableOpacity onPress={()=>{this.clearDatas()}} style={{flexDirection:"row",height:ScreenUtil.scaleSizeW(88),justifyContent:"center",alignItems:"center"}}>
                        <Image style={{width:ScreenUtil.scaleSizeW(30),height:ScreenUtil.scaleSizeW(32),resizeMode:"contain",marginLeft:ScreenUtil.scaleSizeW(30)}} source={require('../../../images/hits/reset_content.png')}/>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:"#333333",marginLeft:ScreenUtil.scaleSizeW(10)}}>恢复默认</Text>
                    </TouchableOpacity>
                    <View style={{flex:1}}/>
                    <TouchableOpacity onPress={()=>{selectStockbg==="#f92400"?this.screenContent():null}} style={{width:ScreenUtil.scaleSizeW(280),height:ScreenUtil.scaleSizeW(88),
                        backgroundColor:selectStockbg,alignItems:"center",justifyContent:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#ffffff"}}>开始选股</Text>
                    </TouchableOpacity>
                </View>
            </BaseComponentPage>
        )
    }
    /**
     * 判断开始选股的背景颜色
     * */
    getBgColor(){

        let selectStockbg ;
        //每次render都判断现在的值和上次筛选的值是否一样，不一样，背景显示红色,完全一样，显示灰色
        if(this.state.rangeSelect.length > 0){
            let rangeArr = [];
            for (let i= 0;i<this.state.rangeSelect.length;i++){
                rangeArr.push(this.state.rangeSelect[i].tabIndex)
            }
            if(rangeArr.toString() === this.state.rangeSelectIn.toString()){
                selectStockbg = "#9a9a9a";
            }else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        }else {
            if(this.state.rangeSelectIn.length===0){
                selectStockbg = "#9a9a9a";
            }else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        }
        if(this.state.haveStSelectIn === 1 && this.state.haveStSelect==="否"){
            selectStockbg = "#9a9a9a";
        }else if(this.state.haveStSelectIn === 0 && this.state.haveStSelect==="是"){
            selectStockbg = "#9a9a9a";
        }else {
            selectStockbg = "#f92400";
            //如果有一个选项不相同,则就return,表示有改动
            return selectStockbg;
        }

        //最后再return 背景色
        return selectStockbg;

    }

    /**
     * 设置选择的范围
     * */
    setRanges(datas){
        this.setState({
            rangeSelect:datas
        })
    }
    /**
     * 设置包含ST
     * */
    setHaveSt(datas){
        this.setState({
            haveStSelect:datas
        })
    }
    /**
     * 清除所有选择的数据
     * */
    clearDatas(){
        this.setState({rangeSelect:[{tabName: "沪深A股", tabIndex: 0}],haveStSelect:"否"},
            ()=>{
                //调用方法清除数据
                this.refs.stockRangeFl.clearSelcetDatas();
                this.refs.haveStFl.clearSelcetDatas();
            })
    }

    /**
     * 回调筛选
     * */
    screenContent(){
        if(this.props.navigation.state.params.selectCall){
            this.props.navigation.state.params.selectCall(this.state.rangeSelect,this.state.specialSelect,this.state.valueSelect,this.state.haveStSelect);

            this.sensorsAppear(this.state.rangeSelect,this.state.specialSelect,this.state.valueSelect,this.state.haveStSelect)

            //返回
            Navigation.pop(this.props.navigation);
        }

    }


    sensorsAppear(rang, special, value,have){


        this.appear('叠加价值策略',value);
        this.appear('叠加特色指标',special);
        this.appear('叠加范围条件',rang);

        sensorsDataClickObject.choiceCondition.condition_type='叠加包含ST股';
        sensorsDataClickObject.choiceCondition.condition_content = have;
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.choiceCondition);

    }



    appear(type,content){
        let contentValue = [];
        if (content){
            for (let i = 0; i < content.length; i++) {
                contentValue.push(content[i].tabName)
            }
            sensorsDataClickObject.choiceCondition.condition_type=type;
            sensorsDataClickObject.choiceCondition.condition_content = contentValue;
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.choiceCondition,'',false);
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
        flex:1
    }
});
