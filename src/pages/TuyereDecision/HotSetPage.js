/**
 * Created by cuiwenjuan on 2019/8/16.
 * 原来热点风口页面 的 热点设置界面，现在应该是没有使用了,
 */
import React, { Component } from 'react';
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
import { toast, commonUtil } from '../../utils/CommonUtils'
import Yd_cloud from '../../wilddog/Yd_cloud'
import { ConditionsSetPage } from '../MainDecision/MoneyRevelationSetPage'
import NoDataPage from '../NoDataPage'

let refPath = Yd_cloud().ref(MainPathYG);
//部分源达云节点修改为MainPathYG2
let refPath2 = Yd_cloud().ref(MainPathYG);
//选股范围
// 主题投资的 ，选股范围  /ydhxgtest/ZhuTiTouZi/ZhuTiTouZiNew
// 热点风口的 ，选股范围  /ydhxgtest/ReDianFengKou/ReDianFengKouNew

// 主题投资，最近五天的板块  /ydhxgtest/ZhuTiTouZi/ZhuTiTouZiFive
// 热点风口，最近五天的板块  /ydhxgtest/ReDianFengKou/ReDianFengKouFive

//strs=str.split(",");

//主题投资
let mainInvestment = {
    'scope': 'ZhuTiTouZi/ZhuTiTouZiNew',
    'fiveDay': 'ZhuTiTouZi/ZhuTiTouZiFive',
}

//热点风口
let hotTuyere = {
    'scope': 'ReDianFengKou/ReDianFengKouNew',
    'fiveDay': 'ReDianFengKou/ReDianFengKouFive',
}

class HotSetPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.state = {
            datas: [],
            scopeData: '',
            canSelected: false,
        }

        this.title = this.props.navigation.state.params &&
            this.props.navigation.state.params.title && this.props.navigation.state.params.title;
        this.setData = this.props.navigation.state.params &&
            this.props.navigation.state.params.setData && this.props.navigation.state.params.setData;
        let refHotSet = hotTuyere;
        if (this.title === '主题设置') {
            refHotSet = mainInvestment;
            this.refScope = refPath2.ref(refHotSet.scope);
        }else {
            this.refScope = refPath.ref(refHotSet.scope);
        }

        this.refFiveDay = refPath.ref(refHotSet.fiveDay);
    }


    componentWillMount() {
        super.componentWillMount();

        if (this.title === '主题设置') {
            this._loadMainData();
        } else {
            this._loadHotData();
        }

    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    _loadMainData() {
        let pg = this;
        this.refScope.get((snapshot) => {
            // console.log('主题设置  范围： = ',JSON.stringify(snapshot.nodeContent) );
            if (snapshot.nodeContent) {
                let values = Object.values(snapshot.nodeContent);
                let scopeS = undefined;
                values.map((info) => {
                    scopeS = scopeS ? scopeS + ',' + info : info;
                });
                // console.log('主题设置  范围：2 = ',scopeS );
                pg.setState({ scopeData: scopeS })
            }
        });

        this.refFiveDay.get(function (snapshot) {
            // console.log('主题设置  最近五天： = ',JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                let values = Object.values(snapshot.nodeContent);
                let newValues = [];
                let canSelected = pg.state.canSelected;
                values.map((info) => {
                    let message = {};
                    message.title = info;
                    message.selected = pg.setData.indexOf(info) > -1 ? true : false;

                    if (message.selected) {
                        canSelected = true;
                    }

                    newValues.push(message);
                })
                pg.setState({ datas: newValues, canSelected: canSelected })
            }
        });
    }

    _loadHotData() {
        let pg = this;
        this.refScope.get((snapshot) => {
            //console.log('热点设置  范围： = ',JSON.stringify(snapshot.nodeContent),this.state );
            if (snapshot.nodeContent) {
                pg.setState({ scopeData: snapshot.nodeContent })
            }
        });

        this.refFiveDay.get(function (snapshot) {
            // console.log('热点设置  最近五天： = ',JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                let contentString = snapshot.nodeContent;
                let values = contentString.split(",");
                let newValues = [];
                let canSelected = pg.state.canSelected;
                values.map((info) => {
                    let message = {};
                    message.title = info;
                    message.selected = pg.setData.indexOf(info) > -1 ? true : false;

                    if (message.selected) {
                        canSelected = true
                    }

                    newValues.push(message);
                })
                pg.setState({ datas: newValues, canSelected: canSelected })
            }
        });
    }

    _loadData() {

        let pg = this;
        this.refScope.get((snapshot) => {
            //console.log('设置页面  范围： = ', JSON.stringify(snapshot.nodeContent), this.state);
            if (snapshot.nodeContent) {
                pg.setState({ scopeData: snapshot.nodeContent })
            }
        });

        this.refFiveDay.get(function (snapshot) {
            // console.log('设置页面  最近五天： = ',JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                let contentString = snapshot.nodeContent;
                let values = contentString.split(",");
                let newValues = [];
                values.map((info) => {
                    let message = {};
                    message.title = info;
                    message.selected = false;
                    newValues.push(message);
                })
                pg.setState({ datas: newValues })
            }
        });

    }

    onBack(selectedString) {

        if (selectedString !== undefined) {
            let selectedS = selectedString ? selectedString : '';
            this.props.navigation.state.params &&
                this.props.navigation.state.params.callBack &&
                this.props.navigation.state.params.callBack(selectedS);
        }

        Navigation.pop(this.props.navigation);
    }


    _selectClick(info, index) {
        this.setState({
            datas: info,
            canSelected: true,
        })

    }

    _getNoSelected() {
        let newArray = [];
        let canSelected = this.state.canSelected;
        this.state.datas.map((info, index) => {
            info.selected = false;

            if (info.selected) canSelected = true;
            newArray.push(info);
        })
        this.setState({
            datas: newArray,
            canSelected: canSelected,
        })
    }

    _getSelected() {
        let selectedString = undefined;
        this.state.datas.map((info, index) => {
            if (info.selected) {
                selectedString = selectedString ? selectedString + ',' + info.title : info.title;
            }
        })

        selectedString = selectedString ? selectedString : '';

        // console.log('热点设置 选股 = ',selectedString);
        return selectedString;
    }


    _cleanSelected() {
        this._getNoSelected();
    }

    _startSelect() {
        this.onBack(this._getSelected())
    }

    render() {

        let title = '更多热点';
        if (this.title === '主题设置') {
            title = '更多主题'
        }
        if (this.state.datas.length <= 0) {
            if (this.title === '主题设置') {
                title = '暂无更多主题'
            }
            title = '暂无更多热点'
        }
        let buttonBG = baseStyle.BLACK_999999;
        if (this.state.canSelected) {
            buttonBG = baseStyle.BLUE_HIGH_LIGHT;
        }

        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <PageHeader
                    onBack={() => this.onBack()}
                    navigation={this.props.navigation} titleText={this.title} />
                <View style={{
                    backgroundColor: baseStyle.LINE_BG_F6,
                    height: 31,
                    paddingLeft: 15,
                    justifyContent: 'center'
                }}>
                    <Text style={{ fontSize: 12, color: baseStyle.BLACK_000000_40 }}>{'选股范围：' + this.state.scopeData}</Text>
                </View>
                {
                    this.state.datas.length > 0 ? <View>
                        <Text style={{
                            marginTop: 15,
                            marginLeft: 15,
                            fontSize: 15,
                            fontWeight: 'bold',
                        }}>{title}</Text>
                        <ConditionsSetPage
                            data={this.state.datas}
                            onPress={(info) => this._selectClick(info)}
                        />
                    </View>
                        :
                        <NoDataPage
                            style={{ backgroundColor: '#fff' }}
                            content={title}
                            source={require('../../images/TuyereDecision/no_stock_data.png')}
                            isNoShow={true} />
                }

                <View style={{ flex: 1 }} />
                {
                    this.state.datas.length > 0 &&
                    <View style={{
                        justifyContent: 'space-between',
                        height: 44,
                        borderTopColor: baseStyle.LINE_BG_F6,
                        borderTopWidth: 1,
                        flexDirection: 'row'
                    }}>
                        <TouchableOpacity
                            onPress={() => this._cleanSelected()}
                            style={{
                                flex: 1,
                                paddingLeft: 15,
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}>
                            <Image source={require('../../images/hits/screen_delete.png')} />
                            <Text style={{ fontSize: 15, color: baseStyle.BLACK_333333, marginLeft: 5 }}>{'清空已选'}</Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this._startSelect()}
                            style={{
                                flex: 1,
                                width: commonUtil.rare(280),
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: buttonBG
                            }}>
                            <Text style={{ fontSize: 15, color: baseStyle.WHITE }}>{'开始选股'}</Text>
                        </TouchableOpacity>
                    </View>
                }


            </BaseComponentPage>
        )

    }

}


var styles = StyleSheet.create({
    itemViewStyle: {
        paddingRight: 16,
        paddingLeft: 14,
        backgroundColor: "#fff",
        flexDirection: 'row'
    },
});



export default HotSetPage;