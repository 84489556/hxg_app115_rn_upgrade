//
//  YD__BPYC.cpp
//  DzhChart
//
//  Created by apple on 16/6/13.
//  Copyright © 2016年 dzh. All rights reserved.
//

#include "YD__Fml.hpp"
#include "YDInnerFunction.hpp"

#include <sstream>

const FormulaResults& BPYC::run()
{
//    变盘预测（副图改）
//WR1:=100*(HHV(HIGH,20)-CLOSE)/(HHV(HIGH,20)-LLV(LOW,20));
//WR2:=100*(HHV(HIGH,20)-HIGH)/(HHV(HIGH,20)-LLV(LOW,20));
//    偏离:(CLOSE/MA(CLOSE,120)-1)*100;
//X:0,STICK,LINETHICK3;
//    反弹:IF(WR1>97 ,偏离,0),STICK,LINETHICK5;
//    调整:IF(WR1<3 ,偏离,0),STICK,LINETHICK5;
    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    
    vector<double> WR1  = (__HHV(H,20)-C)*100/(__HHV(H,20)-__LLV(L,20));
    vector<double> WR2  = (__HHV(H,20)-H)*100/(__HHV(H,20)-__LLV(L,20));
    
    shared_ptr<FormulaLine> PianLi = make_shared<FormulaLine>();;
    PianLi->_name = "偏离";
    PianLi->_data = (C/__MA(C,120) - 1) * 100;
    PianLi->_color = COLORWHITE;
    _result.push_back(FormulaResult(PianLi));
    
    shared_ptr<FormulaLine> X = make_shared<FormulaLine>();;
    X->_name = "X";
    X->_data = vector<double>(_sticks.size(), 0.0);
    X->_color = COLORWHITE;
    X->_thick = 5;
    X->_type = STICK;
    _result.push_back(FormulaResult(X));
    
    shared_ptr<FormulaLine> FanTan = make_shared<FormulaLine>();;
    FanTan->_name = "反弹";
    FanTan->_data = __IF(WR1 > 97, PianLi->_data, make_vector(size, invalid_dbl));
    FanTan->_color = COLORMAGENTA;
    FanTan->_thick = 5;
    FanTan->_type = STICK;
    _result.push_back(FormulaResult(FanTan));
   
    shared_ptr<FormulaLine> TiaoZhen = make_shared<FormulaLine>();;
    TiaoZhen->_name = "调整";
    TiaoZhen->_data = __IF(WR1 < 3, PianLi->_data, make_vector(size, invalid_dbl));
    TiaoZhen->_color = COLORBLUE;
    TiaoZhen->_thick = 5;
    TiaoZhen->_type = STICK;
    _result.push_back(FormulaResult(TiaoZhen));
    
    return _result;
}



const FormulaResults& CWCL::run()
{
//    仓位策略（副图） 注：指标需要添加30、50、70三条坐标轴
//RSV:=(CLOSE-LLV(LOW,9))/(HHV(HIGH,9)-LLV(LOW,9))*100;
//K:=SMA(RSV,3,1);
//ZJ:=(O+H+L+C)/4;
//YZ:=IF(BARSCOUNT(C)>60,VOL/SUM(VOL,60),VOL/SUM(VOL,BARSCOUNT(C)));
//CYC50:=DMA(ZJ,YZ/0.50);
//CYC0:=DMA(ZJ,YZ);
//KPXS:=(CYC50/CYC0-1)*100;
//KP:=IF(KPXS<0,85,IF(KPXS>=0 AND KPXS<5,60,IF(KPXS>=5 AND KPXS<15,35,IF(KPXS>=15,15,90))));
//    风险:(K+KP)/2;
//    仓位:100-风险;


    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(size), L(size), H(size),  O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});
    
    shared_ptr<FormulaLine> Y1 = make_shared<FormulaLine>();;
    Y1->_name = "";
    Y1->_data = make_vector(size, 30);
    Y1->_color = COLORGRAY;
    _result.push_back(FormulaResult(Y1));
    
    shared_ptr<FormulaLine> Y2 = make_shared<FormulaLine>();;
    Y2->_name = "";
    Y2->_data = make_vector(size, 50);
    Y2->_color = COLORGRAY;
    _result.push_back(FormulaResult(Y2));
    
    shared_ptr<FormulaLine> Y3 = make_shared<FormulaLine>();;
    Y3->_name = "";
    Y3->_data = make_vector(size, 70);
    Y3->_color = COLORGRAY;
    _result.push_back(FormulaResult(Y3));
    
    
    vector<double> RSV  = (C-__LLV(L,9))/(__HHV(H,9)-__LLV(L,9)) * 100;
    vector<double> K  = __SMA(RSV, 3, 1);
    vector<double> ZJ = (O+H+L+C)/4;
    vector<double> YZ = V / __SUM(V, std::min<int>(60, size)) ;
    vector<double> CYC50 = __DMA(ZJ, YZ/0.50);
    vector<double> CYC0 = __DMA(ZJ, YZ);
    vector<double> KPXS = (CYC50/CYC0 -1)*100;
    vector<double> KP = __IF(KPXS<0, make_vector(size,85), __IF(KPXS>=0 && KPXS<5,make_vector(size,60), __IF(KPXS>=5 && KPXS<15, make_vector(size,35), __IF(KPXS>=15, make_vector(size,15), make_vector(size,90) ))));

    
    shared_ptr<FormulaLine> FengXian = make_shared<FormulaLine>();;
    FengXian->_name = "风险";
    FengXian->_data = (K+KP)/2;
    FengXian->_color = COLORWHITE;
    _result.push_back(FormulaResult(FengXian));
    
    shared_ptr<FormulaLine> CangWei = make_shared<FormulaLine>();;
    CangWei->_name = "仓位";
    CangWei->_data = -(FengXian->_data) + 100;
    CangWei->_color = COLORYELLOW;
    _result.push_back(FormulaResult(CangWei));
    
    return _result;
}

const FormulaResults& ZLDT::run()
{
//    主力动态（副图）
//    VAR1:=EMA(EMA(CLOSE,9),9);
//    KP:=(VAR1-REF(VAR1,1))/REF(VAR1,1)*1000;
//    STICKLINE(KP<0,KP,0,1,0),COLORWHITE;
//    A10:=CROSS(KP,0);
//    无庄控盘:IF(KP<0,KP,0),LINETHICK0,COLORWHITE;
//    开始控盘:IF(A10,5,0),LINETHICK1,COLORYELLOW;
//    STICKLINE(KP>REF(KP,1) AND KP>0,KP,0,1,0),COLORRED;
//    有庄控盘:IF(KP>REF(KP,1) AND KP>0,KP,0),LINETHICK0,COLORRED;
//    VAR2:=100*WINNER(CLOSE*0.95);
//    STICKLINE(VAR2>50 AND COST(85)<CLOSE AND 控盘>0,控盘,0,1,0),COLORFF00FF;
//    高度控盘:IF(VAR2>50 AND COST(85)<CLOSE AND 控盘>0,控盘,0),COLORFF00FF,NODRAW;
//    STICKLINE(KP<REF(KP,1) AND KP>0,KP,0,1,0),COLORGREEN;
//    主力出货:IF(KP<REF(KP,1) AND KP>0,KP,0),LINETHICK0,COLORGREEN;

    size_t size = _sticks.size();
    _result.clear();

    vector<double> C(size), L(size), H(size),  O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});

    vector<double> VAR1 = __EMA(__EMA(C,9),9);

    vector<double> 控盘 =(VAR1 - __REF(VAR1,1))/ __REF(VAR1,1)*1000;

    vector<double> A10 = __CROSS(控盘, make_vector(size,0) );

    {
        shared_ptr<FormulaDraw> Line1 = make_shared<FormulaDraw>();
        Line1->_type = STICKLINE;
        Line1->_color = COLORGRAY;
        Line1->_drawPositon1 = 控盘 < 0;
        Line1->_drawPositon2 = 控盘;
        Line1->_drawPositon3 = make_vector(size, 0);
        Line1->_para1 = -1;
        Line1->_para2 = 0;
        _result.push_back(FormulaResult(Line1));
    }
    {
        shared_ptr<FormulaLine> wzkp = make_shared<FormulaLine>();;
        wzkp->_name = "无控盘";
        wzkp->_data = __IF(控盘 < 0, 控盘, make_vector(size, 0));
        wzkp->_nodraw = true;
        wzkp->_color = COLORGRAY;
        _result.push_back(FormulaResult(wzkp));
    }
    {
        shared_ptr<FormulaLine> kskp = make_shared<FormulaLine>();;
        kskp->_name = "";
        kskp->_data = __IF(A10, make_vector(size, 5), make_vector(size, 0));
        kskp->_color = COLORBLUE;
        _result.push_back(FormulaResult(kskp));
    }
    {
        shared_ptr<FormulaDraw> Line2 = make_shared<FormulaDraw>();
        Line2->_type = STICKLINE;
        Line2->_color = COLORRED;
        Line2->_drawPositon1 = 控盘 > __REF(控盘, 1) && 控盘 > 0;
        Line2->_drawPositon2 = 控盘;
        Line2->_drawPositon3 = make_vector(size, 0);
        Line2->_para1 = -1;
        Line2->_para2 = 0;
        _result.push_back(FormulaResult(Line2));
    }
    {
        shared_ptr<FormulaLine> yzkp = make_shared<FormulaLine>();;
        yzkp->_name = "";
        yzkp->_data = __IF(控盘 > __REF(控盘, 1) && 控盘 > 0, 控盘, make_vector(size, 0));
        yzkp->_nodraw = true;
        yzkp->_color = COLORRED;
        _result.push_back(FormulaResult(yzkp));
    }

    /*
    vector<double> VAR2 = 100*WINNER(C*0.95);

    shared_ptr<FormulaDraw> Line3 = make_shared<FormulaDraw>();
    Line3->_type  = STICKLINE;
    Line3->_color = COLORMAGENTA;
    Line3->_drawPositon1 = VAR2>50 && __COST(85)<C && 控盘>0;
    Line3->_drawPositon2 = 控盘;
    Line3->_drawPositon3 =  make_vector(size, 0);
    Line3->_para1 = 1;
    Line3->_para2 = 0;
    _result.push_back(FormulaResult(Line3));

    shared_ptr<FormulaLine> gdkp = make_shared<FormulaLine>();;
    gdkp->_name = "高度控盘";
    gdkp->_data = __IF(VAR2>50 && COST(85)<C && 控盘>0;
    gdkp->_nodraw = true;
    gdkp->_color  = COLORMAGENTA;
    _result.push_back(FormulaResult(gdkp));
*/

    {
        shared_ptr<FormulaDraw> Line4 = make_shared<FormulaDraw>();
        Line4->_type = STICKLINE;
        Line4->_color = COLORGREEN;
        Line4->_drawPositon1 = 控盘 < __REF(控盘, 1) && 控盘 > 0;
        Line4->_drawPositon2 = 控盘;
        Line4->_drawPositon3 = make_vector(size, 0);
        Line4->_para1 = -1;
        Line4->_para2 = 0;
        _result.push_back(FormulaResult(Line4));
    }
    {
        shared_ptr<FormulaLine> zlch = make_shared<FormulaLine>();;
        zlch->_name = "";
        zlch->_data = __IF(控盘 < __REF(控盘, 1) && 控盘 > 0, 控盘, 0);
        zlch->_nodraw = true;
        zlch->_color = COLORGREEN;
        _result.push_back(FormulaResult(zlch));
    }


    return _result;
}


const FormulaResults& DSCJ::run()
{
//    VAR1:MA(C,18),COLORRED;
//    上升:IF(VAR1>REF(VAR1,1),VAR1,DRAWNULL),COLORRED;
//    下降:IF(VAR1<REF(VAR1,1),VAR1,DRAWNULL),COLORGREEN;
    
    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});

    shared_ptr<FormulaLine> VAR1 = make_shared<FormulaLine>();;
    VAR1->_name = "VAR1";
    VAR1->_data = __MA(C,18);
    VAR1->_color  = COLORRED;
    _result.push_back(FormulaResult(VAR1));
    
    shared_ptr<FormulaLine> up = make_shared<FormulaLine>();;
    up->_name = "上升";
    up->_data = __IF(VAR1->_data > __REF(VAR1->_data,1), VAR1->_data, make_vector(size,invalid_dbl));
    up->_color  = COLORRED;
    _result.push_back(FormulaResult(up));
    
    shared_ptr<FormulaLine> down = make_shared<FormulaLine>();;
    down->_name = "下降";
    down->_data = __IF(VAR1->_data < __REF(VAR1->_data,1), VAR1->_data, make_vector(size,invalid_dbl));
    down->_color  = COLORGREEN;
    _result.push_back(FormulaResult(down));
    
    return _result;
}

const FormulaResults& CDCL::run()
{
//Z:=MA(C,120);
//VAR3:=(MA(C,5)-Z)/Z;
//VAR4:=MA((CLOSE-LLV(LOW,20))/(HHV(HIGH,20)-LLV(LOW,20))*100,3);
//D1:DRAWTEXT(CLOSE>Z AND REF(VAR4,1)<30 AND VAR4>REF(VAR4,1) AND REF(VAR4,1)<REF(VAR4,2) ,0.99*LOW ,'▲B'),COLORRED;
//D2:DRAWTEXT(REF(VAR4,1)<7 AND VAR4>REF(VAR4,1) AND REF(VAR4,1)<REF(VAR4,2) AND VAR3<-0.1,0.99*LOW ,'▲B'),COLORGREEN;
//D3:DRAWTEXT(CROSS(VAR4,5) AND VAR3<-0.3,0.99*LOW ,'▲B'),COLORBLUE;

    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(size), L(size), H(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});

    vector<double> Z = __MA(C, 120);
    vector<double> VAR3 = (__MA(C,5)-Z)/Z;
    vector<double> VAR4 = __MA((C - __LLV(L,20))/(__HHV(H,20) - __LLV(L,20))*100,3);
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = C>Z && __REF(VAR4,1)<30 && VAR4>__REF(VAR4,1) && __REF(VAR4,1)<__REF(VAR4,2);
        D1->_drawPositon2 = L * 0.99;
        D1->_text = "▲B";
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = __REF(VAR4,1)<7 && VAR4>__REF(VAR4,1) && __REF(VAR4,1)<__REF(VAR4,2) && VAR3<-0.1;
        D1->_drawPositon2 = L * 0.99;
        D1->_text = "▲B";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLUE;
        D1->_drawPositon1 = __CROSS(VAR4,make_vector(size,5)) && VAR3<-0.3;
        D1->_drawPositon2 = L * 0.99;
        D1->_text = "▲B";
        _result.push_back(FormulaResult(D1));
    }
    
    return _result;
}


const FormulaResults& TDCL::run()
{
//Z:=MA(C,120);
//VAR3:=(MA(H,5)-Z)/Z;
//VAR4:=MA((CLOSE-LLV(LOW,10))/(HHV(HIGH,10)-LLV(LOW,10))*100,3);
//D1:DRAWTEXT(CROSS(95,VAR4) AND VAR3>0.3,1.01*HIGH ,'▼S'),COLORRED;
//D2:DRAWTEXT( CROSS(93,VAR4) AND HHV(H,30)/LLV(L,30)>1.1 AND REF(Z,1)/Z>0.997 ,1.01*HIGH ,'▼S'),COLORGREEN;
//D3:DRAWTEXT(CLOSE<Z AND Z<REF(Z,1) AND REF(VAR4,1)>90 AND VAR4<REF(VAR4,1) AND REF(VAR4,1)>REF(VAR4,2) ,1.01*HIGH,'▼S'),COLORBLUE;
    
    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(size), L(size), H(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    
    vector<double> Z = __MA(C, 120);
    vector<double> VAR3 = (__MA(H,5)-Z)/Z;
    vector<double> VAR4 = __MA((C - __LLV(L,10))/(__HHV(H,10) - __LLV(L,10))*100,3);
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = __CROSS(make_vector(size,95), VAR4) && VAR3>0.3;
        D1->_drawPositon2 = H * 1.01;
        D1->_text = "▼S";
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = __CROSS(make_vector(size,93),VAR4) && __HHV(H,30)/__LLV(L,30)>1.1 && __REF(Z,1)/Z>0.997;
        D1->_drawPositon2 = H * 1.01;
        D1->_text = "▼S";
        _result.push_back(FormulaResult(D1));
    }
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLUE;
        D1->_drawPositon1 = C<Z && Z<__REF(Z,1) && __REF(VAR4,1)>90 && VAR4<__REF(VAR4,1) && __REF(VAR4,1)>__REF(VAR4,2);
        D1->_drawPositon2 = H * 1.01;
        D1->_text = "▼S";
        _result.push_back(FormulaResult(D1));
    }
    
    return _result;
}

const FormulaResults& DXQS::run()
{
//    N:=IF(BARSCOUNT(C)>=13,13,BARSCOUNT(C));
//    STICKLINE(C>=MA(C,N),MA(C,N),MA(C,N*0.7),4,0),COLORMAGENTA;
//    STICKLINE(C<MA(C,N),MA(C,N),MA(C,N*0.7),4,0),COLORBLUE;
//    DRAWKLINE(H,O,L,C);

    
    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(size), L(size), H(size), O(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    
    int N = std::min<int>(13, size);
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORMAGENTA;
        D1->_drawPositon1 = C >= __MA(C,N);
        D1->_drawPositon2 = __MA(C,N);
        D1->_drawPositon3 = __MA(C,N*0.7);
        D1->_para1 = 4;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORBLUE;
        D1->_drawPositon1 = C < __MA(C,N);
        D1->_drawPositon2 = __MA(C, N);
        D1->_drawPositon3 = __MA(C, N*0.7);
        D1->_para1 = 4;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWKLINE;
        D1->_drawPositon1 = H;
        D1->_drawPositon2 = O;
        D1->_drawPositon3 = L;
        D1->_drawPositon4 = C;
        _result.push_back(FormulaResult(D1));
    }
    
    return _result;
}

const FormulaResults& ZXQS::run()
{
//    N:=IF(BARSCOUNT(C)>=34,34,BARSCOUNT(C));
//    STICKLINE(C>=MA(C,N),MA(C,N),MA(C,N*0.78),4,0),COLORMAGENTA;
//    STICKLINE(C<MA(C,N),MA(C,N),MA(C,N*0.78),4,0),COLORBLUE;
//    DRAWKLINE(H,O,L,C);

    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(size), L(size), H(size), O(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    
    int N = std::min<int>(34, size);
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORMAGENTA;
        D1->_drawPositon1 = C >= __MA(C,N);
        D1->_drawPositon2 = __MA(C,N);
        D1->_drawPositon3 = __MA(C,N*0.78);
        D1->_para1 = 4;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORBLUE;
        D1->_drawPositon1 = C < __MA(C,N);
        D1->_drawPositon2 = __MA(C, N);
        D1->_drawPositon3 = __MA(C, N*0.78);
        D1->_para1 = 4;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWKLINE;
        D1->_drawPositon1 = H;
        D1->_drawPositon2 = O;
        D1->_drawPositon3 = L;
        D1->_drawPositon4 = C;
        _result.push_back(FormulaResult(D1));
    }
    return _result;
}

const FormulaResults& CPTX::run()
{
//    Z:=MA(C,120);
//    VAR3:=(MA(C,5)-Z)/Z;
//    VAR4:=MA((CLOSE-LLV(LOW,10))/(HHV(HIGH,10)-LLV(LOW,10))*100,3);
//    波段进场:IF(CLOSE>Z AND REF(VAR4,1)<30 AND VAR4>REF(VAR4,1) AND REF(VAR4,1)<REF(VAR4,2),80,50);
//    反弹进场:IF(REF(VAR4,1)<5 AND VAR4>REF(VAR4,1) AND REF(VAR4,1)<REF(VAR4,2) AND VAR3<-0.3,80,50);
//    超跌进场:IF(CROSS(VAR4,5) AND VAR3<-0.4,80,50);
//    STICKLINE(C>=MA(C,10),VAR4,REF(VAR4,1),4,0),COLORRED;
//    STICKLINE(C<MA(C,10),VAR4,REF(VAR4,1),4,0),COLORGREEN;
//    STICKLINE(CLOSE>0,50,50,6,0),COLORFF00FF;
//    STICKLINE(CLOSE>0,95,95,6,0),COLORGREEN;
//    STICKLINE(CLOSE>0,1,1,6,0),COLORBLUE;


    size_t size = _sticks.size();
    _result.clear();

    const int C1 = 0x666666;
    const int C2 = 0x008000;
    const int C3 = 0x0064FF;

    vector<double> C(size), L(size), H(size), O(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});

    vector<double> Z = __MA(C, 120);
    vector<double> VAR3 = (__MA(C,5)-Z)/Z;
    vector<double> VAR4 = __MA((C - __LLV(L,10))/(__HHV(H,10) - __LLV(L,10))*100,3);


    {
        shared_ptr<FormulaLine> Line = make_shared<FormulaLine>();
        Line->_name = "波段进场";
        Line->_color = 0x333333;
        Line->_data = __IF(C>Z && __REF(VAR4,1)<30 && VAR4>__REF(VAR4,1) && __REF(VAR4,1)<__REF(VAR4,2), make_vector(size,80), make_vector(size, 50));
        _result.push_back(FormulaResult(Line));
    }
    {
        shared_ptr<FormulaLine> Line = make_shared<FormulaLine>();
        Line->_name = "反弹进场";
        Line->_color = 0xFFAA1E;
        Line->_data = __IF(__REF(VAR4,1)<5 && VAR4>__REF(VAR4,1) && __REF(VAR4,1)<__REF(VAR4,2) && VAR3<-0.3, make_vector(size,80), make_vector(size, 50));
        _result.push_back(FormulaResult(Line));
    }
    {
        shared_ptr<FormulaLine> Line = make_shared<FormulaLine>();
        Line->_name = "超跌进场";
        Line->_color = 0xE156E3;
        Line->_data = __IF(__CROSS(VAR4,make_vector(size,5)) && VAR3<-0.4, make_vector(size,80), make_vector(size, 50));
        _result.push_back(FormulaResult(Line));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = 0xDA563C;
        D1->_drawPositon1 = C>=__MA(C,10);
        D1->_drawPositon2 = VAR4;
        D1->_drawPositon3 = __REF(VAR4,1);
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = 0x379637;
        D1->_drawPositon1 = C < __MA(C,10);
        D1->_drawPositon2 = VAR4;
        D1->_drawPositon3 = __REF(VAR4,1);
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = STICKLINE;
//        D1->_color = COLORMAGENTA;
//        D1->_drawPositon1 = C>0;
//        D1->_drawPositon2 = make_vector(size, 50);
//        D1->_drawPositon3 = make_vector(size, 50);
//        D1->_para1 = 1;
//        D1->_para2 = 0;
//        _result.push_back(FormulaResult(D1));
//    }
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = STICKLINE;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = C>0;
//        D1->_drawPositon2 = make_vector(size, 95);
//        D1->_drawPositon3 = make_vector(size, 95);
//        D1->_para1 = 1;
//        D1->_para2 = 0;
//        _result.push_back(FormulaResult(D1));
//    }
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = STICKLINE;
//        D1->_color = COLORBLUE;
//        D1->_drawPositon1 = C>0;
//        D1->_drawPositon2 = make_vector(size, 1);
//        D1->_drawPositon3 = make_vector(size, 1);
//        D1->_para1 = 1;
//        D1->_para2 = 0;
//        _result.push_back(FormulaResult(D1));
//    }

    {
        shared_ptr<FormulaLine> F1 = make_shared<FormulaLine>();;
        F1->_name = "中";
        F1->_data = make_vector(size, 50);
        F1->_color = C2;
        _result.push_back(FormulaResult(F1));
    }
    {
        shared_ptr<FormulaLine> F1 = make_shared<FormulaLine>();;
        F1->_name = "上";
        F1->_data = make_vector(size, 95);
        F1->_color = C1;
        _result.push_back(FormulaResult(F1));
    }
    {
        shared_ptr<FormulaLine> F1 = make_shared<FormulaLine>();;
        F1->_name = "下";
        F1->_data = make_vector(size, 1);
        F1->_color = C3;
        _result.push_back(FormulaResult(F1));
    }

    return _result;
}

const FormulaResults& ZLXC::run()
{
//VAR2:=REF(LOW,1);
//VAR3:=SMA(ABS(LOW-VAR2),3,1)/SMA(MAX(LOW-VAR2,0),3,1)*100;
//VAR4:=EMA(IF(CLOSE*1.3,VAR3*10,VAR3/10),3);
//VAR5:=LLV(LOW,38);
//VAR6:=HHV(VAR4,38);
//VAR7:=IF(LLV(LOW,90),1,0);
//VAR8:=EMA(IF(LOW<=VAR5,(VAR4+VAR6*2)/2,0),3)/618*VAR7;
//STICKLINE(VAR8>-150,0,VAR8,2,0), COLORRED;

    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(size), L(size), H(size), O(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    
    vector<double> VAR2 = __REF(L,1);
    vector<double> VAR3 = __SMA(__ABS(L-VAR2),3,1)/__SMA(__MAX(L-VAR2,0),3,1)*100;
    vector<double> VAR4 = __EMA(__IF(C*1.3,VAR3*10,VAR3/10),3);
    vector<double> VAR5 = __LLV(L,38);
    vector<double> VAR6 = __HHV(VAR4,38);
    vector<double> VAR7 = __IF(__LLV(L,90),make_vector(size,1), make_vector(size, 0) );
    vector<double> VAR8 = __EMA(__IF(L<=VAR5,(VAR4+VAR6*2)/2, make_vector(size, 0) ),3) / 618*VAR7;
    
    vector<double> temp1 = __IF(L<=VAR5,(VAR4+VAR6*2)/2, make_vector(size, 0) );
    vector<double> temp2 = __EMA(temp1, 3);
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_text = "底部筹码";
        D1->_type  = STICKLINE;
        D1->_color = 0xFF2D4B;
        D1->_drawPositon1 = VAR8>-150;
        D1->_drawPositon2 = make_vector(size, 0);
        D1->_drawPositon3 = VAR8;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    
    return _result;
}

const FormulaResults& LFCD::run()
{
//    蓝粉彩带（短）

//    N:=IF(BARSCOUNT(CLOSE)>=13,13,BARSCOUNT(CLOSE));
//    var1:=MA(CLOSE,N);
//    var2:=MA(CLOSE,N*0.7);
//    STICKLINE(CLOSE>=var1,var1,var2,WIDTH,1), COLORGOLD;
//    STICKLINE(CLOSE<var1,var1,var2,WIDTH,1), COLORRoyalBlue;


    _result.clear();


    size_t size = _sticks.size();
    vector<double> C(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});


    int N = __BARSCOUNT(C);
    if (__BARSCOUNT(C)>=13) N = 13;

    vector<double> VAR1(size);
    VAR1 = __MA(C,N);
    vector<double> VAR2(size);
    VAR2 = __MA(C,N*0.7);

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORMAGENTA;
        D1->_drawPositon1 = C>=VAR1;
        D1->_drawPositon2 = VAR1;
        D1->_drawPositon3 = VAR2;
        D1->_para1 = -2;
        D1->_para2 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORBLUE;
        D1->_drawPositon1 = C<VAR1;
        D1->_drawPositon2 = VAR1;
        D1->_drawPositon3 = VAR2;
        D1->_para1 = -2;
        D1->_para2 = 1;
        _result.push_back(FormulaResult(D1));
    }

    return _result;
}

const FormulaResults& ZQCD::run()
{
//    中期彩带（与蓝粉彩带相同，只是参数13改为34）

//    N:=IF(BARSCOUNT(CLOSE)>=34,34,BARSCOUNT(CLOSE));
//    STICKLINE(CLOSE>=MA(CLOSE,N),MA(CLOSE,N),MA(CLOSE,N*0.7),WIDTH,0), COLORMAGENTA;
//    STICKLINE(CLOSE<MA(CLOSE,N),MA(CLOSE,N),MA(CLOSE,N*0.7),WIDTH,0), COLORBLUE;
//    KLINE(OPEN,HIGH,LOW,CLOSE,0);


    _result.clear();


    size_t size = _sticks.size();
    vector<double> C(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});


    int N = __BARSCOUNT(C);
    if (__BARSCOUNT(C)>=34) N = 34;

    vector<double> VAR1(size);
    VAR1 = __MA(C,N);
    vector<double> VAR2(size);
    VAR2 = __MA(C,N*0.7);

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORMAGENTA;
        D1->_drawPositon1 = C>=VAR1;
        D1->_drawPositon2 = VAR1;
        D1->_drawPositon3 = VAR2;
        D1->_para1 = -2;
        D1->_para2 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORBLUE;
        D1->_drawPositon1 = C<VAR1;
        D1->_drawPositon2 = VAR1;
        D1->_drawPositon3 = VAR2;
        D1->_para1 = -2;
        D1->_para2 = 1;
        _result.push_back(FormulaResult(D1));
    }

    return _result;
}

const FormulaResults& BoDongJiXian::run() {

//    新波动极限

//    LC:=REF(CLOSE,1);
//    TMP1:=SMA(MAX(CLOSE-LC,0),8,1);
//    TMP2:=SMA(ABS(CLOSE-LC),8,1);
//    SD:=(TMP1/TMP2*2-1)/4+1;
//    中轨:MA(CLOSE,30),LINETHICK1,COLORRED;
//
//    TDVOL1:=中轨*SD;
//    上轨:中轨*1.12,LINETHICK1,COLOR0064FF;
//    下轨:中轨*0.88,LINETHICK1,COLOR0064FF;
//    上上轨1:中轨*1.18,LINETHICK1, COLOR009900;
//    下下轨1:中轨*0.82,LINETHICK1, COLOR009900;
//
//    VARBL1:=HIGH/MAX(CLOSE,OPEN);
//    VARBL2:=LOW/MIN(CLOSE,OPEN);
//    PRECLOSE:=REF(C,1);
//    VARCLOSE:=TDVOL1;
//    VAROPEN:=REF(TDVOL1,1);
//    VARHIGH:=MAX(VARCLOSE,VAROPEN)*VARBL1*1.008;
//    VARLOW:=MIN(VARCLOSE,VAROPEN)*VARBL2*0.992;
//    STICKLINE(CLOSE>OPEN,VARHIGH,VARLOW,0.8,1), COLORRED;
//    STICKLINE(CLOSE>OPEN,VARCLOSE,VAROPEN,8,0), COLORRED;
//    STICKLINE(CLOSE<OPEN,VARHIGH,VARLOW,0.8,1), COLOR0064FF;
//    STICKLINE(CLOSE<OPEN,VAROPEN,VARCLOSE,8,0), COLOR0064FF;
//
//    STICKLINE(CLOSE=OPEN AND PRECLOSE<OPEN,VARCLOSE,VARCLOSE,8,0),COLORRED;
//    STICKLINE(CLOSE=OPEN AND PRECLOSE>OPEN,VARCLOSE,VARCLOSE,8,0),COLOR0064FF;


    _result.clear();

    size_t size = _sticks.size();
    vector<double> C(size), L(size), H(size), O(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});

    vector<double> LC = __REF(C,1);
    vector<double> TMP1 = __SMA(__MAX(C-LC,0),8,1);
    vector<double> TMP2 = __SMA(__ABS(C-LC),8,1);
    vector<double> SD = (TMP1/TMP2*2-1)/4+1;

    shared_ptr<FormulaLine> ZhongGui = make_shared<FormulaLine>();;
    {
        ZhongGui->_name = "中轨";
        ZhongGui->_data = __MA(C, 30);
        ZhongGui->_color = COLORRED;
        _result.push_back(FormulaResult(ZhongGui));
    }
    {
        shared_ptr<FormulaLine> ShangGui = make_shared<FormulaLine>();;
        ShangGui->_name = "上轨";
        ShangGui->_data = ZhongGui->_data * 1.12;
        ShangGui->_color = COLOR05;
        ShangGui->_type = POINTDOT;
        _result.push_back(FormulaResult(ShangGui));
    }
    {
        shared_ptr<FormulaLine> XiaGui = make_shared<FormulaLine>();;
        XiaGui->_name = "下轨";
        XiaGui->_data = ZhongGui->_data * 0.88;
        XiaGui->_color = COLOR05;
        XiaGui->_type = POINTDOT;
        _result.push_back(FormulaResult(XiaGui));
    }
    {
        shared_ptr<FormulaLine> ShangShangGui = make_shared<FormulaLine>();;
        ShangShangGui->_name = "上上轨";
        ShangShangGui->_data = ZhongGui->_data * 1.18;
        ShangShangGui->_color = 0x008000;
        _result.push_back(FormulaResult(ShangShangGui));
    }
    {
        shared_ptr<FormulaLine> XiaXiaGui = make_shared<FormulaLine>();;
        XiaXiaGui->_name = "下下轨";
        XiaXiaGui->_data = ZhongGui->_data * 0.82;
        XiaXiaGui->_color = 0x008000;
        _result.push_back(FormulaResult(XiaXiaGui));
    }

    vector<double> TDVOL1 = ZhongGui->_data * SD;
    vector<double> VARBL1 = H/__MAX(C,O);
    vector<double> VARBL2 = L/__MIN(C,O);
    vector<double> PRECLOSE = __REF(C,1);
    vector<double> VARCLOSE = TDVOL1;
    vector<double> VAROPEN = __REF(TDVOL1,1);
    vector<double> VARHIGH = __MAX(VARCLOSE,VAROPEN)*VARBL1*1.008;
    vector<double> VARLOW = __MIN(VARCLOSE,VAROPEN)*VARBL2*0.992;

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORRED;
        D1->_drawPositon1 = C>O;
        D1->_drawPositon2 = VARHIGH;
        D1->_drawPositon3 = VARLOW;
        D1->_para1 = 0.8;
        D1->_para2 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORRED;
        D1->_drawPositon1 = C>O;
        D1->_drawPositon2 = VARCLOSE;
        D1->_drawPositon3 = VAROPEN;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLOR05;
        D1->_drawPositon1 = C<O;
        D1->_drawPositon2 = VARHIGH;
        D1->_drawPositon3 = VARLOW;
        D1->_para1 = 0.8;
        D1->_para2 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLOR05;
        D1->_drawPositon1 = C<O;
        D1->_drawPositon2 = VAROPEN;
        D1->_drawPositon3 = VARCLOSE;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORRED;
        D1->_drawPositon1 = C=O && PRECLOSE<O;
        D1->_drawPositon2 = VARCLOSE;
        D1->_drawPositon3 = VARCLOSE;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLOR05;
        D1->_drawPositon1 = C=O && PRECLOSE>O;
        D1->_drawPositon2 = VARCLOSE;
        D1->_drawPositon3 = VARCLOSE;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }


    return _result;
}

const FormulaResults& QuShiQiangDu::run()
{

    //PJJ:=DMA((HIGH+LOW+CLOSE*2)/4,0.9);
    //JJ:=REF(EMA(PJJ,3),1);
    //QJJ:=VOL/((HIGH-LOW)*2-(ABS(CLOSE-OPEN)));
    //XVL:=(IF(CLOSE>OPEN,QJJ*(HIGH-LOW),IF(CLOSE<OPEN,QJJ*(HIGH-OPEN+CLOSE-LOW),VOL/2)))+(IF(CLOSE>OPEN,-QJJ*(HIGH-CLOSE+OPEN-LOW),IF(CLOSE<OPEN,-QJJ*(HIGH-LOW),-VOL/2)));
    //HSL:=XVL/20/1.15;
    
    //    攻击流量:=HSL*0.55+REF(HSL,1)*0.33+REF(HSL,2)*0.22;
    
    //    STICKLINE(HSL*0.4>=0,HSL*0.4*1.5,0,1,0),color808080;
    //    STICKLINE(HSL*0.4<0,HSL*0.4*1.5,0,1,0),color808080;
    
    //GJJ:=EMA(攻击流量,8);
    //LLJX:=EMA(攻击流量,3);
    //    资金流量:LLJX,LINETHICK0,colorFF;
    
    //    STICKLINE(资金流量>0,资金流量,0,7,0),colorFF;
    //    STICKLINE(资金流量<0,资金流量,0,7,0),colorFF0000;
    
    //    流量基线:=GJJ;
    //ZJLL:=REF(LLJX,1);
    //QZJJ:=(LLJX-ZJLL)/ZJLL*100;
    
    //    流量增幅:IF(LLJX>0 AND ZJLL<0,ABS(QZJJ),IF(LLJX<0 AND ZJLL<0 AND LLJX<ZJLL,-QZJJ,QZJJ)),LINETHICK0;
    //    力度:HSL/1000,LINETHICK0;
    //    周流量:=SUM(LLJX,5);
    //BB:=REF(周流量,1);
    //ZQZJJ:=(周流量-BB)/BB*100;
    //    周增幅:=IF(周流量>0 AND BB<0,ABS(ZQZJJ),IF(周流量<0 AND BB<0 AND 周流量<BB,-ZQZJJ,ZQZJJ));

    size_t size = _sticks.size();
    _result.clear();
    
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});
    
    vector<double> PJJ = __DMA((H+L+C*2)/4, make_vector(size,0.9));
    vector<double> WR2 = __REF(__EMA(PJJ,3),1);
    vector<double> QJJ = V/((H-L)*2-(__ABS(C-O)));
    vector<double> XVL = (__IF(C>O,QJJ*(H-L),__IF(C<O,QJJ*(H-O+C-L),V/2)))+(__IF(C>O,-QJJ*(H-C+O-L),__IF(C<O,-QJJ*(H-L),-V/2)));
    vector<double> HSL = XVL/20/1.15;
    vector<double> GongJiLiuLiang = HSL*0.55+__REF(HSL,1)*0.33+__REF(HSL,2)*0.22;
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = 0X808080;
        D1->_drawPositon1 = HSL*0.4>=0;
        D1->_drawPositon2 = HSL*0.4*1.5;
        D1->_drawPositon3 = make_vector(size, 0);
        D1->_para1 = 1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = 0X808080;
        D1->_drawPositon1 = HSL*0.4<0;
        D1->_drawPositon2 = HSL*0.4*1.5;
        D1->_drawPositon3 = make_vector(size, 0);
        D1->_para1 = 1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    
    vector<double> GJJ = __EMA(GongJiLiuLiang,8);
    vector<double> LLJX = __EMA(GongJiLiuLiang,3);
    
    shared_ptr<FormulaLine> ZiJinLiuLiang = make_shared<FormulaLine>();;
    ZiJinLiuLiang->_name = "资金流量";
    ZiJinLiuLiang->_data = LLJX;
    ZiJinLiuLiang->_color = COLORRED;
    ZiJinLiuLiang->_nodraw = true;
    _result.push_back(FormulaResult(ZiJinLiuLiang));
    
    
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = 0X0000FF;
        D1->_drawPositon1 = ZiJinLiuLiang->_data>0;
        D1->_drawPositon2 = ZiJinLiuLiang->_data;
        D1->_drawPositon3 = make_vector(size, 0);
        D1->_para1 = 7;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = 0XFF0000;
        D1->_drawPositon1 = ZiJinLiuLiang->_data<0;
        D1->_drawPositon2 = ZiJinLiuLiang->_data;
        D1->_drawPositon3 = make_vector(size, 0);
        D1->_para1 = 7;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    
//    vector<double> 流量基线 = GJJ;
    vector<double> ZJLL = __REF(LLJX,1);
    vector<double> QZJJ = (LLJX-ZJLL)/ZJLL*100;
    
    shared_ptr<FormulaLine> LiuLiangZengFu = make_shared<FormulaLine>();;
    LiuLiangZengFu->_name = "流量增幅";
    LiuLiangZengFu->_data = __IF(LLJX>0&&ZJLL<0, __ABS(QZJJ), __IF(LLJX<0&&ZJLL<0&&LLJX<ZJLL,-QZJJ,QZJJ));
    LiuLiangZengFu->_nodraw = true;
    _result.push_back(FormulaResult(LiuLiangZengFu));
    
    
    shared_ptr<FormulaLine> LiDu = make_shared<FormulaLine>();;
    LiDu->_name = "力度";
    LiDu->_data = HSL/1000;
    LiDu->_nodraw = true;
    _result.push_back(FormulaResult(LiDu));
    

//    vector<double> 周流量 = __SUM(LLJX,5);
//    vector<double> BB = __REF(周流量,1);
//    vector<double> ZQZJJ = (周流量-BB)/BB*100;
//    vector<double> 周增幅 = __IF(周流量>0 && BB<0, __ABS(ZQZJJ), __IF(周流量<0 && BB<0 && 周流量<BB,-ZQZJJ,ZQZJJ));
    
    
    return _result;
}

const FormulaResults& LiangNengHuangJin::run()
{
//    量能黄金

//    M1:=5;
//    M2:=35;
//    M3:=135;
//
//    VOLUME:VOL,VOLSTICK;
//    MA5:MA(VOLUME,M1);
//    MA35:MA(VOLUME,M2);
//    MA135:MA(VOLUME,M3);
//    AA:=VOL>REF(V,1)*1.9;
//    AA1:=VOL<REF(LLV(VOL,13),1);
//    AA2:=VOL<REF(LLV(VOL,55),1);
//    STICKLINE(AA,0,V,8,0),COLORYELLOW;
//    STICKLINE(AA2,0,V,8,0),COLORMAGENTA;

    _result.clear();
    size_t size = _sticks.size();

    const int M1 = 5, M2 = 35, M3 = 135;

    vector<double> V(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});

    {
        shared_ptr<FormulaLine> VOL = make_shared<FormulaLine>();
        VOL->_name = "VOLUME";
        VOL->_data = V;
        VOL->_type = VOLSTICK;
        _result.push_back(FormulaResult(VOL));
    }
    {
        shared_ptr<FormulaLine> MA5 = make_shared<FormulaLine>();;
        MA5->_name = "MA5";
        MA5->_data = __MA(V, M1);
        MA5->_color = COLOR01;
        _result.push_back(FormulaResult(MA5));
    }
    {
        shared_ptr<FormulaLine> MA35 = make_shared<FormulaLine>();;
        MA35->_name = "MA35";
        MA35->_data = __MA(V, M2);
        MA35->_color = COLOR02;
        _result.push_back(FormulaResult(MA35));
    }
    {
        shared_ptr<FormulaLine> MA135 = make_shared<FormulaLine>();;
        MA135->_name = "MA135";
        MA135->_data = __MA(V, M3);
        MA135->_color = COLOR03;
        _result.push_back(FormulaResult(MA135));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = 0xFFE400;
        D1->_drawPositon1 = V>__REF(V,1)*1.9;
        D1->_drawPositon2 = make_vector(size, 0);
        D1->_drawPositon3 = V;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORMAGENTA;
        D1->_drawPositon1 = V<__REF(__LLV(V,55),1);
        D1->_drawPositon2 = make_vector(size, 0);
        D1->_drawPositon3 = V;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }

    return _result;
}

const FormulaResults& QiangRuoZhuanHuan::run()
{
//    强弱转换

//    NN:=26;
//    M1:=10;
//
//    MID:=REF(HIGH+LOW,1)/2;
//    零轴:90,COLORRED;
//    能量柱值:SUM(MAX(0,HIGH-MID),NN)/SUM(MAX(0,MID-LOW),NN)*100,COLORWHITE;
//    MA1:=REF(MA(能量柱值,M1),M1/2.5+1);
//    黄金1:50,COLORYELLOW,LINEDOT,LINETHICK1;
//    黄金2:40,COLORYELLOW,LINETHICK1;
//    STICKLINE(能量柱值>90,能量柱值,90,8,0),COLORMAGENTA;
//    STICKLINE(能量柱值<90,90,能量柱值,8,0),COLORWHITE;
//    SUM(MAX(0,HIGH-MID),NN)/SUM(MAX(0,MID-LOW),NN)*100,COLORWHITE,LINETHICK;


    _result.clear();
    size_t size = _sticks.size();

    const int NN = 26;

    const int color1 = 0xFF0054;
    const int color2 = 0x00AA64;
    const int color3 = 0xFF0000;
    const int color4 = 0xFFAA19;
    const int color5 = 0x666666;
    const int color6 = 0x888888;

    vector<double> L(_sticks.size()), H(_sticks.size());
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});

    vector<double> M(_sticks.size());
    M = __REF(H+L,1)/2;
    vector<double> E(_sticks.size());
    E = __SUM(__MAX(H-M,0),NN)/__SUM(__MAX(M-L,0),NN)*100;

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = color1;
        D1->_drawPositon1 = E>90;
        D1->_drawPositon2 = E;
        D1->_drawPositon3 = make_vector(size, 90);
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = color2;
        D1->_drawPositon1 = E<90;
        D1->_drawPositon2 = make_vector(size, 90);
        D1->_drawPositon3 = E;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaLine> Zero = make_shared<FormulaLine>();;
        Zero->_name = "零轴";
        Zero->_data = make_vector(size, 90);;
        Zero->_color = color5;
        _result.push_back(FormulaResult(Zero));
    }
    {
        shared_ptr<FormulaLine> Gold1 = make_shared<FormulaLine>();;
        Gold1->_name = "黄金1";
        Gold1->_data = make_vector(size, 50);;
        Gold1->_color = color4;
        Gold1->_type = POINTDOT;
        _result.push_back(FormulaResult(Gold1));
    }
    {
        shared_ptr<FormulaLine> Gold2 = make_shared<FormulaLine>();;
        Gold2->_name = "黄金2";
        Gold2->_data = make_vector(size, 40);;
        Gold2->_color = color4;
        _result.push_back(FormulaResult(Gold2));
    }

    {
        shared_ptr<FormulaLine> Energy = make_shared<FormulaLine>();;
        Energy->_name = "能量柱值";
        Energy->_data = E;
        Energy->_color = color3;
        _result.push_back(FormulaResult(Energy));
    }


    return _result;
}

const FormulaResults& ZhouQiGuaiDian::run()
{
//    周期拐点（双CCI）
//
//    N:=14;
//    M:=84;
//    TYP:=(HIGH+LOW+CLOSE)/3;
//
//    短周期1:(TYP-MA(TYP,N))/(0.015*AVEDEV(TYP,N));
//    长周期1:(TYP-MA(TYP,M))/(0.015*AVEDEV(TYP,M));
//
//    逢高出1:200,COLORGREEN,LINETHICK1;
//    逢低买1:-150,COLORRED,LINETHICK1;
//    零轴:1,COLORYELLOW,LINETHICK1;
//
//    VARA:=REF(LOW,1);
//    VARB:=SMA(ABS(LOW-VARA),3,1)/SMA(MAX(LOW-VARA,0),3,1)*100;
//    VARC:=EMA(IF(CLOSE*1.3,VARB*10,VARB/10),3);
//    VARD:=LLV(LOW,30);
//    VARE:=HHV(VARC,30);
//    VARF:=IF(MA(CLOSE,58),1,0);
//    VARG:=EMA(IF(LOW<=VARD,(VARC+VARE*2)/2,0),3)/618*VARF;
//    VARH:=IF(VARG>50,50,VARG);
//    RSV:=(((CLOSE - LLV(LOW,9)) / (HHV(HIGH,9) - LLV(LOW,9))) * 100);
//
//    逢低买2:IF(CROSS(短周期1,-150),-200,-200),COLORFF00FF,LINETHICK1;
//
//    LL:=REF(CLOSE,1);
//    MM:=SMA(MAX(CLOSE-LL,0),6,1)/SMA(ABS(CLOSE-LL),6,1)*100;
//
//    逢高出2:IF(CROSS(80,MM),250,250),COLOR00FFFF,LINETHICK1;


    _result.clear();

    const int N = 14, M = 84;

    const int color1 = 0x42D278;
    const int color2 = 0x5FF0F0;
    const int color3 = 0xFF8282;
    const int color4 = 0xFFAA1E;
    const int color5 = 0x333333;
    const int color6 = 0xFF0079D5;

    size_t size = _sticks.size();
    vector<double> C(size), L(size), H(size), O(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});

    vector<double> TYP = (H+L+C)/3;


//    {
//        shared_ptr<FormulaLine> ShortPeriod = make_shared<FormulaLine>();;
//        ShortPeriod->_name = "短周期";
//        ShortPeriod->_data = (TYP-__MA(TYP,N))/(__AVEDEV(TYP,N)*0.015);
//        ShortPeriod->_color = color5;
//        _result.push_back(FormulaResult(ShortPeriod));
//    }
    {
        shared_ptr<FormulaLine> LongPeriod = make_shared<FormulaLine>();;
        LongPeriod->_name = "长周期";
        LongPeriod->_data = (TYP-__MA(TYP,M))/(__AVEDEV(TYP,M)*0.015);
        LongPeriod->_color = color6;
        _result.push_back(FormulaResult(LongPeriod));
    }
    {
        shared_ptr<FormulaLine> HighOut = make_shared<FormulaLine>();;
        HighOut->_name = "高出1";
        HighOut->_data = make_vector(size, 200);
        HighOut->_color = color1;
        _result.push_back(FormulaResult(HighOut));
    }
    {
        shared_ptr<FormulaLine> LowIn = make_shared<FormulaLine>();;
        LowIn->_name = "低买1";
        LowIn->_data = make_vector(size, -150);
        LowIn->_color = color3;
        _result.push_back(FormulaResult(LowIn));
    }
    {
        shared_ptr<FormulaLine> Zero = make_shared<FormulaLine>();;
        Zero->_name = "零轴";
        Zero->_data = make_vector(size, 1);
        Zero->_color = color5;
        _result.push_back(FormulaResult(Zero));
    }


    vector<double> VARA = __REF(L,1);
    vector<double> VARB = __SMA(__ABS(L-VARA),3,1)/__SMA(__MAX(L-VARA,0),3,1)*100;
    vector<double> VARC = __EMA(__IF(C*1.3,VARB*10,VARB/10),3);
    vector<double> VARD = __LLV(L,30);
    vector<double> VARE = __HHV(VARC,30);
    vector<double> VARF = __IF(__MA(C,58),1,0);
    vector<double> VARG = __EMA(__IF(L<=VARD,(VARC+VARE*2)/2,0),3)/618*VARF;


    {
        shared_ptr<FormulaLine> LowIn = make_shared<FormulaLine>();;
        LowIn->_name = "低买2";
        LowIn->_data = __IF(__CROSS( (TYP-__MA(TYP,N))/(__AVEDEV(TYP,N)*0.015) ,-150),-200,-200);
        LowIn->_color = color4;
        _result.push_back(FormulaResult(LowIn));
    }

    vector<double> LL = __REF(C,1);
    vector<double> MM = __SMA(__MAX(C-LL,0),6,1)/__SMA(__ABS(C-LL),6,1)*100;

    {
        shared_ptr<FormulaLine> HighOut = make_shared<FormulaLine>();;
        HighOut->_name = "高出2";
        HighOut->_data = __IF(__CROSS(80,MM),250,250);
        HighOut->_color = color2;
        _result.push_back(FormulaResult(HighOut));
    }


    return _result;
}

const FormulaResults& QuShiCaiHong::run()
{
//    趋势彩虹（主）
//
//    S:=CROSS(CLOSE,WMA(HIGH,25));
//    X:=CROSS(WMA(LOW,25),CLOSE);
//    WS:=BARSLAST(S)+1;
//    WX:=BARSLAST(X)+1;
//    SS:=CROSS(SUM(S,WX),0.5);
//    XX:=CROSS(SUM(X,WS),0.5);
//
//    FILLRGN(CLOSE>WMA(HIGH,120),WMA(HIGH,120),WMA(LOW,120)),COLORFF8181;
//    FILLRGN(CLOSE<WMA(LOW,120),WMA(LOW,120),WMA(HIGH,120)),COLOR81FF81;
//    短线趋势:IF(C<WMA(H,25),WMA(H,25),DRAWNULL),COLOR0064FF;
//    IF(C>WMA(L,25),WMA(L,25),DRAWNULL),COLORFF00FF;
//    IF(C>WMA(H,25),WMA(H,25),DRAWNULL),COLORFF00FF;
//    IF(C<WMA(L,25),WMA(L,25),DRAWNULL),COLOR0064FF;
//    partline(CLOSE<WMA(HIGH,25),WMA(HIGH,25)),COLOR0064FF;
//    partline(CLOSE>WMA(LOW,25),WMA(LOW,25)),COLORFF00FF;
//    partline(CLOSE>WMA(HIGH,25),WMA(HIGH,25)),COLORFF00FF;
//    partline(CLOSE<WMA(LOW,25),WMA(LOW,25)),COLOR0064FF;
//
//    长线趋势:IF(C>WMA(H,120),WMA(H,120),DRAWNULL),COLORRED;
//    IF(C<WMA(H,120),WMA(H,120),DRAWNULL),COLORGREEN;
//    IF(C>WMA(L,120),WMA(L,120),DRAWNULL),COLORRED;
//    IF(C<WMA(L,120),WMA(L,120),DRAWNULL),COLORGREEN;
//    partline(CLOSE>WMA(HIGH,120),WMA(HIGH,120)),COLORRED;
//    partline(CLOSE<WMA(HIGH,120),WMA(HIGH,120)),COLORGREEN;
//    partline(CLOSE>WMA(LOW,120),WMA(LOW,120)),COLORRED;
//    partline(CLOSE<WMA(LOW,120),WMA(LOW,120)),COLORGREEN;
//    FILLRGN(CLOSE>WMA(HIGH,25),WMA(HIGH,25),WMA(LOW,25))COLORFF00FF;
//    FILLRGN(CLOSE<WMA(LOW,25),WMA(LOW,25),WMA(HIGH,25)),COLOR0064FF;


    _result.clear();

    const int M = 25, N = 120;

    const int color1 = COLOR05;
    const int color2 = 0xFFAA1E;
    const int color3 = 0xFF8282;
    const int color4 = 0x42D278;

    size_t size = _sticks.size();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});


    vector<double> S = __CROSS(C,__WMA(H,M));
    vector<double> X = __CROSS(__WMA(L,M),C);
    unsigned int WS = __BARSLAST(S)+1;
    unsigned int WX = __BARSLAST(X)+1;
    vector<double> SS = __CROSS(__SUM(S,WX),0.5);
    vector<double> XX = __CROSS(__SUM(X,WS),0.5);

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = color3;
        D1->_drawPositon1 = C>__WMA(H,N);
        D1->_drawPositon2 = __WMA(H,N);
        D1->_drawPositon3 = __WMA(L,N);
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = COLOR08;
        D1->_drawPositon1 = C<__WMA(L,N);
        D1->_drawPositon2 = __WMA(L,N);
        D1->_drawPositon3 = __WMA(H,N);
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_text = "短线趋势";
        D1->_type  = PARTLINE;
        D1->_color = color1;
        D1->_drawPositon1 = C<__WMA(H,M);
        D1->_drawPositon2 = __WMA(H,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color2;
        D1->_drawPositon1 = C>__WMA(L,M);
        D1->_drawPositon2 = __WMA(L,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color2;
        D1->_drawPositon1 = C>__WMA(H,M);
        D1->_drawPositon2 = __WMA(H,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color1;
        D1->_drawPositon1 = C<__WMA(L,M);
        D1->_drawPositon2 = __WMA(L,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_text = "长线趋势";
        D1->_type  = PARTLINE;
        D1->_color = color3;
        D1->_drawPositon1 = C>__WMA(H,N);
        D1->_drawPositon2 = __WMA(H,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color4;
        D1->_drawPositon1 = C<__WMA(H,N);
        D1->_drawPositon2 = __WMA(H,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color3;
        D1->_drawPositon1 = C>__WMA(L,N);
        D1->_drawPositon2 = __WMA(L,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color4;
        D1->_drawPositon1 = C<__WMA(L,N);
        D1->_drawPositon2 = __WMA(L,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = color2;
        D1->_drawPositon1 = C>__WMA(H,M);
        D1->_drawPositon2 = __WMA(H,M);
        D1->_drawPositon3 = __WMA(L,M);
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = color1;
        D1->_drawPositon1 = C<__WMA(L,M);
        D1->_drawPositon2 = __WMA(L,M);
        D1->_drawPositon3 = __WMA(H,M);
        _result.push_back(FormulaResult(D1));
    }


    return _result;
}

const FormulaResults& ShortQuShiCaiHong::run()
{
//    短线趋势彩虹（主）
//
//    S:=CROSS(CLOSE,WMA(HIGH,25));
//    X:=CROSS(WMA(LOW,25),CLOSE);
//    WS:=BARSLAST(S)+1;
//    WX:=BARSLAST(X)+1;
//    SS:=CROSS(SUM(S,WX),0.5);
//    XX:=CROSS(SUM(X,WS),0.5);
//
//    FILLRGN(CLOSE>WMA(HIGH,25),WMA(HIGH,25),WMA(LOW,25)),COLORFF5264;
//    FILLRGN(CLOSE<WMA(LOW,25),WMA(LOW,25),WMA(HIGH,25)),COLOR81FF81;
//    短线趋势:IF(C<WMA(H,7),WMA(H,7),DRAWNULL),COLOR0064FF;
//    IF(C>WMA(H,7),WMA(H,7),DRAWNULL),COLORFFA726;
//    IF(C<WMA(L,7),WMA(L,7),DRAWNULL),COLOR0064FF;
//    IF(C>WMA(L,7),WMA(L,7),DRAWNULL),COLORFFA726;
//    partline(CLOSE<WMA(HIGH,7),WMA(HIGH,7)),COLOR0064FF;
//    partline(CLOSE>WMA(LOW,7),WMA(LOW,7)),COLORFFA726;
//    partline(CLOSE>WMA(HIGH,7),WMA(HIGH,7)),COLORFFA726;
//    partline(CLOSE<WMA(LOW,7),WMA(LOW,7)),COLOR0064FF;
//
//    长线趋势:IF(C>WMA(H,25),WMA(H,25),DRAWNULL),COLORFF5264;
//    IF(C<WMA(H,25),WMA(H,25),DRAWNULL),COLOR81FF81;
//    IF(C>WMA(L,25),WMA(L,25),DRAWNULL),COLORFF5264;
//    IF(C<WMA(L,25),WMA(L,25),DRAWNULL),COLOR81FF81;
//    partline(CLOSE>WMA(HIGH,25),WMA(HIGH,25)),COLORFF5264;
//    partline(CLOSE<WMA(HIGH,25),WMA(HIGH,25)),COLOR81FF81;
//    partline(CLOSE>WMA(LOW,25),WMA(LOW,25)),COLORFF5264;
//    partline(CLOSE<WMA(LOW,25),WMA(LOW,25)),COLOR81FF81;
//    FILLRGN(CLOSE>WMA(HIGH,7),WMA(HIGH,7),WMA(LOW,7)),COLORFFA726;
//    FILLRGN(CLOSE<WMA(LOW,7),WMA(LOW,7),WMA(HIGH,7)),COLOR0064FF;


    _result.clear();

    const int M = 7, N = 25;

    const int color1 = COLOR05;
    const int color2 = 0xFFAA1E;
    const int color3 = 0xFF8282;
    const int color4 = 0x42D278;

    size_t size = _sticks.size();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});


    vector<double> S = __CROSS(C,__WMA(H,M));
    vector<double> X = __CROSS(__WMA(L,M),C);
    unsigned int WS = __BARSLAST(S)+1;
    unsigned int WX = __BARSLAST(X)+1;
    vector<double> SS = __CROSS(__SUM(S,WX),0.5);
    vector<double> XX = __CROSS(__SUM(X,WS),0.5);

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = color3;
        D1->_drawPositon1 = C>__WMA(H,N);
        D1->_drawPositon2 = __WMA(H,N);
        D1->_drawPositon3 = __WMA(L,N);
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = COLOR08;
        D1->_drawPositon1 = C<__WMA(L,N);
        D1->_drawPositon2 = __WMA(L,N);
        D1->_drawPositon3 = __WMA(H,N);
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_text = "短线趋势";
        D1->_type  = PARTLINE;
        D1->_color = color1;
        D1->_drawPositon1 = C<__WMA(H,M);
        D1->_drawPositon2 = __WMA(H,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color2;
        D1->_drawPositon1 = C>__WMA(L,M);
        D1->_drawPositon2 = __WMA(L,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color2;
        D1->_drawPositon1 = C>__WMA(H,M);
        D1->_drawPositon2 = __WMA(H,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color1;
        D1->_drawPositon1 = C<__WMA(L,M);
        D1->_drawPositon2 = __WMA(L,M);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_text = "长线趋势";
        D1->_type  = PARTLINE;
        D1->_color = color3;
        D1->_drawPositon1 = C>__WMA(H,N);
        D1->_drawPositon2 = __WMA(H,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color4;
        D1->_drawPositon1 = C<__WMA(H,N);
        D1->_drawPositon2 = __WMA(H,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color3;
        D1->_drawPositon1 = C>__WMA(L,N);
        D1->_drawPositon2 = __WMA(L,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = color4;
        D1->_drawPositon1 = C<__WMA(L,N);
        D1->_drawPositon2 = __WMA(L,N);
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = color2;
        D1->_drawPositon1 = C>__WMA(H,M);
        D1->_drawPositon2 = __WMA(H,M);
        D1->_drawPositon3 = __WMA(L,M);
        _result.push_back(FormulaResult(D1));
    }
    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = FILLRGN;
        D1->_color = color1;
        D1->_drawPositon1 = C<__WMA(L,M);
        D1->_drawPositon2 = __WMA(L,M);
        D1->_drawPositon3 = __WMA(H,M);
        _result.push_back(FormulaResult(D1));
    }


    return _result;

}

const FormulaResults& JiAnXian::run() {

//    1、济安线2：（主）
//
//    N:=10;
//    M:=15;
//    A:=EMA(CLOSE,8)>EMA(CLOSE,21);
//    A2:=REF(EMA(CLOSE,8),1)>REF(EMA(CLOSE,21),1);
//    B:=EMA(CLOSE,8)<EMA(CLOSE,21);
//    B2:=REF(EMA(CLOSE,8),1)<REF(EMA(CLOSE,21),1);
//    A1:=OPEN>CLOSE;
//    B1:=CLOSE>=OPEN;

//    STICKLINE(A,HIGH,LOW,1,0),COLORRED;
//    STICKLINE(B,HIGH,LOW,1,0),COLOR2DC8FF;
//    STICKLINE(B1,OPEN,CLOSE,-1,0),COLORBLACK;
//    STICKLINE(A1,OPEN,CLOSE,-1,0),COLOR2DC8FF;
//    STICKLINE(A,OPEN,CLOSE,-1,2),COLORRED;
//    STICKLINE(B,OPEN,CLOSE,-1,2),COLOR2DC8FF;
//    DRAWTEXT(B2 AND A,HIGH,'B'),COLORRED;
//    DRAWTEXT(B AND A2,LOW,'S'),COLORGREEN;

//    AA:=ABS((2*CLOSE+HIGH+LOW)/4-MA(CLOSE,N))/MA(CLOSE,N);
//    JAX:DMA((2*CLOSE+LOW+HIGH)/4,AA),LINETHICK1,COLORMAGENTA;
//    CC:=(CLOSE/JAX);
//    MA1:=MA(CC*(2*CLOSE+HIGH+LOW)/4,3);
//    MAAA:=((MA1-JAX)/JAX)/3;
//    TMP:=MA1-MAAA*MA1;
//    IF(TMP<=JAX,JAX,DRAWNULL),LINETHICK1,COLORCYAN;

//    BB:=ABS((2*CLOSE+HIGH+LOW)/4-MA(CLOSE,M))/MA(CLOSE,M);
//    JAX2:DMA((2*CLOSE+LOW+HIGH)/4,BB),LINETHICK1,COLORRED;
//    CC2:=(CLOSE/JAX2);
//    MA2:=MA(CC2*(2*CLOSE+HIGH+LOW)/4,3);
//    MAAA2:=((MA2-JAX2)/JAX2)/3;
//    TMP2:=MA2-MAAA2*MA2;
//    IF(TMP2<=JAX2,JAX2,DRAWNULL),LINETHICK1,COLORGREEN;
//
//    HX:=HHV(HIGH,3);
//    LX:=LLV(LOW,3);
//    H1:=IF(HX<REF(HX,1)&&HX<REF(HX,2)&&HX<REF(HX,4)&&LX<REF(LX,1)&&LX<REF(LX,3)&&LX<REF(LX,5)&&OPEN>CLOSE&&(HHV(OPEN,0)-CLOSE)>0,REF(HX,4),0);
//    L1:=IF(LX>REF(LX,1)&&LX>REF(LX,3)&&LX>REF(LX,5)&&HX>REF(HX,1)&&HX>REF(HX,2)&&HX>REF(HX,4)&&OPEN<CLOSE&&(CLOSE-LLV(OPEN,0))>0,REF(LX,4),0);
//    H2:=VALUEWHEN(H1>0,H1);
//    L2:=VALUEWHEN(L1>0,L1);
//    K1:=IF(CLOSE>H2,-3,IF(CLOSE<L2,1,0));
//    K2:=VALUEWHEN(K1<>0,K1);
//    G:=IF(K2=1,H2,L2);
//    G1:=VALUEWHEN(ISLASTBAR,G);
//
//    TMP:=K2;
//    W1:=K2;
//    W2:=OPEN-CLOSE;
//    HT:=IF(OPEN>CLOSE,OPEN,CLOSE);
//    LT:=IF(OPEN<CLOSE,OPEN,CLOSE);
//    压力:IF(K2=1,G,DRAWNULL),COLORWHITE;
//    支撑:IF(K2=-3,G,DRAWNULL),COLORRED;
//    partline(K2=1,G),COLORWHITE;
//    partline(K2=-3,G),COLORRED;


    _result.clear();

    size_t size = _sticks.size();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});

    const int N = 10;
    const int M = 15;

    vector<double> A = __EMA(C,8) > __EMA(C,21);
    vector<double> A2 = __REF(__EMA(C,8),1) > __REF(__EMA(C,21),1);
    vector<double> B = __EMA(C,8) < __EMA(C,21);
    vector<double> B2 = __REF(__EMA(C,8),1) < __REF(__EMA(C,21),1);
    vector<double> A1 = O > C;
    vector<double> B1 = C >= O;

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORRED;
        D1->_drawPositon1 = A;
        D1->_drawPositon2 = H;
        D1->_drawPositon3 = L;
        D1->_para1 = 1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLOR09;
        D1->_drawPositon1 = B;
        D1->_drawPositon2 = H;
        D1->_drawPositon3 = L;
        D1->_para1 = 1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = B1;
        D1->_drawPositon2 = O;
        D1->_drawPositon3 = C;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLOR09;
        D1->_drawPositon1 = A1;
        D1->_drawPositon2 = O;
        D1->_drawPositon3 = C;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLORRED;
        D1->_drawPositon1 = A;
        D1->_drawPositon2 = O;
        D1->_drawPositon3 = C;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = STICKLINE;
        D1->_color = COLOR09;
        D1->_drawPositon1 = B;
        D1->_drawPositon2 = O;
        D1->_drawPositon3 = C;
        D1->_para1 = -1;
        D1->_para2 = 0;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = B2 && A;
        D1->_drawPositon2 = H;
        D1->_text = "B";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = B && A2;
        D1->_drawPositon2 = L;
        D1->_text = "S";
        _result.push_back(FormulaResult(D1));
    }

    vector<double> AA = __ABS((C*2+H+L)/4-__MA(C,N))/__MA(C,N);
    vector<double> JAX = __DMA((C*2+L+H)/4,AA);

    {
        shared_ptr<FormulaLine> Energy = make_shared<FormulaLine>();;
        Energy->_name = "JAX";
        Energy->_data = JAX;
        Energy->_color = COLORMAGENTA;
        _result.push_back(FormulaResult(Energy));
    }

    vector<double> CC = (C/JAX);
    vector<double> MA1 = __MA(CC*(C*2+H+L)/4,3);
    vector<double> MAAA = ((MA1-JAX)/JAX)/3;
    vector<double> TMP = MA1-MAAA*MA1;

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = COLORCYAN;
        D1->_drawPositon1 = TMP<=JAX;
        D1->_drawPositon2 = JAX;
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    vector<double> BB = __ABS((C*2+H+L)/4-__MA(C,M))/__MA(C,M);
    vector<double> JAX2 = __DMA((C*2+L+H)/4,BB);

    {
        shared_ptr<FormulaLine> Energy = make_shared<FormulaLine>();;
        Energy->_name = "JAX2";
        Energy->_data = JAX2;
        Energy->_color = COLORRED;
        _result.push_back(FormulaResult(Energy));
    }

    vector<double> CC2 = (C/JAX2);
    vector<double> MA2 = __MA(CC2*(C*2+H+L)/4,3);
    vector<double> MAAA2 = ((MA2-JAX2)/JAX2)/3;
    vector<double> TMP2 = MA2-MAAA2*MA2;

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = PARTLINE;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = TMP2<=JAX2;
        D1->_drawPositon2 = JAX2;
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    vector<double> HX = __HHV(H,3);
    vector<double> LX = __LLV(L,3);

    vector<double> H1 = __IF(HX<__REF(HX,1)&&HX<__REF(HX,2)&&HX<__REF(HX,4)&&LX<__REF(LX,1)&&LX<__REF(LX,3)&&LX<__REF(LX,5)&&O>C&&(__HHV(O,0)-C)>0,__REF(HX,4),0);
    vector<double> L1 = __IF(LX>__REF(LX,1)&&LX>__REF(LX,3)&&LX>__REF(LX,5)&&HX>__REF(HX,1)&&HX>__REF(HX,2)&&HX>__REF(HX,4)&&O<C&&(C-__LLV(O,0))>0,__REF(LX,4),0);
    vector<double> H2 = __VALUEWHEN(H1>0,H1);
    vector<double> L2 = __VALUEWHEN(L1>0,L1);
    vector<double> K1 = __IF(C>H2,-3,__IF(C<L2,1,0));
    vector<double> K2 = __VALUEWHEN(K1!=0,K1);
    vector<double> G = __IF(K2==1,H2,L2);
    vector<double> W1 = K2;
    vector<double> W2 = O-C;
    vector<double> HT = __IF(O>C,O,C);
    vector<double> LT = __IF(O<C,O,C);

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_text = "压力";
        D1->_type  = PARTLINE;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = K2==1;
        D1->_drawPositon2 = G;
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_text = "支撑";
        D1->_type  = PARTLINE;
        D1->_color = COLORRED;
        D1->_drawPositon1 = K2==-3;
        D1->_drawPositon2 = G;
        D1->_para1 = 1;
        _result.push_back(FormulaResult(D1));
    }


    return _result;
}

const FormulaResults& QSDH::run() {
/*
//    趋势导航（楚河汉界）（主）
//
//    VAR1:=REF(CLOSE,1);
//    VAR2:=IF(VAR1>HIGH,VAR1,0);
//    VAR3:=IF(HIGH>=VAR1 AND VAR1>LOW,HIGH,0);
//    VAR4:=IF(VAR1<=LOW,HIGH,0);
//    VAR5:=VAR2+VAR3+VAR4;
//    VAR6:=IF(VAR1>HIGH,LOW,0);
//    VAR7:=IF(HIGH>=VAR1 AND VAR1>LOW,LOW,0);
//    VAR8:=IF(VAR1<=LOW,VAR1,0);
//    VAR9:=VAR6+VAR7+VAR8;
//    VAR10:=SMA(VAR5-VAR9,40,1);
//    VAR11:=EMA(CLOSE,40)+3.5*VAR10;
//    VAR12:=EMA(CLOSE,40)-3.5*VAR10;
//    VAR13:=(VAR11+VAR11+VAR11+VAR12)/4;
//    VAR14:=(VAR11+VAR12+VAR12+VAR12)/4;
//    VAR15:=EMA(CLOSE,32);
//    VAR16:=EMA(CLOSE,80);
//    FILLRGN(VAR15>=VAR16,EMA(VAR11,4),EMA(VAR12,4)), COLOR9966CC;
//    FILLRGN(VAR15<VAR16,EMA(VAR11,4),EMA(VAR12,4)), COLORCYAN;
//    FILLRGN(EMA(CLOSE,8)>=EMA(CLOSE,20),EMA(VAR13,4),EMA(VAR14,4)), COLORFF99CC;
//    FILLRGN(EMA(CLOSE,8)<EMA(CLOSE,20),EMA(VAR13,4),EMA(VAR14,4)), COLORFFFF99;
//    VAR17:=OPEN;
//    VAR18:=HIGH;
//    VAR19:=LOW;
//    VAR20:=CLOSE;

//    VAR20[1]:=(2*VAR20[1]+VAR18[1]+VAR19[1])/4;
//    I:=2;
//    WHILE I<=DATACOUNT DO
//            BEGIN
//    BEGIN
//            VAR17[I]:=(VAR17[I-1]+VAR20[I-1])/2;
//    VAR18[I]:=IF(VAR17[I]>VAR18[I],VAR17[I],VAR18[I]);
//    VAR19[I]:=IF(VAR17[I]<VAR19[I],VAR17[I],VAR19[I]);
//    VAR20[I]:=(2*VAR20[I]+VAR18[I]+VAR19[I])/4;
//    END;
//    I:=I+1;
//    END;


//    KK:=IF(VAR20>=VAR17 AND (VAR20>=REF(VAR20,1) OR REF(VAR20,1)>=REF(VAR17,1)),1,IF(VAR20<VAR17 AND (VAR20<REF(VAR17,1) OR REF(VAR20,1)<REF(VAR17,1)),-1,0));
//    明日转折:=ROUND((VAR17+VAR20)/2), LINETHICK0, SHIFT1, COLORYELLOW;
//    今日转折:=ROUND(IF(KK=1,MIN(VAR20,VAR17),IF(KK=-1,MAX(VAR20,VAR17),IF(REF(KK,1)=1,MIN(VAR20,VAR17),IF(REF(KK,1)=-1,MAX(VAR20,VAR17),(VAR20+VAR17)/2)))));
//    DRAWNUMBER(ISLASTBAR,明日转折,ROUND(明日转折),2), SHIFT3;

//    STICKLINE(VAR20>VAR17,VAR18,VAR19,0.4,0), COLORRED;
//    STICKLINE(VAR17>VAR20,VAR18,VAR19,0.4,0), COLORBLUE;
//    STICKLINE(KK=1 AND VAR20>=VAR17,VAR17,VAR20,8,0), COLORRED;
//    STICKLINE(KK=1 AND VAR20<VAR17,VAR17,VAR20,8,0), COLORRED;
//    STICKLINE(KK=-1 AND VAR20>=VAR17,VAR17,VAR20,8,0), COLORBLUE;
//    STICKLINE(KK=-1 AND VAR20<VAR17,VAR17,VAR20,8,0), COLORBLUE;
//    STICKLINE(KK=0 AND VAR20>=VAR17,VAR17,VAR20,8,0), COLORRED;
//    STICKLINE(KK=0 AND VAR20<VAR17,VAR17,VAR20,8,0), COLORRED;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,10),1),EMA(VAR12,4),EMA(VAR12,4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,9),1),REF(EMA(VAR12,4),1),REF(EMA(VAR12,4),1),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,8),1),REF(EMA(VAR12,4),2),REF(EMA(VAR12,4),2),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,7),1),REF(EMA(VAR12,4),3),REF(EMA(VAR12,4),3),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,6),1),REF(EMA(VAR12,4),4),REF(EMA(VAR12,4),4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,5),1),REF(EMA(VAR12,4),5),REF(EMA(VAR12,4),5),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,4),1),REF(EMA(VAR12,4),6),REF(EMA(VAR12,4),6),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,3),1),REF(EMA(VAR12,4),7),REF(EMA(VAR12,4),7),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,2),1),REF(EMA(VAR12,4),8),REF(EMA(VAR12,4),8),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR12,4),9),REF(EMA(VAR12,4),9),10,0), LINETHICK3, COLORBROWN;
//    DRAWNUMBER(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR12,4),9),REF(EMA(VAR12,4),9),1), SHIFT1;

//    STICKLINE(CROSS(BACKSET(ISLASTBAR,10),1),EMA(VAR11,4),EMA(VAR11,4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,9),1),REF(EMA(VAR11,4),1),REF(EMA(VAR11,4),1),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,8),1),REF(EMA(VAR11,4),2),REF(EMA(VAR11,4),2),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,7),1),REF(EMA(VAR11,4),3),REF(EMA(VAR11,4),3),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,6),1),REF(EMA(VAR11,4),4),REF(EMA(VAR11,4),4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,5),1),REF(EMA(VAR11,4),5),REF(EMA(VAR11,4),5),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,4),1),REF(EMA(VAR11,4),6),REF(EMA(VAR11,4),6),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,3),1),REF(EMA(VAR11,4),7),REF(EMA(VAR11,4),7),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,2),1),REF(EMA(VAR11,4),8),REF(EMA(VAR11,4),8),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR11,4),9),REF(EMA(VAR11,4),9),10,0), LINETHICK3, COLORBROWN;
//    DRAWNUMBER(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR11,4),9),REF(EMA(VAR11,4),9),1), SHIFT1;

//    STICKLINE(CROSS(BACKSET(ISLASTBAR,10),1),EMA(VAR13,4),EMA(VAR13,4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,9),1),REF(EMA(VAR13,4),1),REF(EMA(VAR13,4),1),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,8),1),REF(EMA(VAR13,4),2),REF(EMA(VAR13,4),2),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,7),1),REF(EMA(VAR13,4),3),REF(EMA(VAR13,4),3),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,6),1),REF(EMA(VAR13,4),4),REF(EMA(VAR13,4),4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,5),1),REF(EMA(VAR13,4),5),REF(EMA(VAR13,4),5),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,4),1),REF(EMA(VAR13,4),6),REF(EMA(VAR13,4),6),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,3),1),REF(EMA(VAR13,4),7),REF(EMA(VAR13,4),7),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,2),1),REF(EMA(VAR13,4),8),REF(EMA(VAR13,4),8),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR13,4),9),REF(EMA(VAR13,4),9),10,0), LINETHICK3, COLORBROWN;
//    DRAWNUMBER(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR13,4),9),REF(EMA(VAR13,4),9),1), SHIFT1;

//    STICKLINE(CROSS(BACKSET(ISLASTBAR,10),1),EMA(VAR14,4),EMA(VAR14,4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,9),1),REF(EMA(VAR14,4),1),REF(EMA(VAR14,4),1),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,8),1),REF(EMA(VAR14,4),2),REF(EMA(VAR14,4),2),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,7),1),REF(EMA(VAR14,4),3),REF(EMA(VAR14,4),3),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,6),1),REF(EMA(VAR14,4),4),REF(EMA(VAR14,4),4),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,5),1),REF(EMA(VAR14,4),5),REF(EMA(VAR14,4),5),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,4),1),REF(EMA(VAR14,4),6),REF(EMA(VAR14,4),6),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,3),1),REF(EMA(VAR14,4),7),REF(EMA(VAR14,4),7),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,2),1),REF(EMA(VAR14,4),8),REF(EMA(VAR14,4),8),10,0), LINETHICK3, COLORBROWN;
//    STICKLINE(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR14,4),9),REF(EMA(VAR14,4),9),10,0), LINETHICK3, COLORBROWN;
//    DRAWNUMBER(CROSS(BACKSET(ISLASTBAR,1),1),REF(EMA(VAR14,4),9),REF(EMA(VAR14,4),9),1), SHIFT1;

//    VAR21:=(REF(EMA(VAR13,4),9)+REF(EMA(VAR14,4),9))/2;
//    STICKLINE(ISLASTBAR,VAR21,VAR21,12,0);
//    DRAWNUMBER(CROSS(BACKSET(ISLASTBAR,1),1),VAR21,VAR21,1), SHIFT1;
//    西楚霸王:=EMA((351*(EMA(CLOSE,24)-EMA(CLOSE,52))-297*EMA(CLOSE,24)+325*EMA(CLOSE,52))/28,2);
//    PARTLINE(西楚霸王>=REF(西楚霸王,1),西楚霸王), LINETHICK3, COLORRED;
//    PARTLINE(西楚霸王<REF(西楚霸王,1),西楚霸王), LINETHICK3, COLORGREEN;
*/

    _result.clear();

    const int color1 = COLORRED;
    const int color2 = COLORBLUE;

    size_t size = _sticks.size();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});

    vector<double> VAR1 = __REF(C,1);
    vector<double> VAR2 = __IF(VAR1>H,VAR1,0);
    vector<double> VAR3 = __IF(H>=VAR1 && VAR1>L,H,0);
    vector<double> VAR4 = __IF(VAR1<=L,H,0);
    vector<double> VAR5 = VAR2+VAR3+VAR4;
    vector<double> VAR6 = __IF(VAR1>H,L,0);
    vector<double> VAR7 = __IF(H>=VAR1 && VAR1>L,L,0);
    vector<double> VAR8 = __IF(VAR1<=L,VAR1,0);
    vector<double> VAR9 = VAR6+VAR7+VAR8;
    vector<double> VAR10 = __SMA(VAR5-VAR9,40,1);
    vector<double> VAR11 = __EMA(C,40)+VAR10*3.5;
    vector<double> VAR12 = __EMA(C,40)-VAR10*3.5;
    vector<double> VAR13 = (VAR11+VAR11+VAR11+VAR12)/4;
    vector<double> VAR14 = (VAR11+VAR12+VAR12+VAR12)/4;
    vector<double> VAR15 = __EMA(C,32);
    vector<double> VAR16 = __EMA(C,80);


    _result.push_back(addFormulaDraw(FILLRGN,VAR15>=VAR16,__EMA(VAR11,4),__EMA(VAR12,4), 0xCC6699));
    _result.push_back(addFormulaDraw(FILLRGN,VAR15<VAR16,__EMA(VAR11,4),__EMA(VAR12,4), COLORCYAN));
    _result.push_back(addFormulaDraw(FILLRGN,__EMA(C,8)>=__EMA(C,20),__EMA(VAR13,4),__EMA(VAR14,4), 0xCC99FF));
    _result.push_back(addFormulaDraw(FILLRGN,__EMA(C,8)<__EMA(C,20),__EMA(VAR13,4),__EMA(VAR14,4), 0x99FFFF));

    vector<double> VAR17 = O;
    vector<double> VAR18 = H;
    vector<double> VAR19 = L;
    vector<double> VAR20 = C;


    if(VAR20.size()>0 && VAR18.size()>0 && VAR19.size()>0) {
        VAR20[0] = (2 * VAR20.at(0) + VAR18.at(0) + VAR19.at(0)) /4;
    }
    else {
        _result.clear();
        return _result;
    }

    for (int i = 1; i < VAR20.size(); ++i) {
        VAR17[i] = (VAR17[i-1]+VAR20[i-1])/2;
        VAR18[i] = VAR17[i]>VAR18[i] ? VAR17[i]:VAR18[i];
        VAR19[i] = VAR17[i]<VAR19[i] ? VAR17[i]:VAR19[i];
        VAR20[i] = (2*VAR20[i]+VAR18[i]+VAR19[i])/4;
    }


    vector<double> KK = __IF(VAR20>=VAR17 && (VAR20>=__REF(VAR20,1) || __REF(VAR20,1)>=__REF(VAR17,1)),1,__IF(VAR20<VAR17 && (VAR20<__REF(VAR17,1) || __REF(VAR20,1)<__REF(VAR17,1)),-1,0));

//    {
//        shared_ptr<FormulaLine> FL = make_shared<FormulaLine>();;
//        FL->_name = "明日转折";
//        FL->_data = __ROUND((VAR17+VAR20)/2);
//        FL->_nodraw = true;
//        FL->_color = COLORYELLOW;
//        //SHIFT1
//        _result.push_back(FormulaResult(FL));
//    }
//    {
//        shared_ptr<FormulaLine> FL = make_shared<FormulaLine>();;
//        FL->_name = "今日转折";
//        FL->_data = __ROUND(__IF(KK==1,__MIN(VAR20,VAR17),__IF(KK==-1,__MAX(VAR20,VAR17),__IF(__REF(KK,1)==1,__MIN(VAR20,VAR17),__IF(__REF(KK,1)==-1,__MAX(VAR20,VAR17),(VAR20+VAR17)/2)))));
//        FL->_nodraw = true;
//        FL->_color = COLORYELLOW;
//        _result.push_back(FormulaResult(FL));
//    }
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWNUMBER;
//        D1->_color = COLORRED;
//        D1->_drawPositon1 = __ISLASTBAR(C);
//        D1->_drawPositon2 = __ROUND((VAR17+VAR20)/2);
//        D1->_drawPositon3 = __ROUND(__ROUND((VAR17+VAR20)/2));
//        D1->_para1 = 2;
//        _result.push_back(FormulaResult(D1));
//    }


    _result.push_back(addFormulaDraw(STICKLINE,VAR20>VAR17,VAR18,VAR19,1,0, color1));
    _result.push_back(addFormulaDraw(STICKLINE,VAR17>VAR20,VAR18,VAR19,1,0, color2));
    _result.push_back(addFormulaDraw(STICKLINE,KK==1 && VAR20>=VAR17,VAR17,VAR20,-1,0, color1));
    _result.push_back(addFormulaDraw(STICKLINE,KK==1 && VAR20<VAR17,VAR17,VAR20,-1,0, color1));
    _result.push_back(addFormulaDraw(STICKLINE,KK==-1 && VAR20>=VAR17,VAR17,VAR20,-1,0, color2));
    _result.push_back(addFormulaDraw(STICKLINE,KK==-1 && VAR20<VAR17,VAR17,VAR20,-1,0, color2));
    _result.push_back(addFormulaDraw(STICKLINE,KK==0 && VAR20>=VAR17,VAR17,VAR20,-1,0, color1));
    _result.push_back(addFormulaDraw(STICKLINE,KK==0 && VAR20<VAR17,VAR17,VAR20,-1,0, color1));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),10),1),__EMA(VAR12,4),__EMA(VAR12,4),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),9),1),__REF(__EMA(VAR12,4),1),__REF(__EMA(VAR12,4),1),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),8),1),__REF(__EMA(VAR12,4),2),__REF(__EMA(VAR12,4),2),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),7),1),__REF(__EMA(VAR12,4),3),__REF(__EMA(VAR12,4),3),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),6),1),__REF(__EMA(VAR12,4),4),__REF(__EMA(VAR12,4),4),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),5),1),__REF(__EMA(VAR12,4),5),__REF(__EMA(VAR12,4),5),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),4),1),__REF(__EMA(VAR12,4),6),__REF(__EMA(VAR12,4),6),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),3),1),__REF(__EMA(VAR12,4),7),__REF(__EMA(VAR12,4),7),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),2),1),__REF(__EMA(VAR12,4),8),__REF(__EMA(VAR12,4),8),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR12,4),9),__REF(__EMA(VAR12,4),9),-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(DRAWNUMBER,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR12,4),9),__REF(__EMA(VAR12,4),9),2, 0x555555));

    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),10),1),__EMA(VAR11,4),__EMA(VAR11,4),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),9),1),__REF(__EMA(VAR11,4),1),__REF(__EMA(VAR11,4),1),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),8),1),__REF(__EMA(VAR11,4),2),__REF(__EMA(VAR11,4),2),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),7),1),__REF(__EMA(VAR11,4),3),__REF(__EMA(VAR11,4),3),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),6),1),__REF(__EMA(VAR11,4),4),__REF(__EMA(VAR11,4),4),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),5),1),__REF(__EMA(VAR11,4),5),__REF(__EMA(VAR11,4),5),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),4),1),__REF(__EMA(VAR11,4),6),__REF(__EMA(VAR11,4),6),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),3),1),__REF(__EMA(VAR11,4),7),__REF(__EMA(VAR11,4),7),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),2),1),__REF(__EMA(VAR11,4),8),__REF(__EMA(VAR11,4),8),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR11,4),9),__REF(__EMA(VAR11,4),9),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(DRAWNUMBER,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR11,4),9),__REF(__EMA(VAR11,4),9),2, 0x555555));

    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),10),1),__EMA(VAR13,4),__EMA(VAR13,4),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),9),1),__REF(__EMA(VAR13,4),1),__REF(__EMA(VAR13,4),1),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),8),1),__REF(__EMA(VAR13,4),2),__REF(__EMA(VAR13,4),2),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),7),1),__REF(__EMA(VAR13,4),3),__REF(__EMA(VAR13,4),3),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),6),1),__REF(__EMA(VAR13,4),4),__REF(__EMA(VAR13,4),4),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),5),1),__REF(__EMA(VAR13,4),5),__REF(__EMA(VAR13,4),5),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),4),1),__REF(__EMA(VAR13,4),6),__REF(__EMA(VAR13,4),6),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),3),1),__REF(__EMA(VAR13,4),7),__REF(__EMA(VAR13,4),7),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),2),1),__REF(__EMA(VAR13,4),8),__REF(__EMA(VAR13,4),8),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR13,4),9),__REF(__EMA(VAR13,4),9),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(DRAWNUMBER,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR13,4),9),__REF(__EMA(VAR13,4),9),2, 0x555555));

    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),10),1),__EMA(VAR14,4),__EMA(VAR14,4),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),9),1),__REF(__EMA(VAR14,4),1),__REF(__EMA(VAR14,4),1),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),8),1),__REF(__EMA(VAR14,4),2),__REF(__EMA(VAR14,4),2),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),7),1),__REF(__EMA(VAR14,4),3),__REF(__EMA(VAR14,4),3),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),6),1),__REF(__EMA(VAR14,4),4),__REF(__EMA(VAR14,4),4),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),5),1),__REF(__EMA(VAR14,4),5),__REF(__EMA(VAR14,4),5),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),4),1),__REF(__EMA(VAR14,4),6),__REF(__EMA(VAR14,4),6),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),3),1),__REF(__EMA(VAR14,4),7),__REF(__EMA(VAR14,4),7),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),2),1),__REF(__EMA(VAR14,4),8),__REF(__EMA(VAR14,4),8),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(STICKLINE,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR14,4),9),__REF(__EMA(VAR14,4),9),10,0, COLORBROWN));
    _result.push_back(addFormulaDraw(DRAWNUMBER,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),__REF(__EMA(VAR14,4),9),__REF(__EMA(VAR14,4),9),2, 0x555555));

    vector<double> VAR21 = (__REF(__EMA(VAR13,4),9)+__REF(__EMA(VAR14,4),9))/2;
    _result.push_back(addFormulaDraw(STICKLINE,__ISLASTBAR(C),VAR21,VAR21,-1,0, COLORBROWN));
    _result.push_back(addFormulaDraw(DRAWNUMBER,__CROSS(__BACKSET(__ISLASTBAR(C),1),1),VAR21,VAR21,2,1, COLORRED));
    vector<double> XCBW = __EMA(((__EMA(C,24)-__EMA(C,52))*351-__EMA(C,24)*297+__EMA(C,52)*325)/28,2);
    _result.push_back(addFormulaDraw(PARTLINE,XCBW>=__REF(XCBW,1),XCBW, 3, COLORRED));
    _result.push_back(addFormulaDraw(PARTLINE,XCBW<__REF(XCBW,1),XCBW, 3, COLORGREEN));

    return _result;
}

const FormulaResults& DKZJ::run() {

    _result.clear();

    double invalid = -1.797693E+308;

    vector<double> vecLargeIn(_sticksFundFlow.size(), invalid);
    vector<double> vecLargeOut(_sticksFundFlow.size(), invalid);
    vector<double> vecSuperIn(_sticksFundFlow.size(), invalid);
    vector<double> vecSuperOut(_sticksFundFlow.size(), invalid);


/*
    for (int i=0; i<_sticksFundFlow.size(); i++) {
        FundFlowStick & ff = _sticksFundFlow.at(i);
        double value = 0;
        if (ff.littleIn != invalid && ff.littleOut != invalid){
            value += (ff.littleIn-ff.littleOut);
        }
        if (ff.mediumIn != invalid && ff.mediumOut != invalid){
            value += (ff.mediumIn-ff.mediumOut);
        }
        if (ff.largeIn != invalid && ff.largeOut != invalid){
            value += (ff.largeIn-ff.largeOut);
        }
        if (ff.hugeIn != invalid && ff.hugeOut != invalid){
            value += (ff.hugeIn-ff.hugeOut);
        }

        vec[i] = value;
    }

    {
        shared_ptr<FormulaLine> D = make_shared<FormulaLine>();
        D->_name = "DKZJ";
        D->_data = vec;
        D->_type = AREA;
        _result.push_back(FormulaResult(D));
    }
*/


    for (int i=0; i<_sticksFundFlow.size(); i++) {

        FundFlowStick & ff = _sticksFundFlow.at(i);

        vecLargeIn[i] = ff.largeIn;
        vecLargeOut[i] = ff.largeOut;
        vecSuperIn[i] = ff.superIn;
        vecSuperOut[i] = ff.superOut;

    }


    const int color1 = 0xFFEB3323;
    const int color2 = 0xFF71FA4C;
    const int color3 = 0xFF580D18;
    const int color4 = 0xFF265E22;


    _result.push_back(
        addFormulaDraw(
            COLORSTICKS,
            "资金净值",
            vecLargeIn,
            vecLargeOut,
            vecSuperIn,
            vecSuperOut,
            -1,
            color1,
            color2,
            color3,
            color4));

    return _result;
}

const FormulaResults& ZLZJ::run() {

    _result.clear();

    double invalid = -1.797693E+308;

    vector<double> vec(_sticksFundFlow.size(), invalid);

/*
    for (int i=0; i<_sticksFundFlow.size(); i++) {
        FundFlowStick & ff = _sticksFundFlow.at(i);
        double value = 0;
        if (ff.largeIn != invalid && ff.largeOut != invalid){
            value += (ff.largeIn-ff.largeOut);
        }
        if (ff.hugeIn != invalid && ff.hugeOut != invalid){
            value += (ff.hugeIn-ff.hugeOut);
        }

        vec[i] = value;
    }


    {
        shared_ptr<FormulaLine> D = make_shared<FormulaLine>();
        D->_name = "ZLZJ";
        D->_data = vec;
        D->_type = AREA;
        _result.push_back(FormulaResult(D));
    }
*/

    for (int i=0; i<_sticksFundFlow.size(); i++) {
        FundFlowStick & ff = _sticksFundFlow.at(i);
        double value = 0;

        if (ff.hugeIn != invalid && ff.hugeOut != invalid){
            value = (ff.hugeIn-ff.hugeOut);
        }

        vec[i] = value;
    }

    shared_ptr<FormulaLine> ff = make_shared<FormulaLine>();
    ff->_name = "资金净值";
    ff->_data = vec;
    ff->_type = COLORSTICK;
    ff->_thick = -1;
    _result.push_back(FormulaResult(ff));



    return _result;
}

const FormulaResults& JZZF::run() {

//    九转战法（主）
/*
    A1:=C>REF(C,4);
    NT:=BARSLAST(A1);
    TJ11:=NT=9;
    TJ13:=ISLASTBAR AND NT>4 AND NT<10;
    AY:=(BACKSET(TJ11>0,9) OR BACKSET(TJ13>0,NT))*NT;
    DRAWTEXT(AY=5,L*0.98,'5'),COLORYELLOW;
    DRAWTEXT(AY=6,L*0.98,'4'),COLORYELLOW;
    DRAWTEXT(AY=7,L*0.98,'3'),COLORYELLOW;
    DRAWTEXT(AY=8,L*0.98,'2'),COLORYELLOW;
    DRAWTEXT(NT=9,L*0.98,'1'),COLORYELLOW;
    B1:=C<REF(C,4);
    NT0:=BARSLAST(B1);
    TJ21:=NT0=9;
    TJ23:=ISLASTBAR AND NT>4 AND NT<10;
    AY1:=(BACKSET(TJ21>0,9) OR BACKSET(TJ23>0,NT0))*NT0;
    DRAWTEXT(AY1=5,H*1.02,'5'),COLORGREEN;
    DRAWTEXT(AY1=6,H*1.02,'4'),COLORGREEN;
    DRAWTEXT(AY1=7,H*1.02,'3'),COLORGREEN;
    DRAWTEXT(AY1=8,H*1.02,'2'),COLORGREEN;
    DRAWTEXT(NT0=9,H*1.02,'1'),COLORGREEN;
*/

    _result.clear();

    size_t size = _sticks.size();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});

    vector<double> A1 = C > __REF(C,4);
    vector<double> NT = __BARSLAST1(A1);
    vector<double> TJ11 = NT==9;
    vector<double> TJ13 = __ISLASTBAR(C) && NT>4 && NT<10;
    vector<double> AY = (__BACKSET(TJ11 > 0,9) || __BACKSET(TJ13>0,NT))*NT;

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORYELLOW;
        D1->_drawPositon1 = AY==5;
        D1->_drawPositon2 = L*0.98;
        D1->_text = "5";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORYELLOW;
        D1->_drawPositon1 = AY==6;
        D1->_drawPositon2 = L*0.98;
        D1->_text = "4";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORYELLOW;
        D1->_drawPositon1 = AY==7;
        D1->_drawPositon2 = L*0.98;
        D1->_text = "3";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORYELLOW;
        D1->_drawPositon1 = AY==8;
        D1->_drawPositon2 = L*0.98;
        D1->_text = "2";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORYELLOW;
        D1->_drawPositon1 = NT==9;
        D1->_drawPositon2 = L*0.98;
        D1->_text = "1";
        _result.push_back(FormulaResult(D1));
    }

    vector<double> B1 = C < __REF(C,4);
    vector<double> NT0 = __BARSLAST1(B1);
    vector<double> TJ21 = NT0==9;
    vector<double> TJ23 = __ISLASTBAR(C) && NT>4 && NT<10;
    vector<double> AY1 = (__BACKSET(TJ21>0,9) || __BACKSET(TJ23>0,NT0))*NT0;

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = AY1==5;
        D1->_drawPositon2 = H*1.02;
        D1->_text = "5";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = AY1==6;
        D1->_drawPositon2 = H*1.02;
        D1->_text = "4";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = AY1==7;
        D1->_drawPositon2 = H*1.02;
        D1->_text = "3";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = AY1==8;
        D1->_drawPositon2 = H*1.02;
        D1->_text = "2";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = NT0==9;
        D1->_drawPositon2 = H*1.02;
        D1->_text = "1";
        _result.push_back(FormulaResult(D1));
    }


    return _result;
}

//const FormulaResults& JZZF::run() {
//
////    九转战法（主）旧
///*
//    A1:=C>REF(C,4);
//    NT:=BARSLAST(A1);
//    TJ11:=NT=9;
//    TJ13:=ISLASTBAR AND BETWEEN(NT,5,8);
//    AY:=(BACKSET(TJ11>0,9) OR BACKSET(TJ13>0,NT))*NT;
//    DRAWTEXT(AY=1,H*1.02,'1'),colorff00ff;
//    DRAWTEXT(AY=2,H*1.02,'2'),colorff00ff;
//    DRAWTEXT(AY=3,H*1.02,'3'),colorff00ff;
//    DRAWTEXT(AY=4,H*1.02,'4'),colorff00ff;
//    DRAWTEXT(AY=5,H*1.02,'5'),colorff00ff;
//    DRAWTEXT(AY=6,H*1.02,'6'),colorff00ff;
//    DRAWTEXT(AY=7,H*1.02,'7'),colorff00ff;
//    DRAWTEXT(AY=8,H*1.02,'8'),colorff00ff;
//    DRAWTEXT(NT=9,H*1.02,'9'),COLORGREEN;
//    B1:=C<REF(C,4);
//    NT0:=BARSLAST(B1);
//    TJ21:=NT0=9;
//    TJ23:=ISLASTBAR AND BETWEEN(NT0,5,8);
//    AY1:=(BACKSET(TJ21>0,9) OR BACKSET(TJ23>0,NT0))*NT0;
//    DRAWTEXT(AY1=1,L*0.98,'1'),COLORGREEN;
//    DRAWTEXT(AY1=2,L*0.98,'2'),COLORGREEN;
//    DRAWTEXT(AY1=3,L*0.98,'3'),COLORGREEN;
//    DRAWTEXT(AY1=4,L*0.98,'4'),COLORGREEN;
//    DRAWTEXT(AY1=5,L*0.98,'5'),COLORGREEN;
//    DRAWTEXT(AY1=6,L*0.98,'6'),COLORGREEN;
//    DRAWTEXT(AY1=7,L*0.98,'7'),COLORGREEN;
//    DRAWTEXT(AY1=8,L*0.98,'8'),COLORGREEN;
//    DRAWTEXT(NT0=9,L*0.98,'9'),COLORGREEN;
//*/
//
//    _result.clear();
//
//    size_t size = _sticks.size();
//    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
//    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
//    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
//    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
//    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
//    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});
//
//    vector<double> A1 = C > __REF(C,4);
//    vector<double> NT = __BARSLAST1(A1);
//    vector<double> TJ11 = NT==9;
//    vector<double> TJ13 = __ISLASTBAR(C) && __BETWEEN(NT,5,8);
//    vector<double> AY = (__BACKSET(TJ11 > 0,9) || __BACKSET(TJ13>0,NT))*NT;
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==1;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "1";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==2;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "2";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==3;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "3";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==4;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "4";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==5;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "5";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==6;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "6";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==7;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "7";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFFff00ff;
//        D1->_drawPositon1 = AY==8;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "8";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = NT==9;
//        D1->_drawPositon2 = H*1.02;
//        D1->_text = "9";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    vector<double> B1 = C < __REF(C,4);
//    vector<double> NT0 = __BARSLAST1(B1);
//    vector<double> TJ21 = NT0==9;
//    vector<double> TJ23 = __ISLASTBAR(C) && __BETWEEN(NT0,5,8);
//    vector<double> AY1 = (__BACKSET(TJ21>0,9) || __BACKSET(TJ23>0,NT0))*NT0;
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==1;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "1";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==2;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "2";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==3;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "3";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==4;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "4";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==5;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "5";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==6;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "6";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==7;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "7";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = AY1==8;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "8";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = COLORGREEN;
//        D1->_drawPositon1 = NT0==9;
//        D1->_drawPositon2 = L*0.98;
//        D1->_text = "9";
//        _result.push_back(FormulaResult(D1));
//    }
//
//
//    return _result;
//}

//const FormulaResults& JZZF::run() {
//
////    九转战法（主）旧
//
////    A1:=C>REF(C,4);
////    NT:=BARSLAST(A1);
////    TJ11:=NT=9;
////    TJ13:=ISLASTBAR AND BETWEEN(NT,5,8);
////    AY:=(BACKSET(TJ11>0,9) OR BACKSET(TJ13>0,NT))*NT;
////    DRAWTEXT(AY>0,H*1.02,NUMTOSTR(AY,0)),colorff00ff;
////    DRAWTEXT(NT=9,H*1.02,'9'),COLORGREEN;
////    B1:=C<REF(C,4);
////    NT0:=BARSLAST(B1);
////    TJ21:=NT0=9;
////    TJ23:=ISLASTBAR AND BETWEEN(NT0,5,8);
////    AY1:=(BACKSET(TJ21>0,9) OR BACKSET(TJ23>0,NT0))*NT0;
////    DRAWTEXT(AY1>0,L*0.98,NUMTOSTR(AY1,0)),colorff00ff;
////    DRAWTEXT(NT0=9,L*0.98,'9'),COLORGREEN;
//
//
//    _result.clear();
//
//    size_t size = _sticks.size();
//    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
//    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
//    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
//    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
//    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
//    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});
//
//    vector<double> A1 = C>__REF(C,4);
//    vector<double> NT = __BARSLAST1(A1);
//    vector<double> TJ11 = (NT==9);
//    vector<double> TJ13 = __ISLASTBAR(C) && __BETWEEN(NT,5,8);
//    vector<double> AY = (__BACKSET(TJ11>0,9) || __BACKSET(TJ13>0,NT))*NT;
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFF00FF;
//        D1->_drawPositon1 = AY>0;
//        D1->_drawPositon2 = H * 1.02;
//        D1->_text = "0";//VAR2STR(AY,0);
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0x00FF00;
//        D1->_drawPositon1 = (NT==9);
//        D1->_drawPositon2 = H * 1.02;
//        D1->_text = "9";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    vector<double> B1 = C < __REF(C,4);
//    vector<double> NT0 = __BARSLAST1(B1);
//    vector<double> TJ21 = (NT0==9) ;
//    vector<double> TJ23 = __ISLASTBAR(C) && __BETWEEN(NT0,5,8);
//    vector<double> AY1 = (__BACKSET(TJ21>0,9) || __BACKSET(TJ23>0,NT0))*NT0;
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0xFF00FF;
//        D1->_drawPositon1 = AY1>0;
//        D1->_drawPositon2 = L * 0.98;
//        D1->_text = "0";//VAR2STR(AY1,0);
//        _result.push_back(FormulaResult(D1));
//    }
//
//    {
//        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
//        D1->_type  = DRAWTEXT;
//        D1->_color = 0x00FF00;
//        D1->_drawPositon1 = NT0==9;
//        D1->_drawPositon2 = L * 0.98;
//        D1->_text = "9";
//        _result.push_back(FormulaResult(D1));
//    }
//
//    return _result;
//}

const FormulaResults& DKYJ::run() {

//    多空预警（主）
/*
    A1:=C>=REF(C,4);

    A:=C<REF(C,4);

    AA:=C< REF(C,4) and REF(A1,1);

    T:=BARSLAST(AA)NODRAW;

    M:=(T=0 AND REFX(T=1 AND NOT(A),1)) OR (REFX(T=2 AND NOT(A),2)) OR (REFX(T=3 AND NOT(A),3)) OR (REFX(T=4 AND NOT(A),4)) OR (REFX(T=5 AND NOT(A),5))

    OR (REFX(T=6 AND NOT(A),6)) OR (REFX(T=7 AND NOT(A),7)) OR (REFX(T=8 AND NOT(A),8));

    M1:=T=1 AND REFX(T=2 AND NOT(A),1) OR (REFX(T=3 AND NOT(A),2)) OR (REFX(T=4 AND NOT(A),3)) OR (REFX(T=5 AND NOT(A),4)) OR (REFX(T=6 AND NOT(A),5))

    OR (REFX(T=7 AND NOT(A),6)) OR (REFX(T=8 AND NOT(A),7));

    M2:=T=2 AND REFX(T=3 AND NOT(A),1) OR (REFX(T=4 AND NOT(A),2)) OR (REFX(T=5 AND NOT(A),3)) OR (REFX(T=6 AND NOT(A),4)) OR (REFX(T=7 AND NOT(A),5)) OR (REFX(T=8 AND NOT(A),6));

    M3:=T=3 AND REFX(T=4 AND NOT(A),1)OR (REFX(T=5 AND NOT(A),2)) OR (REFX(T=6 AND NOT(A),3)) OR (REFX(T=7 AND NOT(A),4)) OR (REFX(T=8 AND NOT(A),5));

    M4:=T=4 AND REFX(T=5 AND NOT(A),1) OR (REFX(T=6 AND NOT(A),2)) OR (REFX(T=7 AND NOT(A),3)) OR (REFX(T=8 AND NOT(A),4));

    M5:=T=5 AND REFX(T=6 AND NOT(A),1) OR (REFX(T=7 AND NOT(A),2)) OR (REFX(T=8 AND NOT(A),3));

    M6:=T=6 AND REFX(T=7 AND NOT(A),1) OR (REFX(T=8 AND NOT(A),2));

    M7:=T=7 AND REFX(T=8 AND NOT(A),1);

    N:=T=1 AND REF(T=0 AND AA,1) AND A;

    N1:=T=2 AND REF(N,1) AND A;

    N2:=T=3 AND REF(N1,1) AND A;

    N3:=T=4 AND REF(N2,1) AND A;

    N4:=T=5 AND REF(N3,1) AND A;

    N5:=T=6 AND REF(N4,1) AND A;

    N6:=T=7 AND REF(N5,1) AND A;

    N7:=T=8 AND REF(N6,1) AND A;

    DRAWTEXT(T=0,L*0.95,'1')COLORGREEN;

    DRAWTEXT(N,L*0.95,'2')COLORGREEN;

    DRAWTEXT(N1,L*0.95,'3')COLORGREEN;

    DRAWTEXT(N2,L*0.95,'4')COLORGREEN;

    DRAWTEXT(N3,L*0.95,'5')COLORGREEN;

    DRAWTEXT(N4,L*0.95,'6')COLORGREEN;

    DRAWTEXT(N5,L*0.95,'7')COLORGREEN;

    DRAWTEXT(N6,L*0.95,'8')COLORGREEN;

    DRAWTEXT(N7,L*0.95,'9')COLORGREEN;

    DRAWTEXT(M,L*0.95,'1')COLORBLACK;

    DRAWTEXT(M1,L*0.95,'2')COLORBLACK;

    DRAWTEXT(M2,L*0.95,'3')COLORBLACK;

    DRAWTEXT(M3,L*0.95,'4')COLORBLACK;

    DRAWTEXT(M4,L*0.95,'5')COLORBLACK;

    DRAWTEXT(M5,L*0.95,'6')COLORBLACK;

    DRAWTEXT(M6,L*0.95,'7')COLORBLACK;

    DRAWTEXT(M7,L*0.95,'8')COLORBLACK;

    B1:=C<=REF(C,4);

    B:=C>REF(C,4);

    BB:=C>REF(C,4) AND REF(B1,1);

    T1:=BARSLAST(BB)NODRAW;

    M111:=(T1=0 AND REFX(T1=1 AND NOT(B),1)) OR (REFX(T1=2 AND NOT(B),2)) OR (REFX(T1=3 AND NOT(B),3)) OR (REFX(T1=4 AND NOT(B),4)) OR (REFX(T1=5 AND NOT(B),5))

    OR (REFX(T1=6 AND NOT(B),6)) OR (REFX(T1=7 AND NOT(B),7)) OR (REFX(T1=8 AND NOT(B),8));

    M11:=T1=1 AND REFX(T1=2 AND NOT(B),1) OR (REFX(T1=3 AND NOT(B),2)) OR (REFX(T1=4 AND NOT(B),3)) OR (REFX(T1=5 AND NOT(B),4)) OR (REFX(T1=6 AND NOT(B),5))

    OR (REFX(T1=7 AND NOT(B),6)) OR (REFX(T1=8 AND NOT(B),7));

    M22:=T1=2 AND REFX(T1=3 AND NOT(B),1) OR (REFX(T1=4 AND NOT(B),2)) OR (REFX(T1=5 AND NOT(B),3)) OR (REFX(T1=6 AND NOT(B),4)) OR (REFX(T1=7 AND NOT(B),5)) OR (REFX(T1=8 AND NOT(B),6));

    M33:=T1=3 AND REFX(T1=4 AND NOT(B),1)OR (REFX(T1=5 AND NOT(B),2)) OR (REFX(T1=6 AND NOT(B),3)) OR (REFX(T1=7 AND NOT(B),4)) OR (REFX(T1=8 AND NOT(B),5));

    M44:=T1=4 AND REFX(T1=5 AND NOT(B),1) OR (REFX(T1=6 AND NOT(B),2)) OR (REFX(T1=7 AND NOT(B),7)) OR (REFX(T1=8 AND NOT(B),4));

    M55:=T1=5 AND REFX(T1=6 AND NOT(B),1) OR (REFX(T1=7 AND NOT(B),2)) OR (REFX(T1=8 AND NOT(B),3));

    M66:=T1=6 AND REFX(T1=7 AND NOT(B),1) OR (REFX(T1=8 AND NOT(B),2));

    M77:=T1=7 AND REFX(T1=8 AND NOT(B),1);

    N111:=T1=1 AND REF(T1=0 AND BB,1) AND B;

    N11:=T1=2 AND REF(N111,1) AND B;

    N22:=T1=3 AND REF(N11,1) AND B;

    N33:=T1=4 AND REF(N22,1) AND B;

    N44:=T1=5 AND REF(N33,1) AND B;

    N55:=T1=6 AND REF(N44,1) AND B;

    N66:=T1=7 AND REF(N55,1) AND B;

    N77:=T1=8 AND REF(N66,1) AND B;

    DRAWTEXT(T1=0,H*1.05,'1')COLORred;

    DRAWTEXT(N111,H*1.05,'2')COLORred;

    DRAWTEXT(N11,H*1.05,'3')COLORred;

    DRAWTEXT(N22,H*1.05,'4')COLORred;

    DRAWTEXT(N33,H*1.05,'5')COLORred;

    DRAWTEXT(N44,H*1.05,'6')COLORred;

    DRAWTEXT(N55,H*1.05,'7')COLORred;

    DRAWTEXT(N66,H*1.05,'8')COLORred;

    DRAWTEXT(N77,H*1.05,'9')COLORred;


    DRAWTEXT(M111,H*1.05,'1')COLORBLACK;

    DRAWTEXT(M11,H*1.05,'2')COLORBLACK;

    DRAWTEXT(M22,H*1.05,'3')COLORBLACK;

    DRAWTEXT(M33,H*1.05,'4')COLORBLACK;

    DRAWTEXT(M44,H*1.05,'5')COLORBLACK;

    DRAWTEXT(M55,H*1.05,'6')COLORBLACK;

    DRAWTEXT(M66,H*1.05,'7')COLORBLACK;

    DRAWTEXT(M77,H*1.05,'8')COLORBLACK;
*/

    _result.clear();

    size_t size = _sticks.size();
    vector<double> C(_sticks.size()), L(_sticks.size()), H(_sticks.size()), O(size), V(size);
    transform(_sticks.begin(), _sticks.end(), C.begin(), [](auto& stick){ return stick.close;});
    transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto& stick){ return stick.low;});
    transform(_sticks.begin(), _sticks.end(), H.begin(), [](auto& stick){ return stick.high;});
    transform(_sticks.begin(), _sticks.end(), O.begin(), [](auto& stick){ return stick.open;});
    transform(_sticks.begin(), _sticks.end(), V.begin(), [](auto& stick){ return stick.volume;});


    vector<double> A1 = C >= __REF(C,4);

    vector<double> A = C < __REF(C,4);

    vector<double> AA = C < __REF(C,4) and __REF(A1,1);

    vector<double> T = __BARSLAST1(AA);

    vector<double> M = (T==0 && __REFX(T==1 && __NOT(A),1)) || (__REFX(T==2 && __NOT(A),2)) || (__REFX(T==3 && __NOT(A),3)) || (__REFX(T==4 && __NOT(A),4)) || (__REFX(T==5 && __NOT(A),5))

                       || (__REFX(T==6 && __NOT(A),6)) || (__REFX(T==7 && __NOT(A),7)) || (__REFX(T==8 && __NOT(A),8));

    vector<double> M1 = T==1 && __REFX(T==2 && __NOT(A),1) || (__REFX(T==3 && __NOT(A),2)) || (__REFX(T==4 && __NOT(A),3)) || (__REFX(T==5 && __NOT(A),4)) || (__REFX(T==6 && __NOT(A),5))

                        || (__REFX(T==7 && __NOT(A),6)) || (__REFX(T==8 && __NOT(A),7));

    vector<double> M2 = T==2 && __REFX(T==3 && __NOT(A),1) || (__REFX(T==4 && __NOT(A),2)) || (__REFX(T==5 && __NOT(A),3)) || (__REFX(T==6 && __NOT(A),4)) || (__REFX(T==7 && __NOT(A),5)) || (__REFX(T==8 && __NOT(A),6));

    vector<double> M3 = T==3 && __REFX(T==4 && __NOT(A),1) || (__REFX(T==5 && __NOT(A),2)) || (__REFX(T==6 && __NOT(A),3)) || (__REFX(T==7 && __NOT(A),4)) || (__REFX(T==8 && __NOT(A),5));

    vector<double> M4 = T==4 && __REFX(T==5 && __NOT(A),1) || (__REFX(T==6 && __NOT(A),2)) || (__REFX(T==7 && __NOT(A),3)) || (__REFX(T==8 && __NOT(A),4));

    vector<double> M5 = T==5 && __REFX(T==6 && __NOT(A),1) || (__REFX(T==7 && __NOT(A),2)) || (__REFX(T==8 && __NOT(A),3));

    vector<double> M6 = T==6 && __REFX(T==7 && __NOT(A),1) || (__REFX(T==8 && __NOT(A),2));

    vector<double> M7 = T==7 && __REFX(T==8 && __NOT(A),1);

    vector<double> N = T==1 && __REF(T==0 && AA,1) && A;

    vector<double> N1 = T==2 && __REF(N,1) && A;

    vector<double> N2 = T==3 && __REF(N1,1) && A;

    vector<double> N3 = T==4 && __REF(N2,1) && A;

    vector<double> N4 = T==5 && __REF(N3,1) && A;

    vector<double> N5 = T==6 && __REF(N4,1) && A;

    vector<double> N6 = T==7 && __REF(N5,1) && A;

    vector<double> N7 = T==8 && __REF(N6,1) && A;


    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = T==0;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "1";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "2";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N1;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "3";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N2;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "4";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N3;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "5";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N4;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "6";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N5;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "7";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N6;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "8";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORGREEN;
        D1->_drawPositon1 = N7;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "9";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "1";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M1;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "2";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M2;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "3";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M3;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "4";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M4;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "5";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M5;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "6";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M6;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "7";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M7;
        D1->_drawPositon2 = L*0.95;
        D1->_text = "8";
        _result.push_back(FormulaResult(D1));
    }

    vector<double> B1 = C <= __REF(C,4);

    vector<double> B = C > __REF(C,4);

    vector<double> BB = C > __REF(C,4) && __REF(B1,1);

    vector<double> T1 = __BARSLAST1(BB);

    vector<double> M111 = (T1==0 && __REFX(T1==1 && __NOT(B),1)) || (__REFX(T1==2 && __NOT(B),2)) || (__REFX(T1==3 && __NOT(B),3)) || (__REFX(T1==4 && __NOT(B),4)) || (__REFX(T1==5 && __NOT(B),5))

                          || (__REFX(T1==6 && __NOT(B),6)) || (__REFX(T1==7 && __NOT(B),7)) || (__REFX(T1==8 && __NOT(B),8));

    vector<double> M11 = T1==1 && __REFX(T1==2 && __NOT(B),1) || (__REFX(T1==3 && __NOT(B),2)) || (__REFX(T1==4 && __NOT(B),3)) || (__REFX(T1==5 && __NOT(B),4)) || (__REFX(T1==6 && __NOT(B),5))

                         || (__REFX(T1==7 && __NOT(B),6)) || (__REFX(T1==8 && __NOT(B),7));

    vector<double> M22 = T1==2 && __REFX(T1==3 && __NOT(B),1) || (__REFX(T1==4 && __NOT(B),2)) || (__REFX(T1==5 && __NOT(B),3)) || (__REFX(T1==6 && __NOT(B),4)) || (__REFX(T1==7 && __NOT(B),5)) || (__REFX(T1==8 && __NOT(B),6));

    vector<double> M33 = T1==3 && __REFX(T1==4 && __NOT(B),1)|| (__REFX(T1==5 && __NOT(B),2)) || (__REFX(T1==6 && __NOT(B),3)) || (__REFX(T1==7 && __NOT(B),4)) || (__REFX(T1==8 && __NOT(B),5));

    vector<double> M44 = T1==4 && __REFX(T1==5 && __NOT(B),1) || (__REFX(T1==6 && __NOT(B),2)) || (__REFX(T1==7 && __NOT(B),7)) || (__REFX(T1==8 && __NOT(B),4));

    vector<double> M55 = T1==5 && __REFX(T1==6 && __NOT(B),1) || (__REFX(T1==7 && __NOT(B),2)) || (__REFX(T1==8 && __NOT(B),3));

    vector<double> M66 = T1==6 && __REFX(T1==7 && __NOT(B),1) || (__REFX(T1==8 && __NOT(B),2));

    vector<double> M77 = T1==7 && __REFX(T1==8 && __NOT(B),1);

    vector<double> N111 = T1==1 && __REF(T1==0 && BB,1) && B;

    vector<double> N11 = T1==2 && __REF(N111,1) && B;

    vector<double> N22 = T1==3 && __REF(N11,1) && B;

    vector<double> N33 = T1==4 && __REF(N22,1) && B;

    vector<double> N44 = T1==5 && __REF(N33,1) && B;

    vector<double> N55 = T1==6 && __REF(N44,1) && B;

    vector<double> N66 = T1==7 && __REF(N55,1) && B;

    vector<double> N77 = T1==8 && __REF(N66,1) && B;


    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = T1==0;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "1";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N111;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "2";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N11;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "3";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N22;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "4";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N33;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "5";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N44;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "6";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N55;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "7";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N66;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "8";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORRED;
        D1->_drawPositon1 = N77;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "9";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M111;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "1";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M11;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "2";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M22;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "3";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M33;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "4";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M44;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "5";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M55;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "6";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M66;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "7";
        _result.push_back(FormulaResult(D1));
    }

    {
        shared_ptr<FormulaDraw> D1 = make_shared<FormulaDraw>();
        D1->_type  = DRAWTEXT;
        D1->_color = COLORBLACK;
        D1->_drawPositon1 = M77;
        D1->_drawPositon2 = H*1.05;
        D1->_text = "8";
        _result.push_back(FormulaResult(D1));
    }



    return _result;

}


const FormulaResults& DDPD::run() {

// （逃顶策略+抄底策略）(主)

    _result.clear();


    {
        size_t size = _sticks.size();


        vector<double> C(size), L(size), H(size);
        transform(_sticks.begin(), _sticks.end(), C.begin(),
                  [](auto &stick) { return stick.close; });
        transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto &stick) { return stick.low; });
        transform(_sticks.begin(), _sticks.end(), H.begin(),
                  [](auto &stick) { return stick.high; });

        vector<double> Z = __MA(C, 120);
        vector<double> VAR3 = (__MA(C, 5) - Z) / Z;
        vector<double> VAR4 = __MA((C - __LLV(L, 20)) / (__HHV(H, 20) - __LLV(L, 20)) * 100, 3);

        {
            shared_ptr <FormulaDraw> D1 = make_shared<FormulaDraw>();
            D1->_type = DRAWTEXT;
            D1->_color = COLORRED;
            D1->_drawPositon1 = C > Z && __REF(VAR4, 1) < 30 && VAR4 > __REF(VAR4, 1) &&
                                __REF(VAR4, 1) < __REF(VAR4, 2);
            D1->_drawPositon2 = L * 0.99;
            D1->_text = "▲B";
            _result.push_back(FormulaResult(D1));
        }
        {
            shared_ptr <FormulaDraw> D1 = make_shared<FormulaDraw>();
            D1->_type = DRAWTEXT;
            D1->_color = COLORGREEN;
            D1->_drawPositon1 = __REF(VAR4, 1) < 7 && VAR4 > __REF(VAR4, 1) &&
                                __REF(VAR4, 1) < __REF(VAR4, 2) && VAR3 < -0.1;
            D1->_drawPositon2 = L * 0.99;
            D1->_text = "▲B";
            _result.push_back(FormulaResult(D1));
        }

        {
            shared_ptr <FormulaDraw> D1 = make_shared<FormulaDraw>();
            D1->_type = DRAWTEXT;
            D1->_color = COLORBLUE;
            D1->_drawPositon1 = __CROSS(VAR4, make_vector(size, 5)) && VAR3 < -0.3;
            D1->_drawPositon2 = L * 0.99;
            D1->_text = "▲B";
            _result.push_back(FormulaResult(D1));
        }
    }

    {
        size_t size = _sticks.size();


        vector<double> C(size), L(size), H(size);
        transform(_sticks.begin(), _sticks.end(), C.begin(),
                  [](auto &stick) { return stick.close; });
        transform(_sticks.begin(), _sticks.end(), L.begin(), [](auto &stick) { return stick.low; });
        transform(_sticks.begin(), _sticks.end(), H.begin(),
                  [](auto &stick) { return stick.high; });

        vector<double> Z = __MA(C, 120);
        vector<double> VAR3 = (__MA(H, 5) - Z) / Z;
        vector<double> VAR4 = __MA((C - __LLV(L, 10)) / (__HHV(H, 10) - __LLV(L, 10)) * 100, 3);

        {
            shared_ptr <FormulaDraw> D1 = make_shared<FormulaDraw>();
            D1->_type = DRAWTEXT;
            D1->_color = COLORRED;
            D1->_drawPositon1 = __CROSS(make_vector(size, 95), VAR4) && VAR3 > 0.3;
            D1->_drawPositon2 = H * 1.01;
            D1->_text = "▼S";
            _result.push_back(FormulaResult(D1));
        }
        {
            shared_ptr <FormulaDraw> D1 = make_shared<FormulaDraw>();
            D1->_type = DRAWTEXT;
            D1->_color = COLORGREEN;
            D1->_drawPositon1 =
                    __CROSS(make_vector(size, 93), VAR4) && __HHV(H, 30) / __LLV(L, 30) > 1.1 &&
                    __REF(Z, 1) / Z > 0.997;
            D1->_drawPositon2 = H * 1.01;
            D1->_text = "▼S";
            _result.push_back(FormulaResult(D1));
        }

        {
            shared_ptr <FormulaDraw> D1 = make_shared<FormulaDraw>();
            D1->_type = DRAWTEXT;
            D1->_color = COLORBLUE;
            D1->_drawPositon1 =
                    C < Z && Z < __REF(Z, 1) && __REF(VAR4, 1) > 90 && VAR4 < __REF(VAR4, 1) &&
                    __REF(VAR4, 1) > __REF(VAR4, 2);
            D1->_drawPositon2 = H * 1.01;
            D1->_text = "▼S";
            _result.push_back(FormulaResult(D1));
        }
    }


    return _result;
}