/**
 * Created by jzg on 2017/9/12.
 * 空数据提示页
 */

'use strict';

import React, {Component} from "react";
import {Image, Text, View} from "react-native";
import * as baseStyle from "../components/baseStyle";
import RATE from "../utils/fontRate";
import PageHeader from '../components/PageHeader';

export default class NoDataPage extends Component {

    static defaultProps = {
        content: '人家还没有准备好见你，再等一下下',
        source:require('../images/userCenter/uc_no_data.png')
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {...rest } = this.props
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#f6f6f6',
            }}
                  {...rest}
            >
                {this.props.isNoShow?null:<PageHeader title = '早知晓'
                            onBack={() => {
                                if(this.props.back){
                                    this.props.back()
                                }else{
                                    Navigation.pop(this.props.navigation)
                                }

                            }}
                />}
                <View style={{
                    flex: 1,
                    backgroundColor: '#f6f6f6',
                    alignItems: 'center'
                }}>
                    <View style={{height: 235, alignItems: 'center', justifyContent: 'flex-end'}}>
                        <Image source={this.props.source}/>
                    </View>
                    <View style={{marginTop: 20,height: 40}}>
                        <Text style={{
                            fontSize: RATE(28),
                            color: baseStyle.BLACK_70,
                        }}>{this.props.content}</Text>
                    </View>
                    {/*<Text>重新加载</Text>*/}
                </View>
            </View>

        );
    }
}
