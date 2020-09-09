/**
 *
 *视频解盘(视频直播间)/课程安排
 *
 */
import React, { Component } from "react";
import { DeviceEventEmitter, FlatList, Text, TouchableOpacity, View } from "react-native";
import Yd_cloud from '../../../../wilddog/Yd_cloud';
import * as baseStyle from '../../../../components/baseStyle';

export default class LessionPlan extends Component {
    constructor(props) {
        super(props)
        this.plan_Ref = Yd_cloud().ref(ZBJ_ydyun + 'classes')
        this.state = {
            listData: [],
            currentItem: -1,
            isLive: props.isLive
        }
        this._loadData = this._loadData.bind(this)
        this._playVodFunction = this._playVodFunction.bind(this)
    }

    componentWillMount() {
        this._loadData()
        this.refreshUI_LessionPlan = DeviceEventEmitter.addListener('refreshUI_LessionPlan', (e) => {
            this.setState({ isLive: e, currentItem: -1 })
        })
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        this.plan_Ref && this.plan_Ref.off('value', () => { });
        this.refreshUI_LessionPlan && this.refreshUI_LessionPlan.remove();
    }

    detailPlan(snap) {
        if (snap.success) {
            let values = Object.values(snap.nodeContent)
            this.setState({ listData: values })
        }
    }

    _loadData() {
        this.plan_Ref.orderByKey().get((snap) => {
            this.detailPlan(snap)
        })
        this.plan_Ref.on('value', (snap) => {
            this.plan_Ref.orderByKey().get((snap) => {
                this.detailPlan(snap)
            })
        })
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
                ListFooterComponent={this.renderFooter}
            >
            </FlatList>

        );
    }
    renderFooter = () => {
        return (
            <View style={{ height: 80, width: baseStyle.width, borderColor: "#FFFFFF" }} />
        );
    }

    _renderItem = (item) => {
        let data = item.item;
        let status = ''
        if (data.status == 1) {
            status = '解盘中';
        } else if (data.status == 2) {
            status = '未开始';
        } else if (data.status == 3) {
            status = '结束';
        } else {
            status = '结束';
        }
        let nickname = data.nickname || '';
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 19,
                paddingBottom: 19,
                marginLeft: 15,
                marginRight: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5E5'
            }}>
                <Text style={{ fontSize: baseStyle.width <= 320 && baseStyle.height <= 568 ? 9 : 12, color: '#666666' }}>{data.start + ' - ' + data.end}</Text>
                <Text style={{ fontSize: baseStyle.width <= 320 && baseStyle.height <= 568 ? 11 : 13, color: '#666666', marginLeft: baseStyle.width <= 320 && baseStyle.height <= 568 ? 12 : 22 }}>{data.nickname}</Text>
                <Text style={{ fontSize: baseStyle.width <= 320 && baseStyle.height <= 568 ? 11 : 13, color: '#666666', marginLeft: nickname.length == 2 ? 30 : 15 }}>{data.title}</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => {
                        this._playVodFunction(data, status, item)
                    }}>
                        <View style={{
                            borderColor: (status == '解盘中') ? '#F92400' : (status == '结束' ? '#CFCFCF' : '#008DF8'),
                            borderWidth: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 24,
                            width: 50,
                            backgroundColor: status == '解盘中' ? ((this.state.currentItem != -1 && this.state.currentItem == item.index) || (this.state.isLive && status == '解盘中') ? '#F92400' : '#FFFFFF') : (status == '结束' ? '#CFCFCF' : '#FFFFFF')
                        }}>
                            <Text style={{ fontSize: 12, color: status == '解盘中' ? ((this.state.currentItem != -1 && this.state.currentItem == item.index) || (this.state.isLive && status == '解盘中') ? '#FFFFFF' : '#F92400') : (status == '结束' ? '#FFFFFF' : '#008DF8') }}>
                                {status}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    _playVodFunction(data, status, item) {
        if (status == '解盘中') {
            this.setState({ currentItem: item.index, isLive: true })
            DeviceEventEmitter.emit('refreshUI_VodList', false);
            this.props.onPressPlayVod(data, status)
        }
    }
}