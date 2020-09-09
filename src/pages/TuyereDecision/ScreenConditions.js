/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/7 17
 * description:主题策略和热点策略公用的特色指标叠加页面
 *              只有固定的6个特色指标
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,ScrollView
} from 'react-native';

import  NavigationTitleView from "../../components/NavigationTitleView";
import * as ScreenUtil from '../../utils/ScreenUtil';
import  FlowLayoutWrapTag from "../../components/FlowLayoutWrapTag";
import  BaseComponentPage from "../../pages/BaseComponentPage";
import LinearGradient from 'react-native-linear-gradient';
import Yd_cloud from "../../wilddog/Yd_cloud";

let refMain = Yd_cloud().ref(MainPathYG);
let refSelectRange= refMain.ref('ReDianFengKou/ReDianFengKouNew');
//let refSelectRange= refMain.ref('ReDianFengKou/ReDianFengKouFanWei');
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../components/SensorsDataTool";

export default class VScreenCondition extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {
            special:["放量上攻","趋势共振","震荡突破","探底回升","趋势反转","背离反弹"],//特色指标
            specialSelect:[],//储存选择的特色指标
            //这块主要是用来同步一下,已经选择的Index,用于刷新
            specialSelectIn:[],//储存选择的特色指标Index
            rangeSelect:"",//热点策略的选股范围，主题策略没有
        };
        //title
        this.pageFrom = this.props.navigation.state.params.title ? this.props.navigation.state.params.title :"";

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
        let alreadyTwo = [];
        if(datas && datas.setData.length>0){
            for (let i= 0;i<datas.setData.length ;i++){
                alreadyTwo.push(datas.setData[i].tabIndex)
            }
        }
        this.setState({
            specialSelect:datas.setData,
            specialSelectIn:alreadyTwo,
        },()=>{
            //调用方法清除数据
            this.refs.specialFl.setAlreadySelect();

        });
        if(this.pageFrom==="热点策略叠加条件"){
            this.getHotContent();
        }
    }
    /**
     * 获取热点策略的选股范围,主题策略不获取
     * */
    getHotContent(){
        refSelectRange.get((snapshot)=> {
            if(snapshot.nodeContent){
               //this.setState({rangeSelect:snapshot.nodeContent+""})
                //这是另外一个节点的拼接的逻辑
                let values = Object.values(snapshot.nodeContent);
                let rangeString = "";
                if(values.length>0){
                    for (let i = 0;i<values.length;i++){
                        rangeString += values[i]+","
                    }
                    rangeString = rangeString.substring(0,rangeString.length-1);
                }
                this.setState({rangeSelect:rangeString})
            }
        });
    }

    render() {
        //获取按钮背景色
        let selectStockbg = this.getBgColor();

        return (
            <BaseComponentPage style={styles.container}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"叠加条件"} />
                <ScrollView style={{flex:1}}>
                    {this.pageFrom==="热点策略叠加条件" ?
                        <View style={{width:ScreenUtil.screenW,paddingHorizontal:ScreenUtil.scaleSizeW(30),backgroundColor:"#f6f6f6",alignItems:"center",flexDirection:"row"
                        ,paddingVertical:ScreenUtil.scaleSizeW(20)}}>
                            <View style={{width:ScreenUtil.scaleSizeW(118)}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.4)"}}>选股范围:</Text>
                                <View style={{flex:1}}/>
                            </View>
                            <View style={{flex:1}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.4)"}}>{this.state.rangeSelect}</Text>
                            </View>
                        </View>
                        : null}

                    <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(70),alignItems:"center",paddingHorizontal:ScreenUtil.scaleSizeW(30),flexDirection:"row"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000",fontWeight:"bold"}}>特色指标</Text>

                        <LinearGradient
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            colors={['#FF3333', '#FF66CC']}
                           // ref={ref => this.navBar = ref}
                            style={{width:ScreenUtil.scaleSizeW(88),height:ScreenUtil.scaleSizeW(30),marginLeft:ScreenUtil.scaleSizeW(10),
                                borderRadius:ScreenUtil.scaleSizeW(30),justifyContent:"center",alignItems:"center"}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(22),color:"#fff"}}>单选</Text>
                        </LinearGradient>
                    </View>
                    <FlowLayoutWrapTag ref='specialFl' activeIndex={this.state.specialSelectIn}  tagDatas={this.state.special}
                                       indexCallBack={(tab,index)=>{this.setSpecials(tab,index)}} isSingleSelect={true} callBackMany={(datas)=>{}}
                                       defaultIndex={0}
                    />
                </ScrollView>

                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(88),borderTopWidth:ScreenUtil.scaleSizeW(1),borderTopColor:"#DDDDDE",
                            flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                    <TouchableOpacity onPress={()=>{this.clearDatas()}} style={{flexDirection:"row",height:ScreenUtil.scaleSizeW(88),justifyContent:"center",alignItems:"center"}}>
                    <Image style={{width:ScreenUtil.scaleSizeW(30),height:ScreenUtil.scaleSizeW(32),resizeMode:"contain",marginLeft:ScreenUtil.scaleSizeW(30)}} source={require('../../images/hits/reset_content.png')}/>
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

        if(this.state.specialSelect.length > 0){
            let rangeArr = [];
            for (let i= 0;i<this.state.specialSelect.length;i++){
                rangeArr.push(this.state.specialSelect[i].tabIndex)
            }
            if(rangeArr.toString() === this.state.specialSelectIn.toString()){
                selectStockbg = "#9a9a9a";
            }else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        }else {
            if(this.state.specialSelectIn.length===0){
                selectStockbg = "#9a9a9a";
            }else {
                selectStockbg = "#f92400";
                //如果有一个选项不相同,则就return,表示有改动
                return selectStockbg;
            }
        }
        //最后再return 背景色
        return selectStockbg;

    }

    /**
     * 特色指标的选择范围
     * */
    setSpecials(tab,index){
        //console.log("特色指标选股回调",datas);
        let datas=[];
        datas.push({
            tabName:tab,
            tabIndex:index
        });
        this.setState({
            specialSelect:datas
        })
    }

    /**
     * 清除所有选择的数据
     * */
    clearDatas(){
        this.setState({ specialSelect:[{tabName:"放量上攻",tabIndex:0}]},
            ()=>{
            //调用方法清除数据
            this.refs.specialFl.clearSelcetDatas();
        })
    }

    /**
     * 回调筛选
     * */
    screenContent(){
        if(this.props.navigation.state.params.selectCall){
            this.props.navigation.state.params.selectCall(this.state.specialSelect);
            // 返回
            Navigation.pop(this.props.navigation);
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
