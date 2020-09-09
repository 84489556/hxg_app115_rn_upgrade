/**
 * Created by cuiwenjuan on 2019/8/16.
 * 跳转到这个页面
 * Navigation.pushForParams(this.props.navigation, 'MainInvestmentTab',{});
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
import BaseComponentPage from '../BaseComponentPage';
import PageHeader from '../../components/NavigationTitleView'
import * as  baseStyle from '../../components/baseStyle'
import MainInvestmentPage from './MainInvestmentPage'
// import {toast} from '../../utils/CommonUtils'
// import ScrollableTabView ,{ScrollableTabBar,DefaultTabBar} from "react-native-scrollable-tab-view";
import * as ScreenUtil from "../../utils/ScreenUtil";

// const tabType = {
//     hotOneTab:'一飞冲天',
//     hotTwoTab:'步步为赢',
//     hotThreeTab:'一箭三雕',
// }
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"

class MainInvestmentTab extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.state = {

        };


        // this.initPage = this._getInitPage(this.props.navigation.state.params.item.title);
        // console.log("传递的值！",this.initPage);
        this.selectedIndex = 0;//默认选中的就是Index = 0
        // console.log('主题投资 == ', this.props.navigation.state.params, this.initPage);
    }

    // _getInitPage = (title) => {
    //     let initPage = 0;
    //     switch (title){
    //         case tabType.hotOneTab:
    //             initPage = 0;
    //             break;
    //         case tabType.hotTwoTab:
    //             initPage = 1;
    //             break;
    //         case tabType.hotThreeTab:
    //             initPage = 2;
    //             break;
    //         default:
    //             break;
    //     }
    //     return initPage;
    // }


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
                //插入一条页面埋点统计记录
                BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.zhuticeluexiangqing);
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this.oneMainRef && this.oneMainRef.willBlur();
                // this.twoMainRef && this.twoMainRef.willBlur();
                // this.threeMainRef && this.threeMainRef.willBlur();
            }
        );
    }



    // _onChangeTab = (index) =>{
    //     this.selectedIndex = index.i;
    //     this._currentSelected();
    //     // console.log('热点风口 == ',JSON.stringify(index.i));
    // }

    _currentSelected(){
        if(this.selectedIndex === 0){
            this.oneMainRef && this.oneMainRef.willFocus();
            // this.twoMainRef && this.twoMainRef.willBlur();
            // this.threeMainRef && this.threeMainRef.willBlur();
        }else if(this.selectedIndex === 1){
            this.oneMainRef && this.oneMainRef.willBlur();
            // this.twoMainRef && this.twoMainRef.willFocus();
            // this.threeMainRef && this.threeMainRef.willBlur();
        }else if(this.selectedIndex === 2){
            this.oneMainRef && this.oneMainRef.willBlur();
            // this.twoMainRef && this.twoMainRef.willBlur();
            // this.threeMainRef && this.threeMainRef.willFocus();
        }
    }
    render() {
        return (
            <BaseComponentPage style={{flex:1}}>
                <PageHeader
                    onBack={() => this.onBack()}
                    navigation={this.props.navigation} titleText={"主题策略"}/>

                <MainInvestmentPage
                    ref = {(ref) => this.oneMainRef = ref }
                   // tabLabel=''
                    navigation={this.props.navigation}
                    tabIndex = {0}/>

            </BaseComponentPage>
        )

    }

}
//<ScrollableTabView
//                     initialPage={this.initPage}
//                     tabBarUnderlineStyle={{height:0}}
//                     tabBarActiveTextColor={baseStyle.BLUE_HIGH_LIGHT}
//                     tabBarInactiveTextColor={'#999999'}
//                     tabBarTextStyle = {{fontSize:ScreenUtil.scaleSizeW(24)}}
//                     locked={true}
//                     onChangeTab = {this._onChangeTab}
//                     renderTabBar={() =>
//                         <DefaultTabBar  tabStyle={styles.tabStyles} style={{height:ScreenUtil.scaleSizeW(60),borderBottomColor:"#ffffff"}}/>
//                     }>
//
//                     <MainInvestmentPage
//                         ref = {(ref) => this.twoMainRef = ref }
//                         tabLabel='步步为赢'
//                         navigation={this.props.navigation}
//                         tabIndex = {1}/>
//                     <MainInvestmentPage
//                         ref = {(ref) => this.threeMainRef = ref }
//                         tabLabel='一箭三雕'
//                         navigation={this.props.navigation}
//                         tabIndex = {2}/>
//                 </ScrollableTabView>


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
        fontSize:ScreenUtil.scaleSizeW(10),
        paddingBottom:ScreenUtil.scaleSizeW(8)
    }
});



export default  MainInvestmentTab