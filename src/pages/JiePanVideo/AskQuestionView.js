/**
 * 精品讲堂(直播课堂)问答区
 */
import React, { Component } from 'react';
import {
    AppState,
    Image,
    Keyboard,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    DeviceEventEmitter
} from 'react-native';
import * as cyURL from "../../actions/CYCommonUrl";
import * as baseStyle from '../../components/baseStyle';
import { commonUtil, toast, Utils } from '../../utils/CommonUtils';
import RATE, { LINE_HEIGHT } from '../../utils/fontRate.js';
import UserInfoUtil from '../../utils/UserInfoUtil';
import ShareSetting from '../../modules/ShareSetting';
import Orientation from '../../../node_modules_modify/react-native-orientation';

export default class AskQuestionView extends Component {

    constructor(props) {

        super(props);
        this.state = {
            inputShow: false,
            data: [],
            inputHeight: 0,
            // fontHeight: 0,
        }
        this.seconds = 0;//公屏发送间隔为30秒,记录读秒
        this.orientationDidChange = this.orientationDidChange.bind(this);
    }

    componentDidMount() {
        // Orientation.addOrientationListener(this.orientationDidChange);
        AppState.addEventListener('change', this._handleAppStateChange);

        if (Platform.OS === 'android') {
            this.androidOrientation = DeviceEventEmitter.addListener('androidOrientation', (tation) => {
                if (tation === 'LANDSCAPE') {
                    this.input && this.input.blur();
                } else if (tation == 'PORTRAIT') {
                    setTimeout(() => {
                        this._flatList && this._flatList.scrollToEnd()
                    }, 1000);
                }
            })
        }
        //一进入就创建一个，一直走
        this._createTimer();

    }
    componentWillUnmount() {
        //移除键盘监听
        AppState.removeEventListener('change', this._handleAppStateChange);
        if (Platform.OS === 'android') {
            this.androidOrientation && this.androidOrientation.remove();
        }
        this._timer && clearInterval(this._timer);

    }
    orientationDidChange = (tation) => {
        if (Platform.OS === 'ios') {
            if (tation === 'LANDSCAPE') {
                this.input && this.input.blur();
            } else if (tation == 'PORTRAIT') {
                setTimeout(() => {
                    this._flatList && this._flatList.scrollToEnd()
                }, 1000);
            }
        }
    };
    _handleAppStateChange = (appState) => {
        if (appState == 'background') {
            this.input && this.input.blur();
        }
    }

    renderCell(item) {
        const data = item.item;
        let time = data.time;
        return (
            <View style={{ paddingTop: 10 }}>
                <View style={{ alignItems: 'flex-end' }}>
                    <View style={{
                        marginRight: commonUtil.rare(174),
                        height: commonUtil.rare(35),
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Text style={{ fontSize: RATE(24), color: baseStyle.BLACK_40 }}>{time}</Text>
                    </View>
                </View>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    padding: commonUtil.rare(30),
                    paddingTop: 0,
                    paddingBottom: 0,
                    justifyContent: 'flex-end',
                }}>
                    <View style={{
                        marginRight: commonUtil.rare(0),
                        marginLeft: commonUtil.rare(160),
                        flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <View style={{ borderRadius: 3, backgroundColor: baseStyle.BLUE_HIGH_LIGHT }}>
                            <Text numberOfLines={0} style={[styles.textStyle, { color: '#fff' }]}>{data.content}</Text>
                        </View>
                    </View>
                    <Image style={{
                        marginLeft: -1,
                        marginRight: commonUtil.rare(20),
                        marginTop: commonUtil.rare(30)
                    }}
                        source={require('../../images/userCenter/uc_IM_user.png')} />
                    <Image style={styles.headerStyle} source={{ uri: UserInfoUtil.getUserHeader() }} />
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={(flatList) => this._flatList = flatList}
                        data={this.state.data}
                        renderItem={this.renderCell.bind(this)}
                        style={{ flex: 1, backgroundColor: '#F1F7FA' }}
                    >
                    </FlatList>
                    {this._renderBottom()}
                </View>
            </View>
        )
    }

    _onWritePress() {
        this.setState({ inputShow: true }, () => {
            this.input && this.input.blur();
        });
    }

    //输入框
    _renderBottom() {
        let sendButton = (
            <TouchableOpacity style={{
                marginLeft: 10,
                backgroundColor: baseStyle.BLUE_HIGH_LIGHT,
                height: 34,
                width: 80,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2
            }}
                onPress={() => this._pushComment()}>
                <Text style={{ color: baseStyle.WHITE }}>发送</Text>
            </TouchableOpacity>
        );
        return (
            <View style={{
                //  height: 44 + this.state.inputHeight,
                paddingVertical: 5,
                borderTopWidth: 1,
                borderTopColor: 'rgba(38, 38, 40, 0.1)'
            }}>
                {
                    this.state.inputShow ?
                        <View style={{
                            alignItems: 'center',
                            height: Math.max(40, this.state.inputHeight),
                            backgroundColor: '#fff',
                            justifyContent: "center"
                        }}>
                            <View style={{ height: 1, backgroundColor: 'rgba(38, 38, 40, 0.1)' }} />
                            <View style={{
                                height: Math.max(34, this.state.inputHeight),
                                flexDirection: 'row',
                                paddingHorizontal: 15,
                                paddingVertical: 8,
                                alignItems: 'center',
                                justifyContent: "center",
                                // backgroundColor: '#ff0000',
                            }}>
                                <View
                                    style={Platform.OS === 'android' ? {
                                        height: Math.max(34, this.state.inputHeight),
                                        backgroundColor: 'rgba(38, 38, 40, 0.05)',
                                        borderRadius: 2,
                                        justifyContent: 'center',
                                    } : {
                                            height: Math.max(34, this.state.inputHeight),
                                            paddingVertical: 5,
                                            backgroundColor: 'rgba(38, 38, 40, 0.05)',
                                            borderRadius: 2,
                                            justifyContent: 'center',
                                        }
                                    }>
                                    <TextInput
                                        placeholder=""
                                        maxLength={100}
                                        multiline={true}
                                        textAlign={'left'}
                                        textAlignVertical={'auto'}
                                        autoFocus={true}
                                        underlineColorAndroid="transparent"
                                        selectionColor={baseStyle.BLUE_HIGH_LIGHT}
                                        ref={(ref) => this.input = ref}
                                        style={Platform.OS === 'android' ? {
                                            //flex:1,
                                            padding: 5,
                                            width: baseStyle.width - 111,//多减一个dp
                                            height: Math.max(24, this.state.inputHeight),
                                            fontSize: RATE(28),
                                        } : {
                                                paddingHorizontal: 5,
                                                width: baseStyle.width - 111,//多减一个dp
                                                height: Math.max(24, this.state.inputHeight),
                                                fontSize: RATE(28),
                                            }}
                                        onChangeText={(text) => {
                                            this.inputContent = text;
                                        }}
                                        onBlur={() => {
                                            this.setState({ inputShow: false }, () => {
                                                //清空发送数据
                                                this.inputContent = "";
                                                setTimeout(() => {
                                                    this._flatList && this._flatList.scrollToEnd()
                                                }, 1000);
                                            })
                                        }}
                                        onFocus={() => {
                                            setTimeout(() => {
                                                this._flatList && this._flatList.scrollToEnd()
                                            }, 1000);
                                        }}
                                        onContentSizeChange={(params) => {
                                            // let h1 = Math.floor(params.nativeEvent.contentSize.height);
                                            this.setState({ inputHeight: params.nativeEvent.contentSize.height });
                                        }}
                                    />
                                </View>
                                {sendButton}
                            </View>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 49, paddingHorizontal: 15, }}>
                            <View style={{ height: 1, backgroundColor: 'rgba(38, 38, 40, 0.1)' }} />
                            <TouchableOpacity style={{ flex: 1, height: 34, }}
                                onPress={() => this._onWritePress()}>
                                <View style={{
                                    flex: 1, flexDirection: 'row', alignItems: 'center',
                                    borderRadius: 3, backgroundColor: 'rgba(38, 38, 40, 0.05)',
                                }}>
                                    <Image style={{ marginHorizontal: 10 }}
                                        source={require('../../images/icons/post_detail_write.png')} />
                                    <Text style={{ color: '#999', fontSize: 12 }}>{'请输入问题，专家为您答疑解惑'}</Text>
                                </View>
                            </TouchableOpacity>
                            {sendButton}
                        </View>
                }
            </View>
        );
    }

    //发送间隔倒计时
    _createTimer() {
        this._timer = setInterval(() => {
            if (this.seconds > 0) {
                this.seconds--;
            }
        }, 1000);
    }

    //发送消息
    _pushComment() {
        if (this.inputContent === undefined || this.inputContent == "" || this.inputContent.length === 0) {
            toast('问题内容不能为空');
            this.input && this.input.blur();
            return;
        }
        if (this.seconds > 0) {
            toast('提问间隔是30秒哦,还有' + this.seconds + '秒');
            return;
        }
        //输入的内容
        let inputContent = this.inputContent;
        //消息清空
        this.input && this.input.clear();
        this.input && this.input.blur();
        inputContent = inputContent && inputContent.trim();
        if (inputContent && inputContent.length) {
            // this._flatList && this._flatList.scrollToEnd && this._flatList.scrollToEnd();
            const type = this.props.type;
            let qx = 0, path = '';
            if (type == '多空决策专属课') {
                qx = 3;
                path = 'liveClassVideo/decisionMakingCourse';
            } else if (type == '风口决策专属课') {
                qx = 4;
                path = 'liveClassVideo/decisionMakingCourse';
            } else if (type == '主力决策专属课') {
                qx = 5;
                path = 'liveClassVideo/decisionMakingCourse';
            } else if (type == '实战解盘课') {
                path = 'liveClassVideo/practicalCourse';
            }
            let userMessage = {
                //time: "",
                nickname: UserInfoUtil.getNickName(),
                qx: qx,
                content: this.inputContent,
            };
            if (path.length) {
                // console.log("发送前",cyURL.urlHXG_zan + path)
                // console.log("发送前信息",userMessage)
                Utils.post(cyURL.urlHXG_zan + path, userMessage, (success) => {

                }, (error) => {
                    toast('发送失败，请稍后重试');
                });
                this.seconds = 30;
                let oldData = this.state.data;
                userMessage.time = ShareSetting.getDate(Date.parse(new Date()), 'HH:mm:ss');;
                oldData.push(userMessage);
                this.setState({ data: oldData });
                this.inputContent = "";
            }
        }
    }
}

var styles = StyleSheet.create({
    headerStyle: {
        width: commonUtil.rare(90),
        height: commonUtil.rare(90),
        borderRadius: commonUtil.rare(90 / 2),
    },
    textStyle: {
        //设置行号
        fontSize: RATE(30),
        lineHeight: LINE_HEIGHT(30),
        margin: commonUtil.rare(20),
    }
});