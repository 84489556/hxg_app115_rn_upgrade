//
//  YD_VOL.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_VOL_hpp
#define YD_VOL_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class VOL : public Formula
{
public:
    VOL();
    virtual ~VOL();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};

#endif /* YD_VOL_hpp */
