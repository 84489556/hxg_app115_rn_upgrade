//
//  YD_MACD.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_MACD_hpp
#define YD_MACD_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class MACD : public Formula
{
public:
    MACD();
    virtual ~MACD();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};
#endif /* YD_MACD_hpp */
