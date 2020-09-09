/**
 * 排行榜列表
 */

"use strict";

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
  AppState,
  Platform,
  Dimensions
} from "react-native";

import StockList from "./StockList.js";
import * as baseStyle from "../../components/baseStyle";
import StockFormatText from "../../components/StockFormatText";
import ShareSetting from "../../modules/ShareSetting";
import DetailPage from "./DetailPage";
import RATE from "../../utils/fontRate";
import PullListView, { RefreshState } from "../../components/PullListView";
import sync from "../../wilddog/Yd_cloud";
var Yd_sync = sync("cy");
var deviceWidth = Dimensions.get("window").width;
import NetInfo from "@react-native-community/netinfo";

//源达云一个节点存多少只股票
var length = 10;
export default class UpDownList extends Component {
  static defaultProps = {
    // serviceUrl: "/stkdata",
  };

  defaultParams = {
    // orderby: 'ZhangFu',
    start: 1,
    count: 20,
    desc: true
    // blockid:'yd_1_sec_2',//'YDI08237',
    // blockid:'yd_1_sec_8',//沪深a股,
    // titleid: 199,
    // subscribe: true,
    // unsubcribes:'',
    // gql: 'block=市场\\\\沪深市场\\\\沪深A股',
    // mode: 2,
    // sub: 1,
    // titleid:33,
  };

  constructor(props) {
    super(props);

    // 初始空数据
    this.state = {
      data: [],

      refreshState: RefreshState.Idle
    };
    // this.stockList=[],
    // this.defaultParams.orderby = this.props.params.field;
    this.pageNumber = 20;
    this._isEnd = false;
    this.pageIndex = 1;
    this.flag = 0;
    this.validCount = 0;
    this.isUpdate = true;
    //存储每次请求下来的数据同步到state里
    this.updateData = [];
    //上次请求的数据
    this.lastStockList = "";
    this.start = 0;
    this.defaultParams.desc =
      props.title == ShareSetting.getZhangFuBangTitle() ? true : false;
    this.itemHeight = 0;
    this.requestChangeStock = this.requestChangeStock.bind(this);
    this._request_ref = Yd_sync.ref("/quote_ranking_list/data");
    this.validCount_ref = Yd_sync.ref("/quote_ranking_list/count");
    this._contentViewScroll = this._contentViewScroll.bind(this);
    this.stockRequest = [];
  }

  requestChangeStock(stocklist) {
    this.cancel();
    //实时监听股票现价涨幅变动
    stocklist.map((value, index) => {
      let item = Yd_sync.ref("/quote_ranking_list/data/" + value).on(
        "value",
        snap => {
          this.getOnList(snap, index);
        }
      );
      this.stockRequest.push(item);
    });
    // this.stockRequest =Yd_sync.ref('/quote_ranking_list/data/'+start).on('value', (snap) => {
    //     this.getOnList(snap,0);
    // })
    // // this.stockRequest=this._request_ref
    // this.stockRequest1=Yd_sync.ref('/quote_ranking_list/data/'+end).on('value',(snap)=>{
    //     this.getOnList(snap,1);
    // });
    this.lastStockList = stocklist;
  }
  getOnList(snap, index) {
    let list = snap.nodeContent;
    // let paths=snap.nodePath.split['/'].reverse();
    let paths = snap.nodePath.split("/");
    let start = paths[paths.length - 1];
    if (start !== this.lastStockList[index]) return;
    let datas = [];
    datas[start] = list;
    this.adaptData(datas);
  }
  _query(props) {
    // 取消上次请求
    // if(this.defaultParams.start==0)
    //     this.cancel();

    // 重新请求
    // if (props.params) {
    //
    //     // 记录上一次请求参数
    //     this._lastQueryProps = props;
    //     this._request =connection.request('FetchBlockSortNative',
    //         this.defaultParams,
    //         (data) => {
    //         let result ='';
    //         // let stockList=this.stockList;
    //         let datalist=[];
    //         if(Platform.OS=='ios')
    //         {
    //             data.dataArray.map((value,index) => {
    //                 result+=index==this.defaultParams.count-1?value.label:value.label+',';
    //                 datalist[index]=value.label;
    //         });
    //
    //         }
    //         else
    //         {
    //             data.dataList.map((value,index) => {
    //                 result+=index==this.defaultParams.count-1?value.label:value.label+',';
    //                 datalist[index]=value.label;
    //             });
    //         }
    //
    //         // stockList.splice(this.defaultParams.start,this.defaultParams.count,datalist);
    //         // // stockList.push.apply(stockList,datalist);
    //         // this.stockList=stockList;
    //             this.validCount=data.validCount;
    //         // this.stockRequest&&this.stockRequest.cancel();
    //         this.adapt(result);
    //         console.log('板块排序产生变化');
    //     });
    //     // this._request = connection.request(props.serviceUrl, this._formatQueryParams(Object.assign({}, this.defaultParams, props.params)), (data1) => {
    //     //
    //     //
    //     //     // if(this.constructor.name === 'BlockStockTop' ||
    //     //     //     this.constructor.name === 'SortStockList'
    //     //     //     || this.constructor.name === 'BlockChart'
    //     //     // ) {
    //     //     //
    //     //     // }else {
    //     //     //     console.log('大智慧父类 = name = '+this.constructor.name +' >> data1 = '+ JSON.stringify(data1) +' >> props.params = '+JSON.stringify(props.params)+' >> this.defaultParams = '+JSON.stringify(this.defaultParams)+'整个 props = '+JSON.stringify(props))
    //     //     //
    //     //     // }
    //     //
    //     //     if (!(data1 instanceof Error)) {
    //     //         Promise.resolve(this.adapt(data1)).then((data) => {
    //     //             if (data !== false) {
    //     //
    //     //                 this.setState({data});
    //     //
    //     //                 // 触发事件
    //     //                 let onData = this.props.onData;
    //     //                 (typeof onData === 'function') && onData(data);
    //     //             }
    //     //         });
    //     //     }
    //     // });
    //
    //     // return this._request;
    // }

    //获取20只股票
    let start;
    if (this.defaultParams.desc) {
      start = this.defaultParams.start;
    } else {
      start = this.validPage - this.defaultParams.start;
    }
    this._request_ref
      .orderByKey()
      .startAt("sort_" + ("000" + start).slice(-3))
      .limitToFirst(2)
      .get(snap => {
        this.adaptData(snap.nodeContent);
        // this.defaultParams.start==1&&this.requestChangeStock('sort_'+this.defaultParams.start);
      });
  }
  parseStockForWilddog(data) {
    let stock = {};
    stock.ZhongWenJianCheng = data.n;
    stock.ZhangFu = data.r;
    stock.ZuiXinJia = Number(data.p);
    stock.Obj = data.c;
    return stock;
  }
  //解析数据，存储到本地
  adaptData(stocklist) {
    //转义字符
    let data = [...this.state.data];
    let keys = Object.keys(stocklist);
    let values = Object.values(stocklist);

    if (!this.defaultParams.desc) {
      keys.reverse();
      values.reverse();
    }
    values.map((value, index) => {
      let item = value
        .replace(/</g, "{")
        .replace(/>/g, "}")
        .replace(/\$/g, ":");
      let items = item.split("&");
      if (!this.defaultParams.desc) items.reverse();
      let start;
      if (this.defaultParams.desc)
        start = (keys[index].substring(5) - 1) * length;
      else {
        let sort = keys[index].substring(5);
        if (sort == this.validPage) start = 0;
        else {
          let last =
            this.validCount % length == 0 ? 10 : this.validCount % length;
          start = (this.validPage - (parseInt(sort) + 1)) * length + last;
        }
      }
      for (let i = 0; i < items.length; i++) {
        data.splice(
          start + i,
          1,
          this.parseStockForWilddog(JSON.parse(items[i]))
        );
      }
    });

    this.setState({ data: data }, () => {
      if (this.state.data.length >= this.validCount) {
        this.flag++;
        this.setState(
          {
            refreshState: RefreshState.NoMoreData
          },
          () => {
            if (this.flag === 1) {
              this.defaultParams.count -= this.pageNumber;
              // this.defaultParams.start-=this.pageNumber;
              this._query({ params: this.defaultParams });
            }
          }
        );
      } else if (this.state.data.length >= this.defaultParams.count) {
        DeviceEventEmitter.emit("loaded");
      }

      if (this.defaultParams.start == 1 && keys.length >= 2)
        this.requestChangeStock(keys);

      if (this.defaultParams.start == 1 && this.state.data.length <= 20) {
        // this.flag=0;
        // this.onFooterRefresh();
        this._loadMoreData();
      }
    });
  }
  cancel() {
    if (this.stockRequest && this.lastStockList.length > 0) {
      this.lastStockList.map(value => {
        Yd_sync.ref("/quote_ranking_list/data/" + value).off(
          "value",
          snap => { }
        );
      });
      this.stockRequest = [];
      // Yd_sync.ref('/quote_ranking_list/data/'+this.lastStockList[0]).off('value', (snap) => {
      // });
      // Yd_sync.ref('/quote_ranking_list/data/'+this.lastStockList[1]).off('value', (snap) => {
      // });
    }
  }

  componentWillMount() {
    //监听网络变化事件
    this._subscription = NetInfo.addEventListener(this._handleConnectivityChange)
    // NetInfo.isConnected.addEventListener(
    //   "change",
    //   this._handleConnectivityChange
    // );
    this.initValidCount();
  }
  initValidCount() {
    //获取总的数据条数
    this.validCount_ref.get(snap => {
      this.validCount = snap.nodeContent;
      this.validPage =
        this.validCount % length > 0
          ? parseInt(this.validCount / length) + 1
          : parseInt(this.validCount / length);
      this._query(this.props);
    });
  }
  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);

    //监听网络变化事件
    // NetInfo.isConnected.addEventListener('change', this._handleConnectivityChange)
  }
  componentWillUnmount() {
    this.cancel();
    AppState.removeEventListener("change", this._handleAppStateChange);
    // NetInfo.isConnected.removeEventListener(
    //   "change",
    //   this._handleConnectivityChange
    // );
    this._subscription && this._subscription();
    this.nomore&&this.nomore.remove();
    this.loaded&&this.loaded.remove();
    //重写组件的setState方法，直接返回空
    this.setState = (state, callback) => {
      return;
    };
  }
  componentWillReceiveProps(nextProps) {
    // 判断是否需要重新订阅数据
    if (this.props.title !== nextProps.title) {
      this.defaultParams.desc =
        nextProps.title == ShareSetting.getZhangFuBangTitle() ? true : false;
      this.defaultParams.start = 1;
      this.cancel();
      this.lastStockList = [];
      // this.updateData=[];
      // this.isUpdate=true;
      this.setState({ data: [] }, () => {
        this._query(nextProps);
      });
    }
  }

  //网络状态
  _handleConnectivityChange = status => {
    if (status.isConnected) {
      if (this.state.data) {
        this.initValidCount();
      } else {
        this.requestChangeStock(this.lastStockList);
      }
    } else {
      this.cancel();
      // connection.close()
    }
  };

  //程序前后台状态
  _handleAppStateChange = appState => {
    // if (appState == 'active') {
    //     this._query(this.props)
    // }
    // else
    // {
    //     this.cancel();
    //     //关闭所有请求
    //     // connection.close()
    // }
  };

  renderRow = rowData1 => {
    //return <StockListItem {...rowData} column={['ZhongWenJianCheng', 'ZuiXinJia', this.props.params.field]} onPress={this._onItemPress.bind(this, rowData)}></StockListItem>
    let rowData = rowData1 && rowData1.item;
    let clr = baseStyle.SMALL_TEXT_COLOR;
    if (rowData.ZhangFu > 0) clr = baseStyle.UP_COLOR;
    else if (rowData.ZhangFu < 0) clr = baseStyle.DOWN_COLOR;
    return (
      <TouchableOpacity
        onPress={this._onItemPress.bind(this, rowData, rowData1.index)}
      >
        <View
          style={styles.container}
          onLayout={event => {
            let { x, y, width, height } = event.nativeEvent.layout;
            if (this.itemHeight == 0) this.itemHeight = height;
          }}
        >
          <View
            key="ZhongWenJianCheng"
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <StockFormatText
              style={{
                color: baseStyle.BLACK_100,
                fontSize: RATE(30),
                marginBottom: 4,
                textAlign: "left"
              }}
            >
              {rowData.ZhongWenJianCheng}
            </StockFormatText>
            <StockFormatText
              style={{
                color: baseStyle.BLACK_70,
                fontSize: RATE(24),
                textAlign: "left"
              }}
            >
              {rowData.Obj}
            </StockFormatText>
          </View>
          <View key="ZhangFu" style={{ flex: 1 }}>
            <StockFormatText
              style={{ textAlign: "center", fontSize: RATE(30), color: clr, fontFamily: 'Helvetica Neue' }}
              unit="%"
              sign={true}
            >
              {rowData.ZhangFu / 100}
            </StockFormatText>
          </View>
          <View key="ZuiXinJia" style={{ flex: 1 }}>
            <StockFormatText
              titlename={"ZuiXinJia"}
              style={{
                textAlign: "right",
                fontSize: RATE(30),
                color: clr,
                fontFamily: 'Helvetica Neue'
              }}
            >
              {rowData.ZuiXinJia}
            </StockFormatText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  _onItemPress(data, rowId) {
    //console.log("data=" + data);
    // this.props.navigator.push({component: <DetailPage {...data}/>})
    let array = this.state.data;
    let index = rowId;
    Navigation.navigateForParams(this.props.navigation, "DetailPage", {
      ...data,
      index: index,
      array: array
    });
  }

  _loadMoreData() {
    // this.defaultParams.start=this.defaultParams.count;
    // this.defaultParams.start=this.defaultParams.count;
    this.defaultParams.count += this.pageNumber;
    // if (this.defaultParams.count >= this._total) {
    //   this._displayNumber = this._total;
    //   this._isEnd = true;
    // }
    if (this.props.title === ShareSetting.getZhangFuBangTitle())
      this.defaultParams.desc = true;
    else this.defaultParams.desc = false;
    this.defaultParams.start += 2; //=('000'+num).slice(-3);
    this._query({ params: this.defaultParams });
  }

  onFooterRefresh = () => {
    if (this.flag === 0) {
      this.setState({ refreshState: RefreshState.FooterRefreshing }, () => {
        this._loadMoreData();
      });
    } else {
      this.setState({
        refreshState: RefreshState.NoMoreData
      });
    }
    this.nomore=DeviceEventEmitter.addListener("nomore", () => {
      this.flag++;
      this.setState(
        {
          refreshState: RefreshState.NoMoreData
        },
        () => {
          if (this.flag === 1) {
            // this.defaultParams.count -= this.pageNumber;
            // this._query({params: this.defaultParams});
          }
        }
      );
    });

    this.loaded=DeviceEventEmitter.addListener("loaded", () => {
      this.setState({
        refreshState:
          this.flag > 1 ? RefreshState.NoMoreData : RefreshState.Idle
      });
    });
  };
  //列表滑动结束监听事件
  _contentViewScroll(e: Object) {
    var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
    // var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
    var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度

    // console.log('滑动',offsetY,this.start);
    // if (offsetY + oriageScrollHeight >= contentSizeHeight){
    //     Console.log('上传滑动到底部事件')
    // }
    if (offsetY <= 0) return;
    //顶部是第几条数据
    let number =
      parseInt(offsetY / this.itemHeight) < 0
        ? 0
        : parseInt(offsetY / this.itemHeight) + 1;
    //底部是第几条数据
    let endnumber = Math.ceil(number + oriageScrollHeight / this.itemHeight);

    if (number <= this.start || endnumber >= this.start + length) {
      // console.log('滑动1212',number,Math.round(number/length),this.start);
      let startNumber =
        Math.ceil(number / length) <= 1 ? 1 : Math.ceil(number / length);
      // let endNumber=startNumber+1;
      let descStart =
        parseInt(number / length) <= 0 ? 0 : parseInt(number / length);
      // let descEnd=descStart+1;
      let start = this.defaultParams.desc
        ? ("000" + startNumber).slice(-3)
        : ("000" + (this.validPage - descStart)).slice(-3);
      let endLength = Math.ceil(endnumber / length) - startNumber;
      if (
        this.lastStockList[0] == "sort_" + start &&
        this.lastStockList.length - 1 == endLength
      )
        return;
      this.stocklist = [];
      this.start = number;
      //获取监听节点的长度
      for (let i = 0; i <= endLength; i++) {
        let item = this.defaultParams.desc
          ? ("000" + (startNumber + i)).slice(-3)
          : ("000" + (this.validPage - (descStart + i))).slice(-3);
        this.stocklist.push("sort_" + item);
      }
      // console.log('订阅内容',number,this.stocklist);

      this.requestChangeStock(this.stocklist);
    }
  }

  keyExtractor = (item: any, index: number) => {
    return index.toString();
  };

  render() {
    let data = this.state.data;
    return (
      <View>
        <PullListView
          data={data}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderRow}
          refreshState={this.state.refreshState}
          onFooterRefresh={this.onFooterRefresh}
          onScroll={this._contentViewScroll}
        />
      </View>
      /*<View>
             {
             data && data.length > 0 &&
             <StockList data={this.state.data} renderRow={this._renderRow.bind(this)}/>
             }
             {
             this._isEnd ? (
             <View/>
             ) : (
             <View style={{height: 50,}}>
             <TouchableOpacity onPress={this._loadMoreData.bind(this)}
             style={{
             flex: 1,
             alignItems: 'center',
             justifyContent: 'center'
             }}>
             <Text style={{
             color: baseStyle.SMALL_TEXT_COLOR,
             textAlign: 'center'
             }}>加载更多</Text>
             </TouchableOpacity>
             </View>
             )
             }
             </View>*/
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 49,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseStyle.DEFAULT_BORDER_COLOR
  }
});
