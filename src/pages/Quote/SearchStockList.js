/**
 * 股票查询列表，根据输入参数的关键字进行搜索后展示成列表
 */
'use strict'
import React, {Component} from 'react';
import {View, Text, ScrollView, TouchableHighlight, Image, TouchableOpacity, DeviceEventEmitter} from 'react-native';

import * as baseStyle from '../../components/baseStyle.js';
import BaseComponent from '../../components/BaseComponent.js';
import UserInfoUtil from '../../utils/UserInfoUtil'
import ShareSetting from '../../modules/ShareSetting'
import {Utils, toast} from '../../utils/CommonUtils'
import RequestInterface from "../../actions/RequestInterface";
import { sensorsDataClickObject,sensorsDataClickActionName } from '../../components/SensorsDataTool';


export class SearchStockList extends BaseComponent {
    //添加自选股
    onPressAddPersonalStock(stock) {
        if (stock.Obj != undefined && stock.ZhongWenJianCheng != undefined) {
            UserInfoUtil.addPersonStock(stock.Obj, () => {
                sensorsDataClickObject.addStock.stock_code = stock.Obj;
                sensorsDataClickObject.addStock.stock_name = stock.ZhongWenJianCheng;
                sensorsDataClickObject.addStock.page_source = '搜索'
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.addStock);

                DeviceEventEmitter.emit('getFocus', 'SHOW');
            }, (error) => {
                if(error === '添加失败'){
                    DeviceEventEmitter.emit('getFocus', 'NOSHOW');
                }else {
                    DeviceEventEmitter.emit('getFocus', 'MORESHOW');
                }
            });
            //添加一次浏览记录
            // Utils.postToHotStock('http://192.168.11.103:8764/HotStock/save', stock.Obj, stock.ZhongWenJianCheng)
            Utils.postToHotStock(RequestInterface.HXG_BASE_URL+'/hotStockCodes/hotStock', stock.Obj, stock.ZhongWenJianCheng)
        }
    }

    //删除自选股
    onPressRemovePersonalStock(stock) {
        if (stock.Obj != undefined && stock.ZhongWenJianCheng != undefined) UserInfoUtil.deletePersonStock(stock.Obj);
    }

    _renderListItem(itemData) {
        if (ShareSetting.isDelistedStock(itemData.ZhongWenJianCheng)) {
            return <View/>
        }

        let personalButton

        let b = UserInfoUtil.isPersonStock(itemData.Obj);

        if (b) {
            personalButton = (
                <Text>已添加</Text>
            )
        }
        else {
            personalButton = (
                <TouchableOpacity onPress={() => this.onPressAddPersonalStock(itemData)}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Image style={{marginRight: 5}} source={require('../../images/icons/defaultAdd.png')}/>
                    </View>
                </TouchableOpacity>
            )
        }

        return (
            <TouchableHighlight key={itemData.Obj}
                                onPress={() => this.props.onItemPress && this.props.onItemPress(itemData)}
                                underlayColor={baseStyle.HIGH_LIGHT_COLOR}>
                <View style={{
                    justifyContent: 'space-between',
                    paddingLeft: 10,
                    paddingRight: b ? 5 : 8,
                    alignItems: 'center',
                    flexDirection: 'row',
                    height: 40,
                    backgroundColor: '#ffffff'
                }}>
                    <View style={{flex: 6, flexDirection: 'row'}}>
                        <View style={{flex: 1}}>
                            <Text style={{color: '#333333', fontSize: 15}}>{itemData.ZhongWenJianCheng}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={{color: '#333333', fontSize: 15}}>{itemData.Obj}</Text>
                        </View>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        {personalButton}
                    </View>
                </View>
            </TouchableHighlight>

        );
    }

    render() {
        const {historyStocks} = this.props.stateHistory
        const {searchResultList} = this.props.stateSearchResultList
        //默认显示历史记录
        let list = historyStocks
        //计数器
        let count = 0
        let isSearchContent = '没有搜索记录'

        /**如果搜索记录超过10条，显示最后10条**/
        if (historyStocks.length > 10) {
            let tempArray = []
            for (let i = historyStocks.length - 1; i > 0; i--) {
                if (count < 10) {
                    tempArray.unshift(historyStocks[i])
                    count++
                }

            }
            list = tempArray
        }

        /**搜索结果中添加过自选的排在未添加之后**/
        if (this.props.params !== '') {
            list = []
            let tempSearchResultList = []
            for (let i = 0; i < searchResultList.length; i++) {
                if (UserInfoUtil.isPersonStock(searchResultList[i].Obj)) {
                    tempSearchResultList.push(searchResultList[i])
                } else {
                    list.push(searchResultList[i])
                }
            }
            list = tempSearchResultList.concat(list)
        }


        //是否提示用户 没有搜索记录
        if (list.length > 0) {
            isSearchContent = ''
        }


        return (
            <View>

                {this.props.title == '最近搜索:'
                    ?
                    list.length != 0
                        ?
                        <View style={{
                            height: 32,
                            paddingLeft: 15,
                            backgroundColor: baseStyle.WHITE,
                            flexDirection: 'row',
                            alignItems: "center",
                            borderBottomColor: '#f1f1f1',
                            borderBottomWidth: 1
                        }}>
                            <Text style={{fontSize: 12, color: baseStyle.SMALL_TEXT_COLOR}}>{this.props.title}</Text>
                        </View>
                        :
                        <View/>
                    :
                    <View/>
                }
                <ScrollView style={{backgroundColor: '#ffffff'}} keyboardShouldPersistTaps={true}>
                    {list && list.map((itemData) => this._renderListItem(itemData))}
                    {list.length == 0 && this.props.title != '最近搜索:' ?
                        <View style={{alignItems: 'center', marginTop: 15}}><Text
                            style={{fontSize: 14, color: '#666666'}}>没有找到相关的股票</Text></View> : <View/>}
                </ScrollView>
            </View>
        );
    }
}

export class DZHSearchStockList extends Component {

    static defaultProps = {
        serviceUrl: '/kbspirit'
    };

    constructor(props) {
        super(props);
        this.isRequest = true;
        this.defaultParams = {
            type: 0,
            count: 10
        };

        this.title = '最近搜索:';
        if (this.props.params.input) {
            if (this.isRequest) {
                let keywordType = this.props.params.input
                if(IsNumberString(this.props.params.input)){
                    keywordType = '股票代码'
                }else{
                    keywordType = '板块名称'
                }
                if (this.props.entrance == '龙虎榜-游资图谱') {
                    keywordType = '营业部名称'
                }
                sensorsDataClickObject.sendSearchRequest.entrance = this.props.entrance
                sensorsDataClickObject.sendSearchRequest.keyword = this.props.params.input
                sensorsDataClickObject.sendSearchRequest.keyword_type = keywordType
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.sendSearchRequest)
                this.isRequest = false;
                this.fetchGet("https://newf10.ydtg.com.cn/apis/fis/v1/pcapp/qtd/keyDemons?searchKey=" + this.props.params.input + "&page=1&size=10",
                    (data) => {
                        this.adapt(data.data)
                    },
                    (error) => {
                    }
                )
            }
        }

    }

    componentDidMount() {
        //不继承父类，防止回到前台请求数据 精确搜索再次跳转
    }

    adapt(data) {
        this.title = '查询结果';
        let result = data;
        const {setSearchResultList} = this.props.actions
        // let result = (data[0] && data[0].JieGuo && data[0].JieGuo[0].ShuJu) || [];

        //以前返回后将退市和未退市的都存储了
        // let list = result.map((eachData) => {
        //     if (!ShareSetting.isDelistedStock(eachData.MingCheng)) {
        //         return {Obj: eachData.DaiMa, ZhongWenJianCheng: eachData.MingCheng}
        //     }
        //     // if (!ShareSetting.isDelistedStock(eachData.MingCheng)) {
        //     //     return {Obj: eachData.DaiMa, ZhongWenJianCheng: eachData.MingCheng}
        //     // }
        // })

        //现在 返回后将未退市的进行存储
        let list = []
        for (let i = 0; i < result.length; i++) {
            if (!ShareSetting.isDelistedStock(result[i].jc)) {
                list.push({Obj: result[i].dm, ZhongWenJianCheng: result[i].jc})
            }
        }

        let keywordType = this.props.params.input
        if(IsNumberString(this.props.params.input)){
            keywordType = '股票代码'
        }else{
            keywordType = '板块名称'
        }
        if (this.props.entrance == '龙虎榜-游资图谱') {
            keywordType = '营业部名称'
        }
        sensorsDataClickObject.searchResult.keyword = this.props.params.input
        sensorsDataClickObject.searchResult.keyword_type = keywordType
        sensorsDataClickObject.searchResult.has_result = list.length > 0 ? true : false
        sensorsDataClickObject.searchResult.search_result_num = list.length
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchResult)

        //判断是否是一条数据，只有一条进行跳转到详情页
        if (list.length === 1) {

            let stockS = this.props.params.input.replace(/[^0-9]/ig, "");
            if (stockS.length >= 6) {
                this.props.oneData(list[0]);
            }
        }
        setSearchResultList(list)
        this.isRequest = true;
        return false
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params) {
            // super.componentWillReceiveProps(nextProps);
            if (this.isRequest) {
                let keywordType = nextProps.params
                if(IsNumberString(nextProps.params)){
                    keywordType = '股票代码'
                }else{
                    keywordType = '板块名称'
                }
                if (this.props.entrance == '龙虎榜-游资图谱') {
                    keywordType = '营业部名称'
                }
                sensorsDataClickObject.sendSearchRequest.entrance = this.props.entrance
                sensorsDataClickObject.sendSearchRequest.keyword = nextProps.params
                sensorsDataClickObject.sendSearchRequest.keyword_type = keywordType
                SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.sendSearchRequest)
                this.isRequest = false;
                this.fetchGet("https://newf10.ydtg.com.cn/apis/fis/v1/pcapp/qtd/keyDemons?searchKey=" + (nextProps.params).input + "&page=1&size=10",
                    (data) => {
                        this.adapt(data.data)
                    },
                    (error) => {
                    }
                )
            }

        } else {
            this.title = '最近搜索:';
        }
    }

    //get请求
    fetchGet(url, successCallBack, failCallBack) {
        fetch(url)
            .then((response) => response.json())
            .then((responseData) => {
                successCallBack(responseData)
            })
            .catch((error) => {
                failCallBack(error)
            })
    }

    render() {
        return <SearchStockList {...this.props} title={this.title}></SearchStockList>;
    }
}


import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as AllActions from '../../actions/AllActions'

export default connect((state) => ({
        statePersonalStockList: state.PstateSearchResultListersonalStockListReducer,
        stateSearchResultList: state.SearchReducer,
        stateHistory: state.HistoryReducer,
        userInfo: state.UserInfoReducer,
    }),
    (dispatch) => ({
        actions: bindActionCreators(AllActions, dispatch)
    })
)(DZHSearchStockList)
