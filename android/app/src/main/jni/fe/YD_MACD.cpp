//
//  YD_MACD.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_MACD.hpp"
#include "YDInnerFunction.hpp"

vector<int> MACD::defaultParas{ 12, 26, 9 };

MACD::MACD()
{
    _parameters = MACD::defaultParas;
}

MACD::~MACD()
{
    
}

const FormulaResults& MACD::run()
{
    /*DIFF: EMA(CLOSE,SHORT) - EMA(CLOSE,LONG),colorwhite;
     DEA: EMA(DIFF,M),coloryellow;
     MACD: 2*(DIFF-DEA), COLORSTICK
     */
    
    _result.clear();
    vector<double> C(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    
    int SHORT   = _parameters[0];
    int LONG    = _parameters[1];
    int M       = _parameters[2];
    
    shared_ptr<FormulaLine> DIFF = make_shared<FormulaLine>();
    DIFF->_name = "DIFF";
    DIFF->_data = __EMA(C, SHORT) - __EMA(C, LONG);
    DIFF->_color = COLOR01;
    _result.push_back(FormulaResult(DIFF));
    
    shared_ptr<FormulaLine> DEA = make_shared<FormulaLine>();
    DEA->_name = "DEA";
    DEA->_data = __EMA(DIFF->_data, M);
    DEA->_color = COLOR02;
    _result.push_back(FormulaResult(DEA));
    
    
    shared_ptr<FormulaLine> MACD = make_shared<FormulaLine>();
    MACD->_name = "MACD";
    MACD->_data = (DIFF->_data-DEA->_data) * 2;
    MACD->_type = COLORSTICK;
    MACD->_color= COLOR03;
    _result.push_back(FormulaResult(MACD));
    
    return _result;
}



