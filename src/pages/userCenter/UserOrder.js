/**
 * Created by cuiwenjuan on 2019/7/31.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as cyRef from '../../actions/CYCommonUrl';
import * as UserInfoAction from '../../actions/UserInfoAction';
import * as baseStyle from '../../components/baseStyle';
import HXGLargeList from '../../components/HXGLargeList';
import PageHeader from '../../components/NavigationTitleView';
import ShareSetting from '../../modules/ShareSetting';
import { commonUtil } from '../../utils/CommonUtils';
import UserInfoUtil from '../../utils/UserInfoUtil';
import Yd_cloud from '../../wilddog/Yd_cloud';
import BaseComponent from '../BaseComponentPage';
import NoDataPage from '../NoDataPage';


// let refPath = Yd_cloud().ref('/cem/test/zorders/13131126858');
// let refPath = Yd_cloud().ref(cyRef.userOrderRef + 'zorders/13131126858');





// 刷新状态枚举
export const orderStatus = {
    daiFK: '待付款',
    daiFWK: '待付尾款',
    daiCP: '待测评',
    daiSJQR: '待商家确认',
    daiKFHF: '待客服回访',
    daiKT: '待开通',
    fuWZ: '服务中',
    yiDQ: '已到期',
    yiTK: '已退款',
    yiSJ: '已升级',
    dingDGB: '订单关闭',
};

// 刷新状态枚举
export const orderType = {
    toBePaid: '待支付',//待支付
    haveToPay: '已支付',//已支付
    hasBeenCancel: '已取消',//已取消
};

//备注信息
export const noteString = {
    exitProduct: '已退订产品',
    exitDeposit: '已退预交定金',
    haveUpgrade: '已升级，该服务暂停',
}

//按钮状态
export const buttonStatus = {
    all: 0,
    toBePaid: 1,
    haveToPay: 2,
    hasBeenCancel: 3
}

let buttonS = ['全部', '待支付', '已支付', '已取消'];

class UserOrder extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            toBePaidDatas: [],
            haveToPayDatas: [],
            hasBeenCancelDatas: [],
            buttonStatus: buttonStatus.all,
        }
       // this.refPath = Yd_cloud().ref(cyRef.userOrderRef + 'zorders/' + UserInfoUtil.getUserName());
        this.refPath = Yd_cloud().ref(cyRef.userOrderRef + 'zorders/' + UserInfoUtil.getUserInfo().phone);
        this.fiveStartNumber = 50;
        this.firstKey = "";
    }

    componentDidMount() {
        super.componentWillMount();
        this._firstLoadMessage();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    onBack() {
        Navigation.pop(this.props.navigation);
    }


    _analyticalData(orderData) {

        //catid = 70 是慧选股的订单
        if (orderData.catid.toString() !== '70') {
            return undefined;
        }

        let orderT = undefined;
        let orderS = undefined;
        let orderNote = undefined;
        // orderNote = '测试测试测试测试';
        if(orderData.fw_status!=undefined){
            switch (orderData.fw_status+"") {
                case "0":
                    orderT = orderType.hasBeenCancel;//已取消
                    orderS = orderStatus.yiDQ;//已到期
                    break;
                case "1":
                    orderT = orderType.hasBeenCancel;//已取消
                    orderS = orderStatus.dingDGB;//已到期
                    break;
                case "2":
                    orderNote = noteString.exitProduct;//已退订产品
                    orderT = orderType.hasBeenCancel;//已经取消
                    orderS = orderStatus.yiSJ;//已经升级
                    break;
                case "3":
                    orderNote = noteString.exitDeposit;//已退订产品
                    orderT = orderType.hasBeenCancel;//已经取消
                    orderS = orderStatus.yiTK;//已经退款
                    break;
                case "4":
                    orderNote = noteString.haveUpgrade;//已升级，该服务暂停
                    orderT = orderType.hasBeenCancel;//已经取消
                    orderS = orderStatus.yiTK;//已经退款
                    break;
                default:
                    break;
            }
        }else {
            switch (orderData.orders_status) {
                case 1:
                    orderT = orderType.toBePaid;//待支付
                    orderS = orderStatus.daiFK;//待付款
                    break;
                case 2:
                    orderT = orderType.toBePaid;//待支付
                    orderS = orderStatus.daiFWK;//待付尾款
                    break;
                case 3:
                    orderT = orderType.haveToPay;//已支付
                    orderS = orderStatus.daiSJQR;//待商家确认
                    break;
                case 4:
                    orderT = orderType.toBePaid;//待支付
                    orderS = orderStatus.daiCP;//待测评
                    break;
                case 5:
                    orderT = orderType.haveToPay;//已支付
                    orderS = orderStatus.daiKFHF;//待客服回访
                    break;
                case 6:
                    orderT = orderType.haveToPay;//已支付
                    orderS = orderStatus.daiKT;//待开通
                    break;
                case 7:
                    orderT = orderType.haveToPay;//已支付
                    orderS = orderStatus.fuWZ;//服务中
                    break;
                default:
                    break;
            }
        }

       //orderType
        // toBePaid: '待支付',//待支付
        //     haveToPay: '已支付',//已支付
        //     hasBeenCancel: '已取消',//已取消

        //orderStatus
        // daiFK: '待付款',
        //     daiFWK: '待付尾款',
        //     daiCP: '待测评',
        //     daiSJQR: '待商家确认',
        //     daiKFHF: '待客服回访',
        //     daiKT: '待开通',
        //     fuWZ: '服务中',
        //     yiDQ: '已到期',
        //     yiTK: '已退款',
        //     yiSJ: '已升级',
//==================================================================================================================
//         switch (orderData.orders_status) {
//             case 1:
//                 orderT = orderType.toBePaid;//待支付
//                 orderS = orderStatus.daiFK;//待付款
//                 break;
//             case 2:
//                 orderT = orderType.toBePaid;//待支付
//                 orderS = orderStatus.daiFWK;//待付尾款
//                 break;
//             case 3:
//                 orderT = orderType.haveToPay;//已支付
//                 orderS = orderStatus.daiSJQR;//待商家确认
//                 break;
//             case 4:
//                 orderT = orderType.toBePaid;//待支付
//                 orderS = orderStatus.daiCP;//待测评
//                 break;
//             case 5:
//                 orderT = orderType.haveToPay;//已支付
//                 orderS = orderStatus.daiKFHF;//待客服回访
//                 break;
//             case 6:
//                 orderT = orderType.haveToPay;//已支付
//                 orderS = orderStatus.daiKT;//待开通
//                 break;
//             case 7:
//                 orderT = orderType.haveToPay;//已支付
//                 orderS = orderStatus.fuWZ;//服务中
//                 break;
//             default:
//                 break;
//         }
//==================================================================================================================
        //如果订单是已经支付的状态
        //orderType
        // toBePaid: '待支付',//待支付
        //     haveToPay: '已支付',//已支付
        //     hasBeenCancel: '已取消',//已取消
        //备注信息
        // export const noteString = {
        //     exitProduct: '已退订产品',
        //     exitDeposit: '已退预交定金',
        //     haveUpgrade: '已升级，该服务暂停',
        // }
        //// 刷新状态枚举
        // export const orderStatus = {
        //     daiFK: '待付款',
        //     daiFWK: '待付尾款',
        //     daiCP: '待测评',
        //     daiSJQR: '待商家确认',
        //     daiKFHF: '待客服回访',
        //     daiKT: '待开通',
        //     fuWZ: '服务中',
        //     yiDQ: '已到期',
        //     yiTK: '已退款',
        //     yiSJ: '已升级',
        // };
        //==================================================================================================================
        // if (orderT === orderType.haveToPay) {
        //     switch (orderData.fw_status) {
        //         case 0:
        //             orderT = orderType.hasBeenCancel;//已取消
        //             orderS = orderStatus.yiDQ;//已到期
        //             break;
        //         case 1:
        //             orderT = orderType.hasBeenCancel;//已取消
        //             orderS = orderStatus.yiDQ;//已到期
        //             break;
        //         case 2:
        //             orderNote = noteString.exitProduct;//已退订产品
        //             orderT = orderType.hasBeenCancel;//已经取消
        //             orderS = orderStatus.yiSJ;//已经升级
        //             break;
        //         case 3:
        //             orderNote = noteString.exitDeposit;//已退订产品
        //             orderT = orderType.hasBeenCancel;//已经取消
        //             orderS = orderStatus.yiTK;//已经退款
        //             break;
        //         case 4:
        //             orderNote = noteString.haveUpgrade;//已升级，该服务暂停
        //             orderT = orderType.hasBeenCancel;//已经取消
        //             orderS = orderStatus.yiTK;//已经退款
        //             break;
        //         default:
        //             break;
        //     }
        //
        // }

        if (orderT !== undefined) {
            orderData.orderType = orderT; //订单状态
        }

        if (orderS !== undefined) {
            orderData.orderStatus = orderS; //订单退款还是升级的状态
        }

        if (orderNote !== undefined) {
            orderData.orderNote = orderNote;//订单备注
        }
        return orderData;
    }

    _loadMessage(callBack) {
        var pg = this;

        this.refPath.orderByKey().endAt(this.firstKey).limitToLast(this.fiveStartNumber + 1).get((snapshot) => {
            // console.log('活动中心 === loadMore',JSON.stringify(snapshot.nodeContent));
            if (snapshot.nodeContent) {
                let keys = Object.keys(snapshot.nodeContent);
                if (keys.length > 1) {
                    var toDropKey = pg.firstKey;
                    pg.firstKey = "";

                    let messageArray = [];
                    let dataSourceArray = Array.from(this.state.dataSource);
                    let messageS = snapshot.nodeContent;
                    // console.log('消息 === ',JSON.stringify(snapshot));
                    for (let keyIndex in messageS) {
                        if (toDropKey !== "") {
                            if (keyIndex === toDropKey) {
                                continue;
                            }
                        }
                        if (pg.firstKey === "") pg.firstKey = keyIndex;

                        let messageData = this._analyticalData(messageS[keyIndex]);
                        if (messageData) {
                            let banner = { data: messageData, _key: keyIndex }
                            messageArray.push(banner);
                        }
                    }

                    // console.log('消息 === dataSourceArray', JSON.stringify(messageArray));
                    Array.prototype.push.apply(dataSourceArray, messageArray.reverse());

                    this.setState({
                        dataSource: dataSourceArray,
                    });
                    callBack && callBack()
                } else {
                    callBack && callBack(true)
                }
            } else {
                callBack && callBack(true)
            }
        })
    }


    _firstLoadMessage(callBack) {
        var pg = this;
        this.refPath.orderByKey().limitToLast(this.fiveStartNumber).get((snapshot) => {
            if (snapshot.nodeContent) {
                pg.firstKey = "";
                let messageArray = [];
                let messageS = snapshot.nodeContent
                // console.log('活动中心 === ',JSON.stringify(snapshot.nodeContent));

                for (let keyIndex in messageS) {
                    if (pg.firstKey === "") pg.firstKey = keyIndex;

                    let messageData = this._analyticalData(messageS[keyIndex]);
                    if (messageData) {
                        let banner = { data: messageData, _key: keyIndex }
                        messageArray.push(banner);
                    }
                }

                // console.log('消息 === message',JSON.stringify(messageArray));
                this.setState({
                    dataSource: messageArray.reverse(),
                });
                callBack && callBack();
            } else {
                callBack && callBack();
            }
        })
    }




    /**
     *创建cell
     */
    renderCell(item, index) {

        if (!item.data) {
            return null;
        }

        let messageData = item.data;
        let orderS = messageData.orderStatus;
        let orderID = messageData.orderid;
        let pidName = messageData.pname;
        let startTime = messageData.fwstart ? ShareSetting.getDate(messageData.fwstart*1000, '年') : '--';
        let endTime = messageData.fwend ? ShareSetting.getDate(messageData.fwend*1000, '年') : '--';
        let price = messageData.price;
        let received = messageData.amount_received ? messageData.amount_received : 0;//实际付款金额

        let orderStatusColor = baseStyle.BLUE_3399FF;
        let orderT = messageData.orderType;
        if (orderT === orderType.haveToPay) {
            orderStatusColor = baseStyle.ORANGE_FF9933;
        } else if (orderT === orderType.hasBeenCancel) {
            orderStatusColor = baseStyle.BLACK_000000_40;
        }

        let orderNote = messageData.orderNote;
        let tuikuanjine = undefined

        return (
            <View style={styles.itemViewStyle}>
                <View style={{
                    height: 39,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingRight: 10,
                    paddingLeft: 10,
                }}>
                    <Text style={{
                        color: orderStatusColor,
                        fontSize: 20,
                    }}>{orderS}</Text>
                    <Text style={{
                        color: baseStyle.BLACK_000000_40,
                        fontSize: 12,
                    }}>{'订单号:' + orderID}</Text>

                </View>

                <View style={{
                    height: 94,
                    justifyContent: 'center',
                    paddingRight: 17,
                    paddingLeft: 10,
                    borderBottomWidth: 1,
                    borderColor: baseStyle.BLACK_000000_10,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    marginLeft: -1,
                    marginRight: -1,
                }}>
                    <View style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        marginBottom: 14
                    }}>
                        <Text style={{ color: baseStyle.BLACK_000000_80, fontSize: 14 }}>{pidName}</Text>
                        <Text style={{ color: baseStyle.BLACK_000000_80, fontSize: 14 }}>{'￥' + price}</Text>
                    </View>
                    <Text style={{ color: baseStyle.BLACK_000000_60, fontSize: 12, marginBottom: 5 }}>{'开始时间：' + startTime}</Text>
                    <Text style={{ color: baseStyle.BLACK_000000_60, fontSize: 12 }}>{'结束时间：' + endTime}</Text>
                </View>
                <View style={{
                    justifyContent: 'center',
                    height: 44,
                    alignItems: 'flex-end',
                    paddingRight: 10,
                }}>
                    <Text style={{
                        fontSize: 15,
                        color: baseStyle.BLUE_HIGH_LIGHT
                    }}>{'实付金额：￥' + received}</Text>

                </View>

                {
                    orderNote && <View style={{
                        height: 35,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'row',
                        paddingRight: 10,
                        paddingLeft: 10,
                        borderColor: baseStyle.BLACK_000000_10,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        margin: -1,
                    }}>
                        <Text style={{ color: baseStyle.BLACK_000000_80, fontSize: 14 }}>{tuikuanjine ? '退款金额' + tuikuanjine : ''}</Text>
                        <Text style={{ color: baseStyle.BLACK_000000_80, fontSize: 14 }}>{'备注：' + orderNote}</Text>
                    </View>
                }

            </View>
        )
    }


    /**
     * 空布局
     */
    _createEmptyView() {
        return (
            <NoDataPage content={'您现在没有任何订单'}
                isNoShow={true} />
        );
    }


    _getRowHeight(item) {
        let rowHeight = 188;
        let row = item.row;
        let message = this.state.dataSource[row];

        let messageDate = message.data;
        if (messageDate.orderNote) {
            rowHeight = rowHeight + 35;
        }
        return rowHeight;
    }

    _onPress(index) {
        this.setState({ buttonStatus: index });
    }

    _itemView(info, index) {
        let fontColor = baseStyle.BLACK_000000_40;
        if (this.state.buttonStatus === index) {
            fontColor = baseStyle.BLUE_HIGH_LIGHT;
        }

        return (
            <View style={{ flex: 1 }} key = {index}>
                <TouchableOpacity
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this._onPress(index)}
                >
                    <Text
                        style={{
                            color: fontColor,
                            fontSize: 14,
                        }}
                    >{info}</Text>
                </TouchableOpacity>

            </View>
        )
    }

    _returnNewData() {
        let messages = [];
        let toBePaid = [];
        let haveToPay = [];
        let hasBeenCancel = [];
        if (this.state.buttonStatus === buttonStatus.all) {
            messages = this.state.dataSource;
        } else {
            this.state.dataSource.map((info, index) => {
                let messageData = info.data;
                let orderT = messageData.orderType;
                if (orderT === orderType.toBePaid) {
                    toBePaid.push(info)
                } else if (orderT === orderType.haveToPay) {
                    haveToPay.push(info)
                } else if (orderT === orderType.hasBeenCancel) {
                    hasBeenCancel.push(info)
                }

            })

            if (this.state.buttonStatus === buttonStatus.toBePaid) {
                messages = toBePaid;
            } else if (this.state.buttonStatus === buttonStatus.haveToPay) {
                messages = haveToPay;
            } else if (this.state.buttonStatus === buttonStatus.hasBeenCancel) {
                messages = hasBeenCancel;
            }
        }

        return messages;

    }


    render() {
        // let messages = this.state.dataSource;
        let messages = this._returnNewData();

        return <BaseComponent style={{ flex: 1 }}>
            <PageHeader
                onBack={() => this.onBack()} navigation={this.props.navigation} titleText={'我的订单'} />
            <View style={{ flexDirection: 'row', height: 30 }}>
                {
                    buttonS.map((info, index) => (
                        this._itemView(info, index)
                    ))
                }
            </View>
            {messages.length > 0 ?
                <HXGLargeList
                    // style={{backgroundColor:baseStyle.BLACK_000000_10}}
                    data={messages}
                    renderItem={this.renderCell.bind(this)}
                    heightForIndexPath={(item) => this._getRowHeight(item)}
                    onLoading={(callBack) => this._loadMessage(callBack)}
                    onRefresh={(callBack) => this._firstLoadMessage(callBack)}
                />
                :
                this._createEmptyView()
            }
        </BaseComponent>

    }

}


var styles = StyleSheet.create({
    itemViewStyle: {
        marginRight: 6,
        marginLeft: 6,
        marginTop: 10,
        backgroundColor: "#fff",
        // height:178,
        borderRadius: 5,
        overflow: 'hidden',
        width: commonUtil.width - 12
    },
});




export default connect((state) => ({
    stateUserInfo: state.UserInfoReducer,
}),
    (dispatch) => ({
        userInfo: bindActionCreators(UserInfoAction, dispatch)
    })
)(UserOrder)