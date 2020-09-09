//
//  YDInnerFunction.hpp
//  DzhChart
//
//  Created by apple on 16/5/25.
//  Copyright © 2016年 dzh. All rights reserved.
//

#ifndef YDInnerFunction_hpp
#define YDInnerFunction_hpp

#include <vector>
#include <stdio.h>

using namespace std;

//extern double __STDDEV(const vector<double>& v, int n);
extern vector<double> __STDDEV(const vector<double>& v, int n);
extern vector<double> __MA(const vector<double> & v, int period);
extern vector<double> __EMA(const vector<double> & v, int period);
extern vector<double> __LLV(const vector<double> & v, int period);
extern vector<double> __LLV(const vector<double> & v, const vector<double>& v1);
extern vector<double> __HHV(const vector<double> & v, int period);
extern vector<double> __HHV(const vector<double> & v, const vector<double>& v1);
extern vector<double> __SMA(const vector<double> & v, int period, int weight);
extern vector<double> __REF(const vector<double> & v, int period);
extern vector<double> __REFX(const vector<double> & lh, int period);
extern vector<double> __MAX(const vector<double> & v, int rh);
extern vector<double> __ABS(const vector<double> & v);
extern vector<double> __AVEDEV(const vector<double>& v, int n);
extern vector<double> __IF(const vector<double>& v, const vector<double>& v1, const vector<double>& v2);
extern vector<double> __IF(const vector<double>& v, const vector<double>& v1, const int n);
extern vector<double> __IF(const vector<double>& v, const int m, const vector<double>& v1);
extern vector<double> __IF(const vector<double>& v, const int m, const int n);
extern vector<double> __SUM(const vector<double> & v, int period);
extern vector<double> __DMA(const vector<double> & v, const vector<double> & w);
extern vector<double> __CROSS(const vector<double> & lh, const vector<double> & rh);
extern vector<double> __CROSS(const vector<double> & lh, const int n);
extern vector<double> __CROSS(const int m, const vector<double> & rh);
extern size_t __BARSCOUNT(const vector<double>& v);
extern unsigned int __BARSLAST(const vector<double>& v);
extern vector<double> __BARSLAST1(const vector<double>& v);
extern vector<double> __ISLASTBAR(const vector<double>& v);
extern vector<double> __VALUEWHEN(const vector<double>& v, const vector<double>& v1);
extern vector<double> __WMA(const vector<double>& v, int period);
extern vector<double> __MAX(const vector<double> & lh, const vector<double> & rh);
extern vector<double> __MIN(const vector<double> & lh, const vector<double> & rh);
extern vector<double> __ROUND(const vector<double> & v);
extern vector<double> __BACKSET(const vector<double>  conf, const int n);
extern vector<double> __BACKSET(const vector<double>  v1, const vector<double>  v2);
extern vector<double> __Time0(const vector<time_t>& v);
extern vector<double> __STD(const vector<double>& v, int n);
extern vector<double> __STD(const vector<double>& v, const vector<double>& v1);
extern vector<double> __LAST(const vector<double> &v);
extern vector<double> __HHVBARS(const vector<double>& v, int period);
extern vector<double> __HHVBARS(const vector<double>& v, const vector<double>& v1);
extern vector<double> __COUNT(const vector<double> & v, int period);
extern vector<double> __NOT(const vector<double> & v);
extern vector<double> __BETWEEN(const vector<double> & v, const int a, const int b);
extern unsigned int __BARSLASTCOUNT(const vector<double> & cond);
extern vector<double> __Ceiling(const vector<double> & v);


extern vector<double> operator-( const vector<double>& lh);
extern vector<double> operator+( const vector<double>& lh, double rh);
extern vector<double> operator+( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator-( const vector<double>& lh, double rh);
extern vector<double> operator-( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator*( const vector<double>& lh, double rh);
extern vector<double> operator*( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator/( const vector<double>& lh, double rh);
extern vector<double> operator/( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator>( const vector<double>& lh, double rh);
extern vector<double> operator>( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator>=( const vector<double>& lh, double rh);
extern vector<double> operator>=( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator<( const vector<double>& lh, double rh);
extern vector<double> operator<( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator<=( const vector<double>& lh, double rh);
extern vector<double> operator<=( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator!= ( const vector<double>& lh, double rh);
extern vector<double> operator!= ( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator== ( const vector<double>& lh, double rh);
extern vector<double> operator== ( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator&&( const vector<double>& lh, const vector<double>& rh);
extern vector<double> operator&&( const vector<double> &lh, double rh);
extern vector<double> operator||( const vector<double>& lh, const vector<double>& rh);

extern vector<double> make_vector(size_t s, double v);
#endif /* YDInnerFunction_hpp */
