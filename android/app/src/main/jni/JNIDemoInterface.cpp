//
// Created by yzj on 12/23/15.
//

#include "FormulaResultFactory.hpp"

//void *initializeFE() {
//    return (void*)&FormulaResultFactory::GetInstance();
////    FormulaResultFactory * FRF = new FormulaResultFactory();
////    return (void *)FRF;
//}

extern "C"
char * getFormulaResultJson(char * name, char * sticks) {
//    FormulaResultFactory::GetInstance().getFormulaResultSize(name, sticks);
//    return FormulaResultFactory::GetInstance().createdata_json();

    return FormulaResultFactory::GetInstance().getFormulaResultSize(name, sticks);
}

extern "C"
char * getFormulaResultJson4Min(char * name, char * sticks) {
    return FormulaResultFactory::GetInstance().getFormulaResultSize4Min(name, sticks);
}

extern "C"
char * getSplitDataJson(char * sticks, char * exright, int split, int period) {
    if (split==0) return sticks;

//    FormulaResultFactory::GetInstance().getSplitDataSize(sticks, exright, split);
//    return FormulaResultFactory::GetInstance().createrightdata_json();

    return FormulaResultFactory::GetInstance().getSplitDataSize(sticks, exright, split, period);
}

/*
 *
 static FormulaResultFactory frl;

extern "C"
void *initializeFE() {
    return (void*)&frl;
//    FormulaResultFactory * FRF = new FormulaResultFactory();
//    return (void *)FRF;
}
extern "C"
char * getFormulaResultJson(void * pVoid, char * name, char * sticks) {
    ((FormulaResultFactory *)(pVoid)) -> getFormulaResultSize(name, sticks);
    return ((FormulaResultFactory *)(pVoid)) -> createdata_json();
}
extern "C"
char * getSplitDataJson(void * pVoid, char * sticks, char * exright, int split) {
    if (split==0) return sticks;

    ((FormulaResultFactory *)(pVoid)) -> getSplitDataSize(sticks, exright, split);
    return ((FormulaResultFactory *)(pVoid)) -> createrightdata_json();
}
extern "C"
void *finalizeFE(void *pVoid) {
//    delete ((FormulaResultFactory *)(pVoid));
}

 */