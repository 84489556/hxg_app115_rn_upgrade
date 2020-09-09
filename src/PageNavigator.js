'use strict';

import React from "react";
import {
    BackHandler,
    Platform,
    ToastAndroid,
    View,
    DeviceEventEmitter,
    NativeModules, Easing, Animated
} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Splash from "./pages/Splash"
import UserAgree from "./pages/userCenter/UserAgree"
import * as NavigationInterface from "./components/NavigationInterface"
import AppMain from './pages/AppMain'
import LoginPage from "./pages/login/LoginPage";
import BannerDetails from "./pages/Home/BannerDetails";
import UserCenter from './pages/userCenter/UserCenter'
import PrivacyAgreement from './pages/userCenter/PrivacyAgreement'
import ChangeHeaderPage from './pages/userCenter/ChangeHeaderPage'
import ChangePassword from './pages/login/ChangePassword'
import ChangeUserName from './pages/userCenter/ChangeUserName'
import UserMessage from './pages/userCenter/UserMessage'
import GongGaoDetail from './pages/userCenter/GongGaoDetail'
import Customer from './pages/userCenter/Customer'
import GuidePage from './pages/userCenter/GuidePage'
import ForgetPassword from './pages/login/ForgetPassword'
import ForgetPasswordNext from './pages/login/ForgetPasswordNext'
import ForgetPasswordVerifi from './pages/login/ForgetPasswordVerifi'
import LiveRoom from "./pages/Home/LiveLessionPage/LiveRoom";
import HXGD_DetailPage from "./pages/Home/LiveLessionPage/HXGD_DetailPage";
import RegisterPage from './pages/login/RegisterPage'
import ActivityCenter from './pages/userCenter/ActivityCenter'
import ServiceMall from './pages/userCenter/ServiceMall'
import UserPermissionsPage from './pages/userCenter/UserPermissionsPage'
import SettingPage from './pages/userCenter/SettingPage'
import HuShenZhiShu from "./pages/Quote/HuShenZhiShu"
import AllBlockPage from "./pages/Quote/AllBlockPage";
import AllUpDownPage from "./pages/Quote/AllUpDownPage"
import SearchPage from "./pages/Quote/SearchPage";
import EditPersonalStockPage from './pages/Quote/EditPersonalStockPage'
import DetailPage from "./pages/Quote/DetailPage";
import MainDecisionPage from './pages/MainDecision/MainDecisionPage';
import KLineSetPage from './pages/Quote/KLineSetPage'
import KLineMessagePage from './pages/Quote/KLineMessagePage'
import NewsDetailPage from "./pages/NewsDetailPage";
import PDFPage from './pages/PDFPage'
import TargetStudyPage from "./pages/TargetStudyPage";
import ChoseChartNorm from './pages/ChoseChartNorm'
import TuyereDecisionPage from './pages/TuyereDecision/TuyereDecisionPage';
import MarketingDetailPage from './pages/marketActivity/MarketingDetailPage'
import TargetDetailPage from "./pages/StockSelect/SpecialSelectStock/TargetDetailPage";
import DTTargetDetailPage from "./pages/StockSelect/SpecialSelectStock/DTTargetDetailPage";

import ScreenCondition from "./pages/StockSelect/SpecialSelectStock/ScreenCondition";
import ValueDetailPage from "./pages/StockSelect/ValueStrategy/ValueDetailPage";
import LongHuBangPage from './pages/MainDecision/LongHuBangPage';
import UserOrder from './pages/userCenter/UserOrder'
import TransferWay from './pages/userCenter/TransferWay'
import LandscapePage from "./pages/Quote/LandscapeP.js"
import HotTuyereTab from './pages/TuyereDecision/HotTuyereTab'
import BigCafeCoursePage from './pages/Course/BigCafeCoursePage';
import CourseDetailPage from './pages/Course/CourseDetailPage';
import IndexStudyCoursePage from './pages/Course/IndexStudyCoursePage';
import StrategyCoursePage from './pages/Course/StrategyCoursePage';
//import HotSetPage from './pages/TuyereDecision/HotSetPage'
import ScreenConditions from './pages/TuyereDecision/ScreenConditions'
import MainInvestmentTab from './pages/TuyereDecision/MainInvestmentTab'
import HotFocusPage from './pages/TuyereDecision/HotFocusPage';
import GrowthCoursePage from './pages/Course/GrowthCoursePage';
import LittleWhiteCoursePage from './pages/Course/LittleWhiteCoursePage';
import MainReportPage from './pages/TuyereDecision/MainReportPage'
import HistoryRecordPage from './pages/TuyereDecision/HistoryRecordPage'
import MainReportDetailPage from './pages/TuyereDecision/MainReportDetailPage'
import VScreenCondition from "./pages/StockSelect/ValueStrategy/VScreenCondition";
import MoneyRevelationPage from './pages/MainDecision/MoneyRevelationPage'
import MoneyRevelationSetPage from './pages/MainDecision/MoneyRevelationSetPage'
import MoneyStockPage from './pages/MainDecision/MoneyStockPage'
import FundsFlowStatisticPage from './pages/MainDecision/FundsFlowStatisticPage';
import ConstituentForFundsFlowPage from './pages/MainDecision/ConstituentForFundsFlow';
import HotFocusDetailPage from './pages/TuyereDecision/HotFocusDetailPage';
import HistoryPage from "./pages/StockSelect/ValueStrategy/HistoryPage";
import TargetHistoryPage from "./pages/StockSelect/SpecialSelectStock/TargetHistoryPage";
import XiWeiTouShiPage from './pages/MainDecision/XiWeiTouShiPage';
import ChangeDetails from "./pages/Hits/ExecutiveTrading/ChangeDetails";
import SalesDetails from "./pages/Hits/ExecutiveTrading/SalesDetails";
import NewDealSearch from "./pages/Hits/ExecutiveTrading/NewDealSearch";
import OnListDetailPage from './pages/MainDecision/OnListDetailPage';
import XiWeiHistoryListPage from './pages/MainDecision/XiWeiHistoryListPage';
import JiePanHistoryListPage from './pages/JiePanVideo/HistoryListPage';
import JiePanVideoDetailPage from './pages/JiePanVideo/JiePanVideoDetailPage';
import TeacherDetailPage from './pages/Home/LiveLessionPage/LiveRoomPages/TeacherDetailPage'
import NewReaserchSearch from "./pages/Hits/Research/NewReaserchSearch";
import ProfitStaSearch from "./pages/Hits/ProfitStaSearch";
import LongHuPasswordSearchPage from './pages/MainDecision/LongHuPasswordSearchPage';
import YouZiTuPuSearchPage from './pages/MainDecision/YouZiTuPuSearchPage';
import FeedBackPage from './pages/userCenter/FeedBackPage'
import OpinionLivingPage from './components/Decisions/OpinionLivingPage';
import HitsTopNavigator from "./pages/Hits/HitsTopNavigator";
import BindPhonePage from './pages/login/BindPhonePage'
import DuoTouQiDongPage from './pages/marketActivity/DuoTouQiDongPage';
import YDBaseWebViewPage from './pages/YDBaseWebViewPage';
import HotTuyerePages from './pages/StockSelect/HotTuyerePages';

global.Navigation = NavigationInterface;
let _navi;
let firstClick = 0;

if (Platform.OS == 'ios') {
    global.IsNotch = false;
    global.Brand = 'NONE';
    global.NavigationHeight = 0;
} else {
    NativeModules.GETNOTCHSIZE.getNotchSize((size) => {
        if (size > 0) {
            global.IsNotch = true;
        } else {
            global.IsNotch = false;
        }
    });
    NativeModules.GETNOTCHSIZE.getBrand((brand) => {
        global.Brand = brand;
    });
    NativeModules.getnaviheight.getNaviHeight((naviHeight) => {
        global.NavigationHeight = naviHeight;
    });
}
const custom_Config = () => ({
    transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
    },
    screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps;
        const { index } = scene;
        if (scene && scene.route) {
            global.currRoute = scene.route.routeName;
        }
        const Width = layout.initWidth;
        //沿X轴平移
        const translateX = position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [Width, 0, -(Width - 10)],
        });
        //透明度
        const opacity = position.interpolate({
            inputRange: [index - 1, index - 0.99, index],
            outputRange: [0, 1, 1],
        });
        return { opacity, transform: [{ translateX }] };
    }
}
);
const StackNavigator = createStackNavigator(
    {
        Splash: {  //路由
            screen: Splash,
            navigationOptions: {
                header: null,
            }
        },
        UserAgree: {
            screen: UserAgree,
            navigationOptions: {
                header: null,
            }
        },
        AppMain: {  //路由
            screen: AppMain,
            navigationOptions: {
                header: null,
            }
        },
        LoginPage: {  //路由
            screen: LoginPage,
            navigationOptions: {
                header: null,
            }
        },
        BannerDetails: {
            screen: BannerDetails,
            navigationOptions: {
                header: null,
            }
        },
        UserCenter: {
            screen: UserCenter,
            navigationOptions: {
                header: null,
            }
        },
        PrivacyAgreement: {
            screen: PrivacyAgreement,
            navigationOptions: {
                header: null,
                gesturesEnabled: false,
            }
        },
        ChangeHeaderPage: {
            screen: ChangeHeaderPage,
            navigationOptions: {
                header: null,
            }
        },
        ChangeUserName: {
            screen: ChangeUserName,
            navigationOptions: {
                header: null,
            }
        },
        ChangePassword: {
            screen: ChangePassword,
            navigationOptions: {
                header: null,
            }
        },
        UserMessage: {
            screen: UserMessage,
            navigationOptions: {
                header: null,
            }
        },
        GongGaoDetail: {
            screen: GongGaoDetail,
            navigationOptions: {
                header: null,
            }
        },
        Customer: {
            screen: Customer,
            navigationOptions: {
                header: null,
            }
        },
        GuidePage: {
            screen: GuidePage,
            navigationOptions: {
                header: null,
            }
        },
        ForgetPassword: {
            screen: ForgetPassword,
            navigationOptions: {
                header: null,
            }
        },
        ForgetPasswordNext: {
            screen: ForgetPasswordNext,
            navigationOptions: {
                header: null,
            }
        },
        ForgetPasswordVerifi: {
            screen: ForgetPasswordVerifi,
            navigationOptions: {
                header: null,
            }
        },
        LiveRoom: {
            screen: LiveRoom,
            navigationOptions: {
                header: <View />,
                gesturesEnabled: false,
            }
        },
        HXGD_DetailPage: {
            screen: HXGD_DetailPage,
            navigationOptions: {
                header: null,
            }
        },
        RegisterPage: {
            screen: RegisterPage,
            navigationOptions: {
                header: null,
            }
        },
        ActivityCenter: {
            screen: ActivityCenter,
            navigationOptions: {
                header: null,
            }
        },
        ServiceMall: {
            screen: ServiceMall,
            navigationOptions: {
                header: null,
            }
        },
        UserPermissionsPage: {
            screen: UserPermissionsPage,
            navigationOptions: {
                header: null,
            }
        },
        SettingPage: {
            screen: SettingPage,
            navigationOptions: {
                header: null,
            }
        },
        //选股详情页面
        TargetDetailPage: {
            screen: TargetDetailPage,
            navigationOptions: {
                header: null,
            }
        },
        //多头启动页面
        DTTargetDetailPage: {
            screen: DTTargetDetailPage,
            navigationOptions: {
                header: null,
            }
        },
        //条件筛选页面
        ScreenCondition: {
            screen: ScreenCondition,
            navigationOptions: {
                header: null,
            }
        },//价值策略详情页面
        ValueDetailPage: {
            screen: ValueDetailPage,
            navigationOptions: {
                header: null,
            }
        },//价值策略筛选页面
        VScreenCondition: {
            screen: VScreenCondition,
            navigationOptions: {
                header: null,
            }
        },//价值策略历史战绩页面
        HistoryPage: {
            screen: HistoryPage,
            navigationOptions: {
                header: null,
            }
        },
        //特色指标选股历史战绩页面
        TargetHistoryPage: {
            screen: TargetHistoryPage,
            navigationOptions: {
                header: null,
            }
        },
        //持续变动页面
        ChangeDetails: {
            screen: ChangeDetails,
            navigationOptions: {
                header: null,
            }
        },//买卖明细页面
        SalesDetails: {
            screen: SalesDetails,
            navigationOptions: {
                header: null,
            }
        },//高管交易搜索页面
        NewDealSearch: {
            screen: NewDealSearch,
            navigationOptions: {
                header: null,
            }
        },//机构调研最新调研搜索页面
        NewReaserchSearch: {
            screen: NewReaserchSearch,
            navigationOptions: {
                header: null,
            }
        },//收益统计搜索
        ProfitStaSearch: {
            screen: ProfitStaSearch,
            navigationOptions: {
                header: null,
            }
        },
        //收益统计搜索
        HitsTopNavigator: {
            screen: HitsTopNavigator,
            navigationOptions: {
                header: null,
            }
        },
        //热点策略页面
        HotTuyerePages: {
            screen: HotTuyerePages,
            navigationOptions: {
                header: null,
            }
        },


        HuShenZhiShu: {
            screen: HuShenZhiShu,
            navigationOptions: {
                header: null,
            }
        },
        AllBlockPage: {
            screen: AllBlockPage,
            navigationOptions: {
                header: null,
            }
        },
        AllUpDownPage: {
            screen: AllUpDownPage,
            navigationOptions: {
                header: null
            }
        },
        SearchPage: {
            screen: SearchPage,
            navigationOptions: {
                header: null
            }
        },
        EditPersonalStockPage: {
            screen: EditPersonalStockPage,
            navigationOptions: {
                header: null
            }
        },
        DetailPage: {
            screen: DetailPage,
            navigationOptions: {
                header: null,
                gesturesEnabled: false,
            },
        },
        MainDecisionPage: {
            screen: MainDecisionPage,
            navigationOptions: {
                header: null,
            }
        },
        KLineSetPage: {
            screen: KLineSetPage,
            navigationOptions: {
                header: null,
            }
        },
        KLineMessagePage: {
            screen: KLineMessagePage,
            navigationOptions: {
                header: null,
            }
        },
        NewsDetailPage: {
            screen: NewsDetailPage,
            navigationOptions: {
                header: null,
            }
        },
        PDFPage: {
            screen: PDFPage,
            navigationOptions: {
                header: null,
            }
        },
        TargetStudyPage: {
            screen: TargetStudyPage,
            navigationOptions: {
                header: <View />,
                gesturesEnabled: false,
            }
        },
        ChoseChartNorm: {
            screen: ChoseChartNorm,
            navigationOptions: {
                header: null,
            }
        },
        TuyereDecisionPage: {
            screen: TuyereDecisionPage,
            navigationOptions: {
                header: null,
            }
        },
        MarketingDetailPage: {
            screen: MarketingDetailPage,
            navigationOptions: {
                header: null,
            }
        },
        LongHuBangPage: {
            screen: LongHuBangPage,
            navigationOptions: {
                header: null,
            }
        },
        UserOrder: {
            screen: UserOrder,
            navigationOptions: {
                header: null,
            }
        },
        TransferWay: {
            screen: TransferWay,
            navigationOptions: {
                header: null,
            }
        },
        HotTuyereTab: {
            screen: HotTuyereTab,
            navigationOptions: {
                header: null,
            }
        },
        BigCafeCoursePage: {
            screen: BigCafeCoursePage,
            navigationOptions: {
                header: null,
            }
        },
        CourseDetailPage: {
            screen: CourseDetailPage,
            navigationOptions: {
                header: <View />,
                gesturesEnabled: false,
            }
        },
        IndexStudyCoursePage: {
            screen: IndexStudyCoursePage,
            navigationOptions: {
                header: null
            }
        },
        // HotSetPage: {
        //     screen: HotSetPage,
        //     navigationOptions: {
        //         header: null
        //     }
        // },
        ScreenConditions: {
            screen: ScreenConditions,
            navigationOptions: {
                header: null
            }
        },
        MainInvestmentTab: {
            screen: MainInvestmentTab,
            navigationOptions: {
                header: null
            }
        },
        HotFocusPage: {
            screen: HotFocusPage,
            navigationOptions: {
                header: null
            }
        },
        GrowthCoursePage: {
            screen: GrowthCoursePage,
            navigationOptions: {
                header: null
            }
        },
        LittleWhiteCoursePage: {
            screen: LittleWhiteCoursePage,
            navigationOptions: {
                header: null
            }
        },
        MainReportPage: {
            screen: MainReportPage,
            navigationOptions: {
                header: null
            }
        },
        HistoryRecordPage: {
            screen: HistoryRecordPage,
            navigationOptions: {
                header: null
            }
        },
        MainReportDetailPage: {
            screen: MainReportDetailPage,
            navigationOptions: {
                header: null
            }
        },
        MoneyRevelationPage: {
            screen: MoneyRevelationPage,
            navigationOptions: {
                header: null
            }
        },
        MoneyRevelationSetPage: {
            screen: MoneyRevelationSetPage,
            navigationOptions: {
                header: null
            }
        },
        MoneyStockPage: {
            screen: MoneyStockPage,
            navigationOptions: {
                header: null
            }
        },
        XiWeiTouShiPage: {
            screen: XiWeiTouShiPage,
            navigationOptions: {
                header: null
            }
        },
        LandscapePage: {
            screen: LandscapePage,
            navigationOptions: {
                header: <View />,
                gesturesEnabled: false,
            },
        },
        FundsFlowStatisticPage: {
            screen: FundsFlowStatisticPage,
            navigationOptions: {
                header: null,
            }
        },
        HotFocusDetailPage: {
            screen: HotFocusDetailPage,
            navigationOptions: {
                header: null,
            }
        },
        OnListDetailPage: {
            screen: OnListDetailPage,
            navigationOptions: {
                header: null,
            }
        },
        XiWeiHistoryListPage: {
            screen: XiWeiHistoryListPage,
            navigationOptions: {
                header: null
            }
        },
        TeacherDetailPage: {
            screen: TeacherDetailPage,
            navigationOptions: {
                header: null,
                gesturesEnabled: false,
            }
        },
        StrategyCoursePage: {
            screen: StrategyCoursePage,
            navigationOptions: {
                header: null
            }
        },
        JiePanHistoryListPage: {
            screen: JiePanHistoryListPage,
            navigationOptions: {
                header: null
            }
        },
        LongHuPasswordSearchPage: {
            screen: LongHuPasswordSearchPage,
            navigationOptions: {
                header: null
            }
        },
        YouZiTuPuSearchPage: {
            screen: YouZiTuPuSearchPage,
            navigationOptions: {
                header: null
            }
        },
        JiePanVideoDetailPage: {
            screen: JiePanVideoDetailPage,
            navigationOptions: {
                header: <View />,
                gesturesEnabled: false,
            }
        },
        FeedBackPage: {
            screen: FeedBackPage,
            navigationOptions: {
                header: null
            }
        },
        ConstituentForFundsFlowPage: {
            screen: ConstituentForFundsFlowPage,
            navigationOptions: {
                header: null
            }
        },
        OpinionLivingPage: {
            screen: OpinionLivingPage,
            navigationOptions: {
                header: null
            }
        },
        BindPhonePage: {
            screen: BindPhonePage,
            navigationOptions: {
                header: null
            }
        },
        DuoTouQiDongPage: {
            screen: DuoTouQiDongPage,
            navigationOptions: {
                header: null
            }
        },
        YDBaseWebViewPage: {
            screen: YDBaseWebViewPage,
            navigationOptions: {
                header: null
            }
        }
    },
    {
        initialRouteName: "Splash",
        transitionConfig: custom_Config,
    }
);
const MainNavigator = createAppContainer(StackNavigator);


class PageNavigator extends React.Component {
    constructor(props) {
        super(props);

        this.handleBack = this.handleBack.bind(this);
        this._exit = false;
        AsyncStorage.setItem('isABC', 'false')
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBack)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBack)
    }

    handleBack = () => {
        let nav = _navi._navigation
        if (nav.state.routes.length <= 1) {
            if (this._exit) return false;

            let timestamp = (new Date()).valueOf();
            if (timestamp - firstClick > 2000) {
                firstClick = timestamp;
                ToastAndroid.show('再按一次退出', ToastAndroid.SHORT);
                return true;
            } else {
                DeviceEventEmitter.emit('releaseFMListener', false);
                BackHandler.exitApp();
                //NativeModules.KillProcessManager.killProcess();
                this._exit = true;
                return false;
            }
        } else {
            let length = nav.state.routes.length - 1;
            let pageName = (nav.state.routes[length]).routeName;
            if (pageName == "SearchPage" ||
                pageName == "DetailPage" ||
                pageName == "HuShenZhiShu" ||
                pageName == "AllBlockPage" ||
                pageName == "AllUpDownPage") {
                DeviceEventEmitter.emit('ZS_ISREGISTER', true, pageName);
            }
            nav.pop()
            return true;
        }
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MainNavigator ref={(ref) => _navi = ref} />
            </View>
        );
    }
}


export default PageNavigator