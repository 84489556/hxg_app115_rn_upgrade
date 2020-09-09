/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/26 17
 * description:高管交易行业统计买卖明细页面
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    ToastAndroid,
    ScrollView
} from 'react-native';

import  BaseComponentPage from "../../../pages/BaseComponentPage";
import  NavigationTitleView from "../../../components/NavigationTitleView";
import * as ScreenUtil from "../../../utils/ScreenUtil";
import { LargeList } from "react-native-largelist-v3";
import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import {mNormalFooter} from "../../../components/mNormalFooter";
import  StockFormatText from '../../../components/StockFormatText';
export default class SalesDetails extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {
            industryCode:this.props.navigation.state.params.indusCode ? this.props.navigation.state.params.indusCode :"",//上个页面传递的页面关键词,行业Code

            data:[
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            //title传入一个conCode ,-1表示不需要排序，0表示默认状态，1表示降序，2表示升序
            titles: [
                {conName:"交易日期",conCode:1},
                {conName:"股票名称",conCode:-1},
                {conName:"变动人",conCode:-1},
                {conName:"变动类型",conCode:-1},
            ],
            //haveMoreDatas:true, //判断是否还有更多数据，true有,false无
            allLoaded:false,
        };

        this.pageNo = 1;//页数
        this.pageSize = 20;//默认每次请求60条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(222);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        //this.FOOTTER_HEIGHT = 50;

        // this.DATA_ITEM_LENGTH = 0; //所有数据的长度
        // this.ELSE_HEGHT = ScreenUtil.screenH-ScreenUtil.statusH-ScreenUtil.scaleSizeW(90);
        // this.scrollViewBottom= false;//是否滑动到底部,防止多次加载

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
        this.getNewSaleListData();
    }
    /**
     * 获取交易列表的数据
     * 每次请求60条
     * */
    getNewSaleListData(){
        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;
        params.indus = this.state.industryCode;
        //直接判断title中 index=7的交易日期 conCode值，判断升降序
        if(this.state.titles[0].conCode === 1){
            params.desc = true;
        }else if(this.state.titles[0].conCode === 2) {
            params.desc = false;
        }else {
            params.desc = true;
        }
        if(this.pageNo === 1){
            this.state.data[0].items = [];
        }

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.NEW_SALE_LIST,params,
            (response)=>{
                this._list.endLoading();
                if(response && response.list.length>0){
                    for (let i =0;i<response.list.length;i++){
                        let newItem = {};
                        //储存第一列需要的数据
                        //let titles = {};
                        newItem.id = response.list[i].id;
                        newItem.secName = response.list[i].secName;
                        newItem.secCode = response.list[i].market+""+response.list[i].secCode;

                        newItem.changer = response.list[i].changer ? response.list[i].changer:'--';
                        newItem.chgType = response.list[i].chgType ? response.list[i].chgType:'--';
                        newItem.transPrice = response.list[i].transPrice!=null ? response.list[i].transPrice:'--';
                        newItem.chgSharesNum = response.list[i].chgSharesNum ? Number(response.list[i].chgSharesNum):'--';
                        newItem.tradeAmt = response.list[i].tradeAmt!=null ? response.list[i].tradeAmt:'--';
                        newItem.manageName = response.list[i].manageName ?  response.list[i].manageName:'--';
                        newItem.duty = response.list[i].duty ?  response.list[i].duty:'--';
                        newItem.relation = response.list[i].relation ?  response.list[i].relation:'--';
                        newItem.chgDate = response.list[i].chgDate ?  response.list[i].chgDate:'--';

                        //储存一个偏移量的值
                       // newItem.mScrollX = 0;

                        this.state.data[0].items.push(newItem);
                    }

                    //页数+1
                    this.pageNo+=1;
                    // console.log("请求回来");
                    // console.log(this.state.data);
                    this.setState({
                        data:this.state.data,
                        allLoaded:response.list.length<this.pageSize ? true:false,
                    });

                }else {
                    this.setState({
                        data:this.state.data,
                        allLoaded:false,
                    });
                }
            },
            (error)=>{



            })

    }

    render() {
        return (
            <BaseComponentPage style={styles.container}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"买卖明细"}/>
                <LargeList
                    bounces={true}
                    style={{ backgroundColor: "white",flex:1}}
                    contentStyle={{alignItems: "flex-start", width: "100%" }}
                    data={this.state.data}
                    scrollEnabled={true}
                    ref={ref => (this._list = ref)}
                    heightForSection={() =>this.HEADER_HEGHT}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => this.ITEM_HEGHT}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={ false}
                    headerStickyEnabled={false}
                    directionalLockEnabled={true}
                    //renderFooter={this._renderFooters}
                    loadingFooter={mNormalFooter}
                    onLoading={() => {
                        this.getNewSaleListData();
                    }}
                    allLoaded={this.state.allLoaded}
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
                {this.state.titles.map((title, index) =>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.sortViewPress(index,title.conCode)}} style={styles.headerText} key={index}>
                        <Text style={styles.hinnerText} >
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
        if(this.state.titles[index].conCode!==-1){
            if(conCode===0){
                this.state.titles[index].conCode= 1;
            }else if(conCode===1){
                this.state.titles[index].conCode= 2;
            }else if(conCode===2){
                this.state.titles[index].conCode= 1;
            }
            this.state.data[0].items = [];
            this.setState({
                data:this.state.data,
                titles:this.state.titles,
            },()=>{
                this.pageNo = 1;
                this.getNewSaleListData();
            });
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
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        //console.log(item)
        let monColor ;
        if(item.tradeAmt!==''){
            if(item.tradeAmt>0){
                monColor ="#fa5033"
            }else if(item.tradeAmt===0){
                monColor ="rgba(0,0,0,0.4)"
            }else {
                monColor ="#5cac33"
            }
        }else {
            monColor ="rgba(0,0,0,0.4)"
        }
        return (
            <View  style={styles.row}>
                <TouchableOpacity activeOpacity={1} onPress={()=>{
                    let data ={};
                    data.Obj = item.secCode;
                    data.ZhongWenJianCheng = item.secName;
                    data.obj = item.secCode;
                    Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                        ...data,
                        array: [],
                        index: 0,
                    })
                }} style={{flexDirection:'row',justifyContent:"center",alignItems:"center",paddingTop:ScreenUtil.scaleSizeW(20),
                    height:ScreenUtil.scaleSizeW(100),marginBottom:ScreenUtil.scaleSizeW(10)}}>
                    <View style={{width:ScreenUtil.screenW/4,paddingLeft:ScreenUtil.scaleSizeW(20)}}>
                        <View style={{width:ScreenUtil.scaleSizeW(125),height:ScreenUtil.scaleSizeW(91),borderRadius:ScreenUtil.scaleSizeW(10)
                            ,backgroundColor:"#f5faff",paddingLeft:ScreenUtil.scaleSizeW(10),justifyContent:"center"}}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(26),color:"#003366"}}>{item.chgDate && item.chgDate!=='--'?item.chgDate.substring(0,4):"--"}</Text>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:"#6282a3"}}>{item.chgDate && item.chgDate!=='--'?item.chgDate.substring(5,10):"--"}</Text>
                        </View>
                    </View>
                    <View style={styles.titleText}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:"#242424"}} numberOfLines={1} >{item.secName}</Text>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"#909090"}}>{item.secCode}</Text>
                    </View>
                    <View style={styles.titleText}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.changer}</Text>
                    </View>
                    <View style={styles.titleText}>
                        <View style={{width:ScreenUtil.scaleSizeW(80),height:ScreenUtil.scaleSizeW(80),borderRadius:ScreenUtil.scaleSizeW(40)
                            ,backgroundColor:item.chgType==='买入'?"#fa5033":"#5cac33",justifyContent:"center",alignItems:"center"}}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(28),color:"white"}} numberOfLines={1} >{item.chgType}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <ScrollView horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{paddingLeft:ScreenUtil.scaleSizeW(20),paddingRight:ScreenUtil.scaleSizeW(20)}}
                            style={{width:ScreenUtil.screenW,flex:1,paddingTop:ScreenUtil.scaleSizeW(2),marginBottom:ScreenUtil.scaleSizeW(10)}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        let data ={};
                        data.Obj = item.secCode;
                        data.ZhongWenJianCheng = item.secName;
                        data.obj = item.secCode;
                      
                        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                            ...data,
                            array: [],
                            index: 0,
                        })
                    }}  style={{flex:1,flexDirection:"row"}}>
                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2}  unit={'万/亿'}  style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}}>{item.transPrice}</StockFormatText>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>成交价</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}}>{item.chgSharesNum}</StockFormatText>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>变动数量</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{fontSize:ScreenUtil.scaleSizeW(32),color:monColor}}>{item.tradeAmt}</StockFormatText>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>成交金额</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.manageName}</Text>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>董监高姓名</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.duty}</Text>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>职务</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.relation}</Text>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>与变动人关系</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    };

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:"#ffffff"
    },
    textTitle: {
        //flex: 1,
        justifyContent: "center",
        // alignItems: "center",
        paddingLeft:ScreenUtil.scaleSizeW(20),
        width:ScreenUtil.scaleSizeW(180)
    },
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(30),
        //alignItems: "center",
    },
    row: {
        flex: 1,
        width:ScreenUtil.screenW,
        borderWidth: 0.5,
        borderColor: "#f1f1f1"
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection:"row",
        paddingLeft:ScreenUtil.scaleSizeW(30)
    },
    hinnerText:{
        fontSize:ScreenUtil.setSpText(24),
        color:"#626567"
    },
    contentText:{
        fontSize:ScreenUtil.setSpText(28),
        color:"#333333",
        //fontWeight:"bold"
    },
    sortView:{
        width:ScreenUtil.scaleSizeW(12),
        height:ScreenUtil.scaleSizeW(24),
        resizeMode:"contain",
        marginLeft:ScreenUtil.scaleSizeW(6)
    },
    titleText: {
        flex: 1,
        justifyContent: "center",
        //alignItems: "center",
        // backgroundColor: "gray",
        width:ScreenUtil.scaleSizeW(180),
        paddingLeft:ScreenUtil.scaleSizeW(30),
        backgroundColor:"#fff",
    },
    scrollItem:{
        flex:1,
        backgroundColor:"#fbfdff",
        paddingLeft:ScreenUtil.scaleSizeW(20),
        justifyContent:"center",
        paddingRight:ScreenUtil.scaleSizeW(40),
        borderRadius:ScreenUtil.scaleSizeW(10),
        marginRight:ScreenUtil.scaleSizeW(10),
        borderWidth:1,
        borderColor:"#f6f6f6"
    }
});
