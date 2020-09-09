/**
 * Created by cuiwenjuan on 2018/2/26.
 */
import React, { PureComponent } from "react";
import { Alert, Animated, Dimensions, Image, Platform, Text, TouchableOpacity, View } from "react-native";
import RootSiblings from 'react-native-root-siblings';
import TranslucentModal from 'react-native-translucent-modal';
import { AppDownloadURL } from '../actions/CYCommonUrl';
import { toast } from "../utils/CommonUtils";
import RATE, { DISTANCE } from "../utils/fontRate";
import ShareModel from "../utils/ShareModel";
import UserInfoUtil from "../utils/UserInfoUtil";
import * as baseStyle from "./baseStyle.js";
import { sensorsDataClickActionName, sensorsDataClickObject } from "./SensorsDataTool";

let { height, width } = Dimensions.get('window');
export const SharePlatform = {
    QQ: 0,
    SINA: 1,
    WECHAT: 2,
    WECHATMOMENT: 3,
    QQZONE: 4,
    FACEBOOK: 5
};

export const ShareType = {
    XiaZai: 'xiaZai',
    ZhiBo: 'zhiBo',
    LongHuKeTang: 'longHuKeTang',
    DuoTou: 'duoTouQiDong'
}

//let sibling = null;

//友盟预定义的平台
// UMSocialPlatformType_Predefine_Begin    = -1,
//     UMSocialPlatformType_Sina               = 0, //新浪
//     UMSocialPlatformType_WechatSession      = 1, //微信聊天
//     UMSocialPlatformType_WechatTimeLine     = 2,//微信朋友圈
//     UMSocialPlatformType_WechatFavorite     = 3,//微信收藏
//     UMSocialPlatformType_QQ                 = 4,//QQ聊天页面
//     UMSocialPlatformType_Qzone              = 5,//qq空间

let platName = ['wechat', 'wechatMoment', 'qq', 'qqZone', 'sina'];

let shareButtonMessage = {
    "wechat": { "image": require('../images/share/share_wx_session.png'), title: '微信好友', "indexS": SharePlatform.WECHAT },
    "wechatMoment": { "image": require('../images/share/share_wx_timeline.png'), title: '微信朋友圈', "indexS": SharePlatform.WECHATMOMENT },
    "qq": { "image": require('../images/share/share_qq.png'), title: 'QQ好友', "indexS": SharePlatform.QQ },
    "qqZone": { "image": require('../images/share/share_qzone.png'), title: 'QQ空间', "indexS": SharePlatform.QQZONE },
    "sina": { "image": require('../images/share/share_sina_weibo.png'), title: '新浪微博', "indexS": SharePlatform.SINA },
}


let shareMessage = {
    "xiaZai": { "title": "源达慧选股", "message": '慧选股，助您会选股', "urlS": AppDownloadURL },
    // "zhiBo": { "title": "财源直播间", "message": '实时盘面，追踪解读', "urlS": 'http://ydzbj.ydtg.com.cn/wap2' },
    // "longHuKeTang": { "title": "财源股票-龙虎课堂", "message": '寻龙寻妖，策略布局先人一步', "urlS": 'https://m.ydtg.com.cn/index.php?a=lists&typeid=21' }
}



class ShareView extends PureComponent {

    static defaultProps = {
        type: 'link',
        shareType: ShareType.XiaZai
    };

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            urls: [],
            platName: platName,
            shareType: this.props.shareType ? this.props.shareType : ShareType.XiaZai,
            shareMessage: this.props.shareMessage ? this.props.shareMessage : undefined,
            trans: new Animated.ValueXY(),
        }
    }

    componentDidMount() {

        if (Platform.OS === 'ios') {
            this._isInstallIos();
        }
        else {
            this._isInstallAndroid()
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.shareType == ShareType.DuoTou && nextProps.shareMessage) {
            this.setState({ shareMessage: nextProps.shareMessage });
        }
    }
    _isInstallAndroid() {
        ShareModel.getPackageName((isWeiXin, isQQ, isWeiBo) => {
            this._isInstall(isWeiXin, isQQ, isWeiBo);
        })
        //this._isInstall(true, true);
    }

    //判断
    _isInstallIos() {

        ShareModel.platformTypeArray((platformA) => {
            this._isInstall(platformA.isWeiXin, platformA.isQQ, platformA.isWeiBo)
        })
    }

    //
    _isInstall(isWX, isQQ, isWB) {
        let platNames = [];

        if (isWX) {
            platNames.push('wechat');
            platNames.push('wechatMoment');
        }

        if (isQQ) {
            platNames.push('qq');
            platNames.push('qqZone');
        }
        if (isWB) {
            platNames.push('sina');
        }

        //多头启动
        if (this.state.shareType === ShareType.DuoTou) {
            if (isWX) {
                platNames = ['wechat', 'wechatMoment'];
            } else {
                platNames = [];
            }
        }

        this.setState({ platName: platNames })
    }



    // todo 无内容id，无urls 无
    share(info) {        
        let indexS = shareButtonMessage[info].indexS;
        // let imgUrl = 'https://www.baidu.com/img/bd_logo1.png';
        let imgUrl = '';

        let shareM = shareMessage[this.state.shareType];
        if (this.state.shareMessage) {
            shareM = this.state.shareMessage;
        }

        let shareUrl = shareM.urlS;
        let title = shareM.title;
        let message = shareM.message;

        sensorsDataClickObject.shareMethod.content_show_type = '图片'        
        switch (indexS) {
            case 0:
                sensorsDataClickObject.shareMethod.share_method = 'QQ'
                break;
            case 1:
                sensorsDataClickObject.shareMethod.share_method = '新浪'
                break;
            case 2:
                sensorsDataClickObject.shareMethod.share_method = '微信'
                break;
            case 3:
                sensorsDataClickObject.shareMethod.share_method = '微信朋友圈'
                break;
            case 4:
                sensorsDataClickObject.shareMethod.share_method = 'QQ空间'
                break;
            case 5:
                sensorsDataClickObject.shareMethod.share_method = 'Facebook'
                break;            
            default:
                break;
        }                
        SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.shareMethod,undefined,false)
        // sdk,开始分享
        ShareModel.shareLink(
            title,
            message,
            shareUrl,
            imgUrl,
            indexS,
            (response) => {
                // toast(response);
                if (!(info === 'wechat' || info === 'wechatMoment')) {
                    if (response === '分享失败') {
                        Alert.alert(
                            '分享失败',
                            '系统错误，请稍后重试！',
                            [
                                {
                                    text: '确定'
                                },
                            ])

                    } else {
                        toast(response);
                    }
                }

                UserInfoUtil.ydgpShareNew(this.props.keyString, this.props.model, (response) => {

                }, (error) => {

                });

                if (this.state.shareType === ShareType.DuoTou)
                    UserInfoUtil.shareDuoTou(() => {},() => {})

            }
        );
    }

    _failAlert(info) {
        let failAlert = new RootSiblings(<View
            style={{
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <View style={{
                width: 300, height: 300, backgroundColor: '#fff', alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Text>分享失败</Text>
                <Text>系统错误，请稍后重试！</Text>

                <TouchableOpacity activeOpacity={1}
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end'
                    }}
                    onPress={() => {
                        failAlert && failAlert.destroy()
                    }}>
                    <Text>确定</Text>
                </TouchableOpacity>
            </View>
        </View>)
    }


    loading() {
        return (
            <TranslucentModal
                // animationType={"slide"}
                transparent={true}
                visible={this.props.animating}
                onRequestClose={() => {
                }}>
                <TouchableOpacity activeOpacity={1}
                    style={Platform.OS === 'ios' ?
                        {
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            justifyContent: 'flex-end'
                        } :
                        {
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            justifyContent: 'flex-end'
                        }}
                    onPress={() => {
                        this.hid();
                    }}>
                </TouchableOpacity>
                <View style={{
                    backgroundColor: '#fff',
                    justifyContent: 'flex-end',
                    paddingBottom: baseStyle.isIPhoneX ? 34 : 0
                }}>
                    <View style={{
                        borderBottomColor: baseStyle.BLACK_000000_10,
                        borderBottomWidth: 1,
                        height: DISTANCE(64),
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{
                            fontSize: RATE(34),
                            color: baseStyle.BLACK_333333,
                        }}>分享至</Text>
                    </View>

                    {
                        this.state.platName.length <= 0 && <View style={{
                            alignItems: 'center', justifyContent: 'center',
                            marginTop: DISTANCE(40),
                            // backgroundColor:'#cd92ff'
                        }}>
                            <Text style={{
                                fontSize: RATE(28),
                                color: baseStyle.BLACK_333333,
                                // marginTop: DISTANCE(15)
                            }}>
                                {'很抱歉，您尚未安装可分享软件哦'}
                            </Text>
                        </View>
                    }

                    <View style={{ flexWrap: 'wrap', flexDirection: 'row', }}>
                        {
                            this.state.platName.map((info, index) => (
                                <TouchableOpacity key={index}
                                    style={{
                                        marginTop: DISTANCE(40),
                                        width: width / 4,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        this.share(info);
                                        this.hid();
                                    }}>
                                    <Image source={shareButtonMessage[info].image} />
                                    <Text style={{
                                        fontSize: RATE(24),
                                        color: baseStyle.BLACK_999999,
                                        marginTop: DISTANCE(15)
                                    }}>
                                        {shareButtonMessage[info].title}
                                    </Text>
                                </TouchableOpacity>)
                            )
                        }
                    </View>
                    <TouchableOpacity
                        style={{
                            marginTop: DISTANCE(40),
                            height: DISTANCE(81),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F1F1F1'
                        }}
                        onPress={() => {
                            this.hid();
                        }}>
                        <Text style={{
                            fontSize: RATE(34),
                            color: baseStyle.BLACK_999999
                        }}>取消</Text>
                    </TouchableOpacity>
                </View>
            </TranslucentModal>
        )

    }



    render() {

        //显示创建 跟view
        // this.state.isShow ? sibling = new RootSiblings(<View
        //     style={{
        //         top: 0, right: 0, bottom: 0, left: 0,
        //         backgroundColor: 'rgba(0,0,0,0.3)',
        //         // backgroundColor: '#cd92ff',
        //     }}
        // >
        //     {this.loading()}
        // </View>) : null;


        return (
            this.state.isShow ? this.loading() : null
        );
    };

    show() {
        this.setState({
            isShow: true,
        })

        // this.textView();
    }

    hid() {
        this.setState({
            isShow: false,
        })
        // sibling.destroy();
    }
}

export default ShareView;
