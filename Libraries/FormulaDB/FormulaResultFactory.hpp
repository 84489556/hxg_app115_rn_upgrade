//
// Created by yzj on 12/23/15.
//

#ifndef FormulaResultFactory_hpp
#define FormulaResultFactory_hpp



#pragma mark 公式计算结果


#include "fe/YDFormulaBase.hpp"
#include "cJSON/cJSON.h"


class FormulaResultFactory
{
public:
    static FormulaResultFactory& GetInstance();

    char * getFormulaResultSize(const char * formulaName, const char * kdata);
    char * getFormulaResultSize4Min(const char * formulaName, const char * mindata);
    char * getSplitDataSize(const char * sticks, const char * exright, int split, int period);

    char * createdata_json(FormulaResults & frs);
    char * createrightdata_json(std::vector<KLineStick> &);
    char * createmindata_json(FormulaResults & frs);
    void createone(cJSON * one, FormulaResult & fr);
    void createone(cJSON * one, KLineStick & ksobj);

protected:
//    FormulaResults _fr;
//    std::vector<KLineStick> _splitData;

private:
    void parse2KLineStick(const char * kdata, std::vector<KLineStick> & vRes);
    void parse2FundFlowStick(const char * kdata, std::vector<FundFlowStick> & vRes);
    void parse2MinStick(const char * mindata, std::vector<MinStick> & vRes, MinOtherData & otherData);
    void parse2ExRight(const char * exRights, std::vector<ExRight> & vRes);

    FormulaResultFactory();
    ~FormulaResultFactory();


private:
    static  FormulaResultFactory m_Instance;
};

#endif /* FormulaResultFactory_hpp */
