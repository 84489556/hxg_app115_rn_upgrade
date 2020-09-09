//
//  YD__BPYC.hpp
//  DzhChart
//
//  Created by apple on 16/6/13.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD__FML_hpp
#define YD__FML_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

//变盘预测
class BPYC : public Formula
{
public:
    virtual const FormulaResults& run() override;

};

//仓位策略
class CWCL : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//主力动态
class ZLDT : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//点石成金
class DSCJ : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//抄底策略
class CDCL : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//逃顶策略
class TDCL : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//短线趋势
class DXQS : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//中线趋势
class ZXQS : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//操盘提醒
class CPTX : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//底部出击(旧名 主力吸筹, 底部筹码)
class ZLXC : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//蓝粉彩带
class LFCD : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//中期彩带
class ZQCD : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//波动极限
class BoDongJiXian : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//趋势强度
class QuShiQiangDu : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//量能黄金
class LiangNengHuangJin : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//强弱转换
class QiangRuoZhuanHuan : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//趋势彩虹
class QuShiCaiHong : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//短线趋势彩虹
class ShortQuShiCaiHong : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//济安线
class JiAnXian : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//周期拐点（双CCI）
class ZhouQiGuaiDian : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//趋势导航（楚河汉界）
class QSDH : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//多空资金
class DKZJ : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//主力资金
class ZLZJ : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//九转战法
class JZZF : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//多空预警
class DKYJ : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//顶底判断（逃顶策略+抄底策略）
class DDPD : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

//资金雷达(主力资金5日，五期资金)
class ZLZJ5 : public Formula
{
public:
    virtual const FormulaResults& run() override;
};

#endif /* YD__FML_hpp */
