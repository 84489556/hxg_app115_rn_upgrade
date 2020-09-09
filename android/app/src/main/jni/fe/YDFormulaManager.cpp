//
//  YDFormulaManager.cpp
//  DzhChart
//
//  Created by apple on 16/5/19.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include <stdio.h>
#include "YDFormulaBase.hpp"
#include "YD_MA.hpp"
#include "YD_BOLL.hpp"
#include "YD_VOL.hpp"
#include "YD_MACD.hpp"
#include "YD_KDJ.hpp"
#include "YD_RSI.hpp"
#include "YD_BIAS.hpp"
#include "YD_CCI.hpp"
#include "YD_WR.hpp"
#include "YD_DMA.hpp"
#include "YD__Fml.hpp"
#include "YD__Fml_Min.hpp"


shared_ptr<Formula> FormulaManager::getFormula(string formulaName)
{
    if( formulaName == "MA" )
        return make_shared<MA>();
    else if( formulaName == "BOLL")
        return make_shared<BOLL>();
    else if( formulaName == "VOL")
        return make_shared<VOL>();
    else if( formulaName == "MACD")
        return make_shared<MACD>();
    else if( formulaName == "KDJ")
            return make_shared<KDJ>();
    else if( formulaName == "RSI")
        return make_shared<RSI>();
    else if( formulaName == "BIAS")
        return make_shared<BIAS>();
    else if( formulaName == "CCI")
        return make_shared<CCI>();
    else if( formulaName == "WR")
        return make_shared<WR>();
    else if( formulaName == "DMA")
        return make_shared<DMA>();
    
    if( formulaName == "变盘预测" )
        return make_shared<BPYC>();
    else if ( formulaName == "仓位策略" )
        return make_shared<CWCL>();
    else if ( formulaName == "ZLDT" )
        return make_shared<ZLDT>();
    else if ( formulaName == "点石成金" )
        return make_shared<DSCJ>();
    else if ( formulaName == "抄底策略" )
        return make_shared<CDCL>();
    else if ( formulaName == "逃顶策略" )
        return make_shared<TDCL>();
    else if ( formulaName == "短线趋势" )
        return make_shared<DXQS>();
    else if ( formulaName == "中线趋势" )
        return make_shared<ZXQS>();
    else if ( formulaName == "操盘提醒" )
        return make_shared<CPTX>();
    else if ( formulaName == "底部筹码" )
        return make_shared<ZLXC>();
    else if ( formulaName == "波动极限" )
        return make_shared<BoDongJiXian>();
    else if ( formulaName == "趋势强度" )
        return make_shared<QuShiQiangDu>();
    else if ( formulaName == "量能黄金" )
        return make_shared<LiangNengHuangJin>();
    else if ( formulaName == "强弱转换" )
        return make_shared<QiangRuoZhuanHuan>();
    else if ( formulaName == "趋势彩虹" )
        return make_shared<QuShiCaiHong>();
    else if ( formulaName == "短线趋势彩虹" )
        return make_shared<ShortQuShiCaiHong>();
    else if ( formulaName == "济安线" )
        return make_shared<JiAnXian>();
    else if ( formulaName == "周期拐点" )
        return make_shared<ZhouQiGuaiDian>();
    else if ( formulaName == "蓝粉彩带" )
        return make_shared<LFCD>();
    else if ( formulaName == "中期彩带" )
        return make_shared<ZQCD>();
    else if ( formulaName == "趋势导航")
        return make_shared<QSDH>();
    else if ( formulaName == "多空资金")
        return make_shared<DKZJ>();
    else if ( formulaName == "主力资金")
        return make_shared<ZLZJ>();
    else if ( formulaName == "九转战法")
        return make_shared<JZZF>();
    else if ( formulaName == "多空预警")
        return make_shared<DKYJ>();
    else if ( formulaName == "分时走势") // 分时主图默认指标
        return make_shared<FSZS>();
    else if ( formulaName == "分时冲关") // 分时主图指标
        return make_shared<STZF>();
    else if ( formulaName == "成交量") // 分时副图成交量
        return make_shared<MinVOL>();
    else if ( formulaName == "资金流入") // 分时副图指标
        return make_shared<FundFlow>();
    else if ( formulaName == "顶底判断")
        return make_shared<DDPD>();

    return shared_ptr<Formula>();
}