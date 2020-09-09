/*
 * @Author: lishuai 
 * @Date: 2019-08-13 17:39:54 
 * @Last Modified by: lishuai
 * @Last Modified time: 2020-06-30 16:26:40
 * 股大咖列表页面
 */
import React from "react";
import { Image, ImageBackground, Platform, Text, TouchableOpacity, View } from "react-native";
import { LargeList } from 'react-native-largelist-v3';
import * as baseStyle from "../../components/baseStyle";
import { mNormalFooter } from "../../components/mNormalFooter";
import { mNormalHeader } from "../../components/mNormalHeader";
import NavigationTitleView from '../../components/NavigationTitleView';
import BaseComponentPage from '../../pages/BaseComponentPage';
import YdCloud from '../../wilddog/Yd_cloud';
import { sensorsDataClickObject } from "../../components/SensorsDataTool";

const ITEM_HEIGHT = baseStyle.width * 9 / 16 + 40;
//只是Android 使用
import FastImage from 'react-native-fast-image'

export default class BigCafeCoursePage extends BaseComponentPage {

    constructor(props) {
        super(props);
        this.da_ka_ref = YdCloud().ref(MainPathYG + 'DaKaLaiLe')
        this.pageNumber = 20;

        this.state = {
            data: [{ items: [] }],
            pageKey: '',
            allLoaded: false
        }
        this._renderItem = this._renderItem.bind(this);
    }
    componentDidMount() {
        this._reloadData();
        sensorsDataClickObject.videoPlay.entrance = '股大咖列表'
        sensorsDataClickObject.videoPlay.class_type = '股大咖'
    }
    _reloadData = () => {
        this.da_ka_ref && this.da_ka_ref.orderByKey().limitToLast(this.pageNumber).get((snap) => {
            if (snap.code == 0) {
                let item = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                item.reverse();
                this.setState({ pageKey: keys[0], data: [{ items: item }], allLoaded: item.length < this.pageNumber }, () => {
                    this.refs.list.endRefresh();
                });
            }
        });
    }
    _loadMoreData = () => {
        this.da_ka_ref && this.da_ka_ref.orderByKey().endAt(this.state.pageKey).limitToLast(this.pageNumber + 1).get(snap => {
            if (snap.code == 0) {
                let values = Object.values(snap.nodeContent);
                let keys = Object.keys(snap.nodeContent);
                values.splice(values.length - 1, 1); // 删除重复的那一条数据
                values.reverse();
                let oldData = this.state.data[0].items;
                let newData = oldData.concat(values);
                this.setState({ pageKey: keys[0], data: [{ items: newData }], allLoaded: values.length < this.pageNumber }, () => {
                    this.refs.list.endLoading();
                });
            }
        })
    }
    _prefixInteger(num, length = 2) {
        return (num / Math.pow(10, length)).toFixed(length).substr(2);
    }
    _millisecondToDate(msd) {
        if (!msd) return '00:00';
        var time = Math.round(parseFloat(msd) / 1000);
        if (null != time && "" != time) {
            if (time > 60 && time < 60 * 60) {
                time = this._prefixInteger(parseInt(time / 60.0)) + ":" + this._prefixInteger(parseInt((parseFloat(time / 60.0) - parseInt(time / 60.0)) * 60));
            } else if (time >= 60 * 60 && time < 60 * 60 * 24) {
                time = this._prefixInteger(parseInt(time / 3600.0)) + ":" +
                    this._prefixInteger(parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) + ":" +
                    this._prefixInteger(parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
                        parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60));
            } else {
                time = "00:" + this._prefixInteger(parseInt(time));
            }
        } else {
            time = "00:00";
        }
        return time;
    }
    _itemClicked(item) {

        if (item.id === undefined || this.state.itemClicked) return;
        this.setState({ itemClicked: true }, () => {
            setTimeout(() => {
                this.setState({ itemClicked: false });
            }, 1000);
        })
        sensorsDataClickObject.videoPlay.class_name = item.title
        sensorsDataClickObject.videoPlay.publish_time = item && item.create_time.substring(0,10)
        Navigation.navigateForParams(this.props.navigation, 'CourseDetailPage', {
            key: item.id,
            type: 'BigCafe',
            path: MainPathYG + 'DaKaLaiLe/' + item.id
        });
    }
    _renderItem(path) {
        let item = this.state.data[0].items[path.row];
        let itemWidth = baseStyle.width;
        let itemHeight = itemWidth * 9 / 16;
        return <TouchableOpacity
            activeOpacity={1}
            onPress={() => { this._itemClicked(item) }}>
            <ImageBackground style={{ height: itemHeight, width: itemWidth, resizeMode: 'stretch', alignItems: 'center', justifyContent: 'center', }} source={require('../../images/icons/placeholder_bg_image.png')}>
                {Platform.OS === 'ios' ?
                    <Image
                        style={{ height: itemHeight, width: itemWidth, resizeMode: 'stretch', position: "absolute", }}
                        source={{ uri: item.cover }}
                    />
                    :
                    <FastImage
                        style={{ height: itemHeight, width: itemWidth, position: "absolute" }}
                        source={{ uri: item.cover }}
                        resizeMode={FastImage.resizeMode.stretch}
                    />
                }
                <View style={{ width: 85, height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 34 / 2, borderWidth: 1, borderColor: '#ffffff', overflow: 'hidden' }}>
                    <Image style={{ width: 9, height: 13, resizeMode: 'stretch' }} source={require('../../images/livelession/PanHouCeLue/nowifi_play_icon.png')}></Image>
                    <Text style={{ marginLeft: 12, color: '#ffffff', fontSize: 15 }}>{this._millisecondToDate(item.video_length && item.video_length)}</Text>
                </View>

            </ImageBackground>
            <ImageBackground style={{ width: itemWidth, height: 35, marginTop: -35, paddingRight: 15, justifyContent: 'center' }} source={require('../../images/livelession/Growth/big_cafe_list_mask_bg.png')}>
                <Text style={{ marginLeft: 60, color: '#FFFFFF', fontSize: 14 }} numberOfLines={1}>{item.period}期: {item.title}</Text>
            </ImageBackground>
            <View style={{ flexDirection: 'row', height: 30, backgroundColor: '#ffffff', alignItems: 'center' }}>
                <Image style={{ width: 40, height: 40, marginLeft: 15, marginTop: -30, borderRadius: 20 }} source={{ uri: item.headImg && item.headImg }}></Image>
                <Text style={{ marginLeft: 6, fontSize: 12, color: '#999999' }}>
                    {item && item.create_time && item.create_time.substring(0, 10)}
                </Text>
            </View>
            <View style={{ height: 8, backgroundColor: baseStyle.LINE_BG_F6 }}></View>
        </TouchableOpacity>
    }
    render() {
        return (
            <BaseComponentPage style={{ flex: 1 }}>
                <NavigationTitleView navigation={this.props.navigation} titleText={'股大咖'} />
                <LargeList
                    ref='list'
                    style={{ flex: 1, backgroundColor: baseStyle.LINE_BG_F6 }}
                    data={this.state.data}
                    allLoaded={this.state.allLoaded}
                    heightForIndexPath={() => ITEM_HEIGHT}
                    renderIndexPath={this._renderItem}
                    refreshHeader={mNormalHeader}
                    loadingFooter={mNormalFooter}
                    onRefresh={this._reloadData}
                    onLoading={this._loadMoreData}
                />
            </BaseComponentPage>
        )
    }
}