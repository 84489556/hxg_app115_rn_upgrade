/**
 * Created by cuiwenjuan on 2017/7/6.
 */
import React, {PureComponent} from "react";
import {Image, StyleSheet, Text, View} from "react-native";

import Button from "./Button";
import * as baseStyle from "../components/baseStyle.js";
import RATE from "../utils/fontRate";

class UpDownButton extends PureComponent {

    static defaultProps = {
        title: '涨跌幅',
    };

    constructor(props) {
        super(props);
        this.state = {
            desc: this.props.desc,
        };
    }


    _upButton() {
        this.setState({desc: !this.state.desc});
        this.props.onPress(!this.state.desc);
    }

    _downButton() {
        this.setState({desc: false});
        this.props.onPress(false);
    }

    render() {

        let imageU = () =>{

            //
            let image;

            if(!this.props.desc){
                image =  require('../images/icons/arrow_down_up.png')
            }else {
                image = require('../images/icons/arrow_up_down.png')
                if(this.props.desc === 1){
                    image = require('../images/icons/arrow_up_down.png')

                }else if(this.props.desc === 2){
                    image = require('../images/icons/arrow_green.png')
                }
            }
            return image;
        }


        return (
            <View style={[LoginStyles.TextInputView, this.props.containerStyle]}>
                <Button onPress={this._upButton.bind(this)}
                        containerStyle={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                    <Text
                          style={{
                              color: baseStyle.BLACK_70,
                              textAlign: 'center',
                              fontSize: RATE(24),
                              // includeFontPadding: false,
                          }}>{this.props.title}</Text>

                    <Image style={{
                        marginLeft: 5,
                    }}
                           source={imageU()}/>
                </Button>
                {/*<Button onPress={this._downButton.bind(this)} containerStyle={{flex:1,alignItems: 'center', justifyContent: 'center'}}>*/}
                {/*<Image style={{width: 10, height: 8, marginHorizontal: 5}}*/}
                {/*source={this.state.desc ? require('../images/ic_tab_center.png') : require('../images/ic_tab_center_press.png')}/>*/}
                {/*</Button>*/}
            </View>
        );
    }
}

const LoginStyles = StyleSheet.create({
    TextInputView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#ffffff',
    },
});

export default UpDownButton;