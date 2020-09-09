/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description: 只适用于两个tab切换样式的组件
 * tagDatas:数组的数据
 * activeIndex:默认选中的Item
 * indexCallBack:回调函数
 *
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import * as ScreenUtil from "../utils/ScreenUtil";



export default class FlowLayoutDouble extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex:this.props.activeIndex ? this.props.activeIndex:0,
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
        let colors =  this.state.activeIndex=== index? "white":"#999999";
        return(
        <TouchableOpacity key = {index} onPress={()=>{this.setState({activeIndex:index});this.props.indexCallBack(tab,index);}}
                          style={this.state.activeIndex=== 0? (index===0?styles.tagSelect:styles.tag):(index===0?styles.tagSelectNo:styles.tagSelects)}>
            <Text style={[styles.tagText,{color:colors}]}>{tab}</Text>
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
        width:(ScreenUtil.screenW-ScreenUtil.scaleSizeW(60))/2,
        height:ScreenUtil.scaleSizeW(44),
        borderTopRightRadius:ScreenUtil.scaleSizeW(22),
        borderBottomRightRadius:ScreenUtil.scaleSizeW(22),
        borderWidth:ScreenUtil.scaleSizeW(1),
        borderColor:"#999999",
        backgroundColor:"white",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
    },
    tagSelects: {
        width:(ScreenUtil.screenW-ScreenUtil.scaleSizeW(60))/2,
        height:ScreenUtil.scaleSizeW(44),
        borderTopRightRadius:ScreenUtil.scaleSizeW(22),
        borderBottomRightRadius:ScreenUtil.scaleSizeW(22),
        backgroundColor:"#3399FF",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
    },

    tagSelect: {
        width:(ScreenUtil.screenW-ScreenUtil.scaleSizeW(60))/2,
        height:ScreenUtil.scaleSizeW(44),
        borderTopLeftRadius:ScreenUtil.scaleSizeW(22),
        borderBottomLeftRadius:ScreenUtil.scaleSizeW(22),
        backgroundColor:"#3399FF",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
    },
    tagSelectNo: {
        width:(ScreenUtil.screenW-ScreenUtil.scaleSizeW(60))/2,
        height:ScreenUtil.scaleSizeW(44),
        borderTopLeftRadius:ScreenUtil.scaleSizeW(22),
        borderBottomLeftRadius:ScreenUtil.scaleSizeW(22),
        borderWidth:ScreenUtil.scaleSizeW(1),
        backgroundColor:"white",
        borderColor:"#999999",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
    },
    tagText:{
        fontSize:ScreenUtil.setSpText(24),
    }
});
