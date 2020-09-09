//
//  YD_DMA.hpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YD_DMA_hpp
#define YD_DMA_hpp

#include <stdio.h>
#include "YDFormulaBase.hpp"

class DMA : public Formula
{
public:
    DMA();
    virtual ~DMA();
    
    virtual const FormulaResults& run() override;
    
private:
    static vector<int> defaultParas;
};
#endif /* YD_DMA_hpp */
