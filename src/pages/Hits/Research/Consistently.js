/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description:机构调研一致看多页面
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

import * as ScreenUtil from "../../../utils/ScreenUtil";

import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import { LargeList } from "react-native-largelist-v3";
import LinearGradient from 'react-native-linear-gradient';
import {mNormalHeader} from "../../../components/mNormalHeader";
import {mRiskTipsFooter} from "../../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../../components/RiskTipsFooterView";
export default class Consistently extends Component<Props> {

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

        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(353);
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
        this.getConsListData();

    }
    /**
     * 获取交易列表的数据
     * 每次请求60条
     * */
    getConsListData(callback){

        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;

        //直接判断title中 index=2的交易日期 conCode值，判断升降序
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

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.CONSISTENTLY_LIST,params,
            (response)=>{

                if(response && response.list.length>0){
                    for (let i =0;i<response.list.length;i++){
                        let newItem = {};
                        newItem.id = response.list[i].id;
                        newItem.secName = response.list[i].secName;
                        newItem.secCode = response.list[i].market+""+response.list[i].secCode;

                        newItem.reportDate = response.list[i].reportDate ? response.list[i].reportDate.substring(0,10):'--';
                        newItem.gradingTimes = response.list[i].gradingTimes ? response.list[i].gradingTimes:'--';
                        newItem.ratingTimes = response.list[i].ratingTimes ? response.list[i].ratingTimes:'--';
                        newItem.highestPrice = response.list[i].highestPrice ? response.list[i].highestPrice:'--';
                        newItem.lowestPrice = response.list[i].lowestPrice ? response.list[i].lowestPrice:'--';
                        newItem.latestClose = response.list[i].latestClose ? response.list[i].latestClose:'--';

                        this.state.data[0].items.push(newItem);

                    }

                    //页数+1
                    this.pageNo+=1;

                    this.setState({
                        data:this.state.data,
                        allLoaded:response.list.length<this.pageSize ? true:false,
                    },()=>{
                        if(callback){
                            callback();
                        }
                    });
                }else {
                    this.setState({
                        data:this.state.data,
                        allLoaded:true,
                    },()=>{
                        if(callback){
                            callback();
                        }
                    });
                }
            },
            (error)=>{
                if(callback){
                    callback();
                }
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
                showsHorizontalScrollIndicator={false}
                onLoading={() => {
                    this.getConsListData(()=>{
                        this._list.endLoading();
                    });
                }}
                onRefresh={() => {
                    this.pageNo=1;
                    this.getConsListData(()=>{
                        this._list.endRefresh();
                    });
                }}
                headerStickyEnabled={false}
                allLoaded={this.state.allLoaded}
                onScroll={({nativeEvent:{contentOffset:{x, y}}})=>{}}
            />
        )
    }

    /**
    * 加载可滑动列表的头布局
    * */
    _renderunLockHeader=()=>{
        return( <View style={{height:ScreenUtil.scaleSizeW(60),width:ScreenUtil.screenW}}>
                    <View style={{ flex: 1,backgroundColor:"#f1f1f1", justifyContent: "center", alignItems: "center",flexDirection:"row"}}>
                        <Text style={styles.onetext}>最近三个月被一致看多</Text>
                        <View style={{flex:1}}/>
                        <TouchableOpacity activeOpacity={0.7} onPress={()=>{this.sortViewPress(this.state.timeSort)}} style={{marginRight:ScreenUtil.scaleSizeW(30),flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                            <Text style={styles.onetext}>看多次数</Text>
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
                this.getConsListData();
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
     * <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666",marginRight:ScreenUtil.scaleSizeW(30)}}>{item.reportDate}</Text>
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
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
            }} style={styles.row}>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(88),flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                    <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000",marginLeft:ScreenUtil.scaleSizeW(30)}}>{item.secName}</Text>
                    <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666",marginLeft:ScreenUtil.scaleSizeW(22)}}>{item.secCode}</Text>
                    <View style={{flex:1}}/>

                </View>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(104),flexDirection:"row",justifyContent:"center",alignItems:"center"
                            ,borderBottomWidth:0.5,borderTopWidth:0.5,borderColor:"#f1f1f1"}}>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(104),backgroundColor:"#f5faff",justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.4)"}}>评级次数</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"rgba(0,0,0,0.8)"}}>{item.gradingTimes}</Text>
                    </View>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(104),backgroundColor:"#fff",justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.4)"}}>看多次数</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"rgba(0,0,0,0.8)"}}>{item.ratingTimes}</Text>
                    </View>
                </View>
                <View style={{width:ScreenUtil.screenW,flex:1,flexDirection:"row",justifyContent:"center",alignItems:"center"
                    ,borderBottomWidth:0.5,borderTopWidth:0.5,borderColor:"#f1f1f1"}}>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(104),justifyContent:"center",alignItems:"center"}}>
                        <LinearGradient
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            colors={['#3399FF', '#33CCFF']}
                            style={styles.toDay}>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#fff"}}>最高目标价</Text>
                        </LinearGradient>
                        <Text style={{fontSize:ScreenUtil.setSpText(34),color:"rgba(0,0,0,0.8)"}}>{item.highestPrice}</Text>
                    </View>
                    <View style={{width:0.5,height:ScreenUtil.scaleSizeW(72),backgroundColor:"#f1f1f1"}}/>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(104),justifyContent:"center",alignItems:"center"}}>
                        <LinearGradient
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            colors={['#CC33FF', '#FF66FF']}
                            style={styles.toDay}>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#fff"}}>最新收盘价</Text>
                        </LinearGradient>
                        <Text style={{fontSize:ScreenUtil.setSpText(34),color:"rgba(0,0,0,0.8)"}}>{item.latestClose}</Text>
                    </View>
                </View>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(16),backgroundColor:"#f1f1f1"}}/>
            </TouchableOpacity>
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
        // justifyContent: "center",
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
    onetext:{
        fontSize:12,
        color:"#9d9d9d",
        marginLeft:ScreenUtil.scaleSizeW(30)
    },
    toDay:{
        height:ScreenUtil.scaleSizeW(40),
        borderRadius:ScreenUtil.scaleSizeW(20),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal:ScreenUtil.scaleSizeW(35)
    },
});
