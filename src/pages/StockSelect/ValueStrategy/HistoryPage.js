/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/21 17
 * description:价值策略详情页面跳转的历史战绩页面
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet
} from 'react-native';

import  BaseComponentPage from "../../../pages/BaseComponentPage";
import  NavigationTitleView from "../../../components/NavigationTitleView";
import * as ScreenUtil from "../../../utils/ScreenUtil";
import {mNormalFooter} from "../../../components/mNormalFooter";
import { mNormalHeader } from "../../../components/mNormalHeader";
import { StickyForm } from "react-native-largelist-v3";
import HitsApi from "../../Hits/Api/HitsApi";
import RequestInterface from "../../../actions/RequestInterface";

import  StockFormatText from '../../../components/StockFormatText';
import * as baseStyle from "../../../components/baseStyle";

export default class HistoryPage extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {
            keyWord: this.props.navigation.state.params.wordKeys ? this.props.navigation.state.params.wordKeys :"",//上个页面传递的页面关键词
            data:[
                {
                    sectionTitle: "",
                    items: []
                }
            ],//表格数据
            titles: [
                {conName:"区间最高涨幅",conCode:1},
                {conName:"区间最大振幅",conCode:0},
                {conName:"入选时间",conCode:0},
            ],
            allLoaded :true,//没有更多数据了，本页默认为到底了,
            startDate:"",//起始时间
            endDate:"",//结束时间

        };
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(120);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        this.Page = 1; //页码
        this.PageSize = 20;//每页数量

        this.isRequest = false;//设置一个值,防止快速点击
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
        this.getHistory();
    }
    /**
     * 获取当前策略历史战绩
     * */
    getHistory(callBack){
        if(this.Page === 1){
            //清空数据，重置排序条件
            this.state.data[0].items = [];
        }
        let URI = "";
        if(this.state.keyWord == "高成长"){
            URI = HitsApi.VALUE_HISTORY_LIST;
        }else if(this.state.keyWord == "低估值"){
            URI = HitsApi.LOW_HISTORY_LIST;
        }else if(this.state.keyWord == "股东增持"){
            URI = HitsApi.BUY_HISTORY_LIST;
        }else if(this.state.keyWord == "白马绩优"){
            URI = HitsApi.WHITE_HISTORY_LIST;
        }else if(this.state.keyWord == "高分红"){
            URI = HitsApi.RED_HISTORY_LIST;
        }else if(this.state.keyWord == "高盈利"){
            URI = HitsApi.HIGH_HISTORY_LIST;
        }else if(this.state.keyWord == "高送转"){
            URI = HitsApi.HIGH_SONGZHUAN_LIST;
        }else if(this.state.keyWord == "业绩预增"){
            URI = HitsApi.YJYZ_LIST;
        }
        //传的参数
        let params = {};

        //根据排序条件传值
        if(this.state.titles[0].conCode!==0){
            params.sort="zhangfu";
            if(this.state.titles[0].conCode===1){
                params.sortOrder="desc";
            }else {
                params.sortOrder="asc";
            }
        }else if(this.state.titles[1].conCode!==0){
            params.sort="zhenfu";
            if(this.state.titles[1].conCode===1){
                params.sortOrder="desc";
            }else {
                params.sortOrder="asc";
            }
        }else {
            params.sort="createDate";
            if(this.state.titles[2].conCode===1){
                params.sortOrder="desc";
            }else {
                params.sortOrder="asc";
            }
        }
        params.page= this.Page;
        params.pageSize= this.PageSize;
        this.isRequest = true;
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL,URI,params,
            (response)=>{
                this.isRequest = false;
                this._list.endRefresh();
                if(response && response.length>0 && this.Page<=10){
                    //console.log("内层数据",response);

                    for (let i =0;i<response.length;i++){
                        let newItem = {};
                        //储存第一列需要的数据
                        let titles = {};
                        titles.id = response[i].id;
                        titles.secName = response[i].secName;
                        titles.marketCode = response[i].marketCode;
                        newItem.title=titles;

                        //数据项，一定要按照数据添加
                        let dataItem=[];
                        dataItem.push(response[i].zhangfu!=0 ? Number(response[i].zhangfu):'- -');
                        dataItem.push(response[i].zhenfu!=0 ? Number(response[i].zhenfu):'- -');
                        dataItem.push(response[i].createDate ? response[i].createDate:'- -');
                        newItem.data=dataItem;

                        this.state.data[0].items.push(newItem);

                    }
                    this.Page++;
                    this.setState({
                        data:this.state.data,
                        allLoaded:response.length < this.PageSize ? true:false,
                        titles:this.state.titles
                    },()=>{
                        if(callBack){callBack();}
                    });

                }else {
                    this.setState({
                        data:this.state.data,
                        allLoaded:true,
                        titles:this.state.titles
                    },()=>{
                        if(callBack){callBack();}
                    });
                }
            },(error)=>{
                this.isRequest = false;
                this.setState({
                    data:this.state.data,
                    allLoaded:true,
                    titles:this.state.titles
                },()=>{
                    if(callBack){callBack();}
                });
            })
    }

    render() {
        return (
            <BaseComponentPage style={styles.containers}>
                <NavigationTitleView navigation={this.props.navigation}
                                     titleView={
                                         <View style={{justifyContent:"center",alignItems:"center"}}>
                                             <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000"}}>{'历史表现'}</Text>
                                             <Text style={{fontSize:ScreenUtil.setSpText(24),color:baseStyle.BLACK_99,marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(5):0}}>{'最近20个交易日'}</Text>
                                         </View>
                                     }
                />

                <StickyForm
                    bounces={true}
                    style={{ backgroundColor: "#f6f6f6",flex:1}}
                    contentStyle={{ alignItems: "flex-start", width: "100%" }}
                    data={this.state.data}
                    scrollEnabled={true}
                    ref={ref => (this._list = ref)}
                    heightForSection={() =>this.HEADER_HEGHT}
                    //renderHeader={this._renderunLockHeader}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => this.ITEM_HEGHT}
                    renderIndexPath={this._renderItem}
                    onRefresh={() => {
                        this.Page = 1;
                        this.getHistory(()=>{
                            this._list.endRefresh();
                        });}}
                    loadingFooter={mNormalFooter}
                    refreshHeader={mNormalHeader}
                    allLoaded={this.state.allLoaded}
                    showsHorizontalScrollIndicator={false}
                    onLoading={() => {
                        this.getHistory(()=>{
                            this._list.endLoading();
                        });
                    }}
                    headerStickyEnabled={false}
                    onScroll={({nativeEvent:{contentOffset:{x, y}}})=>{}}
                />

            </BaseComponentPage>
        )
    }

    /**
     * SectionTitle
     * {conName:"变动人",conCode:-1}
     * */
    _renderSection = (section: number) => {
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row" }}>
                    <View style={[styles.textTitle,{backgroundColor:"#f2faff",flexDirection: "row"}]}>
                        <Text style={styles.hinnerText}>股票名称</Text>
                    </View>

                {this.state.titles.map((title, index) =>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.sortViewPress(index,title.conCode)}} style={index===2?styles.headerFixText:styles.headerText} key={index}>
                        <Text style={styles.hinnerText}>
                            {title.conName}
                        </Text>
                        {this.getSortView(title.conCode) }
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    /**
     * 顶部view的点击事件
     * */
    sortViewPress(index,conCode){
            if(this.isRequest === true){
                return;
            }
            this.Page= 1;
            if(index === 0){
                //其余排序条件为0
                this.state.titles[1].conCode = 0;
                this.state.titles[2].conCode = 0;
                //涨幅排序
            }else if(index === 1){
                //其余排序条件为0
                this.state.titles[0].conCode = 0;
                this.state.titles[2].conCode = 0;
            }else {
                //其余排序条件为0
                this.state.titles[0].conCode = 0;
                this.state.titles[1].conCode = 0;
            }
        //这个列表只有titles 0,1
        if(conCode===0){
            this.state.titles[index].conCode= 1;
        }else if(conCode===1){
            this.state.titles[index].conCode= 2;
        }else if(conCode===2){
            this.state.titles[index].conCode= 1;
        }
        this.setState({
            titles:this.state.titles,
        },()=>{
            this.getHistory();
        })
    }


    /**
     * 获取标题
     * 后面排序的View
     * -1没有排序，0默认状态，1为降序，2为升序
     * */
    getSortView(conCode){
        let sortView ;
        switch (conCode){
            case -1:
                sortView = null;
                break;
            case 0:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/defaultt.png')}/>;
                break;
            case 1:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/positive.png')}/>;
                break;
            case 2:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/negative.png')}/>;
                break;
            default:
                sortView = null;
                break;
        }
        return sortView;
    }
    /**
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={()=>{
                let data ={};
                data.Obj = item.title.marketCode;
                data.ZhongWenJianCheng = item.title.secName;
                data.obj = item.title.marketCode;
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: [],
                    index: 0,
                })
               
            }} style={styles.row}>
                <View style={styles.titleText}>
                    <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:"#333333"}}>{item.title.secName}</Text>
                    <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"#666666"}}>{item.title.marketCode}</Text>
                </View>
                {item.data.map((title, index) => this.getItemViewType(title, index))}
            </TouchableOpacity>
        );
    };
    /**
     * 获取不同样式的View
     * */
    getItemViewType(title, index){
        let Views ;
        //注意每个表格的设置不一样
       //正红绿负灰平
        let colors= "";
        let bgColor = "";
       // let content = title;
        if(title>0){
            colors=  "#fa5033";
           // content ="+"+title;
            bgColor="#fff5f2"
        }else if(title<0){
            colors=  "#5cac33";
            bgColor="#f4faf2"
        }else {
            colors=  "#999999";
            bgColor="white"
        }
        switch (index) {
            case 0:
            case 1:
                Views = <View style={[styles.text,{backgroundColor:bgColor}]} key={index}>
                            <StockFormatText precision={2} unit={"%"} useDefault={true} sign={true} style={[styles.contentText,{color:colors}]}>{title/100}</StockFormatText>
                        </View>;
                break;
            case 2:
                Views = <View key={title} style={{width:ScreenUtil.scaleSizeW(120),borderRadius:ScreenUtil.scaleSizeW(10),marginLeft:ScreenUtil.scaleSizeW(10),marginRight:ScreenUtil.scaleSizeW(15)
                        ,backgroundColor:"#f5faff",paddingLeft:ScreenUtil.scaleSizeW(10),justifyContent:"center",marginVertical:ScreenUtil.scaleSizeW(20)}}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(26),color:"#003366"}}>{title.length>=10 ?title.substring(0,4):"- -"}</Text>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:"#6282a3"}}>{title.length>=10 ?title.substring(5,10):"- -"}</Text>
                    </View>;
                break;
            default:
                Views =  <View/>;
                break;
        }
        return Views;
    };
    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    containers: {
        flex:1
    },
    container: {
        width:ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(60),
        backgroundColor:"white",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center"
    },
    onetext:{
        fontSize:12,
        color:"#9d9d9d",
        marginLeft:ScreenUtil.scaleSizeW(30)
    },
    rightText:{
        fontSize:12,
        color:"#9d9d9d",
        marginRight:ScreenUtil.scaleSizeW(30)
    },
    //表格需要的样式
    text: {
        flex: 1,
        justifyContent: "center",
        alignItems:"center",
        marginHorizontal:ScreenUtil.scaleSizeW(7),
        marginVertical:ScreenUtil.scaleSizeW(20),
        borderRadius:ScreenUtil.scaleSizeW(10),
    },
    hinnerText:{
        fontSize:ScreenUtil.setSpText(24),
        color:"#626567"
    },
    titleText: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:"#f4faff",
        width:ScreenUtil.scaleSizeW(150),
        marginHorizontal:ScreenUtil.scaleSizeW(15),
        marginVertical:ScreenUtil.scaleSizeW(18),
        borderRadius:ScreenUtil.scaleSizeW(10),
        //paddingLeft:ScreenUtil.scaleSizeW(30)
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        justifyContent:"center",
        backgroundColor: "#f2faff",
        flexDirection:"row",
        //paddingLeft:ScreenUtil.scaleSizeW(30)
    },
    headerFixText: {
       // flex: 1,
        width:ScreenUtil.scaleSizeW(150),
        alignItems: "center",
        justifyContent:"center",
        backgroundColor: "#f2faff",
        flexDirection:"row",
        //paddingLeft:ScreenUtil.scaleSizeW(30)
    },

    row: {
        flex: 1,
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor:"white"
    },
    contentText:{
        fontSize:ScreenUtil.setSpText(32),
        color:"#333333",
    },
    textTitle: {
        justifyContent: "center",
        alignItems: "center",
        height:35,
        width:ScreenUtil.scaleSizeW(180),
        //paddingLeft:ScreenUtil.scaleSizeW(30)
    },
    sortView:{
        width:ScreenUtil.scaleSizeW(12),
        height:ScreenUtil.scaleSizeW(24),
        resizeMode:"contain",
        marginLeft:ScreenUtil.scaleSizeW(6)
    },
    },
);
