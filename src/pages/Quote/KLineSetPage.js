/**
 * Created by cuiwenjuan on 2018/8/7.
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    FlatList,
    DeviceEventEmitter,
    Platform,
    BackHandler
} from 'react-native';
import {commonUtil,isLandscape} from '../../utils/CommonUtils'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import PageHeader from '../../components/PageHeader'
import PageHeaderLandscape from '../../components/PageHeaderLandscape'
import SafeAreaView from '../../components/SafeAreaView';
import settingKMessage from '../../images/jsonMessage/settingKMessage.json'
import * as baseStyle from "../../components/baseStyle";
import ShareSetting from '../../modules/ShareSetting'

let cqString = ShareSetting.getEmpower()[0] //'除权';
let qfqString = ShareSetting.getEmpower()[1] //'前复权';
let hfqString = ShareSetting.getEmpower()[2] //'后复权';



/**
 * 1.landscapeP文件
 *
 * 通知
 * componentDidMount（）
 * this.listenerKLine = DeviceEventEmitter.addListener('KLineSetPage',(info)=>{
            let split = ShareSetting.getEmpowerIndexByName(info);
            if (Platform.OS === 'ios') {
                this.refs.kchart._onChangeEmpower(split);
            }else {
                this.refs.KLineInLandscapePage && this.getKLineInLandscapePageRef()._onChangeEmpower(info);
            }
        });

 *
 * componentWillUnmount() 移除
 * this.listenerKLine && this.listenerKLine.remove();
 *
 *
 *  navigation ios和Android是分开的
 *   <KChartSider
 navigation = {this.props.navigation}


 *
 *2. KChartSider文件  render() 方法中添加 设置按钮
 *<View style={{width:78,height:40, backgroundColor:'#d3ff9c'}}>
 <TouchableHighlight  hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
 onPress={() =>{
                                             alert('设置页面')
                                             Navigation.pushForParams(this.props.navigation, 'KLineSetPage')
                                         }}>
 <Image source={require('../images/userCneter/uc_set.png')}/>

 </TouchableHighlight>

 </View>


 *
 * 3.detailPage.android.js
 *
 *componentDidMount（）   componentWillUnmount() 移除
 * this.listenerKLine = DeviceEventEmitter.addListener('KLineSetPage',(info)=>{
            this.refs.KLineInDetailPage && this.getKLineInDetailPageRef()._onChangeEmpower(info);
        });

 */


export default class KLineSetPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            buttonIndex:cqString,
        }
    }

    componentDidMount() {
        let buttonIndex = ShareSetting.getCurrentEmpowerName()
        // alert(buttonIndex);

        if (Platform.OS === 'android') {
            //拦截手机自带返回键
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }

        this.setState({
            buttonIndex: buttonIndex
        })
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    _onPress(info){
        this.setState({buttonIndex:info})
        ShareSetting.selectFormula(info);
        //发送通知
        DeviceEventEmitter.emit('KLineSetPage',info);
    }


    _renderItem(item){
        let indexI = item.index;
        let _key = item.item._key;
        let title = item.item.title;

        let firstView = ()=>(
            <View style={[styles.itemVStyle,
                {
                    height:commonUtil.rare(90),
                }]}>
                <Text>{'复权类型'}</Text>
                <View style={{flex:1}}/>
                {
                    this.props.navigation.state.params.curGraphIndex === 1 &&
                    <View
                        overflow={'hidden'}
                        style={{
                            borderRadius:commonUtil.rare(6),
                            borderWidth:1,
                            borderColor:baseStyle.BLUE_HIGH_LIGHT,
                            flexDirection:'row',
                            alignItems:'center',
                            height:commonUtil.rare(54),
                            width:commonUtil.rare(300)
                        }}>
                        <TouchableOpacity
                            style={[styles.fqButtonS,
                                {backgroundColor:this.state.buttonIndex === cqString ? '#FED9D1' : null,},
                                Platform.OS === 'ios' ?
                                    null
                                    :{borderTopLeftRadius:commonUtil.rare(6),
                                    borderBottomLeftRadius:commonUtil.rare(6),}
                            ]}
                            onPress={() =>this._onPress(cqString)}>
                            <Text style={styles.fqTextS}>除权</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.fqButtonS,
                                {backgroundColor:this.state.buttonIndex === qfqString ? '#FED9D1' : null,
                                    borderRightWidth:1,
                                    borderRightColor:baseStyle.BLUE_HIGH_LIGHT,
                                    borderLeftWidth:1,
                                    borderLeftColor:baseStyle.BLUE_HIGH_LIGHT,
                                }]}
                            onPress={() =>this._onPress(qfqString)}>

                            <Text style={styles.fqTextS}>前复权</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.fqButtonS,
                                {backgroundColor:this.state.buttonIndex === hfqString ? '#FED9D1' : null,},
                                Platform.OS === 'ios' ?
                                    null
                                    :{borderTopRightRadius:commonUtil.rare(6),
                                    borderBottomRightRadius:commonUtil.rare(6),}
                            ]}
                            onPress={() =>this._onPress(hfqString)}>
                            <Text style={styles.fqTextS}>后复权</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        );


        let secondView = () => (
            <View style={[styles.itemVStyle,
                {
                    height:commonUtil.rare(59),
                }]}>
                <Text style={{
                    fontSize:RATE(24),
                    color:baseStyle.BLACK_666666,
                }}>{'指标说明：'}</Text>
            </View>
        );

        let itemView = () => (
            <View style={[styles.itemVStyle,
                {
                    height:commonUtil.rare(79),
                }]}>
                <Text
                    style={{
                        fontSize:RATE(30),
                        color:baseStyle.BLACK_333333,
                    }}
                >{title}</Text>
                <View style={{flex:1}}/>
                <TouchableOpacity
                    hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
                    onPress={() =>{
                        Navigation.pushForParams(this.props.navigation,'KLineMessagePage',{title:_key})
                    }}>
                    <Image source={require('../../images/hq_kSet_mark.png')}/>
                </TouchableOpacity>
            </View>

        )

        return(
            <View style={{
                paddingLeft:commonUtil.rare(29),
                paddingRight:commonUtil.rare(29),}}>
                {indexI > 1 ? itemView() : indexI > 0 ? secondView() : firstView()}
            </View>
        )
    }

    _onBack(){
        Navigation.pop(this.props.navigation);
    }

    render() {

        let message = settingKMessage.kMessage;

        let messageArray = [{},{}];
        for (var keyS in message)
        {
            let value = message[keyS];
            messageArray.push({_key:keyS,title:value.title})
        }

        let title = 'K线设置';

        let isLan = isLandscape();
        let lanStyle = {};
        if(isLan){
            lanStyle = {
                paddingRight: baseStyle.isIPhoneX ? 24 : 0,
                paddingLeft: baseStyle.isIPhoneX ? 24 : 0}
        }

        return<SafeAreaView style={{flex: 1, backgroundColor: commonUtil.black_F6F6F6}}>
            <View style={[{backgroundColor:'#fff',flex:1},lanStyle]}>
                {
                    isLan ?
                        <PageHeaderLandscape
                            onBack={() => this._onBack() }
                            title={title}/>
                        :
                        <PageHeader
                            onBack={() => this._onBack() }
                            title={title}/>
                }


                <FlatList
                    style={{flex:1}}
                    bounces ={false}
                    data={messageArray}
                    renderItem={(item) => this._renderItem(item)}
                />
            </View>
        </SafeAreaView>
    }

    onBackAndroid = () => {
        this._onBack();
        return true;
    };

}


var styles = StyleSheet.create({
    itemVStyle:{
        flexDirection:'row',
        borderBottomColor:baseStyle.LINE_BG_F1,
        borderBottomWidth:1,
        height:commonUtil.rare(79),
        alignItems:'center'
    },
    fqTextS:{
        fontSize:12,
        color:baseStyle.BLUE_HIGH_LIGHT
    },
    fqButtonS:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        height:commonUtil.rare(50),
    }
});
