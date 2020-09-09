//
//  YD_BIAS.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_BIAS_hpp
#define YD_BIAS_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class BIAS : public Formula
{
public:
    BIAS();
    virtual ~BIAS();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};
#endif /* YD_BIAS_hpp */
