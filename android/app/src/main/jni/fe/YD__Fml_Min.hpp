//
//  YD__Fml_Min.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD__FML_MIN_hpp
#define YD__FML_MIN_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"


//分时走势（分时主图默认）
class FSZS : public Formula
{
public:
    virtual const FormulaResults& run() override;

};

//分时冲关（旧名 双突战法（分时主图））
class STZF : public Formula
{
public:
	STZF();
    virtual ~STZF();

    virtual const FormulaResults& run() override;

private:
    static vector<int> defaultParas;
};

//成交量（分时副图）
class MinVOL : public Formula
{
public:
    virtual const FormulaResults& run() override;

};

//资金流入（分时副图）
class FundFlow : public Formula
{
public:
    virtual const FormulaResults& run() override;

};



#endif /* YD__FML_MIN_hpp */
