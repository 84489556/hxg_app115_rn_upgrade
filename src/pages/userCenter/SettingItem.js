/**
 * Created by cuiwenjuan on 2017/8/14.
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
} from 'react-native';
import {commonUtil} from '../../utils/CommonUtils'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';

export default class Setting extends Component{

    constructor(props) {
        super(props);
    }

    render() {
        return <View style={{backgroundColor:'#fff'}}>
        <TouchableOpacity
            style={{flexDirection:'row',
                alignItems:'center',
                height: commonUtil.rare(90),
                borderBottomColor:commonUtil.black_F1F1F1,
                // backgroundColor:commonUtil.white_FFFFFF,
                // backgroundColor:'#cd92ff',
                borderBottomWidth:this.props.isBlank ? 0:1,
                marginLeft:commonUtil.rare(30),
                marginRight:commonUtil.rare(30)}}
            onPress={this.props.onPress}
            disabled = {this.props.disabled}>
            <Image source={this.props.imageIcon}/>

            <Text style={[{
                // backgroundColor:'#8dff36',
                flex:1,
                fontSize:RATE(30),
                marginLeft:commonUtil.rare(30)
            },
                styles.textColorStyle]}>{this.props.text}
            </Text>

            <Text
                style={[{
                    // backgroundColor:'#ffa9d9',
                    marginRight:commonUtil.rare(this.props.isShowArrow ?0:20),
                    fontSize:RATE(24),opacity:1.0},
                    styles.textColorStyle,this.props.style]}
                numberOfLines={1}>
                {this.props.name}
            </Text>

            {this.props.hasHeader &&
                <Image
                    style={[{
                        // backgroundColor:'#cd92ff',
                        marginRight:commonUtil.rare(20),
                        height:commonUtil.rare(60),
                        width:commonUtil.rare(60)}]}
                    source = {{uri: this.props.headerName}} />
            }

            {
                this.props.isShowArrow ? null:<Image style={{}} source={require('../../images/userCenter/uc_right_arrow.png')}/>
            }

        </TouchableOpacity>
            {
                this.props.isBlank ?  <View style={{height:commonUtil.rare(20),backgroundColor:commonUtil.black_F6F6F6}}/> : null
            }
        </View>

    }

}



var styles = StyleSheet.create({
    textColorStyle :{
        color:commonUtil.black_262628,
    }
});