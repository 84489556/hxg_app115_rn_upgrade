//
//  YD_WR.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_WR.hpp"
#include "YDInnerFunction.hpp"

vector<int> WR::defaultParas{ 10, 20, 80 };

WR::WR()
{
    _parameters = WR::defaultParas;
}

WR::~WR()
{
    
}

const FormulaResults& WR::run()
{
    /*
     WR1:100*(HHV(HIGH,N)-CLOSE)/(HHV(HIGH,N)-LLV(LOW,N)),colorwhite;
     WR2:100*(HHV(HIGH,N1)-CLOSE)/(HHV(HIGH,N1)-LLV(LOW,N1)),coloryellow;
     */
    
    _result.clear();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    
    int N  = _parameters[0];
    int N1 = _parameters[1];
    int N2 = _parameters[2];

    shared_ptr<FormulaLine> WR1 = make_shared<FormulaLine>();
    WR1->_name = "WR1";
    WR1->_data = (__HHV(H,N)-C)*100 / (__HHV(H,N) - __LLV(L,N));
    WR1->_color = COLOR01;
    _result.push_back(FormulaResult(WR1));
    
    shared_ptr<FormulaLine> WR2 = make_shared<FormulaLine>();
    WR2->_name = "WR2";
    WR2->_data = (__HHV(H,N1)-C)*100 / (__HHV(H,N1) - __LLV(L,N1));
    WR2->_color = COLOR02;
    _result.push_back(FormulaResult(WR2));

    shared_ptr<FormulaLine> WR3 = make_shared<FormulaLine>();
    WR3->_name = "WR3";
    WR3->_data = (__HHV(H,N2)-C)*100 / (__HHV(H,N2) - __LLV(L,N2));
    WR3->_color = COLORBLACK;
    _result.push_back(FormulaResult(WR3));

    
    return _result;
}
