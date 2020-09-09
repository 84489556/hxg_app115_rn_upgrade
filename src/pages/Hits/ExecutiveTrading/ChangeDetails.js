/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/26 17
 * description:集中买入持续买入变动详情页面
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
import  NavigationTitleView from "../../../components/NavigationTitleView";
import  BaseComponentPage from "../../../pages/BaseComponentPage";
import RequestInterface from "../../../actions/RequestInterface";
import HitsApi from "../Api/HitsApi";
import * as ScreenUtil from "../../../utils/ScreenUtil";
import {mNormalFooter} from "../../../components/mNormalFooter";
import { LargeList } from "react-native-largelist-v3";
import NorMalOneText from '../../../components/NorMalOneText';
import  StockFormatText from '../../../components/StockFormatText';

export default class ChangeDetails extends BaseComponentPage<Props> {

    constructor(props) {
        super(props);
        this.state = {
            keyWord: this.props.navigation.state.params.keyWord ? this.props.navigation.state.params.keyWord :"",//上个页面传递的页面关键词,
            keyWordCode: this.props.navigation.state.params.keyWordCode ? this.props.navigation.state.params.keyWordCode :"",//上个页面传递的页面关键词,

            data:[
                {
                    sectionTitle: "",
                    items: []
                }
            ],//List数据,
            allLoaded:true,
            desc:true,//按照交易日的排序字段
        };
        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(70);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
        this.FOOTTER_HEIGHT = 50;

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
        this.getSaleDetail(this.state.keyWordCode);
    }

    /**
     * 请求高管交易明细
     * */
    getSaleDetail(secCode){
        if(secCode && secCode!==""){
            let params = {};
            params.seccode = secCode;
            params.desc = this.state.desc;

            this.state.data[0].items = [];
            RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.FOCUS_BUY_DETAILS,params,
                (response)=>{
                    if(response && response.length>0){
                        for (let i =0 ; i< response.length;i++){
                            this.state.data[0].items.push(response[i])
                        }
                        this.setState({data:this.state.data});

                    }else {
                        this.setState({data:this.state.data});
                    }
                },
                (error)=>{

                })
        }
    }

    render() {
        return (
            <BaseComponentPage style={styles.container}>
                <NavigationTitleView navigation={this.props.navigation} titleText={this.state.keyWord+"高管持股变动"}/>

                <LargeList
                    ref={ref => (this._list = ref)}
                    style={styles.container}
                    data={this.state.data}
                    heightForSection={() =>this.HEADER_HEGHT}
                    renderHeader={this._renderunLockHeader}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => this.ITEM_HEGHT}
                    renderIndexPath={this._renderIndexPath}
                    allLoaded={this.state.allLoaded}
                    loadingFooter={mNormalFooter}
                    onLoading={() => {}}
                />


            </BaseComponentPage>
        )
    }
    /**
     * 点击交易日期排序
     * */
    sortViewPress(desc){
        this.setState({
            desc:!desc
        },()=>{
            this.getSaleDetail(this.state.keyWordCode);
        })

    }
    /**
     * 头布局
     * */
    _renderunLockHeader=()=>{
        return (
        <View style={{width:ScreenUtil.screenW,backgroundColor:"#fff"}}>
            <NorMalOneText textContent={"最近60个交易日"}/>
        </View>)

    };
    /**
     * SectionTitle
     * 悬停的View
     * */
    _renderSection = (section: number) => {
        return (
            <View style={styles.itemShowView}>
                <Text style={{width:ScreenUtil.scaleSizeW(190),fontSize:ScreenUtil.setSpText(24),color:"#3d3d3d",marginLeft:ScreenUtil.scaleSizeW(24)}}>变动人</Text>
                <Text style={{width:ScreenUtil.scaleSizeW(190),fontSize:ScreenUtil.setSpText(24),color:"#3d3d3d"}}>成交价格</Text>
                <Text style={{flex:1,fontSize:ScreenUtil.setSpText(24),color:"#3d3d3d"}}>买入数量</Text>

                <TouchableOpacity onPress={()=>{this.sortViewPress(this.state.desc)}} style={{ height:ScreenUtil.scaleSizeW(60),flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                    <Text style={{fontSize:ScreenUtil.setSpText(24),color:"#3d3d3d"}}>交易日</Text>
                    {this.getSortView(this.state.desc)}
                </TouchableOpacity>

            </View>
        );
    };
    /**
     * 获取标题
     * 后面排序的View
     *
     * */
    getSortView(conCode){
        let sortView ;
        if(conCode){
            sortView = <Image style={styles.sortView} source={require('../../../images/hits/positive.png')}/>;
        }else {
            sortView = <Image style={styles.sortView} source={require('../../../images/hits/negative.png')}/>;
        }
        return sortView;
    }

    _renderIndexPath= (path: IndexPath) =>{
        const item = this.state.data[path.section].items[path.row];
        return (<View style={styles.itemTableView}>
                <Text style={{width:ScreenUtil.scaleSizeW(190), fontSize:ScreenUtil.setSpText(28),color:"#000000"}} numberOfLines={1}>{item.changer}</Text>
                <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{width:ScreenUtil.scaleSizeW(190),fontSize:ScreenUtil.setSpText(28),color:"#000000"}}>{item.transPrice}</StockFormatText>
                <StockFormatText precision={2} unit={'股/万股/亿股'} useDefault={true} style={{flex:1,fontSize:ScreenUtil.setSpText(28),color:"#000000"}}>{item.shareBuyNet}</StockFormatText>
                <Text style={{fontSize:ScreenUtil.setSpText(28),color:"#3d3d3d",textAlign:"right",marginRight:ScreenUtil.scaleSizeW(10)}}>{item.chgDate && item.chgDate.length>10 ? item.chgDate.substring(5,10): ""}</Text>
            </View>)
    }

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
    itemShowView:{
        flex:1,
        height:ScreenUtil.scaleSizeW(60),
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center",
        backgroundColor:"#f2faff"
    },
    itemTableView:{
        flex:1,
        width:ScreenUtil.screenW -ScreenUtil.scaleSizeW(48),
        height:ScreenUtil.scaleSizeW(70),
        borderColor:"#e8e8e8",
        borderBottomWidth:0.5,
        flexDirection:"row",
        alignItems:"center",justifyContent:"center",
        marginLeft:ScreenUtil.scaleSizeW(24)
    },
    sortView:{
        width:ScreenUtil.scaleSizeW(12),
        height:ScreenUtil.scaleSizeW(24),
        resizeMode:"contain",
        marginLeft:ScreenUtil.scaleSizeW(6),
        marginRight:ScreenUtil.scaleSizeW(10)
    },

});
