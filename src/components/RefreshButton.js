
import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    Dimensions,
    Image,
    View
} from 'react-native';

import PropTypes from 'prop-types';
import {commonUtil} from '../utils/CommonUtils'
import *as baseStyle from '../components/baseStyle'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../utils/fontRate.js';

export default class RefreshButton extends Component{

    static propTypes = {
        style: PropTypes.object,
    };

    static defaultProps = {
        selected: false,
    };
    constructor(props) {
        super(props);

    }

    onPress=() => {

        this.props.onPress && this.props.onPress();
    };

    render() {
        return  (
            <TouchableOpacity onPress={()=>{this.onPress()}}
                              activeOpacity = {0.7}
                              style={[{
                                  height:commonUtil.rare(60),
                                  borderRadius:commonUtil.rare(15),
                                  width:commonUtil.width-commonUtil.rare(20),
                                  marginLeft:commonUtil.rare(10),
                                  flexDirection: 'row',
                                  position: "absolute",
                                  justifyContent:'space-between',
                                  alignItems:'center',
                                  backgroundColor: "#3bb4ff"},this.props.style]}>

                <View style={{width:commonUtil.rare(40),marginLeft:commonUtil.rare(10)}}/>
                <Text style={{color: '#fff',fontSize:RATE(24)}} >股池已更新，请点击刷新查看</Text>

                <Image style={{width:commonUtil.rare(40),height:commonUtil.rare(40),resizeMode:"contain",marginRight:commonUtil.rare(10)}} source={require('../images/hits/refresh_button.png')}/>
            </TouchableOpacity>
        )

    }
}

