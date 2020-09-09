/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/9/16 17
 * description:最新交易搜索页面
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    TextInput,
    ToastAndroid,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import BaseComponentPage from "../../../pages/BaseComponentPage";
import NavigationTitleView from "../../../components/NavigationTitleView";
import * as ScreenUtil from "../../../utils/ScreenUtil";
import { mNormalFooter } from "../../../components/mNormalFooter";
import { LargeList } from "react-native-largelist-v3";
import HitsApi from "../Api/HitsApi";
import RequestInterface from "../../../actions/RequestInterface";
import StockFormatText from '../../../components/StockFormatText';
import { sensorsDataClickObject, sensorsDataClickActionName } from '../../../components/SensorsDataTool';
import HistoryView from "../../../components/HistoryView";
export default class NewDealSearch extends Component<Props> {

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
            //title表头字段
            titles: [
                { conName: "交易日期", conCode: -1 },
                { conName: "股票名称", conCode: -1 },
                { conName: "变动人", conCode: -1 },
                { conName: "变动类型", conCode: -1 },
            ],
            allLoaded: false,
            isShowHistory: true
        };
        this.isRequist = false;//是否在请求中
        this.pageNo = 1;//页数
        this.pageSize = 10;//请求很快,这里默认每次请求10条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(222);
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
     * 每次请求60条
     * */
    getNewSaleListData() {

        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;
        if (this.state.textInput !== "") {
            params.keyword = this.state.textInput;
        }
        if (this.pageNo === 1) {
            this.state.data[0].items = [];
        }
        this.isRequist = true;
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL, HitsApi.NEW_SALE_SEARCH_LIST, params,
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

                        newItem.changer = response.list[i].changer ? response.list[i].changer : '--';
                        newItem.chgType = response.list[i].chgType ? response.list[i].chgType : '--';
                        newItem.transPrice = response.list[i].transPrice != null ? response.list[i].transPrice : '--';
                        newItem.chgSharesNum = response.list[i].chgSharesNum ? Number(response.list[i].chgSharesNum) : '--';
                        newItem.tradeAmt = response.list[i].tradeAmt != null ? response.list[i].tradeAmt : '--';
                        newItem.manageName = response.list[i].manageName ? response.list[i].manageName : '--';
                        newItem.duty = response.list[i].duty ? response.list[i].duty : '--';
                        newItem.relation = response.list[i].relation ? response.list[i].relation : '--';
                        newItem.chgDate = response.list[i].chgDate ? response.list[i].chgDate : '--';

                        this.state.data[0].items.push(newItem);
                    }

                    //页数+1
                    this.pageNo += 1;
                    this.setState({
                        data: this.state.data,
                        allLoaded: response.list.length < this.pageSize ? true : false,
                        // haveMoreDatas:response.list.length<this.pageSize ? false:true,
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
    // <Text style={{fontSize:ScreenUtil.setSpText(28),color:"#9d9d9d",marginLeft:ScreenUtil.scaleSizeW(17)}}>请输入股票代码/全拼/首字母</Text>
    render() {
        return (
            <BaseComponentPage style={styles.container}>
                <NavigationTitleView navigation={this.props.navigation} titleText={"高管交易榜-最新交易"} />
                <LargeList
                    bounces={this.state.textInput && this.state.textInput !== "" && this.state.data[0].items.length > 0 ? true : false}
                    style={{ backgroundColor: "white", flex: 1 }}
                    data={this.state.data}
                    scrollEnabled={true}
                    ref={ref => (this._list = ref)}
                    heightForSection={() => this.HEADER_HEGHT}
                    renderHeader={this._renderunLockHeader}
                    renderSection={this._renderSection}
                    heightForIndexPath={() => this.ITEM_HEGHT}
                    renderIndexPath={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    headerStickyEnabled={false}
                    directionalLockEnabled={true}
                    loadingFooter={mNormalFooter}
                    renderFooter={this._renderFooters}
                    //renderEmpty={this.renderEmptys}
                    onLoading={() => {
                        if (this.state.textInput !== "") {
                            this.getNewSaleListData()
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
        let monColor;
        if (item.tradeAmt !== '') {
            if (item.tradeAmt > 0) {
                monColor = "#fa5033"
            } else if (item.tradeAmt === 0) {
                monColor = "rgba(0,0,0,0.4)"
            } else {
                monColor = "#5cac33"
            }
        } else {
            monColor = "rgba(0,0,0,0.4)"
        }
        return (
            <View style={styles.row}>
                <TouchableOpacity activeOpacity={1} onPress={() => {


                    this.itemOnClick(item);

                    let keywordType = this.state.textInput
                    if (IsNumberString(this.state.textInput)) {
                        keywordType = '股票代码'
                    } else {
                        keywordType = '板块名称'
                    }
                    sensorsDataClickObject.clickSearchResult.keyword = this.state.textInput
                    sensorsDataClickObject.clickSearchResult.search_result_num = this.state.data[path.section].items.length
                    sensorsDataClickObject.clickSearchResult.keyword_type = keywordType
                    sensorsDataClickObject.clickSearchResult.keyword_number = path.row + 1
                    sensorsDataClickObject.clickSearchResult.label_name = '新闻'
                    SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.clickSearchResult)


                }} style={{
                    flexDirection: 'row', justifyContent: "center", alignItems: "center", paddingTop: ScreenUtil.scaleSizeW(20),
                    height: ScreenUtil.scaleSizeW(100), marginBottom: ScreenUtil.scaleSizeW(10)
                }}>
                    <View style={{ flex: 1, paddingLeft: ScreenUtil.scaleSizeW(20) }}>
                        <View style={{
                            width: ScreenUtil.scaleSizeW(125), height: ScreenUtil.scaleSizeW(91), borderRadius: ScreenUtil.scaleSizeW(10)
                            , backgroundColor: "#f5faff", paddingLeft: ScreenUtil.scaleSizeW(10), justifyContent: "center"
                        }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(26), color: "#003366" }}>{item.chgDate && item.chgDate !== '--' ? item.chgDate.substring(0, 4) : "--"}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#6282a3" }}>{item.chgDate && item.chgDate !== '--' ? item.chgDate.substring(5, 10) : "--"}</Text>
                        </View>
                    </View>
                    <View style={styles.titleText}>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(30), color: "#242424" }} numberOfLines={1} >{item.secName}</Text>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "#909090" }}>{item.secCode}</Text>
                    </View>
                    <View style={styles.titleText}>
                        <Text style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }} numberOfLines={1} >{item.changer}</Text>
                    </View>
                    <View style={styles.titleText}>
                        <View style={{
                            width: ScreenUtil.scaleSizeW(80), height: ScreenUtil.scaleSizeW(80), borderRadius: ScreenUtil.scaleSizeW(40)
                            , backgroundColor: item.chgType === '买入' ? "#fa5033" : "#5cac33", justifyContent: "center", alignItems: "center"
                        }}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(28), color: "white" }} numberOfLines={1} >{item.chgType}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <ScrollView horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: ScreenUtil.scaleSizeW(20), paddingRight: ScreenUtil.scaleSizeW(20) }}
                    style={{ width: ScreenUtil.screenW, flex: 1, paddingTop: ScreenUtil.scaleSizeW(2), marginBottom: ScreenUtil.scaleSizeW(10) }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        let data = {};
                        data.Obj = item.secCode;
                        data.ZhongWenJianCheng = item.secName;
                        data.obj = item.secCode;

                        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                            ...data,
                            array: [],
                            index: 0,
                        })
                    }} style={{ flex: 1, flexDirection: "row" }}>
                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2} unit={'万/亿'} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }}>{item.transPrice}</StockFormatText>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.6)" }}>成交价</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }}>{item.chgSharesNum}</StockFormatText>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.6)" }}>变动数量</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{ fontSize: ScreenUtil.scaleSizeW(32), color: monColor }}>{item.tradeAmt}</StockFormatText>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.6)" }}>成交金额</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }} numberOfLines={1} >{item.manageName}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.6)" }}>董监高姓名</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }} numberOfLines={1} >{item.duty}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.6)" }}>职务</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(32), color: "rgba(0,0,0,0.8)" }} numberOfLines={1} >{item.relation}</Text>
                            <Text style={{ fontSize: ScreenUtil.scaleSizeW(24), color: "rgba(0,0,0,0.6)" }}>与变动人关系</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    };
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
                    width: ScreenUtil.screenW, height: ScreenUtil.scaleSizeW(90), alignItems: "center", justifyContent: "center",
                    backgroundColor: "#f1f1f1", flexDirection: "row"
                }}>
                    <View style={{
                        flex: 1, height: ScreenUtil.scaleSizeW(50), marginLeft: ScreenUtil.scaleSizeW(30),
                        flexDirection: "row", backgroundColor: "#d8d8d8", alignItems: "center", borderRadius: ScreenUtil.scaleSizeW(8)
                    }}>
                        <Image style={{ width: ScreenUtil.scaleSizeW(22), height: ScreenUtil.scaleSizeW(22), marginLeft: ScreenUtil.scaleSizeW(17), resizeMode: "contain" }}
                            source={require('../../../images/hits/search.png')} />
                        <TextInput
                            style={{ fontSize: ScreenUtil.setSpText(28), flex: 1, marginRight: ScreenUtil.scaleSizeW(20), padding: 0, color: "#9d9d9d", marginLeft: ScreenUtil.scaleSizeW(17) }}
                            onChangeText={(text) => { this.onTextChange(text) }}
                            placeholder={"请输入股票代码/全拼/首字母"}
                            numberOfLines={1}
                            autoFocus={true}
                            value={this.state.textInput}
                        />
                        <TouchableOpacity onPress={() => { this.cleartext() }} style={{ width: ScreenUtil.scaleSizeW(40), marginRight: ScreenUtil.scaleSizeW(15), height: ScreenUtil.scaleSizeW(50), justifyContent: "center", alignItems: "center" }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(25), height: ScreenUtil.scaleSizeW(25), resizeMode: "contain" }}
                                source={require('../../../images/hits/wrong.png')} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => { this._clickBack() }} style={{ width: ScreenUtil.scaleSizeW(115), height: ScreenUtil.scaleSizeW(90), justifyContent: "center", alignItems: "center" }}>
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
                    historykey='search_history_newDeal'
                    itemOnClick={this.itemOnClick.bind(this)}
                />
                }
            </View>
        )

    };


    itemOnClick(item) {

        let data = {};
        data.Obj = item.secCode;
        data.ZhongWenJianCheng = item.secName;
        data.obj = item.secCode;

        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: [],
            index: 0,
        });

        this.saveHistoryData(item)
    }



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
            this.setState({
                textInput: text,
                isShowHistory: false
            },
                () => {
                    this.pageNo = 1;
                    this.getNewSaleListData();
                })
        } else {
            this.pageNo = 1;
            this.state.data[0].items = [];
            this.setState({
                textInput: text,
                data: this.state.data,
                isShowHistory: true,
            })
        }

    }

    /**
     * SectionTitle
     * */
    _renderSection = (section: number) => {
        if (this.state.data[0].items.length === 0) {
            return <View />
        } else {
            return (
                <View style={{ height: this.HEADER_HEGHT, flexDirection: "row" }}>
                    {this.state.titles.map((title, index) =>
                        <View style={styles.headerText} key={index}>
                            <Text style={styles.hinnerText} >
                                {title.conName}
                            </Text>
                            {this.getSortView(title.conCode)}
                        </View>
                    )}
                </View>
            );
        }
    };
    /**
     * 获取标题
     * 后面排序的View
     * -1没有排序，0默认状态，1为降序，2为升序
     * */
    getSortView(conCode) {
        let sortView;
        switch (conCode) {
            case -1:
                sortView = null;
                break;
            case 0:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/defaultt.png')} />;
                break;
            case 1:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/positive.png')} />;
                break;
            case 2:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/negative.png')} />;
                break;
            default:
                sortView = null;
                break;
        }
        return sortView;
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {


    }


    saveHistoryData(item) {
        if (!item) return;
        AsyncStorage.getItem('search_history_newDeal')
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


                data.unshift(item);//表头插入
                AsyncStorage.setItem('search_history_newDeal', JSON.stringify(data), (error) => {
                });
            })
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
        paddingLeft: ScreenUtil.scaleSizeW(20)
    },
    hinnerText: {
        fontSize: ScreenUtil.setSpText(24),
        color: "#626567"
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
    row: {
        flex: 1,
        width: ScreenUtil.screenW,
        borderWidth: 0.5,
        borderColor: "#f1f1f1"
    },
    titleText: {
        flex: 1,
        justifyContent: "center",
        height: ScreenUtil.scaleSizeW(110),
        paddingLeft: ScreenUtil.scaleSizeW(20),
    },
    scrollItem: {
        flex: 1,
        backgroundColor: "#fbfdff",
        paddingLeft: ScreenUtil.scaleSizeW(20),
        justifyContent: "center",
        paddingRight: ScreenUtil.scaleSizeW(40),
        borderRadius: ScreenUtil.scaleSizeW(10),
        marginRight: ScreenUtil.scaleSizeW(10),
        borderWidth: 1,
        borderColor: "#f6f6f6"
    }
});
