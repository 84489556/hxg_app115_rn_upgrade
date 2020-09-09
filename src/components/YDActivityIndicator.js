/**
 * Created by cuiwenjuan on 2017/8/16.
 */

/**
 * Created by cuiwenjuan on 2017/8/7.
 */

import React, { PureComponent } from 'react';
import {
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    View,
    Image,
    Modal
} from 'react-native';

var {height, width} = Dimensions.get('window');

class YDActivityIndicator extends PureComponent {
    constructor(props) {
        super(props);
    }

    loading(){
        return(

            <View style={{flex:1,
                alignItems:'center',
                justifyContent:'center',
                position:'absolute',
                top:0,bottom:0,left:0,right:0}}>
                <Image source={require('../images/icons/loading.gif')}/>
            </View>
        )
    }

    render() {
        return (
            this.props.animating? this.loading() : null
        );
    };
}

export default YDActivityIndicator;