//
//  YD_DMA.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_DMA.hpp"
#include "YDInnerFunction.hpp"

vector<int> DMA::defaultParas{ 10, 50, 10 };

DMA::DMA()
{
    _parameters = DMA::defaultParas;
}

DMA::~DMA()
{
    
}

const FormulaResults& DMA::run()
{
    /*
     dda: (MA(CLOSE,SHORT)-MA(CLOSE,LONG)),colorwhite;
     AMA : MA(dda,M),coloryellow
     */
    
    _result.clear();
    vector<double> C(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    
    int SHORT = _parameters[0];
    int LONG  = _parameters[1];
    int M     = _parameters[2];
    
    shared_ptr<FormulaLine> DDA = make_shared<FormulaLine>();;
    DDA->_name = "DDA";
    DDA->_data = __MA(C, SHORT) - __MA(C, LONG);
    DDA->_color = COLOR01;
    _result.push_back(FormulaResult(DDA));
    
    shared_ptr<FormulaLine> AMA = make_shared<FormulaLine>();;
    AMA->_name = "AMA";
    AMA->_data = __MA(DDA->_data, M);
    AMA->_color = COLOR02;
    _result.push_back(FormulaResult(AMA));
    
    return _result;
}
