/**
 * Created by cuiwenjuan on 2018/8/8.
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
    BackHandler,
    Platform
} from 'react-native';
import {commonUtil,isLandscape} from '../../utils/CommonUtils'
import RATE, {LINE_HEIGHT, LINE_SPACE} from '../../utils/fontRate.js';
import PageHeader from '../../components/PageHeader'
import PageHeaderLandscape from '../../components/PageHeaderLandscape'
import SafeAreaView from '../../components/SafeAreaView';
import settingKMessage from '../../images/jsonMessage/settingKMessage.json'
import * as baseStyle from "../../components/baseStyle";

export default class KLineMessagePage extends Component{

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            //拦截手机自带返回键
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    _renderItem(item){
        let title = item.item.title;
        let desc = item.item.desc;

        let itemView = () => (
            <View >
                <Text style={{
                    fontSize:RATE(30),
                    color:baseStyle.BLACK_333333,
                    fontWeight: "500",
                    marginTop:commonUtil.rare(22),
                    marginBottom:commonUtil.rare(10)
                }}>
                    {title}
                </Text>
                <Text style={{
                    fontSize:RATE(30),
                    color:baseStyle.BLACK_333333,
                    lineHeight:LINE_HEIGHT(30),
                    marginBottom:commonUtil.rare(26)
                }}
                >{desc}</Text>
            </View>

        )

        return(
            <View style={{
                paddingLeft:commonUtil.rare(29),
                paddingRight:commonUtil.rare(29),}}>
                {itemView()}
            </View>
        )
    }


    _onBack(){
        Navigation.pop(this.props.navigation);
    }
    render() {

        let _key = this.props.navigation.state.params.title
        let message = settingKMessage.kMessage;
        let stockIndex = message[_key];
        let title = stockIndex.title;
        let messageArray = stockIndex.message;


        let headerTitle = '指标说明';

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
                            onBack={() => this._onBack()}
                            title={headerTitle}/>
                        :
                        <PageHeader
                            onBack={() => {
                                Navigation.pop(this.props.navigation);}}
                            title={headerTitle}/>
                }


                <View style={{
                    marginLeft:commonUtil.rare(29),
                    marginRight:commonUtil.rare(29),
                    borderBottomWidth:1,
                    borderBottomColor:baseStyle.LINE_BG_F1,
                    justifyContent:'center',
                    height:commonUtil.rare(90)
                }}>
                    <Text style={{
                        fontSize:RATE(30),
                        color:baseStyle.BLUE_HIGH_LIGHT,
                        fontWeight: "500",
                    }}>
                        {title}
                    </Text>

                </View>

                <FlatList
                    style={{flex:1}}
                    bounces ={false}
                    showsVerticalScrollIndicator={false}
                    data={messageArray}
                    renderItem={(item) => this._renderItem(item)}
                />
            </View>
        </SafeAreaView>
    }

    onBackAndroid= () =>{
        this._onBack();
        return true;
    }

}