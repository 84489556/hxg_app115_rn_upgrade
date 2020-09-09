//
//  YDInnerFunction.cpp
//  DzhChart
//
//  Created by apple on 16/5/25.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YDInnerFunction.hpp"
#include "YDFormulaBase.hpp"
#include <numeric>
#include <cmath>
#include <algorithm>


using namespace std;

class func_exception : std::exception
{
public:
    func_exception(const string & reason) : _reason(reason){
    }
    
    virtual const char* what() const noexcept{
        return _reason.c_str();
    }
    
protected:
    string _reason;
};

vector<double>::const_iterator getValidIter(const vector<double>& v){
    return find_if(v.begin(), v.end(), [](double value){
        return value != invalid_dbl;
    });
}

size_t getValidPos(const vector<double>& v){
    vector<double>::const_iterator iter = find_if(v.begin(), v.end(), [](double value){
        return value != invalid_dbl;
    });
    size_t validPos = distance(v.begin(), iter);
    return validPos;
}

size_t getValidPos(const vector<double>& v, const vector<double>& w){
    return max(getValidPos(v), getValidPos(w));
}

size_t getValidPos(const vector<double>& u, const vector<double>& v, const vector<double>& w){
    return max(getValidPos(u,v), getValidPos(w));
}

size_t getValidSize(const vector<double>& v){
    return v.size() - getValidPos(v);
}

vector<double> make_vector(size_t s, double v){ return vector<double>(s,v) ; };

#pragma mark vector 四则运算
vector<double> operator+( const vector<double>& lh, double rh){
    vector<double> result( lh.size() );
    
    transform(lh.begin(), lh.end(), result.begin(), [rh](double l){
        return l != invalid_dbl && rh != invalid_dbl ? l + rh : invalid_dbl;
    });
    
    return result;
}

vector<double> operator+( const vector<double>& lh, const vector<double>& rh){
//    assert( lh.size() == rh.size() );
    vector<double> result( lh.size(), invalid_dbl );
    size_t validPos = max( getValidPos(lh), getValidPos(rh));
    
    transform(lh.begin()+validPos, lh.end(), rh.begin()+validPos, result.begin()+validPos, [](double l, double r){
//        return (l != invalid_dbl && r != invalid_dbl) ? l + r : invalid_dbl;
        return l + r;
    });
    
    return result;
}


vector<double> operator-( const vector<double>& lh, double rh){
    vector<double> result( lh.size(), invalid_dbl );
    size_t validPos = getValidPos(lh);
    
    transform(lh.begin()+validPos, lh.end(), result.begin()+validPos, [rh](double l){
//        return (l != invalid_dbl && rh != invalid_dbl) ? l - rh : invalid_dbl;
        return l - rh;
    });
    
    return result;
}



vector<double> operator-( const vector<double>& lh, const vector<double>& rh){
    //    assert( lh.size() == rh.size() );
    vector<double> result( lh.size(), invalid_dbl );
    size_t validPos = max( getValidPos(lh), getValidPos(rh));
    
    transform(lh.begin()+validPos, lh.end(), rh.begin()+validPos, result.begin()+validPos, [](double l, double r){
//        return (l != invalid_dbl && r != invalid_dbl) ? l - r : invalid_dbl;
        return l - r;
    });
    
    return result;
}


vector<double> operator-( const vector<double>& lh){
    vector<double> result( lh.size() );
    transform(lh.begin(), lh.end(), result.begin(), [](double l){
        return l != invalid_dbl ? -l : invalid_dbl;
    });
    
    return result;
}

vector<double> operator*( const vector<double>& lh, double rh){
    size_t validPos = getValidPos(lh);
    vector<double> result( lh.size(), invalid_dbl );
    
    transform(lh.begin()+validPos, lh.end(), result.begin()+validPos, [rh](double l){
//        return (l != invalid_dbl && rh != invalid_dbl ) ? l * rh : invalid_dbl;
        return l * rh;
    });
    
    return result;
}

vector<double> operator*( const vector<double>& lh, const vector<double>& rh){
    size_t validPos = max( getValidPos(lh) , getValidPos(rh) ) ;
    vector<double> result( lh.size(), invalid_dbl );
    
    transform(lh.begin()+validPos, lh.end(), rh.begin()+validPos, result.begin()+validPos, [](double l, double r){
//        return (l != invalid_dbl && r != invalid_dbl ) ? l * r : invalid_dbl;
        return l * r;
    });
    
    return result;
}

vector<double> operator/( const vector<double>& lh, double rh){
    //    assert( lh.size() == rh.size() );
    vector<double> result( lh.size(), invalid_dbl );
    
    size_t validPos = getValidPos(lh);
    transform(lh.begin()+validPos, lh.end(), result.begin()+validPos, [rh](double l){
        return (rh != invalid_dbl && rh != 0 ) ? l/rh : invalid_dbl;
    });
    
    return result;
}
#include <iostream>
vector<double> operator/( const vector<double>& lh, const vector<double>& rh){
    //    assert( lh.size() == rh.size() );
    vector<double> result( lh.size(), invalid_dbl );
    
    size_t validPos = max(getValidPos(lh), getValidPos(rh));
    transform(lh.begin()+validPos, lh.end(), rh.begin()+validPos, result.begin()+validPos, [](double l, double r){
        //std::cout <<l << "/" << r << "=" << ((r != invalid_dbl && r != 0 ) ?  l/r : invalid_dbl) << std::endl;
        return (r != invalid_dbl && r != 0 ) ?  l/r : invalid_dbl;
    });
    
    return result;
}

vector<double> operator> ( const vector<double>& lh, double rh){
    return lh > make_vector(lh.size(), rh);
}

vector<double> operator> ( const vector<double>& lh, const vector<double>& rh){
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
        if( l == invalid_dbl || r == invalid_dbl )
            return invalid_dbl;
        else
            return l > r ? 1.0 : 0.0;
    });
    return result;
}

vector<double> operator>= ( const vector<double>& lh, double rh){
    return lh >= make_vector(lh.size(), rh);
}

vector<double> operator>= ( const vector<double>& lh, const vector<double>& rh){
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
        if( l == invalid_dbl || r == invalid_dbl )
            return invalid_dbl;
        else
            return l >= r ? 1.0 : 0.0;
    });
    return result;
}

vector<double> operator< ( const vector<double>& lh, double rh){
    return lh < make_vector(lh.size(), rh);
}

vector<double> operator< ( const vector<double>& lh, const vector<double>& rh){
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
        if( l == invalid_dbl || r == invalid_dbl )
            return invalid_dbl;
        else
            return l < r ? 1.0 : 0.0;
    });
    return result;
}

vector<double> operator<= ( const vector<double>& lh, double rh){
    return lh <= make_vector(lh.size(), rh);
}

vector<double> operator<= ( const vector<double>& lh, const vector<double>& rh){
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
        if( l == invalid_dbl || r == invalid_dbl )
            return invalid_dbl;
        else
            return l <= r ? 1.0 : 0.0;
    });
    return result;
}

vector<double> operator== ( const vector<double>& lh, double rh){
    return lh == make_vector(lh.size(), rh);
}

//vector<double> operator== ( const vector<double>& lh, const vector<double>& rh){
//    vector<double> result = make_vector(lh.size(), invalid_dbl);
//    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
//        if( l == invalid_dbl || r == invalid_dbl )
//            return invalid_dbl;
//        else
//            return l == r ? 1.0 : 0.0;
//    });
//    return result;
//}

vector<double> operator==(const vector<double>& lh, const vector<double>& rh) {
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r) {
        if (l == invalid_dbl || r == invalid_dbl)
            return invalid_dbl;
        else
            return abs(l - r) <= 0.000001 ? 1.0 : 0.0;
    });

    return result;
}

vector<double> operator!= ( const vector<double>& lh, double rh){
    return lh != make_vector(lh.size(), rh);
}

vector<double> operator!= ( const vector<double>& lh, const vector<double>& rh){
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
        if( l == invalid_dbl || r == invalid_dbl )
            return invalid_dbl;
        else
            return l != r ? 1.0 : 0.0;
    });
    return result;
}

vector<double> operator&&( const vector<double>& lh, const vector<double>& rh){
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
        if( l == invalid_dbl || r == invalid_dbl )
            return invalid_dbl;
        else
            return (l != 0.0 && r != 0.0 ) ? 1.0 : 0.0;
    });
    return result;
}

vector<double> operator &&(const vector<double>& lh, double rh) {
    return lh && make_vector(lh.size(), rh);
}

vector<double> operator||( const vector<double>& lh, const vector<double>& rh){
    vector<double> result = make_vector(lh.size(), invalid_dbl);
    transform(lh.begin(), lh.end(), rh.begin(), result.begin(), [](double l, double r){
        if( l == invalid_dbl || r == invalid_dbl )
            return invalid_dbl;
        else
            return (l != 0.0 || r != 0.0 ) ? 1.0 : 0.0;
    });
    return result;
}

vector<double> operator ||(const vector<double>& lh, double rh) {
	return lh || make_vector(lh.size(), rh);
}
#pragma mark 常用函数
//vector<double> __MA(const vector<double> & v, int period){
//    if( period == 0 ) return v;
//    vector<double> r(v.size(), invalid_dbl);
//    for( int index = getValidPos(v); index <= (int)v.size() - period ; ++index){
//        double d = accumulate(v.begin()+index, v.begin()+index+period, 0.0)/(double)period;
//        /*if (d<=DBL_MAX&&d>=-DBL_MAX) */r[index+period-1] = accumulate(v.begin()+index, v.begin()+index+period, 0.0)/(double)period;
////        else r[index+period-1] = invalid_dbl;
//    }
//    return r;
//}

vector<double> __MA(const vector<double> & v, int period){
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v);
    if (period == 0) {
        for (size_t index = pos; index < v.size(); index++) {
            r[index] = std::accumulate(v.begin() + pos, v.begin() + index, 0.0) / (index - pos + 1);
        }
    }
    else {
        for (int index = getValidPos(v); index <= (int)v.size() - period; ++index) {
            r[index + period - 1] = accumulate(v.begin() + index, v.begin() + index + period, 0.0) / (double)period;
        }
    }

    return r;
}

//double __STDDEV(const vector<double>& v, int n){
//    double sum = std::accumulate(v.begin(), v.end(), 0.0);
//    double mean = sum / v.size();
//    
//    std::vector<double> diff(v.size());
//    std::transform(v.begin(), v.end(), diff.begin(),
//                   [mean](double x) { return x - mean; }) ;
//    double sq_sum = inner_product(diff.begin(), diff.end(), diff.begin(), 0.0);
//    double stdev = sqrt(sq_sum / v.size());
//    return stdev;
//}

vector<double> __STDDEV(const vector<double>& v, int n){
    vector<double> r(v.size(), invalid_dbl);
    
    size_t pos = getValidPos(v);
    if(pos >= v.size()) {
        return r;
    }
    if( distance(v.begin()+pos, v.end()) < n ){
        return r;
    }
    
    for( auto i = pos+n-1 ; i < v.size(); ++i)
    {
        auto from = v.begin() + (i - n + 1), to = v.begin()+ (i + 1);
        double sum = std::accumulate( from, to, 0.0);
        double mean = sum / n;
        std::vector<double> diff(n);
        std::transform(from, to, diff.begin(),
                       [mean](double x) { return x - mean; }) ;
        double sq_sum = inner_product(diff.begin(), diff.end(), diff.begin(), 0.0);
        double stdev = sqrt(sq_sum / (n-1));
        r[i] = stdev;
    }
    return r;
}

vector<double> __EMA(const vector<double> & v, int w){
    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v);
    if(pos >= v.size()) {
        return r;
    }
    
    r[pos] = v[pos];
    transform(v.begin()+pos+1, v.end(), r.begin()+pos, r.begin()+pos+1, [w](double lh, double rh){
        return (2*lh+(w-1)*rh)/(w+1);
    });
    return r;
}

//vector<double> __LLV(const vector<double> & v, int n){
//    vector<double> r(v.size(), invalid_dbl);
//    size_t pos = getValidPos(v);
//
//    if (n == 0) {
//        double fval = v[pos];
//        for(auto cursor = pos ; cursor < v.size(); ++ cursor)
//        {
//            if (fval > v[cursor])
//                fval = v[cursor];
//            r[cursor] = fval;
//        }
//        return r;
//    }
//
//    if (n == 1) {
//        return v;
//    }
//
//    double fvalue = v[pos];
//    int nStart = fmin(pos + n, v.size());
//    for (int i = pos; i < nStart; i++) {
//        if (fvalue > v[i])
//            fvalue = v[i];
//        r[i] = fvalue;
//    }
//    for(auto cursor = nStart ; cursor < v.size(); ++ cursor)
//    {
////        double llv = std::numeric_limits<double>::max();
////
////        auto beg = v.begin()+(cursor-(size_t)n+1);
////        auto end = v.begin()+(cursor+1);
////        std::for_each( beg, end, [&llv](double l){
////            if( llv > l ) llv = l;
////        });
////
////        r[ cursor ] = llv;
//
//        if (fvalue > v[cursor]) {
//            fvalue = v[cursor];
//        }
//        else if (v[cursor - n] == fvalue) {
//            fvalue = v[cursor];
//            for (int j = cursor - n + 1; j < cursor; j++) {
//                if (fvalue > v[j])
//                    fvalue = v[j];
//            }
//        }
//
//        r[cursor] = fvalue;
//    }
//    return r;
//}

//vector<double> __LLV(const vector<double> & v, const vector<double>& v1) {
//	if (v.empty()) return v;
//	vector<double> r(v.size(), invalid_dbl);
//	vector<double> t(v.size(), invalid_dbl);
//	size_t pos = getValidPos(v), pos1 = getValidPos(v1);
//	double compare = std::numeric_limits<double>::min();
//
//	transform(v.begin()+pos, v.end(), t.begin(), [&compare](double x) {
//		return compare = min<double>(compare, x);
//	});
//	for (size_t i = pos; i < v.size(); i++) {
//		compare = v.at(i);
//		size_t index = int(v1.at(i) + 0.5);
//		if (index == 0) {
//			r[i] = t[i]; continue;
//		}
//		else {
//			index = max(pos1, (i - index + 1));
//		}
//		for (size_t m = index; m < i; m++) {
//			compare = min<double>(compare, v[m]);
//		}
//
//		r[i] = compare;
//	}
//	return r;
//}

vector<double> __LLV(const vector<double> & v, int n){
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v);
    if (n == 0) {
        double llv = std::numeric_limits<double>::max();
        for (size_t index = pos; index < v.size(); index++) {
            llv = min<double>(llv, v[index]);
            r[index] = llv;
        }
    }
    else if(n == 1){
        r.assign(v.begin(), v.end());
    }
    else {

        double llv = std::numeric_limits<double>::max();
        size_t nStart = fmin(pos + n, v.size());
        for (size_t i = pos; i < nStart; i++) {
            if (llv > v[i])
                llv = v[i];
            r[i] = llv;
        }

        for (size_t i = nStart; i < v.size(); i++)    {
            if (llv > v[i]) {
                llv = v[i];
            }
            else if (v[i - n] == llv) {
                llv = v[i];
                for (size_t j = i - n + 1; j < i; j++) {
                    if (llv > v[j])
                        llv = v[j];
                }
            }

            r[i] = llv;
        }
        
        
        
//        double llv = std::numeric_limits<double>::max();
//        for (size_t index = pos; index < v.size(); index++) {
//            llv = min<double>(llv, v[index]);
//            r[index] = llv;
//        }
//
////        for (auto cursor = pos + n - 1; cursor < v.size(); ++cursor)
//        for (auto cursor = pos + n - 1; cursor < v.size(); ++cursor)
//        {
//            double llv = std::numeric_limits<double>::max();
//
//            auto beg = v.begin() + (cursor - (size_t)n + 1);
//            auto end = v.begin() + (cursor + 1);
//            std::for_each(beg, end, [&llv](double l) {
//                if (llv > l) llv = l;
//            });
//
//            r[cursor] = llv;
//        }
    }

    return r;
}

vector<double> __LLV(const vector<double> & v, const vector<double>& v1) {
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);
    vector<double> t(v.size(), invalid_dbl);
    size_t pos = getValidPos(v), pos1 = getValidPos(v1);
    double compare = std::numeric_limits<double>::min();

    transform(v.begin()+pos, v.end(), t.begin(), [&compare](double x) {
        return compare = min<double>(compare, x);
    });
    for (size_t i = pos; i < v.size(); i++) {
        compare = v.at(i);
        size_t index = int(v1.at(i) + 0.5);
        if (index == 0) {
            r[i] = t[i]; continue;
        }
        else {
            index = max(pos1, (i - index + 1));
        }
        for (size_t m = index; m < i; m++) {
            compare = min<double>(compare, v[m]);
        }

        r[i] = compare;
    }
    return r;
}

//vector<double> __HHV(const vector<double> & v, int n){
//    vector<double> r(v.size(), invalid_dbl);
//    size_t pos = getValidPos(v);
//
//    if (n == 0) {
//        double fval = v[pos];
//        for(auto cursor = pos ; cursor < v.size(); ++ cursor)
//        {
//            if (fval < v[cursor])
//                fval = v[cursor];
//            r[cursor] = fval;
//        }
//        return r;
//    }
//
//    if (n == 1) {
//        return v;
//    }
//
//    double fvalue = v[pos];
//    int nStart = fmin(pos + n, v.size());
//    for (int i = pos; i < nStart; i++) {
//        if (fvalue < v[i])
//            fvalue = v[i];
//        r[i] = fvalue;
//    }
//
//    for(auto cursor = nStart ; cursor < v.size(); ++ cursor)
//    {
////        double hhv = std::numeric_limits<double>::lowest()+std::numeric_limits<double>::min();
////
////        auto beg = v.begin()+(cursor-(size_t)n+1);
////        auto end = v.begin()+(cursor+1);
////        std::for_each( beg, end, [&hhv](double l){
////            if( hhv < l ) hhv = l;
////        });
////
////        r[ cursor ] = hhv;
//
//        if (fvalue < v[cursor]) {
//            fvalue = v[cursor];
//        }
//        else if (v[cursor - n] == fvalue) {
//            fvalue = v[cursor];
//            for (int j = cursor - n + 1; j < cursor; j++) {
//                if (fvalue < v[j])
//                    fvalue = v[j];
//            }
//        }
//
//        r[cursor] = fvalue;
//    }
//    return r;
//}

vector<double> __HHV(const vector<double> & v, int n){
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v);
    if (n == 0) {
        double hhv = std::numeric_limits<double>::min();
        for (size_t index = pos; index < v.size(); index++) {
            hhv = max<double>(hhv, v[index]);
            r[index] = hhv;
        }
    }
    else if(n == 1){
        r.assign(v.begin(), v.end());
    }
    else {

        double llv = std::numeric_limits<double>::min();
        size_t nStart = fmin(pos + n, v.size());
        for (size_t i = pos; i < nStart; i++) {
            if (llv < v[i])
                llv = v[i];
            r[i] = llv;
        }

        for (size_t i = nStart; i < v.size(); i++)    {
            if (llv < v[i]) {
                llv = v[i];
            }
            else if (v[i - n] == llv) {
                llv = v[i];
                for (size_t j = i - n + 1; j < i; j++) {
                    if (llv < v[j])
                        llv = v[j];
                }
            }

            r[i] = llv;
        }
//    else {
//        for (auto cursor = pos + n - 1; cursor < v.size(); ++cursor)
//        {
//            double hhv = std::numeric_limits<double>::lowest() + std::numeric_limits<double>::min();
//
//            auto beg = v.begin() + (cursor - (size_t)n + 1);
//            auto end = v.begin() + (cursor + 1);
//            std::for_each(beg, end, [&hhv](double l) {
//                if (hhv < l) hhv = l;
//            });
//
//            r[cursor] = hhv;
//        }
    }

    return r;
}

//vector<double> __HHV(const vector<double> & v, const vector<double>& v1) {
//	if (v.empty()) return v;
//	vector<double> r(v.size(), invalid_dbl);
//	vector<double> t(v.size(), invalid_dbl);
//	size_t pos = getValidPos(v), pos1 = getValidPos(v1);
//	double compare = std::numeric_limits<double>::min();
//
//	transform(v.begin() + pos, v.end(), t.begin(), [&compare](double x) {
//		return compare = max<double>(compare, x);
//	});
//	for (size_t i = pos; i < v.size(); i++) {
//		compare = v.at(i);
//		size_t index = int(v1.at(i) + 0.5);
//		if (index == 0) {
//			r[i] = t[i]; continue;
//		}
//		else {
//			index = max(pos1, (i - index + 1));
//		}
//		for (size_t m = index; m < i; m++) {
//			compare = max<double>(compare, v[m]);
//		}
//
//		r[i] = compare;
//	}
//	return r;
//}

vector<double> __HHV(const vector<double> & v, const vector<double>& v1) {
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);
    vector<double> t(v.size(), invalid_dbl);
    size_t pos = getValidPos(v), pos1 = getValidPos(v1);
    double compare = std::numeric_limits<double>::min();

    transform(v.begin() + pos, v.end(), t.begin(), [&compare](double x) {
        return compare = max<double>(compare, x);
    });
    for (size_t i = pos; i < v.size(); i++) {
        compare = v.at(i);
        size_t index = int(v1.at(i) + 0.5);
        if (index == 0) {
            r[i] = t[i]; continue;
        }
        else {
            index = max(pos1, (i - index + 1));
        }
        for (size_t m = index; m < i; m++) {
            compare = max<double>(compare, v[m]);
        }

        r[i] = compare;
    }
    return r;
}

vector<double> __SMA(const vector<double> & v, int p, int w){
    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v);
    if(pos >= v.size()) {
        return r;
    }
    r[pos] = v[pos];
    transform(v.begin()+pos+1, v.end(), r.begin()+pos, r.begin()+pos+1, [p,w](double lh, double rh){
        if(lh == -INFINITY || lh == invalid_dbl ) lh = 0;
        if(rh == -INFINITY || rh == invalid_dbl ) rh = 0;
        return (w*lh+(p-w)*rh)/p;
    });
    return r;
}

//vector<double> __REF(const vector<double> & lh, int period){
//    vector<double> r(lh.size(), invalid_dbl);
//
//    if( period >= 0 && period < lh.size()){
//        transform(lh.begin(), lh.end()-period, r.begin()+period, [](double l){
//            return l ;
//        });
//    }
//
//    return r;
//}

vector<double> __REF(const vector<double> & lh, int period){
    if (lh.empty()) return lh;
    vector<double> r(lh.size(), invalid_dbl);

    if( period >= 0 && period < (int)lh.size()){
        transform(lh.begin(), lh.end()-period, r.begin()+period, [](double l){
            return l ;
        });
    }

    return r;
}

/*
 * //引用若干周期后的数据。
 * //用法:REFX(X,A),引用A周期后的X值。
if (period >= 0 && period < sizeData - first)
{
    double *ptr1 = pResult + first;
    const double *ptr2 = pValue + first + period;
    int n = sizeData - first - period;
    memcpy_s(ptr1, sizeof(double)*n, ptr2, sizeof(double)*n);
    for (int i = 0; i < period; i++) {
    pResult[sizeData - 1 - i] = pValue[sizeData - 1];
}

return first;
}
 */
vector<double> __REFX(const vector<double> & lh, int period) {

    if (lh.empty()) return lh;

    vector<double> r(lh);
    size_t first = getValidPos(lh);
    size_t sizeData = lh.size();
    int n = sizeData - first - period;

    if (period >= 0 && period < sizeData - first)
    {
        transform(lh.begin() + first + period, lh.end(), r.begin() + first, [](double l){
            return l ;
        });
    }

    return r;


// 测试代码
//    vector<double> llh = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20};//
//    vector<double> r(llh);
//
//    size_t first = 3;
//    size_t sizeData = llh.size();
//    int period1 = 2;
//    int n = sizeData - first - period1;
//
//    if (period >= 0 && period < sizeData - first)
//    {
//        transform(llh.begin() + first + period1, llh.end(), r.begin() + first, [](double l){
//            return l ;
//        });
//    }
//
//    return r;

}

vector<double> __MAX(const vector<double> & lh, int rh){
    vector<double> r( lh.size(), invalid_dbl );
    
    transform(lh.begin(), lh.end(), r.begin(), [rh](double l){
        return l == invalid_dbl ? invalid_dbl : std::max<double>(l, rh);
    });

    return r;
}

vector<double> __MAX(const vector<double> & lh, const vector<double> & rh){
    vector<double> r( lh.size(), invalid_dbl );
    size_t first = getValidPos(lh);
    if(first >= lh.size()) {
        return r;
    }

    for( size_t i = first; i < lh.size(); ++i){
        r[i] = std::max<double>(lh[i], rh[i]);
    }
    return r;

}

vector<double> __MIN(const vector<double> & lh, const vector<double> & rh){
    vector<double> r( lh.size(), invalid_dbl );
    size_t first = getValidPos(lh, rh);
    if(first >= lh.size()) {
        return r;
    }

    for( size_t i = first; i < lh.size(); ++i){
        r[i] = std::min<double>(lh[i], rh[i]);
    }
    return r;

}

vector<double> __ROUND(const vector<double> & v){
    vector<double> r( v.size(), invalid_dbl );
    size_t first = getValidPos(v);
    if(first >= v.size()) {
        return r;
    }

    for( size_t i = first; i < v.size(); ++i){
        r[i] = round(v[i]);
    }

    return r;
}

vector<double> __BACKSET(const vector<double>  conf, const int n) {
//    int period = n > 0 ? std::min<double>(conf.size(), n) : std::max<double>(0, n);
//
//    vector<double> r( conf.size(), invalid_dbl );
//
//    for( size_t i = 0; i < conf.size(); ++i) {
//        r[i] =  i >= conf.size() - period ? 1 : 0;
//    }
//
//    return r;
    
//    vector<double> r( conf.size(), invalid_dbl );
//    vector<double> vn(conf.size(),n);
//
//
//    for (int i = 0; i < conf.size(); i++) {
//        r[i] = 0;
//    }
//
//    for (int i = conf.size() - 1; i > 0 + n - 2; i--) {
//        if (fabs(conf[i]) != invalid_dbl) {
//            for (int j = 0; j < n; j++) {
//                r[i - j] = 1;
//            }
//        }
//    }

    vector<double> r( conf.size(), invalid_dbl );
    vector<double> vn(conf.size(),n);

    r = __BACKSET(conf, vn);

    return r;
}

vector<double> __BACKSET(const vector<double>  v1, const vector<double>  v2) {

//    vector<double> test1 = {0,0,1,1,0,1,0,0,0,1};
//    vector<double> r( test1.size(), 0 );
//
//    int nFirstIndex=0;
//    for (int i = test1.size() - 1; i >= 0; i--)
//    {
//        if (fabs(test1[i]) > 1.175494351e-38F /*FLT_MIN*/)
//        {
//            nFirstIndex = i - ((int)(fabs(v2[i]) + 0.1)) + 1;
//            if (nFirstIndex < 0)
//                nFirstIndex = 0;
//
//            for (size_t j = i; j >= nFirstIndex; j--)
//                r[j] = 1;
//        }
//    }
//
//    return r;

    vector<double> r( v1.size(), 0 );

    int nFirstIndex=0;
    for (int i = v1.size() - 1; i >= 0; i--)
    {
        if (v1[i] != invalid_dbl && fabs(v1[i]) > 1.175494351e-38F /*FLT_MIN*/)
        {
            nFirstIndex = i - ((int)(fabs(v2[i]) + 0.1)) + 1;
            if (nFirstIndex < 0)
                nFirstIndex = 0;

            for (size_t j = i; j >= nFirstIndex; j--)
                r[j] = 1;
        }
    }

    return r;
}

vector<double> __ABS(const vector<double> & lh){
    vector<double> r( lh.size(), invalid_dbl );
    
    transform(lh.begin(), lh.end(), r.begin(), [](double l){
        return l == invalid_dbl ? invalid_dbl : fabs(l);
    });
    
    return r;
}

vector<double> __AVEDEV(const vector<double>& v, int n){
    vector<double> r(v.size(), invalid_dbl);
    
    std::vector<double> diff(n);
    size_t pos = getValidPos(v);
    for(auto cursor = pos + n - 1 ; cursor < v.size(); ++ cursor)
    {
        auto beg = v.begin()+(cursor-(size_t)n+1);
        auto end = v.begin()+(cursor+1);
        double mean = std::accumulate(beg, end, 0.0) / n;

        std::transform(beg, end, diff.begin(),[mean](double x){
            return fabs(x-mean);
        });
        
        r[ cursor ] = std::accumulate(diff.begin(), diff.end(), 0.0) / n;
    }

    return r;
}

//vector<double> __IF(const vector<double>& v, const vector<double>& v1, const vector<double>& v2){
//    vector<double> r(v.size(), invalid_dbl);
//    for(size_t i = getValidPos(v,v1, v2) ; i < v.size(); ++i)
//    {
//        if( v[i] == invalid_dbl)
//            continue;
//        r[i] = (v[i] != 0.0) ? v1[i] : v2[i];
//    }
//    return r;
//}

vector<double> __IF(const vector<double>& v, const vector<double>& v1, const vector<double>& v2){
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);
    for(size_t i = getValidPos(v,v1, v2) ; i < v.size(); ++i)
    {
        if( v[i] == invalid_dbl)
            continue;
        r[i] = (v[i] != 0.0) ? v1[i] : v2[i];
    }
    return r;
}

vector<double> __IF(const vector<double>& v, const vector<double>& v1, const int n){
    vector<double> r(v.size(), invalid_dbl);
    for(size_t i = getValidPos(v,v1) ; i < v.size(); ++i)
    {
        if( v[i] == invalid_dbl)
            continue;
        r[i] = (v[i] != 0.0) ? v1[i] : n;
    }
    return r;
}

vector<double> __IF(const vector<double>& v, const int m, const vector<double>& v1){
    vector<double> r(v.size(), invalid_dbl);
    for(size_t i = getValidPos(v,v1) ; i < v.size(); ++i)
    {
        if( v[i] == invalid_dbl)
            continue;
        r[i] = (v[i] != 0.0) ? m : v1[i];
    }
    return r;
}

vector<double> __IF(const vector<double>& v, const int m, const int n){
    vector<double> r(v.size(), invalid_dbl);
    for(size_t i = getValidPos(v) ; i < v.size(); ++i)
    {
        if( v[i] == invalid_dbl)
            continue;
        r[i] = (v[i] != 0.0) ? m : n;
    }
    return r;
}

//vector<double> __SUM(const vector<double> & v, int n){
//    vector<double> r(v.size(), invalid_dbl);
//
//    size_t pos = getValidPos(v);
//    for(auto cursor = pos + n - 1 ; cursor < v.size(); ++ cursor)
//    {
//        auto beg = v.begin()+(cursor-(size_t)n+1);
//        auto end = v.begin()+(cursor+1);
//        r[ cursor ] = std::accumulate(beg, end, 0.0);
//    }
//    return r;
//}

vector<double> __SUM(const vector<double> & v, int n){
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);

    size_t pos = getValidPos(v);
    if (n == 0) {
        double sum = 0.0;
        transform(v.begin()+pos, v.end(), r.begin()+pos, [&sum](double x) {
            return sum += x;
        });
    }
    else {
        for (auto cursor = pos + n - 1; cursor < v.size(); ++cursor)
        {
            auto beg = v.begin() + (cursor - (size_t)n + 1);
            auto end = v.begin() + (cursor + 1);
            r[cursor] = std::accumulate(beg, end, 0.0);
        }
    }

    return r;
}

vector<double> __DMA(const vector<double> & v, const vector<double> & w){
    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v, w);
    if(pos >= v.size()) {
        return r;
    }
    
    r[pos] = v[pos];
    for( size_t i = pos+1; i < v.size(); ++i){
        double value = w[i];
        if (value > 1)
            value = 1;
        else if (value < 0)
            value = 0;
        r[i] = v[i] * value + r[i-1] * ( 1-value);
    }
    return r;
}

vector<double> __CROSS(const vector<double> & lh, const vector<double> & rh){
    vector<double> r(lh.size(), invalid_dbl);
    size_t pos = getValidPos(lh, rh);
    if(pos >= lh.size()) {
        return r;
    }
    
    r[pos] = 0.0;
    for( size_t i = pos+1; i < lh.size(); ++i){
        r[i] = (double)(lh[i-1] < rh[i] && lh[i] >= rh[i]);
    }
    return r;
}

vector<double> __CROSS(const vector<double> & lh, const int n){
    vector<double> r(lh.size(), invalid_dbl);
    size_t pos = getValidPos(lh);
    if(pos >= lh.size()) {
        return r;
    }

    r[pos] = 0.0;
    for( size_t i = pos+1; i < lh.size(); ++i){
        r[i] = (double)(lh[i-1] < n && lh[i] >= n);
    }
    return r;
}

vector<double> __CROSS(const int m, const vector<double> & rh){
    vector<double> r(rh.size(), invalid_dbl);
    size_t pos = getValidPos(rh);
    if(pos >= rh.size()) {
        return r;
    }

    r[pos] = 0.0;
    for( size_t i = pos+1; i < rh.size(); ++i){
        r[i] = (double)(m < rh[i-1] && m >= rh[i]);
    }
    return r;
}

size_t __BARSCOUNT(const vector<double>& v) {

    vector<double>::const_iterator iter = find_if(v.begin(), v.end(), [](double value){
        return value != invalid_dbl;
    });
    size_t validPos = distance(iter, v.end());
    return validPos;

}

unsigned int __BARSLAST(const vector<double>& v) {

    unsigned int period = 0;
    bool isTrue = false;
    size_t first = getValidPos(v);

    for ( int i = first; i < v.size(); i++) {
        if (fabs(v[i]) > 0.000001f) {
            if (false == isTrue) {
                isTrue = true;
            }
            period = 0;
        }
        if (isTrue) period++;

    }

    return period;
}

vector<double> __BARSLAST1(const vector<double>& v) {
    if (v.empty()) return v;
    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v);
    double _count = 0.0f;
    bool b = false;
    for (auto cursor = pos; cursor < v.size(); ++cursor) {
        if (v.at(cursor) > 0.000001f) {
            b = true;
            _count = 0.0f;
        }
        if (b) {
            r[cursor] = _count;
            _count += 1.0f;
        }
    }

    return r;
}

vector<double> __ISLASTBAR(const vector<double>& v) {
    vector<double> r(v.size(), invalid_dbl);

    for ( int i = 0; i < v.size(); i++) {
        i == v.size()-1 ? r[i] = 1 : r[i] = 0;
    }

    return r;
}

vector<double> __VALUEWHEN(const vector<double>& v, const vector<double>& v1) {

    vector<double> r(v.size(), invalid_dbl);
    size_t first = getValidPos(v, v1);
    if(first >= v.size()) {
        return r;
    }

    for ( int i = first; i < v.size(); i++) {
        if (fabs(v[i]) > 0.000001f) {
            r[i] = v1[i];
        }
        else {
            if(i==0) r[i] = 0;
            else r[i] = r[i-1];
        }

    }

    return r;
}

vector<double> __WMA(const vector<double>& v, int period){

    //求加权移动平均
    //若Y=WMA(X,N) 则 Y=(N*X0+(N-1)*X1+(N-2)*X2)+...+1*XN)/(N+(N-1)+(N-2)+...+1)
    //X0表示本周期值，X1表示上一周期值

    size_t first = getValidPos(v);

    if(period > 0 && period < v.size() - first + 1) {
        vector<double> r(v.size(), invalid_dbl);
        double fSum = 0;
        int nDivide = period*(period + 1) / 2;

        for( int index = getValidPos(v) + period - 1; index < (int)v.size() ; ++index){
            fSum = 0;
            for (int j = 0; j < period; j++)
                fSum += v[index - j] * (period - j);
            r[index] = fSum / nDivide;
        }
        return r;
    }

    return v;

}

vector<double> __Time0(const vector<time_t>& v) {
	vector<double> r(v.size(), invalid_dbl);
	if (v.empty()) return r;

	transform(v.begin(), v.end(), r.begin(), [](time_t x) {
		struct tm *local = std::localtime(&x);
		double t = 1.0 * (local->tm_hour * 3600 + local->tm_min * 60 + local->tm_sec);
		return t;
	});

	return r;
}

vector<double> __STD(const vector<double>& v, int n) {
	vector<double> r(v.size(), invalid_dbl);
	if (v.size() < n) return r;

	size_t cursor = getValidPos(v) + n - 1;
	auto begin = v.begin();
	for (auto it = v.begin() + cursor; it != v.end(); ++it, cursor++) {

		double mean = std::accumulate(begin, it, 0.0)/n;
		std::vector<double> diff(n);
		std::transform(begin, it, diff.begin(), [mean](double x) {
			return x - mean;
		});

		double sq_sum = inner_product(diff.begin(), diff.end(), diff.begin(), 0.0);
		if (n - 1 == 0) {
			r[cursor] = invalid_dbl;
		}
		else {
			r[cursor] = sqrt(sq_sum / (n - 1));
		}

		++begin;
	}

	return r;
}

vector<double> __STD(const vector<double>& v, const vector<double>& v1) {
	vector<double> r(v.size(), invalid_dbl);
	if (v.empty() || v1.empty()) return r;

	size_t pos = getValidPos(v, v1), cursor = pos;
	auto begin = v.begin();
	for (auto it = v.begin() + cursor; it != v.end(); cursor++) {
		double m = max<double>(1, v1.at(cursor));
		++it;
		if (cursor - m + 1 < pos) continue;

		begin = it - int(m);
		double mean = std::accumulate(begin, it, 0.0) / m;
		std::vector<double> diff(m);
		std::transform(begin, it, diff.begin(), [mean](double x) {
			return x - mean;
		});

		double sq_sum = inner_product(diff.begin(), diff.end(), diff.begin(), 0.0);
		if (m - 1 == 0) {
			r[cursor] = invalid_dbl;
		}
		else {
			r[cursor] = sqrt(sq_sum / (m - 1));
		}
	}

	return r;
}

vector<double> __LAST(const vector<double> &v) {
	vector<double> r(v.size(), 0.0);
	if (v.empty()) return r;

	r[0] = v[0] > 0 ? 1.0 : 0.0;
	for (size_t i = 1; i < v.size(); i++) {
		r[i] = v[i] > 0 ? r[i-1] + 1.0 : 0.0;
	}

	return r;
}

vector<double> __HHVBARS(const vector<double>& v, int period) {
	if (v.empty()) return v;
	vector<double> r(v.size(), invalid_dbl);
	size_t pos = getValidPos(v);

	if (period > 0) {
		for (auto cursor = pos + period - 1; cursor < v.size(); ++cursor)
		{
			auto beg = v.begin() + (cursor - (size_t)period + 1);
			auto end = v.begin() + (cursor + 1);
			double vv = *beg;
			for (auto it = beg; it != end; it++) {
				if (vv <= *it) {
					vv = *it;
					beg = it;
				}
			}

			r[cursor] = (double)distance(beg, end);
		}
	}
	else if (period == 0) {
		double vv = *(v.begin() + pos);
		double _sum = 0.0f;
		for (auto cursor = pos; cursor < v.size(); ++cursor)
		{
			if (vv <= v.at(cursor)) {
				vv = v.at(cursor);
				_sum = 0.0f;
			}

			_sum += 1.0f;
			r[cursor] = _sum;
		}
	}

	return r;
}

vector<double> __HHVBARS(const vector<double>& v, const vector<double>& v1) {
	if (v.empty()) return v;
	vector<double> r(v.size(), invalid_dbl);
	vector<double> t(v.size(), invalid_dbl);
	size_t pos = getValidPos(v),
		   pos1 = getValidPos(v1),
		   num = 0;
	double compare = std::numeric_limits<double>::min();
	transform(v.begin()+pos, v.end(), t.begin(), [&compare, &num](double x) {
		if (compare <= x) {
			compare = x; num = 0;
		}
		return num++;
	});

	for (size_t i = pos; i < v.size(); i++) {
		compare = v.at(i); num = i;
		size_t index = i - int(v1.at(i) + 0.1) + 1;
		index = max(index, pos1);

		if (int(v1.at(i)) == 0) {
			r[i] = t[i];
			continue;
		}

		for (size_t m = i; m >= index; m--) {
			if (compare <= v.at(m)) {
				compare = v.at(m); num = m;
			}
		}

		r[i] = 1.0 * (i - num);
	}

	return r;
}

vector<double> __COUNT(const vector<double> & v, int period) {
	if (v.empty()) return v;
	vector<double> r(v.size(), invalid_dbl);
	size_t pos = getValidPos(v);
	if (period == 0) {
		double num = 0.0f;
		transform(v.begin(), v.end(), r.begin(), [&num](double l) {
			return l == invalid_dbl ? invalid_dbl : (num = (l > 0.000001f ? num+1 : num));
		});
	}
	else {
		for (auto cursor = pos + period - 1; cursor < v.size(); ++cursor)
		{
			double num = 0.0f;

			auto beg = v.begin() + (cursor - (size_t)period + 1);
			auto end = v.begin() + (cursor + 1);
			std::for_each(beg, end, [&num](double l) {
				if (l > 0.000001f) num += 1;
			});

			r[cursor] = num;
		}
	}

	return r;
}

vector<double> __NOT(const vector<double> & v) {
	if (v.empty()) return v;
	vector<double> r(v.size(), invalid_dbl);
	size_t pos = getValidPos(v);
	transform(v.begin(), v.end(), r.begin(), [](auto x){
		return x == 0 || x == invalid_dbl ? 1 : 0;
	});
	return r;
}

vector<double> __BETWEEN(const vector<double> & v, const int a, const int b) {
    vector<double> r(v.size(), invalid_dbl);

    if (a>b)
        return r;

    for ( int i = 0; i < v.size(); i++) {
        a < v[i] < b ? r[i] = 1 : r[i] = 0;
    }

    return r;
}

unsigned int __BARSLASTCOUNT(const vector<double> & cond) {

    return __BARSLAST(cond);
}

vector<double> __Ceiling(const vector<double> & v) {
    if (v.empty()) return v;

    vector<double> r(v.size(), invalid_dbl);
    size_t pos = getValidPos(v);
    transform(v.begin(), v.end(), r.begin(), [](auto x) {
        return x == invalid_dbl ? x : ceil(x);
    });
    return r;
}
