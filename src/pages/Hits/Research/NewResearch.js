/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description:机构调研最新调研tab
 */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Text, StatusBar,TouchableOpacity,Platform
} from 'react-native';

import * as ScreenUtil from '../../../utils/ScreenUtil';
import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import { LargeList } from "react-native-largelist-v3";
import {mNormalHeader} from "../../../components/mNormalHeader";
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../../components/SensorsDataTool';
import {mRiskTipsFooter} from "../../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../../components/RiskTipsFooterView";

export default class NewResearch extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            data:[
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            timeSort:1,//1为默认降序,2升序
            allLoaded:false,//判断是否还有更多数据，true无,false有

        };
        this.pageNo = 1;//页数
        this.pageSize = 20;//默认每次请求60条数据

        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(426);
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
     * 每次请求20条
     * */
    getMarketListData(callBack){

        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;

        //直接判断title中 index=7的交易日期 conCode值，判断升降序
        if(this.state.timeSort === 1){
            params.desc = true;
        }else if(this.state.timeSort === 2) {
            params.desc = false;
        }else {
            params.desc = true;
        }

        if(this.pageNo === 1){
            this.state.data[0].items = [];
        }

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.NEW_RESEARCH_LIST,params,
            (response)=>{
            //console.log("列表",response)
                if(response && response.list.length>0){
                    for (let i =0;i<response.list.length;i++){
                        let newItem = {};
                        //储存第一列需要的数据
                        newItem.id = response.list[i].id;
                        newItem.secName = response.list[i].secName;
                        newItem.secCode =response.list[i].market +""+ response.list[i].secCode;
                        newItem.url =response.list[i].url ;


                        newItem.reportDate = response.list[i].reportDate ? response.list[i].reportDate.substring(0,10):'- -' ;
                        newItem.reportTitle = response.list[i].reportTitle ? response.list[i].reportTitle:'- -';
                        newItem.orgName = response.list[i].orgName ? response.list[i].orgName:'N/A';
                        newItem.author = response.list[i].author ? response.list[i].author:'- -';
                        newItem.rink = response.list[i].rink ? response.list[i].rink:'- -';
                        newItem.targetPrice = response.list[i].targetPrice ? response.list[i].targetPrice.toFixed(2):'- -';

                        this.state.data[0].items.push(newItem);

                    }
                    //页数+1
                    this.pageNo+=1;
                    this.setState({
                        data:this.state.data,
                        allLoaded:response.list.length<this.pageSize ? true:false,
                    },()=>{
                        if(callBack){callBack();}
                    });
                }else {
                    this.setState({
                        data:this.state.data,
                        allLoaded:false,
                    },()=>{ if(callBack){callBack();}});
                }
            },
            (error)=>{
                this.setState({
                    data:this.state.data,
                    allLoaded:false,
                },()=>{ if(callBack){callBack();}});
            })

    }

    render() {
        return (
            <LargeList
                bounces={true}
                style={{ backgroundColor: "#f6f6f6",flex:1}}
                data={this.state.data}
                scrollEnabled={true}
                ref={ref => (this._list = ref)}
                renderHeader={this._renderunLockHeader}
                heightForIndexPath={() => this.ITEM_HEGHT}
                renderIndexPath={this._renderItem}
                loadingFooter={mRiskTipsFooter}
                renderFooter={this._renderMyFooters}
                refreshHeader={mNormalHeader}
                showsHorizontalScrollIndicator={ false}
                onLoading={() => {this.getMarketListData(()=>{
                    this._list.endLoading();
                });}}
                headerStickyEnabled={false}
                onRefresh={() => {
                    this.pageNo=1;
                    this.getMarketListData(()=>{
                        this._list.endRefresh();
                    });
                }}
                allLoaded={this.state.allLoaded}
                onScroll={({nativeEvent:{contentOffset:{x, y}}})=>{}}
            />
        )
    }
    /**
   * 加载可滑动列表的头布局
   * */
    _renderunLockHeader=()=>{
        return(
            <View style={{width:ScreenUtil.screenW}}>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(90),alignItems:"center",justifyContent:"center",
                    backgroundColor:"#f1f1f1"}}>
                    <TouchableOpacity onPress={()=>{
                        Navigation.navigateForParams(this.props.navigation,"NewReaserchSearch",{entrance:'机构调研-最新调研'})
                        sensorsDataClickObject.searchClick.entrance = '机构调研-最新调研'
                        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick)
                    }} style={{width:ScreenUtil.screenW-ScreenUtil.scaleSizeW(60),height:ScreenUtil.scaleSizeW(50),marginHorizontal:ScreenUtil.scaleSizeW(30),
                        flexDirection:"row",backgroundColor:"#d8d8d8",alignItems:"center",borderRadius:ScreenUtil.scaleSizeW(8)}}>
                        <Image style={{width:ScreenUtil.scaleSizeW(22),height:ScreenUtil.scaleSizeW(22),marginLeft:ScreenUtil.scaleSizeW(17),resizeMode:"contain"}}
                               source={require('../../../images/hits/search.png')}/>
                        <Text style={{fontSize:ScreenUtil.setSpText(28),color:"#9d9d9d",marginLeft:ScreenUtil.scaleSizeW(17)}}>请输入股票代码/全拼/首字母</Text>
                    </TouchableOpacity>
                </View>
                    <View style={styles.containers}>
                        <Text style={styles.onetext}>最近3个月机构调研</Text>
                        <View style={{flex:1}}/>
                        <TouchableOpacity activeOpacity={0.7} onPress={()=>{this.sortViewPress(this.state.timeSort)}} style={{marginRight:ScreenUtil.scaleSizeW(30),flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                            <Text style={styles.onetext}>{this.state.timeSort===1?"由新到旧":"由旧到新"}</Text>
                            {this.getSortView(this.state.timeSort) }
                        </TouchableOpacity>
                    </View>

        </View>)
    };

    /**
     * 顶部view的点击事件
     * */
    sortViewPress(conCode){
            if(conCode===0){
                this.state.timeSort= 1;
            }else if(conCode===1){
                this.state.timeSort = 2;
            }else if(conCode===2){
                this.state.timeSort = 1;
            }
            this.state.data[0].items = [];
            this.setState({
                    data:this.state.data,
                    timeSort: this.state.timeSort,
            },()=>{
                this.pageNo = 1;
                this.getMarketListData();
                }
            );
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
     * let idPath = this.props.serviceUrl + "/" + item.id
     let data={
      idPath:idPath,
      title:item.title,
      sourceName:item.sourceName,
      date:item.date,
      jsonUrl:item.content
    };

     Navigation.pushForParams(this.props.navigation,'NewsDetailPage',{
      news:data, title:item.title,
    })
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <View  style={styles.row}>
                <TouchableOpacity style={{marginHorizontal:ScreenUtil.scaleSizeW(30),width:ScreenUtil.screenW-ScreenUtil.scaleSizeW(60),height:ScreenUtil.scaleSizeW(70),flexDirection:"row",justifyContent:"center",alignItems:"center"}}
                                  activeOpacity={1} onPress={()=>{
                                      let data ={};
                                        data.Obj = item.secCode;
                                        data.ZhongWenJianCheng = item.secName;
                                        data.obj = item.secCode;
                                       
                                        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                                        ...data,
                                        array: [],
                                        index: 0,
                                        })
                }}
                >
                    <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000"}}>{item.secName}</Text>
                    <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666",marginLeft:ScreenUtil.scaleSizeW(15)}}>{item.secCode}</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666"}}>{item.reportDate}</Text>
                </TouchableOpacity>
                <View style={{width:ScreenUtil.screenW-ScreenUtil.scaleSizeW(60),marginBottom:ScreenUtil.scaleSizeW(6),marginLeft:ScreenUtil.scaleSizeW(30),height:0.5,backgroundColor:"#f1f1f1"}}/>

                <TouchableOpacity onPress={()=>{
                    let data={
                        idPath:'/ydhxg'+item.url,
                        title:item.reportTitle,
                        date:item.reportDate,
                        jsonUrl:item.url,
                    };
                    Navigation.navigateForParams(this.props.navigation,'NewsDetailPage',{
                        news:data, title:item.title,
                    })
                }} activeOpacity={1}
                    style={{width:ScreenUtil.screenW-ScreenUtil.scaleSizeW(60),flex:1,marginHorizontal:ScreenUtil.scaleSizeW(30),justifyContent:"center"}}>
                    <Text style={{fontSize:ScreenUtil.setSpText(40),color:"#000",}} numberOfLines={2}>{item.reportTitle}</Text>
                </TouchableOpacity>
                <View style={{width:ScreenUtil.screenW-ScreenUtil.scaleSizeW(60),height:ScreenUtil.scaleSizeW(80)
                ,flexDirection:"row",alignItems:"center",marginLeft:ScreenUtil.scaleSizeW(30),marginTop:ScreenUtil.scaleSizeW(10)}}>
                    <View style={{width:ScreenUtil.scaleSizeW(80),height:ScreenUtil.scaleSizeW(80),borderRadius:ScreenUtil.scaleSizeW(10),
                    backgroundColor:"#eaf5ff",justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,51,102,0.8)",}}>机构</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,51,102,0.8)",}}>名称</Text>
                    </View>
                    <Text style={{flex:1,fontSize:ScreenUtil.setSpText(24),color:"rgba(0, 0, 0, 0.4)",marginLeft:ScreenUtil.scaleSizeW(15)}} numberOfLines={1} >{item.orgName}</Text>
                </View>
                <View style={{width:ScreenUtil.screenW-ScreenUtil.scaleSizeW(60),height:ScreenUtil.scaleSizeW(130),marginHorizontal:ScreenUtil.scaleSizeW(30),flexDirection:"row",paddingVertical:ScreenUtil.scaleSizeW(30)
                    ,justifyContent:"center",alignItems:"center"}}>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(80),justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000",}}>{item.rink}</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.4)",marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(8):0}}>评级</Text>
                    </View>
                    <View style={{width:1,height:ScreenUtil.scaleSizeW(61),backgroundColor:"#e8e8e8"}}/>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(80),justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000",}}>{item.author}</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.4)",marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(8):0}}>作者</Text>
                    </View>
                    <View style={{width:1,height:ScreenUtil.scaleSizeW(61),backgroundColor:"#e8e8e8"}}/>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(80),justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000",}}>{item.targetPrice}</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.4)",marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(8):0}}>目标价</Text>
                    </View>
                </View>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(16),backgroundColor:"#f1f1f1"}}/>
            </View>
        );
    };

    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        if((this.state.data && this.state.data[0].items.length === 0 )|| this.state.allLoaded === false){
            return <View><View></View></View>;
        }else {
            return(
                <View>
                 <RiskTipsFooterView type={1}/>
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
    headerTextFixWid: {
        width:ScreenUtil.scaleSizeW(340),
        paddingLeft:ScreenUtil.scaleSizeW(30),
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection:"row"
    },

    //表格需要的样式
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(30),
    },
    hinnerText:{
        fontSize:ScreenUtil.setSpText(24),
        color:"#999999"
    },
    titleText: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:"#fff",
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f2faff",
        paddingLeft:ScreenUtil.scaleSizeW(30),
        flexDirection:"row"

    },
    row: {
        flex: 1,
        width:ScreenUtil.screenW,
        backgroundColor:"#fff"
    },
    contentText:{
        fontSize:ScreenUtil.setSpText(28),
        color:"#000"
    },
    fixTitleOne:{
        width:ScreenUtil.scaleSizeW(180),
        justifyContent: "center",
        //alignItems: "center",
        backgroundColor:"#ffffff",
        paddingLeft:ScreenUtil.scaleSizeW(20)
    },
    sortView:{
        width:ScreenUtil.scaleSizeW(12),
        height:ScreenUtil.scaleSizeW(24),
        resizeMode:"contain",
        marginLeft:ScreenUtil.scaleSizeW(6)
    },
    containers: {
        width:ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(45),
        backgroundColor:"#f1f1f1",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center"
    },
    onetext:{
        fontSize:12,
        color:"#9d9d9d",
        marginLeft:ScreenUtil.scaleSizeW(30)},

});
