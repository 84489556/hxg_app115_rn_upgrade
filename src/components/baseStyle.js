/**
 * 基础样式
 * Created by jiagang on 15/11/3.
 */
import { Dimensions, Platform } from 'react-native';

const X_HEIGHT = 812;
const X_WIDTH = 375;

export const height = Dimensions.get('window').height;
export const width = Dimensions.get('window').width;

export const DARK_GRAY = '#3A3939';
export const GRAY = '#828282';
export const LIGHT_GRAY = '#A6A6A6';
export const LIGHTEN_GRAY = '#E5E5E5';
export const LIGHTEST_GRAY = '#F0F0F0';
export const RED = '#E43636';
export const DARK_RED = '#831D21';
export const GREEN = '#489F28';
export const DARK_GREEN = '#2B5A12';
export const BLACK = '#000000';
export const WHITE = '#FFFFFF';
export const BLUE = '#D80C18';

export const UP_COLOR = '#F92400';
export const DOWN_COLOR = '#379637';

export const UP_BACKGROUND_COLOR = '#CC3300';
export const DOWN_BACKGROUND_COLOR = '#328A33';

export const DEFAULT_TEXT_COLOR = DARK_GRAY;
export const DEFAULT_BACKGROUND_COLOR = WHITE;
export const DEFAULT_BORDER_COLOR = LIGHTEST_GRAY;

export const HEADER_BACKGROUND_COLOR = '#2E3137';
export const TAB_BAR_BACKGROUND_COLOR = DARK_GRAY;

export const HIGH_LIGHT_COLOR = LIGHTEN_GRAY;

/**
 * 新添样式
 * Created by yzj on 16/9/29.
 */
// export const TABBAR_BORDER_COLOR = '#F92400';//'#2289e7';
export const TABBAR_BORDER_COLOR = '#D80C18';//'#2289e7';
export const BIG_TEXT_COLOR = '#222222';
export const SMALL_TEXT_COLOR = '#666666';
export const NAME_COLOR = '#444444';
export const SMALL_NAME_COLOR = '#999999';
export const SPLIT_LINE_COLOR = '#B2B2B2';
export const TITLE_BACKGROUND_COLOR = '#F2F2F2';
export const VALUE_BACKGROUND_COLOR = '#FF842B';
export const ORANGE = '#FF842B';
export const ORANGE_FE = '#fe9350';
export const ORANGE_FF9933 = '#FF9933';
export const MAIN_CHANNEL_BUTTON_FONT_SELECTED_COLOR = '#F1404B';
export const MAIN_CHANNEL_BORDER_COLOR = '#B2B2B2';
export const MAIN_CHANNEL_BACKGROUND_COLOR = '#F5F5F5';
export const LINGZHANGGU_BACKGROUND_COLOR = '#f24f18';
export const HEADER_FONT_COLOR = WHITE;
export const WU_DANG_BLACK = '#444444';
export const WU_DANG_TEXT_COLOR = '#262628';
export const WU_DANG_VOLUMN_TEXT_COLOR = WU_DANG_TEXT_COLOR;
export const NO_CONTENT_BACKGROUND_COLOR = '#F2F2F2';
export const DETAIL_PAGE_SPLIT_LINE_BACKGROUND_COLOR = '#F6F6F6';
export const ZHANGFUBANG_TITLE_BACKGROUND_COLOR = '#F2F2F2';
export const NEW_STOCK_TITLE_BACKGROUND_COLOR = '#F2F2F2';
export const NEW_STOCK_SMALL_TITLE_BACKGROUND_COLOR = '#808080';
export const NEW_STOCK_LIST_BORDER_COLOR = '#E0E0E0';
export const ZHANGFUBANG_TITLE_BORDER_COLOR = '#E0E0E0';
export const WUDANG_BORDER_COLOR = '#E0E0E0';
export const SCROLLABLE_TAB_INACTIVE_TEXT_COLOR = GRAY;
export const SCROLLABLE_TAB_ACTIVE_TEXT_COLOR = TABBAR_BORDER_COLOR;

export const BLACK_100 = '#262628';
export const BLACK_70 = 'rgba(38,38,40,0.7)';
export const BLACK_50 = 'rgba(38,38,40,0.5)';
export const BLACK_40 = 'rgba(38,38,40,0.5)';
export const BLACK_60 = 'rgba(38,38,40,0.5)';
export const BLACK_30 = 'rgba(38,38,40,0.3)';
export const BLACK_20 = 'rgba(38,38,40,0.2)';
export const BLACK_10 = 'rgba(38,38,40,0.1)';
export const BLACK_05 = 'rgba(38,38,40,0.05)';
export const WHITE_0 = 'rgba(233,233,225,0)';
export const BLACK_99 = '#999999';
export const BLUE_20 = 'rgba(87,159,251,0.2)';
export const PINK_HIGH_LIGHT = '#FC525A';
export const BLUE_HIGH_LIGHT = '#F92400';// '#2289E7'
export const BLUE_LIGHT = '#4289E0';
export const BLUE_0099FF = '#0099FF';
export const BLUE_3399FF = '#3399FF';
export const BLUE_0099FF_05 = 'rgba(0,153,255,0.05)';
export const BLUE_3399FF_10 = 'rgba(51,153,255,0.1)';
export const BLUE_30 = '#FC525A';
export const LINE_BG_F1 = '#f1f1f1';
export const LINE_BG_F6 = '#f6f6f6';
export const PULL_DOWN_TITLE_BK = '#fff1f2';//'rgba(87,159,251,0.14)';

export const BLACK_333333 = '#333333';
export const BLACK_d4d4d4 = '#d4d4d4';
export const BLACK_555555 = '#555555';
export const BLACK_666666 = '#666666';
export const BLACK_999999 = '#999999';
export const BLACK_d2d2d2 = '#D2D2D2';
export const BLACK_dd = '#ddddd';
export const RED_FFD5CE = '#FFD5CE';

// export let isIPhoneX = X_HEIGHT === height && X_WIDTH === width ? true : false;
//export const isIPhoneX = ((Number(((height / width) + "").substr(0, 4)) * 100) === 216) ? true : false;

export const isIPhoneX = Platform.OS==='ios'? (((Number(((height / width) + "").substr(0, 4)) * 100) === 216) ? true : false ) : false;

export const BLACK_000000_05 = 'rgba(0,0,0,0.05)';
export const BLACK_000000_10 = 'rgba(0,0,0,0.1)';//边框线
export const BLACK_000000_40 = 'rgba(0,0,0,0.4)';
export const BLACK_000000_60 = 'rgba(0,0,0,0.6)';
export const BLACK_000000_80 = 'rgba(0,0,0,0.8)';

export const androidOrIos = Platform.OS == 'ios' ? 'ios' : 'android';

