//
//  YD_WR.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_WR_hpp
#define YD_WR_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class WR : public Formula
{
public:
    WR();
    virtual ~WR();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};
#endif /* YD_WR_hpp */
