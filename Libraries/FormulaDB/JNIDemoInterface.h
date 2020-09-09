//
// Created by yzj on 12/23/15.
//

#ifndef JNA_ON_AS_JNIDEMOINTERFACE_H
#define JNA_ON_AS_JNIDEMOINTERFACE_H

#include "fe/YDFormulaBase.hpp"


extern "C" void * initializeFE();
extern "C" char * getFormulaResultJson(void * pVoid, char * name, char * sticks);
extern "C" char * getFormulaResultJson4Min(void * pVoid, char * name, char * sticks);
extern "C" char * getSplitDataJson(void * pVoid, char * sticks, char * exright, int split);
extern "C" void * finalizeFE(void *);


#endif //JNA_ON_AS_JNIDEMOINTERFACE_H
