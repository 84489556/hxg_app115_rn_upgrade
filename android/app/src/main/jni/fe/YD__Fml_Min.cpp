//
//  YD__Fml_Min.cpp
//  DzhChart
//
//  Created by apple on 16/5/27.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD__Fml_Min.hpp"
#include "YDInnerFunction.hpp"

#include <sstream>
#include <ctime>


vector<int> STZF::defaultParas{ 5, 10, 20, 60, 120, 250 };

const FormulaResults& FSZS::run()
{
    _result.clear();

    return _result;
}

const FormulaResults& MinVOL::run()
{
    _result.clear();

    return _result;
}

const FormulaResults& FundFlow::run()
{
    _result.clear();

    return _result;
}



STZF::STZF()
{
	_parameters = STZF::defaultParas;
}

STZF::~STZF()
{

}

const FormulaResults& STZF::run()
{

    double capital = 0.0f, rclose = 0.0f;
    capital = _minOtherData.circulateEquityA;//流通A股
    capital /= 100;
    rclose = _minOtherData.preClose;

    _result.clear();
    _result._vTime = vector<time_t>(_sticksMin.size());
    vector<double> C(_sticksMin.size()), V(_sticksMin.size()), AM(_sticksMin.size());
    int idx = 0;

    for (auto stick : _sticksMin) {
        _result._vTime[idx] = stick.time;
        C[idx] = stick.price;
        V[idx] = stick.volume/100;
        AM[idx] = stick.amount;
        idx++;
    }


    std::vector<double> v_sec = __Time0(_result._vTime);
    std::vector<double> v_if = __IF(v_sec <= (11 * 3600 + 30 * 60), vector<double>(v_sec.size(), 34200), vector<double>(v_sec.size(), 39600));
    std::vector<double> v_pos = __Ceiling((v_sec - v_if) / 60) + 1;
    std::vector<double> v_avg = __REF(__MA(V, 0), 1);
    std::vector<double> v_std = __REF(__STD(V, v_pos), 1);
    std::vector<double> v_high = __REF(__HHV(C, 0), 1);
    std::vector<double> v_low = __REF(__LLV(C, 0), 1);
    std::vector<double> v_sunVol = __SUM(V, 0);
    std::vector<double> v_fjx = __SUM(AM, 0) / v_sunVol / 100;
    std::vector<double> v_up = (V > v_avg * 2) || (__LAST(V > v_avg) >= 3) && (V > (v_avg + v_std / 2));
    std::vector<double> v_temp = v_pos*0.04 / 240;
    std::vector<double> v_pv = (v_sunVol /capital > v_temp) && (v_fjx > __REF(v_fjx, 1)) && (C > v_high) && v_up && (C < rclose*1.06) && (v_pos > 15) && (v_pos < 210);
    std::vector<double> v_pb = __HHVBARS(C, __BARSLAST1(v_pv));
    std::vector<double> v_tp1 = (v_pv && v_pos > 45) || ((__COUNT(v_pv, 0) >= 1) && (v_pb > 10) && (__HHV(C, v_pb) - __LLV(C, v_pb) < (v_high - v_low) / 2)
                                                         && (C < rclose * 1.06) && v_up && (C[1] > C[2]) && (C > C[1]) && (C > v_fjx) && (v_pos < 210));
    std::vector<double> v_tp2 = (__COUNT(v_tp1, 15) == 1) && v_tp1;
    std::vector<double> one = (__COUNT(v_tp2, 0) <= 2) && v_tp2;
    std::vector<double> two = (__COUNT(one, 0) == 2) && one;

    shared_ptr<FormulaDraw> draw = make_shared<FormulaDraw>();
    draw->_type = DRAWTEXT;
    draw->_name = u8"一冲";
    draw->_drawPositon1 = one && __NOT(two);
    draw->_drawPositon2 = C;
    draw->_text = u8"★一冲";
    draw->_color = 0xFF00FFFF;
    _result.push_back(FormulaResult(draw));

    draw = make_shared<FormulaDraw>();
    draw->_type = DRAWTEXT;
    draw->_name = u8"双冲";
    draw->_drawPositon1 = two;
    draw->_drawPositon2 = C;
    draw->_text = u8"★双冲";
    draw->_color = 0xFFFF00F4;

    _result.push_back(FormulaResult(draw));

    return _result;
}
