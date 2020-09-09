/*
 * @Author: lishuai 
 * @Date: 2020-03-30 15:34:16 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-08-05 15:55:11
 * 多头启动活动营销页
 */

import React from 'react';
import {
    Text,
    TouchableOpacity,
    Platform,
    View
} from 'react-native';
import PageHeader from '../../components/NavigationTitleView';
import BaseComponent from '../BaseComponentPage';
import LinearGradient from 'react-native-linear-gradient';
import * as ScreenUtil from '../../utils/ScreenUtil';
import ShareView, { ShareType } from '../../components/ShareView';
import * as cyURL from '../../actions/CYCommonUrl';
import UserInfoUtil from '../../utils/UserInfoUtil';
import { toast } from '../../utils/CommonUtils';
import { WebView } from 'react-native-webview';
import { sensorsDataClickObject } from '../../components/SensorsDataTool';

const INJECTEDJAVASCRIPT = `
var meta = document.createElement('meta'); 
meta.setAttribute('name', 'viewport'); 
meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
document.getElementsByTagName('head')[0].appendChild(meta);
`;
// 多头启动活动分享标题
const share_title_for_duo_tou_qi_dong = '好友邀请你帮忙助力一同解锁选股策略股池';
// 多头启动活动分享描述
const share_desc_for_duo_tou_qi_dong = '愿这份起爆龙头股池轻松助你我股海擒龙';

export default class DuoTouQiDongPage extends BaseComponent {
    constructor(props) {
        super(props);
        this.url = cyURL.ydhxgProdUrl + 'tk/share_app';
        this.state = {
            shareUrl: '', // 分享出去的url
            title: '多头启动'
        }
    }
    componentDidMount() {

    }

    onBack() {
        this.props.navigation.state.params && this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack();
        Navigation.pop(this.props.navigation);
    }
    _activityRuleBtnOnClick() {
        let url = cyURL.ydhxgProdUrl + 'tk_rule';
        Navigation.pushForParams(this.props.navigation, 'YDBaseWebViewPage', { url: url });
    }
    _onMessageHandler(event) {
        try {
            let data = JSON.parse(event.nativeEvent.data);
            if (data.command == 'tk_share') { // 分享
                let userId = UserInfoUtil.getUserId();
                let phone = UserInfoUtil.getUserInfo().phone;
                let username = UserInfoUtil.getUserName();
                let shareTime = Date.parse(new Date());
                let url = data.url + '?userid=' + userId + '&userphone=' + phone + '&username=' + username + '&sharetime=' + shareTime;
                this.setState({ shareUrl: url }, () => {
                    this._share();
                });
            } else if (data.command == 'tk_record') { // 助力记录
                let userId = UserInfoUtil.getUserId();
                let url = data.url + '?userid=' + userId;
                Navigation.pushForParams(this.props.navigation, 'YDBaseWebViewPage', { url: url });
            }
        } catch (error) {

        }
    }
    _share() {
        let status = ScreenUtil.duoTouQiDongStatus;
        if (status == 2) { // 活动进行中
            let permission = UserInfoUtil.getUserPermissions();
            if (permission == 0) {
                sensorsDataClickObject.loginButtonClick.entrance = this.state.title
                Navigation.pushForParams(this.props.navigation, "LoginPage", {
                    callBack: () => {
                        if (permission == UserInfoUtil.getUserPermissions()) {
                            return;
                        }
                        this.shareView && this.shareView.show();
                    }
                });
            } else {
                this.shareView && this.shareView.show();
            }
        } else {
            toast('活动已结束，敬请期待下期活动！');
        }
    }
    render() {
        return (
            <BaseComponent style={{ flex: 1 }}>
                <PageHeader
                    onBack={() => this.onBack()}
                    navigation={this.props.navigation}
                    titleText={this.state.title}
                    rightTopView={
                        <TouchableOpacity activeOpacity={0.6} onPress={() => this._activityRuleBtnOnClick()} style={{ width: 80, height: 44, marginRight: 15, justifyContent: 'center' }}>
                            <LinearGradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                colors={["#FF7E7EFF", "#FF5A99FF"]}
                                style={{ height: 22, justifyContent: 'center', alignContent: 'center', borderRadius: ScreenUtil.scaleSizeW(22) }}
                            >
                                <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "rgba(255,255,255,1)", textAlign: 'center' }}>活动规则</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    } />

                {Platform.OS === 'ios' ?
                    <WebView style={{ flex: 1 }}
                        source={{ uri: this.url }}
                        useWebKit={true}
                        javaScriptEnabled={true}
                        decelerationRate="normal"
                        onNavigationStateChange={navState => {
                            this.setState({ title: navState.title });
                        }}
                        // injectedJavaScript={INJECTEDJAVASCRIPT}
                        onMessage={event => this._onMessageHandler(event)}
                        startInLoadingState={true}
                    />
                    :
                    <View style={{ width: ScreenUtil.screenW, flex: 1, overflow: 'hidden' }}>
                        <WebView style={{ flex: 1 }}
                            source={{ uri: this.url }}
                            useWebKit={true}
                            javaScriptEnabled={true}
                            decelerationRate="normal"
                            onNavigationStateChange={navState => {
                                //安卓10上面标题回调的时候会先回调网页地址，这里做个过滤
                                this.setState({ title: (navState.title && navState.title.length > 10) ? "" : navState.title });
                            }}
                            // injectedJavaScript={INJECTEDJAVASCRIPT}
                            onMessage={event => this._onMessageHandler(event)}
                            startInLoadingState={true}
                        />
                    </View>
                }

                <ShareView ref={(shareView) => this.shareView = shareView} shareType={ShareType.DuoTou} shareMessage={
                    {
                        "title": share_title_for_duo_tou_qi_dong,
                        "message": share_desc_for_duo_tou_qi_dong,
                        "urlS": this.state.shareUrl
                    }
                }
                />
            </BaseComponent>
        )
    }
}
