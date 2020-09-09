/**
 * Created by cuiwenjuan on 2017/8/15.
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    ScrollView,
    Dimensions,
    NativeModules,
    ImageBackground
} from 'react-native';

var { width } = Dimensions.get('window');
import Swiper from 'react-native-swiper';
import LoginPage from '../login/LoginPage'
import AppMain from '../AppMain'
import UserInfoUtil from '../../utils/UserInfoUtil'
import { commonUtil } from '../../utils/CommonUtils'
import * as  baseStyle from '../../components/baseStyle'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
import * as ScreenUtil from '../../utils/ScreenUtil';
import AsyncStorage from '@react-native-community/async-storage';
// import SplashScreen from 'react-native-splash-screen'

import { resetTo, pushForParams } from "../../components/NavigationInterface"

// import Orientation from "react-native-orientation";


let bannerGYD = [
    { image: require('../../images/userCenter/cy_guide_image1.png'), title: '判大势', text: '捕捉短线情绪周期，乘势大盘找对时机' },
    { image: require('../../images/userCenter/cy_guide_image2.png'), title: '牛观点', text: '盘中实时解盘，个股机会点睛' },
    { image: require('../../images/userCenter/cy_guide_image3.png'), title: '看打榜', text: '龙虎榜，资金榜，揭秘游资机构博弈' },
    { image: require('../../images/userCenter/cy_guide_image4.png'), title: '慧选股', text: '全方位，多因子价值好股选出来' },
]

let imageBG = require('../../images/userCenter/cy_guide_BG.png');

//+StatusBar.currentHeight
let height = Platform.OS === 'android' ? Dimensions.get('window').height : Dimensions.get('window').height;

//只是Android 使用
import FastImage from 'react-native-fast-image'

export default class GuidePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showPagination: true,
        };


    }

    componentDidMount() {
    }


    loginCY() {
        AsyncStorage.setItem('isFirstV', UserInfoUtil.getVersion());

        resetTo(this.props.navigation, 'AppMain');
        // AsyncStorage.getItem('isUserAgree',(error, result) => {
        //     if (result != "1.0") {
        //         resetTo(this.props.navigation,'UserAgree')
        //     } else {
        //         resetTo(this.props.navigation,'AppMain')
        //     }
        // })

        // this.props.navigator.resetTo({
        //     component: LoginPage,
        //     name: 'LoginPage'
        // })
    }

    //  <Image style={{width:width - ScreenUtil.scaleSizeW(80),height:(width - ScreenUtil.scaleSizeW(80))*1.5,
    //                         }}
    //                                source={info.image}
    //                                resizeMode={'stretch'}
    //                         />
    imageViewGYD(info, indexP) {

        return (
            <View
                key={indexP}
                style={{ flex: 1, width: width, height: height, alignItems: "center", }}
            //source={imageBG}
            // resizeMode={'stretch'}
            >

                <View style={{
                    //marginTop:ScreenUtil.scaleSizeW(120),
                    justifyContent: 'center',
                    alignItems: 'center',
                    // flexDirection: 'row',
                    // backgroundColor:'#fff'
                }}>
                    <View style={{ flex: 1, justifyContent: 'center', width: width, alignItems: 'center', }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(82) }}>{info.title}</Text>
                        <Text style={{ fontSize: ScreenUtil.setSpText(40), marginTop: ScreenUtil.scaleSizeW(34) }}>{info.text}</Text>
                    </View>


                    {Platform.OS === 'ios' ?
                        <Image
                            style={{ width: width - ScreenUtil.scaleSizeW(80), height: (width - ScreenUtil.scaleSizeW(80)) * 1.5, resizeMode: "stretch" }}
                            source={info.image}
                        />
                        :
                        <FastImage
                            style={{ width: width - ScreenUtil.scaleSizeW(80), height: (width - ScreenUtil.scaleSizeW(80)) * 1.5, }}
                            source={info.image}
                            resizeMode={FastImage.resizeMode.stretch}
                        />
                    }

                </View>


                {
                    indexP < bannerGYD.length - 1 ? null :
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{
                                position: 'absolute',
                                bottom: ScreenUtil.scaleSizeW(40),
                                // top:0,
                                left: ScreenUtil.scaleSizeW(30),
                                //right:24,
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: ScreenUtil.scaleSizeW(105),
                                width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60),
                                // borderColor: baseStyle.BLUE_HIGH_LIGHT,
                                // backgroundColor:"#ff00ff",
                                // borderRadius:5,
                            }}
                            onPress={() => this.loginCY()}>
                            <Image style={{ height: ScreenUtil.scaleSizeW(105), width: ScreenUtil.screenW - ScreenUtil.scaleSizeW(60), resizeMode: "stretch" }} source={require('../../images/login/guide_start.png')} />

                        </TouchableOpacity>
                }
            </View>
        )
    }
    render() {

        let gydViews = bannerGYD.map(
            (info, index) => (
                this.imageViewGYD(info, index)
            )
        );

        //
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', height: height }}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor='transparent' />
                <Image
                    //key = {indexP}
                    style={{ flex: 1, width: width, height: height, alignItems: 'center', position: 'absolute', left: 0, top: 0 }}
                    source={imageBG}
                    resizeMode={'stretch'}
                />
                <View style={{ flex: 1, backgroundColor: 'transparent', width: width, height: height }}>
                    <Swiper loop={false}
                        // height={200}

                        //设置下面点点是否隐藏
                        onIndexChanged={(index) => {
                            // if(index === bannerGYD.length - 1 ){
                            //  this.setState({showPagination:false})
                            // }else {
                            //     this.setState({showPagination:true})
                            // }
                        }}
                        //showsButtons={true}
                        showsPagination={this.state.showPagination}
                        paginationStyle={{ bottom: (width - ScreenUtil.scaleSizeW(92)) * 1.5 }}
                        dotStyle={{ backgroundColor: '#8b9496', marginLeft: ScreenUtil.scaleSizeW(18), marginRight: ScreenUtil.scaleSizeW(18), width: ScreenUtil.scaleSizeW(16), height: ScreenUtil.scaleSizeW(16), borderRadius: ScreenUtil.scaleSizeW(8) }}
                        activeDotStyle={{ backgroundColor: '#ffffff', marginLeft: ScreenUtil.scaleSizeW(18), marginRight: ScreenUtil.scaleSizeW(18), borderWidth: 1, borderColor: "#8b9496", width: ScreenUtil.scaleSizeW(16), borderRadius: ScreenUtil.scaleSizeW(8), height: ScreenUtil.scaleSizeW(16) }}>
                        {gydViews}
                    </Swiper>
                </View>
            </View>
        )

    }
}
