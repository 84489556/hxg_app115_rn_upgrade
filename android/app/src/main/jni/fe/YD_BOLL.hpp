//
//  YD_BOLL.hpp
//  DzhChart
//
//  Created by apple on 16/5/26.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_BOLL_hpp
#define YD_BOLL_hpp

#include <stdio.h>

#include "YDFormulaBase.hpp"

class BOLL : public Formula
{
public:
    BOLL();
    virtual ~BOLL();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};

#endif /* YD_BOLL_hpp */
