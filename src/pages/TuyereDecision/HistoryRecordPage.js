/**
 * Created by cuiwenjuan on 2019/8/20.
 */
import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,Platform
} from 'react-native';

//var {height, width} = Dimensions.get('window');
import {commonUtil,toast} from '../../utils/CommonUtils'
import * as  baseStyle from '../../components/baseStyle'
import { StickyForm } from "react-native-largelist-v3";
import RequestInterface from '../../actions/RequestInterface'
import BaseComponentPage from '../../pages/BaseComponentPage'
import PageHeader from '../../components/NavigationTitleView'
import StockFormatText from '../../components/StockFormatText'
import NoDataPage from '../NoDataPage'
import {mNormalFooter} from "../../components/mNormalFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
import * as ScreenUtil from "../../utils/ScreenUtil";


export const historyType = {
    hotOne:'/celuexuanguRes20/reDianFengKouOneRes20',
    hotTwo:'/celuexuanguRes20/reDianFengKouTwoRes20',
    hotStock:'/celuexuanguRes20/reDianFengKouThreeRes20',
    mainOne:'/celuexuanguRes20/zhuTiTouZiOneRes20',
    mainTwo:'/celuexuanguRes20/zhuTiTouZiTwoRes20',
    mainStock:'/celuexuanguRes20/zhuTiTouZiThreeRes20',
    zijinHistory:'/celuexuanguRes20/ziJinJieMiRes20',
    longHuZiJin:'/celuexuanguRes20/longHuZiJinRes20',
    gaoGuanZiJin:'/celuexuanguRes20/gaoGuanZiJinRes20',
    zhuLiZiJin:'/celuexuanguRes20/zhuLiZiJinRes20',
}

let widthTitleCell = ScreenUtil.scaleSizeW(190);
let timeItemDWidth = ScreenUtil.scaleSizeW(120);
let timeItemMWidth = ScreenUtil.scaleSizeW(180);
//let widthCell = (commonUtil.width - 100 - 15)/2;

export default class HistoryRecordPage extends BaseComponentPage {
    // 股票名称（股票代码）、涨跌幅、现价、所属板块、换手率、市盈率

    constructor(props) {
        super(props);
        this.state = {
            stockArray:[],
            sortDown: true,//正倒序
            sortButtonIndex:0,//点击的是第几个排序字段
            titles: [
                {title:"区间最高涨幅",isSort:1},
                {title:"区间最大振幅",isSort:1},
                {title:"入选时间",isSort:1},
            ],
            allLoaded:true,
        };
        this.Page = 1;//页数
        this.PageSize = 20;//每个页个数

        this.postPath =  this.props.navigation.state.params &&
            this.props.navigation.state.params.type && this.props.navigation.state.params.type;
        this.title = this.props.navigation.state.params &&
            this.props.navigation.state.params.title && this.props.navigation.state.params.title;
        this.isRequest = false;//设置一个值,防止快速点击

        this.timeLength = 10;
        this.timeItemWidth = timeItemDWidth;
    }

    componentWillMount() {
        this._getStockMessage();
        this._createTimer();
        this._getTimeType(this.postPath);
    }

    componentWillUnmount() {
        this._removeTimer();
    }


    _getTimeType(type){

        this._console('历史表现类型'+type);
        if(type === historyType.zijinHistory || type === historyType.longHuZiJin){
            this.timeLength = 16;
            this.timeItemWidth = timeItemMWidth;
        }

    }

    _createTimer(){
        if(!this.timer){
            this.timer =  setInterval(() => {
                this.Page = 1;
                this._getStockMessage();
            },1000 * 5 * 60);
        }
    }

    _removeTimer(){
        this.timer && clearInterval(this.timer);
        this.timer = undefined;
    }


    _getStockMessage(callBack){

        if(this.Page === 1){
            this.state.stockArray = [];
        }
        let path = this.postPath;
        let param = {};

        //zhangfu 或者 zhenfu,这是排序字段,现在只有0,1两个位置的排序
        if(this.state.sortButtonIndex===0){
            param.sort = "zhangfu";
        }else if(this.state.sortButtonIndex===1){
            param.sort = "zhenfu";
        }else {
            param.sort = "createDate";
            // param.sort = "currentDates";
        }
        //正倒序
        if(this.state.sortDown===true){
            param.sortOrder = "desc";
        }else {
            param.sortOrder = "asc";
        }

        param.page = this.Page;
        param.pageSize = this.PageSize;

        this.isRequest = true;
        RequestInterface.basePost(RequestInterface.XG_MODULE_URL,path,param,(response) => {
            // this._console('历史战绩 == '+JSON.stringify(response));
            this.isRequest = false;
            this._list.endRefresh();
            //这个逻辑在小崔的基础上改
            if(this.state.stockArray.length >0 && this.state.stockArray[0].items && response.length > 0 && this.Page<=10){

                for (let i = 0;i< response.length;i++){
                    this.state.stockArray[0].items.push(response[i])
                }

            }else {
                if(this.Page===1){
                    let message = {};
                    message.items = response;
                    this.state.stockArray.push(message);
                }

            }
            //页码+1；
            this.Page ++ ;
            this.setState({
                stockArray :this.state.stockArray,
                //stockArray :[],
                allLoaded:response.length < this.PageSize? true:false,
            },()=>{
                if(callBack){
                    callBack();
                }
            })
        },() => {
            this._list.endRefresh();
            this.isRequest = false;
            this.setState({
                allLoaded:false,
            },()=>{
                if(callBack){
                    callBack();
                }
            })
        });
    }

    render() {
       // let datas = this._getNewMessage();
       //  this._console("走Render方法")
        return (
        <BaseComponentPage style={{backgroundColor:'#fff'}}>

        <PageHeader
            onBack={() => this.onBack()}
            navigation={this.props.navigation}
            //titleText={"历史战绩"}
            titleView={
                <View style={{justifyContent:"center",alignItems:"center"}}>
                    <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000"}}>{this.title ? this.title :'历史表现'}</Text>
                    <Text style={{fontSize:ScreenUtil.setSpText(24),color:baseStyle.BLACK_99,marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(5):0}}>{'最近20个交易日'}</Text>
                </View>
            }
        />

            <StickyForm
                style={{ backgroundColor:  "#f6f6f6" }}
                contentStyle={{ alignItems: "flex-start", width: commonUtil.width }}
                data={this.state.stockArray}
                ref={ref => (this._list = ref)}
                heightForSection={() => 40}
                renderSection={this._renderSection}
                heightForIndexPath={() => 60}
                renderIndexPath={this._renderItem}
                renderEmpty={this._emptyData}
                onRefresh={() => {
                    this.Page=1;
                    this._getStockMessage()}}
                allLoaded={this.state.allLoaded}
                loadingFooter={mNormalFooter}
                refreshHeader={mNormalHeader}
                onLoading={() => {
                    this._getStockMessage(
                        ()=>{
                            this._list.endLoading();
                        }
                    )
                }}
                showsHorizontalScrollIndicator={ false}
                // bounces={false}
                headerStickyEnabled={false}
            />
        </BaseComponentPage>
        );
    }

    _emptyData = () => {
       // let stocks = this._getNewMessage();
        if(this.state.stockArray.length > 0){
            return null;
        }
        //backgroundColor: "#F1F8FD"
        return(
            <View>
                <NoDataPage
                    content = {'暂无历史表现'}
                    source = {require('../../images/TuyereDecision/no_stock_data.png')}
                    isNoShow = {true}/>
            </View>
        )
    }


    _sortPress(info,index){
        if(this.isRequest === true){
            return;
        }
        // if(index===2){
        //     return;
        // }
       if(this.state.sortButtonIndex === index){
           this.setState({
               sortDown:!this.state.sortDown,
               sortButtonIndex:index
           },()=>{
               this.Page=1;
               this._getStockMessage();
           })
       }else {
           this.setState({
               sortDown:true,
               sortButtonIndex:index
           },()=>{
               this.Page=1;
               this._getStockMessage();
           })
       }
    }


    _sectionTitle() {
        return (
            <View style={styles.text}>
                <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666"}}>股票名称</Text>
            </View>
        )
    }

    _sectionScrollTitle(info, index){
        let sortImage = this.state.sortDown ? require('../../images/hits/positive.png'):require('../../images/hits/negative.png');
        let defaultSortImage = require('../../images/hits/defaultt.png');
        let sort = info.isSort
        return (
            <TouchableOpacity activeOpacity = {1} onPress={() => this._sortPress(info,index)} style={[index===2?styles.headerFixText:styles.headerText,{width:this.timeItemWidth}]} key={index}>
                <Text style={{ fontSize:ScreenUtil.setSpText(24), color:"#666666"}}>
                    {info.title}
                </Text>
                <Image style={{marginLeft:ScreenUtil.scaleSizeW(3)}} source={
                    index === this.state.sortButtonIndex ? sortImage : defaultSortImage
                }/>

            </TouchableOpacity>
        )
    }

    _renderSection = (section) => {
        return (
            <View style={{ flex: 1, flexDirection: "row",height:35,paddingRight:ScreenUtil.scaleSizeW(10),backgroundColor: "#F1F8FD",}}>
                {this._sectionTitle()}
                {this.state.titles.map((info, index) =>
                    this._sectionScrollTitle(info,index)
                )}
            </View>
        );
    };

    _itemView(info,index,item){

        let clr = baseStyle.SMALL_TEXT_COLOR;
        let bgUPClr ='rgba(255,51,0,0.05)';
        let bgDowClr = 'rgba(51,153,0,0.05)';
        let bgClr = bgUPClr;
        let stockMessage = 0;


        switch (info.title){
            case '区间最高涨幅':
                stockMessage = item.zhangfu;
                if (item.zhangfu > 0) {
                    clr = "#F92400";
                    bgClr = bgUPClr;
                }
                else if (item.zhangfu < 0) {
                    clr = "#339900";
                    bgClr = bgDowClr;
                }

                break;
            case '区间最大振幅':
                stockMessage = item.zhenfu;
                if (item.zhenfu > 0) {
                    clr = baseStyle.UP_COLOR;
                    bgClr = bgUPClr;
                }
                else if (item.zhenfu < 0) {
                    clr = baseStyle.DOWN_COLOR;
                    bgClr = bgDowClr;
                }
                break;
            default:
                break;
        }
        if(info.title=='区间最高涨幅' || info.title=='区间最大振幅'){
            return (
                <View
                    key = {index}
                    style={{marginHorizontal:ScreenUtil.scaleSizeW(8),backgroundColor:bgClr,flex:1, alignItems:'center',justifyContent:'center',borderRadius:5,marginTop:10,marginBottom:10,}}>
                     <StockFormatText style={{ textAlign: 'right', fontSize: ScreenUtil.scaleSizeW(32),color:clr}} unit="%" sign={true}>{stockMessage / 100}</StockFormatText>
                </View>
            )
        }else if(info.title=='入选时间'){
            return (
                <View
                    key = {index}
                    style={{width:this.timeItemWidth,borderRadius:ScreenUtil.scaleSizeW(10),marginLeft:ScreenUtil.scaleSizeW(10),marginRight:ScreenUtil.scaleSizeW(15)
                    ,backgroundColor:"#f5faff",paddingLeft:ScreenUtil.scaleSizeW(10),justifyContent:"center",marginVertical:ScreenUtil.scaleSizeW(20),
                   }}>
                    <Text style={{fontSize:ScreenUtil.scaleSizeW(26),color:"#003366"}}>{item.currentDates.length>=10 ?item.currentDates.substring(0,4):"- -"}</Text>
                    <Text style={{fontSize:ScreenUtil.scaleSizeW(26),color:"#6282a3",marginTop:Platform.OS==='ios'? 0:-ScreenUtil.scaleSizeW(3)}}>{item.currentDates.length>=10 ?item.currentDates.substring(5,this.timeLength):"- -"}</Text>
                </View>
            )
        }
    }

    _renderItem = (path) => {
        const item = this.state.stockArray[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => {
                let data ={};
                data.Obj = item.marketCode;
                data.ZhongWenJianCheng = item.secName;
                data.obj = item.marketCode;
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: [],
                    index: 0,
                })
            }} style={styles.row}>
                <View style={styles.titleText}>
                    <View style={{flex:1,marginTop:10,marginBottom:10,justifyContent:'center',
                        alignItems:'center', backgroundColor:'#F1F8FD',borderRadius:5, width:widthTitleCell-ScreenUtil.scaleSizeW(20),marginLeft:5}}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:baseStyle.BLACK_333333}}>
                            {item.secName}
                        </Text>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:baseStyle.BLACK_666666,marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(3):-2}}>
                            {item.marketCode}
                        </Text>
                    </View>
                </View>
                {this.state.titles.map((info, index) =>this._itemView(info, index,item))}
            </TouchableOpacity>
        );
    };


    _console(info) {
        // console.log(' 历史表现 = ' + info)
    }

}

const styles = StyleSheet.create({
    hotSetButton:{
        alignItems:'center',
        justifyContent:'center',
        borderColor:baseStyle.ORANGE_FF9933,
        borderWidth:1,
        borderRadius:5,
        height:24,
        marginLeft:15,
        paddingLeft:10,
        paddingRight:10,
    },
    text: {
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "#44a2ff",
        backgroundColor: "#F1F8FD",
        // borderRightWidth: StyleSheet.hairlineWidth,
        // borderColor: "gray",
        width:widthTitleCell,
        // borderWidth: StyleSheet.hairlineWidth,
        // borderColor: "#EEE"
    },
    row: {
        flex: 1,
        flexDirection: "row",
        backgroundColor:'#fff'
    },
    headerFixText: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection:'row',
         // width:timeItemDWidth,
        // backgroundColor:'#ff4334'
        //flex:1
    },
    headerText: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection:'row',
       // width:widthCell,
        flex:1
    },
    titleText: {
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "#cd92ff",
        backgroundColor: "#fff",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#EEE",
        width:widthTitleCell,
    }
});
