/**
 * 板块成分股列表
 */
'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    DeviceEventEmitter,
    TouchableOpacity,
    Platform,
    NativeModules,
    NativeEventEmitter
} from 'react-native';

import * as baseStyle from '../../components/baseStyle.js';
import StockFormatText from '../../components/StockFormatText.js';
import UpDownButton from '../../components/UpDownButton';
import RATE from '../../utils/fontRate';
import PullListView, { RefreshState } from '../../components/PullListView';
import { connection } from "./YDYunConnection";
import { getSectorType } from "./DownLoadStockCode";
import ShareSetting from '../../modules/ShareSetting.js';

const { YDYunChannelModule } = NativeModules;
const loadingManagerEmitter = new NativeEventEmitter(YDYunChannelModule);

const _ZXJTitleID = 33
const _ZFTitleID = 199

export default class ConstituentList extends Component {
    static defaultProps = {
        code: null,
        mainkey: '',
        title: ''
        //loading: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            dataSource: null,
            allData: null,
            moreDataText: '加载更多',
            ZXJdesc: 2, //0 ：降序，由大到小  1：升序，有小到大  2：无排序
            ZFdesc: 0,
            titleId: _ZFTitleID,
            code: props.code,
            SectorType: '',
            SectorTotal: 0,
        };
        this.mainkey = props.mainkey;
    }

    componentDidMount() {
        this._getSectorType(this.state.code);
    }

    componentWillUnmount() { }

    componentWillReceiveProps(nextProps) {
        if (this.state.code !== nextProps.code) {
            this.setState({
                code: nextProps.code,
            }, () => {
                this._getSectorType(nextProps.code);
            });

        }
    }

    _getSectorType(code) {
        getSectorType(code, (sectorCode, totalStockNum) => {
            //console.log('成分股 === _getSectorType', this.state.code, sectorCode);
            if (sectorCode !== undefined) {
                this.setState({
                    SectorType: sectorCode,
                    SectorTotal: totalStockNum,
                });
            }
        });
    }

    //涨跌榜 排序按钮
    changeListZF() {
        if (this.state.ZFdesc === 2) {
            this.setState({
                ZXJdesc: 2,
                ZFdesc: 0,
                titleId: _ZFTitleID
            });
        } else {
            this.setState({
                ZFdesc: this.state.ZFdesc === 0 ? 1 : 0
            });
        }
    }

    //最新价排序按钮
    changeListZXJ() {
        if (this.state.ZXJdesc === 2) {
            this.setState({
                ZXJdesc: 0,
                ZFdesc: 2,
                titleId: _ZXJTitleID
            });
        } else {
            this.setState({
                ZXJdesc: this.state.ZXJdesc === 0 ? 1 : 0
            });
        }
    }

    loadMoreData() {
        this.constituent._loadMoreData()
    }

    setChangeVisibleRowCallback(info) {
        this.props.setChangeVisibleRowCallback && this.props.setChangeVisibleRowCallback(info, this.state.SectorTotal)
    }

    render() {
        // let titleDesc = false;
        // let titleId = _ZFTitleID;//zhangfu
        // if (this.state.zhangF === 2) {
        //     titleId = _ZXJTitleID;//zuixinjia
        //     titleDesc = this.state.xianJ;
        // } else {
        //     titleDesc = this.state.zhangF;
        // }

        let titleId = this.state.titleId;
        let titleDesc = (titleId === _ZFTitleID ? this.state.ZFdesc : this.state.ZXJdesc)

        return (
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        height: 40,
                        borderBottomWidth: 1,
                        borderBottomColor: baseStyle.LINE_BG_F1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ fontSize: 15 }}>成分股</Text>
                </View>

                <View
                    style={{
                        backgroundColor: baseStyle.WHITE,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        height: 25,
                        // paddingLeft: 12,
                        // paddingRight: 12
                        marginLeft: 12,
                        marginRight: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
                    }}
                >
                    <Text
                        style={{
                            flex: 1,
                            color: baseStyle.BLACK_70,
                            fontSize: 12,
                            textAlign: 'left'
                        }}
                    >
                        名称
                    </Text>

                    <UpDownButton
                        onPress={() => this.changeListZXJ()}
                        desc={this.state.ZXJdesc}
                        title={'现价'}
                        containerStyle={{
                            flex: 0.5,
                            alignItems: 'flex-end'
                        }}
                    />

                    <UpDownButton
                        onPress={() => this.changeListZF()}
                        desc={this.state.ZFdesc}
                        title={'涨跌幅'}
                        containerStyle={{
                            flex: 1,
                            alignItems: 'flex-end'
                        }}
                    />
                </View>
                {(
                    <View style={{ flex: 1 }}>
                        <Constituent
                            ref={constituent => (this.constituent = constituent)}
                            navigation={this.props.navigation}
                            code={this.state.SectorType}
                            total={this.state.SectorTotal}
                            params={{ title: titleId, desc: titleDesc }}
                            callback={this.props.callback}
                            setChangeVisibleRowCallback={this.setChangeVisibleRowCallback.bind(this)}
                        />
                    </View>
                )}
            </View>
        );
    }
}

class Constituent extends Component {


    constructor(props) {
        super(props);
        this.state = {
            allData: [],
            refreshState: RefreshState.FooterRefreshing,
            code: '',
            titleId: _ZFTitleID,
            titleDesc: 0
        };
        this._isEnd = false;
        this.blockStart = 0;

        this._subs = null
        this.onePageNumber = 30
    }

    //重写父类方法，不调super
    componentDidMount() {
        // this._query2(this.state.code,_ZFTitleID,0);
        DeviceEventEmitter.addListener('scroll2End', () => {
            if (!this._isEnd) {

                if (this.blockStart + this.onePageNumber >= this.props.total) {
                    this._isEnd = true;
                    this.setState({
                        moreDataText: '没有更多数据',
                        refreshState: RefreshState.NoMoreData
                    });
                }
                else {
                    this.setState({ refreshState: RefreshState.FooterRefreshing }, () => {
                        // this._loadMoreData();
                    })
                }

            }
        })

        this._registerEvents();

        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.blockSortRequest = this.blockSortRequest && connection.request(
                    this.blockSortRequest.interfaceName,
                    this.blockSortRequest.params,
                    this.blockSortRequest.callback
                )
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            payload => {
                this.blockSortRequest && this.blockSortRequest.cancel();
            }
        );

    }

    componentWillUnmount() {
        this._unregisterEvents();
        this.blockSortRequest && this.blockSortRequest.cancel();
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
    }

    _registerEvents() {
        this._subs = [
            loadingManagerEmitter.addListener('ydConstituentStockSortMessage', ev => {
                this.sortComing(ev)
            }),
            loadingManagerEmitter.addListener('ydConstituentStockQuoteMessage', ev => {
                this.quoteComing(ev)
            })
        ];
    }

    _unregisterEvents() {
        this._subs.forEach(e => e.remove());
        this._subs = [];
    }

    sortComing(ev) {
        let array = JSON.parse(ev.data);

        let tmpArray = []
        if (this.blockStart > 0 && this.blockStart == ev.startIndex) {
            tmpArray = this.state.allData.slice(0, this.blockStart)
        }

        let newArray = tmpArray.concat(array);

        this.setState({ allData: newArray }, () => {
            if (this._isEnd) {
                setTimeout(() => {
                    this.setState({ refreshState: RefreshState.NoMoreData });
                }, 1000);
            }
        });
    }

    quoteComing(ev) {
        let array = JSON.parse(ev.data);
        let oldarray = this.state.allData
        let result = []

        let olditem, item;
        for (let i = 0; oldarray && i < oldarray.length; ++i) {
            olditem = oldarray[i]

            for (let j = 0; j < array.length; ++j) {

                item = array[j]

                if (olditem.Obj === item.Obj) {
                    result[i] = item
                }
                else {
                    result[i] = olditem
                }
            }
        }

        this.setState({ allData: result }, () => {
            if (this._isEnd) {
                setTimeout(() => {
                    this.setState({ refreshState: RefreshState.NoMoreData });
                }, 1000);
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.code !== this.state.code) {
            this.setState({
                code: nextProps.code,
                allData: [],
            });
            this.blockStart = 0;
            this._isEnd = false;
            this._query2(nextProps.code, _ZFTitleID, 0);
        }

        else if (nextProps.params.title !== this.state.titleId || nextProps.params.desc !== this.state.titleDesc) {
            this.setState({
                titleId: nextProps.params.title,
                titleDesc: nextProps.params.desc,
                allData: [],
            });
            this.blockStart = 0;
            this._isEnd = false;
            this.refs.ls.goTop();
            // this.blockStart = ShareSetting.getStartLineIndex()
            this._query2(nextProps.code, nextProps.params.title, nextProps.params.desc);
        }
    }

    _query2(code, titleId, titleDesc) {
        if (code === '') return;

        // console.log("ConstituentXXX cancel0", this.blockSortRequest&&this.blockSortRequest.qid)
        this.blockSortRequest && this.blockSortRequest.cancel();

        console.log("flatlist state request params:", code, titleId, titleDesc, this.blockStart)

        this.blockSortRequest = connection.request('FetchConstituentStockNative', {
            blockid: code,
            titleid: titleId,
            desc: (titleDesc === 1 ? false : true),
            start: this.blockStart,
            count: this.onePageNumber,
            subscribe: true
        }, (data) => {

        });

        console.log("ConstituentXXX fetch", this.blockSortRequest.qid)
    }

    // _query(code) {
    //     if(code==='')return;

    //     // if (this.blockSortRequest && this.blockSortRequest.params.blockid !== code) 
    //         this.blockSortRequest&&this.blockSortRequest.cancel();

    //     console.log("flatlist state request:", this.blockStart)
    //     this.blockSortRequest = connection.request('FetchConstituentStockNative', {
    //         blockid: code,
    //         titleid: _ZFTitleID,
    //         desc: true,
    //         start: this.blockStart,
    //         count: this.onePageNumber,
    //         subscribe: true
    //     }, (data) => {

    //     });

    // }

    _keepTwoDecimal(num) {
        let result = parseFloat(num);
        if (isNaN(result)) {
            return 0.00;
        }
        result = Math.round(num * 100) / 100;
        return result;
    }

    _detailData(data) {
        let array = [];
        // let array = data.entitiesList;
        let tempArray = [];
        if (Platform.OS === 'ios') {
            array = data.entitiesArray;
        } else {
            array = data.entitiesList;
        }
        array.map((value, index) => {
            let temp = {};
            temp.Obj = value.label;
            temp.ZhongWenJianCheng = value.name;
            temp.ZuiXinJia = value.price;
            temp.ZhangFu = this._keepTwoDecimal(value.increaseRatio);
            temp.XuHao = index;
            tempArray.push(temp);
        });
        return tempArray;
    }

    // 上拉加载更多
    _loadMoreData() {
        if (this.blockStart + this.onePageNumber >= this.props.total) {
            this._isEnd = true;
            this.setState({
                moreDataText: '没有更多数据',
                refreshState: RefreshState.NoMoreData
            });
        } else {
            // this.blockStart=this.blockStart+this.onePageNumber;
            this.blockStart = ShareSetting.getStartLineIndex()
            this._query2(this.state.code, this.state.titleId, this.state.titleDesc);
        }

    }

    // 点击 item
    _onItemPress(data, rowID) {
        let array = this.getNewArray(this.state.allData);
        // connection.pause()
       
        Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
            ...data,
            array: array,
            index: rowID,
            // back: ((navi) => {
            //     Navigation.pop(navi)
            //     connection.resume()
            // }).bind(this)
        });
    }

    getNewArray(array) {
        let { title, desc } = this.props.params;

        if (!array) {
            return null;
        }
        let messages = array;
        let newArray = [];

        for (var j = 0, length = messages.length; j < length; j++) {
            var temp1 = Object.assign({}, messages[j]);
            newArray.push(temp1);
        }
        // newArray.sort((a,b) => {
        //     return  a.ZhangFu - b.ZhangFu;
        // });

        if (title === _ZFTitleID) {
            if (desc) {
                //现价由小到大
                newArray.sort((a, b) => {
                    return a.ZhangFu - b.ZhangFu;
                });
            } else {
                //涨幅由大到小
                newArray.sort((a, b) => {
                    return b.ZhangFu - a.ZhangFu;
                });
            }
        } else {
            if (desc) {
                //现价由小到大
                newArray.sort((a, b) => {
                    return a.ZuiXinJia - b.ZuiXinJia;
                });
            } else {
                //现价由大到小
                newArray.sort((a, b) => {
                    return b.ZuiXinJia - a.ZuiXinJia;
                });
            }
        }

        return newArray;
    }
    // onFooterRefresh = ()=>{
    //     if (!this._isEnd) {
    //         this.setState({ refreshState: RefreshState.FooterRefreshing },()=>{
    //             this._loadMoreData();
    //         })
    //     }
    // };
    keyExtractor = (item: any, index: number) => {
        return index;
    };

    renderRow = rowData1 => {
        let rowData = rowData1.item;
        let clr = baseStyle.SMALL_TEXT_COLOR;
        if (rowData.ZhangFu > 0) clr = baseStyle.UP_COLOR;
        else if (rowData.ZhangFu < 0) clr = baseStyle.DOWN_COLOR;
        return (
            <TouchableOpacity onPress={this._onItemPress.bind(this, rowData, rowData1.index)}>
                <View style={styles.container}>
                    <View

                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                    >
                        <StockFormatText
                            style={{
                                color: baseStyle.BLACK_100,
                                fontSize: RATE(30),
                                marginBottom: 4,
                                textAlign: 'left'
                            }}
                        >
                            {rowData.ZhongWenJianCheng}
                        </StockFormatText>
                        <StockFormatText
                            style={{
                                color: baseStyle.BLACK_70,
                                fontSize: RATE(24),
                                textAlign: 'left'
                            }}
                        >
                            {rowData.Obj}
                        </StockFormatText>
                    </View>

                    <View key="ZuiXinJia" style={{ flex: 0.5 }}>
                        <StockFormatText
                            titlename={'ZuiXinJia'}
                            style={{
                                textAlign: 'right',
                                fontSize: RATE(30),
                                color: clr
                            }}
                        >
                            {rowData.ZuiXinJia}
                        </StockFormatText>
                    </View>

                    <View key="ZhangFu" style={{ flex: 1 }}>
                        <StockFormatText
                            style={{
                                textAlign: 'right',
                                fontSize: RATE(30),
                                color: clr
                            }}
                            unit="%"
                            sign={true}
                        >
                            {rowData.ZhangFu / 100}
                        </StockFormatText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        let refreshState = this.state.refreshState
        if (this.state.allData && this.state.allData.length <= 0) {
            refreshState = RefreshState.EmptyData
        }

        return (
            <View>
                {this.state.allData && (
                    <PullListView ref="ls"
                        bounces={false}
                        data={this.state.allData}
                        keyExtractor={this.keyExtractor}
                        renderItem={this.renderRow}
                        refreshState={refreshState}
                        // onFooterRefresh={this.onFooterRefresh}
                        callback={this.props.callback}
                        setChangeVisibleRowCallback={this.props.setChangeVisibleRowCallback}
                        loadMore={this._loadMoreData.bind(this)}
                    />
                )}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 49,
        // paddingLeft: 12,
        // paddingRight: 12,
        marginLeft: 12,
        marginRight: 12,
        borderBottomWidth: 1,
        borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
    }
});
