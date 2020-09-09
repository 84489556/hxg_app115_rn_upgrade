/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description:机构调研关注行业
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
import { LargeList } from "react-native-largelist-v3";
import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import  StockFormatText from '../../../components/StockFormatText';
import {mNormalHeader} from "../../../components/mNormalHeader";

import {mRiskTipsFooter} from "../../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../../components/RiskTipsFooterView";
export default class FocusIndustry extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            data:[
                {
                    sectionTitle: "",
                    items: []
                }
            ],//表格数据
            timeSort:1,//1为默认降序,2升序
            allLoaded:false,//判断是否还有更多数据，true无,false有

            //haveMoreDatas:true, //判断是否还有更多数据，true有,false无
        };
        this.pageNo = 1;//页数
        this.pageSize = 20;//默认每次请求60条数据

        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(418);
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
        this.getFoucusListData();

    }
    /**
     * 获取关注行业列表数据
     * */
    getFoucusListData(callBack){
        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;

        //直接按照研报数量排序
        params.sortField = 'reportTotal';

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

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.FOCUSINDUSTRY_LIST,params,
            (response)=>{

                if(response && response.list.length>0){

                    for (let i =0;i<response.list.length;i++){
                        let newItem = {};

                        newItem.id = response.list[i].id;
                        newItem.indusName = response.list[i].indusName;
                        newItem.indusCode = response.list[i].market+""+response.list[i].indusCode;

                        newItem.reportTotal = response.list[i].reportTotal ? response.list[i].reportTotal:'--';
                        newItem.mostOrgName = response.list[i].mostOrgName ? response.list[i].mostOrgName:'--';
                        newItem.mostOrgReports = response.list[i].mostOrgReports ? response.list[i].mostOrgReports:'--';
                        newItem.highestAttentionOrgName = response.list[i].highestAttentionOrgName ? response.list[i].highestAttentionOrgName:'--';
                        newItem.attentionRatio = response.list[i].attentionRatio!=null ? response.list[i].attentionRatio:'--';

                        this.state.data[0].items.push(newItem);

                    }

                    //页数+1
                    this.pageNo+=1;

                    this.setState({
                        data:this.state.data,
                        allLoaded:response.list.length<this.pageSize ? true:false,
                    },()=>{
                        if(callBack){
                            callBack();
                        }
                    });
                }else {

                    this.setState({
                        data:this.state.data,
                        allLoaded:true,
                    },()=>{
                        if(callBack){
                            callBack();
                        }
                    });
                }
            },
            (error)=>{
                if(callBack){
                    callBack();
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
                refreshHeader={mNormalHeader}
                renderFooter={this._renderMyFooters}
                showsHorizontalScrollIndicator={false}
                onLoading={() => {
                    this.getFoucusListData(()=>{
                        this._list.endLoading();
                    });
                }}
                onRefresh={() => {
                    this.pageNo=1;
                    this.getFoucusListData(()=>{
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
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{
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
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(100),flexDirection:"row",justifyContent:"center",alignItems:"center"
                    ,borderBottomWidth:0.5,borderColor:"#f1f1f1"}}>
                    <View style={{height:ScreenUtil.scaleSizeW(112),marginLeft:ScreenUtil.scaleSizeW(30),justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#000"}}>{item.indusName}</Text>
                        <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#666666"}}>{item.indusCode}</Text>
                    </View>
                    <View style={{flex:1,height:ScreenUtil.scaleSizeW(100),marginRight:ScreenUtil.scaleSizeW(30),justifyContent:"center",alignItems:"center"}}>

                        <View style={{flexDirection:"row",justifyContent:'center',alignItems:"center"}}>
                            <View style={{flex:1}}/>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.6)",marginRight:ScreenUtil.scaleSizeW(12)}}>所有机构研报总数</Text>
                            <View style={{borderRadius:ScreenUtil.scaleSizeW(8),backgroundColor:"#0078FF",justifyContent:"center",alignItems:"center",
                                paddingHorizontal:ScreenUtil.scaleSizeW(2),paddingVertical:0}}>
                                <Text style={{fontSize:ScreenUtil.setSpText(26),color:"white"}}>{item.reportTotal}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{flexDirection:"row",width:ScreenUtil.screenW,flex:1,paddingHorizontal:ScreenUtil.scaleSizeW(10)}}>
                    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                        <View style={{width:ScreenUtil.scaleSizeW(276),height:ScreenUtil.scaleSizeW(44),borderRadius:ScreenUtil.scaleSizeW(22),
                            backgroundColor:"#rgba(0,120,255,0.05)",justifyContent:"center",alignItems:"center",marginTop:ScreenUtil.scaleSizeW(19)}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(22),color:"#0066CC"}}>关注比最高机构名称</Text>
                        </View>
                        <View style={{flex:1,marginTop:Platform.OS==='android'?ScreenUtil.scaleSizeW(4):ScreenUtil.scaleSizeW(8),
                            justifyContent:"center",alignItems:"center",marginHorizontal:ScreenUtil.scaleSizeW(20)}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.6)",textAlign:"center"}} numberOfLines={2} >{item.highestAttentionOrgName}</Text>
                        </View>
                        <Image style={{ width:ScreenUtil.scaleSizeW(27),
                                height:ScreenUtil.scaleSizeW(13),
                                resizeMode:"stretch"}} source={require('../../../images/hits/up_triangle.png')}/>

                    <View style={{width:(ScreenUtil.screenW-ScreenUtil.scaleSizeW(100))/2,height:ScreenUtil.scaleSizeW(133),borderRadius:ScreenUtil.scaleSizeW(10),
                        backgroundColor:"#f2f8ff",justifyContent:"center",alignItems:"center",marginHorizontal:ScreenUtil.scaleSizeW(20),marginBottom:ScreenUtil.scaleSizeW(20)}}>
                        <Text style={{fontSize:ScreenUtil.setSpText(21),color:"rgba(0,102,204,0.6)"}}>关注比最高机构关注度占比</Text>
                        <StockFormatText precision={2} unit={'%'} useDefault={true}
                                         style={{fontSize:ScreenUtil.setSpText(30),color:"#0066CC",marginTop:Platform.OS==='android'?ScreenUtil.scaleSizeW(12):ScreenUtil.scaleSizeW(15)}}>{item.attentionRatio!='--'?item.attentionRatio/100:item.attentionRatio}</StockFormatText>
                    </View>
                    </View>

                    <View style={{width:0.5,height:ScreenUtil.scaleSizeW(302),backgroundColor:"#f6f6f6"}}/>
                    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                        <View style={{width:ScreenUtil.scaleSizeW(320),height:ScreenUtil.scaleSizeW(44),borderRadius:ScreenUtil.scaleSizeW(22),
                            backgroundColor:"#rgba(0,120,255,0.05)",justifyContent:"center",alignItems:"center",marginTop:ScreenUtil.scaleSizeW(19)}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(22),color:"#0066CC"}}>本行业研报数量多机构名称</Text>
                        </View>
                        <View style={{flex:1,marginTop:Platform.OS==='android'?ScreenUtil.scaleSizeW(4):ScreenUtil.scaleSizeW(8),
                            justifyContent:"center",alignItems:"center",marginHorizontal:ScreenUtil.scaleSizeW(20)}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(24),color:"rgba(0,0,0,0.6)",textAlign:"center"}} numberOfLines={2} >{item.mostOrgName}</Text>
                        </View>

                        <Image style={{ width:ScreenUtil.scaleSizeW(27),
                            height:ScreenUtil.scaleSizeW(13),
                            resizeMode:"stretch"}} source={require('../../../images/hits/up_triangle.png')}/>

                        <View style={{width:(ScreenUtil.screenW-ScreenUtil.scaleSizeW(100))/2,height:ScreenUtil.scaleSizeW(133),borderRadius:ScreenUtil.scaleSizeW(10),
                            backgroundColor:"#f2f8ff",justifyContent:"center",alignItems:"center",marginHorizontal:ScreenUtil.scaleSizeW(30),marginBottom:ScreenUtil.scaleSizeW(20)}}>
                            <Text style={{fontSize:ScreenUtil.setSpText(21),color:"rgba(0,102,204,0.6)"}}>本行业研报数量多机构研报数</Text>
                            <Text style={{fontSize:ScreenUtil.setSpText(30),color:"#0066CC",marginTop:Platform.OS==='android'?ScreenUtil.scaleSizeW(12):ScreenUtil.scaleSizeW(15)}}>{item.mostOrgReports}</Text>
                        </View>
                    </View>

                </View>





                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(16),backgroundColor:"#f1f1f1"}}/>
            </TouchableOpacity>
        );
    };

    /**
     * 加载可滑动列表的头布局
     * */
    _renderunLockHeader=()=>{
        return( <View style={{height:ScreenUtil.scaleSizeW(60),width:ScreenUtil.screenW}}>
            <View style={{ flex: 1,backgroundColor:"#f1f1f1", justifyContent: "center", alignItems: "center",flexDirection:"row"}}>
                <Text style={styles.onetext}>最近三个月被关注行业</Text>
                <View style={{flex:1}}/>
                <TouchableOpacity activeOpacity={0.7} onPress={()=>{this.sortViewPress(this.state.timeSort)}} style={{marginRight:ScreenUtil.scaleSizeW(30),flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                    <Text style={styles.onetext}>所有机构研报总数</Text>
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
                this.getFoucusListData();
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

    fixTitleOne:{
        width:ScreenUtil.scaleSizeW(180),
        justifyContent: "center",
        backgroundColor:"#ffffff",
        paddingLeft:ScreenUtil.scaleSizeW(20)
    },
    //表格需要的样式
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(30),
    },
    textFix:{
        width:ScreenUtil.scaleSizeW(420),
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
    headerTextFix: {
        alignItems: "center",
        backgroundColor: "#f2faff",
        paddingLeft:ScreenUtil.scaleSizeW(30),
        flexDirection:"row",
        width:ScreenUtil.scaleSizeW(420)
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
        height:ScreenUtil.scaleSizeW(42),
        borderRadius:ScreenUtil.scaleSizeW(21),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position:'absolute'
    },
});
