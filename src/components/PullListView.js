/**
 * Created by mhc
 * 上拉加载功能的 FlatList
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    FlatList,
    StyleSheet
} from 'react-native';

// 刷新状态枚举
export const RefreshState = {
    Idle: 0,
    HeaderRefreshing: 1,
    FooterRefreshing: 2,
    NoMoreData: 3,
    Failure: 4,
    EmptyData: 5
};

const DEBUG = false;
const log = (text: string) => {
    DEBUG && console.log(text);
};

type Props = {
    refreshState: number,
    onHeaderRefresh: Function,
    onFooterRefresh?: Function,
    data: Array<any>,

    footerContainerStyle?: ViewPropTypes.style,
    footerTextStyle?: ViewPropTypes.style,

    listRef?: any,

    footerRefreshingText?: string,
    footerFailureText?: string,
    footerNoMoreDataText?: string,
    footerEmptyDataText?: string,

    renderHeaderComponent: Function,
    renderItem: Function
};

type State = {};

export default class PullListView extends PureComponent<Props, State> {
    static propTypes = {
        footerComponent: PropTypes.node,
        itemComponent: PropTypes.node
    };
    static defaultProps = {
        footerComponent: null,
        itemComponent: null,
        footerRefreshingText: '加载中…',
        footerFailureText: '点击重新加载',
        footerStartRefreshText: '点击加载',
        footerNoMoreDataText: '已加载全部数据',
        footerEmptyDataText: '没有相关数据'
    };

    constructor(props) {
        super(props);
        this.onEndReachedCalledDuringMomentum = true;

        this.handleViewableItemsChanged = this.getVisibleRows.bind(this)
        // this.viewabilityConfig = {viewAreaCoveragePercentThreshold: 50}
        this.viewabilityConfig = {
            minimumViewTime: 1,
            itemVisiblePercentThreshold: 50,
            // waitForInteraction: false,
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        log(nextProps.refreshState);
        this.props = nextProps;
        this.setState({});
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        log(prevProps.refreshState);
    }

    goTop() {
        // this.refs.flatlist.scrollToItem({ animated: false, item: 0, viewPosition: 0 })
        this.refs.flatlist.scrollToOffset({ offset: 0, animated: true })
    }

    onHeaderRefresh = () => {
        if (this.shouldStartHeaderRefreshing()) {
            this.props.onHeaderRefresh(RefreshState.HeaderRefreshing);
        }
    };

    _onEndReached = (info: { distanceFromEnd: number }) => {
        let con1 = this.shouldStartFooterRefreshing();
        let con2 = !this.onEndReachedCalledDuringMomentum;
        if (con1 && con2) {
            this.props.onFooterRefresh &&
                this.props.onFooterRefresh(RefreshState.FooterRefreshing);
            this.onEndReachedCalledDuringMomentum = true;
        }
    };

    shouldStartFooterRefreshing = () => {
        let { refreshState, data } = this.props;
        if (data && data.length == 0) {
            return false;
        }
        return refreshState == RefreshState.Idle;
    };

    shouldStartHeaderRefreshing = () => {
        if (
            this.props.refreshState == RefreshState.HeaderRefreshing ||
            this.props.refreshState == RefreshState.FooterRefreshing
        ) {
            return false;
        }
        return true;
    };

    renderFooter = () => {
        let footer = null;
        let footerContainerStyle = [
            styles.footerContainer,
            this.props.footerContainerStyle
        ];
        let footerTextStyle = [styles.footerText, this.props.footerTextStyle];
        let {
            footerRefreshingText,
            footerFailureText,
            footerNoMoreDataText,
            footerEmptyDataText,
            footerStartRefreshText,
        } = this.props;

        switch (this.props.refreshState) {
            case RefreshState.Idle:
                footer =
                    //     (
                    //     <TouchableOpacity
                    //         style={footerContainerStyle}
                    //         onPress={() => {
                    //             this.props.onFooterRefresh &&
                    //             this.props.onFooterRefresh(
                    //                 RefreshState.FooterRefreshing
                    //             );
                    //         }}
                    //     >
                    //         <Text style={styles.footerText}>{footerStartRefreshText}</Text>
                    //     </TouchableOpacity>
                    // );
                    <View style={footerContainerStyle} />;
                break;
            case RefreshState.EmptyData:
                footer = (
                    <TouchableOpacity
                        style={footerContainerStyle}
                        onPress={() => {
                            this.props.onFooterRefresh &&
                                this.props.onFooterRefresh(
                                    RefreshState.FooterRefreshing
                                );
                        }}
                    >
                        <Text style={styles.footerText}>{footerEmptyDataText}</Text>
                    </TouchableOpacity>
                );
                break;
            case RefreshState.FooterRefreshing:
                footer = (
                    <View style={footerContainerStyle}>
                        <ActivityIndicator size={'small'} color={'#888888'} />
                        <Text style={styles.footerText}>
                            {footerRefreshingText}
                        </Text>
                    </View>
                );
                break;
            case RefreshState.NoMoreData:
                footer = (
                    <View style={footerContainerStyle}>
                        <Text style={footerTextStyle}>
                            {footerNoMoreDataText}
                        </Text>
                    </View>
                );
                break;
            case RefreshState.Failure:
                footer = (
                    <TouchableOpacity
                        style={footerContainerStyle}
                        onPress={() => {
                            this.props.onFooterRefresh &&
                                this.props.onFooterRefresh(
                                    RefreshState.FooterRefreshing
                                );
                        }}
                    >
                        <Text style={footerTextStyle}>{footerFailureText}</Text>
                    </TouchableOpacity>
                );
                break;
        }
        return footer;
    };

    getVisibleRows(info) {
        let visibleRowNumbers = info.visibleRowNumbers
        this.props.setChangeVisibleRowCallback && this.props.setChangeVisibleRowCallback(info)
    }

    _onScroll(event) {
        this.props.onScroll && this.props.onScroll(event);
        let offsetY = event.nativeEvent.contentOffset.y //滑动距离
        //console.log('flatlist state1:', offsetY)
        if (offsetY == 0) {
            //console.log("flatlist state:", "List Top")
            this.props.callback && this.props.callback(true)
        }
        else {
            let contentSizeHeight = event.nativeEvent.contentSize.height; //scrollView contentSize高度
            let oriageScrollHeight = event.nativeEvent.layoutMeasurement.height; //scrollView高度
            if (offsetY + oriageScrollHeight + 1 >= contentSizeHeight) {
                //console.log("flatlist state:", "List Bottom")
                this.props.loadMore && this.props.loadMore()
            }
        }
    }

    _onScrollBeginDrag = (event) => {
        this.props.cy_onScrollBeginDrag && this.props.cy_onScrollBeginDrag(event);
    }

    _onScrollEndDrag = (event) => {
        this.props.cy_onScrollEndDrag && this.props.cy_onScrollEndDrag(event);
    }

    _onMomentumScrollBegin = (event) => {
        this.onEndReachedCalledDuringMomentum = false;
        this.props.cy_onMomentumScrollBegin && this.props.cy_onMomentumScrollBegin(event);
    }

    _onMomentumScrollEnd = (event) => {
        this.props.cy_onMomentumScrollEnd && this.props.cy_onMomentumScrollEnd(event);
    }

    render() {
        let { renderItem, renderHeaderComponent, ...rest } = this.props;
        return (
            <FlatList
                ref="flatlist"
                renderItem={renderItem}
                scrollEnabled={this.props.con_scrollEnabled}
                ListHeaderComponent={renderHeaderComponent}
                onEndReached={this._onEndReached}
                onEndReachedThreshold={0.9}
                ListFooterComponent={this.renderFooter}
                onViewableItemsChanged={this.handleViewableItemsChanged}
                viewabilityConfig={this.viewabilityConfig}
                onScroll={this._onScroll.bind(this)}
                onScrollBeginDrag={this._onScrollBeginDrag}
                onScrollEndDrag={this._onScrollEndDrag}
                onMomentumScrollBegin={this._onMomentumScrollBegin}
                onMomentumScrollEnd={this._onMomentumScrollEnd}
                {...rest}
            />
        );
    }
}

const styles = StyleSheet.create({
    footerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        height: 44
    },
    footerText: {
        fontSize: 14,
        marginLeft: 7,
        color: '#555555'
    }
});
