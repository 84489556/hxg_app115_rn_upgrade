/**
 * Created by jzg on 2017/8/21.
 * 网络错误提示页
 */

'use strict';

import React, {Component} from "react";
import {Image, Text, View} from "react-native";
import * as baseStyle from "../components/baseStyle";
import RATE from "../utils/fontRate";
import PageHeader from '../components/PageHeader';

export default class NoNetPage extends Component {

    static defaultProps = {
        content: '亲亲，咱已经失联了',
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#f6f6f6',
            }}>
                <PageHeader title = '早知晓'
                            onBack={() => {
                                if(this.props.back){
                                    this.props.back()
                                }else{
                                    Navigation.pop(this.props.navigation)
                                }
                            }}
                />
                <View style={{
                    flex: 1,
                    backgroundColor: '#f6f6f6',
                    alignItems: 'center'
                }}>
                    <View style={{height: 235, alignItems: 'center', justifyContent: 'flex-end'}}>
                        <Image source={require('../images/icons/no_net_img.png')}/>
                    </View>
                    <View style={{marginTop: 20}}>
                        <Text style={{
                            fontSize: RATE(28),
                            color: baseStyle.BLACK_70,
                        }}>{this.props.content}</Text>
                    </View>
                    {/*<Text>检查网络</Text>*/}
                </View>
            </View>

        );
    }
}
