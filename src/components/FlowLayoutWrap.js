/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/7 17
 * description:流式布局，目前item样式只有两种宽度，一种是1/4,一种是1/2
 * tagDatas为外面传入的数据
 * isSingleSelect 是否为单选
 * indexCallBack(tab,index) 单选回调方法,直接回调item内容和index
 * activeIndex={this.state.valueSelectIn} 默认选中的View
 * callBackMany={(datas)=>{}}  多选回调很多标签 [{tabName:"",tabIndex:""}]
 * noCancle="" 表示等于这个值的标签不能选中取消
 * defaultIndex 默认的标签位置
 *
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform
} from 'react-native';

import * as ScreenUtil from '../utils/ScreenUtil';

export default class HitsPage extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex:this.props.activeIndex ? this.props.activeIndex:(this.props.isSingleSelect?-1:[]),//默认选择的位置,默认都不选择为-1
            isSingleSelect:this.props.isSingleSelect,//是否是单选
            tagDatas:this.props.tagDatas?this.props.tagDatas:[],//数据
            noCancle :this.props.noCancle ? this.props.noCancle:"",//不能取消的值

        }

        this.clearSelcetDatas = this.clearSelcetDatas.bind(this);


    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {
        //如果是多选状态
        if(this.props.isSingleSelect===false){
            if(this.state.tagDatas && this.state.tagDatas.length>0){
                let newDatas = [];
                for (let i = 0;i<this.state.tagDatas.length;i++ ){
                    let itemNewDatas = {};
                    itemNewDatas.tabs = this.state.tagDatas[i];
                    itemNewDatas.isCheck= false;
                    newDatas.push(itemNewDatas);
                }
                //console.log(this.props.activeIndex);
                if(this.props.activeIndex && this.props.activeIndex.length>0){
                    for (let j=0;j<this.s.activeIndex.length;j++){
                        newDatas[this.props.activeIndex[j]].isCheck = true;
                    }
                }
                this.setState({tagDatas:newDatas})
            }
        }else {

        }
    }
    /**
     * 页面加载完成
     * */
    componentDidMount() {

    }

    render() {
        if(this.props.isSingleSelect){
            return (
                <View style={styles.container}>
                    {this.state.tagDatas.map((tab,i) =>this.getTag(tab,i))}
                </View>
            )
        }else {

            if(this.state.tagDatas && this.state.tagDatas.length>0){
                return (
                    <View style={styles.container}>
                        {this.state.tagDatas.map((tab,i) =>this.getTagMany(tab,i))}
                    </View>
                )
            }else {
                return (
                    <View/>
                )
            }

        }
    }
    /**
     * item标签视图
     * */
    getTag(tab,index){
        let colors =  this.state.activeIndex=== index? "#EB3E45":"#666666";
        let backColor = this.state.activeIndex=== index? "#fbede9":"#ffffff";
        return(
            <TouchableOpacity key = {index} onPress={()=>{this.setState({activeIndex:index});this.props.indexCallBack(tab,index)}}
                              style={[styles.tag,{borderColor:colors==="#EB3E45"?"#E63E24":"#999999",backgroundColor:backColor,width:tab.length<=5?ScreenUtil.scaleSizeW(160):ScreenUtil.scaleSizeW(334)}]}>
                <Text style={[styles.tagText,{color:colors}]}>{tab}</Text>
            </TouchableOpacity>
        )
    }
    /**
     * 多选的按钮
     *
     * */
    getTagMany(tab,index){
        let colors =  tab.isCheck ? "#EB3E45":"#666666";
        let backColor = tab.isCheck === index? "#fbede9":"#ffffff";

        let canCanle = true;
        if(this.state.noCancle && this.state.noCancle == tab.tabs ){
            canCanle = false;
        }else {
            canCanle = true;
        }
        return(
            <TouchableOpacity key = {index} onPress={()=>{this.setCheckAndCallback(tab,index,canCanle)}}
                              style={[styles.tag,{borderColor:colors==="#EB3E45"?"#E63E24":"#999999",backgroundColor:backColor,width:tab.tabs.length<=5?ScreenUtil.scaleSizeW(160):ScreenUtil.scaleSizeW(334)}]}>
                <Text style={[styles.tagText,{color:colors}]}>{tab.tabs}</Text>
                {
                    tab.isCheck && canCanle===true?
                        <Image style={{width:ScreenUtil.scaleSizeW(24),height:ScreenUtil.scaleSizeW(24),position: 'absolute',right:0, bottom:Platform.OS==='android'?-1:0}}
                               source={require('../images/hits/tag_close.png')}
                        />
                        :
                        null
                }
            </TouchableOpacity>
        )

    }

    /**
     * 多选的情况下
     * 回调的函数,封装一下，回调数组[]
     * 里面是{tabName:"深圳A股",tabIndex:1"}
     * */
    setCheckAndCallback(tab,index,canCanle){
        if(canCanle===true){
            this.state.tagDatas[index].isCheck = !this.state.tagDatas[index].isCheck;
            //先刷新页面，再回调值
            this.setState({tagDatas:this.state.tagDatas},()=>{
                let callBackDatas = [];
                for (let i=0;i < this.state.tagDatas.length;i++){
                    if(this.state.tagDatas[i].isCheck===true){
                        let item = {};
                        item.tabName = this.state.tagDatas[i].tabs;
                        item.tabIndex = i;
                        //datas.splice(i,1);
                        callBackDatas.push(item)
                    }
                }
                this.props.callBackMany(callBackDatas);
            });
        }
    }

    /**
     * 清除选中的数据
     * 一般用于全部清除
     * */
    clearSelcetDatas(){
        let isSingle  = this.props.isSingleSelect!== undefined ? this.props.isSingleSelect: true ;
        if(isSingle){
            if(this.props.defaultIndex!==undefined){
                this.setState({
                    activeIndex : this.props.defaultIndex
                });
            }else {
                this.setState({
                    activeIndex : -1
                });
            }
        }else {
            if(this.state.tagDatas.length>0){
                for (let i = 0;i<this.state.tagDatas.length;i++){
                    //如果有不能清除的值，则不清楚
                    if(this.props.noCancle){
                        if(this.props.noCancle !=this.state.tagDatas[i].tabs){
                            this.state.tagDatas[i].isCheck = false;
                        }else {
                            this.state.tagDatas[i].isCheck = true;
                        }
                    }else {
                        this.state.tagDatas[i].isCheck = false;
                    }
                    if(this.props.defaultIndex!=undefined && this.props.defaultIndex== i ){
                        this.state.tagDatas[i].isCheck = true;
                    }

                }
                this.setState({tagDatas:this.state.tagDatas})
            }
        }
    }

    setAlreadySelect(){
        //如果是多选状态
        if(this.props.isSingleSelect===false){
            if(this.state.tagDatas && this.state.tagDatas.length>0){
                if(this.props.activeIndex && this.props.activeIndex.length>0){
                    for (let j=0;j<this.props.activeIndex.length;j++){
                        this.state.tagDatas[this.props.activeIndex[j]].isCheck = true;
                    }
                }
                this.setState({tagDatas:this.state.tagDatas})
            }
        }else {
            this.setState({activeIndex:this.props.activeIndex})
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
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal:ScreenUtil.scaleSizeW(25)
    },
    tag: {
        // width:ScreenUtil.scaleSizeW(112),
        height:ScreenUtil.scaleSizeW(60),
        borderRadius:ScreenUtil.scaleSizeW(6),
        borderWidth:ScreenUtil.scaleSizeW(1),
        marginHorizontal:ScreenUtil.scaleSizeW(5),
        marginVertical:ScreenUtil.scaleSizeW(13),
        backgroundColor:"white",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        //marginRight:ScreenUtil.scaleSizeW(10)
    },
    tagText:{
        fontSize:ScreenUtil.scaleSizeW(28),
    }
});
