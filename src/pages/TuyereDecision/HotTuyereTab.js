/**
 * Created by cuiwenjuan on 2019/8/13.
 */

import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    Platform,
} from 'react-native';
import BaseComponentPage from '../../pages/BaseComponentPage';
import PageHeader from '../../components/NavigationTitleView'
import * as  baseStyle from '../../components/baseStyle'
import HotTuyerePage from './HotTuyerePage'
import {toast} from '../../utils/CommonUtils'
import ScrollableTabView ,{ScrollableTabBar,DefaultTabBar} from "react-native-scrollable-tab-view";

const tabType = {
    hotOneTab:'一飞冲天',
    hotTwoTab:'步步为赢',
    hotThreeTab:'一箭三雕',
}

// item:
//     title: "底部一买战法"
// type: "热点风口"
import * as ScreenUtil from '../../utils/ScreenUtil';
class HotTuyereTab extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.initPage = this._getInitPage(this.props.navigation.state.params.item.title)

        this.state = {
        };
        this.selectedIndex = this.initPage;


        // console.log('热点风口 == ', this.props.navigation.state.params, this.initPage);
    }

    _getInitPage = (title) => {
        let initPage = 0;
        switch (title){
            case tabType.hotOneTab:
                initPage = 0;
                break;
            case tabType.hotTwoTab:
                initPage = 1;
                break;
            case tabType.hotThreeTab:
                initPage = 2;
                break;
            default:
                break;
        }
        return initPage;
    }


    componentWillMount() {
        super.componentWillMount();
        this._addListeners();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    _addListeners() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
              this._currentSelected();
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this.oneHotRef && this.oneHotRef.willBlur();
                this.twoHotRef && this.twoHotRef.willBlur();
                this.threeHotRef && this.threeHotRef.willBlur();
            }
        );
    }

    _onChangeTab = (index) =>{

        this.selectedIndex = index.i;
        this._currentSelected();
        // console.log('热点风口 == ',JSON.stringify(index.i));
    }

    _currentSelected(){
        if(this.selectedIndex === 0){
            this.oneHotRef && this.oneHotRef.willFocus();
            this.twoHotRef && this.twoHotRef.willBlur();
            this.threeHotRef && this.threeHotRef.willBlur();
        }else if(this.selectedIndex === 1){
            this.oneHotRef && this.oneHotRef.willBlur();
            this.twoHotRef && this.twoHotRef.willFocus();
            this.threeHotRef && this.threeHotRef.willBlur();
        }else if(this.selectedIndex === 2){
            this.oneHotRef && this.oneHotRef.willBlur();
            this.twoHotRef && this.twoHotRef.willBlur();
            this.threeHotRef && this.threeHotRef.willFocus();
        }
    }

    render() {

        return (
            <BaseComponentPage style={{flex:1}}>
                <PageHeader
                    onBack={() => this.onBack()}
                    navigation={this.props.navigation} titleText={"热点风口"}/>

                <ScrollableTabView
                    initialPage={this.initPage}
                    tabBarUnderlineStyle={{height:0}}
                    tabBarActiveTextColor={baseStyle.BLUE_HIGH_LIGHT}
                    tabBarInactiveTextColor={'#999999'}
                    tabBarTextStyle = {{fontSize:ScreenUtil.scaleSizeW(24)}}
                    locked={true}
                    onChangeTab = {this._onChangeTab}
                    renderTabBar={() =>
                        <DefaultTabBar tabStyle={styles.tabStyles} style={{height:ScreenUtil.scaleSizeW(60),borderBottomColor:"#ffffff"}}/>
                    }>
                    <HotTuyerePage
                        ref = {(ref) => this.oneHotRef = ref }
                        tabLabel='一飞冲天'
                        navigation={this.props.navigation}
                        tabIndex = {0}/>
                    <HotTuyerePage
                        ref = {(ref) => this.twoHotRef = ref }
                        tabLabel='步步为赢'
                        navigation={this.props.navigation}
                        tabIndex = {1}/>
                    <HotTuyerePage
                        ref = {(ref) => this.threeHotRef = ref }
                        tabLabel='一箭三雕'
                        navigation={this.props.navigation}
                        tabIndex = {2}/>
                </ScrollableTabView>

            </BaseComponentPage>
        )

    }

}


var styles = StyleSheet.create({
    textFont:{
        fontSize:12,
        color:baseStyle.BLACK_000000_60,
    },
    itemViewStyle:{
        paddingRight:16,
        paddingLeft:14,
        backgroundColor:"#fff",
        flexDirection:'row'
    },
    tabStyles:{
        height: ScreenUtil.scaleSizeW(60),
        paddingBottom:ScreenUtil.scaleSizeW(8)
    }
});



export default  HotTuyereTab