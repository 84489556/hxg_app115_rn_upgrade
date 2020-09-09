//
//  YDFormulaMA.cpp
//  DzhChart
//
//  Created by apple on 16/5/19.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD_MA.hpp"
#include "YDInnerFunction.hpp"

#include <sstream>

int color[ 6 ] = {COLOR01, COLOR02, COLOR10,COLOR04 };
vector<int> MA::defaultParas{ 5, 10, 20, 30 };

MA::MA()
{
    _parameters = MA::defaultParas;
}

MA::~MA()
{
    
}

const FormulaResults& MA::run()
{
    _result.clear();
    vector<double> C(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    for(size_t i=0 ; i < _parameters.size(); ++i)
    {
        int P =  _parameters[i];
        stringstream ss;
        ss<< "MA" << P;
        
        shared_ptr<FormulaLine> line = make_shared<FormulaLine>();;
        line->_name = ss.str();
        line->_data = __MA(C, P);
        line->_color = color[i];
        
        _result.push_back(FormulaResult(line));
    }
    return _result;
}