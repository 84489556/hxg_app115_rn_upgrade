/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/9/16 17
 * description:最新调研搜索页面
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    StyleSheet, Image, TextInput
} from 'react-native';
import BaseComponentPage from "../../../pages/BaseComponentPage";
import NavigationTitleView from "../../../components/NavigationTitleView";
import * as ScreenUtil from "../../../utils/ScreenUtil";
import { mNormalFooter } from "../../../components/mNormalFooter";
import { LargeList } from "react-native-largelist-v3";
import HitsApi from "../Api/HitsApi";
import RequestInterface from "../../../actions/RequestInterface";
import HistoryView from "../../../components/HistoryView";
import AsyncStorage from '@react-native-community/async-storage';

export default class NewReaserchSearch extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            textInput: "",//搜索框
            data: [
                {
                    title: "",
                    items: []
                }
            ],

            allLoaded: false,
            isShowHistory: true
        };
        this.isRequist = false;//是否在请求中
        this.pageNo = 1;//页数
        this.pageSize = 10;//请求很快,这里默认每次请求10条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(426);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度

    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {


    }

    /**
     * 获取交易列表的数据
     * 每次请求10条
     * */
    getMarketListData() {

        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;
        if (this.state.textInput !== "") {
            params.keyword = this.state.textInput;
        }
        if (this.pageNo === 1) {
            this.state.data[0].items = [];
        }

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.NEW_SEARCH_LIST, params,
            (response) => {
                this.isRequist = false;
                this._list.endLoading();
                if (this.state.isShowHistory) return
                if (response && response.list.length > 0) {

                    for (let i = 0; i < response.list.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        newItem.id = response.list[i].id;
                        newItem.secName = response.list[i].secName;
                        newItem.secCode = response.list[i].market + "" + response.list[i].secCode;
                        newItem.url = response.list[i].url;

                        newItem.reportDate = response.list[i].reportDate ? response.list[i].reportDate.substring(0, 10) : '--';
                        newItem.reportTitle = response.list[i].reportTitle ? response.list[i].reportTitle : '--';
                        newItem.orgName = response.list[i].orgName ? response.list[i].orgName : 'N/A';
                        newItem.author = response.list[i].author ? response.list[i].author : '--';
                        newItem.rink = response.list[i].rink ? response.list[i].rink : '--';
                        newItem.targetPrice = response.list[i].targetPrice ? response.list[i].targetPrice.toFixed(2) : '--';

                        this.state.data[0].items.push(newItem);

                    }
                    //页数+1
                    this.pageNo += 1;
                    this.setState({
                        data: this.state.data,
                        allLoaded: response.list.length < this.pageSize ? true : false,
                    });
                } else {
                    this.setState({
                        data: this.state.data,
                        allLoaded: false,
                    });
                }
            },
            (error) => {
                this.isRequist = false;
                this.setState({
                    data: this.state.data,
                    allLoaded: false,
                });


            })

    }
    _clickBack = () => {
        this.props.onBack ? this.props.onBack() : this.props.navigation.goBack();
    };
    render() {
        return (
            <BaseComponentPage style={styles.container}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"最新调研"} />
                <LargeList
                    bounces={this.state.textInput && this.state.textInput !== "" && this.state.data[0].items.length > 0 ? true : false}
                    style={{ backgroundColor: "white", flex: 1 }}
                    data={this.state.data}
                    scrollEnabled={true}
                    ref={ref => (this._list = ref)}
                    renderHeader={this._renderunLockHeader}
                    heightForIndexPath={() => this.ITEM_HEGHT}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    headerStickyEnabled={false}
                    directionalLockEnabled={true}
                    loadingFooter={mNormalFooter}
                    renderFooter={this._renderFooters}
                    onLoading={() => {
                        if (this.state.textInput !== "") {
                            this.getMarketListData()
                        } else {
                            this._list.endLoading();
                        }
                    }}
                    allLoaded={this.state.allLoaded}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { }}
                />

            </BaseComponentPage>
        )
    }
    /**
     * 加载可滑动列表的头布局
     *
     * */
    _renderunLockHeader = () => {
        return (
            <View style={{
                width: ScreenUtil.screenW,
            }}>
                <View style={{
                    width: ScreenUtil.screenW,
                    height: ScreenUtil.scaleSizeW(90),
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f1f1f1",
                    flexDirection: "row"
                }}>
                    <View style={{
                        flex: 1,
                        height: ScreenUtil.scaleSizeW(50),
                        marginLeft: ScreenUtil.scaleSizeW(30),
                        flexDirection: "row",
                        backgroundColor: "#d8d8d8",
                        alignItems: "center",
                        borderRadius: ScreenUtil.scaleSizeW(8)
                    }}>
                        <Image style={{
                            width: ScreenUtil.scaleSizeW(22),
                            height: ScreenUtil.scaleSizeW(22),
                            marginLeft: ScreenUtil.scaleSizeW(17),
                            resizeMode: "contain"
                        }}
                            source={require('../../../images/hits/search.png')} />
                        <TextInput
                            style={{
                                fontSize: ScreenUtil.setSpText(28),
                                flex: 1,
                                marginRight: ScreenUtil.scaleSizeW(20),
                                padding: 0,
                                color: "#9d9d9d",
                                marginLeft: ScreenUtil.scaleSizeW(17)
                            }}
                            onChangeText={(text) => {
                                this.onTextChange(text)
                            }}
                            placeholder={"请输入股票代码/全拼/首字母"}
                            numberOfLines={1}
                            autoFocus={true}
                            value={this.state.textInput}
                        />
                        <TouchableOpacity onPress={() => {
                            this.cleartext()
                        }} style={{
                            width: ScreenUtil.scaleSizeW(40),
                            marginRight: ScreenUtil.scaleSizeW(15),
                            height: ScreenUtil.scaleSizeW(50),
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <Image style={{
                                width: ScreenUtil.scaleSizeW(25),
                                height: ScreenUtil.scaleSizeW(25),
                                resizeMode: "contain"
                            }}
                                source={require('../../../images/hits/wrong.png')} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => {
                        this._clickBack()
                    }} style={{
                        width: ScreenUtil.scaleSizeW(115),
                        height: ScreenUtil.scaleSizeW(90),
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(0,0,0,0.4)" }}>取消</Text>
                    </TouchableOpacity>
                </View>
                {this.state.isShowHistory ? this._renderHistory() : null}

            </View>
        );
    };



    _renderHistory = () => {

        return (
            <View sytle={{ width: ScreenUtil.screenW }}>
                {<HistoryView
                    type={'grid'}
                    historykey='search_history_new_reaserch'
                    itemOnClick={this.itemOnClick.bind(this)}
                />}
            </View>
        )

    };
    /**
     * 清除搜索框
     * */
    cleartext() {
        if (this.state.textInput !== "") {
            this.pageNo = 1;
            this.state.data[0].items = [];
            this.state.isShowHistory = true;
            this.setState({
                textInput: "",
                data: this.state.data
            })
        }
    }

    onTextChange(text) {
        if (text !== "") {
            this.isRequist = true;
            this.state.isShowHistory = false;
            this.setState({ textInput: text },
                () => {
                    this.pageNo = 1;
                    this.getMarketListData();
                })
        } else {
            this.pageNo = 1;
            this.state.data[0].items = [];
            this.state.isShowHistory = true;
            this.setState({
                textInput: text,
                data: this.state.data,
            })
        }
    }
    /**
     * 加载脚布局
     * 此处用脚布局来控制空视图，避免页面由空视图和列表数据转换造成页面焦点失去
     * */
    _renderFooters = () => {
        if (this.state.textInput == "" || this.isRequist === true) {
            return (
                <View style={{ height: 0, width: ScreenUtil.screenW }}>
                    <View style={{ flex: 1 }} />
                </View>
            )
        } else {
            if (this.state.data[0].items.length === 0) {
                return (
                    <View style={{ width: ScreenUtil.screenW, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ alignItems: "center", justifyContent: "center", marginBottom: ScreenUtil.screenH / 3 }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                                source={require('../../../images/TuyereDecision/no_stock_data.png')} />
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",
                                marginTop: ScreenUtil.scaleSizeW(100)
                            }}>暂无股票入选</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={{ height: 0, width: ScreenUtil.screenW }}>
                        <View style={{ flex: 1 }} />
                    </View>
                );
            }
        }
    };

    /**
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <View style={styles.row}>
                <TouchableOpacity style={{ marginHorizontal: ScreenUtil.scaleSizeW(30), width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), height: ScreenUtil.scaleSizeW(70), flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                    activeOpacity={1} onPress={() => {
                        let data = {};
                        data.Obj = item.secCode;
                        data.ZhongWenJianCheng = item.secName;
                        data.obj = item.secCode;

                        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                            ...data,
                            array: [],
                            index: 0,
                        })
                    }}
                >
                    <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000" }}>{item.secName}</Text>
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#666666", marginLeft: ScreenUtil.scaleSizeW(15) }}>{item.secCode}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#666666" }}>{item.reportDate}</Text>
                </TouchableOpacity>
                <View style={{ width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), marginBottom: ScreenUtil.scaleSizeW(6), marginLeft: ScreenUtil.scaleSizeW(30), height: 0.5, backgroundColor: "#f1f1f1" }} />

                <TouchableOpacity onPress={() => {


                    this.itemOnClick(item);

                }} activeOpacity={1}
                    style={{ width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), flex: 1, marginHorizontal: ScreenUtil.scaleSizeW(30), justifyContent: "center" }}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(40), color: "#000", }} numberOfLines={2}>{item.reportTitle}</Text>
                </TouchableOpacity>
                <View style={{
                    width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), height: ScreenUtil.scaleSizeW(80)
                    , flexDirection: "row", alignItems: "center", marginLeft: ScreenUtil.scaleSizeW(30), marginTop: ScreenUtil.scaleSizeW(10)
                }}>
                    <View style={{
                        width: ScreenUtil.scaleSizeW(80), height: ScreenUtil.scaleSizeW(80), borderRadius: ScreenUtil.scaleSizeW(10),
                        backgroundColor: "#eaf5ff", justifyContent: "center", alignItems: "center"
                    }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,51,102,0.8)", }}>机构</Text>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,51,102,0.8)", }}>名称</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: ScreenUtil.setSpText(24), color: "rgba(0, 0, 0, 0.4)", marginLeft: ScreenUtil.scaleSizeW(15) }} numberOfLines={1} >{item.orgName}</Text>
                </View>
                <View style={{
                    width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), height: ScreenUtil.scaleSizeW(130), marginHorizontal: ScreenUtil.scaleSizeW(30), flexDirection: "row", paddingVertical: ScreenUtil.scaleSizeW(30)
                    , justifyContent: "center", alignItems: "center"
                }}>
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(80), justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000", }}>{item.rink}</Text>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)", marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(8) : 0 }}>评级</Text>
                    </View>
                    <View style={{ width: 1, height: ScreenUtil.scaleSizeW(61), backgroundColor: "#e8e8e8" }} />
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(80), justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000", }}>{item.author}</Text>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)", marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(8) : 0 }}>作者</Text>
                    </View>
                    <View style={{ width: 1, height: ScreenUtil.scaleSizeW(61), backgroundColor: "#e8e8e8" }} />
                    <View style={{ flex: 1, height: ScreenUtil.scaleSizeW(80), justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#000", }}>{item.targetPrice}</Text>
                        <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)", marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(8) : 0 }}>目标价</Text>
                    </View>
                </View>
                <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(16), backgroundColor: "#f1f1f1" }} />
            </View>
        );
    };


    itemOnClick(item) {
        let data = {
            idPath: '/ydhxg' + item.url,
            title: item.reportTitle,
            date: item.reportDate,
            jsonUrl: item.url,
        };

        Navigation.navigateForParams(this.props.navigation, 'NewsDetailPage', {
            news: data, title: item.title,
        });


        this.saveHistoryData({
            secCode: item.secCode,
            secName: item.secName,
            url: item.url,
            title: item.title,
            reportTitle: item.reportTitle,
            reportDate: item.reportDate,
        });

    }

    saveHistoryData(item) {
        if (!item) return;
        AsyncStorage.getItem('search_history_new_reaserch')
            .then((value) => {
                let data = [];

                if (value) {
                    data = JSON.parse(value);
                }
                for (let i = 0; i < data.length; i++) {
                    if (data[i].secCode === item.secCode) {//相同的股票
                        return;
                    }
                }
                //最多存6个
                if (data.length >= 6) {
                    data.splice(5, 1);

                }


                data.unshift(item);
                AsyncStorage.setItem('search_history_new_reaserch', JSON.stringify(data), (error) => {
                });
            })
    }



    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    row: {
        flex: 1,
        width: ScreenUtil.screenW,
        //paddingTop:ScreenUtil.scaleSizeW(20),
    },
});
