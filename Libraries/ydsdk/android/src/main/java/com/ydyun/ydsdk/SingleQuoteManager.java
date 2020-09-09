package com.ydyun.ydsdk;


import android.text.TextUtils;
import android.util.Log;

import org.json.JSONObject;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import cn.com.yd.cygp4.grpc.DataDefineFundFlow;
import yuanda.DataDefine;
import yuanda.GlueDataDefine;

public class SingleQuoteManager {


    private Map<String,SingleQuoteData> _data = new HashMap<String, SingleQuoteData>();

    Object tmp = new Object();

    private String _generalRegCodes = "";

    public ExecutorService getExecutorService() {
        return executorService;
    }

    private ExecutorService executorService = Executors.newFixedThreadPool(1);

    public void register(String strSortedCodes, QuoteCallback callback) {

        synchronized(tmp){

            if (strSortedCodes == null)
                return;
            // Log.w("stock-Sorted-register",strSortedCodes.toString());
//            Log.w("stock-callback-",callback.toString());
            String [] codes = strSortedCodes.split(",");

            for (int i=0; i<codes.length; i++) {

                SingleQuotePrice sqp = new SingleQuotePrice();
                SingleFundflowPrice sffp = new SingleFundflowPrice();
                sqp.setCode(codes[i]);

                SingleQuoteData sqd = new SingleQuoteData(sqp,sffp,callback);

                this._data.put(codes[i],sqd);

            }

        }

    }
    public void register(java.util.List<yuanda.DataDefine.SortEntity> entities, QuoteCallback callback) {

        synchronized(tmp){

            if (entities == null)
                return;
            // Log.w("stock-Sorted-register",strSortedCodes.toString());
//            Log.w("stock-callback-",callback.toString());
//            String [] codes = strSortedCodes.split(",");

            try{
                for (int i=0; i<entities.size(); i++) {
                    yuanda.DataDefine.SortEntity tmp = entities.get(i);
                    SingleQuotePrice sqp = new SingleQuotePrice();
                    SingleFundflowPrice sffp = new SingleFundflowPrice();
                    sqp.setCode(tmp.getLabel());
//                    sqp.setZhangDieFu(getDouble2(tmp.getValue()));
                    sffp.setCode(tmp.getLabel());

                    SingleQuoteData sqd = new SingleQuoteData(sqp,sffp,callback);

                    this._data.put(tmp.getLabel(),sqd);

                }
            }catch (Exception e){
                Log.e("Exception","singleQuoteManager register error");
            }


        }

    }

    private double getDouble2(double d){
//        double d = 114.145;
//        BigDecimal b = new BigDecimal(d);
//        d = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
//        return d;
        BigDecimal bg = new BigDecimal(d);
        double d3 = bg.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
        return d3;
    }
    public void unregister(String strSortedCodes) {

        synchronized(tmp) {

            if (strSortedCodes == null)
                return;
            // Log.w("stock-Sorted-unregister",strSortedCodes.toString());
            String [] codes = strSortedCodes.split(",");

            for (int i=0; i<codes.length; i++) {

                SingleQuoteData tmpSqd = this._data.get(codes[i]);

                if (tmpSqd != null) {
                    tmpSqd.setCallback(null);
                }

            }


        }
    }

    public String getQuoteListDataJson(String code) {
        try {

            SingleQuotePrice sqp = getQuotePrice(code);
            SingleFundflowPrice sffp = getFundflowPrice(code);

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("ZhongWenJianCheng", sqp.getName());
            jsonObject.put("Obj", sqp.getCode());
            jsonObject.put("ZuiXinJia", sqp.getZuiXinJia());
            jsonObject.put("ZhangDie", sqp.getZhangDie());
            jsonObject.put("ZhangFu", sqp.getZhangDieFu());
            // 资金流向数据
            jsonObject.put("littleIn", sffp.getLittleIn());
            jsonObject.put("littleOut", sffp.getLittleOut());
            jsonObject.put("mediumIn", sffp.getMediumIn());
            jsonObject.put("mediumOut", sffp.getMediumOut());
            jsonObject.put("largeIn", sffp.getLargeIn());
            jsonObject.put("largeOut", sffp.getLargeOut());
            jsonObject.put("superIn", sffp.getSuperIn());
            jsonObject.put("superOut", sffp.getSuperOut());
            jsonObject.put("hugeIn", sffp.getHugeIn());
            jsonObject.put("hugeOut", sffp.getHugeOut());
            jsonObject.put("hugeNet1Day", sffp.getHugeNet1day());
            jsonObject.put("hugeNet3Day", sffp.getHugeNet3day());
            jsonObject.put("hugeNet5Day", sffp.getHugeNet5day());
            jsonObject.put("hugeNet10Day", sffp.getHugeNet10day());

            return jsonObject.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }
    public String getQuoteDataJson(String code) {
        synchronized (tmp) {

            try {

                SingleQuotePrice sqp = getQuotePrice(code);
                SingleFundflowPrice sffp = getFundflowPrice(code);

                if(sffp!=null||sqp!=null){
                JSONObject jsonObject = new JSONObject();

                if(sqp!=null) {
                    jsonObject.put("ZhongWenJianCheng", sqp.getName());
                    jsonObject.put("Obj", sqp.getCode());
                    jsonObject.put("ZuiXinJia", sqp.getZuiXinJia());
                    jsonObject.put("ZhangDie", sqp.getZhangDie());
                    jsonObject.put("ZhangFu", sqp.getZhangDieFu());
                }
                if(sffp!=null) {
                    // 资金流向数据
                    jsonObject.put("littleIn", sffp.getLittleIn());
                    jsonObject.put("littleOut", sffp.getLittleOut());
                    jsonObject.put("mediumIn", sffp.getMediumIn());
                    jsonObject.put("mediumOut", sffp.getMediumOut());
                    jsonObject.put("largeIn", sffp.getLargeIn());
                    jsonObject.put("largeOut", sffp.getLargeOut());
                    jsonObject.put("superIn", sffp.getSuperIn());
                    jsonObject.put("superOut", sffp.getSuperOut());
                    jsonObject.put("hugeIn", sffp.getHugeIn());
                    jsonObject.put("hugeOut", sffp.getHugeOut());
                    jsonObject.put("hugeNet1Day", sffp.getHugeNet1day());
                    jsonObject.put("hugeNet3Day", sffp.getHugeNet3day());
                    jsonObject.put("hugeNet5Day", sffp.getHugeNet5day());
                    jsonObject.put("hugeNet10Day", sffp.getHugeNet10day());
                }

                return jsonObject.toString();
                }


            } catch (Exception e) {
                e.printStackTrace();
            }

            return "";
        }
    }

    public SingleQuotePrice getQuotePrice(String code) {
        synchronized(tmp) {
            SingleQuoteData tmpSqd = this._data.get(code);

            if (tmpSqd != null) {
                return tmpSqd.getSingleQuotePrice();
            }


           SingleQuotePrice result = new SingleQuotePrice();
           result.setCode(code);

           return result;
        }
    }
   

    public void setQuotePrice(String code, String name, double zuixinjia, double zhangdie, double zhangdiefu) {
        synchronized(tmp) {
            SingleQuoteData tmpSqd = this._data.get(code);

            if (tmpSqd != null) {
                SingleQuotePrice tmpSqp = tmpSqd.getSingleQuotePrice();
                tmpSqp.setName(name);
                tmpSqp.setZuiXinJia(zuixinjia);
                tmpSqp.setZhangDie(zhangdie);
                tmpSqp.setZhangDieFu(zhangdiefu);

                QuoteCallback a = tmpSqd.getCallback();
                if (a != null)
                    tmpSqd.getCallback().execute(code);

            }
        }

    }

    public SingleFundflowPrice getFundflowPrice(String code) {
        synchronized(tmp) {
            SingleQuoteData tmpSqd = this._data.get(code);


            if (tmpSqd != null) {
//                Log.i("flowPrice","code:"+code+"   "+tmpSqd.getSingleFundflowPrice().getLargeOut());
                return tmpSqd.getSingleFundflowPrice();
            }

            // return null;
           SingleFundflowPrice result = new SingleFundflowPrice();
           result.setCode(code);
//            Log.i("flowPrice2","code:"+code+"   "+result.getLargeOut());
           return result;
        }
    }
   
    public void setFunflowPrice(String code, String name,
                                double littleIn, double littleOut,
                                double mediumIn, double mediumOut,
                                double largeIn, double largeOut,
                                double superIn, double superOut,
                                double hugeIn, double hugeOut,
                                double hugeNet1Day, double hugeNet3Day,
                                double hugeNet5Day, double hugeNet10Day) {
        synchronized (tmp) {

            SingleQuoteData tmpSqd = this._data.get(code);

            if (tmpSqd != null) {
                SingleFundflowPrice tmpSffp = tmpSqd.getSingleFundflowPrice();
                tmpSffp.setName(name);
                tmpSffp.setCode(code);
                tmpSffp.setLittleIn(littleIn);
                tmpSffp.setLittleOut(littleOut);
                tmpSffp.setMediumIn(mediumIn);
                tmpSffp.setMediumOut(mediumOut);
                tmpSffp.setLargeIn(largeIn);
                tmpSffp.setLargeOut(largeOut);
                tmpSffp.setSuperIn(superIn);
                tmpSffp.setSuperOut(superOut);
                tmpSffp.setHugeIn(hugeIn);
                tmpSffp.setHugeOut(hugeOut);
                tmpSffp.setHugeNet1day(hugeNet1Day);
                tmpSffp.setHugeNet3day(hugeNet3Day);
                tmpSffp.setHugeNet5day(hugeNet5Day);
                tmpSffp.setHugeNet10day(hugeNet10Day);
            }
        }
    }
    public void setFullQuote(GlueDataDefine.GluedQuote gq){
        DataDefine.FullQuote fq = gq.getQuote();
        DataDefineFundFlow.BaseFundFlow bff = gq.getFundFlow();
        String code= fq.getLabel();
        SingleQuoteData singleQuoteData = this._data.get(code);
        if (singleQuoteData != null) {
            SingleQuotePrice tmpSqp = singleQuoteData.getSingleQuotePrice();
            if(fq!=null) {
                tmpSqp.setCode(code);
                tmpSqp.setName(fq.getName());
                tmpSqp.setZuiXinJia(fq.getPrice());
                tmpSqp.setZhangDie(fq.getIncrease());
                tmpSqp.setZhangDieFu(fq.getIncreaseRatio());
                singleQuoteData.setSingleQuotePrice(tmpSqp);
            }
            if(bff!=null) {
                SingleFundflowPrice tmpSffp = singleQuoteData.getSingleFundflowPrice();
                tmpSffp.setName(fq.getName());
                tmpSffp.setCode(code);
                tmpSffp.setLittleIn(bff.getLittleIn());
                tmpSffp.setLittleOut(bff.getLittleOut());
                tmpSffp.setMediumIn(bff.getMediumIn());
                tmpSffp.setMediumOut(bff.getMediumOut());
                tmpSffp.setLargeIn(bff.getLargeIn());
                tmpSffp.setLargeOut(bff.getLargeOut());
                tmpSffp.setSuperIn(bff.getSuperIn());
                tmpSffp.setSuperOut(bff.getSuperOut());
                tmpSffp.setHugeIn(bff.getHugeIn());
                tmpSffp.setHugeOut(bff.getHugeOut());
                tmpSffp.setHugeNet1day(bff.getHugeNet1Day());
                tmpSffp.setHugeNet3day(bff.getHugeNet3Day());
                tmpSffp.setHugeNet5day(bff.getHugeNet5Day());
                tmpSffp.setHugeNet10day(bff.getHugeNet10Day());

                singleQuoteData.setSingleFundflowPrice(tmpSffp);
            }

        }

        if(singleQuoteData!=null) {
            QuoteCallback a = singleQuoteData.getCallback();
            if (a != null)
                a.execute(code);
        }

    }

    public void setGeneralRegister(String regcodes) {
        _generalRegCodes = regcodes;
    }

    public String getGeneralRegister() {
        return _generalRegCodes;
    }

    private SingleQuoteManager() {}

    private static SingleQuoteManager single=null;

    public static SingleQuoteManager getInstance() {
        if (single == null) {
            single = new SingleQuoteManager();
        }
        return single;
    }



}
