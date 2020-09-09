/**
 * Created by cuiwenjuan on 2019/8/9.
 */
import React, { PureComponent } from 'react';
import { sensorsDataClickActionName, sensorsDataClickObject } from "../../components/SensorsDataTool";

import {
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageBackground,
    Platform,
    NativeModules,
    StatusBar
} from 'react-native';

var { height, width } = Dimensions.get('window');
import { toast } from '../../utils/CommonUtils'
import * as  baseStyle from '../../components/baseStyle'
import UserInfoUtil from '../../utils/UserInfoUtil'
import ShareSetting from '../../modules/ShareSetting'
import * as BuriedpointUtils from "../../utils/BuriedpointUtils";
import AsyncStorage from '@react-native-community/async-storage';

let tourTanKuang = 'tourTanKuang';
let userTanKuang = 'userTanKuang';

// 刷新状态枚举
export const alrtType = {
    tourView: 0,
    kaiPingView: 1,
    tanKuangView: 2,
};
//只是Android 使用
import FastImage from 'react-native-fast-image'

class MarketingAlert extends PureComponent {

    static defaultProps = {
        showMenu: alrtType.tourView
    };

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            notchHeight_android: 0,
            showMenu: this.props.showMenu,
            seconds: 3,
        }
        this._index = 3;
        this.kaiPingMessage = UserInfoUtil.getUserInfoReducer().kaiPingMessage;
        this.tanKuangMessage = UserInfoUtil.getUserInfoReducer().tanKuangMessage;
        this.permissions = UserInfoUtil.getUserPermissions();


        //Android适配先注释
        if (Platform.OS == 'android') {
            NativeModules.GETNOTCHSIZE.getNotchSize((size) => {
                this.setState({ notchHeight_android: size })
            });
        }
    }

    componentDidMount() {

        if (this.permissions <= 0) {
            AsyncStorage.getItem(tourTanKuang, (error, result) => {
                if (result) {
                    if (ShareSetting.isToday(result)) {
                        return;
                    }
                }
                //每天显示一次
                this.setState({
                    isShow: true,
                    showMenu: alrtType.tourView,
                })
            });

        } else {
            this.setState({
                isShow: true,
                showMenu: alrtType.kaiPingView,
            }, () => {
                this._createTimer();
            })
        }
    }


    //开屏广告倒计时
    _createTimer() {
        this._timer = setInterval(() => {
            if (this.state.seconds <= 0) {
                this._skip();
            } else {
                this.setState({ seconds: this._index-- });
            }
        }, 1000);
    }


    _tourView() {
        return (

            <View style={Styles.bgViewStyle}>

                <ImageBackground style={Styles.imageBackStyle}
                    source={require('../../images/Marketing/market_background.png')}>

                    <TouchableOpacity style={{ marginTop: 263 }}
                        onPress={() => { this._login() }}>
                        <Image
                            style={{ width: width - 50, height: 52 }}
                            resizeMode={'stretch'}
                            source={require('../../images/Marketing/market_login.png')} />
                    </TouchableOpacity>
                </ImageBackground>

                <TouchableOpacity onPress={() => { this._tanKuangHidden(tourTanKuang) }}>
                    <Image
                        style={{ marginTop: 20 }}
                        source={require('../../images/Marketing/market_close.png')} />
                </TouchableOpacity>

            </View>
        )
    }
    // <ImageBackground style={{ width: width, height: height, flexDirection: 'row' }}
    //                         source={{ uri: kaiPingURL }}>
    //
    //                         <View style={{ flex: 1 }}>
    //
    //                         </View>
    //
    //
    //
    //                     </ImageBackground>
    _kaiPingView() {
        //console.log('营销页 ==== ', this.kaiPingMessage)
        if (!this.kaiPingMessage) {
            this._skip();
            return null;
        }

        if (!this.kaiPingMessage.image) {
            this._skip();
            return null;
        }

        let kaiPingURL = this.kaiPingMessage.image;
        // kaiPingURL = 'https://ydgp.zslxt.com/image/1556175966361.jpg'

        let statusBarHeight = 20;
        if (Platform.OS === 'ios' && baseStyle.isIPhoneX) {
            statusBarHeight = 44;
        } else {
            if (Platform.OS === 'ios') {
                statusBarHeight = 25;
            } else {
                statusBarHeight = 5 + StatusBar.currentHeight
            }

        }

        return (

            <View style={[Styles.bgViewStyle, { backgroundColor: baseStyle.BLACK_666666 }]}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{ width: width, height: height, flexDirection: 'row', flex: 1 }}
                    onPress={() => { this._kaiping(this.kaiPingMessage) }}>

                    {Platform.OS === 'ios' ?
                        <Image
                            style={{ flex: 1, width: width, height: height, position: "absolute", top: 0, left: 0, resizeMode: "stretch" }}
                            source={{ uri: kaiPingURL }}
                        />
                        :
                        <FastImage
                            style={{ flex: 1, width: width, height: height, position: "absolute", top: 0, left: 0 }}
                            source={{ uri: kaiPingURL }}
                            resizeMode={FastImage.resizeMode.stretch}

                        />
                    }
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                        style={{
                            marginTop: statusBarHeight,
                            marginRight: 15,
                            height: 30,
                            width: 78,
                            backgroundColor: baseStyle.BLACK_000000_60,
                            borderRadius: 5,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => { this._skip() }}
                    >

                        <Text style={{
                            color: baseStyle.WHITE,
                            fontSize: 15
                        }}>{this.state.seconds + ' 跳过'}</Text>
                    </TouchableOpacity>


                </TouchableOpacity>

            </View>
        )
    }


    _tanKuanView() {

        if (!this.tanKuangMessage) {
            this._hiddenAlert();
            return null;
        }

        if (this.tanKuangMessage.length <= 0) {
            this._hiddenAlert();
            return null;
        }

        let perm = this.permissions;
        if (perm <= 1) {
            perm = 2;
        }

        let tankuangM = this.tanKuangMessage[perm];
        let kaiPingURL = tankuangM.image;

        // kaiPingURL = 'https://ydgp.zslxt.com/image/1556175966361.jpg'

        return (
            <View style={Styles.bgViewStyle}>

                <TouchableOpacity
                    style={Styles.imageBackStyle}
                    onPress={() => { this._tanKuang(tankuangM) }}
                >
                    <Image style={Styles.imageBackStyle}
                        source={{ uri: kaiPingURL }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { this._tanKuangHidden(userTanKuang) }}>
                    <Image
                        style={{ marginTop: 20 }}
                        source={require('../../images/Marketing/market_close.png')} />
                </TouchableOpacity>

            </View>
        )
    }

    render() {
        // console.log('营销 == render = ',this.state.isShow);

        if (!this.state.isShow) {
            return null;
        }

        return (
            this.state.showMenu === 0 ? this._tourView() :
                this.state.showMenu === 1 ? this._kaiPingView() :
                    this.state.showMenu === 2 ? this._tanKuanView() : null
        );

        //modal 无论跳转到哪个页面，这个view都是在最上层
        // return (
        //     <Modal
        //         animationType={"fade"}
        //         transparent={true}
        //         visible={this.state.modalVisible}
        //         onRequestClose={() => {
        //         }}
        //     >
        //         {
        //             this.state.showMenu === 0 && this._tourView()
        //         }
        //         {
        //             this.state.showMenu === 1 && this._kaiPingView()
        //         }
        //         {
        //             this.state.showMenu === 2 && this._tanKuanView()
        //         }
        //
        //     </Modal>
        //
        // );
    };


    _isShowUserTanKuang() {
        AsyncStorage.getItem(userTanKuang, (error, result) => {
            if (result) {
                if (ShareSetting.isToday(result)) {
                    this._hiddenAlert();
                    return;
                }
            }
            //这个页面每天只会进来一次，点击弹窗会自动消失，记录一次即可
            // BuriedpointUtils.setTuoKeItemByName(BuriedpointUtils.PageMatchID.shouyetanchuang);
            //每天显示一次
            this.setState({
                showMenu: alrtType.tanKuangView,
            })
        });
    }


    //弹框
    _tanKuang(name) {

        sensorsDataClickObject.adClick.ad_position = '首页弹框';
        sensorsDataClickObject.adClick.ad_title = name.name;
        sensorsDataClickObject.adClick.ad_type = '弹窗';
        sensorsDataClickObject.adClick.page_source = '首页';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adClick);

        //只要点击弹窗就记录一次点击
        //BuriedpointUtils.setTuoKeClickItemByName(BuriedpointUtils.PageMatchID.shouyetanchuangdianji);
        if (name.link.indexOf('tk/share_app') != -1) {
            Navigation.pushForParams(this.props.navigation, 'DuoTouQiDongPage');
            this._tanKuangHidden(userTanKuang);
        } else {
            Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage', {
                name: name.name,
                url: name.link,
                showButton: name.ktqx,
                callBack: () => {
                    this._tanKuangHidden(userTanKuang);
                }
            })
        }
    }

    //游客
    _login() {
        // console.log('营销页 游客弹出进入登录页')
        sensorsDataClickObject.loginButtonClick.entrance = '营销页 游客弹出进入登录页'
        Navigation.pushForParams(this.props.navigation, 'LoginPage', {
            callBack: () => {
                this._tanKuangHidden(tourTanKuang);
            }
        })
    }

    //隐藏弹框
    _tanKuangHidden(asyncString) {
        //只要点击弹窗就记录一次点击
        //BuriedpointUtils.setTuoKeClickItemByName(BuriedpointUtils.PageMatchID.houyetanchuangclose);

        //存储是否是今天时间戳
        var timestamp = Date.parse(new Date());
        AsyncStorage.setItem(asyncString, JSON.stringify(timestamp), (error, result) => {
            if (!error) {
            }
        });
        this._hiddenAlert();
    }


    //3秒跳过
    _skip() {
        //是否显示用户营销弹框
        this._isShowUserTanKuang();
    }

    _kaiping(name) {

        sensorsDataClickObject.adClick.ad_position = '开屏广告';
        sensorsDataClickObject.adClick.ad_title = name;
        sensorsDataClickObject.adClick.ad_type = '启动页';
        sensorsDataClickObject.adClick.page_source = '开屏页';
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.adClick);


        Navigation.pushForParams(this.props.navigation, 'MarketingDetailPage', {
            name: name.name,
            url: name.link,
            showButton: name.ktqx,
            callBack: () => {
                //是否显示用户营销弹框
                this._isShowUserTanKuang();
            }
        })
    }


    _hiddenAlert() {
        this.setState({ isShow: false }, () => {
            this._timer && clearInterval(this._timer);
        });
    };
    showAlert() {
        this.setState({ isShow: true });
    };
}


const Styles = StyleSheet.create({
    bgViewStyle: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        position: 'absolute',
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageBackStyle: {
        width: width - 20,
        height: 350,
        alignItems: 'center'
    }
})

export default MarketingAlert;
