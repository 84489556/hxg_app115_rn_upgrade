//
//  YD_CCI.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_CCI_hpp
#define YD_CCI_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class CCI : public Formula
{
public:
    CCI();
    virtual ~CCI();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};
#endif /* YD_CCI_hpp */
