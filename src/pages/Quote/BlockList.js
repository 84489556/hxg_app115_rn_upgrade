import React, {Component} from 'react';
import {View, Text, TouchableHighlight, FlatList, Image, } from 'react-native';

import Button from '../../components/Button.js';
import StockFormatText from '../../components/StockFormatText.js';
import * as baseStyle from '../../components/baseStyle.js';
import UpDownButton from '../../components/UpDownButton'
import RATE from '../../utils/fontRate'
import Yd_sync from '../../wilddog/Yd_cloud';
let _tabRequests = new Map();


export default class BlockList extends Component {

    defaultParams = {
        field: 'ZhangFu,ZhongWenJianCheng,LingZhangGu',
        gql: '',
        orderby: 'ZhangFu',
        start: 0,
        mode: 2,
        count: 6,
        sub: 1,
    };

    static defaultProps = {
        gql: 0,
        mainkey: '',
        title: '',
        src: '',
    };

    constructor(props) {
        super(props);

        // 初始空数据
        this.state = {
            desc: true,
        };
        this.reverseData = [];
        this.mainkey = this.props.mainkey;
        this.title = this.props.title;
        this.defaultParams.gql = this.props.gql;
        this.block_conceptAll_ref = Yd_sync("block_gn_all").ref("/quote_offer_price/concept_sector_all");
        this.block_industryAll_ref = Yd_sync("block_hy_all").ref("/quote_offer_price/industry_sector_all");
        if (this.props.src === 'all') {
            this.defaultParams.count = 0;
        }

    }
 
    componentDidMount() {
        this.requestBlock_All_Data()
    }

    requestBlock_All_Data(){
        if (this.props.title == "行业板块") {
            this.block_industryAll_ref.on('value', (snapshot) => {
                if(snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            })
            this.block_industryAll_ref.get((snapshot)=> {
                if(snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            });
        } else {
            this.block_conceptAll_ref.on('value', (snapshot) => {
                if(snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            })
            this.block_conceptAll_ref.get((snapshot)=> {
                if(snapshot.nodeContent)
                    this.renderCell(snapshot.nodeContent)
            });
        }
    }

    processStringData(strData,successCallBack){
        let block_Data = {};
        let parseJsonObj = {};
        let dataList = [];
        let str1 = strData.replace(/\</g, "{")
        let str2 = str1.replace(/\>/g, "}")
        let str3 = str2.replace(/\$/g, ":")
        let arr = str3.split("&");
        arr.map((data, index) => {
            parseJsonObj = JSON.parse(data)
            block_Data = {
                Obj: parseJsonObj.A,
                ZhongWenJianCheng: parseJsonObj.B,
                ZuiXinJia: parseFloat(parseJsonObj.C),
                ZhangDie: parseFloat(parseJsonObj.D),
                ZhangFu: parseFloat(parseJsonObj.E),
                LingZhangGu: {
                    Obj: parseJsonObj.F,
                    ZhongWenJianCheng: parseJsonObj.G,
                    ZhangFu: parseFloat(parseJsonObj.H),
                    ShiJian: parseFloat(parseJsonObj.J),
                    ZuiXinJia:parseFloat(parseJsonObj.I)
                },
            }
            dataList.push(block_Data)
            if(index == arr.length - 1){
                successCallBack(dataList)
                block_Data = null;
                parseJsonObj = null;
                dataList = null;
                str1 = null;
                str2 = null;
                str3 = null;
                arr = null;
            }
        })

    }

    renderCell(strData){
        this.processStringData(strData,(list)=>{
            this.adapt(this.state.desc?list:list.reverse())
        })
    }

    componentWillUnmount() {
        this.timeoutId && clearTimeout(this.timeoutId);
        this.setState =(state,callback)=>{ return }; //防止页面已经被卸载但是仍然走setState方法导致报内存泄漏的报错警告
        if (_tabRequests.has(this.mainkey)) {
            let req = _tabRequests.get(this.mainkey);
            req && req.cancel();
            _tabRequests.delete(this.mainkey);
            console.debug('BlockList componentWillUnmount & unreg', req);
        }
        else {
            console.debug('BlockList componentWillUnmount');
        }

    }

    adapt(data) {
        if (data && data.length > 0) {

            this._needInit && this.setState({dataSource: null});
            this._needInit = false;

            let dataSource = data;
            this.setState({dataSource: [],data:[]},()=>{
                this.reverseData = data;
                this.setState({dataSource: dataSource,data:data});
            });
        }
        return false;
    }

    rowHasChanged(r1, r2) {
        return r1 !== r2;
    }

    shouldComponentUpdate(nextProps, nextState) {

        // 排序变化,重新请求数据
        if (this.state.desc !== nextState.desc) {
            this._needInit = true;
        }
        return this.state !== nextState;
    }

    _openBlock() {
        if (this.title === '行业板块') {
            Navigation.pushForParams(this.props.navigation,'AllBlockPage',{mainkey: 'allIndustry'})
        }
        else if (this.title === '概念板块') {
            Navigation.pushForParams(this.props.navigation,'AllBlockPage',{mainkey: 'allConcept'})
        }
    }

    render() {
        let arrowImage = this.state.desc ? (
            <Image style={{width: 10, height: 20, marginHorizontal: 5}}
                   source={require('../../images/icons/back.png')}/>
        ) : (
            <Image style={{width: 10, height: 20, marginHorizontal: 5}}
                   source={require('../../images/icons/arrow_green.png')}/>
        );
        return (
            <View style={{flex: 1}}>
                <View style={{
                    height: 30,
                    backgroundColor: baseStyle.WHITE,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around'
                }}>
                    {
                        this.props.src === 'all' ? (
                            <View style={{flex: 1, alignItems: 'stretch'}}>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    marginLeft: 12,
                                    marginRight: 12
                                }}>
                                    <View style={{
                                        flex: 4,
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <View style={{
                                            flex: 1,
                                        }}>
                                            <Text style={{
                                                color: baseStyle.BLACK_70,
                                                textAlign: 'left',
                                                fontSize: RATE(24),
                                                includeFontPadding: false,
                                            }}>名称</Text>
                                        </View>
                                        <UpDownButton
                                            onPress={(desc) => {
                                                this.setState({desc: !desc},()=>{
                                                    this.adapt(this.reverseData.reverse())
                                                })
                                            }}
                                            desc={!this.state.desc}
                                            containerStyle={{
                                                flex: 1,
                                                height: 25,
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                paddingRight: 2,
                                            }}/>
                                    </View>
                                    <View style={{
                                        flex: 3,
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <Text style={{
                                            flex: 1,
                                            color: baseStyle.BLACK_70,
                                            textAlign: 'right',
                                            fontSize: RATE(24),
                                            includeFontPadding: false,
                                        }}>领涨股</Text>
                                    </View>
                                </View>
                                <View style={{height: 0.5, backgroundColor: baseStyle.LINE_BG_F6}}/>
                            </View>
                        ) : (
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                marginLeft: 20
                            }}>
                                <Text style={{
                                    color: baseStyle.GRAY,
                                    textAlign: 'left',
                                    fontSize: 12
                                }}>{this.title}</Text>
                            </View>
                        )
                    }
                    {
                        this.props.src === 'all' ? (
                            <View/>
                        ) : (
                            <View style={{flex: 0.5}}>
                                <Button onPress={this._openBlock.bind(this)}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 20
                                    }}>
                                        <Text style={{
                                            fontSize: 20,
                                            color: baseStyle.GRAY,
                                            textAlign: 'right'
                                        }}>...</Text>
                                    </View>
                                </Button>
                            </View>
                        )
                    }
                </View>
                {
                    this.state.dataSource &&
                    <FlatList 
                        scrollIndicatorInsets = {{ right: 1 }}
                        data={this.state.dataSource}
                        renderItem={({item, index, separators}) => this._renderRow(item,index)}
                        removeClippedSubviews={false}>
                    </FlatList>
                }
            </View>
        )
    }

    _renderRow(rowData,rowID) {
        return <BlockItem navigation={this.props.navigation}
                          itemData={rowData}
                          Obj={rowData.Obj} title={this.title}
                          onItemPress = {() => this._onItemPress(rowData,rowID)}
                          ZhangFu={rowData.ZhangFu}/>
    }

    _onItemPress(rowData,rowID){
        let array = this.state.data ? this.state.data : [];
       
        Navigation.navigateForParams(this.props.navigation,'DetailPage',{
            ...rowData,
            array:array,
            index:rowID,
        })
    }
}

class BlockItem extends Component {

    _onPressBlock() {
        this.props.onItemPress();
    }

    render() {

        let data = this.props.itemData || {};
        let lead = data.LingZhangGu || {}, up = data.ZhangFu || 0, leadUp = lead.ZhangFu || 0;

        if (lead.ZhongWenJianCheng === undefined || lead.ZuiXinJia === undefined) {
            this.lastlead && (lead = this.lastlead);
        }
        else {
            this.lastlead = lead;
        }

        return (
            <TouchableHighlight underlayColor={baseStyle.LINE_BG_F1}
                                onPress={this._onPressBlock.bind(this)}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 4,
                    borderBottomWidth: 0.5,
                    paddingLeft: 12,
                    paddingRight: 12,
                    height: 49,
                    borderBottomColor: baseStyle.LINE_BG_F1
                }}>
                    <View style={{
                        flex: 4,
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <View style={{justifyContent: 'center'}}>
                            <StockFormatText style={{
                                textAlign: 'left',
                                color: baseStyle.BLACK_100,
                                fontSize: RATE(30),
                                includeFontPadding: false,
                            }}>{data.ZhongWenJianCheng}</StockFormatText>
                            <StockFormatText style={{
                                textAlign: 'left',
                                color: baseStyle.BLACK_70,
                                fontSize: RATE(24),
                                includeFontPadding: false,
                            }}>{data.Obj}</StockFormatText>
                        </View>
                        <View style={{paddingRight: 5}}>
                            <StockFormatText sign={true}
                                             unit='%'
                                             style={
                                                 [{
                                                     textAlign: 'center',
                                                     color: baseStyle.DEFAULT_TEXT_COLOR,
                                                     fontSize: RATE(30),
                                                     includeFontPadding: false,
                                                     fontFamily: 'Helvetica Neue'
                                                 },
                                                     up > 0 && {color: baseStyle.UP_COLOR},
                                                     up < 0 && {color: baseStyle.DOWN_COLOR}
                                                 ]}>
                                {this.props.ZhangFu / 100}
                            </StockFormatText>
                        </View>
                    </View>
                    <View style={{
                        flex: 3,
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            <StockFormatText style={{
                                textAlign: 'right',
                                color: baseStyle.BLACK_100,
                                fontSize: RATE(30),
                                includeFontPadding: false,
                            }}>{lead.ZhongWenJianCheng}</StockFormatText>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
}
