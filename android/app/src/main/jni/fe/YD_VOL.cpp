//
//  YD_VOL.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_VOL.hpp"
#include "YDInnerFunction.hpp"

vector<int> VOL::defaultParas{ 5, 10, 20 };

VOL::VOL()
{
    _parameters = VOL::defaultParas;
}

VOL::~VOL()
{
    
}

const FormulaResults& VOL::run()
{
    /*
     VOL,VOLSTICK;
     MA1:MA(VOL,M1),colorwhite;
     MA2:MA(VOL,M2),coloryellow;
     MA3:MA(VOL,M3),colorff00ff
     */
    
    _result.clear();
    vector<double> V(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});
    
    int M1  = _parameters[0];
    int M2  = _parameters[1];
    int M3  = _parameters[2];
    
    shared_ptr<FormulaLine> VOL = make_shared<FormulaLine>();
    VOL->_name = "VOL";
    VOL->_data = V;
    VOL->_type = VOLSTICK;
    _result.push_back(FormulaResult(VOL));
    
    shared_ptr<FormulaLine> MA1 = make_shared<FormulaLine>();
    MA1->_name = "MA1";
    MA1->_data = __MA(V, M1);
    MA1->_color = COLOR01;
    _result.push_back(FormulaResult(MA1));
   
    shared_ptr<FormulaLine> MA2 = make_shared<FormulaLine>();
    MA2->_name = "MA2";
    MA2->_data = __MA(V, M2);
    MA2->_color = COLOR02;
    _result.push_back(FormulaResult(MA2));
    
    shared_ptr<FormulaLine> MA3 = make_shared<FormulaLine>();
    MA3->_name = "MA3";
    MA3->_data = __MA(V, M3);
    MA3->_color = COLOR03;
    _result.push_back(FormulaResult(MA3));
    
    return _result;
}
