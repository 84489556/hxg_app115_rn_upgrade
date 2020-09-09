/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/1 17
 * description:高管交易榜最新交易
 */
import React, { Component } from 'react';
import {
    Platform,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    ToastAndroid,

} from 'react-native';

import WebChart from '../../../components/WebChart';
import * as ScreenUtil from '../../../utils/ScreenUtil';
import { LargeList } from "react-native-largelist-v3";
import  RequestInterface from '../../../actions/RequestInterface';
import  HitsApi from '../Api/HitsApi';
import  CodeApi from '../Api/CodeApi';
import ModalDropdown from '../../../components/ModalDropdown.js';


import Yd_cloud from '../../../wilddog/Yd_cloud.js';
//import {mNormalFooter} from "../../../components/mNormalFooter";
let refHXG = Yd_cloud().ref(MainPathYG);
let allIndustry= refHXG.ref('hangye');
import  StockFormatText from '../../../components/StockFormatText';
import { sensorsDataClickActionName, sensorsDataClickObject } from '../../../components/SensorsDataTool';
import {mRiskTipsFooter} from "../../../components/mRiskTipsFooter";
import  RiskTipsFooterView  from "../../../components/RiskTipsFooterView";
const setTimes = Platform.OS==='ios' ? 1000: 600;

export default class NewDealpage extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            dataDiscount: [{ name: "", value: 0 }], //折线图表数据

            dataBarItem:[],//柱状图数据,正数数据
            dataPositive:[],//柱状图数据,正数数据
            dataNegative:[],//柱状图数据，负数数据
            optionDropdownInstryName : [],//行业选项
            optionDropdownInstryCode : [],//行业Code
            data:[
                {
                    title:"",
                    items: []
                }
            ],
            //title传入一个conCode ,-1表示不需要排序，0表示默认状态，1表示降序，2表示升序
            //样式修改
            titles: [
                {conName:"交易日期",conCode:1},
                {conName:"股票名称",conCode:-1},
                {conName:"变动人",conCode:-1},
                {conName:"变动类型",conCode:-1},
            ],
            allLoaded:false,
        };
        this.renderRow4ModalDropdown = this.renderRow4ModalDropdown.bind(this);
        this.renderRowInstryModalDropdown = this.renderRowInstryModalDropdown.bind(this);
        this._renderunLockHeader = this._renderunLockHeader.bind(this);

        this.optionDropdown = CodeApi.optionDropdown; //近一年下拉数据选择

        this.dropDownName = this.optionDropdown[0];

        this.dropInstryName = "全部行业"; //保存行业选择的Name
        this.dropInstryCode = ""; //保存行业选择的Code

        this.pageNo = 1;//页数
        this.pageSize = 20;//默认每次请求60条数据

        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(222);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度

        //this.mScrolly = 0;//列表的滑动偏移量
        //this.layoutHeight=0;//列表头部的高度,如果列表头部高度固定,则这个可以直接写死在高度计算中，不用回调计算

       // this.scrollBegin = false; //惯性滑动减速停止
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
        this.getLinesDatas();
        this.getBarDatas();
        this.getNewSaleListData();
        this.getInstry();
    }

    /**
     * 获取所有行业数据
     * */
    getInstry() {
        allIndustry.get((response)=>{
            if(response.code==0){
                //数据转换
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);
                for (let i= 0;i<key.length;i++){
                 item[i]['key'] = key[i];
                }
                item.reverse();

                for (let j=0;j<item.length;j++){
                    this.state.optionDropdownInstryName.push(item[j].indus_name);
                    this.state.optionDropdownInstryCode.push(item[j].index_code);
                }

                this.dropInstryName = "全部行业";
                this.dropInstryCode = "";

                this.setState({
                    optionDropdownInstryName: this.state.optionDropdownInstryName,
                    optionDropdownInstryCode: this.state.optionDropdownInstryCode
                });



            }else {

            }

        });
    }
    /**
     * 获取交易列表的数据
     * 每次请求60条
     * */
    getNewSaleListData(){
        let params = {};
        params.pageNum = this.pageNo;
        params.pageSize = this.pageSize;
        params.indus = this.dropInstryCode;
        //直接判断title中 index=7的交易日期 conCode值，判断升降序
        if(this.state.titles[0].conCode === 1){
            params.desc = true;
        }else if(this.state.titles[0].conCode === 2) {
            params.desc = false;
        }else {
            params.desc = true;
        }
        if(this.pageNo === 1){
            this.state.data[0].items = [];
        }

        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.NEW_SALE_LIST,params,
            (response)=>{
                this._list.endLoading();
                if(response && response.list.length>0){
                    for (let i =0;i<response.list.length;i++){

                        let newItem = {};
                        //储存第一列需要的数据
                        //let titles = {};
                        newItem.id = response.list[i].id;
                        newItem.secName = response.list[i].secName;
                        newItem.secCode = response.list[i].market+""+response.list[i].secCode;

                        newItem.changer = response.list[i].changer ? response.list[i].changer:'--';
                        newItem.chgType = response.list[i].chgType ? response.list[i].chgType:'--';
                        newItem.transPrice = response.list[i].transPrice!=null ? response.list[i].transPrice:'--';
                        newItem.chgSharesNum = response.list[i].chgSharesNum ? Number(response.list[i].chgSharesNum):'--';
                        newItem.tradeAmt = response.list[i].tradeAmt!=null ? response.list[i].tradeAmt:'--';
                        newItem.manageName = response.list[i].manageName ?  response.list[i].manageName:'--';
                        newItem.duty = response.list[i].duty ?  response.list[i].duty:'--';
                        newItem.relation = response.list[i].relation ?  response.list[i].relation:'--';
                        newItem.chgDate = response.list[i].chgDate ?  response.list[i].chgDate:'--';

                        this.state.data[0].items.push(newItem);
                    }

                    //页数+1
                    this.pageNo+=1;
                    this.setState({
                        data:this.state.data,
                        allLoaded:response.list.length<this.pageSize ? true:false,
                    });
                }else {
                    this.setState({
                        data:this.state.data,
                        allLoaded:true,
                    });
                }
            },
            (error)=>{
                this.setState({
                    data:this.state.data,
                    allLoaded:true,
                });
            })

    }

    /**
     * 获取折线图，近20日高管净买市场统计
     * */
    getLinesDatas(){
        let params ={};
        if(this.dropDownName==="全部"){
            params.mktcode = "ALL";
        }else if(this.dropDownName==="沪市"){
            params.mktcode = 212001;
        }else if(this.dropDownName==="深市"){
            params.mktcode = 212100;
        }else if(this.dropDownName==="创业板"){
            params.mktcode = 216003;
        }else if(this.dropDownName==="中小板"){
            params.mktcode = 216002;
        }else if(this.dropDownName==="科创板"){
            params.mktcode = 216011;
        }
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.MARKET_CENSUS,params,
            (response)=>{
                if(response && response.length>0){
                    //因为现在图标的标签不是默认的标签，然后测试还快速点击，每次点的时候，图标还没有加载完成，
                    // 就显示默认的标签，所以现在先默认加载空数据，0.6秒以后再刷新新数据，刷新后就没有问题了
                    //这个0.6秒可以变化，但是一定要大于图标的渲染时间
                    this.setState({dataDiscount: [{ name: "", value: 0 }]},()=>{
                        setTimeout(()=>{
                            let newDatas = [];
                            for (let i=0;i<response.length;i++){
                                let items = {};
                                items.name=response[i].chgDate.substring(0,10);
                                items.value =response[i].shares;
                                newDatas.push(items);
                            }
                            this.setState({dataDiscount: newDatas},()=>{
                                //this.setState({dataDiscount: newDatas})
                            });
                        },setTimes)
                    });
                }else {
                    this.setState({dataDiscount: [{ name: "", value: 0 }]});
                }
            },
            (error)=>{

            })
    }
    /**
     * 获取柱状图的数据
     * transAmt 有正负
     * */
    getBarDatas(){
        RequestInterface.baseGet(RequestInterface.HXG_BASE_URL,HitsApi.SEND_BUY_FIVE,{},
            (response)=>{
                if(response && response.length>0){
                    response = response.sort(this.sortNumBigtoSmall);


                    let dataP = [];
                    let dataN = [];
                    for (let i =0;i<response.length;i++){
                        this.state.dataBarItem.push(response[i].industry);
                        let items = {};
                        if(response[i].transAmt>=0){
                            items.money = parseInt(response[i].transAmt/10000);
                            items.value = response[i].shares;
                            dataP.push(items);
                            dataN.push('-');
                        }else {
                            items.money = parseInt(response[i].transAmt/10000);
                            items.value = response[i].shares;
                            dataP.push('-');
                            dataN.push(items);
                        }
                    };
                    this.setState({
                        dataBarItem: this.state.dataBarItem,
                        dataPositive:dataP,//柱状图数据,正数数据
                        dataNegative:dataN,//柱状图数据，负数数据
                    });

                }else {
                    this.setState({
                        dataBarItem:[],
                        dataPositive:[],
                        dataNegative:[],
                    });

                }
            },
            (error)=>{

            })

    }
    /**
     * 从大到小排序
     * 高管买入次数
     * */
    sortNumBigtoSmall(a, b) {
        return b.shares - a.shares;
    }

        /**
         * 点击图表item回调的参数
         * */
    alertMessage = (message) => {
        console.log("图表回调",message);
        // if (message.type === 'select') {
        //     const item = this.state.data[message.payload.index];
        //     Alert.alert(
        //         item.name,
        //         item.value+"",  // 转换数值为字符串并格式化
        //     );
        // }
    }
    /**
     * 点击图表item回调的参数
     * */
    alertMessages = (message) => {
        console.log("图表回调",message);
        // if (message.type === 'select') {
        //     const item = this.state.data[message.payload.index];
        //     Alert.alert(
        //         item.name,
        //         item.value+"",  // 转换数值为字符串并格式化
        //     );
        // }
    }


    render() {
        return (
            <LargeList
                bounces={true}
                style={{ backgroundColor: "white",flex:1}}
                contentStyle={{alignItems: "flex-start", width: "100%" }}
                data={this.state.data}
                scrollEnabled={true}
                ref={ref => (this._list = ref)}
                heightForSection={() =>this.HEADER_HEGHT}
                renderHeader={this._renderunLockHeader}
                renderSection={this._renderSection}
                heightForIndexPath={() => this.ITEM_HEGHT}
                renderIndexPath={this._renderItem}
                showsHorizontalScrollIndicator={ false}
                headerStickyEnabled={false}
                directionalLockEnabled={true}
                loadingFooter={mRiskTipsFooter}
                renderFooter={this._renderMyFooters}
                onLoading={() => {this.getNewSaleListData();}}
                allLoaded={this.state.allLoaded}
                onTouchBegin={()=>{
                    //console.log("largerList手指按下")
                }}
                onTouchEnd={()=>{
                    //console.log("largerList手指抬起")
                    // if(Platform.OS !=='ios'){
                    //     return;
                    // }
                    // setTimeout(()=>{
                    //     if(this.scrollBegin === false){
                    //         console.log("执行监听")
                    //     }else {
                    //         this.scrollBegin = false
                    //     }
                    // },100);
                }}
                onMomentumScrollBegin={()=>{
                  //  this.scrollBegin = true;
                }}
                onMomentumScrollEnd={()=>{
                   // this.mScrollEnd();
                   // console.log("执行监听")
                }}
                onScroll={({nativeEvent:{contentOffset:{x, y}}})=>{
                   // this.mScrolly = y;
                }}
            />

        )
    }
    /**
     * 滑动惯性停止后调用的方法
     *itemNumber的算法，分子为计算当前屏幕列表显示的高度，简单的加减法
     * */
    // mScrollEnd(){
    //     //ScreenUtil.scaleSizeW(60)是部的高度
    //     let numberStart = Math.floor((this.mScrolly-this.layoutHeight)/this.ITEM_HEGHT);
    //     let itemNumber = Math.floor((ScreenUtil.screenH-ScreenUtil.statusH-44-ScreenUtil.scaleSizeW(60)-this.HEADER_HEGHT-44)/this.ITEM_HEGHT);
    //    // console.log("滑动惯性停止",numberStart);
    //     //如果numberStart 为负值，则当前计算显示条数时+1,为正时+2
    //    // console.log("滑动惯性停止----",itemNumber+2)
    //     //  console.log("===========",this.ITEM_HEGHT)
    // }

    /**
     * 加载可滑动列表的头布局
     * */
    _renderunLockHeader=()=>{
        //折线图的间隔配置
        let interals;
        if(this.state.dataDiscount){
            interals = Math.floor((this.state.dataDiscount.length-3)/2);
        }else {
            interals = 0;
        }
        let rateOfMax = 0;
        let inters = 0;
        if(this.state.dataDiscount){
            //折线图的纵轴配置
            let rateOfValues = [];
            this.state.dataDiscount.forEach(element => {
                rateOfValues.push(element.value);
            });
            rateOfValues.sort(function (a, b) { return a - b; });
            rateOfMax = rateOfValues[rateOfValues.length-1];
            inters  =   (rateOfMax- rateOfMax%2)/2
        }
        return (
            <View style={{alignSelf:"stretch"}}>
                <View style={{width:ScreenUtil.screenW,height:ScreenUtil.scaleSizeW(840), justifyContent: "center", alignItems: "center",}}
                      onLayout={(event)=>{
                     // this.layoutHeight = event.nativeEvent.layout.height
                      }}
                >
                <View style={styles.intervalLine}/>
                    {this.state.dataDiscount && this.state.dataDiscount.length>0 ?
                        <WebChart
                            style={styles.chart}
                            option={{
                                dataset: {
                                    dimensions: ['name', 'value'],
                                    source: this.state.dataDiscount || [{ name: null, value: 0 }],
                                },
                                title:{
                                    text:"近一年高管交易市场统计",
                                    left:5,
                                    top:5
                                },
                                grid:{
                                    top:55,
                                    left:30,
                                    right:30,
                                    bottom:25
                                },
                                color:"#ff9d3a",
                                backgroundColor: "#ffffff",
                                tooltip: {
                                    trigger: 'axis',
                                    show:false,
                                    position:"inside",
                                    formatter: function(params) {
                                        let seriesName = params[0].name.substring(0,4)+"年"+params[0].name.substring(5,7)+"月"+params[0].name.substring(8,10)+"日";
                                        let num = params[0].data.value;
                                        return seriesName+"<br/>"+"股票数量:"+num+"只";
                                    },
                                },
                                xAxis: {
                                    type: 'category',
                                    position:'bottom',
                                    axisTick:{
                                        show:false
                                    },
                                    axisLabel:{
                                        interval:interals,
                                    },
                                    //data: ['2019-0701', '2019-0702', '2019-0703', '2019-0704', '2019-0705', '2019-0706', '2019-0707']
                                },
                                yAxis: {
                                    type: 'value',
                                    name: '只',
                                    max: rateOfMax,
                                    interval: inters, // y轴显示三个刻度值，即 0、中间值、最大值
                                    axisTick:{
                                        show:false
                                    },
                                    axisLabel:{
                                        show:true,
                                    },
                                    axisLine: {
                                        // lineStyle: {
                                        //     color: "#b4b4b4"
                                        // }
                                    },
                                    splitLine: {
                                        show: false
                                    },

                                },
                                series: [{
                                    name:'股票数量',
                                    //data: [1, 3, 5, 3, 1, 2, 3],
                                    type: 'line',
                                    itemStyle: {
                                        normal: {
                                            //color: '#6cb041',
                                            lineStyle:{
                                                width:1//设置线条粗细
                                            }
                                        }
                                    }
                                }],
                            }
                            }
                            exScript={`
                                     chart.on('click', (params) => {
              if(params.componentType === 'series') {
                window.postMessage(JSON.stringify({
                  type: 'select',
                  payload: {
                    index: params.dataIndex,
                  },
                }));
              }
            });


          `}    onMessage={this.alertMessages}
                        />

                    :
                        null
                    }


                <View style={styles.intervalLine}/>
                <WebChart
                    style={styles.chart}
                    option={{
                        dataset: {
                            dimensions: ['name', 'value'],
                            source: this.state.data || [{ name: null, value: 0 }],
                        },
                        backgroundColor: '#fff',
                        title:{
                            text:"近20日高管买入次数前5行业",
                            left:5,
                            top:5
                        },
                        grid:{
                            top:55,
                            left:15,
                            right:15,
                            bottom:32
                        },
                        tooltip: {
                            trigger:"item",
                            position:"inside",
                            show:false,
                            //  // money
                            //                                             // numbers ;
                            formatter: function(a) {
                                let result ="";
                                let num = a.data.money;
                                //这里的数据除以了10000
                                if(num>10000){
                                    result =  "成交金额<br/>"+(num/10000).toFixed(2)+"亿";
                                }else if(num<=10000 && num>0 ) {
                                    result = "成交金额<br/>"+num.toFixed(2)+"万" ;
                                }else {
                                    result = "成交金额<br/>"+num.toFixed(2)+"";
                                }
                                //result.unshift("成交金额<br/>"+num+"万");
                                return result;
                            },
                            // extraCssText:'width:70px; white-space:pre-wrap'
                        },

                        xAxis: {
                            data: this.state.dataBarItem,
                            type: 'category',
                            //show:true,
                            axisLine:{
                                show:false
                            },
                            axisTick:{
                                show:false
                            },
                            axisLabel: {
                                show: true,
                                //color: '#00ff00',  //更改坐标轴文字颜色
                                fontSize : 12, //更改坐标轴文字大小
                                //fontWeight:'bold',
                                interval:0,
                                //坐标轴刻度标签的相关设置。
                                formatter : function(params){
                                    var newParamsName = "";// 最终拼接成的字符串
                                    var paramsNameNumber = params.length;// 实际标签的个数
                                    var provideNumber = 4;// 每行能显示的字的个数
                                    var rowNumber = Math.ceil(paramsNameNumber / provideNumber);// 换行的话，需要显示几行，向上取整
                                    /**
                                     * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
                                     */
                                    // 条件等同于rowNumber>1
                                    if (paramsNameNumber > provideNumber) {
                                        /** 循环每一行,p表示行 */
                                        for (var p = 0; p < rowNumber; p++) {
                                            var tempStr = "";// 表示每一次截取的字符串
                                            var start = p * provideNumber;// 开始截取的位置
                                            var end = start + provideNumber;// 结束截取的位置
                                            // 此处特殊处理最后一行的索引值
                                            if (p == rowNumber - 1) {
                                                // 最后一次不换行
                                                tempStr = params.substring(start, paramsNameNumber);
                                            } else {
                                                // 每一次拼接字符串并换行
                                                tempStr = params.substring(start, end) + "\n";
                                            }
                                            newParamsName += tempStr;// 最终拼成的字符串
                                        }

                                    } else {
                                        // 将旧标签的值赋给新标签
                                        newParamsName = params;
                                    }
                                    //将最终的字符串返回
                                    return newParamsName
                                }
                            },
                        },
                        yAxis: {
                            show:false,
                            splitLine: {
                                show: false
                            },

                        },
                        series: [
                            {
                                name: '增长',
                                type: 'bar',
                                stack: 'one',
                                data: this.state.dataPositive,
                                barWidth:30,
                                itemStyle:{
                                    color:"#F92400",
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position:  'top',
                                        distance: Platform.OS==="ios"? 12:3,
                                        formatter: function(a) {
                                            //let result ="";
                                            let result = a.data.value +"次";
                                            //这里的数据除以了10000
                                            // if(num>10000){
                                            //     result =  (num/10000).toFixed(2)+"亿";
                                            // }else if(num<=10000 && num>0 ) {
                                            //     result = num.toFixed(2)+"万";
                                            // }else {
                                            //     result = num+"元";
                                            // }
                                            return result;
                                        }
                                    }
                                },
                            },
                            {
                                name: '增长',
                                type: 'bar',
                                stack: 'one',
                                data: this.state.dataNegative,
                                barWidth:40,
                                itemStyle:{
                                    color:"#339800",
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position:  'bottom',
                                        formatter: function(a) {
                                            // let result ="";
                                            // let num = a.data.numbers;
                                            // //这里的数据除以了10000
                                            // if(num>10000){
                                            //     result =  (num/10000).toFixed(2)+"亿";
                                            // }else if(num<=10000 && num>0 ) {
                                            //     result = num.toFixed(2)+"万";
                                            // }else {
                                            //     result = num+"元";
                                            // }
                                            let result = a.data.value +"次";
                                            return result;
                                        }

                                    }
                                },
                            }
                        ],
                    }
                    }
                    exScript={`
            chart.on('click', (params) => {
              if(params.componentType === 'series') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'select',
                  payload: {
                    index: params.dataIndex,
                  },
                }));
              }
            });
          `}
                    onMessage={this.alertMessage}
                />

                <View style={styles.intervalLine}/>

                <View style={styles.searchItem}>
                    <Text style={styles.searchItemText}>最近一年</Text>
                    <View style={styles.searchSView}>
                        <ModalDropdown ref='dropDownIndustry'
                                       defaultValue={this.dropInstryName}
                                       defaultIndex={0}
                                       onSelect={(idx, value) => this._onDropDownInstry(idx, value)}
                                       style={{width:80}}
                                       textStyle={{textAlign:'center', fontSize:ScreenUtil.setSpText(24), color:"gray"}}
                                       buttonStyle={{height:20,borderRadius:2,backgroundColor:"#fff",
                                           justifyContent:'center', alignItems:'center'}}
                                       dropdownStyle={{height:150, width: this.widthDropdown, justifyContent:'center',
                                           alignItems:'center',marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(35):ScreenUtil.scaleSizeW(20),marginRight:5}}
                                       options={this.state.optionDropdownInstryName}
                                       renderRow={(rowData, rowID, highlighted) => this.renderRowInstryModalDropdown(rowData, rowID, highlighted)}
                                       itemUnderlayColorDropdown={""}
                                       itemActiveOpacity={0.5}
                        />
                    </View>
                    <View style={{flex:1}}/>
                    <TouchableOpacity onPress={()=>{
                        Navigation.navigateForParams(this.props.navigation,"NewDealSearch",{entrance:'高管交易榜-最新交易'})
                        sensorsDataClickObject.sendSearchRequest.entrance = '高管交易榜-最新交易'
                        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.searchClick,{entrance:'高管交易榜-最新交易'})
                        }} style={styles.searchOut}>
                        <Image style={{width:12,height:12,resizeMode:"contain"}} source={require('../../../images/hits/search.png')}/>
                        <Text style={styles.grayText}>输入代码,名称或简称</Text>
                    </TouchableOpacity>
                </View>

                    <ModalDropdown ref='dropDown'
                                   defaultValue={this.optionDropdown[0]}
                                   defaultIndex={0}
                                   onSelect={(idx, value) => this._onDropDownMenu(idx, value)}
                                   style={styles.selectView}
                                   textStyle={{textAlign:'center', fontSize:15, color:"gray"}}
                                   buttonStyle={{height:20,borderRadius:2,backgroundColor:"#fff",
                                       justifyContent:'center', alignItems:'center'}}
                                   dropdownStyle={{height:this.heightDropdown, width: this.widthDropdown,justifyContent:'center',
                                       alignItems:'center',marginTop:Platform.OS==='ios'?ScreenUtil.scaleSizeW(35):ScreenUtil.scaleSizeW(20),marginRight:5}}
                                   options={this.optionDropdown}
                                   renderRow={(rowData, rowID, highlighted) => this.renderRow4ModalDropdown(rowData, rowID, highlighted)}
                                   itemUnderlayColorDropdown={""}
                                   itemActiveOpacity={0.5}
                    />

                </View>
            </View>
        );
    };
//            chart.on('mouseover', (params) => {
//               if(params.componentType === 'series') {
//                 window.postMessage(JSON.stringify({
//                   type: 'select',
//                   payload: {
//                     index: params.dataIndex,
//                   },
//                 }));
//               }
//             });
    /**
     * 折线图选择市场回调
     * */
    _onDropDownMenu(idx,value){
        if(value!==this.dropDownName){
            this.dropDownName = value;
            this.getLinesDatas();
        }
    }
    /**
     * 行业选择回调
     * this.dropInstryName = "全部";
     this.dropInstryCode = "ALL";
     * */
    _onDropDownInstry(idx,value){
        if(value!==this.dropInstryName){
            this.dropInstryName = value;

            this.dropInstryCode = this.state.optionDropdownInstryCode[idx]!=="ALL" ? this.state.optionDropdownInstryCode[idx]:"";
            //请求数据
            this.pageNo=1;
            this.getNewSaleListData();
        }
    }

    //新增下拉控件方法
    renderRow4ModalDropdown(rowData, rowID, highlighted) {
        let last = parseInt(rowID) === this.optionDropdown.length - 1;
        return (
            <View
                style={{
                    backgroundColor: highlighted
                        ? 'rgba(0, 0, 0, 0.6)'
                        : 'rgba(0, 0, 0, 0.6)',
                    paddingLeft: 5,
                    paddingRight: 5
                }}
            >
                <View style={{ height: this.lineHeightSpaceDropdown,}} />
                <View style={{
                    justifyContent:'center',
                    alignItems:'center',
                    height:this.lineHeightDropdown,
                    paddingVertical:ScreenUtil.scaleSizeW(12),
                    paddingHorizontal:ScreenUtil.scaleSizeW(8)
                }}>
                    <Text
                        style={{
                            color: "#fff",
                            fontSize: ScreenUtil.setSpText(20)
                        }}
                    >
                        {rowData}
                    </Text>
                </View>

                {last ? null : (
                    <View
                        style={{
                            //height: this.underlineHeightDropdown,
                            backgroundColor: '#999999'
                        }}
                    />
                )}
            </View>
        );
    }
    //绘制行业选择
    renderRowInstryModalDropdown(rowData, rowID, highlighted) {
        let last = parseInt(rowID) === this.state.optionDropdownInstryName.length - 1;


        return (
            <View
                style={{
                    backgroundColor: highlighted
                        ? 'rgba(0, 0, 0, 0.6)'
                        : 'rgba(0, 0, 0, 0.6)',
                    paddingLeft: 5,
                    paddingRight: 5
                }}
            >
                <View style={{ height: this.lineHeightSpaceDropdown,}} />
                <View style={{
                    justifyContent:'center',
                    alignItems:'center',
                    height:this.lineHeightDropdown,
                    width:80,
                    paddingVertical:ScreenUtil.scaleSizeW(12),
                    paddingHorizontal:ScreenUtil.scaleSizeW(8)
                }}>
                    <Text
                        style={{
                            color: "#fff",
                            fontSize: ScreenUtil.setSpText(20)
                        }}
                    >
                        {rowData}
                    </Text>
                </View>

                {last ? null : (
                    <View
                        style={{
                            //height: this.underlineHeightDropdown,
                            backgroundColor: '#999999'
                        }}
                    />
                )}
            </View>
        );
    }

    /**
     * SectionTitle
     * */
    _renderSection = (section: number) => {
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row" }}>
                {this.state.titles.map((title, index) =>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.sortViewPress(index,title.conCode)}} style={styles.headerText} key={index}>
                        <Text style={styles.hinnerText} >
                            {title.conName}
                        </Text>
                        {this.getSortView(title.conCode) }
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    /**
     * 顶部view的点击事件
     * 交易日期排序
     * */
    sortViewPress(index,conCode){
        if(this.state.titles[index].conCode!==-1){
            if(conCode===0){
                this.state.titles[index].conCode= 1;
            }else if(conCode===1){
                this.state.titles[index].conCode= 2;
            }else if(conCode===2){
                this.state.titles[index].conCode= 1;
            }
            this._list && this._list.scrollTo({ x: 0, y: 0}, true).then(()=>{
                this.setState({
                    titles:this.state.titles,
                },()=>{
                    this.pageNo = 1;
                    this.getNewSaleListData();
                });
            })
        }
    }
    /**
     * 获取标题
     * 后面排序的View
     * -1没有排序，0默认状态，1为降序，2为升序
     * */
    getSortView(conCode){
        let sortView ;
        switch (conCode){
            case -1:
                sortView = null;
                break;
            case 0:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/defaultt.png')}/>;
                break;
            case 1:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/positive.png')}/>;
                break;
            case 2:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/negative.png')}/>;
                break;
            default:
                sortView = null;
                break;
        }
        return sortView;
    }

    /**
     * 加载每一条
     *
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        //console.log(item)
        if(item===undefined ){
            return <View><View></View></View>;
        }
        let monColor ;
        if(item.tradeAmt!==''){
            if(item.tradeAmt>0){
                monColor ="#fa5033"
            }else if(item.tradeAmt===0){
                monColor ="rgba(0,0,0,0.4)"
            }else {
                monColor ="#5cac33"
            }
        }else {
            monColor ="rgba(0,0,0,0.4)"
        }
        return (
            <View  style={styles.row}>
                <TouchableOpacity activeOpacity={1} onPress={()=>{
                    let data ={};
                    data.Obj = item.secCode;
                    data.ZhongWenJianCheng = item.secName;
                    data.obj = item.secCode;
                    Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                        ...data,
                        array: [],
                        index: 0,
                    })
                }} style={{flexDirection:'row',justifyContent:"center",alignItems:"center",paddingTop:ScreenUtil.scaleSizeW(20),
                    height:ScreenUtil.scaleSizeW(100),marginBottom:ScreenUtil.scaleSizeW(10)}}>
                    <View style={{flex:1,paddingLeft:ScreenUtil.scaleSizeW(20)}}>
                        <View style={{width:ScreenUtil.scaleSizeW(125),height:ScreenUtil.scaleSizeW(91),borderRadius:ScreenUtil.scaleSizeW(10)
                            ,backgroundColor:"#f5faff",paddingLeft:ScreenUtil.scaleSizeW(10),justifyContent:"center"}}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(26),color:"#003366"}}>{item.chgDate && item.chgDate!=='--'?item.chgDate.substring(0,4):"--"}</Text>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:"#6282a3"}}>{item.chgDate && item.chgDate!=='--'?item.chgDate.substring(5,10):"--"}</Text>
                        </View>
                    </View>
                    <View style={styles.titleText}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(30),color:"#242424"}} numberOfLines={1} >{item.secName}</Text>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"#909090"}}>{item.secCode}</Text>
                    </View>
                    <View style={styles.titleText}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.changer}</Text>
                    </View>
                    <View style={styles.titleText}>
                        <View style={{width:ScreenUtil.scaleSizeW(80),height:ScreenUtil.scaleSizeW(80),borderRadius:ScreenUtil.scaleSizeW(40)
                        ,backgroundColor:item.chgType==='买入'?"#fa5033":"#5cac33",justifyContent:"center",alignItems:"center"}}>
                        <Text style={{fontSize:ScreenUtil.scaleSizeW(28),color:"white"}} numberOfLines={1} >{item.chgType}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                    <ScrollView horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{paddingLeft:ScreenUtil.scaleSizeW(20),paddingRight:ScreenUtil.scaleSizeW(20)}}
                                style={{width:ScreenUtil.screenW,flex:1,paddingTop:ScreenUtil.scaleSizeW(2),marginBottom:ScreenUtil.scaleSizeW(10)}}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{
                            let data ={};
                            data.Obj = item.secCode;
                            data.ZhongWenJianCheng = item.secName;
                            data.obj = item.secCode;
                            Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                                ...data,
                                array: [],
                                index: 0,
                            })
                        }}  style={{flex:1,flexDirection:"row"}}>
                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2}  unit={'万/亿'}  style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}}>{item.transPrice}</StockFormatText>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>成交价</Text>
                        </View>
                            <View style={styles.scrollItem}>
                                <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}}>{item.chgSharesNum}</StockFormatText>
                                <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>变动数量</Text>
                            </View>

                        <View style={styles.scrollItem}>
                            <StockFormatText precision={2} unit={'万/亿'} useDefault={true} style={{fontSize:ScreenUtil.scaleSizeW(32),color:monColor}}>{item.tradeAmt}</StockFormatText>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>成交金额</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.manageName}</Text>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>董监高姓名</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.duty}</Text>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>职务</Text>
                        </View>
                        <View style={styles.scrollItem}>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(32),color:"rgba(0,0,0,0.8)"}} numberOfLines={1} >{item.relation}</Text>
                            <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"rgba(0,0,0,0.6)"}}>与变动人关系</Text>
                        </View>
                        </TouchableOpacity>
                    </ScrollView>
            </View>
        );
    };

    /**
     * 脚布局
     * */
    _renderMyFooters=()=>{
        if((this.state.data && this.state.data[0].items.length === 0 )|| this.state.allLoaded === false){
            return <View><View></View></View>;
        }else {
            return(
                <View>
                    <RiskTipsFooterView type={1}/>
                </View>
            )
        }
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

}

const styles = StyleSheet.create({
    container: {
        flex:1
    },
    textTitle: {
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(20),
        width:ScreenUtil.scaleSizeW(180)
    },
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft:ScreenUtil.scaleSizeW(30),
    },
    row: {
        flex: 1,
        width:ScreenUtil.screenW,
        borderWidth: 0.5,
        borderColor: "#f1f1f1"
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection:"row",
        paddingLeft:ScreenUtil.scaleSizeW(20)
    },
    hinnerText:{
        fontSize:ScreenUtil.setSpText(24),
        color:"#626567"
    },
    contentText:{
        fontSize:ScreenUtil.setSpText(28),
        color:"#333333",
    },
    sortView:{
        width:ScreenUtil.scaleSizeW(12),
        height:ScreenUtil.scaleSizeW(24),
        resizeMode:"contain",
        marginLeft:ScreenUtil.scaleSizeW(6)
    },
    titleText: {
        flex: 1,
        justifyContent: "center",
        height:ScreenUtil.scaleSizeW(110),
        paddingLeft:ScreenUtil.scaleSizeW(20),
    },

    intervalLine:{
        width:ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(20),
        backgroundColor:"#f1f1f1"
    },
    slectMarket:{

    },
    chart: {
        width:ScreenUtil.screenW,
        height: ScreenUtil.scaleSizeW(350),
    },
    searchItem:{
        width:ScreenUtil.screenW,
        height:ScreenUtil.scaleSizeW(80),
        backgroundColor:"white",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center"
    },
    searchItemText:{
        fontSize:12,
        color:"#9d9d9d",
        marginLeft:ScreenUtil.scaleSizeW(30)
    },
    searchSView:{
        backgroundColor:"white",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        marginLeft:ScreenUtil.scaleSizeW(50)
    },
    searchOut:{
        backgroundColor:"white",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        paddingHorizontal:ScreenUtil.scaleSizeW(15),
        paddingVertical:ScreenUtil.scaleSizeW(4),
        borderRadius:3,
        borderWidth:1,
        borderColor:"#d3d3d3",
        marginRight:ScreenUtil.scaleSizeW(30)
    },
    grayText:{
        fontSize:ScreenUtil.setSpText(24),color:"#9d9d9d"
    },
    selectView:{
        position:"absolute",
        top:ScreenUtil.scaleSizeW(30),
        right:ScreenUtil.scaleSizeW(26),
        backgroundColor:"white",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row"
    },

    scrollItem:{
        flex:1,
        backgroundColor:"#fbfdff",
        paddingLeft:ScreenUtil.scaleSizeW(20),
        justifyContent:"center",
        paddingRight:ScreenUtil.scaleSizeW(40),
        borderRadius:ScreenUtil.scaleSizeW(10),
        marginRight:ScreenUtil.scaleSizeW(10),
        borderWidth:1,
        borderColor:"#f6f6f6"
    }
});
