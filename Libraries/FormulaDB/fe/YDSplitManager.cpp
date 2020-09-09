//
//  YDFormulaManager.cpp
//  DzhChart
//
//  Created by apple on 16/5/19.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include <stdio.h>
#include "YDFormulaBase.hpp"
#include "SplitCalculate.hpp"


void SplitManager::getSplit(const std::vector<KLineStick> source, std::vector<ExRight> exrights, int split, int period, std::vector<KLineStick>& des){
    CSplitCalculate::ins()->calcSplitData(source,exrights, static_cast<SplitT>(split), static_cast<PeriodT>(period), des);
}

