/*
 * @Author: lishuai 
 * @Date: 2019-08-28 15:13:54 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-08-28 10:33:15
 * 热点聚焦详情页
 */
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as baseStyle from '../../components/baseStyle';
import NavigationTitleView from '../../components/NavigationTitleView';
import ContentSourceComponent from '../../components/RiskWarning';
import RiskWarning from '../../components/RiskTipsFooterView';
import HtmlView from '../../lib/htmlRender2';
import BaseComponentPage from '../../pages/BaseComponentPage';
import YdCloud from '../../wilddog/Yd_cloud';

export default class HotFocusDetailPage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.id = this.props.navigation.state.params.id;
        this.state = {
            data: null
        };
    }
    componentDidMount() {
        this._loadData();
    }
    _loadData() {
        YdCloud().ref(MainPathYG + 'ZhuanJiaFenXi/ReDianJuJiao/' + this.id).get(snap => {
            if (snap.code == 0) {
                let value = snap.nodeContent;
                if (!value) return;
                let stocks = value.stocks;
                let keys = Object.keys(snap.nodeContent);
                try {
                    let newStocks = Object.values(stocks);
                    value.stocks = newStocks;
                } catch (error) {
                    value.stocks = [];
                }
                this.setState({ data: value })
            }
        });
    }
    _stockOnClick(item, index) {
        let newItem = { Obj: item.codePrefix + item.code, ZhongWenJianCheng: item.name };
        let array = this.state.data.stocks.map((value) => {
            return { Obj: value.code, ZhongWenJianCheng: value.name }
        });
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...newItem,
            array: array,
            index: index,
            isPush: true
        });
    }

    _renderStockView() {
        var views = [];
        for (let i = 0; i < this.state.data.stocks.length; i++) {
            let item = this.state.data.stocks[i];
            views.push(
                <TouchableOpacity key={i} style={{ margin: 3 }} activeOpacity={1} onPress={() => this._stockOnClick(item, i)}>
                    <ImageBackground
                        style={{ flexDirection: 'row', width: (baseStyle.width - 36) / 2, height: 60, justifyContent: 'space-evenly', alignItems: 'center' }}
                        capInsets={{ top: 20, left: 20, bottom: 20, right: 20 }}
                        resizeMode='stretch'
                        source={require('../../images/MainDecesion/main_decision_stock_info_bg.png')}>
                        <View>
                            <Text style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>{item && item.name}</Text>
                            <Text style={{ fontSize: 15, textAlign: 'center', color: '#ffffff' }}>{item && item.code}</Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            );
        }
        return views;
    }

    render() {
        let teacherDesc = this.state.data && this.state.data.teacDescription;
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'热点聚焦详情'} />
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={{ marginLeft: 15, marginTop: 15, marginRight: 15, fontSize: 20, lineHeight: 20 * 1.3, color: '#000000cc' }} numberOfLines={2}>{this.state.data && this.state.data.title}</Text>
                    <Text style={{ marginLeft: 15, fontSize: 12, color: '#00000066' }}>{this.state.data && this.state.data.pubTime.substring(0, 16)}</Text>
                    <View style={{ marginTop: 10, marginLeft: 15, marginRight: 15, height: 1, backgroundColor: '#0000001a' }} />
                    <HtmlView value={this.state.data && this.state.data.content} stylesheet={htmlStyles} />
                    <View style={{ marginTop: 10, marginLeft: 15, marginRight: 15, height: 1, backgroundColor: '#0000001a' }} />
                    {this.state.data && this.state.data.stocks && this.state.data.stocks.length ?
                        <View>
                            <View style={{ alignItems: 'center', flexDirection: 'row', paddingLeft: 15, paddingTop: 15, paddingBottom: 7 }}>
                                <View style={{ width: 3, height: 14, backgroundColor: '#F92400' }} />
                                <Text style={{ fontSize: 15, color: '#000000cc', marginLeft: 6 }}>相关个股</Text>
                            </View>
                            <View style={styles.stockViewContainerStyle}>
                                {this._renderStockView()}
                            </View>
                        </View> : null

                    }
                    {teacherDesc && <ContentSourceComponent data={[teacherDesc]} />}
                    <RiskWarning />
                </ScrollView>
            </BaseComponentPage>
        );
    }
}

const htmlStyles = StyleSheet.create({
    text: {
        fontSize: 14,
        color: '#26262899',
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        lineHeight: 14 * 1.5,
    },
    img: {
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 10,
        resizeMode: 'stretch',
        width: baseStyle.width - 15 * 2,
        height: (baseStyle.width - 15 * 2) * 0.5,
    }
});

const styles = StyleSheet.create({
    stockViewContainerStyle: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 15
    },
});