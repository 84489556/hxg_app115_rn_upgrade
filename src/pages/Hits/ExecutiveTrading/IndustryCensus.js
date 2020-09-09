/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description:市场统计tab
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    Alert,
    StyleSheet, StatusBar,TouchableOpacity,
    Image
} from 'react-native';

import * as ScreenUtil from "../../../utils/ScreenUtil";
import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import { LargeList } from "react-native-largelist-v3";
import NorMalOneText from '../../../components/NorMalOneText';
import  StockFormatText from '../../../components/StockFormatText';
import {sensorsDataClickActionName, sensorsDataClickObject} from "../../../components/SensorsDataTool";

import {mRiskTipsFooter} from "../../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../../components/RiskTipsFooterView";

export default class mIndustryCensus extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {

            data:[
                {
                    sectionTitle: "",
                    items: []
                }
            ],//表格数据
            titles: [
                {conName:"行业名称",conCode:-1},
                {conName:"高管净买金额",conCode:1},
                {conName:"高管净买数量",conCode:-1},
            ],
            //haveMoreDatas:true, //判断是否还有更多数据，true有,false无
            allLoaded:false,
        };

        this.pageNo = 1;//页数
        this.pageSize = 20;//默认每次请求60条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(220);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度


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
        this.getMarketListData();

    }

    /**
     * 获取交易列表的数据
     * 每次请求60条
     * */
    getMarketListData(){

        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;

        //直接判断title中 index=7的交易日期 conCode值，判断升降序
        if(this.state.titles[1].conCode === 1){
            params.desc = true;
        }else if(this.state.titles[1].conCode === 2) {
            params.desc = false;
        }else {
            params.desc = true;
        }

        if(this.pageNo === 1){
            this.state.data[0].items = [];
        }

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.INDUSTRY_CENCUS_LIST,params,
            (response)=>{
                this._list.endLoading();
                if(response && response.list.length>0){
                    for (let i =0;i<response.list.length;i++){
                        let newItem = {};
                        //储存第一列需要的数据
                        newItem.id = response.list[i].id;
                        newItem.indusName = response.list[i].indusName;
                        newItem.indusCode = response.list[i].market+""+response.list[i].indusCode;
                        //跳转需要的行业Code
                        newItem.indusCodeS = response.list[i].indusCode;

                        newItem.netAmt = response.list[i].netAmt!=null ? response.list[i].netAmt:'--';
                        newItem.netShares = response.list[i].netShares!=null ? response.list[i].netShares:'--';
                        newItem.shares = response.list[i].shares!=null ? response.list[i].shares:'--';
                        newItem.person = response.list[i].person!=null ? response.list[i].person:'--';

                        this.state.data[0].items.push(newItem);

                    }

                    //页数+1
                    this.pageNo+=1;

                    this.setState({
                        data:this.state.data,
                        allLoaded:response.list.length < this.pageSize ? true:false,
                    });
                }else {
                    this.setState({
                        data:this.state.data,
                        allLoaded:true,
                    });
                }
            },
            (error)=>{
                this.setState({
                    data:this.state.data,
                    allLoaded:true,
                });
            })
    }

    render() {
        return (
            <LargeList
                bounces={true}
                style={{ backgroundColor: "#f6f6f6",flex:1}}
                //contentStyle={{alignItems: "flex-start", width: "100%" }}
                data={this.state.data}
                scrollEnabled={true}
                ref={ref => (this._list = ref)}
                heightForSection={() =>this.HEADER_HEGHT}
                renderHeader={this._renderunLockHeader}
                renderSection={this._renderSection}
                heightForIndexPath={() => this.ITEM_HEGHT}
                renderIndexPath={this._renderItem}
                showsHorizontalScrollIndicator={ false}
                headerStickyEnabled={false}
                directionalLockEnabled={true}
                loadingFooter={mRiskTipsFooter}
                renderFooter={this._renderMyFooters}
                onLoading={() => {
                    //console.log("加载更多")
                    this.getMarketListData();
                }}
                allLoaded={this.state.allLoaded}

            />
        )
    }

    /**
     * 加载可滑动列表的头布局
     * */
    _renderunLockHeader=()=>{
        return(
            <View>
                <NorMalOneText textContent={"最近一年"}/>
            </View>)
    };

    /**
     * SectionTitle
     * {conName:"变动人",conCode:-1}
     * */
    _renderSection = (section: number) => {
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row", backgroundColor:"#f2faff"}}>
                {this.state.titles.map((title, index) =>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.sortViewPress(index,title.conCode)}}
                                      style={styles.headerText} key={index}>
                        <Text style={styles.hinnerText} >
                            {title.conName}
                        </Text>
                        {this.getSortView(title.conCode)}
                    </TouchableOpacity>
                )}
            </View>
        );
    };
    /**
     * 顶部view的点击事件
     * */
    sortViewPress(index,conCode){
        if(this.state.titles[index].conCode!==-1){
            if(conCode===0){
                this.state.titles[index].conCode= 1;
            }else if(conCode===1){
                this.state.titles[index].conCode= 2;
            }else if(conCode===2){
                this.state.titles[index].conCode= 1;
            }
            this._list && this._list.scrollTo({ x: 0, y: 0}, true).then(()=>{
                this.setState({
                        titles:this.state.titles,
                    },()=>{
                        this.pageNo = 1;
                        this.getMarketListData();
                    }
                );
            })
        }
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
     * //储存第一列需要的数据
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        if(item===undefined ){
            return <View><View></View></View>;
        }
        let colors ;
        if(item.netAmt && item.netAmt>0){
            colors = 'rgba(249,36,0,0.8)';
        }else if(item.netAmt && item.netAmt===0){
            colors = 'rgba(102,102,102,1)';
        }else if(item.netAmt && item.netAmt<0){
            colors = 'rgba(51,153,0,0.8)';
        }else {
            colors = 'rgba(102,102,102,1)';
        }
        return (
            <TouchableOpacity activeOpacity={1}  onPress={()=>{
                let data ={};
                data.Obj = item.indusCode;
                data.ZhongWenJianCheng = item.indusName;
                data.obj = item.indusCode;
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: [],
                    index: 0,
                })
            }} style={styles.row}>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(100),flexDirection:"row"}}>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(100),alignItems:"center",justifyContent:"center"}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000"}}>{item.indusName}</Text>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666"}}>{item.indusCode}</Text>
                    </View>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(100),flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                        <StockFormatText precision={2} unit={'元/万/亿'} useDefault={true} style={{fontSize:ScreenUtil.setSpText(32),color:colors}}>{item.netAmt}</StockFormatText>
                    </View>

                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(100),flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                        <StockFormatText precision={2} unit={'股/万股/亿股'} useDefault={true} style={{fontSize:ScreenUtil.setSpText(32),color:"rgba(0,0,0,0.8)"}}>{item.netShares}</StockFormatText>
                    </View>
                </View>
                <View style={{width:ScreenUtil.screenW-ScreenUtil.scaleSizeW(60),height:ScreenUtil.scaleSizeW(100),marginLeft:ScreenUtil.scaleSizeW(30),flexDirection:"row",justifyContent:"center",alignItems:"center"
                    ,marginBottom:ScreenUtil.scaleSizeW(20),borderRadius:ScreenUtil.scaleSizeW(10),backgroundColor:"#f5faff"}}>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(100),justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(32),color:"rgba(0,0,0,0.8)"}}>{item.shares}</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.6)"}}>行业个股买卖数</Text>
                    </View>
                    <View style={{width:ScreenUtil.scaleSizeW(1),height:ScreenUtil.scaleSizeW(100),backgroundColor:"#f1f1f1"}}/>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(100),justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(32),color:"rgba(0,0,0,0.8)"}}>{item.person}</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.6)"}}>买卖人数</Text>
                    </View>
                    <View style={{width:ScreenUtil.scaleSizeW(1),height:ScreenUtil.scaleSizeW(100),backgroundColor:"#f1f1f1"}}/>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        Navigation.navigateForParams(this.props.navigation,"SalesDetails",{indusCode:item.indusCodeS})
                        sensorsDataClickObject.addOnClick.page_source = '高管交易榜-行业统计'
                        sensorsDataClickObject.addOnClick.content_name = '买卖明细'
                        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addOnClick)
                    }} style={{flex:1,height:ScreenUtil.scaleSizeW(100),justifyContent:"center",alignItems:"center"}}>
                        <Image style={{width:ScreenUtil.scaleSizeW(30),height:ScreenUtil.scaleSizeW(32),resizeMode:"contain"}} source={require('../../../images/hits/sale_details.png')}/>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,153,255,0.8)",marginTop:ScreenUtil.scaleSizeW(6)}}>买卖明细</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };
    /**
     * 获取不同样式的View
     * */
    getItemViewType(title, index,code){

        let Views ;
        //注意每个表格的设置不一样
        switch (index) {
            case 0:
                let colors= "";
                let content = title;
                if(title>0){
                    colors=  "#fa5033";
                    content ="+"+title;
                }else if(title<0){
                    colors=  "#5cac33";
                }else {
                    colors=  "#999999";
                }
                Views = <View style={styles.textFix} key={index}><Text style={[styles.contentText,{color:colors}]}>{content}</Text></View>;
                break;
            case 1:
                Views =  <View style={styles.textFix} key={index}><Text style={styles.contentText}>{title}</Text></View>;
                break;
            case 4:
                Views =  <TouchableOpacity onPress={()=>{ Navigation.navigateForParams(this.props.navigation,"SalesDetails",
                    {indusCode: code,})}} style={styles.text} key={index}><Text style={[styles.contentText,{color:"#0099FF"}]}>{title}</Text></TouchableOpacity>;
                break;
            default:
                Views =  <View style={styles.text} key={index}><Text style={styles.contentText}>{title}</Text></View>;
                break;
        }
        return Views;
    };
    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        if(this.state.allLoaded === false){
            return <View><View></View></View>;
        }else if((this.state.data && this.state.data[0].items.length === 0 )||  this.state.allLoaded === true){
            return(
                <View>
                    <RiskTipsFooterView type={0}/>
                </View>
            )
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
    },
    intervalLine:{
        width:ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(20),
        backgroundColor:"#f1f1f1"
    },

    //表格需要的样式
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(30),
    },
    textFix:{
        width:ScreenUtil.scaleSizeW(290),
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(30),
    },
    hinnerText:{
        fontSize:ScreenUtil.setSpText(22),
        color:"#626567"
    },
    titleText: {
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(20),
        backgroundColor:"#fff",
        width:ScreenUtil.scaleSizeW(220),
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        flexDirection:"row",
        justifyContent:"center"
    },
    row: {
        flex: 1,
        width:ScreenUtil.screenW,
        borderWidth: 0.5,
        borderColor: "#f1f1f1",
        backgroundColor:"#fff"
    },
    contentText:{
        fontSize:ScreenUtil.setSpText(28),
        color:"#333333",
    },
    textTitle: {
        //alignItems:"center",
        justifyContent:"center",
        paddingLeft:ScreenUtil.scaleSizeW(20),
        height:35,
        //width:ScreenUtil.scaleSizeW(180),
        width:ScreenUtil.scaleSizeW(220)
    },
    sortView:{
        width:ScreenUtil.scaleSizeW(12),
        height:ScreenUtil.scaleSizeW(24),
        resizeMode:"contain",
        marginLeft:ScreenUtil.scaleSizeW(6)
    },
});
