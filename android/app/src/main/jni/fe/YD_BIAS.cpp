//
//  YD_BIAS.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_BIAS.hpp"
#include "YDInnerFunction.hpp"

vector<int> BIAS::defaultParas{ 6, 12, 24 };

BIAS::BIAS()
{
    _parameters = BIAS::defaultParas;
}

BIAS::~BIAS()
{
    
}

const FormulaResults& BIAS::run()
{
    /*
     BIAS1 : (CLOSE-MA(CLOSE,L1))/MA(CLOSE,L1)*100,colorwhite;
     BIAS2 : (CLOSE-MA(CLOSE,L2))/MA(CLOSE,L2)*100,coloryellow;
     BIAS3 : (CLOSE-MA(CLOSE,L3))/MA(CLOSE,L3)*100,colorff00ff;
     */
    
    _result.clear();
    vector<double> C(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    
    
    int L1  = _parameters[0];
    int L2  = _parameters[1];
    int L3  = _parameters[2];
    
    vector<double> LC  = __REF(C , 1);
    vector<double> MAX = __MAX( C - LC, 0);
    vector<double> ABS = __ABS( C - LC);
    
    
    shared_ptr<FormulaLine> BIAS1 = make_shared<FormulaLine>();
    BIAS1->_name = "BIAS1";
    BIAS1->_data = (C-__MA(C,L1))/__MA(C,L1) * 100;
    BIAS1->_color = COLOR01;
    _result.push_back(FormulaResult(BIAS1));
    
    
    shared_ptr<FormulaLine> BIAS2 = make_shared<FormulaLine>();
    BIAS2->_name = "BIAS2";
    BIAS2->_data = (C-__MA(C,L2))/__MA(C,L2) * 100;
    BIAS2->_color = COLOR02;
    _result.push_back(FormulaResult(BIAS2));
    
    shared_ptr<FormulaLine> BIAS3 = make_shared<FormulaLine>();
    BIAS3->_name = "BIAS3";
    BIAS3->_data = (C-__MA(C,L3))/__MA(C,L3) * 100;
    BIAS3->_color = COLOR03;
    _result.push_back(FormulaResult(BIAS3));
    
    return _result;
}
