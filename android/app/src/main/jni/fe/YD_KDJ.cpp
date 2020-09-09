//
//  YD_KDJ.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_KDJ.hpp"
#include "YDInnerFunction.hpp"

vector<int> KDJ::defaultParas{ 9, 3, 3 };

KDJ::KDJ()
{
    _parameters = KDJ::defaultParas;
}

KDJ::~KDJ()
{
    
}

const FormulaResults& KDJ::run()
{
    /*
     RSV:=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;
     K:SMA(RSV,M1,1),colorwhite;
     D:SMA(K,M2,1),coloryellow;
     J:3*K-2*D,colorff00ff
     */
    
    _result.clear();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    
    int N   = _parameters[0];
    int M1  = _parameters[1];
    int M2  = _parameters[2];

    vector<double> RSV  = ((C-__LLV(L,N)) / (__HHV(H,N)-__LLV(L,N))) * 100;

    
    shared_ptr<FormulaLine> K = make_shared<FormulaLine>();;
    K->_name = "K";
    K->_data = __SMA(RSV, M1, 1);
    K->_color = COLOR01;
    _result.push_back(FormulaResult(K));
    
    
    shared_ptr<FormulaLine> D = make_shared<FormulaLine>();;
    D->_name = "D";
    D->_data = __SMA(K->_data, M2, 1);
    D->_color = COLOR02;
    _result.push_back(FormulaResult(D));
  
    shared_ptr<FormulaLine> J = make_shared<FormulaLine>();;
    J->_name = "J";
    J->_data = K->_data * 3 - D->_data * 2;
    J->_color = COLOR03;
    _result.push_back(FormulaResult(J));
    return _result;
}
