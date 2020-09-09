import React, { Component } from "react";
import { Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AllActions from "../../actions/AllActions";
import * as baseStyle from "../../components/baseStyle";
import ExpandableText from '../../components/ExpandableText';
import AutoImage from '../../lib/autoImage1';
import HtmlView from "../../lib/htmlRender.js";
import UserInfoUtil, * as type from "../../utils/UserInfoUtil";
import { sensorsDataClickObject, sensorsDataClickActionName } from "../../components/SensorsDataTool";

const zan = require('../../images/livelession/icon-zaning.png');
const noZan = require('../../images/livelession/icon-zan.png');
const showImg = require('../../images/icons/show.png');
const hiddenImg = require('../../images/icons/hidden.png');

class ContentView extends Component {

    constructor(props) {
        super(props);
        let zans = UserInfoUtil.getZanMessage(type.ZAN_GuanDianZhiBo);
        let zan = zans.indexOf(this.props.rowData.key);
        this.status = '';
        this.state = {
            isZan: zan < 0 ? false : true,
            zanNumber: this.props.rowData.like ? this.props.rowData.like : 0,
            key: this.props.rowData.key,
            itemClicked: false,
            bigZan: false
        }
    }
    componentDidMount() {

    }
    componentWillReceiveProps(nextProps, netxContext) {
        this.props = nextProps;
        let zans = UserInfoUtil.getZanMessage(type.ZAN_GuanDianZhiBo);
        let zan = zans.indexOf(nextProps.rowData.key);
        this.setState({
            isZan: zan < 0 ? false : true,
            zanNumber: this.props.rowData.like ? this.props.rowData.like : 0,
        });
    }
    likeBtnOnClick(data) {
        if (this.state.itemClicked) return;
        this.setState({ itemClicked: true }, () => {
            setTimeout(() => {
                this.setState({ itemClicked: false });
            }, 2000);
        })
        let op = this.state.isZan ? -1 : 1;
        UserInfoUtil.ydgpZanNew(data.viewpoint_id, type.MODEL_panZhongGuanDian, op, '', '', () => {
            this.setState({
                bigZan: op == 1 && true
            }, () => {
                setTimeout(() => {
                    this.setState({ bigZan: false });
                }, 500);
            });
            sensorsDataClickObject.agreePoint.content_show_type = data.content.substring(3,data.content.length-4)
            sensorsDataClickObject.agreePoint.agree_content = '观点'
            sensorsDataClickObject.agreePoint.publish_time = data.create_time
            SensorsDataTool.sensorsDataClickAction(sensorsDataClickActionName.agreePoint)
            

        }, () => { }, '-1', data.key);
    }
    _selectedView(rowdata) {
        let images = rowdata.images && rowdata.images.split(',').map((child) => {
            return { uri: child };
        });
        let index = rowdata.content.indexOf('<img');
        let contents = index > 0 ? rowdata.content.substring(0, index) : rowdata.content;
        let content = contents.replace(/<[^<>]+>/g, '').replace(/&nbsp;/ig, '').replace(/[\r\n]/g, '');
        let image = rowdata.cover && rowdata.cover.replace(/<img src='/g, '').replace(/\/>/g, '').replace(/'/g, '').replace(/^\s*|\s*$/g, '');
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {rowdata.content != null ? this.props.showBtn ?
                        <View>
                            {content ?
                                <ExpandableText
                                    style={{
                                        fontSize: 14, color: 'rgba(0,0,0,0.6)', lineHeight: 20
                                    }}
                                    numberOfLines={2}
                                    expandButtonLocation={'flex-start'}
                                    unexpandView={() =>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                            <Text style={{ color: '#3399FF', fontSize: 12, }}>{'收起'}</Text>
                                            <Image source={showImg}></Image>
                                        </View>
                                    }
                                    expandView={() =>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                            <Text style={{ color: '#3399FF', fontSize: 12, }}>{'展开'}</Text>
                                            <Image source={hiddenImg}></Image>
                                        </View>
                                    }
                                >
                                    {content}
                                </ExpandableText>
                                : null
                            }
                            {image.length > 0 &&
                                <AutoImage source={{ uri: image }}
                                    imgStyle={{ marginTop: content ? 10 : 0, resizeMode: 'stretch' }}
                                    startCapture={true}
                                    imgCapture={true}
                                    moveCapture={true}
                                    images={[{ uri: image }]}
                                    imageWidth={rowdata.imageWidth}
                                    imageHeight={rowdata.imageHeight}
                                />
                            }
                        </View>
                        :
                        <HtmlView value={rowdata.content}
                            imgWidth={rowdata.imageWidth}
                            imgHeight={rowdata.imageHeight}
                            images={images}
                            showBtn={this.props.showBtn || 0}
                            stylesheet={StyleSheet.create({
                                p: {
                                    flex: 1,
                                    fontSize: 15,
                                    color: '#333333',
                                    lineHeight: 24,
                                    width: baseStyle.width - 80
                                },
                                img: {
                                    resizeMode: 'stretch',
                                    marginTop: content ? 10 : 0,
                                    marginBottom: Platform.OS === 'ios' ? (rowdata.messageType == 3 ? -14 : 0) : (rowdata.messageType == 3 ? -21 : 0)
                                }
                            })}
                        />
                        :
                        null
                    }
                </View>
            </View>
        )
    }

    render() {
        let rowdata = this.props.rowData;
        if (!rowdata.create_time) return null;
        let times = rowdata.create_time && rowdata.create_time.split(':');
        let teacher = rowdata.teacherName;
        let islabel = (rowdata.label_name && rowdata.label_name !== "") ? true : false;
        let islast = this.props.isPermissionLast;
        let rightText, rightColors, rightTextColor;
        if (rowdata.qx == 4) {
            rightText = '风口决策专享'
            rightColors = ['#FFAC41', '#FFCC65'];
            rightTextColor = '#663300'
        } else if (rowdata.qx == 5) {
            rightText = '主力决策专享'
            rightColors = ['#FF5741', '#FF9865'];
            rightTextColor = '#660000'
        }
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', fontSize: 16, fontWeight: 'bold' }} onLayout={this.props.onLayout}>
                <View style={{ flexDirection: 'row' }}>
                    <View>
                        <View style={{ width: 1, height: 10, marginLeft: 27.5, backgroundColor: '#E5E5E5' }} />
                        <View style={{ borderRadius: 15, height: 30, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flex: 1, borderTopRightRadius: 15, borderBottomRightRadius: 15, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#3399FF33' }}>
                                <Text style={{ marginLeft: 8.5, fontSize: 15, color: '#336699' }} numLine={1}>{times[0].substring(10)}:{times[1]}</Text>
                                <ImageBackground style={{ width: 30, height: 30, borderRadius: 15, marginLeft: 8.5 }} source={require("../../images/JiePan/point_list_teacher_default_avatar.png")}>
                                    <Image style={{ width: 30, height: 30, borderRadius: 15 }} source={{ uri: rowdata.teacherImage }} />
                                </ImageBackground>
                            </View>
                        </View>
                        <View style={{ flex: 1, width: 1, marginLeft: 27.5, backgroundColor: '#E5E5E5' }} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ marginTop: 10, marginLeft: 10 }}>
                            <View style={{ height: 30, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold' }}>{teacher}</Text>
                                {islabel &&
                                    <View style={{ height: 18, borderColor: '#F9240099', borderWidth: 1, borderRadius: 3, marginLeft: 10, marginRight: 15, paddingLeft: 3, paddingRight: 3, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#F9240099', fontSize: 11 }}>{rowdata.label_name}</Text>
                                    </View>}
                            </View>
                            <View style={{ marginLeft: -40, marginTop: Platform.OS == 'ios' ? 13 : 10, marginBottom: Platform.OS == 'ios' ? 10 : 7, marginRight: 15, backgroundColor: '#fff' }}>
                                {this._selectedView(rowdata)}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: rightText == null ? 'flex-end' : 'space-between', marginBottom: 10 }}>
                                {
                                    rightText &&
                                    <LinearGradient
                                        style={{ height: 18, paddingLeft: 5, paddingRight: 5, alignItems: 'center', justifyContent: 'center', marginLeft: -40, borderRadius: 18 / 2, overflow: 'hidden' }}
                                        colors={rightColors}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={{ color: rightTextColor, fontWeight: 'bold', fontSize: 11 }}>{rightText}</Text>
                                    </LinearGradient>
                                }
                                <TouchableOpacity onPress={() => this.likeBtnOnClick(rowdata)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 25, marginRight: 15 }}>
                                        <Image style={{ height: this.state.bigZan ? 15 : 12, width: this.state.bigZan ? 15 : 12 }} source={!this.state.isZan ? noZan : zan} />
                                        <Text style={{ color: this.state.isZan ? '#F92400' : '#979797', fontSize: 12, marginLeft: 6 }}>{this.state.zanNumber == 0 ? '点赞' : this.state.zanNumber}</Text>
                                    </View>
                                </TouchableOpacity>
                                {
                                    this.state.bigZan &&
                                    <Text style={{
                                        position: 'absolute',
                                        right: 5,
                                        top: -20,
                                        backgroundColor: 'transparent',
                                        color: baseStyle.BLUE_HIGH_LIGHT,
                                        height: 20
                                    }}>+1</Text>
                                }
                            </View>
                            {!islast && <View style={{
                                flex: 1,
                                height: 1,
                                marginLeft: -40,
                                backgroundColor: '#E5E5E5',
                            }} />}
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

export default connect((state) => ({
    userInfo: state.UserInfoReducer,
    Permissions: state.UserInfoReducer.permissions,
    stateNetInfo: state.NetInfoReducer
}),
    (dispatch) => ({
        actions: bindActionCreators(AllActions, dispatch)
    }), null,
    { forwardRef: true }
)(ContentView)