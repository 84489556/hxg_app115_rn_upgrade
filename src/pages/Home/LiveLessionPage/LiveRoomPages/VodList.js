/**
 *
 *视频解盘(视频直播间)/课程点播列表
 *
 * */
import React, { Component } from "react";
import { DeviceEventEmitter, FlatList, Text, TouchableOpacity, View } from "react-native";
import ShareSetting from "../../../../modules/ShareSetting";
import * as baseStyle from '../../../../components/baseStyle';

export default class VodList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listData: [],
            isPlay: false,
            currentItem: -1
        }
        this._loadData = this._loadData.bind(this)
    }

    componentDidMount() {
        this._loadData()
        this.refreshUI_VodList = DeviceEventEmitter.addListener('refreshUI_VodList', (e) => {
            this.setState({ currentItem: -1 })
        })
    }

    componentWillUnmount() {
        this.refreshUI_VodList && this.refreshUI_VodList.remove();
    }

    _loadData() {
        let url = ZBJDomainName + "/api/getVideoFour?rid=" + ZBJ_rid    ///api/getVideo?rid=
        fetch(url).then((response) => {
            return response.json()
        }).then((responseJson) => {
            this.setState({ listData: responseJson.data.reverse() })
        }).catch((error) => {

        });
    }
    _playVodFunction(data, status, item) {
        if (status == '回看') {
            if (status == '回看') { this.setState({ currentItem: item.index }) }
            DeviceEventEmitter.emit('refreshUI_LessionPlan', false);

            this.props.onPressPlayVod(data, status)
        }
    }
    _renderItem = (item) => {
        let data = item.item;
        let year = ShareSetting.getTime(data.recordStartTime, "year")
        let time = ShareSetting.getTime(data.recordStartTime, "time")
        let yearandtime = year + time
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 26,
                paddingBottom: 26,
                marginLeft: 10,
                marginRight: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5E5'
            }}>
                {baseStyle.width <= 320 && baseStyle.height <= 568
                    ?
                    <View>
                        <Text style={{ fontSize: 13, color: '#666666' }}>{year}</Text>
                        <Text style={{ fontSize: 13, color: '#666666' }}>{time}</Text>
                    </View>
                    :
                    <Text style={{ fontSize: 13, color: '#666666' }}>{yearandtime}</Text>
                }
                <Text style={{ fontSize: 13, color: '#666666', marginLeft: 25 }}>{data.teacher_name}</Text>
                <Text style={{ fontSize: 13, color: '#666666', marginLeft: data.teacher_name.length == 2 ? 38 : 25 }}>{data.title}</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => {
                        this._playVodFunction(data, '回看', item)
                    }}>
                        <View style={{
                            borderColor: '#F92400',
                            borderWidth: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 24,
                            width: 50,
                            backgroundColor: this.state.currentItem == item.index ? '#F92400' : '#FFFFFF'
                        }}>
                            <Text style={{ fontSize: 13, color: this.state.currentItem == item.index ? '#FFFFFF' : '#F92400' }}>
                                {this.state.currentItem == item.index ? "播放中" : "回看"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    renderFooter = () => {
        return (
            <View style={{ height: 80, width: baseStyle.width, borderColor: "#FFFFFF" }} />

        )
    }
    render() {
        return (
            <FlatList
                style={{ flex: 1 }}
                ref={(flatList) => this._flatList = flatList}
                renderItem={this._renderItem}
                refreshing={false}
                showsVerticalScrollIndicator={false}
                data={this.state.listData}
                ListFooterComponent={this.renderFooter()}
            />
        )
    }
}