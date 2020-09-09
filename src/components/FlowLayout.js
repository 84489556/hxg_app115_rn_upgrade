/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description: 一行带标签的布局
 * tagDatas:数组的数据
 * activeIndex:默认选中的Item
 *indexCallBack:回调函数
 * selecExtraString :选中后额外需要增加的字符串,不需要则不加
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import * as ScreenUtil from "../utils/ScreenUtil";



export default class FlowLayout extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex:this.props.activeIndex ? this.props.activeIndex:0,
            selecExtraString:this.props.selecExtraString ? this.props.selecExtraString:"",//选中后需要额外增加的值
        }

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


    }

    render() {
        let tags = this.props.tagDatas;
        // console.log("内部", tags)
        return (
            <View style={styles.container}>
                {tags.map((tab,i) =>this.getTag(tab,i))}
            </View>
        )
    }
    /**
     * item标签视图
     * */
    getTag(tab,index){
        let bdcolors =  this.state.activeIndex=== index? "#6699ff":"#b5b5b5";
        let txcolors =  this.state.activeIndex=== index? "#ffffff":"#b5b5b5";
        let bgcolors =  this.state.activeIndex=== index? "#6699ff":"#ffffff";
        let tabs = this.state.activeIndex=== index? (this.state.selecExtraString===""? tab: tab+this.state.selecExtraString+""):tab;
        return(
        <TouchableOpacity key = {index} onPress={()=>{this.setState({activeIndex:index});this.props.indexCallBack(tab,index);}}
                          style={[styles.tag,{backgroundColor:bgcolors,borderColor:bdcolors }]}>
            <Text style={[styles.tagText,{color:txcolors}]}>{tabs}</Text>
        </TouchableOpacity>
        )

    }
    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        width:ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(70),
        backgroundColor:"white",
        flexDirection:"row",
        alignItems:"center",
        paddingHorizontal:ScreenUtil.scaleSizeW(30)
    },
    tag: {
       // width:ScreenUtil.scaleSizeW(112),
        height:ScreenUtil.scaleSizeW(44),
        borderRadius:ScreenUtil.scaleSizeW(22),
        borderWidth:ScreenUtil.scaleSizeW(1),
        paddingHorizontal:ScreenUtil.scaleSizeW(15),
        backgroundColor:"white",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        marginRight:ScreenUtil.scaleSizeW(10)
    },
    tagText:{
        fontSize:ScreenUtil.scaleSizeW(24),
    }
});
