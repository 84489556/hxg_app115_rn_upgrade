/**
 * Created by cuiwenjuan on 2019/7/30.
 */
import React, { PureComponent } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    Animated
} from 'react-native';
import { LargeList } from "react-native-largelist-v3";
import * as baseStyle from './baseStyle';

type Props = {

    onRefresh: Function,
    onLoading: Function,
    data: Array<any>,
    renderItem: Function
};
type State = {};


export default class HXGLargeList extends PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            allLoaded: false,
        }
    }

    render() {
        let { data, onLoading, onRefresh, allLoaded, ...props } = this.props;
        let messages = [];
        messages.push({ items: data });
        return (
            <LargeList
                ref={ref => (this._list = ref)}
                style={styles.container}
                data={messages}
                renderIndexPath={this._renderIndexPath}
                refreshHeader={NormalHeader}
                onRefresh={() => {
                    onRefresh && onRefresh(() => { this._list.endRefresh(); });
                    if (!onRefresh) { this._list.endRefresh(); }
                }}

                allLoaded={allLoaded ? allLoaded : this.state.allLoaded}
                loadingFooter={NormalFooter}
                onLoading={() => {
                    if (onLoading) {
                        onLoading((isAllData) => {
                            if (isAllData) {
                                this.setState({ allLoaded: true }, () => {
                                    this._list.endLoading();
                                })
                            } else {
                                this._list.endLoading();
                            }
                        })
                    } else {
                        this._list.endLoading();
                    }
                }}
                {...props}
            />
        );
    }

    _renderIndexPath = ({ section: section, row: row }) => {
        let { data, renderItem } = this.props;

        // console.log('列表 === ',data);
        let rowData = data[row];
        if (renderItem) {
            return <View style={styles.row}>
                {renderItem(rowData, row)}
            </View>
        } else {
            return (
                <View style={styles.row}>
                    <Text>
                        Section {section} Row {row}
                    </Text>
                    <View style={styles.line} />
                </View>
            );
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    section: {
        flex: 1,
        backgroundColor: "gray",
        justifyContent: "center",
        alignItems: "center"
    },
    row: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    line: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 1,
        backgroundColor: "#EEE"
    }
});

import { RefreshHeader, HeaderStatus } from "react-native-spring-scrollview/RefreshHeader";
class NormalHeader extends RefreshHeader {
    static height = 80;

    static style = "stickyContent";

    render() {
        return (
            <View style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row"
            }}>
                {this._renderIcon()}
                <View style={{ marginLeft: 10 }}>
                    <Text style={{
                        marginVertical: 5,
                        fontSize: 12,
                        color: "#666",
                        textAlign: "center",
                        width: 60
                    }}>
                        {this.getTitle()}
                    </Text>
                    {this.renderContent()}
                </View>
            </View>
        );
    }

    _renderIcon() {
        const s = this.state.status;
        if (s === "refreshing" || s === "rebound") {
            return <ActivityIndicator color={"gray"} />;
        }
        const { maxHeight, offset } = this.props;
        return (
            <Animated.Image
                source={require("../images/login/login_zhankai.png")}
                style={{
                    transform: [
                        {
                            rotate: offset.interpolate({
                                inputRange: [-maxHeight - 1 - 10, -maxHeight - 10, -50, -49],
                                outputRange: ["180deg", "180deg", "0deg", "0deg"]
                            })
                        }
                    ]
                }}
            />
        );
    }

    renderContent() {
        return null;
    }

    getTitle() {
        const s = this.state.status;
        if (s === "pulling" || s === "waiting") {
            return "下拉刷新";
        } else if (s === "pullingEnough") {
            return "松开刷新";
        } else if (s === "refreshing") {
            return "正在加载";
        } else if (s === "pullingCancel") {
            return "";
        } else if (s === "rebound") {
            return "正在加载";
        }
    }
}



import { LoadingFooter, FooterStatus } from "react-native-spring-scrollview/LoadingFooter";
class NormalFooter extends LoadingFooter {
    static height = 25;

    static style = "stickyScrollView";
    render() {
        // console.log('上拉加载 === render',this.state.status);
        if (this.state.status === "allLoaded")
            return (
                <View style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    // backgroundColor:'#e1ff8d'
                }}>
                    <Text style={{
                        marginVertical: 5,
                        fontSize: 15,
                        color: "#666",
                        textAlign: "center",
                        width: baseStyle.width
                    }}>{this.getTitle()}</Text>
                </View>
            );
        return (
            <View style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                // backgroundColor:'#ff4334'
            }}>
                {this._renderIcon()}
                <View style={{ marginLeft: 20 }}>
                    <Text style={{
                        marginVertical: 5,
                        fontSize: 12,
                        color: "#666",
                        textAlign: "center",
                        // width: 140
                    }}>{this.getTitle()}</Text>
                    {this.renderContent()}
                </View>
            </View>
        );
    }

    _renderIcon() {
        const s = this.state.status;
        if (s === "loading") {
            return <ActivityIndicator color={"gray"} />;
        }
    }

    renderContent() {
        return null;
    }

    getTitle() {
        let s = this.state.status;
        if (s === "loading") {
            return '正在加载';
        } else if (s === "allLoaded") {
            return "—————— 没有更多了 ——————";
        }
    }
}