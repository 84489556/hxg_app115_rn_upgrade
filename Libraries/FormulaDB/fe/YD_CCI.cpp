//
//  YD_CCI.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_CCI.hpp"
#include "YDInnerFunction.hpp"

vector<int> CCI::defaultParas{ 14 };

CCI::CCI()
{
    _parameters = CCI::defaultParas;
}

CCI::~CCI()
{
    
}

const FormulaResults& CCI::run()
{
    /*
     P:=(HIGH + LOW + CLOSE)/3;
     cci:(P-MA(P,N))*100/(1.5*avedev(P,N)),colorwhite;
     
     -100,pointdot,color00aa00;
     100,pointdot,color00aa00
     */
    
    _result.clear();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    
    
    int N  = _parameters[0];

    
    vector<double> P  = (H + L + C) / 3;
    
    vector<double> tem = P-__MA(P,N);
    vector<double> tem2 = __AVEDEV(P,N);
    shared_ptr<FormulaLine> CCI = make_shared<FormulaLine>();
    CCI->_name = "CCI";
    CCI->_data = (P-__MA(P,N) ) / (__AVEDEV(P,N) * 1.5) * 100;
    CCI->_color = COLOR01;
    _result.push_back(FormulaResult(CCI));
    
    
    shared_ptr<FormulaLine> YAxis1 = make_shared<FormulaLine>();
    YAxis1->_name = "";
    YAxis1->_data = vector<double>(_sticks.size(), -100.0);
    YAxis1->_color = 0x00AA00;
    _result.push_back(FormulaResult(YAxis1));
    
    shared_ptr<FormulaLine> YAxis2 = make_shared<FormulaLine>();
    YAxis2->_name = "";
    YAxis2->_data = vector<double>(_sticks.size(), 100.0);
    YAxis2->_color = 0x00AA00;
    _result.push_back(FormulaResult(YAxis2));
    
    return _result;
}
