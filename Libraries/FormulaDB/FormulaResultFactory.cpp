//
// Created by yzj on 12/23/15.
//

#include <stdio.h>
#include <vector>
#include "FormulaResultFactory.hpp"
#include "fe/SplitCalculate.hpp"

FormulaResultFactory FormulaResultFactory::m_Instance;//类外定义-不要忘记写

FormulaResultFactory& FormulaResultFactory::GetInstance()
{
    return m_Instance;
}

FormulaResultFactory::FormulaResultFactory()
{

}

FormulaResultFactory::~FormulaResultFactory()
{

}

void FormulaResultFactory::parse2KLineStick(const char * kdata, std::vector<KLineStick> & vRes) {

    if(strlen(kdata) == 0)
        return;
    KLineStick ks;
    cJSON * pSub = NULL;
    cJSON * pKData = cJSON_Parse(kdata);
    int len = cJSON_GetArraySize(pKData);
    for (int i = 0; i < len; ++i) {
        cJSON * pArray = cJSON_GetArrayItem(pKData, i);

        pSub = cJSON_GetObjectItem(pArray ,"time");
        ks.time = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"open");
        ks.open = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"high");
        ks.high = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"low");
        ks.low = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"close");
        ks.close = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"volume");
        ks.volume = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"amount");
        ks.amount = pSub->valuedouble;

        vRes.push_back(ks);

    }
}

void FormulaResultFactory::parse2FundFlowStick(const char * kdata, std::vector<FundFlowStick> & vRes) {
    if(strlen(kdata) == 0)
        return;
    FundFlowStick ff;
    cJSON * pSub = NULL;
    cJSON * pKData = cJSON_Parse(kdata);
    int len = cJSON_GetArraySize(pKData);
    for (int i = 0; i < len; ++i) {
        cJSON * pArray = cJSON_GetArrayItem(pKData, i);

        pSub = cJSON_GetObjectItem(pArray ,"littleIn");
        ff.littleIn = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"littleOut");
        ff.littleOut = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"mediumIn");
        ff.mediumIn = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"mediumOut");
        ff.mediumOut = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"hugeIn");
        ff.hugeIn = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"hugeOut");
        ff.hugeOut = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"largeIn");
        ff.largeIn = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"largeOut");
        ff.largeOut = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"superIn");
        ff.superIn = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"superOut");
        ff.superOut = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"total");
        ff.total = pSub->valuedouble;

        vRes.push_back(ff);

    }
}

void FormulaResultFactory::parse2MinStick(const char * mindata, std::vector<MinStick> & vRes, MinOtherData & otherData) {

    if(strlen(mindata) == 0)
        return;

    cJSON * pSub = NULL;
    cJSON * pAllData = cJSON_Parse(mindata);


    cJSON * pOtherData = cJSON_GetObjectItem(pAllData,"otherData");
    pSub = cJSON_GetObjectItem(pOtherData ,"preClose");
    otherData.preClose = pSub->valuedouble;
    pSub = cJSON_GetObjectItem(pOtherData ,"circulateEquityA");
    otherData.circulateEquityA = pSub->valuedouble;


    cJSON * pMinData = cJSON_GetObjectItem(pAllData,"minData");
    int len = cJSON_GetArraySize(pMinData);
    MinStick ms;
    for (int i = 0; i < len; ++i) {
        cJSON * pArray = cJSON_GetArrayItem(pMinData, i);

        pSub = cJSON_GetObjectItem(pArray ,"time");
        ms.time = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"price");
        ms.price = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"avgprice");
        ms.avgprice = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"volume");
        ms.volume = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"amount");
        ms.amount = pSub->valuedouble;

        vRes.push_back(ms);

    }
}

void FormulaResultFactory::parse2ExRight(const char * exRights, std::vector<ExRight> & vRes) {

    ExRight er;
    cJSON * pSub = NULL;
    cJSON * pExRights = cJSON_Parse(exRights);
    int len = cJSON_GetArraySize(pExRights);
    for (int i = 0; i < len; ++i) {
        cJSON * pArray = cJSON_GetArrayItem(pExRights, i);

        pSub = cJSON_GetObjectItem(pArray ,"lastUpdateTime");
        er.lastUpdateTime = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"stockCode");
        er.stockCode = pSub->valuestring;
        pSub = cJSON_GetObjectItem(pArray ,"subType");
        er.subType = pSub->valuestring;
        pSub = cJSON_GetObjectItem(pArray ,"exright_date");
        er.exright_date = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"alloc_interest");
        er.alloc_interest = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"give");
        er.give = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"extend");
        er.extend = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"match");
        er.match = pSub->valuedouble;
        pSub = cJSON_GetObjectItem(pArray ,"match_price");
        er.match_price = pSub->valuedouble;

        vRes.push_back(er);

    }
}

char * FormulaResultFactory::getFormulaResultSize(const char * formulaName, const char * kdata)
{

    std::vector<KLineStick> sticks;
    parse2KLineStick(kdata, sticks);
    std::vector<FundFlowStick> sticksFundFlow;
    parse2FundFlowStick(kdata, sticksFundFlow);


    string name = formulaName;
    shared_ptr<Formula> mainFormula = FormulaManager::getFormula(name);
    mainFormula->setSticks(sticks);
    mainFormula->setFundFlowSticks(sticksFundFlow);
    mainFormula->run();

    FormulaResults frs = mainFormula->getResult();


    return createdata_json(frs);

//    return _fr.size();
}

char * FormulaResultFactory::getFormulaResultSize4Min(const char * formulaName, const char * mindata)
{

    std::vector<MinStick> sticks;
    MinOtherData otherData;
    parse2MinStick(mindata, sticks, otherData);


    string name = formulaName;
    shared_ptr<Formula> mainFormula = FormulaManager::getFormula(name);
    mainFormula->setSticks(sticks);
    mainFormula->setOtherData(otherData);
    mainFormula->run();

    FormulaResults frs = mainFormula->getResult();


    return createmindata_json(frs);

//    return _fr.size();
}

char * FormulaResultFactory::getSplitDataSize(const char * kdata, const char * exright, int split, int period) {

    std::vector<KLineStick> sticks;
    parse2KLineStick(kdata, sticks);

    std::vector<ExRight> exrights;
    parse2ExRight(exright, exrights);

    std::vector<KLineStick> tmp;
    CSplitCalculate::ins()->calcSplitData(sticks, exrights, static_cast<SplitT>(split),
                                          static_cast<PeriodT>(period), tmp);

    return createrightdata_json(tmp);
}

//translation Json//////////////////////////////

static double * vec2array(vector<double> v) {

    int len = v.size();
    if (len > 0) {
        double * array = new double[len];

        for (int i=0; i<len; ++i) {
            *(array+i) = v[i];
        }

        return array;
    }

    return NULL;
}

static void addDoubleArray(cJSON *fmt, const char *name, vector<double> v) {

    double * p = vec2array(v);
    int len = v.size();
    if (NULL != p && len > 0)
        cJSON_AddItemToObject(fmt, name, cJSON_CreateDoubleArray(p, len));
}


void FormulaResultFactory::createone(cJSON * one, FormulaResult & frobj)
{

    FormulaLine *fl = frobj._line.get();
    FormulaDraw *fd = frobj._draw.get();

    cJSON *fmt,*fr;
    cJSON_AddItemToArray(one, fr=cJSON_CreateObject());

    if (NULL != fl) {
        cJSON_AddItemToObject(fr, "FormulaLine", fmt=cJSON_CreateObject());
        cJSON_AddStringToObject(fmt,"name", fl->_name.c_str());
        cJSON_AddItemToObject(fmt,"type", cJSON_CreateNumber(fl->_type));
        cJSON_AddItemToObject(fmt,"thick", cJSON_CreateNumber(fl->_thick));
        cJSON_AddItemToObject(fmt,"color", cJSON_CreateNumber(fl->_color));
        cJSON_AddItemToObject(fmt,"color2", cJSON_CreateNumber(fl->_color2));
        cJSON_AddItemToObject(fmt,"nodraw", cJSON_CreateBool(fl->_nodraw));
        addDoubleArray(fmt,"data",fl->_data);

    }

    if (NULL != fd) {
        cJSON_AddItemToObject(fr, "FormulaDraw", fmt=cJSON_CreateObject());
        cJSON_AddStringToObject(fmt,"text", fd->_text.c_str());
        cJSON_AddStringToObject(fmt,"name", fd->_name.c_str());
        cJSON_AddItemToObject(fmt,"type", cJSON_CreateNumber(fd->_type));
        cJSON_AddItemToObject(fmt, "para1", cJSON_CreateNumber(fd->_para1));
        cJSON_AddItemToObject(fmt, "para2", cJSON_CreateNumber(fd->_para2));
        cJSON_AddItemToObject(fmt, "color", cJSON_CreateNumber(fd->_color));
        cJSON_AddItemToObject(fmt, "color2", cJSON_CreateNumber(fd->_color2));
        cJSON_AddItemToObject(fmt, "color3", cJSON_CreateNumber(fd->_color3));
        cJSON_AddItemToObject(fmt, "color4", cJSON_CreateNumber(fd->_color4));
        addDoubleArray(fmt,"drawPositon1",fd->_drawPositon1);
        addDoubleArray(fmt,"drawPositon2",fd->_drawPositon2);
        addDoubleArray(fmt,"drawPositon3",fd->_drawPositon3);
        addDoubleArray(fmt,"drawPositon4",fd->_drawPositon4);
    }

}

void FormulaResultFactory::createone(cJSON * one, KLineStick & ksobj) {

    KLineStick *ks = &ksobj;

    cJSON *fmt;

    if (NULL != ks) {

        cJSON_AddItemToArray(one, fmt=cJSON_CreateObject());
        cJSON_AddItemToObject(fmt,"time", cJSON_CreateNumber(ks->time));
        cJSON_AddItemToObject(fmt,"open", cJSON_CreateNumber(ks->open));
        cJSON_AddItemToObject(fmt, "high", cJSON_CreateNumber(ks->high));
        cJSON_AddItemToObject(fmt, "low", cJSON_CreateNumber(ks->low));
        cJSON_AddItemToObject(fmt, "close", cJSON_CreateNumber(ks->close));
        cJSON_AddItemToObject(fmt, "volume", cJSON_CreateNumber(ks->volume));
        cJSON_AddItemToObject(fmt, "amount", cJSON_CreateNumber(ks->amount));
    }
}

char * FormulaResultFactory::createdata_json(FormulaResults & frs)
{

    int len = frs.size();

    cJSON *root, *one;
    char *out;

    root = cJSON_CreateObject();
    cJSON_AddItemToObject(root, "FormulaResults", one = cJSON_CreateArray());

    for (int n=0; n<len; ++n)
    {
        FormulaResult & tmp = frs.at(n);
        createone(one, tmp);
    }

    out = cJSON_Print(root);
    cJSON_Delete(root);
    //free(out);

    return out;
}

char * FormulaResultFactory::createrightdata_json(std::vector<KLineStick> & splitData)
{

    int len = splitData.size();

    cJSON *root, *one;
    char *out;

    root = cJSON_CreateObject();
    cJSON_AddItemToObject(root, "SplitResults", one = cJSON_CreateArray());

    for (int n=0; n<len; ++n)
    {
        KLineStick & tmp = splitData.at(n);
        createone(one, tmp);
    }

    out = cJSON_Print(root);
    cJSON_Delete(root);
    //free(out);

    return out;
}

char * FormulaResultFactory::createmindata_json(FormulaResults & frs) {

    int len = frs.size();

    cJSON *root, *one;
    char *out;

    root = cJSON_CreateObject();
    cJSON_AddItemToObject(root, "FormulaResults", one = cJSON_CreateArray());

    for (int n=0; n<len; ++n)
    {
        FormulaResult & tmp = frs.at(n);
        createone(one, tmp);
    }

    out = cJSON_Print(root);
    cJSON_Delete(root);
    //free(out);

    return out;
}
