//
//  YD_BOLL.cpp
//  DzhChart
//
//  Created by apple on 16/5/26.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_BOLL.hpp"
#include "YDInnerFunction.hpp"

vector<int> BOLL::defaultParas{ 20, 2 };

BOLL::BOLL()
{
    _parameters = BOLL::defaultParas;
}

BOLL::~BOLL()
{
    
}

const FormulaResults& BOLL::run()
{
    _result.clear();
    vector<double> C(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    
    int N = _parameters[0];
    int P = _parameters[1];
    
    // MID :  MA(CLOSE,N),colorwhite;
    shared_ptr<FormulaLine> MID = make_shared<FormulaLine>();
    MID->_name = "MID";
    MID->_data = __MA(C, N);
    MID->_color = COLOR01;
    _result.push_back(FormulaResult(MID));

    //UPPER:MID + P*STDDEV(CLOSE,N),coloryellow;
    shared_ptr<FormulaLine> UPPER = make_shared<FormulaLine>();
    UPPER->_name = "UPPER";
    UPPER->_data = MID->_data + __STDDEV(C, N) * P;
    UPPER->_color = COLOR02;
    _result.push_back(FormulaResult(UPPER));
    
    
    //LOWER:MID - P*STDDEV(CLOSE,N),colorff00ff;
    shared_ptr<FormulaLine> LOWER = make_shared<FormulaLine>();
    LOWER->_name = "LOWER";
    LOWER->_data = MID->_data + (__STDDEV(C, N) * -P) ;
    LOWER->_color = COLOR10;
    _result.push_back(FormulaResult(LOWER));
    

    return _result;
}
