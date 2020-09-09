/**
 *
 *视频解盘(视频直播间)/老师简介列表
 *
 * */
import React, { Component } from "react";
import { FlatList, Image, Platform, Text, TouchableOpacity, View } from "react-native";
import * as baseStyle from '../../../../components/baseStyle';
import { pushForParams } from "../../../../modules/NavigationInterface";

export default class AboutTeacher extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listData: []
        }
        this._renderItem = this._renderItem.bind(this);
    }

    componentWillMount() {
        let url = ZBJDomainName + "/api/teaminfo?rid=" + ZBJ_rid
        fetch(url).then((response) => {
            return response.json()
        }).then((responseJson) => {
            this.setState({ listData: responseJson.data })
        }).catch((error) => {
            //console.log('请求网络数据错误', error);
        });
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    _itemClicked(item) {
        this.props.stopVideo();
        pushForParams(this.props.navigation, 'TeacherDetailPage', { playVideo: this.props.playVideo, path: item.item.tel_path });
    }
    _renderItem(item) {
        let data = item.item;
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { this._itemClicked(item) }}>
                <View style={{
                    marginLeft: 14,
                    marginRight: 18,
                    flexDirection: 'row',
                    backgroundColor: '#F4F4F4',
                    marginTop: 10
                }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ width: 73, height: 73, margin: 12 }} source={{ uri: data.head }} />
                    </View>
                    <View style={{ flex: 1, marginTop: 18 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 15, color: '#333333', fontWeight: '900' }}>{data.nickname}</Text>
                            <Text style={{ fontSize: 12, color: '#333333', marginLeft: 11 }}>{data.position}</Text>
                        </View>
                        <View style={{ flex: 1, marginRight: 12, marginTop: 11, marginBottom: 9 }}>
                            <Text style={{ fontSize: 12, color: '#666666' }}>{data.remark}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    render() {
        return (
            <FlatList
                style={{ flex: 1, marginBottom: baseStyle.isIPhoneX ? 34 : 0 }}
                ref={(flatList) => this._flatList = flatList}
                renderItem={this._renderItem}
                refreshing={false}
                showsVerticalScrollIndicator={false}
                getItemLayout={(data, index) =>
                    ({ length: 60, offset: Platform.OS == 'android' ? 100 : 100, index }) // 解决底部空白问题
                }
                data={this.state.listData}
            />
        );
    }
}