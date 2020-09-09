//
//  YD_RSI.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_RSI.hpp"
#include "YDInnerFunction.hpp"

vector<int> RSI::defaultParas{ 6, 12, 24 };

RSI::RSI()
{
    _parameters = RSI::defaultParas;
}

RSI::~RSI()
{
    
}

const FormulaResults& RSI::run()
{
    /*
     LC := REF(CLOSE,1);
     RSI1:SMA(MAX(CLOSE-LC,0),N1,1)/SMA(ABS(CLOSE-LC),N1,1)*100,colorwhite;
     RSI2:SMA(MAX(CLOSE-LC,0),N2,1)/SMA(ABS(CLOSE-LC),N2,1)*100,coloryellow;
     RSI3:SMA(MAX(CLOSE-LC,0),N3,1)/SMA(ABS(CLOSE-LC),N3,1)*100,colorff00ff;
     */
    
    _result.clear();
    vector<double> C(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});

    
    int N1  = _parameters[0];
    int N2  = _parameters[1];
    int N3  = _parameters[2];
    
    vector<double> LC  = __REF(C , 1);
    vector<double> MAX = __MAX( C - LC, 0);
    vector<double> ABS = __ABS( C - LC);
    
    
    shared_ptr<FormulaLine> RSI1 = make_shared<FormulaLine>();;
    RSI1->_name = "RSI1";
    RSI1->_data = (__SMA(MAX, N1, 1) / __SMA(ABS, N1, 1)) * 100;
    RSI1->_color = COLOR01;
    _result.push_back(FormulaResult(RSI1));
    
    
    shared_ptr<FormulaLine> RSI2 = make_shared<FormulaLine>();;
    RSI2->_name = "RSI2";
    RSI2->_data =  (__SMA(MAX, N2, 1) / __SMA(ABS, N2, 1)) * 100;
    RSI2->_color = COLOR02;
    _result.push_back(FormulaResult(RSI2));
    
    shared_ptr<FormulaLine> RSI3 = make_shared<FormulaLine>();;
    RSI3->_name = "RSI3";
    RSI3->_data =  (__SMA(MAX, N3, 1) / __SMA(ABS, N3, 1)) * 100;
    RSI3->_color = COLOR03;
    _result.push_back(FormulaResult(RSI3));
    
    return _result;
}
