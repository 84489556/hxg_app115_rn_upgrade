//
//  YD_KDJ.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_KDJ_hpp
#define YD_KDJ_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class KDJ : public Formula
{
public:
    KDJ();
    virtual ~KDJ();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};


#endif /* YD_KDJ_hpp */
