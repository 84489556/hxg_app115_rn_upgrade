/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/9/18 17
 * description:收益统计搜索页面
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    TextInput
} from 'react-native';
import { mNormalFooter } from "../../components/mNormalFooter";

import BaseComponentPage from "../../pages/BaseComponentPage";
import { LargeList } from "react-native-largelist-v3";
import * as ScreenUtil from "../../utils/ScreenUtil";
import HitsApi from "./Api/HitsApi";
import RequestInterface from "../../actions/RequestInterface";

import Yd_cloud from "../../wilddog/Yd_cloud";
import * as BuriedpointUtils from "../../utils/BuriedpointUtils"
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../components/SensorsDataTool';

export default class ProfitStaSearch extends Component<Props> {

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
        };

        this.isRequist = false;//是否在请求中
        this.pageNo = 1;//页数
        this.pageSize = 20;//请求很快,这里默认每次请求10条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(80);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度

    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {
        this.willFocusSubscription && this.willFocusSubscription.remove();
    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {        
        this.willFocusSubscription = this.props.navigation.addListener("willFocus", () => {
            //插入一条页面埋点统计记录
            BuriedpointUtils.setItemByName(BuriedpointUtils.PageMatchID.shouyitongjisousuo);
        });
    }


    /**
     * 获取交易列表的数据
     * 每次请求10条
     * */
    getMarketListData() {

        sensorsDataClickObject.sendSearchRequest.keyword = this.state.textInput
        let keywordType = this.state.textInput
        if(IsNumberString(this.state.textInput)){
            keywordType = '股票代码'
        } else {
            keywordType = '板块名称'
        }
        sensorsDataClickObject.sendSearchRequest.keyword_type = ''
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.sendSearchRequest)
        let params = {};
        params.page = this.pageNo;
        params.size = this.pageSize;
        params.searchType = "3";
        if (this.state.textInput !== "") {
            params.searchKey = this.state.textInput;
        }
        if (this.pageNo === 1) {
            this.state.data[0].items = [];
        }
        //测试环境PROFIT_SEARCH_LIST_TEST
        //正式环境PROFIT_SEARCH_LIST
        RequestInterface.baseGet("", HitsApi.PROFIT_SEARCH_LIST, params,
            (response) => {
                sensorsDataClickObject.searchResult.keyword = this.state.textInput
                sensorsDataClickObject.searchResult.has_result = response.length > 0 ? true : false 
                sensorsDataClickObject.searchResult.search_result_num = response.length
                sensorsDataClickObject.searchResult.keyword_type = keywordType
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchResult)
                this.isRequist = false;
                this._list.endLoading();
                if (response && response.length > 0) {
                    for (let i = 0; i < response.length; i++) {
                        let newItem = {};
                        //储存第一列需要的数据
                        newItem.id = response[i].id;
                        newItem.jc = response[i].jc;
                        newItem.dm = response[i].dm;

                        this.state.data[0].items.push(newItem);
                    }
                    //页数+1
                    this.pageNo += 1;
                    //渲染前去重,有时候会出现两个相同的股票
                    if (this.state.data[0].items.length > 0) {
                        this.state.data[0].items = this.unique(this.state.data[0].items)
                    }

                    this.setState({
                        data: this.state.data,
                        allLoaded: response.length < this.pageSize ? true : false,
                    });
                } else {
                    this.setState({
                        data: this.state.data,
                        allLoaded: true,
                    });
                }
            },
            (error) => {
                this.isRequist = false;
                this.setState({
                    data: this.state.data,
                    allLoaded: true,
                });


            })

    }
    /**
     * 数组对象去重的方法
     * */
    unique(array) {
        // res用来存储结果
        var res = [];
        for (var i = 0, arrayLen = array.length; i < arrayLen; i++) {
            for (var j = 0, resLen = res.length; j < resLen; j++) {
                if (array[i].dm === res[j].dm) {
                    break;
                }
            }
            // 如果array[i]是唯一的，那么执行完循环，j等于resLen
            if (j === resLen) {
                res.push(array[i])
            }
        }
        return res;
    }


    _clickBack = () => {
        this.props.onBack ? this.props.onBack() : this.props.navigation.goBack();
    };

    render() {
        return (
            <BaseComponentPage style={styles.container}>
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
                    headerStickyEnabled={true}
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
                    onTouchBegin={() => {
                        // console.log("手指按下");
                    }}
                    onTouchEnd={() => {
                        // console.log("手指抬起");
                    }}
                    onMomentumScrollEnd={() => {
                        // console.log("惯性停止================");
                    }}
                    onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => {
                        // console.log("滑动起来================",y);
                    }}
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
                width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(90), alignItems: "center", justifyContent: "center",
                backgroundColor: "white", flexDirection: "row", badgeBorderWidth: 0.5, borderColor: "#f1f1f1"
            }}>
                <View style={{
                    flex: 1, height: ScreenUtil.scaleSizeW(64), marginLeft: ScreenUtil.scaleSizeW(30),
                    flexDirection: "row", backgroundColor: "#e5e5e5", alignItems: "center"
                }}>
                    <Image style={{ width: ScreenUtil.scaleSizeW(32), height: ScreenUtil.scaleSizeW(32), marginLeft: ScreenUtil.scaleSizeW(17), resizeMode: "contain" }}
                        source={require('../../images/hits/search.png')} />
                    <TextInput
                        style={{ fontSize: ScreenUtil.setSpText(28), flex: 1, marginRight: ScreenUtil.scaleSizeW(20), padding: 0, color: "#9d9d9d", marginLeft: ScreenUtil.scaleSizeW(17) }}
                        onChangeText={(text) => { this.onTextChange(text) }}
                        placeholder={"请输入股票代码/全拼/首字母"}
                        numberOfLines={1}
                        autoFocus={true}
                        value={this.state.textInput}
                    />
                    <TouchableOpacity onPress={() => { this.cleartext() }} style={{ width: ScreenUtil.scaleSizeW(40), marginRight: ScreenUtil.scaleSizeW(15), height: ScreenUtil.scaleSizeW(64), justifyContent: "center", alignItems: "center" }}>
                        <Image style={{ width: ScreenUtil.scaleSizeW(36), height: ScreenUtil.scaleSizeW(36), resizeMode: "contain" }}
                            source={require('../../images/hits/wrong.png')} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => { this._clickBack() }} style={{ width: ScreenUtil.scaleSizeW(100), marginRight: ScreenUtil.scaleSizeW(10), height: ScreenUtil.scaleSizeW(90), justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(0,0,0,0.4)" }}>取消</Text>
                </TouchableOpacity>
            </View>
        );
    };
    /**
     * 清除搜索框
     * */
    cleartext() {
        if (this.state.textInput !== "") {
            this.pageNo = 1;
            this.state.data[0].items = [];
            this.setState({ textInput: "" })
        }
    }
    onTextChange(text) {
        if (text !== "") {
            this.isRequist = true;
            this.setState({ textInput: text, allLoaded: false },
                () => {
                    this.pageNo = 1;
                    this.getMarketListData();
                })
        } else {
            this.pageNo = 1;
            this.state.data[0].items = [];
            this.setState({
                textInput: text,
                data: this.state.data
            })
        }
    }

    /**
     * 加载每一条
     *储存第一列需要的数据
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                let data = {};
                data.Obj = item.dm;
                data.ZhongWenJianCheng = item.jc;
                data.obj = item.dm;
             
                Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                    ...data,
                    array: [],
                    index: 0,
                    tabIndex: 3
                })
                let keywordType = this.state.textInput
                if(IsNumberString(this.state.textInput)){
                    keywordType = '股票代码'
                } else {
                    keywordType = '板块名称'
                }    
                let sensorsDataParams  = sensorsDataClickObject.clickSearchResult
                sensorsDataParams.keyword = this.state.textInput
                sensorsDataParams.search_result_num = this.state.data[path.section].items.length
                sensorsDataParams.keyword_type = keywordType
                sensorsDataParams.keyword_number = path.row+1   
                sensorsDataParams.label_name = '股票代码'             
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.clickSearchResult,sensorsDataParams)
            }} style={styles.row}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: ScreenUtil.scaleSizeW(78) }}>

                    <Text style={{ width: ScreenUtil.scaleSizeW(200), fontSize: ScreenUtil.setSpText(30), color: "#000", }}>{item.jc}</Text>
                    <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "#999999", }}>{item.dm}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#3399FF", marginRight: ScreenUtil.scaleSizeW(17) }}>收益统计</Text>
                    <Image style={{ width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(28), resizeMode: "contain" }}
                        source={require('../../images/hits/blue_right.png')} />
                </View>


                <View style={{ width: ScreenUtil.screenW, height: 0.5, backgroundColor: "#f1f1f1" }} />
            </TouchableOpacity>
        );
    };
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
                        <View style={{ alignItems: "center", justifyContent: "center", marginBottom: ScreenUtil.screenH / 2.5 }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                                source={require('../../images/TuyereDecision/no_stock_data.png')} />
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
        width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60),
        marginLeft: ScreenUtil.scaleSizeW(30)
    },
});
