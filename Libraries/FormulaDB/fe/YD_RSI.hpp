//
//  YD_RSI.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_RSI_hpp
#define YD_RSI_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class RSI : public Formula
{
public:
    RSI();
    virtual ~RSI();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};
#endif /* YD_RSI_hpp */
