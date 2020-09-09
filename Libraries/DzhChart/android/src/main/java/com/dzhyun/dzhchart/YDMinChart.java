package com.dzhyun.dzhchart;

import android.annotation.TargetApi;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.os.Build;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.sun.jna.Native;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import sadcup.android.jnaonas.FormulaDrawJava;
import sadcup.android.jnaonas.FormulaLineJava;
import sadcup.android.jnaonas.FormulaResultJava;
import sadcup.android.jnaonas.KLineStickJava;
import sadcup.android.jnaonas.MinStickJava;


public class YDMinChart extends YDKChartBase {

    private LineGroup lineGroup[];
    private float _priceZuoShou = 0;
    private int _LegendPosInView = -1;
    private int _isStopTradingInView = 0;
    ReactContext reactContext = (ReactContext) getContext();
    private boolean isKeChuangStock = false;
    private double circulateEquityA = 0;

    private String MAINFORMULANAME = "分时走势";
    private String ASSISTFORMULANAME = "成交量";
    private ArrayList<FormulaResultJava> _mainfrsJava;
    private ArrayList<FormulaResultJava> _assistfrsJava;
    private ArrayList<MinStickJava> _sticks = new ArrayList<MinStickJava>();
    private Paint mSelectedLinePaint=new Paint(Paint.ANTI_ALIAS_FLAG);
    private Paint mTextPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private Paint mSelectPointPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private Paint mSelectorFramePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    SimpleDateFormat format = new SimpleDateFormat("HH:mm");
    private int mSelectedIndex;
    private int itemCount=0;
    public YDMinChart(Context context) {
        super(context);
        init(null, 0);
    }

    public YDMinChart(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(attrs, 0);
    }

    public YDMinChart(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(attrs,defStyleAttr);
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public YDMinChart(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(attrs, defStyleAttr);
    }

    public void setLegendPos(int legendPos) {
        this._LegendPosInView = legendPos;
        invalidate();
    }

    @Override
    public boolean onSingleTapUp(MotionEvent e) {
        isLongPress=false;
        invalidate();
        return false;

    }

    @Override
    public void onLongPress(MotionEvent e) {
        super.onLongPress(e);
        int lastIndex = mSelectedIndex;
        if (lastIndex != mSelectedIndex) {
//            onSelectedChanged(this, getItem(mSelectedIndex), mSelectedIndex);
        }

        if(Config.freshCanvas==0||System.currentTimeMillis()-Config.freshCanvas>30){
            invalidate();
            Config.freshCanvas=System.currentTimeMillis();
        }
    }
    public synchronized void drawDzhChart(String json){

        try {
            JSONObject data = new JSONObject(json);
            String type = data.optString("chartType");
            JSONObject stkobj = data.getJSONObject("stkInfo");
            String name = stkobj.optString("MingCheng");
            String obj = stkobj.optString("Obj");
            setIsKeChuangStock(obj);

            double circulateEquityA = 0;
            if (stkobj.has("CirculateEquityA")) {
                circulateEquityA = stkobj.getDouble("CirculateEquityA");
            }
            setCirculateEquityA(circulateEquityA);
//            this._isStopTradingInView = stkobj.getInt("ShiFouTingPai");
            //stkInfo.setName(name);
            //stkInfo.setObj(obj);

            JSONObject color = data.getJSONObject("color");
            String riseColor = color.optString("ShangZhangYanSe");
            String dropColor = color.optString("XiaDieYanSe");
            String bgColor = color.optString("BeiJingYanSe");
            Config.riseColor = Color.parseColor(riseColor);
            Config.dropColor = Color.parseColor(dropColor);
            Config.bgColor = Color.parseColor(bgColor);

            TableData datas;
            TableData qtyDatas;
            String schame;
            JSONArray datasarr = data.getJSONArray("chartData");

            TableData tradeTimeSectionDatas;
            schame = "KaiShiShiJian;JieShuShiJian;KaiShiRiQi;JieShuRiQi";
            tradeTimeSectionDatas = new TableData(schame);
            JSONArray tradeTimeSection = data.getJSONArray("JYShiJianDuan");
            for(int i=0; i<tradeTimeSection.length(); i++) {
                JSONObject o = tradeTimeSection.getJSONObject(i);
                String KaiShiShiJian = o.optString("KaiShiShiJian");
                String JieShuShiJian = o.optString("JieShuShiJian");
                String KaiShiRiQi = o.optString("KaiShiRiQi");
                String JieShuRiQi = o.optString("JieShuRiQi");
                tradeTimeSectionDatas.addRow(new Row(KaiShiShiJian,JieShuShiJian,KaiShiRiQi,JieShuRiQi));
            }

            double zuoShou = 0;
            if (stkobj.has("ZuoShou")) {
                zuoShou = stkobj.getDouble("ZuoShou");
            }

            _priceZuoShou = (float)zuoShou;
            schame = "ChengJiaoJia;JunJia";
            datas = new TableData(schame);
            schame = "ChengJiaoLiang;ZhangDie;littleIn;littleOut;mediumIn;mediumOut;hugeIn;hugeOut;largeIn;largeOut;superIn;superOut;total";
            qtyDatas = new TableData(schame);
            double lastPrice = zuoShou;

            //start 输入公式引擎计算的数据
            _sticks.clear();
            //end

            long time=0;
            int dataSize = datasarr.length();
            itemCount=dataSize;
            for(int i = 0; i < dataSize; i++){
                JSONObject o = datasarr.getJSONObject(i);
                time = o.optLong("ShiJian");
                Date date = new Date(time*1000);

                int tradeType = o.optInt("TradeType");
                double price = o.optDouble("ChengJiaoJia");
                double avgPrice = o.optDouble("JunJia");
                double qty = o.optDouble("ChengJiaoLiang");
                double amount = o.optDouble("ChengJiaoE");

                // 资金流入流出数据
                long littleIn = o.optLong("littleIn");
                long littleOut = o.optLong("littleOut");
                long mediumIn = o.optLong("mediumIn");
                long mediumOut = o.optLong("mediumOut");
                long hugeIn = o.optLong("hugeIn");
                long hugeOut = o.optLong("hugeOut");
                long largeIn = o.optLong("largeIn");
                long largeOut = o.optLong("largeOut");
                long superIn = o.optLong("superIn");
                long superOut = o.optLong("superOut");
                long total = o.optLong("total");

                if(Double.isNaN(price) || Double.isNaN(avgPrice)){
                    datas.addRow(new Row(date, null, null, null));
                    qtyDatas.addRow(new Row(null, false, null,
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
                }else{

                    datas.addRow(new Row(date, price, avgPrice, tradeType));
                    boolean zhangDie = price >= lastPrice ? true: false;
                    qtyDatas.addRow(new Row(qty/100, zhangDie, tradeType,
                            littleIn, littleOut, mediumIn, mediumOut, hugeIn, hugeOut, largeIn, largeOut, superIn, superOut, total));
                    lastPrice = price;
                }

                //start 输入公式引擎计算的数据
                MinStickJava oneStick = new MinStickJava();
                oneStick.time = time;
                oneStick.price = price;
                oneStick.avgprice = avgPrice;
                oneStick.volume = qty;
                oneStick.amount = amount;
                _sticks.add(oneStick);
                //end
            }


            schame = "type;data;name;obj;section";
            TableData datasg = new TableData(schame);
            datasg.addRow(new Row(type, datas, name, obj, tradeTimeSectionDatas));
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

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        int paddingLeft = getPaddingLeft();
        int paddingTop = getPaddingTop();
        int paddingRight = getPaddingRight();
        int paddingBottom = getPaddingBottom();
//        int paddingLeft = 10;
//        int paddingRight =10;
        int contentWidth = getWidth() - paddingLeft - paddingRight;
        int contentHeight = getHeight() - paddingTop - paddingBottom;

        int tLeft = paddingLeft;
        int tTop = paddingTop;
        int tWidth = contentWidth;
        int tHeight = (contentHeight * 2/3);

        Graph  minGraph = new GraphMinImpl(
                canvas,
                lineGroup[0],
                _priceZuoShou,
                tLeft, tTop, tWidth, tHeight,
                reactContext,getId(),
                this.isKeChuangStock,
                this.circulateEquityA
        );
        if(MAINFORMULANAME.equals("分时冲关")){
            getMainFormulaData();
        }
        if(ASSISTFORMULANAME.equals("资金流入")){
            getAssistFormulaData();
        }


        minGraph.setFormulaData(MAINFORMULANAME, _mainfrsJava, reactContext);
        minGraph._legendDataPositionForMin = this.mSelectedIndex;
        minGraph._isStopTrading = this._isStopTradingInView;
        minGraph.draw();

        int qLeft = paddingLeft;
        int qTop = tTop + tHeight;
        int qWidth = tWidth;
        float qHeight = contentHeight - tHeight + Config.LegendHeight;
        Graph graph = new MinSubGraphImpl(canvas, lineGroup[1], qLeft, qTop, qWidth, qHeight, this.isKeChuangStock);
        graph.setFormulaData(ASSISTFORMULANAME, _assistfrsJava, reactContext);
        graph._legendDataPositionForMin = this.mSelectedIndex;
        graph.draw();
        if (isLongPress&&getCrossX()>0) {
            float x =  getCrossX() ;
            if(x<getPaddingLeft()){
                x=getPaddingLeft();
            }
            if(x>getPaddingLeft()+tWidth){
                x=getPaddingLeft()+tWidth;
            }
            calculateSelectedX(x,tWidth);
//            float y= getPriceY(minGraph);
            float y=getCrossY();
            if(y<0){
                y=0;
            }else if(y>=tTop + contentHeight + Config.LegendHeight){
                y=tTop + contentHeight + Config.LegendHeight;
            }
            canvas.drawLine(x, tTop, x, tTop + contentHeight + Config.LegendHeight, mSelectedLinePaint);
            canvas.drawLine(getPaddingLeft(), y, getPaddingLeft() + tWidth, y, mSelectedLinePaint);

            String text="" ;
            if(0<y&&y<=tTop+tHeight){
                text=minGraph.getFormatString(minGraph.getCoord().RY(y));
            }else if(qTop+Config.LegendHeight<y&&y<=qTop+qHeight+ Config.LegendHeight){
                text=graph.getFormatString(graph.getCoord().RY(y));
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
        if(reactContext != null) {
            if(Config.freshTime==0L||System.currentTimeMillis()-Config.freshTime>100){
                if(isLongPress) {
                   // Log.i("controlKline","------mSelectedIndex------"+mSelectedIndex);
                    if (lineGroup[0] != null && lineGroup[0].data(0) != null &&lineGroup[0].data(0).getRows()>0&& mSelectedIndex < itemCount) {
//                    if (lineGroup[0] != null && lineGroup[0].data(0) != null && mSelectedIndex < lineGroup[0].data(0).getRows()) {

                        Object chengJiaoObj = lineGroup[0].data(0).getValue(mSelectedIndex, 1);
                        Object junJiaObj =lineGroup[0].data(0).getValue(mSelectedIndex, 2);
                        if(chengJiaoObj!= null && junJiaObj != null) {
                            double chengJiaoJia = (double) chengJiaoObj;
                            double junJia = (double) junJiaObj;

                            WritableMap event = Arguments.createMap();
                            event.putString("shijian", format.format((Date) lineGroup[0].data(0).getValue(mSelectedIndex, 0)));
                            event.putDouble("chengjiaojia", chengJiaoJia);
                            event.putDouble("junjia", junJia);
                            event.putDouble("zuoshou", _priceZuoShou);
                            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                                    getId(),//native和js两个视图会依据getId()而关联在一起
                                    "sendData",//事件名称
                                    event
                            );
                        }else{
                            WritableMap event = Arguments.createMap();
                            event.putString("shijian", "--");
                            event.putDouble("chengjiaojia", -1);
                            event.putDouble("junjia", -1);
                            event.putDouble("zuoshou", _priceZuoShou);
                            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                                    getId(),//native和js两个视图会依据getId()而关联在一起
                                    "sendData",//事件名称
                                    event
                            );
                        }
                    }
                }else{
                    if (lineGroup[0] != null && lineGroup[0].data(0) != null&&lineGroup[0].data(0).getRows()>0 && 0 < itemCount&&Config.minNum >=0) {
                       // Log.i("controlKline","------itemCount------"+itemCount);
                        Object chengJiaoObj = lineGroup[0].data(0).getValue( Config.minNum, 1);
                        Object junJiaObj =lineGroup[0].data(0).getValue( Config.minNum, 2);
                        if(chengJiaoObj != null && junJiaObj != null) {
                            double chengJiaoJia = (double) chengJiaoObj;
                            double junJia = (double) junJiaObj;

                            WritableMap event = Arguments.createMap();
                            event.putString("shijian", format.format((Date) lineGroup[0].data(0).getValue( Config.minNum, 0)));
                            event.putDouble("chengjiaojia", chengJiaoJia);
                            event.putDouble("junjia", junJia);
                            event.putDouble("zuoshou", _priceZuoShou);
                            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                                    getId(),//native和js两个视图会依据getId()而关联在一起
                                    "sendData",//事件名称
                                    event
                            );
                        }
                    }
                }
                Config.freshTime=System.currentTimeMillis();
            }
        }
    }
    /**
     * 解决text居中的问题
     */
    public float fixTextY1(float y) {
        Paint.FontMetrics fontMetrics = mTextPaint.getFontMetrics();
        return (y + (fontMetrics.descent - fontMetrics.ascent) / 2 - fontMetrics.descent);
    }
    private  void calculateSelectedX(float x,float width){
        float pointWidth=width/240;
        mSelectedIndex=Math.round(x/pointWidth);
//        Log.i("minchart","mSelectedIndex==="+mSelectedIndex);
    }

    private float getPriceY(Graph  minGraph){
        float y=getCrossY();
        if(lineGroup[0]!=null&&lineGroup[0].data(0)!=null&&mSelectedIndex<itemCount){
            Object chengJiaoObj = lineGroup[0].data(0).getValue(mSelectedIndex, 1);
            if(chengJiaoObj!=null) {
                double price = (double) chengJiaoObj;
                y = minGraph.getCoord().SY((float) price);
            }
        }
//        Log.i("minchart","y==="+y);

        return y;
   }
   private void init(AttributeSet attrs, int defStyle) {
        setScaleEnable(false);
        setScrollEnable(false);
        lineGroup = new LineGroup[2];
        Config.init(this.getResources());

    }

    private void setIsKeChuangStock(String code) {

        this.isKeChuangStock = (code.indexOf("SH688") != -1);

    }

    private void setCirculateEquityA(double val) {

        this.circulateEquityA = val;

    }

    private ArrayList<FormulaResultJava> getMainFormulaResult(String formulaname, ArrayList<MinStickJava> mindata) {

        try {
            JSONObject allData = new JSONObject();

            JSONArray ja = new JSONArray();
            for(int i = 0;i < mindata.size();i++){
                MinStickJava tmp = mindata.get(i);

                if (Double.isNaN(tmp.price) || Double.isNaN(tmp.avgprice) || Double.isNaN(tmp.volume) || Double.isNaN(tmp.amount))
                    break;

                JSONObject jsonObject = new JSONObject();
                jsonObject.put("time", tmp.time);
                jsonObject.put("price", tmp.price);
                jsonObject.put("avgprice", tmp.avgprice);
                jsonObject.put("volume", tmp.volume);
                jsonObject.put("amount", tmp.amount);
                ja.put(jsonObject);
            }
            JSONObject other = new JSONObject();
            other.put("circulateEquityA",this.circulateEquityA);
            other.put("preClose",this._priceZuoShou);


            allData.put("minData",ja);
            allData.put("otherData", other);

            String strSticks = allData.toString();
            return JNAGetFormulaResult(formulaname, strSticks);

        }
        catch(Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private ArrayList<FormulaResultJava> getAssistFormulaResult(String formulaname, ArrayList<MinStickJava> mindata) {

        return this.getMainFormulaResult(formulaname, mindata);

    }

    private ArrayList<FormulaResultJava> getZJLRData() {

        ArrayList<FormulaResultJava> data = new ArrayList<FormulaResultJava>();

//        {
//            FormulaLineJava superFL = new FormulaLineJava();
//            superFL._name = "超大单";
//            superFL._color = 0xFF0000;
//            superFL._thick = 2.0;
//            superFL._data = getFundFlowData(3);
//            FormulaResultJava superData = new FormulaResultJava();
//            superData._line = superFL;
//            data.add(superData);
//        }
        {
            FormulaLineJava LargeFL = new FormulaLineJava();
            LargeFL._name = "大单";
            LargeFL._color = 0xFF33CC;
            LargeFL._thick = 2.0;
            LargeFL._data = getFundFlowData(2);
            FormulaResultJava large = new FormulaResultJava();
            large._line = LargeFL;
            data.add(large);
        }
        {
            FormulaLineJava MedFL = new FormulaLineJava();
            MedFL._name = "中单";
            MedFL._color = 0xFF9933;
            MedFL._thick = 2.0;
            MedFL._data = getFundFlowData(1);
            FormulaResultJava med = new FormulaResultJava();
            med._line = MedFL;
            data.add(med);
        }
        {
            FormulaLineJava littleFL = new FormulaLineJava();
            littleFL._name = "小单";
            littleFL._color = 0x3399FF;
            littleFL._thick = 2.0;
            littleFL._data = getFundFlowData(0);
            FormulaResultJava little = new FormulaResultJava();
            little._line = littleFL;
            data.add(little);
        }

        return data;
    }

    public static ArrayList<FormulaResultJava> JNAGetFormulaResult(String formulaname, String strSticks) {

        try {
            Double INVALID_DOUBLE = -1.797693E308;

            String FRs_json = get_frf().getFormulaResultJson4Min(formulaname, strSticks);

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

    public synchronized int getMainFormulaData() {
        if (_sticks.isEmpty())
            return 1;

        _mainfrsJava = getMainFormulaResult(MAINFORMULANAME, _sticks);
        return 0;
    }

    public synchronized int getAssistFormulaData() {
        if (_sticks.isEmpty())
            return 1;


        if (ASSISTFORMULANAME.equals("资金流入")) {
            _assistfrsJava = this.getZJLRData();
            return 0;
        }

        _assistfrsJava = getAssistFormulaResult(ASSISTFORMULANAME, _sticks);
        return 0;
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

    // 获取资金流入流出数据，0小单，1中单，2大单
    private ArrayList<Double> getFundFlowData(int flag) {

        ArrayList<Double> data = new ArrayList<Double>();

        if (lineGroup.length < 2)
            return data;

        TableData datas = lineGroup[1].data(0);
        if (datas.getRows() == 0)
            return data;


        switch (flag) {

            case 0:
                getLittleFundFlowData(data);
                break;
            case 1:
                getMedFundFlowData(data);
                break;
            case 2:
                getLargeFundFlowData(data);
                break;
             case 3:
                getSuperFundFlowData(data);
                break;

            default:
                break;

        }

        return data;

    }

    private double Object2double(Object obj) {
        try {
            Double d = Double.parseDouble(obj.toString());
            return d==null ? 0:d;
        }catch (Exception e){
            Log.e("Exception","Object2double error");
        }
        return 0;

    }

    private void getLittleFundFlowData(ArrayList<Double> data) {
        TableData datas = lineGroup[1].data(0);
        for (int i = 0; i < datas.getRows(); i++) {
            Object inObj = datas.getValue(i, 3);
            Object outObj = datas.getValue(i, 4);
            double in = Object2double(inObj);
            double out = Object2double(outObj);
            data.add(in-out);
        }
    }

    private void getMedFundFlowData(ArrayList<Double> data) {
        TableData datas = lineGroup[1].data(0);
        for (int i = 0; i < datas.getRows(); i++) {
            Object inObj = datas.getValue(i, 5);
            Object outObj = datas.getValue(i, 6);
            double in = Object2double(inObj);
            double out = Object2double(outObj);
            data.add(in-out);
        }
    }

    private void getLargeFundFlowData(ArrayList<Double> data) {
        TableData datas = lineGroup[1].data(0);
        for (int i = 0; i < datas.getRows(); i++) {
            Object superInObj = datas.getValue(i, 11);
            Object superOutObj = datas.getValue(i, 12);
            Object largeInObj = datas.getValue(i, 9);
            Object largeOutObj = datas.getValue(i, 10);
            double result =  Object2double(largeInObj)+Object2double(superInObj) - ( Object2double(largeOutObj)+Object2double(superOutObj)) ;
            data.add(result);
        }
    }
    private void getSuperFundFlowData(ArrayList<Double> data) {
        TableData datas = lineGroup[1].data(0);
        for (int i = 0; i < datas.getRows(); i++) {
            Object superInObj = datas.getValue(i, 11);
            Object superOutObj = datas.getValue(i, 12);
            Object largeInObj = datas.getValue(i, 9);
            Object largeOutObj = datas.getValue(i, 10);
            double result = Object2double(superInObj) - Object2double(superOutObj) ;
            data.add(result);
        }
    }
}

