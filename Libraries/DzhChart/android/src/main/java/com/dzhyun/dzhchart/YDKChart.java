package com.dzhyun.dzhchart;

import android.animation.ValueAnimator;
import android.annotation.TargetApi;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.os.Build;
//import android.support.v4.view.GestureDetectorCompat;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.google.gson.Gson;
import com.sun.jna.Native;
import com.sun.jna.Pointer;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import okio.Timeout;
import sadcup.android.jnaonas.FormulaDrawJava;
import sadcup.android.jnaonas.FormulaLineJava;
import sadcup.android.jnaonas.FormulaResultJava;
import sadcup.android.jnaonas.KLineStickJava;


public class YDKChart extends YDKChartBase {

    private float mTranslateX = Float.MIN_VALUE;
    private int mWidth = 0;
    private int mStartIndex = 0;
    private int mStopIndex = 0;
    private float mPointWidth = 6;
    private float mMainScaleY = 1;
    private float mChildScaleY = 1;
    private float mDataLen = 0;
    //当前点的个数
    private int mItemCount;
    private int mSelectedIndex;
    private float mOverScrollRange = 0;
    private Paint mSelectedLinePaint=new Paint(Paint.ANTI_ALIAS_FLAG);
    private Paint mTextPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private Paint mSelectPointPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private Paint mSelectorFramePaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    //    private float mMainMaxValue = Float.MAX_VALUE;
//
//    private float mMainMinValue = Float.MIN_VALUE;
    private ValueAnimator mAnimator;

    private long mAnimationDuration = 500;
//    private OnSelectedChangedListener mOnSelectedChangedListener = null;

    SimpleDateFormat format = new SimpleDateFormat("yyy/MM/dd");

    private ArrayList<FormulaResultJava> _mainfrsJava;
    private ArrayList<FormulaResultJava> _assistfrsJava;
    private ArrayList<FormulaResultJava> _assistfrsJava2;
    private String _code = "";
    private int _period = 5;
    private int _ScreenNumInView = 60;
    private final int  DEFAULT_K_COUNT = 60;
    private int _DataStartPosInView = -1;
    private int _LegendPosInView = -1;
    ReactContext reactContext = (ReactContext) getContext();
    private String MAINFORMULANAME = "趋势彩虹";
    private String ASSISTFORMULANAME = "量能黄金";
    private String ASSISTFORMULANAME2 = "周期拐点";
    private String isFirstFuTu = "1";
    private String isLandscape = "false";
    private ArrayList<KLineStickJava> _sticks = new ArrayList<KLineStickJava>();
    private ArrayList<FundFlowJava> _sticksFundFlow = new ArrayList<FundFlowJava>();
    private ArrayList<String> _assistFormulaTerm = new ArrayList<String>(){{add("VOL"); add("MACD"); add("KDJ");}};
    private int _assistFormulaTermCurrentIndex = 0;
    private LineGroup lineGroup[];
    private boolean isKeChuangStock = false;
    private static Double INVALID_DOUBLE = -1.797693E308;
//    private boolean is

    public YDKChart(Context context) {
        super(context);
        init(null, 0);

    }

    public YDKChart(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(attrs,0);
    }

    public YDKChart(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(attrs,defStyleAttr);
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public YDKChart(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(attrs, defStyleAttr);
    }

    private double NaN2InvalidValue(double val) {
        if (Double.isNaN(val))
            return INVALID_DOUBLE;

        return val;

    }

    public synchronized void drawDzhChart(String json){
        Log.i("klinedrawDzhChart","------drawDzhChart---------");

        try {
            JSONObject data = new JSONObject(json);
            String type = data.optString("chartType");
            JSONObject stkobj = data.getJSONObject("stkInfo");
            String name = stkobj.optString("MingCheng");
            String obj = stkobj.optString("Obj");
            setIsKeChuangStock(obj);
            _code = obj;
            _period = data.optInt("period");

            JSONObject color = data.getJSONObject("color");
            String riseColor = color.optString("ShangZhangYanSe");
            String dropColor = color.optString("XiaDieYanSe");
            String bgColor = color.optString("BeiJingYanSe");
//            Log.d("YDKChart","bgColor:"+bgColor);
            Config.riseColor = Color.parseColor(riseColor);
            Config.dropColor = Color.parseColor(dropColor);
            Config.bgColor = Color.parseColor(bgColor);

            TableData datas;
            TableData qtyDatas;
            String schame;
            JSONArray datasarr = data.getJSONArray("chartData");

            schame = "KaiPanJia;ZuiGaoJia;ZuiDiJia;ShouPanJia";
            datas = new TableData(schame);
            schame = "ChengJiaoLiang;ZhangDie";
            qtyDatas = new TableData(schame);

            //start
            _sticks.clear();
            _sticksFundFlow.clear();
            //end

            double lastClose=0;
            for(int i = 0; i < datasarr.length(); i++){
                JSONObject o = datasarr.getJSONObject(i);
                long time = o.optLong("ShiJian");
                Date date = new Date(time*1000);

                double open = o.getDouble("KaiPanJia");
                double high = o.getDouble("ZuiGaoJia");
                double low = o.getDouble("ZuiDiJia");
                double close = o.getDouble("ShouPanJia");
//                double qty = o.optLong("ChengJiaoLiang")/100;
                double qty = o.optLong("ChengJiaoLiang");
                double fixedAmount = o.optLong("FixedAmount");
                double fixedVolume = o.optLong("FixedVolume");

                FundFlowJava ff = new FundFlowJava();
                ff.littleIn = NaN2InvalidValue(o.optDouble("littleIn"));
                ff.littleOut = NaN2InvalidValue(o.optDouble("littleOut"));
                ff.mediumIn = NaN2InvalidValue(o.optDouble("mediumIn"));
                ff.mediumOut = NaN2InvalidValue(o.optDouble("mediumOut"));
                ff.hugeIn = NaN2InvalidValue(o.optDouble("hugeIn"));
                ff.hugeOut = NaN2InvalidValue(o.optDouble("hugeOut"));
                ff.largeIn = NaN2InvalidValue(o.optDouble("largeIn"));
                ff.largeOut = NaN2InvalidValue(o.optDouble("largeOut"));
                ff.superIn = NaN2InvalidValue(o.optDouble("superIn"));
                ff.superOut = NaN2InvalidValue(o.optDouble("superOut"));
                ff.total = NaN2InvalidValue(o.optDouble("total"));
                _sticksFundFlow.add(ff);

                datas.addRow(new Row(date, open, high, low, close));

                boolean zhangDie = (open > close || (open == close && open<lastClose)) ? false :true;
                qtyDatas.addRow(new Row(qty, zhangDie, fixedAmount, fixedVolume));


                //start
                KLineStickJava oneStick = new KLineStickJava();
                oneStick.time = time;
                oneStick.open = open;
                oneStick.high = high;
                oneStick.low = low;
                oneStick.close = close;
                oneStick.volume = qty;
                oneStick.amount = o.getDouble("ChengJiaoE");
                _sticks.add(oneStick);
                //end

                lastClose = close;
            }

            //start
            getMainFormulaData();
            getAssistFormulaData();

            //end

            schame = "type;data;name;obj";
            TableData datasg = new TableData(schame);
            datasg.addRow(new Row(type, datas, name, obj));
            lineGroup[0] = new LineGroup(datasg);

            TableData qtyDatasg = new TableData(schame);
            qtyDatasg.addRow(new Row(type, qtyDatas, name, obj));
            lineGroup[1] = new LineGroup(qtyDatasg);

            invalidate();//通知重绘界面
        }catch (JSONException ex) {
            Log.e("Exception","drawDzhChart error");
            System.out.printf("Json parse fialed:%s.", ex.getMessage());
            ex.printStackTrace();
        }catch (Exception ex){
            Log.e("Exception","drawDzhChart error");
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }
    }

    public synchronized void drawDzhChart(String json,ArrayList<KLineStickJava> sticks){
        Log.i("klinedrawDzhChart","------drawDzhChart-222--------");

        try {
            JSONObject data = new JSONObject(json);
            String type = data.optString("chartType");
            JSONObject stkobj = data.getJSONObject("stkInfo");
            String name = stkobj.optString("MingCheng");
            String obj = stkobj.optString("Obj");
            setIsKeChuangStock(obj);
            _code = obj;
            _period = data.optInt("period");

            JSONObject color = data.getJSONObject("color");
            String riseColor = color.optString("ShangZhangYanSe");
            String dropColor = color.optString("XiaDieYanSe");
            String bgColor = color.optString("BeiJingYanSe");
//            Log.d("YDKChart","bgColor:"+bgColor);
            Config.riseColor = Color.parseColor(riseColor);
            Config.dropColor = Color.parseColor(dropColor);
            Config.bgColor = Color.parseColor(bgColor);

            TableData datas;
            TableData qtyDatas;
            String schame;
            schame = "KaiPanJia;ZuiGaoJia;ZuiDiJia;ShouPanJia";
            datas = new TableData(schame);
            schame = "ChengJiaoLiang;ZhangDie";
            qtyDatas = new TableData(schame);
            //start
            _sticks.clear();
            _sticksFundFlow.clear();
            WritableArray DataList = new WritableNativeArray();
            //end

            JSONArray datasarr = data.getJSONArray("chartData");
            double lastClose=0;
            for(int i = 0; i < sticks.size(); i++){
                KLineStickJava oneStick = sticks.get(i);
                long time = oneStick.time;
                Date date = new Date(time*1000);
                double open = oneStick.open;
                double high = oneStick.high;
                double low = oneStick.low;
                double close =  oneStick.close;
                double qty = oneStick.volume;

                JSONObject o = datasarr.getJSONObject(i);
                double fixedAmount = o.optLong("FixedAmount");
                double fixedVolume = o.optLong("FixedVolume");

                FundFlowJava ff = new FundFlowJava();
                ff.littleIn = NaN2InvalidValue(o.optDouble("littleIn"));
                ff.littleOut = NaN2InvalidValue(o.optDouble("littleOut"));
                ff.mediumIn = NaN2InvalidValue(o.optDouble("mediumIn"));
                ff.mediumOut = NaN2InvalidValue(o.optDouble("mediumOut"));
                ff.hugeIn = NaN2InvalidValue(o.optDouble("hugeIn"));
                ff.hugeOut = NaN2InvalidValue(o.optDouble("hugeOut"));
                ff.largeIn = NaN2InvalidValue(o.optDouble("largeIn"));
                ff.largeOut = NaN2InvalidValue(o.optDouble("largeOut"));
                ff.superIn = NaN2InvalidValue(o.optDouble("superIn"));
                ff.superOut = NaN2InvalidValue(o.optDouble("superOut"));
                ff.total = NaN2InvalidValue(o.optDouble("total"));
                _sticksFundFlow.add(ff);


                datas.addRow(new Row(date, open, high, low, close));
                boolean zhangDie = (open > close || (open == close && open<lastClose)) ? false :true;
                qtyDatas.addRow(new Row(qty, zhangDie, fixedAmount, fixedVolume));
                _sticks.add(oneStick);
                String childData = beanToJson(oneStick);
                DataList.pushString(childData);

                lastClose=close;
            }

//            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("getSplitData", _sticks);

            getMainFormulaData();
            getAssistFormulaData();
            schame = "type;data;name;obj";
            TableData datasg = new TableData(schame);
            datasg.addRow(new Row(type, datas, name, obj));
            lineGroup[0] = new LineGroup(datasg);

            TableData qtyDatasg = new TableData(schame);
            qtyDatasg.addRow(new Row(type, qtyDatas, name, obj));
            lineGroup[1] = new LineGroup(qtyDatasg);

            invalidate();//通知重绘界面
            WritableMap event = Arguments.createMap();
            event.putArray("data", DataList);
            reactContext.getJSModule(RCTNativeAppEventEmitter.class)
                    .emit("changeSplitData",event);

        }catch (JSONException ex) {
            Log.e("Exception","drawDzhChart error");
            System.out.printf("Json parse fialed:%s.", ex.getMessage());
            ex.printStackTrace();
        }catch (Exception ex){
            Log.e("Exception","drawDzhChart error");
            System.out.printf("Exception:%s", ex.getMessage());
            ex.printStackTrace();
        }
    }

    public static String beanToJson(Object bean) {
        Gson gson = new Gson();
        String jsonStr = gson.toJson(bean);
        return jsonStr;
    }

    private String getStringWithFilterNull(JSONObject job, String key) {

        try {

            String val;

            if (job.has(key)) {
                val = job.optString(key);
                if (val.contentEquals("null"))
                    val = "0";
            }
            else {
                val = "0";
            }

            return val;


        } catch(Exception e) {
            e.printStackTrace();
            return "";
        }


    }

    public synchronized int getMainFormulaData() {
        if (_sticks.isEmpty())
            return 1;

        _mainfrsJava = JNAGetFormulaResult(MAINFORMULANAME, _sticks, _sticksFundFlow);
        return 0;
    }

    public synchronized int getAssistFormulaData() {
        if (_sticks.isEmpty())
            return 1;

        _assistfrsJava = JNAGetFormulaResult(ASSISTFORMULANAME, _sticks, _sticksFundFlow);
        _assistfrsJava2 = JNAGetFormulaResult(ASSISTFORMULANAME2, _sticks, _sticksFundFlow);
        return 0;
    }

    public static ArrayList<FormulaResultJava> JNAGetFormulaResult(String formulaname, ArrayList<KLineStickJava> kdata) {

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

            String FRs_json = get_frf().getFormulaResultJson(formulaname, strsticks);

            ArrayList<FormulaResultJava> frJavas = new ArrayList<FormulaResultJava>();

            JSONObject jo = new JSONObject(FRs_json);
            JSONArray frs_json = (JSONArray) jo.get("FormulaResults");
            for (int i = 0; i < frs_json.length(); ++i) {
                JSONObject fr = (JSONObject) frs_json.get(i);

                JSONObject fl,fd;
                FormulaResultJava frJava = new FormulaResultJava();

                if (fr.has("FormulaLine")) {
                    fl = fr.getJSONObject("FormulaLine");

                    FormulaLineJava flJava = new FormulaLineJava();
                    flJava._color = fl.getInt("color");
//                    flJava._color2 = fl.getInt("color2");
                    flJava._name = fl.optString("name");
                    flJava._type = fl.getInt("type");
                    flJava._thick = fl.getDouble("thick");
                    flJava._nodraw = fl.getBoolean("nodraw");

                    JSONArray data_json = fl.getJSONArray("data");
                    if (data_json.length() > 0) {
                        flJava._data = new ArrayList<Double>();

                        for (int n = 0; n < data_json.length(); ++n) {
                            Object value = data_json.get(n);
                            String str = value.toString();
                            Double d = Double.parseDouble(str);
                            flJava._data.add(d);
                        }
                    }

                    frJava._line = flJava;
                }
                if (fr.has("FormulaDraw")) {
                    fd = fr.getJSONObject("FormulaDraw");

                    FormulaDrawJava fdJava = new FormulaDrawJava();
                    fdJava._text = fd.optString("text");
                    fdJava._name = fd.optString("name");
                    fdJava._type = fd.getInt("type");
                    fdJava._para1 = fd.getDouble("para1");
                    fdJava._para2 = fd.getDouble("para2");
                    fdJava._color = fd.getInt("color");
                    fdJava._color2 = fd.getInt("color2");
                    fdJava._color3 = fd.getInt("color3");
                    fdJava._color4 = fd.getInt("color4");

                    JSONArray data_json;
                    if (fd.has("drawPositon1")) {
                        data_json = fd.getJSONArray("drawPositon1");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon1 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();
                                Double d = Double.parseDouble(str);
                                fdJava._drawPositon1.add(d);
                            }
                        }
                    }

                    if (fd.has("drawPositon2")) {
                        data_json = fd.getJSONArray("drawPositon2");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon2 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();
                                Double d;
                                if(str.equals("null"))
                                    d = INVALID_DOUBLE;
                                else d = Double.parseDouble(str);

                                fdJava._drawPositon2.add(d);
                            }
                        }
                    }

                    if (fd.has("drawPositon3")) {
                        data_json = fd.getJSONArray("drawPositon3");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon3 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();

                                Double d;
                                if(str.equals("null"))
                                    d = INVALID_DOUBLE;
                                else d = Double.parseDouble(str);

                                fdJava._drawPositon3.add(d);
                            }
                        }
                    }

                    if (fd.has("drawPositon4")) {
                        data_json = fd.getJSONArray("drawPositon4");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon4 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();

                                Double d;
                                if(str.equals("null"))
                                    d = INVALID_DOUBLE;
                                else d = Double.parseDouble(str);

                                fdJava._drawPositon4.add(d);
                            }
                        }
                    }


                    frJava._draw = fdJava;
                }

                frJavas.add(frJava);

            }

//            get_frf().finalizeFE(get_demo());

            return frJavas;

        } catch(Exception e) {
            Log.e("Exception","JNAGetFormulaResult1 error");
            e.printStackTrace();
            return null;
        }


    }

    public static ArrayList<FormulaResultJava> JNAGetFormulaResult(String formulaname, ArrayList<KLineStickJava> kdata, ArrayList<FundFlowJava> fundflowData) {

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

                FundFlowJava ff = fundflowData.get(i);
                jsonObject.put("littleIn", ff.littleIn);
                jsonObject.put("littleOut", ff.littleOut);
                jsonObject.put("mediumIn", ff.mediumIn);
                jsonObject.put("mediumOut", ff.mediumOut);
                jsonObject.put("hugeIn", ff.hugeIn);
                jsonObject.put("hugeOut", ff.hugeOut);
                jsonObject.put("largeIn", ff.largeIn);
                jsonObject.put("largeOut", ff.largeOut);
                jsonObject.put("superIn", ff.superIn);
                jsonObject.put("superOut", ff.superOut);
                jsonObject.put("total", ff.total);
                ja.put(jsonObject);
            }

            String strsticks = ja.toString();

            String FRs_json = get_frf().getFormulaResultJson(formulaname, strsticks);

            ArrayList<FormulaResultJava> frJavas = new ArrayList<FormulaResultJava>();

            JSONObject jo = new JSONObject(FRs_json);
            JSONArray frs_json = (JSONArray) jo.get("FormulaResults");
            for (int i = 0; i < frs_json.length(); ++i) {
                JSONObject fr = (JSONObject) frs_json.get(i);

                JSONObject fl,fd;
                FormulaResultJava frJava = new FormulaResultJava();

                if (fr.has("FormulaLine")) {
                    fl = fr.getJSONObject("FormulaLine");

                    FormulaLineJava flJava = new FormulaLineJava();
                    flJava._color = fl.getInt("color");
                    flJava._color2 = fl.getInt("color2");
                    flJava._name = fl.optString("name");
                    flJava._type = fl.getInt("type");
                    flJava._thick = fl.getDouble("thick");
                    flJava._nodraw = fl.getBoolean("nodraw");

                    JSONArray data_json = fl.getJSONArray("data");
                    if (data_json.length() > 0) {
                        flJava._data = new ArrayList<Double>();

                        for (int n = 0; n < data_json.length(); ++n) {
                            Object value = data_json.get(n);
                            String str = value.toString();
                            Double d = Double.parseDouble(str);
                            flJava._data.add(d);
                        }
                    }

                    frJava._line = flJava;
                }
                if (fr.has("FormulaDraw")) {
                    fd = fr.getJSONObject("FormulaDraw");

                    FormulaDrawJava fdJava = new FormulaDrawJava();
                    fdJava._text = fd.optString("text");
                    fdJava._name = fd.optString("name");
                    fdJava._type = fd.getInt("type");
                    fdJava._para1 = fd.getDouble("para1");
                    fdJava._para2 = fd.getDouble("para2");
                    fdJava._color = fd.getInt("color");
                    fdJava._color2 = fd.getInt("color2");
                    fdJava._color3 = fd.getInt("color3");
                    fdJava._color4 = fd.getInt("color4");

                    JSONArray data_json;
                    if (fd.has("drawPositon1")) {
                        data_json = fd.getJSONArray("drawPositon1");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon1 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();
                                Double d = Double.parseDouble(str);
                                fdJava._drawPositon1.add(d);
                            }
                        }
                    }

                    if (fd.has("drawPositon2")) {
                        data_json = fd.getJSONArray("drawPositon2");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon2 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();
                                Double d;
                                if(str.equals("null"))
                                    d = INVALID_DOUBLE;
                                else d = Double.parseDouble(str);

                                fdJava._drawPositon2.add(d);
                            }
                        }
                    }

                    if (fd.has("drawPositon3")) {
                        data_json = fd.getJSONArray("drawPositon3");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon3 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();

                                Double d;
                                if(str.equals("null"))
                                    d = INVALID_DOUBLE;
                                else d = Double.parseDouble(str);

                                fdJava._drawPositon3.add(d);
                            }
                        }
                    }

                    if (fd.has("drawPositon4")) {
                        data_json = fd.getJSONArray("drawPositon4");
                        if (data_json.length() > 0) {
                            fdJava._drawPositon4 = new ArrayList<Double>();

                            for (int n = 0; n < data_json.length(); ++n) {
                                Object value = data_json.get(n);
                                String str = value.toString();

                                Double d;
                                if(str.equals("null"))
                                    d = INVALID_DOUBLE;
                                else d = Double.parseDouble(str);

                                fdJava._drawPositon4.add(d);
                            }
                        }
                    }


                    frJava._draw = fdJava;
                }

                frJavas.add(frJava);

            }

//            get_frf().finalizeFE(get_demo());

            return frJavas;

        } catch(Exception e) {
            Log.e("Exception","JNAGetFormulaResult error");
            e.printStackTrace();
            return null;
        }


    }

    public void setMainFormulaName(String name) {
        if (name.isEmpty())
            return;

        this.MAINFORMULANAME = name;
        if (0 == getMainFormulaData()) {
            invalidate();//通知重绘界面
        }

    }

    public void setAssistFormulaName(String name) {
        if (name.isEmpty())
            return;

        this.ASSISTFORMULANAME = name;
        if (0 == getAssistFormulaData()) {
            invalidate();//通知重绘界面
        }

    }

    public void setSecondAssistFormulaName(String name) {
        if (name.isEmpty())
            return;

        this.ASSISTFORMULANAME2 = name;
        if (0 == getAssistFormulaData()) {
            invalidate();//通知重绘界面
        }

    }

    public void setScreenNum(int sn) {
        this._ScreenNumInView = sn;
        invalidate();//通知重绘界面
    }

    public void setDataStartPos(int startPos) {
        if (startPos < 0) return;

        this._DataStartPosInView = startPos;
//        invalidate();//通知重绘界面
        postInvalidate();
    }

    public void setLegendPos(int legendPos) {
        this._LegendPosInView = legendPos;
        invalidate();
    }

    public void setIsLandscape(String isLandscape) {
        this.isLandscape = isLandscape;
    }

    public void setFuTu(String fuTu) {
        isFirstFuTu = fuTu;
    }

    public void setTapY(int tapY) {

        if (tapY > 400) {
            if (this._assistFormulaTermCurrentIndex>=this._assistFormulaTerm.size()) {
                this._assistFormulaTermCurrentIndex = 0;
            }

            this._assistFormulaTermCurrentIndex++;
        }

    }
    public void setZoomIn() {
        //Log.i("controlKline","zoomIn--------");
        mScaleX=mScaleX/1.1f;
        if(mScaleX<getScaleXMin()){
            mScaleX=getScaleXMin();
        }
        postInvalidate();
    }
    public void setZoomOut() {
        //Log.i("controlKline","zoomOut--------");
        mScaleX=mScaleX/0.9f;
        if(mScaleX>getScaleXMax()){
            mScaleX=getScaleXMax();
        }
        postInvalidate();
    }
    public void setMoveLeft() {
       // Log.i("controlKline","setMoveLeft--------");

        if(!isLeft()) {
            mScrollX = mScrollX + Math.round(10 * mPointWidth);
        }else{
            mScrollX=getMaxScrollX();
        }
//        mStartIndex=mStartIndex+10;
//       if(mStartIndex>mItemCount-_ScreenNumInView&&mItemCount>=_ScreenNumInView) {
//           mStartIndex=mItemCount-_ScreenNumInView;
//       }
       postInvalidate();
    }
    public void setMoveRight() {
        //Log.i("controlKline","setMoveRight--------");
        if(!isRight()) {
            mScrollX = mScrollX - Math.round(10 * mPointWidth);
        }else{
            mScrollX=0;
        }
//        mStartIndex=mStartIndex-10;
//        if(mStartIndex<0) {
//            mStartIndex=0;
//        }
        postInvalidate();
    }
    GraphKLineImpl kgraph;
    Graph assistgraph;

    int contentHeight;
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        canvas.save();
//        canvas.translate(mTranslateX * mScaleX, 0);
//        canvas.scale(mScaleX, 1);


        canvas.setDensity((int)(getContext().getResources().getDisplayMetrics().density));

        int paddingLeft = getPaddingLeft();
        int paddingTop = getPaddingTop();
        int paddingRight = getPaddingRight();
        int paddingBottom = getPaddingBottom();
        int contentWidth = getWidth() - paddingLeft - paddingRight;
         contentHeight = getHeight() - paddingTop - paddingBottom - 120;
        if(this.isLandscape.equals("true")) contentHeight = getHeight() - paddingTop - paddingBottom;
        int tLeft = paddingLeft;
        int tTop = paddingTop;
        int tWidth = contentWidth;
        int tHeight = contentHeight * 1/2;
        if(this.isLandscape.equals("true"))tHeight = contentHeight * 2/3 - 25;


        if(lineGroup[0]==null)return;
        if(lineGroup[1]==null)return;
//        Log.i("kline","kline data="+_mainfrsJava.get(0)._draw._drawPositon2.size()+"        "+ new Gson().toJson(_mainfrsJava));
        mWidth=tWidth;
        calculateValue();

        kgraph = new GraphKLineImpl(canvas, lineGroup[0], tLeft, tTop, tWidth, tHeight,reactContext,getId(), this.isKeChuangStock);
        kgraph.setFormulaData(MAINFORMULANAME, _mainfrsJava,reactContext,getId(),true,null,this.isLandscape);
        kgraph._ScreenNum = this._ScreenNumInView;//屏幕显示条数
//        kgraph._DataStartPos = this._DataStartPosInView;//数据开始位置
//        kgraph._legendDataPosition = this._LegendPosInView;//十字位置
        kgraph._DataStartPos = mStartIndex;//数据开始位置
        kgraph._legendDataPosition = mSelectedIndex;//十字位置
//        Log.i("kline","kline mStartIndex="+this.mStartIndex+"        "+ this._DataStartPosInView+"       "+this._LegendPosInView);

        kgraph.draw();


//        mMainMaxValue= (float) kgraph.get_KlineMax();
//        mMainMinValue= (float) kgraph.get_KlineMin();
//        mMainScaleY = tHeight* 1f / (mMainMaxValue - mMainMinValue);

        int qLeft = paddingLeft;
        int qTop = tTop + tHeight + 60;
        if(this.isLandscape.equals("true"))qTop = tTop + tHeight + 50;
        int qWidth = tWidth;
        int qHeight = contentHeight * 1/4;
        if(this.isLandscape.equals("true"))qHeight = (contentHeight * 1/3) - 25;
        assistgraph = new KLineSubGraphImpl(canvas, lineGroup[1], qLeft, qTop, qWidth, qHeight, this.isKeChuangStock, this._period);
        assistgraph.setFormulaData(ASSISTFORMULANAME, _assistfrsJava,reactContext,getId(),false,"fuTu1",this.isLandscape);
//        assistgraph._ScreenNum = this._ScreenNumInView;
//        assistgraph._DataStartPos = this._DataStartPosInView;
//        assistgraph._legendDataPosition = this._LegendPosInView;
        assistgraph._ScreenNum = this._ScreenNumInView;//屏幕显示条数
        assistgraph._DataStartPos = mStartIndex;//数据开始位置
        assistgraph._legendDataPosition = mSelectedIndex;//十字位置
        assistgraph.draw();
        Graph assistgraph2=null;
        int qTop1=qTop+qHeight + 60;
        if(this.isLandscape.equals("false")){
            int qLeft1 = paddingLeft;
            int qWidth1 = tWidth;
            int qHeight1 = contentHeight * 1/4;

            assistgraph2 = new KLineSubGraphImpl(canvas, lineGroup[1], qLeft1, qTop1, qWidth1, qHeight1, this.isKeChuangStock, this._period);
            assistgraph2.setFormulaData(ASSISTFORMULANAME2, _assistfrsJava2,reactContext,getId(),false,"fuTu2",this.isLandscape);
//            assistgraph2._ScreenNum = this._ScreenNumInView;
//            assistgraph2._DataStartPos = this._DataStartPosInView;
//            assistgraph2._legendDataPosition = this._LegendPosInView;
            assistgraph2._ScreenNum = this._ScreenNumInView;//屏幕显示条数
            assistgraph2._DataStartPos = mStartIndex;//数据开始位置
            assistgraph2._legendDataPosition = mSelectedIndex;//十字位置
            assistgraph2.draw();
        }
        //画选择线
        if (isLongPress&&getCrossX()>0) {
//            float x = getX(mSelectedIndex);
//            Log.i("Kllinedata=","mSelectedIndex="+mSelectedIndex+"      getX(mSelectedIndex)="+getX(mSelectedIndex));

            float x =  getCrossX();
            if(x<getPaddingLeft()){
                x=getPaddingLeft();
            }
            if(x>getPaddingLeft()+tWidth){
                x=getPaddingLeft()+tWidth;
            }
            calculateSelectedX(x);
            float centerS ;
            if(mSelectedIndex==-1){
                centerS=x;
            }else{
                centerS = (float)Math.floor(kgraph.getCoord().SX(mSelectedIndex-mStartIndex + kgraph.getCoord().getRx() + 0.5f)) - 0.5f;
            }
//            Log.i("controlKline","------centerS------"+centerS);

//            float y =kgraph.getCoord().SY((float) getItemClose(mSelectedIndex));
            float y = getCrossY();
//            Log.i("controlKline","------centerS--y="+y);
            if(y<0){
                y=0;
            }
            if(this.isLandscape.equals("false")) {
                if(y>tTop + contentHeight + 120){
                    y= tTop + contentHeight + 120;
                }
            }else{
                if(y>tTop + contentHeight){
                    y= tTop + contentHeight;
                }
            }

            if(this.isLandscape.equals("false")) {
                canvas.drawLine(centerS, tTop, centerS, tTop + contentHeight + 120, mSelectedLinePaint);
            }else{
                canvas.drawLine(centerS, tTop, centerS, tTop + contentHeight, mSelectedLinePaint);
            }
            canvas.drawLine(getPaddingLeft(), y, getPaddingLeft() + mWidth, y, mSelectedLinePaint);

//            Log.i("controlKline","------centerS--max="+assistgraph.getRange().getMaxVal());

            String text="" ;
            if(0<y&&y<=tTop+tHeight){
                float ry=kgraph.getCoord().RY(y);
                if(ry>kgraph.getRange().getMaxVal()||ry<kgraph.getRange().getMinVal()){
                    return;
                }
                text=kgraph.getFormatString(kgraph.getCoord().RY(y));
            }else if(qTop<y&&y<=qTop+qHeight){
                float ry=assistgraph.getCoord().RY(y);
                if(ry>assistgraph.getRange().getMaxVal()){
                    return;
                }
                text=kgraph.getFormatString(ry);
            }else if(qTop1<y&&y<=qTop1+qHeight){
                if(this.isLandscape.equals("false")) {
                    float ry=assistgraph2.getCoord().RY(y);
                    if(ry>assistgraph2.getRange().getMaxVal()){
                        return;
                    }
                    text = kgraph.getFormatString(ry);

                }
            }else{
                return;
            }
            mSelectPointPaint.setColor(Config.borderColor);
            mSelectorFramePaint.setColor(Config.gridLineColor);
            mTextPaint.setColor(Config.scaleColor);
            mTextPaint.setTextSize(Config.scaleFontSize);
            float w1 = 5;
            float w2 = 3;
            float textWidth = mTextPaint.measureText(text);
            Paint.FontMetrics fm = mTextPaint.getFontMetrics();
            float textHeight = fm.descent - fm.ascent;
            float r = textHeight / 2 + w2;
            int hx = 1;
            Path path = new Path();
            path.moveTo(hx, y - r);
            path.lineTo(hx, y + r);
            path.lineTo(textWidth + 2 * w1, y + r);
            path.lineTo(textWidth + 2 * w1 + w2, y);
            path.lineTo(textWidth + 2 * w1, y - r);
            path.close();
            canvas.drawPath(path, mSelectPointPaint);
            canvas.drawPath(path, mSelectorFramePaint);
            canvas.drawText(text, hx + w1, fixTextY1(y), mTextPaint);
        }
       // Log.i("controlKline","------freshTime------"+Config.freshTime);
        if(isTouch()&&mSelectedIndex>=0){
            if(reactContext != null&&(Config.freshTime==0L||System.currentTimeMillis()-Config.freshTime>100)){

                Object dateObject=getItemDate(mSelectedIndex);
                if(!dateObject.equals("")) {
                    String Date = format.format((Date) getItemDate(mSelectedIndex));
                   // Log.i("controlKline", "------Date------" + Date.toString());
                    WritableMap event = Arguments.createMap();
                    event.putString("time", Date);
                    event.putInt("selected", mSelectedIndex);
                    reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                            getId(),//native和js两个视图会依据getId()而关联在一起
                            "sendTimeForKLine",//事件名称
                            event
                    );
                }
                Config.freshTime=System.currentTimeMillis();

            }
        }

        //还原 平移缩放
        canvas.restore();
    }
    /**
     * 解决text居中的问题
     */
    public float fixTextY1(float y) {
        Paint.FontMetrics fontMetrics = mTextPaint.getFontMetrics();
        return (y + (fontMetrics.descent - fontMetrics.ascent) / 2 - fontMetrics.descent);
    }
    private void init(AttributeSet attrs, int defStyle) {

        lineGroup = new LineGroup[2];
        Config.init(this.getResources());
        _assistFormulaTermCurrentIndex = 0;
//        mDetector = new GestureDetectorCompat(getContext(), this);
//        mScaleDetector = new ScaleGestureDetector(getContext(), this);
        initData();
    }

    private void setIsKeChuangStock(String code) {
        this.isKeChuangStock = (code.indexOf("SH688") != -1);
    }

    private void initData(){
        mAnimator = ValueAnimator.ofFloat(0f, 1f);
        mAnimator.setDuration(mAnimationDuration);
        mAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
//                invalidate();
            }
        });

    }
    /**
     * 数据是否充满屏幕
     *
     * @return
     */
    public boolean isFullScreen() {
        return mDataLen >= mWidth / mScaleX;
    }
    /**
     * 重新计算并刷新线条
     */
    public void notifyChanged() {
        if (mItemCount != 0) {
            mDataLen = (mItemCount - 1) * mPointWidth;
            checkAndFixScrollX();
            setTranslateXFromScrollX(mScrollX);
        } else {
            setScrollX(0);
        }
        invalidate();
    }
    /**
     * 设置选择监听
     */
//    public void setOnSelectedChangedListener(OnSelectedChangedListener l) {
//        this.mOnSelectedChangedListener = l;
//    }

//    public void onSelectedChanged(BaseKChartView view, Object point, int index) {
//        if (this.mOnSelectedChangedListener != null) {
//            mOnSelectedChangedListener.onSelectedChanged(view, point, index);
//        }
//    }
    @Override
    public void onLongPress(MotionEvent e) {
        super.onLongPress(e);
        int lastIndex = mSelectedIndex;
        calculateSelectedX(getCrossX());
        if (lastIndex != mSelectedIndex) {
//            onSelectedChanged(this, getItem(mSelectedIndex), mSelectedIndex);
        }
        if(Config.freshCanvas==0||System.currentTimeMillis()-Config.freshCanvas>30){
            invalidate();
            Config.freshCanvas=System.currentTimeMillis();
        }

    }
    @Override
    public boolean onSingleTapUp(MotionEvent e) {
        Log.i("controlKline","------onSingleTapUp------");
        WritableMap event = Arguments.createMap();
        if(!isLongPress) {
            if (this.isLandscape.equals("false")) {
                if (e.getY() > contentHeight * 1 / 2 + 60 && e.getY() < contentHeight * 3 / 4 + 60) {
                    Config.freshFutu = 0;
                    Config.freshRate=0;
                    event.putInt("futu", 1);

                } else if (e.getY() > contentHeight * 3 / 4 + 60 && e.getY() < contentHeight + 120) {
                    Config.freshFutu = 0;
                    Config.freshRate=0;
                    event.putInt("futu", 2);
                } else {
                    event.putInt("futu", -1);
                }
            } else {
                if (e.getY() > contentHeight * 2 / 3 - 25 && e.getY() < contentHeight) {
                    Config.freshFutu = 0;
                    Config.freshRate=0;
                    event.putInt("futu", 1);
                } else {
                    event.putInt("futu", -1);
                }

            }
        }else{

            isLongPress=false;
        }

        event.putString("time","");
        event.putInt("selected",-1);

        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),//native和js两个视图会依据getId()而关联在一起
                "sendTimeForKLine",//事件名称
                event
        );
        postDelayed(new Runnable() {
            @Override
            public void run() {
                invalidate();
            }
        },100);

        return false;

    }

    @Override
    protected void onScrollChanged(int l, int t, int oldl, int oldt) {
        super.onScrollChanged(l, t, oldl, oldt);
        setTranslateXFromScrollX(mScrollX);
        Log.i("klineScroll","mScrollX="+this.mScrollX+"        "+ l+"       "+oldl);

    }
    @Override
    protected void onScaleChanged(float scale, float oldScale) {
        checkAndFixScrollX();
        setTranslateXFromScrollX(mScrollX);
//        calculateStartIndex(scale);
        super.onScaleChanged(scale, oldScale);
    }

    /**
     * 计算当前的显示区域
     */
    private void calculateValue() {
        if (!isLongPress) {
            mSelectedIndex = -1;
        }
        _ScreenNumInView=(int)(DEFAULT_K_COUNT/mScaleX);
//        Log.i("Kllinedata=","mScaleX="+mScaleX+"    _ScreenNumInView="+_ScreenNumInView);
        mPointWidth=mWidth/_ScreenNumInView;
        if(null!= lineGroup[0]) {
            mDataLen = (lineGroup[0].data(0).getRows()-1 ) * mPointWidth;
            mItemCount = lineGroup[0].data(0).getRows();
        }
        if(mScaleX<=0f){
            mScaleX=1f;
        }


//        Log.i("Kllinedata=","mDataLen="+mDataLen+"    mItemCount="+mItemCount);
//        mMainMaxValue = Float.MIN_VALUE;
//        mMainMinValue = Float.MAX_VALUE;
//        mChildMaxValue = Float.MIN_VALUE;
//        mChildMinValue = Float.MAX_VALUE;
//        mStartIndex = indexOfTranslateX(xToTranslateX(0));
//        mStopIndex = indexOfTranslateX(xToTranslateX(mWidth));
        mStartIndex = translateStart();
//        if(mStartIndex==0){
//            isLeft=true;
//        }else if(mStartIndex==mItemCount-_ScreenNumInView){
//            isRight=true;
//        }else{
//            isLeft=false;
//            isRight=false;
//        }
//        if(mStartIndex+_ScreenNumInView<mItemCount) {
//            mStopIndex = mStartIndex + _ScreenNumInView;
//        }else{
//            mStopIndex=mItemCount-1;
//        }
//        if(mStopIndex>mItemCount-_ScreenNumInView){
//            mStopIndex=mItemCount-_ScreenNumInView;
//        }


        Log.i("Kllinedata=","mStartIndex="+mStartIndex+"    mStopIndex="+mStopIndex);
//        for (int i = mStartIndex; i <= mStopIndex; i++) {
//            Row point = getItem(i);
//            if (mMainDraw != null) {
//                mMainMaxValue = Math.max(mMainMaxValue, mMainDraw.getMaxValue(point));
//                mMainMinValue = Math.min(mMainMinValue, mMainDraw.getMinValue(point));
//            }
//            if (mChildDraw != null) {
//                mChildMaxValue = Math.max(mChildMaxValue, mChildDraw.getMaxValue(point));
//                mChildMinValue = Math.min(mChildMinValue, mChildDraw.getMinValue(point));
//            }
//        }
//        if(mMainMaxValue!=mMainMinValue) {
//            float padding = (mMainMaxValue - mMainMinValue) * 0.05f;
//            mMainMaxValue += padding;
//            mMainMinValue -= padding;
//        } else {
//            //当最大值和最小值都相等的时候 分别增大最大值和 减小最小值
//            mMainMaxValue += Math.abs(mMainMaxValue*0.05f);
//            mMainMinValue -= Math.abs(mMainMinValue*0.05f);
//            if (mMainMaxValue == 0) {
//                mMainMaxValue = 1;
//            }
//        }
//
//        if (mChildMaxValue == mChildMinValue) {
//            //当最大值和最小值都相等的时候 分别增大最大值和 减小最小值
//            mChildMaxValue += Math.abs(mChildMaxValue*0.05f);
//            mChildMinValue -= Math.abs(mChildMinValue*0.05f);
//            if (mChildMaxValue == 0) {
//                mChildMaxValue = 1;
//            }
//        }

//        mMainScaleY = mMainRect.height() * 1f / (mMainMaxValue - mMainMinValue);
//        mChildScaleY = mChildRect.height() * 1f / (mChildMaxValue - mChildMinValue);
//        if (mAnimator.isRunning()) {
//            float value = (float) mAnimator.getAnimatedValue();
//            mStopIndex = mStartIndex + Math.round(value * (mStopIndex - mStartIndex));
//        }
    }
    private int translateStart(){
        int start=mItemCount-_ScreenNumInView-Math.round(mScrollX/mPointWidth);
        if(start<0){
            start=0;
        }
        return start;
    }
    private void calculateSelectedX(float x){
        if(mItemCount<_ScreenNumInView){
            mSelectedIndex=Math.round((x-getPaddingLeft())/mPointWidth);
            if(mSelectedIndex>=mItemCount) {
                mSelectedIndex = -1;
            }
        }else{
            mSelectedIndex=mItemCount-Math.round(mScrollX/mPointWidth)-Math.round((mWidth-x-getPaddingLeft())/mPointWidth);

            if(mSelectedIndex<0){
                mSelectedIndex=0;
            }
            if(mSelectedIndex>=mItemCount){
                mSelectedIndex=mItemCount-1;
            }
        }
        Log.i("Kllinedata=","mSelectedIndex="+mSelectedIndex+"      x="+x);

    }
//    private void calculateSelectedX(float x) {
//        mSelectedIndex = indexOfTranslateX(xToTranslateX(x));
//        if (mSelectedIndex < mStartIndex) {
//            mSelectedIndex = mStartIndex;
//        }
//        if (mSelectedIndex > mStopIndex) {
//            mSelectedIndex = mStopIndex;
//        }
//
//    }
    /**
     * view中的x转化为TranslateX
     * @param x
     * @return
     */
    public float xToTranslateX(float x) {
        return -mTranslateX + x / mScaleX;
    }

    /**
     * translateX转化为view中的x
     * @param translateX
     * @return
     */
    public float translateXtoX(float translateX) {
        return (translateX + mTranslateX) * mScaleX;
    }

    /**
     * scrollX 转换为 TranslateX
     * @param scrollX
     */
    private void setTranslateXFromScrollX(int scrollX) {
        mTranslateX = scrollX + getMinTranslateX();
    }
    /**
     * 获取平移的最小值
     * @return
     */
    private float getMinTranslateX() {
        Log.i("Kllinedata=","getMinTranslateX="+(-mDataLen + mWidth / mScaleX - mPointWidth / 2));
        return (-mDataLen-mPointWidth + mWidth)/ mScaleX - mPointWidth / 2;
//        return -(mDataLen+mPointWidth-mWidth)/mScaleX;
    }

    /**
     * 获取平移的最大值
     * @return
     */
    private float getMaxTranslateX() {
        if (!isFullScreen()) {
            Log.i("Kllinedata=","getMaxTranslateX="+getMinTranslateX());
            return getMinTranslateX();
        }
        Log.i("Kllinedata=","getMaxTranslateX="+(mPointWidth / 2));
        return mPointWidth / 2;
    }

    @Override
    public int getMinScrollX() {
        return (int) -(mOverScrollRange / mScaleX);

    }

    public int getMaxScrollX() {
        Log.i("Kllinedata=","getMaxScrollX="+Math.round(getMaxTranslateX() - getMinTranslateX())+"         "+(mDataLen-mWidth));
//        return Math.round(getMaxTranslateX() - getMinTranslateX());
//        return Math.round((mItemCount*mPointWidth+getPaddingLeft()+getPaddingRight()-mWidth)*mScaleX);
        return Math.round((mItemCount+1)*mPointWidth+getPaddingLeft()+getPaddingRight()-mWidth+mPointWidth/2);

    }

    public boolean isLeft(){
        if(mStartIndex<=0){
            return true;
        }
        return false;
    }
    private boolean isRight(){
        if(mStartIndex>=mItemCount-_ScreenNumInView||mItemCount<DEFAULT_K_COUNT){
            return true;
        }
        return false;
    }

//    public int indexOfTranslateX(float translateX) {
//        return indexOfTranslateX(translateX, 0, mItemCount - 1);
//    }
    /**
     * 根据索引获取实体
     * @param position 索引值
     * @return
     */
    public Row getItem(int position) {
        if (lineGroup[0] != null) {
            return lineGroup[0].data(0).getRow(position);
        } else {
            return null;
        }
    }
    public float getItemClose(int position) {
        if (lineGroup[0] != null&&position!=-1) {
            Log.i("Kllinedata=","position="+position+"    getItemClose="+lineGroup[0].data(0).getValue(position,4));

            return ((Double)lineGroup[0].data(0).getValue(position,4)).floatValue();
        } else {
            return -1;
        }
    }
    public Object getItemDate(int position) {
        if (lineGroup[0] != null&&position!=-1) {
            Log.i("Kllinedata=","position="+position+"    getItemClose="+lineGroup[0].data(0).getValue(position,0));

            return lineGroup[0].data(0).getValue(position,0);
        } else {
            return "";
        }
    }
    /**
     * 根据索引索取x坐标
     * @param position 索引值
     * @return
     */
    public float getX(int position) {
        Log.i("Kllinedata=","getX="+position * mPointWidth);
        return position * mPointWidth;
//        return getCrossX();
    }
//    public float getMainY(float value) {
//        return (mMainMaxValue - value) * mMainScaleY+getPaddingTop()+getTop();
//    }
    /**
     * 二分查找当前值的index
     * @return
     */
//    public int indexOfTranslateX(float translateX, int start, int end) {
//        if (end == start) {
//            return start;
//        }
////        Log.i("Kllinedata=","Kllinedata="+start+"     "+end);
//        if (end - start == 1) {
//            float startValue = getX(start);
//            float endValue = getX(end);
//            return Math.abs(translateX - startValue) < Math.abs(translateX - endValue) ? start : end;
//        }
//        int mid = start + (end - start) / 2;
//        float midValue = getX(mid);
//        if (translateX < midValue) {
//            return indexOfTranslateX(translateX, start, mid);
//        } else if (translateX > midValue) {
//            return indexOfTranslateX(translateX, mid, end);
//        } else {
//            return mid;
//        }
//    }
    /**
     * 开始动画
     */
    public void startAnimation() {
        if (mAnimator != null) {
            mAnimator.start();
        }
    }
}

