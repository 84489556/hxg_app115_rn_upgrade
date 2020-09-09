/*
 * @Author: lishuai 
 * @Date: 2019-08-16 15:10:05 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-06-30 16:30:58
 * 成长课堂列表
 */
import React from "react";
import {
    Image,
    ImageBackground,
    SectionList,
    Text,
    TouchableOpacity,
    View,
    DeviceEventEmitter,
    Platform
} from "react-native";
import * as baseStyle from "../../components/baseStyle";
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import UserInfoUtil from '../../utils/UserInfoUtil';
import YdCloud from '../../wilddog/Yd_cloud';
import { PopupPromptView } from './IndexStudyCoursePage';
import { connect } from 'react-redux';
//只是Android 使用
import FastImage from 'react-native-fast-image'
import { sensorsDataClickObject } from "../../components/SensorsDataTool";
import ShareSetting from "../../modules/ShareSetting";

class GrowthCoursePage extends BaseComponentPage {
    constructor(props) {
        super(props);
        this.permission = UserInfoUtil.getUserPermissions();
        this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou;
        this.state = {
            data: [
                { title: '股小白', data: [{}] },
                { title: '股大咖', data: [] },
                { title: '指标学习', data: [] },
                { title: '策略课堂', data: [] }
            ]
        }
        this.isDidMount = false;
    }
    componentDidMount() {
        this.isDidMount = true;
        this.loadData();
        sensorsDataClickObject.videoPlay.entrance = '成长学堂'
    }
    componentWillUnmount() {
        this.isDidMount = false;
    }
    componentWillReceiveProps() {
        if (this.permission !== UserInfoUtil.getUserPermissions()) {
            this.permission = UserInfoUtil.getUserPermissions();
            this.loadData();
        }
        if (this.isDuoTouUser != (UserInfoUtil.getUserInfoReducer().activityPer === DuoTou)) {
            this.isDuoTouUser = UserInfoUtil.getUserInfoReducer().activityPer === DuoTou;
        }
    }
    loadData() {
        this._loadBigCafeData();
        this.fetchLatestData(MainPathYG + 'ZhiBiaoKeTangAll/');
        this.fetchLatestData(MainPathYG + 'ChengZhangKeTangAll/');
    }
    // 获取股大咖最新两条数据
    _loadBigCafeData() {
        YdCloud().ref(MainPathYG + 'DaKaLaiLe').orderByKey().limitToLast(2).get((snap) => {

            if (snap.code == 0 && this.isDidMount == true) {
                let values = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                values.reverse();
                keys.reverse();
                for (let i = 0; i < keys.length; i++) {
                    values[i].key = keys[i];
                }
                let newData;
                let oldData = this.state.data;
                let idx = -1;
                for (const i in oldData) {
                    if (oldData[i].title == '股大咖') {
                        newData = oldData[i];
                        idx = i;
                        break;
                    }
                }
                if (!newData) return;
                newData.data = [values];
                if (idx == -1) return;
                oldData[idx] = newData;
                this.setState({ data: oldData });
            }
        });
    }
    // 获取指标和策略最新数据
    async fetchLatestData(path) {
        let permissions = [0, -2, 3];
        if (this.permission == 4) {
            permissions.push(4);
        } else if (this.permission == 5) {
            permissions.push(4);
            permissions.push(5);
        }
        await Promise.all(permissions.map(permission => this._fetchLatestData(path + permission))).then(x => {
            let values = [];
            x.forEach(element => {
                if (element) {
                    element.forEach(value => {
                        if (value) {
                            values.push(value);
                        }
                    });
                }
            });
            values.sort(function (a, b) {
                return b.createTime - a.createTime; // 倒序
            });
            if (path.indexOf('ZhiBiaoKeTangAll') != -1) {
                let oldData = this.state.data;
                oldData[2].data = values.slice(0, 2);
                this.setState({ data: oldData });
            } else if (path.indexOf('ChengZhangKeTangAll') != -1) {
                let oldData = this.state.data;
                oldData[3].data = values.slice(0, 2);
                this.setState({ data: oldData });
            }
        });
    }
    // 获取最新两节课程数据
    _fetchLatestData(path) {
        return new Promise((resolve) => {
            YdCloud().ref(path).orderByKey().limitToLast(2).get(snap => {
                if (this.isDidMount == true) {
                    if (snap.code == 0) {
                        let values = Object.values(snap.nodeContent);
                        resolve(values);
                    } else {
                        resolve(null);
                    }
                }
            });
        })
    }

    _getSectionHeaderIconSrcWithTitle(title) {
        if (title == '股小白') {
            return require('../../images/livelession/Growth/course_little_white_icon.png');
        } else if (title == '股大咖') {
            return require('../../images/livelession/Growth/course_big_cafe_icon.png');
        } else if (title == '指标学习') {
            return require('../../images/livelession/Growth/course_index_study_icon.png');
        } else if (title == '策略课堂') {
            return require('../../images/livelession/Growth/course_strategy_icon.png');
        }
    }

    _moreBtnOnClick(title) {
        if (title == '股大咖') {
            Navigation.pushForParams(this.props.navigation, 'BigCafeCoursePage');
            sensorsDataClickObject.videoPlay.class_type = '股大咖'            
        } else if (title == '指标学习') {
            Navigation.pushForParams(this.props.navigation, 'IndexStudyCoursePage');
            sensorsDataClickObject.videoPlay.class_type = '指标学习'
        } else if (title == '策略课堂') {
            Navigation.pushForParams(this.props.navigation, 'StrategyCoursePage');
            sensorsDataClickObject.videoPlay.class_type = '策略课堂'
        }
    }

    _renderSectionHeader = (x) => {
        let src = this._getSectionHeaderIconSrcWithTitle(x.section.title);
        return (
            <View>
                <View style={{ height: 8, backgroundColor: '#f1f1f1' }}></View>
                <View style={{ backgroundColor: '#fff' }}>
                    <View style={{ flexDirection: 'row', height: 40, justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#0000001A', borderBottomWidth: 1 }}>
                        <Image style={{ width: 96, height: 27, marginLeft: 15 }} source={src} />
                        {x.section.title != '股小白' &&
                            <TouchableOpacity activeOpacity={1} onPress={() => this._moreBtnOnClick(x.section.title)}>
                                <View style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 15, color: '#999999', marginRight: 10 }}>更多</Text>
                                    <Image style={{ width: 8, height: 14 }} source={require('../../images/livelession/MorningUnderstand/more.png')} />
                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        )
    }

    _renderLittleWhiteItem(data) {
        let icons = [
            require('../../images/livelession/Growth/course_little_white_icon_1.png'),
            require('../../images/livelession/Growth/course_little_white_icon_2.png'),
            require('../../images/livelession/Growth/course_little_white_icon_3.png'),
            require('../../images/livelession/Growth/course_little_white_icon_4.png')
        ]
        let btnWidth = (baseStyle.width - 2 * 15 - 10) / 4;
        return (
            <View style={{ flexDirection: 'row', paddingTop: 15, paddingBottom: 10, paddingLeft: 15, paddingRight: 15, justifyContent: 'space-between', backgroundColor: '#fff' }}>
                {icons.map((src, idx) => {
                    return (
                        <TouchableOpacity key={idx} style={{ width: btnWidth, height: 67 }} activeOpacity={1} onPress={() => {
                                Navigation.pushForParams(this.props.navigation, 'LittleWhiteCoursePage', { selectedIndex: idx })
                                sensorsDataClickObject.videoPlay.class_type = '股小白'
                                sensorsDataClickObject.videoPlay.class_series = ['技术小贴士','基本没问题','操作小技巧','小白心态好'][idx]
                            }}>
                            <Image resizeMode='stretch' style={{ width: btnWidth, height: 67 }} capInsets={{ top: 10, left: 10, bottom: 10, right: 10 }} source={src}></Image>
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }
    _renderBigCafeItem(data) {
        let itemWidth = (baseStyle.width - 2 * 15 - 5) / 2;
        let itemHeight = itemWidth * 0.664;
        return (
            <TouchableOpacity
                key={data.create_time}
                style={{ width: itemWidth }}
                activeOpacity={1}
                onPress={() => { this.itemClicked(data, 'BigCafe') }}>
                <ImageBackground style={{ height: itemHeight, width: itemWidth, resizeMode: 'stretch' }}
                    source={require('../../images/icons/placeholder_bg_image.png')}>
                    {Platform.OS === 'ios' ?
                        <Image
                            style={{ height: itemHeight, width: itemWidth, position: "absolute", left: 0, top: 0, resizeMode: 'stretch' }}
                            source={{ uri: data.cover && data.cover }}
                        />
                        :
                        <FastImage
                            style={{ height: itemHeight, width: itemWidth, position: "absolute", left: 0, top: 0 }}
                            source={{ uri: data.cover && data.cover }}
                            resizeMode={FastImage.resizeMode.stretch}
                        />
                    }
                    <View style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        height: 18,
                        width: 70,
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
                            {data && data.create_time && data.create_time.substring(0, 10)}
                        </Text>
                    </View>
                </ImageBackground>
                <View style={{ marginLeft: 5, marginTop: 10 }} >
                    <Text numberOfLines={1} style={{ fontSize: 14, color: '#555555', }}>
                        {data.period}期: {data.title}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    _renderItem = (x) => {
        if (x.section.title == '股小白') {
            return this._renderLittleWhiteItem(x.section.data);
        } else if (x.section.title == '股大咖') {
            let data = x.section.data[0];
            return (
                <View style={{ flexDirection: 'row', paddingTop: 15, paddingLeft: 15, paddingRight: 15, paddingBottom: 10, justifyContent: 'space-between', backgroundColor: '#fff' }}>
                    {data.map(data => this._renderBigCafeItem(data))}
                </View>
            );
        } else {
            let data = x.section.data[x.index];
            let type = x.section.title == '指标学习' ? 'IndexStudy' : 'Strategy';
            let showBottomLine = (x.section.data.length - 1 != x.index);
            let showLock = false;
            if (this.permission == 0 || this.permission == 1) {
                if (this.isDuoTouUser) {
                    showLock = this.permission < data.star;
                } else {
                    showLock = this.permission < data.star || data.star == -2;// star 值-2说明是多头启动权限的课程
                }
            }
            return (
                <TouchableOpacity style={{ height: 65, paddingLeft: 15, paddingRight: 15, backgroundColor: '#fff' }} activeOpacity={1} onPress={() => this.itemClicked(data, type)}>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#0000001A', borderBottomWidth: showBottomLine ? 1 : 0 }}>
                        <View>
                            <Text style={{ fontSize: 15, color: '#000000' }}>{data.title}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text style={{ fontSize: 12, color: '#FF660099' }}>{data.like}人已点赞</Text>
                                {showLock ? <Image style={{ width: 10, height: 12, marginLeft: 5 }} source={require('../../images/livelession/Growth/course_lock_icon.png')}></Image> : null}
                            </View>
                        </View>
                        <ImageBackground style={{ width: 80, height: 45, borderRadius: 10, overflow: 'hidden' }} source={require('../../images/icons/placeholder_bg_image.png')}>
                            {Platform.OS === 'ios' ?
                                <Image
                                    style={{ width: 80, height: 45, borderRadius: 10 }}
                                    source={{ uri: data.cover_url && data.cover_url }}
                                />
                                :
                                <FastImage
                                    style={{ width: 80, height: 45, borderRadius: 10 }}
                                    source={{ uri: data.cover_url && data.cover_url }}
                                />
                            }
                        </ImageBackground>
                    </View>
                </TouchableOpacity>
            );
        }
    }
    // 课程点击跳转
    _itemOnClick(data, type) {
        if (data.id === undefined) return;
        let key, optionParam = {};
        sensorsDataClickObject.videoPlay.entrance = '成长学堂'
        sensorsDataClickObject.videoPlay.class_name = data.title || ''
        if (data.create_time) {
            sensorsDataClickObject.videoPlay.publish_time =  data.create_time.substring(0,10)
        }
        if (data.createTime) {
            sensorsDataClickObject.videoPlay.publish_time = ShareSetting.getDate(parseInt(data.createTime), 'yyyy-MM-dd')            
        } 
        if (type == 'BigCafe') {
            key = data.id;
            optionParam = { path: MainPathYG + 'DaKaLaiLe/' + key };            
            sensorsDataClickObject.videoPlay.class_type = '股大咖'      
        } else if (type == 'IndexStudy') {
            key = data.createTime;
            let path = MainPathYG + 'ZhiBiaoKeTangAll/' + data.star + '/' + key;
            optionParam = { path: path, star: data.star, taoxiName: data.setsystem };
            sensorsDataClickObject.videoPlay.class_series = data.setsystem
            sensorsDataClickObject.videoPlay.class_type = '指标学习'            
        } else {
            key = data.createTime;
            let path = MainPathYG + 'ChengZhangKeTangAll/' + data.star + '/' + key;
            optionParam = { path: path, star: data.star, taoxiName: data.setsystem }; 
            sensorsDataClickObject.videoPlay.class_type = '策略课堂'
            sensorsDataClickObject.videoPlay.class_series = data.setsystem
        }
        Navigation.pushForParams(this.props.navigation, 'CourseDetailPage', {
            key: key,
            type: type,
            ...optionParam
        });
    }
    // 未付费用户点击课程
    itemOnClickForUnpaidUser(data, type) {
        if (this.isDuoTouUser) {
            if (this.permission < data.star) {
                if (this.prompt) {
                    this.prompt.show();
                } else {
                    this.setState({}, () => {
                        this.prompt && this.prompt.show();
                    });
                }
            } else {
                this._itemOnClick(data, type);
            }
        } else {
            if (this.permission < data.star || data.star == -2) {
                if (this.prompt) {
                    this.prompt.show();
                } else {
                    this.setState({}, () => {
                        this.prompt && this.prompt.show();
                    });
                }
            } else {
                this._itemOnClick(data, type);
            }
        }
    }
    itemClicked(item, type) {          
        if (type == 'BigCafe') {
            this._itemOnClick(item, type);
        } else if (type == 'IndexStudy' || type == 'Strategy') {
            if (this.permission == 0) { // 游客
                sensorsDataClickObject.loginButtonClick.entrance = '成长学堂'
                Navigation.pushForParams(this.props.navigation, "LoginPage", {
                    callBack: () => {
                        if (this.permission == 0) return;
                        if (this.permission == 1) { // 未付费用户
                            this.itemOnClickForUnpaidUser(item, type);
                        } else { // 付费用户
                            this._itemOnClick(item, type);
                        }
                    }
                });
            } else if (this.permission == 1) { // 未付费用户
                this.itemOnClickForUnpaidUser(item, type);
            } else { // 付费用户
                this._itemOnClick(item, type);
            }
        }
    }
    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'成长学堂'} />
                <SectionList
                    style={{ backgroundColor: '#f1f1f1' }}
                    sections={this.state.data}
                    extraData={this.state}
                    renderItem={this._renderItem}
                    renderSectionHeader={this._renderSectionHeader}
                    keyExtractor={(item, index) => item + index}
                    stickySectionHeadersEnabled={false}
                />
                {!this.prompt && <PopupPromptView ref={ref => this.prompt = ref} />}
            </BaseComponentPage>
        )
    }
}

export default connect((state) => ({
    permission: state.UserInfoReducer.permissions,
    activityPer: state.UserInfoReducer.activityPer
}))(GrowthCoursePage)
