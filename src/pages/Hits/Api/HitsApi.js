
/**
 * author：created by tangqianzhu
 * mail：pillartang@sina.cn
 * date：2019/8/8 17
 * description:打榜模块接口
 */

export default {
        /**
         * 最新交易
         * */
        //最新交易Tab
        MARKET_CENSUS :"/ydhxg/GaoGuanJiaoYi/gaoguanjingmaishichangtongji",//高管交易榜最新交易近一年高管市场统计
        SEND_BUY_FIVE:"/ydhxg/GaoGuanJiaoYi/gaoguanmaimaihangye5",//高管交易近20日高管买卖前5行业
        NEW_SALE_LIST:"/ydhxg/GaoGuanJiaoYi/zuixinjiaoyi",//高管交易最新交易列表
        NEW_SALE_SEARCH_LIST:"/ydhxg/GaoGuanJiaoYi/searchZuiXinJiaoYi",//高管交易最新交易列表
        //集中买入Tab
        FOCUS_BUY_LINE:"/ydhxg/GaoGuanJiaoYi/gaoguanmairurenshu5",//集中买入高管人数接口(图表)
        FOCUS_BUY_DETAILS:"/ydhxg/GaoGuanJiaoYi/gaoguanmairumingxi",//高管交易明细
        FOCUS_BUY_TABLEDATAS:"/ydhxg/GaoGuanJiaoYi/jizhongmairu",//集中买入表格数据

        //持续买入Tab
        CHIXU_BUY_LINE:"/ydhxg/GaoGuanJiaoYi/gaoguanmairutianshu5",//持续买入高管人数接口(图表)
        CHIXU_BUY_DETAILS:"/ydhxg/GaoGuanJiaoYi/gaoguanmairumingxi",
        CHIXU_BUY_TABLEDATAS:"/ydhxg/GaoGuanJiaoYi/chixumairu",//持续买入表格数据

        //打榜市场统计
        MARKET_CENCUS_LIST:"/ydhxg/GaoGuanJiaoYi/shichangtongji",//打榜市场统计

        //打榜市行业统计
        INDUSTRY_CENCUS_LIST:"/ydhxg/GaoGuanJiaoYi/hangyetongji",//打榜行业统计,


        /**
        * 机构调研
        * */
        //机构调研最新调研
        NEW_RESEARCH_LIST:"/ydhxg/JiGouDiaoYan/zuixindiaoyan",//最新调研,
        CONSISTENTLY_LIST:"/ydhxg/JiGouDiaoYan/yizhikanduo",//一致看多,
        FOCUSINDUSTRY_LIST:"/ydhxg/JiGouDiaoYan/guanzhuhangye",//关注行业,
        FOCUSSTOCKS_LIST:"/ydhxg/JiGouDiaoYan/guanzhugegu",//关注行业,

        NEW_SEARCH_LIST:"/ydhxg/JiGouDiaoYan/searchZuiXinDiaoYan",//最新调研搜索列表接口,

        /**
         * 选股模块
         * 指标选股和组合战法点击后的详情页
         * */
        SPECIAL_DETAILS_LIST:"/ydhxg/DingJu/tesezhibiaoxuangulist",//前端获取指标和组合战法详情页


        /**
        * 选股模块
        * 指标选股tab
         *价值策略
        * */
        TARGET_SELECT_LIST:"/celuexuangu/getjiazhicelue",//前端获取单个价值策略的数据
        VALUE_HISTORY_LIST:"/celuexuanguRes20/gaoChengZhangRes20",//前端获取高成长历史数据
        LOW_HISTORY_LIST:"/celuexuanguRes20/diGuZhiRes20",//前端获取低估值数据
        BUY_HISTORY_LIST:"/celuexuanguRes20/zengChiHuiGouRes20",//前端获股东增持数据
       // BROW_HISTORY_LIST:"/celuexuanguRes20/xianJinNiuRes20",//前端获现金牛数据
        WHITE_HISTORY_LIST:"/celuexuanguRes20/baiMaJiYouRes20",//前端获白马绩优数据
        RED_HISTORY_LIST:"/celuexuanguRes20/gaoFenHongRes20",//前端获高分红数据
        HIGH_HISTORY_LIST:"/celuexuanguRes20/gaoYingLiRes20",//前端获高盈利数据
       // YUN_HISTORY_LIST:"/celuexuanguRes20/gaoYunYingRes20",//前端获高运营数据
        HIGH_SONGZHUAN_LIST:"/celuexuanguRes20/xianJinNiuRes20",//前端获高送转数据
        YJYZ_LIST:"/celuexuanguRes20/yeJiYuZengRes20",//前端获高送转数据


        /**
         * 特色指标选股历史战绩接口
         * */
        TSZB_HISTORY_LIST:'/ydhxg/DingJu/lishizhanji',//特色指标


        /**
        * 选股模块
         * 研报策略tab
        * */
        START_RESEARCH_LIST:"/celuexuangu/getmingxingfenxi",//研报策略，明星分析师
        HOUSE_RESEARCH_LIST:"/celuexuangu/getmingxingjigou",//研报策略，明星机构
        BURST_RESEARCH_LIST:"/celuexuangu/getzhangfukongjian",//研报策略，涨幅最大

        /**
         * 收益统计
         * 搜索接口,接口是单独的
         * */
        PROFIT_SEARCH_LIST:"https://newf10.ydtg.com.cn/apis/fis/v1/pcapp/qtd/keyDemons",//最新调研搜索列表接口,
       // PROFIT_SEARCH_LIST_TEST:"http://39.97.225.226:8080/apis/fis/v1/pcapp/qtd/keyDemons",//收益统计接口（测试环境）(已经废弃),



}