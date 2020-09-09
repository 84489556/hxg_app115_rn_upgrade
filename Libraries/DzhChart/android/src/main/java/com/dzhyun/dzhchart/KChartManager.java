package com.dzhyun.dzhchart;

import android.graphics.Color;
import android.os.Handler;
import android.os.Message;
import androidx.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.sun.jna.Native;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import java.util.logging.LogRecord;

import sadcup.android.jnaonas.ExRightJava;
import sadcup.android.jnaonas.JNIFormulaResultFactoryMapping;
import sadcup.android.jnaonas.KLineStickJava;

public class KChartManager extends SimpleViewManager<YDKChart> {
    public static final String REACT_CLASS = "RCTYdKline";

    private ThemedReactContext themedReactContext;
    private YDKChart dzhChart;
    private static final int COMMAND_STARTPOS_ID = 0;
    private static final int COMMAND_ZOOMIN_ID = 1;
    private static final int COMMAND_ZOOMOUT_ID = 2;
    private static final int COMMAND_ZOOMLEFT_ID = 3;
    private static final int COMMAND_ZOOMRIGHT_ID = 4;
    private static final String COMMAND_STARTPOS_NAME = "startPos";
    private static final String COMMAND_ZOOMIN_NAME = "zoomIn";
    private static final String COMMAND_ZOOMOUT_NAME = "zoomOut";
    private static final String COMMAND_ZOOMLEFT_NAME = "moveLeft";
    private static final String COMMAND_ZOOMRIGHT_NAME = "moveRight";
    private ArrayList<ExRightJava> exRights = null;
    private  String code="";

    private static JNIFormulaResultFactoryMapping _frf = null;
    private YDKChart mChart;

    @Override
    public String getName() {
        return REACT_CLASS;
    }


    @Override
    protected YDKChart createViewInstance(ThemedReactContext themedReactContext) {
        return new YDKChart(themedReactContext);
    }
    @ReactProp(name = "isLandscape")
    public void setIsLandscape(YDKChart chart, @Nullable String data) {
        chart.setIsLandscape(data);

    }
    @ReactProp(name = "fuTu")
    public void setFuTu(YDKChart chart, @Nullable String data) {
        chart.setFuTu(data);

    }
    @ReactProp(name = "chartData")
    public void setChartData(final YDKChart chart, @Nullable final String data) {
//        chart.drawDzhChart(data);
        try {
            JSONObject chartData = new JSONObject(data);
            JSONObject stkobj = chartData.getJSONObject("stkInfo");
            String obj = stkobj.getString("Obj");
            String split = chartData.getString("split");
            String period = chartData.getString("period");
            int per = Integer.parseInt(period);
            if(period.equals("5")){
                if(!obj.equals(code)){
                    code = obj;
                    exRights = null;
                }
                if(split.equals("0")){
                    chart.drawDzhChart(data);
                }else if(split.equals("1")){
                    String tempObj = obj.substring(2);
                    detailSplit(chart,tempObj,data,1,5);
                }else if(split.equals("2")){
                    String tempObj = obj.substring(2);
                    detailSplit(chart,tempObj,data,2,5);
                }
            }else {
                chart.drawDzhChart(data);
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
    @ReactProp(name = "mainName")
    public void setMainName(YDKChart chart, @Nullable String data) {
        chart.setMainFormulaName(data);
    }
    @ReactProp(name = "viceName")
    public void setViceName(YDKChart chart, @Nullable String data) {
        chart.setAssistFormulaName(data);
    }
    @ReactProp(name = "secondViceName")
    public void setSecondViceName(YDKChart chart, @Nullable String data) {
        chart.setSecondAssistFormulaName(data);
    }

    @ReactProp(name = "showCount")
    public void setShowCount(YDKChart chart, @Nullable int data) {
        chart.setScreenNum(data);
    }
    @ReactProp(name = "startPos")
    public void setStartPos(YDKChart chart, @Nullable int data) {
        chart.setDataStartPos(data);
    }
    @ReactProp(name = "legendPos")
    public void setLegendPos(YDKChart chart, @Nullable int data) {
        chart.setLegendPos(data);
    }

    @ReactProp(name = "tapY")
    public void setTapY(YDKChart chart, @Nullable int data) {
        chart.setTapY(data);
    }

    @ReactProp(name = "split")
    public void setSplit(YDKChart chart, @Nullable int data) {
//        chart.setSplit(data);
    }

    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();

        builder.put( "sendTimeForKLine", MapBuilder.of("registrationName", "getTimeForKLine"));
        builder.put( "sendMADataForKLine", MapBuilder.of("registrationName", "getMADataForKLine"));
        builder.put( "sendLanMADataForKLine", MapBuilder.of("registrationName", "getLanMADataForKLine"));
        builder.put( "sendFuTu1DataForKLine", MapBuilder.of("registrationName", "getFuTu1DataForKLine"));
        builder.put( "sendLanFuTu1DataForKLine", MapBuilder.of("registrationName", "getLanFuTu1DataForKLine"));
        builder.put( "sendFuTu2DataForKLine", MapBuilder.of("registrationName", "getFuTu2DataForKLine"));

        return builder.build();
    }
    @Override
    public Map<String, Integer> getCommandsMap() {
//        return MapBuilder.of(
//                COMMAND_STARTPOS_NAME,COMMAND_STARTPOS_ID
//        );
        Map map=new HashMap();
        map.put(COMMAND_STARTPOS_NAME, COMMAND_STARTPOS_ID);
        map.put(COMMAND_ZOOMIN_NAME, COMMAND_ZOOMIN_ID);
        map.put(COMMAND_ZOOMOUT_NAME, COMMAND_ZOOMOUT_ID);
        map.put(COMMAND_ZOOMLEFT_NAME, COMMAND_ZOOMLEFT_ID);
        map.put(COMMAND_ZOOMRIGHT_NAME, COMMAND_ZOOMRIGHT_ID);

        return map;
    }

    @Override
    public void receiveCommand(YDKChart chart, int commandId, @Nullable ReadableArray args) {
        switch (commandId){
            case COMMAND_STARTPOS_ID:
//                int data = args.getInt(0);
//                chart.setDataStartPos(data);
//                for (int i = 460;i >= 0;i--){
//                    chart.setDataStartPos(i);
//                }
                break;
            case COMMAND_ZOOMIN_ID:
                chart.setZoomIn();
                break;
            case COMMAND_ZOOMOUT_ID:
                chart.setZoomOut();
                break;
            case COMMAND_ZOOMLEFT_ID:
               // Log.i("controlKline","COMMAND_ZOOMLEFT_ID--------");
                chart.setMoveLeft();
                break;
            case COMMAND_ZOOMRIGHT_ID:
               // Log.i("controlKline","COMMAND_ZOOMRIGHT_ID--------");
                chart.setMoveRight();
                break;
            default:
                break;
        }
    }


    private void detailSplit(final YDKChart chart, String code, final String jsonData, final int nowSplit, final int period){

        if(exRights == null){
            new DownLoadExright().downLoadFile(chart, code, new ReposeCallback() {
                @Override
                public void sucessCallback(String json) {

                }

                @Override
                public void sucessCallback(ArrayList<ExRightJava> exRightJavas) {
                    exRights = exRightJavas;
                    ArrayList<KLineStickJava> sticks =  new ArrayList<>();
                    try {
                        sticks =  JNAGetSplitData(makeSticks(jsonData),exRightJavas,nowSplit,period);
                    }catch (Exception e){

                    }
                    chart.drawDzhChart(jsonData,sticks);
                }

                @Override
                public void failCallback(Exception e) {

                }
            });
        }else {
            ArrayList<KLineStickJava> sticks =  new ArrayList<>();
            try {
                sticks =  JNAGetSplitData(makeSticks(jsonData),exRights,nowSplit,period);
            }catch (Exception e){

            }
            chart.drawDzhChart(jsonData,sticks);
        }

    }

    private  ArrayList<KLineStickJava> makeSticks(String jsonData){
        ArrayList<KLineStickJava> tempStick = new ArrayList<>();
        try {
            JSONObject data = new JSONObject(jsonData);
            JSONArray datasarr = data.getJSONArray("chartData");
            for(int i = 0; i < datasarr.length(); i++){
                JSONObject o = datasarr.getJSONObject(i);
                long time = o.getLong("ShiJian");
                double open = o.getDouble("KaiPanJia");
                double high = o.getDouble("ZuiGaoJia");
                double low = o.getDouble("ZuiDiJia");
                double close = o.getDouble("ShouPanJia");
                double qty = o.getLong("ChengJiaoLiang");
                KLineStickJava oneStick = new KLineStickJava();
                oneStick.time = time;
                oneStick.open = open;
                oneStick.high = high;
                oneStick.low = low;
                oneStick.close = close;
                oneStick.volume = qty;
                oneStick.amount = o.getDouble("ChengJiaoE");
                tempStick.add(oneStick);
            }
        } catch (JSONException e) {
            Log.e("Exception","makeSticks error");
            e.printStackTrace();
        }
        return tempStick;
    }

    public static ArrayList<KLineStickJava> JNAGetSplitData(ArrayList<KLineStickJava> kdata, ArrayList<ExRightJava> vExRight, int split,int period) {

        if(split == 0) return kdata;

        try {

            JSONArray ja = new JSONArray();
            for(int i = 0;i < kdata.size();i++){
                KLineStickJava tmp = kdata.get(i);
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("time", tmp.time);
                jsonObject.put("open", tmp.open);
                jsonObject.put("high", tmp.high);
                jsonObject.put("low", tmp.low);
                jsonObject.put("close", tmp.close);
                jsonObject.put("volume", tmp.volume);
                jsonObject.put("amount", tmp.amount);
                ja.put(jsonObject);
            }

            String strsticks = ja.toString();

            JSONArray jaExRight = new JSONArray();
            for (int i = 0;i < vExRight.size();i++){
                ExRightJava tmp = vExRight.get(i);
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("lastUpdateTime", tmp.lastUpdateTime);
                jsonObject.put("stockCode", tmp.stockCode);
                jsonObject.put("subType", tmp.subType);
                jsonObject.put("exright_date", tmp.exright_date);
                jsonObject.put("alloc_interest", tmp.alloc_interest);
                jsonObject.put("give", tmp.give);
                jsonObject.put("extend", tmp.extend);
                jsonObject.put("match", tmp.match);
                jsonObject.put("match_price", tmp.match_price);
                jaExRight.put(jsonObject);
            }

            String strExRights = jaExRight.toString();

            String ERs_json = get_frf().getSplitDataJson( strsticks, strExRights, split,period);

            ArrayList<KLineStickJava> ksJavas = new ArrayList<KLineStickJava>();

            JSONObject jo = new JSONObject(ERs_json);
            JSONArray ers_json = (JSONArray) jo.get("SplitResults");
            for (int i = 0; i < ers_json.length(); ++i) {

                JSONObject er = (JSONObject) ers_json.get(i);

                KLineStickJava ksJava = new KLineStickJava();
                ksJava.time = er.getLong("time");
                ksJava.open = er.getDouble("open");
                ksJava.high = er.getDouble("high");
                ksJava.low = er.getDouble("low");
                ksJava.close = er.getDouble("close");
                ksJava.volume = er.getDouble("volume");
                ksJava.amount = er.getDouble("amount");

                ksJavas.add(ksJava);
            }


            return ksJavas;


        } catch(Exception e) {
            Log.e("Exception","JNAGetSplitData error");
            e.printStackTrace();
            return null;
        }
    }
    private static JNIFormulaResultFactoryMapping get_frf() {
        if (_frf == null) {
            _frf = (JNIFormulaResultFactoryMapping) Native.loadLibrary("JNADemo", JNIFormulaResultFactoryMapping.class);
        }

        return _frf;
    }
}


