/**
 * Created by cuiwenjuan on 2017/9/14.
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Platform,
    SectionList,
    StyleSheet,
} from 'react-native';

import PageHeader from '../../components/NavigationTitleView'
import { toast } from '../../utils/CommonUtils'
import YDActivityIndicator from '../../components/YDActivityIndicator'
import { commonUtil } from '../../utils/CommonUtils'
import * as baseStyle from '../../components/baseStyle'
import RATE, { LINE_HEIGHT, LINE_SPACE } from '../../utils/fontRate.js';
import BaseComponent from '../BaseComponentPage';
import LoginButton from '../login/LoginButton'


var headName;
var imageWidth = commonUtil.width / 4;


class ChangeHeaderPage extends BaseComponent {

    constructor(props) {
        super(props);
        headName = undefined;
        this.state = {
            appModel: null,
            groupsModel: null,
            dataSource: null,
            animating: false,
            isBack: false,

        }

    }

    componentWillMount() {
        super.componentWillMount();

    }
    //Component挂载完毕后调用
    componentDidMount() {
        super.componentDidMount();
        //计算默认头像的位置
        // console.log("bendi=",UserInfoUtil.getUserHeader())
       // let   imageName = i > 0 ? 'header_woman' : 'header_man';
        let imageDefault = UserInfoUtil.getUserHeader();
        let sectionID , rowID  ;
        if(imageDefault.substring(0,imageDefault.length-1)==="header_man"){
            sectionID = 0;
            switch (imageDefault.substring(imageDefault.length-1,imageDefault.length)){
                case '0':
                    rowID = 0;
                    break;
                case '1':
                    rowID = 1;
                    break;
                case '2':
                    rowID = 2;
                    break;
                case '3':
                    rowID = 3;
                    break;
            }
        }else if(imageDefault.substring(0,imageDefault.length-1)==="header_woman"){
            sectionID = 1;
            switch (imageDefault.substring(imageDefault.length-1,imageDefault.length)){
                case '0':
                    rowID = 0;
                    break;
                case '1':
                    rowID = 1;
                    break;
                case '2':
                    rowID = 2;
                    break;
                case '3':
                    rowID = 3;
                    break;
            }
        }else {
            sectionID=0;
            rowID = 0;
        }
        this.myGetData(sectionID,rowID);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    onBack() {
        Navigation.pop(this.props.navigation);
        this.setState({ isBack: true })
    }
    //上传图片
    changeUserHeader() {

        const { netConnected, stateUserInfo } = this.props;
        if (!netConnected.netConnected) {
            toast('网络错误，请检查网络');
            return;
        }

        if (!headName) {
            toast('请先选中头像');
            return;
        }

        const { changeUserInfo } = this.props.userInfo;

        let param = { 'avatar': headName, 'username': stateUserInfo.userInfo.username };
        this.setState({ animating: true });
        changeUserInfo(param,
            (success) => {
                this.setState({ animating: false });
                toast('头像修改成功', () => {
                    !this.state.isBack ? Navigation.pop(this.props.navigation) : null
                });
            },
            (error) => {
                this.setState({ animating: false });
                toast('头像修改失败');

            });
    }

    myGetData(sectionID, rowID) {

        let headerImage = '';
        var dataBlob = ['男', '女'];

        let data = [];
        let imageName = 'headerMan';
        for (let i = 0; i < 2; i++) {
            imageName = i > 0 ? 'header_woman' : 'header_man';

            let row = [];
            for (let j = 0; j < 4; j++) {

                let image = imageName + (j);
                let headerData = { image: image, selected: false };
                if (sectionID === i && rowID === j) {
                    headerData = { image: image, selected: true };
                    headerImage = image;
                }
                row.push(headerData);
            }
            data.push({ data: [row], key: dataBlob[i], sectionID: i });

        }

        this.setState({
            dataSource: data
        });

        return headerImage;
    }

    _renderItem = ({ item, section }) => (

        <View style={styles.list}>
            {
                item.map((item, i) => this.renderExpenseItem(item, i, section))
            }
        </View>

    );


    onPress(item, sectionID, rowID) {
        headName = this.myGetData(sectionID, rowID);
    }

    renderExpenseItem(item, i, section) {
        let imageTop;
        let viewHeight = { height: commonUtil.rare(180) };
        let selectedImage = { right: -commonUtil.rare(0), top: -commonUtil.rare(0) };

        let rowNumber = i / 4;
        //console.log("哈哈哈哈哈",item.selected)
        return <View style={[{
            justifyContent: 'center',
            margin: commonUtil.rare(0),
            width: imageWidth,
            alignItems: 'center',
            // backgroundColor:'#8dff36',
            // borderLeftColor: '#0f0',
            // borderLeftWidth: 1,
            // borderRightColor: '#ff0',
            // borderRightWidth: 1,
        }, viewHeight]}>
            <TouchableOpacity activeOpacity={1}
                onPress={() => this.onPress(item, section.sectionID, i)}>
                <Image source={{ uri: item.image }}
                    style={[
                        {
                            width: commonUtil.rare(125),
                            height: commonUtil.rare(125),
                            borderRadius: commonUtil.rare(125 / 2),
                            // backgroundColor:'#ffad92'
                        },
                        imageTop
                    ]} />
                {
                    item.selected ?
                        <Image style={[{ position: 'absolute' }, selectedImage]}
                            source={require('../../images/userCenter/uc_header_se.png')} /> : null
                }
                {/*{*/}
                {/*item.selected ? <Text></Text> : null*/}
                {/*}*/}

            </TouchableOpacity>
        </View>
    }


    _renderSectionHeader = ({ section }) => (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: baseStyle.LINE_BG_F6,
            height: commonUtil.rare(88),
            width: commonUtil.width
        }}>
            <Text style={{
                marginLeft: commonUtil.rare(30),
                fontSize: RATE(32),
                color: baseStyle.BLACK_70
            }}> {section.key} </Text>
        </View>
    );

    _extraUniqueKey(item, index) {
        return "index" + index + item;
    }

    render() {
        if (!this.state.dataSource) {
            return (
                <View></View>
            );
        }

        let rightView =
            <TouchableOpacity onPress={() => this.changeUserHeader()}
                style={{
                    width: 55,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    // backgroundColor:'#8dff36',
                }}>
                <Text
                    style={{
                        color: '#ff1e6a', textAlign: 'left',
                        fontSize: RATE(32),
                    }}>确认</Text>
            </TouchableOpacity>


        return (
            <BaseComponent style={{ flex: 1 }}>

                <PageHeader onBack={() => this.onBack()}
                            navigation={this.props.navigation} titleText={'修改头像'} />

                <View style={{ backgroundColor: '#fff' }}>

                    <SectionList
                        scrollEnabled={false}
                        renderItem={this._renderItem}
                        renderSectionHeader={this._renderSectionHeader}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={this._extraUniqueKey}// 每个item的key
                        sections={ // 不同section渲染相同类型的子组件
                            this.state.dataSource
                        }

                    />

                </View>
                <View style={{margin:15}}>
                    <LoginButton style={{ marginTop: commonUtil.rare(0) }}
                                 onPress={() => this.changeUserHeader()}
                                 titleButton={'保存'} />

                </View>

                <YDActivityIndicator animating={this.state.animating} />
            </BaseComponent>
        );
    }

}


const styles = StyleSheet.create({
    list: {
        //justifyContent: 'space-around',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF'
    },
});

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserInfoAction from '../../actions/UserInfoAction'
import UserInfoUtil from "../../utils/UserInfoUtil";

export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
    netConnected: state.NetInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(ChangeHeaderPage)