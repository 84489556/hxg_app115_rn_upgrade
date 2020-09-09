/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/5 17
 * description:涨停炸板模块板块分析tab
 */
import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    DeviceEventEmitter,
    Platform,
    ActivityIndicator
} from 'react-native';
import * as ScreenUtil from "../../../utils/ScreenUtil";
import { StickyForm } from "react-native-largelist-v3";
import Yd_cloud from "../../../wilddog/Yd_cloud";
import AsyncStorage from '@react-native-community/async-storage';
import { mNormalHeader } from "../../../components/mNormalHeader";
import { mRiskTipsFooter } from "../../../components/mRiskTipsFooter";
let refHXG = Yd_cloud().ref(MainPathYG);
let DataRquest = refHXG.ref('ztzb/sector/list');
let todayUpNow = refHXG.ref('ztzb/sector/list');
export default class SectorAnalysis extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            data: [
                {
                    sectionTitle: "",
                    items: []
                }
            ],
            //title传入一个conCode ,-1表示不需要排序，0表示默认状态，1表示降序，2表示升序
            titles: [
                { conName: "领涨个股", conCode: -1 }, //默认涨停
                { conName: "涨停", conCode: 1 },
                { conName: "炸板", conCode: -1 },
                { conName: "自然涨停", conCode: -1 },

            ],
            allLoaded: false,//判断是否还有更多数据，true有,false无
        };
        this.pageKey = "";//记录的key

        this.pageSize = 20;//默认每次请求60条数据
        this.firstEnter = true;
        //表格相关数据
        this.ITEM_HEGHT = ScreenUtil.scaleSizeW(126);
        this.HEADER_HEGHT = 35;//LockView锁定的View的高度
    }

    /**
     * 页面将要加载
     * */
    componentWillMount() {

    }

    /**
     * 页面加载完成
     * */
    componentDidMount() {
        this.getListData();
        this.addPageListener();
        this.addListListeners();

    }

    addPageListener() {
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            () => {
                //判断页面是否是展示在屏幕上的
                AsyncStorage.getItem('main_index', (error, resultMain) => {
                    if (error) {
                    } else {
                        AsyncStorage.getItem('db_child_index', (error, result) => {
                            if (error) {
                            } else {
                                let mainObj = JSON.parse(resultMain);
                                let childObj = JSON.parse(result);
                                if (mainObj && childObj) {
                                    if (mainObj.mainPosition == 3 && childObj.indexPosition == 0) {
                                        this.addListListeners();
                                    }
                                }
                            }
                        })
                    }
                })
            }
        );
        this.willBlurSubscription = this.props.navigation.addListener(
            'willBlur',
            () => {
                this.offListener();
            }
        );
        //页面tab切换监听
        /**
         * 注册选股页面tab切换通知，不在当前页面取消监听
         * obj 里面参数0，1，2 当前tab为 0
         * */
        this.dbTabChange = DeviceEventEmitter.addListener('DB_TAB_CHANGE', (obj) => {
            if (obj != 0) {
                this.offListener();
            } else if (obj == 0) {
                this.addListListeners();
            }
        });

        /**
         * 注册APPMAINtab切换通知，
         * obj 里面参数0，1，2 ,3当前tab为 4选股
         * */
        this.appMainTabChange = DeviceEventEmitter.addListener('MAIN_TAB_CHANGE', (obj) => {
            // console.log("切换进入解除监听")
            if (obj != 3) {
                this.offListener();
            } else {
                AsyncStorage.getItem('db_child_index', (error, result) => {
                    if (error) {

                    } else {
                        let childObj = JSON.parse(result);
                        if (childObj && childObj.indexPosition === 0) {
                            //如果切换页面回来，childtabIndex为涨停炸版，则刷新页面
                            this.getRefresh();
                            this.addListListeners();
                        }
                    }
                })
            }
        });
    }

    /**
     * 获取板块分析数据
     * */
    getListData() {
        if (this.pageKey === "") {
            if (this.state.titles[1].conCode === 1) {
                DataRquest.orderByKey().limitToFirst(this.pageSize).get((response) => {
                    this._list.endLoading();
                    // console.log("节点不存在的时候",response);
                    //只要请求成功 firstEnter设置为false,防止第一次进入，空布局闪动问题
                    this.firstEnter = false;
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    } else {
                        // if(this.pageKey === ""){
                        //
                        // }
                        this.state.data[0].items = [];
                        this.setState({
                            data: this.state.data,
                            allLoaded: true,
                        });
                    }
                });
            } else if (this.state.titles[1].conCode === 2) {
                DataRquest.orderByKey().limitToLast(this.pageSize).get((response) => {
                    this._list.endLoading();
                    //只要请求成功 firstEnter设置为false,防止第一次进入，空布局闪动问题
                    this.firstEnter = false;
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    } else {
                        this.state.data[0].items = [];
                        this.setState({
                            data: this.state.data,
                            allLoaded: true,
                        });
                    }
                });
            }
        } else {
            if (this.state.titles[1].conCode === 1) {
                // console.log(this.pageKey)
                DataRquest.orderByKey().startAt(this.pageKey).limitToFirst(this.pageSize + 1).get((response) => {
                    this._list.endLoading();
                    //只要请求成功 firstEnter设置为false,防止第一次进入，空布局闪动问题
                    this.firstEnter = false;
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    }
                });
            } else if (this.state.titles[1].conCode === 2) {
                DataRquest.orderByKey().endAt(this.pageKey).limitToLast(this.pageSize + 1).get((response) => {
                    this._list.endLoading();
                    //只要请求成功 firstEnter设置为false,防止第一次进入，空布局闪动问题
                    this.firstEnter = false;
                    if (response.code == 0) {
                        this.dealDatas(response.nodeContent);
                    }
                });
            }
        }
    }
    /**
     * 监听列表的数据推送
     *
     * */
    addListListeners() {
        todayUpNow.on('value', (response) => {
            //console.log("监听节点的数据",response)
            if (response.code == 0) {
                let item = Object.values(response.nodeContent);
                let key = Object.keys(response.nodeContent);
                for (let i = 0; i < key.length; i++) {
                    item[i]['key'] = key[i];
                }
                //console.log("回来的列表");
                //console.log(item);
                //如果回来的数据,已经在列表中,就直接重新赋值,排序
                //如果回来的数据,不是列表中的数据,则直接添加到最后,然后排序

                if (item.length > 0) {
                    //深拷贝
                    let newCons = JSON.parse(JSON.stringify(this.state.data[0].items));
                    for (let i = 0; i < item.length; i++) {
                        //变量判断是否有这个股票,默认没有
                        let datasHave = false;
                        for (let j = 0; j < this.state.data[0].items.length; j++) {
                            if (item[i].indexCode === this.state.data[0].items[j].title.indexCode) {
                                //赋值
                                newCons[j].data[0] = item[i].leaderStockShortName + "&" + item[i].leaderStock;
                                newCons[j].data[1] = item[i].limitUpCounter;
                                newCons[j].data[2] = item[i].burstCounter;
                                newCons[j].data[3] = item[i].naturalLimitUpCounter;

                                datasHave = true;
                            }
                        }
                        //列表中没有
                        if (datasHave === false) {
                            let newItem = {};
                            //储存第一列需要的数据
                            let titles = {};
                            titles.sectorName = item[i].sectorName;
                            titles.indexCode = item[i].indexCode;
                            newItem.title = titles;

                            //数据项，一定要按照数据添加
                            let dataItem = [];
                            dataItem.push(item[i].leaderStockShortName + "&" + item[i].leaderStock);//&链接，后面切割
                            dataItem.push(item[i].limitUpCounter != null ? item[i].limitUpCounter : '- -');
                            dataItem.push(item[i].burstCounter ? item[i].burstCounter : '- -');
                            dataItem.push(item[i].naturalLimitUpCounter != null ? item[i].naturalLimitUpCounter : '- -');

                            newItem.data = dataItem;
                            newCons.push(newItem);
                        }
                    }

                    //数据加入或者替换完成后
                    let newSort;
                    //涨停炸版排序默认是index为2
                    if (this.state.titles[1].conCode === 1) {
                        newSort = newCons.sort(this.sortNumBigtoSmalls);
                    } else if (this.state.titles[1].conCode === 2) {
                        newSort = newCons.sort(this.sortNumSmalltoBigs);
                    }
                    if (newSort.length > this.state.data[0].items.length) {
                        newSort = newSort.slice(0, this.state.data[0].items.length)
                    }
                    //console.log("截取后的数据")
                    //console.log(newSort);

                    this.state.data[0].items = newSort;
                    this.setState({
                        data: this.state.data,
                    })
                }
            }
        });

    }
    /**
     * 关闭订阅的今天涨停家数
     * 因为只有最新的交易日，并且当前的一天,才可以关闭和监听节点
     * */
    offListener() {
        todayUpNow.off('value', (response) => {

        });
    }
    /**
     * 从小到大排序
     * 涨停时间
     * */
    sortNumSmalltoBigs(a, b) {
        return a.data.limitUpCounter - b.data.limitUpCounter;
    }

    /**
     * 从大到小排序
     * 涨停时间
     * */
    sortNumBigtoSmalls(a, b) {
        return b.data.limitUpCounter - a.data.limitUpCounter;
    }

    /**
     * 处理请求的数据
     * */
    dealDatas(nodeContent) {
        let item = Object.values(nodeContent);
        let key = Object.keys(nodeContent);
        for (let i = 0; i < key.length; i++) {
            item[i]['key'] = key[i];
        }

        //颠倒一下顺序
        if (this.state.titles[1].conCode === 1) {
            //删除第一个重复的元素
            if (this.pageKey !== "") {
                item.splice(0, 1);
            }
            //item.reverse();
        } else if (this.state.titles[1].conCode === 2) {
            //删除第一个重复的元素
            if (this.pageKey !== "") {
                item.splice(item.length - 1, 1);
            }
            item.reverse();
        }

        if (item.length > 0) {
            if (this.pageKey === "") {
                this.state.data[0].items = [];
            }
            //储存Key
            this.pageKey = item[item.length - 1].key;

            for (let i = 0; i < item.length; i++) {
                let newItem = {};
                //储存第一列需要的数据
                let titles = {};
                titles.sectorName = item[i].sectorName;
                titles.indexCode = item[i].indexCode;
                newItem.title = titles;

                //数据项，一定要按照数据添加
                let dataItem = [];

                dataItem.push(item[i].leaderStockShortName + "&" + item[i].leaderStock);//&链接，后面切割
                dataItem.push(item[i].limitUpCounter != undefined ? item[i].limitUpCounter : '- -');
                dataItem.push(item[i].burstCounter != undefined ? item[i].burstCounter : '- -');
                dataItem.push(item[i].naturalLimitUpCounter != null ? item[i].naturalLimitUpCounter : '- -');

                newItem.data = dataItem;
                this.state.data[0].items.push(newItem);
            }

            //console.log( this.state.data[0].items)
            //页数+1
            //this.pageNo+=1;
            //记录数据的条数
            //this.DATA_ITEM_LENGTH = this.state.data[0].items.length;
            this.setState({
                data: this.state.data,
                allLoaded: item.length < this.pageSize ? true : false,
            });

        } else {
            this.setState({
                data: this.state.data,
                allLoaded: true,
            });
        }
    }

    /**
     * 刷新数据
     * */
    getRefresh() {
        this.pageKey = "";
        this.getListData();
    }

    render() {
        return (
            <StickyForm
                bounces={true}
                style={{ backgroundColor: "#f6f6f6", flex: 1 }}
                contentStyle={{ alignItems: "flex-start", width: "125%" }}
                data={this.state.data}
                scrollEnabled={true}
                ref={ref => (this._list = ref)}
                heightForSection={() => this.HEADER_HEGHT}
                showsVerticalScrollIndicator={false}
                renderHeader={this._renderunLockHeader}
                renderSection={this._renderSection}
                heightForIndexPath={() => this.ITEM_HEGHT}
                renderIndexPath={this._renderItem}
                onRefresh={() => {
                    this.getRefresh();
                    setTimeout(() => this._list.endRefresh(), 1000);
                }}
                hotBlock={{ lock: "left", hotBlock: { x: 0, y: 0, width: 0, height: 0 } }}
                allLoaded={this.state.allLoaded}
                loadingFooter={mRiskTipsFooter}
                refreshHeader={mNormalHeader}
                renderFooter={this._renderMyFooters}
                renderEmpty={this.renderEmptys}
                showsHorizontalScrollIndicator={false}
                onLoading={() => { this.getListData(); }}
                headerStickyEnabled={false}
                directionalLockEnabled={true}
                onEndReached={(info) => { }}
                onScroll={({ nativeEvent: { contentOffset: { x, y } } }) => { }}
            />
        )
    }

    /**
     * 绘制空视图
     *
     * */
    renderEmptys = () => {
        if (this.firstEnter === true) {
            return (
                <View style={{ height: ScreenUtil.screenH - 200, flex: 1 }}>
                    <View style={{ width: ScreenUtil.screenW, height: ScreenUtil.screenH - 200, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={"gray"} />
                    </View>
                </View>
            )

        } else {
            return (
                <View style={{ height: this.HEADER_HEGHT + 600, flexDirection: "row" }}>
                    <View>
                        <View style={{ width: ScreenUtil.screenW, height: 600, backgroundColor: "#f6f6f6", alignItems: "center", justifyContent: "center" }}>
                            <Image style={{ width: ScreenUtil.scaleSizeW(254), height: ScreenUtil.scaleSizeW(222), resizeMode: "contain" }}
                                source={require('../../../images/TuyereDecision/no_stock_data.png')} />
                            <Text style={{
                                fontSize: ScreenUtil.setSpText(24), color: "rgba(0,0,0,0.4)",
                                marginTop: ScreenUtil.scaleSizeW(100)
                            }}>暂无股票入选</Text>
                        </View>
                    </View>
                </View>
            );
        }
    };
    /**
     * 顶部view的点击事件
     * */
    sortViewPress(index, conCode) {
        if (this.state.titles[index].conCode !== -1) {
            if (conCode === 0) {
                this.state.titles[index].conCode = 1;
            } else if (conCode === 1) {
                this.state.titles[index].conCode = 2;
            } else if (conCode === 2) {
                this.state.titles[index].conCode = 1;
            }
            this.firstEnter = true;
            this._list && this._list.scrollTo({ x: 0, y: 0 }, true).then(() => {
                this.setState({
                    titles: this.state.titles,
                }, () => {
                    //重置存储值
                    this.pageKey = "";
                    this.getListData();
                });
            })
        }
    }

    /**
     * 加载每一条
     * <Text style={{fontSize:ScreenUtil.scaleSizeW(24),color:"#909090"}}>{item.title.indexCode}</Text>
     * */
    _renderItem = (path: IndexPath) => {
        const item = this.state.data[path.section].items[path.row];
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
            }} style={styles.row}>
                <View style={[styles.fixTitleOne, { backgroundColor: "#fff", }]}>
                    <Text style={{ fontSize: ScreenUtil.setSpText(30), color: "#242424" }} numberOfLines={2} >{item.title.sectorName}</Text>
                    <Text style={{ fontSize: ScreenUtil.setSpText(24), color: "#666666", marginTop: Platform.OS === 'android' ? -ScreenUtil.scaleSizeW(6) : 0 }} numberOfLines={1} >{item.title.indexCode}</Text>
                </View>
                {item.data.map((title, index) => this.getItemViewType(title, index))}
            </TouchableOpacity>
        );
    };
    /**
     * 获取不同样式的View
     * index===2 ?styles.headerFixText:styles.headerText
     * */
    getItemViewType(title, index) {
        let Views;
        //注意每个表格的设置不一样
        switch (index) {
            case 0:
                let content = title.split("&");
                Views = <TouchableOpacity activeOpacity={1} onPress={() => {
                    let data = {};
                    data.Obj = content[1];
                    data.ZhongWenJianCheng = content[0];
                    data.obj = content[1];
                    Navigation.navigateForParams(this.props.navigation, 'DetailPage', {
                        ...data,
                        array: [],
                        index: 0,
                    })
                }} style={styles.textfix} key={index}>
                    <View style={styles.upOneItem}>
                        <Image style={styles.upOneImage} source={require('../../../images/hits/up_one.png')} />
                        <View style={{ flex: 1, marginLeft: ScreenUtil.scaleSizeW(8), marginTop: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(3) : 0 }}>
                            <Text style={[styles.contentText]}>{content[0]}</Text>
                            <Text style={[styles.hinnerText]}>{content[1]}</Text>
                        </View>
                    </View>
                </TouchableOpacity>;
                break;
            case 2:
                // paddingLeft:ScreenUtil.scaleSizeW(30)
                Views = <View style={[styles.text, { paddingLeft: ScreenUtil.scaleSizeW(45) }]} key={index}><Text style={[styles.contentText, { color: "#fa5033" }]}>{title}</Text></View>;
                break;
            case 1:
            case 3:
                Views = <View style={styles.text} key={index}><Text style={[styles.contentText, { color: "#fa5033" }]}>{title}</Text></View>;
                break;
            default:
                Views = <View style={styles.text} key={index}><Text style={styles.contentText}>{title}</Text></View>;
                break;
        }
        return Views;
    };

    /**
     * 列表头布局
     *
     */
    _renderunLockHeader = () => {
        return (
            <View />
        );
    };

    /**
     * SectionTitle
     *
     * */
    _renderSection = (section: number) => {
        return (
            <View style={{ height: this.HEADER_HEGHT, flexDirection: "row" }}>
                <View style={[styles.fixTitleOne, { backgroundColor: "#f2faff" }]}>
                    <Text style={styles.hinnerText}>板块名称</Text>
                </View>

                {this.state.titles.map((title, index) =>
                    <TouchableOpacity activeOpacity={1} onPress={() => { this.sortViewPress(index, title.conCode) }} style={index === 0 ? styles.headerFixText : index === 2 ? [styles.headerText, { paddingLeft: ScreenUtil.scaleSizeW(45) }] : styles.headerText} key={index}>
                        <Text style={styles.hinnerText}>
                            {title.conName}
                        </Text>
                        {this.getSortView(title.conCode)}
                    </TouchableOpacity>
                )}
            </View>
        );
    };
    /**
     * 获取标题
     * 后面排序的View
     * -1没有排序，0默认状态，1为降序，2为升序
     * */
    getSortView(conCode) {
        let sortView;
        switch (conCode) {
            case -1:
                sortView = null;
                break;
            case 0:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/defaultt.png')} />;
                break;
            case 1:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/positive.png')} />;
                break;
            case 2:
                sortView = <Image style={styles.sortView} source={require('../../../images/hits/negative.png')} />;
                break;
            default:
                sortView = null;
                break;
        }
        return sortView;
    }

    /**
     * 脚布局
     * */
    _renderMyFooters = () => {
        if (this.state.allLoaded === false) {
            return <View><View></View></View>;
        } else if ((this.state.data && this.state.data[0].items.length === 0) || this.state.allLoaded === true) {
            return (
                <View>
                    <View style={{ width: ScreenUtil.screenW, paddingVertical: ScreenUtil.scaleSizeW(30), paddingHorizontal: ScreenUtil.scaleSizeW(20), backgroundColor: "#f1f1f1", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: ScreenUtil.setSpText(28), color: "rgba(0,0,0,0.2)", paddingVertical: Platform.OS === 'ios' ? ScreenUtil.scaleSizeW(3) : 0, textAlign: "center" }}
                        >温馨提示：信息内容仅供参考,不构成操作决策依据，股市有风险，投资需谨慎。</Text>
                    </View>
                </View>
            )
        }
    }

    /**
     * 页面将要卸载
     * */
    componentWillUnmount() {
        this.willFocusSubscription.remove();
        this.willBlurSubscription.remove();
        this.appMainTabChange && this.appMainTabChange.remove();
        this.dbTabChange && this.dbTabChange.remove();
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    //表格需要的样式
    text: {
        flex: 1,
        justifyContent: "center",
        paddingLeft: ScreenUtil.scaleSizeW(30),
        backgroundColor: "#fff",
        // backgroundColor:"#bebebe",
    },
    textfix: {
        width: ScreenUtil.scaleSizeW(290),
        justifyContent: "center",
        //alignItems: "center",
        backgroundColor: "white"
    },
    hinnerText: {
        fontSize: ScreenUtil.setSpText(24),
        color: "#999999"
    },
    titleText: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    headerText: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
        paddingLeft: ScreenUtil.scaleSizeW(30)
    },
    headerFixText: {
        width: ScreenUtil.scaleSizeW(290),
        //justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2faff",
        flexDirection: "row",
        paddingLeft: ScreenUtil.scaleSizeW(30)
    },
    row: {
        flex: 1,
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: "#f1f1f1"
    },
    contentText: {
        fontSize: ScreenUtil.setSpText(30),
        color: "#000"
    },
    fixTitleOne: {
        width: ScreenUtil.scaleSizeW(190),
        justifyContent: "center",
        //alignItems: "center",
        paddingHorizontal: Platform.OS === "ios" ? ScreenUtil.scaleSizeW(28) : ScreenUtil.scaleSizeW(30)
    },
    sortView: {
        width: ScreenUtil.scaleSizeW(12),
        height: ScreenUtil.scaleSizeW(24),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(6)
    },
    upOneItem: {
        width: ScreenUtil.scaleSizeW(200),
        backgroundColor: "#e5f1ff",
        marginLeft: ScreenUtil.scaleSizeW(20),
        borderRadius: ScreenUtil.scaleSizeW(12),
        paddingVertical: ScreenUtil.scaleSizeW(10),
        flexDirection: "row",
        alignItems: "center"
    },
    upOneImage: {
        width: ScreenUtil.scaleSizeW(42),
        height: ScreenUtil.scaleSizeW(72),
        resizeMode: "contain",
        marginLeft: ScreenUtil.scaleSizeW(8)
    }
});
