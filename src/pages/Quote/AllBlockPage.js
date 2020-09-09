'use strict';

import React from 'react';
import { DeviceEventEmitter } from 'react-native';
import BaseComponentPage from '../../pages/BaseComponentPage';
import NavigationTitleView from '../../components/NavigationTitleView';
import BlockList from './BlockList.js';
import * as baseStyle from "../../components/baseStyle.js";

export default class AllBlockPage extends BaseComponentPage {

    static defaultProps = {
        mainkey: '',
    };

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.navigation.state.params.mainkey === 'allIndustry') {
            return (
                <BaseComponentPage style={{ flex: 1, backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR }}>
                    <NavigationTitleView
                        onBack={() => {
                            Navigation.pop(this.props.navigation)
                        }}
                        titleText={"行业板块"} />
                    <BlockList gql='block=股票\\大智慧自定义\\行业板块'
                        src='all'
                        params={{ desc: true }}
                        mainkey={this.props.navigation.state.params.mainkey}
                        title='行业板块'
                        navigation={this.props.navigation} ref="list" />
                </BaseComponentPage>
            )
        } else if (this.props.navigation.state.params.mainkey === 'allConcept') {
            return (
                <BaseComponentPage style={{ flex: 1, backgroundColor: baseStyle.DEFAULT_BACKGROUND_COLOR }}>
                    <NavigationTitleView
                        onBack={() => {
                            Navigation.pop(this.props.navigation)
                        }}
                        titleText={"概念板块"} />
                    <BlockList gql='block=股票\\大智慧自定义\\热门概念'
                        src='all'
                        mainkey={this.props.navigation.state.params.mainkey}
                        title='概念板块'
                        params={{ desc: true }}
                        navigation={this.props.navigation} ref="list1" />
                </BaseComponentPage>
            )
        } else { 
            return null;
        }
    }
}