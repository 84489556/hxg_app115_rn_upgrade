//
//  YDFormulaMA.hpp
//  DzhChart
//
//  Created by apple on 16/5/19.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YDFormulaMA_hpp
#define YDFormulaMA_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class MA : public Formula
{
public:
    MA();
    virtual ~MA();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};

#endif /* YDFormulaMA_hpp */
