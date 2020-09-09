package com.dzhyun.dzhchart;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PathEffect;
import android.graphics.Typeface;
import android.text.TextUtils;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;

import sadcup.android.jnaonas.FormulaResultJava;

/**
 * Created by Administrator on 2015/11/14.
 */
public abstract class Graph {
    private Canvas canvas;
    private Coord coord;
    private LineGroup lines;
    private Axis axis;
    private LineRange range;

    private float left;
    private float top;
    private float height;
    private float width;

    private int gridRowNum;
    private boolean showAxisDate;

    protected int _ScreenNum = 60;
    protected int _DataStartPos = -1;
    protected int DEFAULTALPHA = 255;//opaque
    public String _formulaname;
    protected String isLandscape;
    protected ArrayList<FormulaResultJava> _frsJava;
    protected Double INVALID_DOUBLE = -1.797693E308;

    protected int _legendDataPosition = -1;
    protected int _legendDataPositionForMin = -1;
    protected int _isStopTrading = 0;
    protected float _legendTextX = 0;
    protected float _legendMinTextX = 0;
    private WritableArray zhuTuDataList = new WritableNativeArray();
    private WritableArray zhuTuColorList = new WritableNativeArray();
    private WritableArray fuTu1DataList = new WritableNativeArray();
    private WritableArray fuTu1ColorList = new WritableNativeArray();
    private WritableArray fuTu2DataList = new WritableNativeArray();
    private WritableArray fuTu2ColorList = new WritableNativeArray();
    private ReactContext reactContext = null;
    private int id;
    private boolean isSend = false;
    private String fuTu;

    protected boolean isKeChuangStock = false;
    protected boolean isDayPeriod = false;
    protected boolean hasMinAssistFormulaPicker = true;
    protected boolean shuangchong=true;

    public ReactContext getReactContext() {
        return reactContext;
    }

    public void setFormulaData(String formulaname, ArrayList<FormulaResultJava> frsJava, ReactContext reactContext, int id, boolean boo, String fuTu, String isLan) {
        _formulaname = formulaname;
        _frsJava = frsJava;
        this.reactContext = reactContext;
        this.id = id;
        isSend = boo;
        this.fuTu = fuTu;
        this.isLandscape = isLan;
    }

    public void setFormulaData(String formulaname, ArrayList<FormulaResultJava> frsJava, ReactContext reactContext) {
        _formulaname = formulaname;
        _frsJava = frsJava;
        this.reactContext = reactContext;
    }

    public Graph(Canvas canvas, LineGroup lines, float left, float top, float width, float height) {
        this.canvas = canvas;
        this.lines = lines;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this._legendTextX = resetLegendPosition();
        this._legendMinTextX = resetLegendPosition();
    }

    public float resetLegendPosition() {
        if (this.hasMinAssistFormulaPicker)
            return getLeft() + Config.LegendLeftPadding + Config.LegendLeftPaddingSpace;
        return getLeft() + Config.LegendLeftPadding;
    }

    protected String getDecimalData(String value) {

        String result = "--";
        if (TextUtils.isEmpty(value) || value.equals(result)) {
            return result;
        }

        try {
            Double d = Double.parseDouble(value);
            double dWithDecimal = d.doubleValue();

            boolean bNegative = dWithDecimal < 0;
            if (bNegative)
                dWithDecimal = Math.abs(dWithDecimal);


            if (dWithDecimal < 10000) {

                NumberFormat nf = NumberFormat.getNumberInstance();
                nf.setMaximumFractionDigits(2);
                result = nf.format(new Double(dWithDecimal));

            } else {

                dWithDecimal = dWithDecimal / 10000;

                if (dWithDecimal < 10000) {
                    NumberFormat nf = NumberFormat.getNumberInstance();
                    nf.setMaximumFractionDigits(2);
                    result = nf.format(new Double(dWithDecimal)) + "万";
                } else {
                    dWithDecimal = dWithDecimal / 10000;
                    NumberFormat nf = NumberFormat.getNumberInstance();
                    nf.setMaximumFractionDigits(2);
                    result = nf.format(new Double(dWithDecimal)) + "亿";
                }

            }

            if (bNegative)
                result = "-" + result;
        } catch (Exception e) {
            Log.w("Data", "=====value=====" + value);
        }


        return result;
    }

    protected enum FormulaLineTypeEnum {
        LINE(0), COLORSTICK(1), VOLSTICK(2), STICK(3), POINTDOT(4), AREA(5);

        private int value = 0;

        private FormulaLineTypeEnum(int value) {    //    必须是private的，否则编译错误
            this.value = value;
        }

        public static FormulaLineTypeEnum valueOf(int value) {
            switch (value) {
                case 0:
                    return LINE;
                case 1:
                    return COLORSTICK;
                case 2:
                    return VOLSTICK;
                case 3:
                    return STICK;
                case 4:
                    return POINTDOT;
                case 5:
                    return AREA;
                default:
                    return null;
            }
        }

        public int value() {
            return this.value;
        }
    }

    protected enum FormulaDrawTypeEnum {
        STICKLINE(0), DRAWTEXT(1), PARTLINE(2), FILLRGN(3), DRAWKLINE(4), DRAWNUMBER(5), COLORSTICKS(6),CURVESHADOW(7);

        private int value = 0;

        private FormulaDrawTypeEnum(int value) {    //    必须是private的，否则编译错误
            this.value = value;
        }

        public static FormulaDrawTypeEnum valueOf(int value) {
            switch (value) {
                case 0:
                    return STICKLINE;
                case 1:
                    return DRAWTEXT;
                case 2:
                    return PARTLINE;
                case 3:
                    return FILLRGN;
                case 4:
                    return DRAWKLINE;
                case 5:
                    return DRAWNUMBER;
                case 6:
                    return COLORSTICKS;
                case 7:
                    return CURVESHADOW;
                default:
                    return null;
            }
        }

        public int value() {
            return this.value;
        }
    }

    public abstract void draw();

    public void drawGrid() {

        Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Config.bgColor);
        Rect rect = new Rect(getLeft(), getTop(), getWidth(), getHeight());
        getCanvas().drawRect(rect.getX(), rect.getY(), rect.getRight(), rect.getBottom(), paint);


        float x1 = rect.getX() + Config.leftRulerWidth;
        float y1 = rect.getY();
        float x2 = rect.getRight() - Config.rightRulerWidth;
        float y2 = rect.getBottom();
        paint.setStyle(Paint.Style.STROKE);
        paint.setColor(Config.borderColor);
        getCanvas().drawRect(x1, y1, x2, y2, paint);


        Paint paintLine = new Paint();
        paintLine.setAntiAlias(true);
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(Config.gridLineColor);
        paintLine.setPathEffect(new DashPathEffect(new float[]{10, 5}, 1));
        Axis axises = getCoord().getAxis();


        //三段划线不画最上面那条网格线
        int end = axises.length();
        if (axises.length() == 3) {
            end = axises.length() - 1;
        }

        for (int i = 0; i < end; i++) {

            float ry = (float) axises.getAxis(i);
            float sy = getCoord().SY(ry);

            Path path = new Path();
            path.moveTo(getCoord().getSx(), sy);
            path.lineTo(getCoord().getSx() + (float) Math.floor(getCoord().getSw() / Config.countRatio), sy);
            getCanvas().drawPath(path, paintLine);
        }
    }

    private void receiveCustomEvent(WritableMap event, String eventName) {
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                id,//native和js两个视图会依据getId()而关联在一起
                eventName,//事件名称
                event
        );
    }

    public void drawAxisPrice() {
        Paint paint = new Paint();
        paint.setAntiAlias(true);
//        paint.setStyle(Paint.Style.STROKE);
        paint.setColor(Config.scaleColor);
        paint.setTextSize(Config.scaleFontSize);
        Paint.FontMetrics fontMetrics = paint.getFontMetrics();
        if (null == getCoord()) return;
        Axis axises = getCoord().getAxis();
        float correct = 0;
        int count= axises.length();
        for (int i = 0; i < count; i++) {
            if(count==3&&i==1){//三个值隐藏指标0轴
                continue;
            }
            float ry = (float) axises.getAxis(i);
            float sy = getCoord().SY(ry);

            if (i == 0) {
                correct = fontMetrics.bottom;
            } else if (i == axises.length() - 1) {
                correct = fontMetrics.top;
            } else {
                correct = 0;
            }

            String text  = getFormatString(ry);


            float textWidth = paint.measureText(text);
            float pxl = getLeft() + Config.leftRulerWidth * (1 - Config.axisSpaceRation) - textWidth;
            pxl = pxl > 0 ? pxl : 0;
            getCanvas().drawText(text, pxl + Config.LegendLeftPadding, sy - correct, paint);
        }
    }

    public String getFormatString(float ry) {
        String text="";
        try {
            if (ry > 100000000 || ry < -100000000) {
//                text = String.format("%d亿", (int)(ry / 100000000));
                text = String.format("%.2f", ry / 100000000);
                text = text + "亿";
            } else if (ry > 10000 || ry < -10000) {
//                text = String.format("%d万", (int)(ry / 10000));
                text = String.format("%.2f", ry / 10000);
                text = text + "万";
            } else {
                text = String.format("%#.2f", ry);
            }
            if (text.length() > 5) {
                text = text.replace(".00", "");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return text;
    }

    FormulaResultJava one;
    double yichong = -1;
    double erchong = -1;

    protected void drawFunction() {
        if (_frsJava == null) return;

        for (int n = 0; n < _frsJava.size(); ++n) {
            one = _frsJava.get(n);
            if (one._line != null) {

                if (FormulaLineTypeEnum.LINE == FormulaLineTypeEnum.valueOf(one._line._type)) {
                    drawFormulaLine(one);

                } else if (FormulaLineTypeEnum.COLORSTICK == FormulaLineTypeEnum.valueOf(one._line._type)) {
                    drawFormulaColorStick(one);

                } else if (FormulaLineTypeEnum.VOLSTICK == FormulaLineTypeEnum.valueOf(one._line._type)) {
                    drawFormulaVolStick(one);

                } else if (FormulaLineTypeEnum.STICK == FormulaLineTypeEnum.valueOf(one._line._type)) {
                    drawFormulaStick(one);

                } else if (FormulaLineTypeEnum.POINTDOT == FormulaLineTypeEnum.valueOf(one._line._type)) {
                    drawFormulaPointDot(one);

                } else if (FormulaLineTypeEnum.AREA == FormulaLineTypeEnum.valueOf(one._line._type)) {
                    drawFormulaDrawArea(one);
                }

            }

            if (one._draw != null) {
                if (FormulaDrawTypeEnum.STICKLINE == FormulaDrawTypeEnum.valueOf(one._draw._type)) {
                    drawFormulaStickLine(one);

                } else if (FormulaDrawTypeEnum.DRAWTEXT == FormulaDrawTypeEnum.valueOf(one._draw._type)) {

                    drawFormulaDrawText(one, n);

                } else if(FormulaDrawTypeEnum.CURVESHADOW==FormulaDrawTypeEnum.valueOf(one._draw._type)){
                    drawFormulaWave(one);
                }

                else if (FormulaDrawTypeEnum.PARTLINE == FormulaDrawTypeEnum.valueOf(one._draw._type)) {
                    drawFormulaPartline(one);

                } else if (FormulaDrawTypeEnum.FILLRGN == FormulaDrawTypeEnum.valueOf(one._draw._type)) {
                    drawFormulaFillRgn(one);

                } else if (FormulaDrawTypeEnum.DRAWNUMBER == FormulaDrawTypeEnum.valueOf(one._draw._type)) {
                    drawFormulaDrawNumber(one);
                } else if (FormulaDrawTypeEnum.COLORSTICKS == FormulaDrawTypeEnum.valueOf(one._draw._type)) {
                    drawFormulaColorSticks(one);
                } else if (FormulaDrawTypeEnum.DRAWKLINE == FormulaDrawTypeEnum.valueOf(one._draw._type)) {
                    //Processing in sub class
                }
            }


        }
//        Log.w("controlKline", "_formulaname="+_formulaname);

         if(reactContext != null&&((Config.freshFutu==0L||System.currentTimeMillis()-Config.freshFutu>500))){
//             Log.w("controlKline", "_formulaname111111111="+_formulaname);
             if (_formulaname != null && _formulaname.equals("分时冲关") && one._draw != null) {

                WritableMap event = Arguments.createMap();
//                Log.w("EventEmitter", "EventEmitter --yichong:" + yichong + "   shuangchong=" + shuangchong);
                if (yichong > 0) {
                    event.putDouble("yichong", yichong);
                } else {
                    event.putDouble("yichong", -1);
                }
//                    event.putString("yichongname", yichongName);
                if (erchong > 0) {
                    event.putDouble("erchong", erchong);
                } else {
                    event.putDouble("erchong", -1);
                }
//                    event.putString("erchongname", erchongName);

                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("sendShuangChongForMin", event);
                Log.w("EventEmitter", "EventEmitter send");
//            receiveCustomEvent(event,"sendFuTu1DataForMin");
            }
            if (isSend) {
                if (reactContext != null && zhuTuDataList.size() > 0) {
                    if (this.isLandscape.equals("true")) {
                        WritableMap event = Arguments.createMap();
                        event.putString("zhuTuName", _formulaname);
                        event.putArray("array", zhuTuDataList);
                        event.putArray("colorArray", zhuTuColorList);
                        receiveCustomEvent(event, "sendLanMADataForKLine");

                    } else {
                        WritableMap event = Arguments.createMap();
                        event.putString("zhuTuName", _formulaname);
                        event.putArray("array", zhuTuDataList);
                        event.putArray("colorArray", zhuTuColorList);
                        receiveCustomEvent(event, "sendMADataForKLine");
                    }
                    zhuTuDataList = null;
                    zhuTuColorList = null;
                } else if (this._formulaname.equals("蓝粉彩带") || this._formulaname.equals("中期彩带") || this._formulaname.equals("抄底策略") || this._formulaname.equals("多空预警")) {
                    WritableMap event = Arguments.createMap();
                    event.putString("zhuTuName", _formulaname);
                    event.putArray("array", zhuTuDataList);
                    event.putArray("colorArray", zhuTuColorList);

                    if (this.isLandscape.equals("true"))
                        receiveCustomEvent(event, "sendLanMADataForKLine");
                    else receiveCustomEvent(event, "sendMADataForKLine");
                }
            }
            Config.freshFutu=System.currentTimeMillis();
         }
//        Log.w("controlKline", "_formulaname222222="+_formulaname+"     this.fuTu="+this.fuTu);

        if(!Config.isScrollFinished){
            if(Config.freshRate%9==0){
                sendTargetMsg();
            }

        }else {
            if (Config.isTouch) {
                if (Config.freshRate % 5 == 0) {
                    sendTargetMsg();
                }
            } else {
                sendTargetMsg();
            }

        }

        Config.freshRate++;
        if(Config.freshRate>10000){
            Config.freshRate=0;
        }
    }

    private void sendTargetMsg(){
        if (this.fuTu != null) {
            if (reactContext != null) {
                if (this.fuTu.equals("fuTu1")) {
//                    Log.w("controlKline", "_formulaname222222==11111===="+_formulaname);
                    if (this.isLandscape.equals("true")) {
                        WritableMap event = Arguments.createMap();
                        event.putString("fuTuName", _formulaname);
                        event.putArray("fuTuArray", fuTu1DataList);
                        event.putArray("fuTuColorArray", fuTu1ColorList);
                        receiveCustomEvent(event, "sendLanFuTu1DataForKLine");

                    } else {
                        WritableMap event = Arguments.createMap();

                        event.putString("fuTuName", _formulaname);
                        event.putArray("fuTuArray", fuTu1DataList);
                        event.putArray("fuTuColorArray", fuTu1ColorList);
                        receiveCustomEvent(event, "sendFuTu1DataForKLine");

                    }
                    fuTu1ColorList = null;
                    fuTu1DataList = null;


                }else if(this.fuTu.equals("fuTu2")) {
//                    Log.w("controlKline", "_formulaname222222==22222===="+_formulaname);

                    WritableMap event = Arguments.createMap();

                    event.putString("fuTuName", _formulaname);
                    event.putArray("fuTuArray", fuTu2DataList);
                    event.putArray("fuTuColorArray", fuTu2ColorList);
                    receiveCustomEvent(event, "sendFuTu2DataForKLine");

                    fuTu2ColorList = null;
                    fuTu2DataList = null;


                }
            }
        }
    }
    private void drawFormulaStick(FormulaResultJava one) {
        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(one._line._color);
        paintLine.setAlpha(DEFAULTALPHA);
        paintLine.setStrokeWidth(one._line._thick.floatValue());

        ArrayList<Double> d = one._line._data;
        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        float centerY = getCoord().SY(0);
        //The data and the coordinate are indexed separately
        if(skipData<0){
            return;
        }
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(one._line._color);
                paintLegend.setAlpha(DEFAULTALPHA);

                Double dval = d.get(dataIndex);
                if (dval.compareTo(INVALID_DOUBLE) != 0) {

                    String legendData = one._line._name + ":" + getDecimalData(String.valueOf(dval));
                    getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                    float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                    _legendTextX += space;
                }

            }

            Double value = one._line._data.get(dataIndex);
            if (value.equals(INVALID_DOUBLE)) {
                continue;
            }

            float pointY = getCoord().SY(value.floatValue());
            float centerX = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;

            getCanvas().drawLine(centerX, centerY, centerX, pointY, paintLine);

        }
    }

    private void drawFormulaStickLine(FormulaResultJava one) {
        Paint paint = new Paint();
        paint.setStyle(Paint.Style.FILL_AND_STROKE);
        paint.setColor(one._draw._color);
        paint.setAlpha(DEFAULTALPHA);

        float linewidth = one._draw._para1.floatValue();
        if (linewidth == -1) {
            paint.setStrokeWidth(Config.kLineWidth);
        } else {
            paint.setStrokeWidth(linewidth);
        }


        int count = one._draw._drawPositon1.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        double spaceRatio = Config.spaceRatio;
        if (linewidth == -2) spaceRatio = 0;
        if(skipData<0){
            return;
        }


        //The data and the coordinate are indexed separately
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

  //主力动态紫色出现大于1的数据（原理应该是0或1）
            if (1d <= one._draw._drawPositon1.get(dataIndex)&&one._draw._drawPositon1.get(dataIndex)!=Double.MAX_VALUE) {
                if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                        || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                    Paint paintLegend = new Paint();
                    paintLegend.setTextSize(Config.legendFontSize);
                    paintLegend.setAntiAlias(true);
                    paintLegend.setColor(one._draw._color);
                    paintLegend.setAlpha(DEFAULTALPHA);

                    Double dval = one._draw._drawPositon3.get(dataIndex);
                    if (dval.compareTo(INVALID_DOUBLE) != 0 && !one._draw._text.isEmpty()) {

                        String legendData = one._draw._text + ":" + getDecimalData(String.valueOf(dval));
                       if (this._formulaname.equals("底部出击")||this._formulaname.equals("主力动态")) {
                            if (this.fuTu != null) {
                                if (this.fuTu.equals("fuTu1")) {
                                    fuTu1DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._draw._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu1ColorList.pushString(color);
                                } else {
                                    fuTu2DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._draw._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu2ColorList.pushString(color);
                                }
                            }
                        } else {
                            getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                            float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                            _legendTextX += space;
                        }

                    }

                }

                Double price1 = one._draw._drawPositon2.get(dataIndex);
                Double price2 = one._draw._drawPositon3.get(dataIndex);

                float pointY1 = getCoord().SY(price1.floatValue());
                float pointY2 = getCoord().SY(price2.floatValue());

                float left = getCoord().SX(i - getCoord().getRx());
                float right = getCoord().SX(i - getCoord().getRx() + 1);
                float centerS = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
                float width = right - left;

                float halfWidthS = (float) Math.floor(width * (1 - spaceRatio) / 2);
                float pointX1 = centerS - halfWidthS;
                float pointX2 = centerS + halfWidthS;

                if (one._draw._para1 == -2) {
                    pointX1 -= 1;
                    pointX2 += 1;
                }
                if (this._formulaname.equals("底部出击")||this._formulaname.equals("主力动态")) {
                     pointX1 = centerS - halfWidthS+1;
                     pointX2 = centerS + halfWidthS-1;
                }

                if (one._draw._para1 == -1 || one._draw._para1 == -2) {
                    if (pointY1 > pointY2) {
                        getCanvas().drawRect(pointX1, pointY2, pointX2, pointY1, paint);
                    } else {
                        getCanvas().drawRect(pointX1, pointY1, pointX2, pointY2, paint);
                    }
                } else {
                    paint.setStyle(Paint.Style.STROKE);
                    getCanvas().drawLine(centerS, pointY2, centerS, pointY1, paint);

                }


            }
        }

    }

    public int getFontSize() {
        int fz = 18;

        int sn = getScreenNumber();

        if (sn <= 20) {
            fz = 32;
        } else if (sn > 20 && sn <= 40) {
            fz = 24;
        } else if (sn > 40 && sn <= 60) {
            fz = 20;
        } else if (sn > 60 && sn < 80) {
            fz = 18;
        }

        return fz;
    }

    int num;

    private void drawFormulaDrawText(FormulaResultJava one, int index) {
        Paint paintText = new Paint();
        paintText.setColor(one._draw._color);
        paintText.setAlpha(DEFAULTALPHA);
        paintText.setStrokeWidth(3);
        paintText.setTextAlign(Paint.Align.LEFT);
        paintText.setTextSize(getFontSize());


        int count = one._draw._drawPositon1.size();
        if (count != one._draw._drawPositon2.size())
            return;
        if (this._formulaname.equals("分时冲关")) {
            for (int i = num; i < count; i++) {
                if (1d == one._draw._drawPositon1.get(i)) {
                    num = i;
                    Double tmp = one._draw._drawPositon2.get(i);

                    if (index == 0) {
                        yichong = tmp;
                        Log.w("EventEmitter", "EventEmitter --yichong:" + yichong);

                    } else if (index == 1) {
                        erchong = tmp;
                        Log.w("EventEmitter", "EventEmitter --erchong:" + erchong);
                    }

                    float pointY = getCoord().SY(tmp.floatValue());

                    float centerS = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
                    float strWidth = paintText.measureText(one._draw._text);
                    float dx = centerS - strWidth / 2;
                    if (dx < 10) {
                        dx = 10;
                    }
                    if (dx >= width - strWidth) {
                        dx = width - strWidth - 10;
                    }
                    canvas.drawText(one._draw._text, dx, pointY, paintText);
                    break;
                }
            }

        } else {

            for (int i = getCoord().getRx(), dataIndex = getDataStartPos(count); i < _ScreenNum && dataIndex < count; i++, dataIndex++) {
                if (1d == one._draw._drawPositon1.get(dataIndex)) {
                    Double tmp = one._draw._drawPositon2.get(dataIndex);
                    float pointY = getCoord().SY(tmp.floatValue());
//
                    float centerS = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
                    float strWidth = paintText.measureText(one._draw._text);
                    float dx = centerS - strWidth / 2;
                    if (this._formulaname.equals("抄底策略")) {
                        dx = centerS - strWidth / 4;
                    }
                    canvas.drawText(one._draw._text, dx, pointY, paintText);

//                canvas.drawText(one._draw._text, centerS - strWidth / 2, pointY, paintText);
//                        break;
                }
            }

        }

    }

    private void drawFormulaWave(FormulaResultJava one) {

        Paint paintLine= new Paint();

        paintLine.setStyle(Paint.Style.STROKE);
//        paintLine.setColor(one._draw._color);
        paintLine.setAlpha(0);
//        paintLine.setAlpha(DEFAULTALPHA);
        float linewidth = one._draw._para1.floatValue();
        paintLine.setStrokeWidth(linewidth);

        Paint paintLine1 = new Paint();
        paintLine1.setStyle(Paint.Style.FILL);

        ArrayList<Double> d = one._draw._drawPositon1;

        int count = d.size();
        final int skipData = getDataStartPos(count);

        float centerY = getCoord().SY(0);
        float lastX = getCoord().SX(getCoord().getRx() + 0.5f);
        float lastY = centerY;

        Path pathMin1 = new Path();
        pathMin1.moveTo(lastX, lastY);
        if(skipData<0){
            return;
        }

        int lastIndex= Math.min(_ScreenNum,count);

        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            Double value = d.get(dataIndex);
            if (value.equals(INVALID_DOUBLE)) {
                continue;
            }
            float currentX = getCoord().SX(i - getCoord().getRx() + 0.5f);
            float currentY = getCoord().SY(value.floatValue());


            if (currentY >centerY) {

                if(lastY<centerY) {//上边部分

                    pathMin1.lineTo(Math.abs(currentX-lastX)/2+lastX, centerY);
                    pathMin1.close();
//
//                    paintLine1.setColor(Config.riseColor);

                    paintLine1.setColor(one._draw._color2);
                    paintLine1.setAlpha(DEFAULTALPHA);
                    getCanvas().drawPath(pathMin1, paintLine1);

                    pathMin1=new Path();
                    pathMin1.moveTo(Math.abs(currentX-lastX)/2+lastX,centerY);
                    pathMin1.lineTo(currentX, currentY);

                }else{
                    pathMin1.lineTo(currentX, currentY);
                }

            } else {

                if(lastY>centerY) {//下边部分

                    pathMin1.lineTo(Math.abs(currentX-lastX)/2+lastX, centerY);
                    pathMin1.close();

//                    paintLine1.setColor(Config.dropColor);
                    paintLine1.setColor(one._draw._color3);
                    paintLine1.setAlpha(DEFAULTALPHA);
                    getCanvas().drawPath(pathMin1, paintLine1);

                    pathMin1=new Path();
                    pathMin1.moveTo(Math.abs(currentX-lastX)/2+lastX,centerY);
                    pathMin1.lineTo(currentX, currentY);

                }else{
                    pathMin1.lineTo(currentX, currentY);

                }


            }
            if(i==lastIndex-1){
                if(currentY>centerY){
                    paintLine1.setColor(one._draw._color3);
                    paintLine1.setAlpha(DEFAULTALPHA);
                }else{
                    paintLine1.setColor(one._draw._color2);
                    paintLine1.setAlpha(DEFAULTALPHA);
                }
                pathMin1.lineTo(currentX, centerY);
                pathMin1.close();
                getCanvas().drawPath(pathMin1, paintLine1);

            }
            getCanvas().drawLine(lastX, lastY, currentX, currentY, paintLine);

            lastX = currentX;
            lastY = currentY;
        }


    }

    //柱状指标
    private void drawFormulaColorStick(FormulaResultJava one) {

        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(one._line._color);
        paintLine.setAlpha(DEFAULTALPHA);

        float linewidth = one._line._thick.floatValue();
        if (linewidth == -1) {
            paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
            paintLine.setStrokeWidth(Config.kLineWidth);
        } else {
            paintLine.setStrokeWidth(linewidth);
        }

        ArrayList<Double> d = one._line._data;
        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        float centerY = getCoord().SY(0);
        int legendTextColor = one._line._color;
        if(skipData<0){
            return;
        }
        //The data and the coordinate are indexed separately
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            Double value = one._line._data.get(dataIndex);
            if (value.equals(INVALID_DOUBLE)) {
                continue;
            }

            if (this._formulaname.equals("主力资金") ) {
                if (value > 0)
                    legendTextColor = 0xfc525a;
                else if (value < 0)
                    legendTextColor = 0x0ec98e;
                else
                    legendTextColor = 0xFFFFFF;
            }

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(legendTextColor);
                paintLegend.setAlpha(DEFAULTALPHA);

                Double dval = d.get(dataIndex);
                if (dval.compareTo(INVALID_DOUBLE) != 0) {
                    String legendData = one._line._name + ":" + getDecimalData(String.valueOf(dval));
                    if (this._formulaname.equals("MACD")
                            || this._formulaname.equals("主力资金")) {
                        if (this.fuTu != null) {
                            if (this.fuTu.equals("fuTu1")) {
                                fuTu1DataList.pushString(legendData);
                                String color = Integer.toHexString(legendTextColor);
                                if (color.length() == 5) {
                                    color = "0" + color;
                                } else if (color.length() == 4) {
                                    color = "00" + color;
                                } else if (color.length() == 3) {
                                    color = "000" + color;
                                } else if (color.length() == 2) {
                                    color = "0000" + color;
                                } else if (color.length() == 1) {
                                    color = "00000" + color;
                                }
                                fuTu1ColorList.pushString(color);
                            } else {
                                fuTu2DataList.pushString(legendData);
                                String color = Integer.toHexString(legendTextColor);
                                if (color.length() == 5) {
                                    color = "0" + color;
                                } else if (color.length() == 4) {
                                    color = "00" + color;
                                } else if (color.length() == 3) {
                                    color = "000" + color;
                                } else if (color.length() == 2) {
                                    color = "0000" + color;
                                } else if (color.length() == 1) {
                                    color = "00000" + color;
                                }
                                fuTu2ColorList.pushString(color);
                            }
                        }
                    } else {
                        getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                        float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                        _legendTextX += space;
                    }
                }

            }


            float pointY = getCoord().SY(value.floatValue());
            float centerX = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;

            if (value > 0) {
                paintLine.setColor(one._line._color);

//                paintLine.setColor(Config.riseColor);
            } else if (value < 0) {
                paintLine.setColor(one._line._color2);

//                paintLine.setColor(Config.dropColor);
            }

            paintLine.setAlpha(DEFAULTALPHA);

            if (linewidth == -1 || linewidth == -2) {

                double spaceRatio = 0.3;
                if (linewidth == -2) spaceRatio = 0;

                float pointY0 = getCoord().SY(0);

                float left = getCoord().SX(i - getCoord().getRx());
                float right = getCoord().SX(i - getCoord().getRx() + 1);
                float width = right - left;

                float halfWidthS = (float) Math.floor(width * (1 - spaceRatio) / 2);
                float pointX1 = centerX - halfWidthS;
                float pointX2 = centerX + halfWidthS;

                if (one._line._thick == -2) {
                    pointX1 -= 1;
                    pointX2 += 1;
                }

                if (pointY0 < pointY)
                    getCanvas().drawRect(pointX1, pointY0, pointX2, pointY, paintLine);
                else if (pointY0 > pointY)
                    getCanvas().drawRect(pointX1, pointY, pointX2, pointY0, paintLine);

            } else {
                getCanvas().drawLine(centerX, centerY, centerX, pointY, paintLine);
            }

        }
    }

    private void drawFormulaColorSticks(FormulaResultJava one) {

        Paint paint = new Paint();
        paint.setStyle(Paint.Style.FILL_AND_STROKE);
        paint.setAlpha(DEFAULTALPHA);

        float linewidth = one._draw._para1.floatValue();
        if (linewidth == -1) {
            paint.setStrokeWidth(Config.kLineWidth);
        } else {
            paint.setStrokeWidth(linewidth);
        }

        ArrayList<Double> d = one._draw._drawPositon1;
        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        float centerY = getCoord().SY(0);
        int legendTextColor;
        Double value1, value2, value3, value4, total;
        double spaceRatio = 0.3;
        if (linewidth == -2) spaceRatio = 0;
        if(skipData<0){
            return;
        }
        //The data and the coordinate are indexed separately
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            value1 = one._draw._drawPositon1.get(dataIndex);
            value2 = 0 - one._draw._drawPositon2.get(dataIndex);
            value3 = one._draw._drawPositon3.get(dataIndex);
            value4 = 0 - one._draw._drawPositon4.get(dataIndex);

            if (value1.equals(INVALID_DOUBLE) || value2.equals(INVALID_DOUBLE)
                    || value3.equals(INVALID_DOUBLE) || value4.equals(INVALID_DOUBLE)) {
                continue;
            }

            total = value1 + value2 + value3 + value4;
            if (total > 0)
                legendTextColor = 0xFF0000;
            else if (total < 0)
                legendTextColor = 0x00FF00;
            else
                legendTextColor = 0xFFFFFF;

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setAlpha(DEFAULTALPHA);
                paintLegend.setColor(legendTextColor);


                if (total.compareTo(INVALID_DOUBLE) != 0) {
                    String legendData = one._draw._name + ":" + getDecimalData(String.valueOf(total));
                    if (this._formulaname.equals("多空资金")) {
//                        if (this.fuTu != null) {
//                            if (this.fuTu.equals("fuTu1")) {
//
//                                fuTu1DataList.pushString(legendData);
//                                String color = Integer.toHexString(legendTextColor);
//                                if (color.length() == 5) {
//                                    color = "0" + color;
//                                } else if (color.length() == 4) {
//                                    color = "00" + color;
//                                } else if (color.length() == 3) {
//                                    color = "000" + color;
//                                } else if (color.length() == 2) {
//                                    color = "0000" + color;
//                                } else if (color.length() == 1) {
//                                    color = "00000" + color;
//                                }
//                                fuTu1ColorList.pushString(color);
//                            } else {
//                                fuTu2DataList.pushString(legendData);
//                                String color = Integer.toHexString(legendTextColor);
//                                if (color.length() == 5) {
//                                    color = "0" + color;
//                                } else if (color.length() == 4) {
//                                    color = "00" + color;
//                                } else if (color.length() == 3) {
//                                    color = "000" + color;
//                                } else if (color.length() == 2) {
//                                    color = "0000" + color;
//                                } else if (color.length() == 1) {
//                                    color = "00000" + color;
//                                }
//                                fuTu2ColorList.pushString(color);
//                            }
//                        }
                    } else {
                        getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                        float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                        _legendTextX += space;
                    }
                }

            }


            float pointY0 = getCoord().SY(0);
            float pointY1 = getCoord().SY(value1.floatValue());
            float pointY2 = getCoord().SY(value2.floatValue());
            float pointY3 = getCoord().SY(value1.floatValue() + value3.floatValue());
            float pointY4 = getCoord().SY(value2.floatValue() + value4.floatValue());

            float left = getCoord().SX(i - getCoord().getRx());
            float right = getCoord().SX(i - getCoord().getRx() + 1);
            float centerX = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
            float width = right - left;

            float halfWidthS = (float) Math.floor(width * (1 - spaceRatio) / 2);
            float pointX1 = centerX - halfWidthS;
            float pointX2 = centerX + halfWidthS;

            if (one._draw._para1 == -2) {
                pointX1 -= 1;
                pointX2 += 1;
            }

            if (one._draw._para1 == -1 || one._draw._para1 == -2) {

                // 大单流入
                paint.setColor(one._draw._color);
                paint.setAlpha(DEFAULTALPHA);
                getCanvas().drawRect(pointX1, pointY1, pointX2, pointY0, paint);

                // 大单流出
                paint.setColor(one._draw._color2);
                paint.setAlpha(DEFAULTALPHA);

                getCanvas().drawRect(pointX1, pointY0, pointX2, pointY2, paint);

                // 特大单流入
                paint.setColor(one._draw._color3);
                paint.setAlpha(DEFAULTALPHA);

                getCanvas().drawRect(pointX1, pointY3, pointX2, pointY1, paint);

                // 特大单流出
                paint.setColor(one._draw._color4);
                paint.setAlpha(DEFAULTALPHA);
                getCanvas().drawRect(pointX1, pointY2, pointX2, pointY4, paint);

            }

        }
    }

    private void drawFormulaVolStick(FormulaResultJava one) {
        TableData kdata = getLineGroup().data(0);
        Paint paintLine = new Paint();
        paintLine.setColor(one._line._color);
        paintLine.setAlpha(DEFAULTALPHA);
        paintLine.setStrokeWidth(one._line._thick.floatValue());

        double spaceRatio = Config.spaceRatio;
        ArrayList<Double> d = one._line._data;
        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        if(skipData<0){
            return;
        }
        //The data and the coordinate are indexed separately
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(one._line._color);
                paintLegend.setAlpha(DEFAULTALPHA);

                Double dval = d.get(dataIndex);
                if (dval.compareTo(INVALID_DOUBLE) != 0) {
                    String legendData = one._line._name + ":" + getDecimalData(String.valueOf(dval));
                    if (legendData != null) {
                        if (this._formulaname.equals("VOL") || this._formulaname.equals("量能黄金")) {
                            if (this.fuTu != null) {
                                if (this.fuTu.equals("fuTu1")) {
                                    fuTu1DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._line._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu1ColorList.pushString(color);
                                } else {
                                    fuTu2DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._line._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu2ColorList.pushString(color);
                                }
                            }
                        } else {
                            getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                            float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                            _legendTextX += space;
                        }

                    }

                }

            }

            Double vol = one._line._data.get(dataIndex);
            if (vol.equals(INVALID_DOUBLE)) {
                continue;
            }

            float qtyS = getCoord().SY(vol.floatValue());

            float left = getCoord().SX(i - getCoord().getRx());
            float right = getCoord().SX(i - getCoord().getRx() + 1);
            float centerS = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
            float width = right - left;
            float halfWidthS = (float) Math.floor(width * (1 - spaceRatio) / 2);
            float leftS = centerS - halfWidthS;
            float rightS = centerS + halfWidthS;

            if ((boolean) kdata.getValue(dataIndex, 1)) {
                paintLine.setColor(Config.riseColor);
                paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
            } else {
                paintLine.setColor(Config.dropColor);
                paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
            }

            getCanvas().drawRect(leftS, qtyS, rightS, getCoord().getSh() + getCoord().getSy(), paintLine);

            if (this.isDayPeriod && this.isKeChuangStock) {

                double fixedVolume = (double) kdata.getValue(dataIndex, 3);

                if (fixedVolume <= 0)
                    continue;

                vol = vol + fixedVolume;
                float fixedVolumeStartY = getCoord().SY(vol.floatValue());

                if ((boolean) kdata.getValue(dataIndex, 1)) {
                    paintLine.setColor(Config.klineFixedVolumeRiseColor);
                    paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
                } else {
                    paintLine.setColor(Config.klineFixedVolumeDropColor);
                    paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
                }

                getCanvas().drawRect(leftS, fixedVolumeStartY, rightS, qtyS, paintLine);

            }


        }
    }

    private void drawFormulaLine(FormulaResultJava one) {

        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(one._line._color);
        if(this._formulaname.equals("资金雷达")) {
            paintLine.setAlpha(0);
        }else{
            paintLine.setAlpha(DEFAULTALPHA);
        }

        paintLine.setStrokeWidth(one._line._thick.floatValue() * Config.formulaWidthMultiple);

        ArrayList<Double> d = one._line._data;
//        if(this._formulaname.equals("ZLDT"))Log.d("k线得数据--drawFormulaLine",d.toString());
        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        float lastpointx = Float.MAX_VALUE;
        float lastpointy = Float.MAX_VALUE;
        if(skipData<0){
            return;
        }
        //The data and the coordinate are indexed separately
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition == -1 && count < _ScreenNum && dataIndex == count - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(one._line._color);
                paintLegend.setAlpha(DEFAULTALPHA);
                Double dval = d.get(dataIndex);
                if (!one._line._name.isEmpty()) {
                    if (dval.compareTo(INVALID_DOUBLE) != 0) {
                        String legendData = one._line._name + ":" + getDecimalData(String.valueOf(dval));
                        if (isSend && legendData != null) {
                            if (this._formulaname.equals("BOLL") || this._formulaname.equals("MA")) {
                                zhuTuDataList.pushString(legendData);
                                String color = Integer.toHexString(one._line._color);
                                if (color.length() == 5) {
                                    color = "0" + color;
                                } else if (color.length() == 4) {
                                    color = "00" + color;
                                } else if (color.length() == 3) {
                                    color = "000" + color;
                                } else if (color.length() == 2) {
                                    color = "0000" + color;
                                } else if (color.length() == 1) {
                                    color = "00000" + color;
                                }
                                zhuTuColorList.pushString(color);
                            } else {
                                getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                                float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                                _legendTextX += space;
                            }
                        }
                        if (!isSend && legendData != null) {
                            if (this._formulaname.equals("VOL")
                                    || this._formulaname.equals("MACD")
                                    || this._formulaname.equals("KDJ")
                                    || this._formulaname.equals("RSI")
                                    || this._formulaname.equals("BIAS")
                                    || this._formulaname.equals("CCI")
                                    || this._formulaname.equals("WR")
                                    || this._formulaname.equals("主力动态")
                                    || this._formulaname.equals("量能黄金")
                                    || this._formulaname.equals("强弱转换")
                                    || this._formulaname.equals("波动极限")
                                    || this._formulaname.equals("周期拐点")
                                    || this._formulaname.equals("操盘提醒")
                                    || this._formulaname.equals("多空资金")
                                    || this._formulaname.equals("资金雷达")

                            ) {
                                if (this.fuTu != null) {
                                    if (this.fuTu.equals("fuTu1")) {
                                        fuTu1DataList.pushString(legendData);
                                        String color = Integer.toHexString(one._line._color);
                                        if (color.length() == 5) {
                                            color = "0" + color;
                                        } else if (color.length() == 4) {
                                            color = "00" + color;
                                        } else if (color.length() == 3) {
                                            color = "000" + color;
                                        } else if (color.length() == 2) {
                                            color = "0000" + color;
                                        } else if (color.length() == 1) {
                                            color = "00000" + color;
                                        }
                                        fuTu1ColorList.pushString(color);
                                    } else {
                                        fuTu2DataList.pushString(legendData);
                                        String color = Integer.toHexString(one._line._color);
                                        if (color.length() == 5) {
                                            color = "0" + color;
                                        } else if (color.length() == 4) {
                                            color = "00" + color;
                                        } else if (color.length() == 3) {
                                            color = "000" + color;
                                        } else if (color.length() == 2) {
                                            color = "0000" + color;
                                        } else if (color.length() == 1) {
                                            color = "00000" + color;
                                        }
                                        fuTu2ColorList.pushString(color);
                                    }
                                }
                            } else {
                                getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                                float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                                _legendTextX += space;
                            }
                        }
                    } else {
                        if (this._formulaname.equals("周期拐点") || this._formulaname.equals("操盘提醒")) {
                            String legendData = one._line._name + ":" + "--";
                            if (!isSend && legendData != null) {
                                if (this.fuTu != null) {
                                    if (this.fuTu.equals("fuTu1")) {
                                        fuTu1DataList.pushString(legendData);
                                        String color = Integer.toHexString(one._line._color);
                                        if (color.length() == 5) {
                                            color = "0" + color;
                                        } else if (color.length() == 4) {
                                            color = "00" + color;
                                        } else if (color.length() == 3) {
                                            color = "000" + color;
                                        } else if (color.length() == 2) {
                                            color = "0000" + color;
                                        } else if (color.length() == 1) {
                                            color = "00000" + color;
                                        }
                                        fuTu1ColorList.pushString(color);
                                    } else {
                                        fuTu2DataList.pushString(legendData);
                                        String color = Integer.toHexString(one._line._color);
                                        if (color.length() == 5) {
                                            color = "0" + color;
                                        } else if (color.length() == 4) {
                                            color = "00" + color;
                                        } else if (color.length() == 3) {
                                            color = "000" + color;
                                        } else if (color.length() == 2) {
                                            color = "0000" + color;
                                        } else if (color.length() == 1) {
                                            color = "00000" + color;
                                        }
                                        fuTu2ColorList.pushString(color);
                                    }
                                }
                            }
                        }
                    }
                }

            }

            if (one._line._nodraw) continue;

            float pointy = getCoord().SY(d.get(dataIndex).floatValue());
            float pointx = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;

            if (Float.MAX_VALUE != lastpointx && Float.MAX_VALUE != lastpointy && !one._line._nodraw)
                getCanvas().drawLine(lastpointx, lastpointy, pointx, pointy, paintLine);

            lastpointx = pointx;
            lastpointy = pointy;

        }

    }

    private void drawFormulaPartline(FormulaResultJava one) {
        ArrayList<Double> b = one._draw._drawPositon1;
        ArrayList<Double> d = one._draw._drawPositon2;
        if (b.size() != d.size()) return;


        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(one._draw._color);
        paintLine.setAlpha(DEFAULTALPHA);
        paintLine.setStrokeWidth(one._draw._para1.floatValue() * Config.formulaWidthMultiple);

        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        float lastpointx = Float.MAX_VALUE;
        float lastpointy = Float.MAX_VALUE;
        if(skipData<0){
            return;
        }
        //The data and the coordinate are indexed separately
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            Double bval = b.get(dataIndex);

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(one._draw._color);
                paintLegend.setAlpha(DEFAULTALPHA);

                Double dval = d.get(dataIndex);
                if (this._formulaname.equals("趋势彩虹") || this._formulaname.equals("短线趋势彩虹")) {
                    if (dval.compareTo(INVALID_DOUBLE) != 0) {

                        String legendData = one._draw._text;
                        if (bval > 0.000001) {
                            legendData += getDecimalData(String.valueOf(dval));
                        } else {
                            legendData += "--";
                        }
                        if (isSend && legendData != null) {
                            Log.d("caihongqushi的值", legendData);
                            zhuTuDataList.pushString(legendData);
                            String color = Integer.toHexString(one._draw._color);
                            if (color.length() == 5) {
                                color = "0" + color;
                            } else if (color.length() == 4) {
                                color = "00" + color;
                            } else if (color.length() == 3) {
                                color = "000" + color;
                            } else if (color.length() == 2) {
                                color = "0000" + color;
                            } else if (color.length() == 1) {
                                color = "00000" + color;
                            }
                            zhuTuColorList.pushString(color);
                        }
//                    String legendData = one._draw._text + getDecimalData(String.valueOf(dval));
//                    float space = paintLegend.measureText(legendData) + Config.LegendSpace;
//                    if (bval > 0.000001) {
//                        getCanvas().drawText(legendData, _legendTextX, getTop()+Config.topLegendHeight, paintLegend);
//                        _legendTextX += space;
//                    }

                    }
                } else {
                    if (dval.compareTo(INVALID_DOUBLE) != 0 && !one._draw._text.isEmpty()) {

                        String legendData = one._draw._text;
                        if (bval > 0.000001) {
                            legendData += getDecimalData(String.valueOf(dval));
                        } else {
                            legendData += "--";
                        }
                        getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                        float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                        _legendTextX += space;


//                    String legendData = one._draw._text + getDecimalData(String.valueOf(dval));
//                    float space = paintLegend.measureText(legendData) + Config.LegendSpace;
//                    if (bval > 0.000001) {
//                        getCanvas().drawText(legendData, _legendTextX, getTop()+Config.topLegendHeight, paintLegend);
//                        _legendTextX += space;
//                    }

                    }
                }


            }

            float pointy = getCoord().SY(d.get(dataIndex).floatValue());
            float pointx = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;

            if (Float.MAX_VALUE != lastpointx && Float.MAX_VALUE != lastpointy && (bval > 0.000001))
                getCanvas().drawLine(lastpointx, lastpointy, pointx, pointy, paintLine);

            lastpointx = pointx;
            lastpointy = pointy;

        }
    }

    private void drawFormulaFillRgn(FormulaResultJava one) {
        ArrayList<Double> b = one._draw._drawPositon1;
        ArrayList<Double> d1 = one._draw._drawPositon2;
        ArrayList<Double> d2 = one._draw._drawPositon3;
        if (!(d1.size() == b.size() && b.size() == d2.size())) return;


        Paint paintLine = new Paint();
        paintLine.setAntiAlias(true);
        paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
        paintLine.setColor(one._draw._color);
        paintLine.setAlpha(DEFAULTALPHA);


        float lastpointx1 = Float.MAX_VALUE, lastpointx2 = Float.MAX_VALUE;
        float lastpointy1 = Float.MAX_VALUE, lastpointy2 = Float.MAX_VALUE;
        int count = b.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        if(skipData<0){
            return;
        }
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            Double bval = b.get(dataIndex);
            float pointy1 = getCoord().SY(d1.get(dataIndex).floatValue());
            float pointy2 = getCoord().SY(d2.get(dataIndex).floatValue());
            float pointx1 = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
            float pointx2 = pointx1;

            if (Float.MAX_VALUE != lastpointx1 && Float.MAX_VALUE != lastpointy1
                    && Float.MAX_VALUE != lastpointx2 && Float.MAX_VALUE != lastpointy2
                    && (bval > 0.000001)) {

                Path path = new Path();
                path.moveTo(lastpointx1, lastpointy1);
                path.lineTo(pointx1, pointy1);
                path.lineTo(pointx2, pointy2);
                path.lineTo(lastpointx2 - 1, lastpointy2);
                path.lineTo(lastpointx1 - 1, lastpointy1);
                path.close();
                path.setFillType(Path.FillType.WINDING);
                canvas.drawPath(path, paintLine);
            }


            lastpointx1 = pointx1;
            lastpointy1 = pointy1;
            lastpointx2 = pointx2;
            lastpointy2 = pointy2;
        }

    }

    private void drawFormulaDrawArea(FormulaResultJava one) {

        Paint paintLine = new Paint();
        paintLine.setColor(one._line._color);
        paintLine.setAlpha(DEFAULTALPHA);
        paintLine.setStrokeWidth(one._line._thick.floatValue());

        double spaceRatio = Config.spaceRatio;
        ArrayList<Double> d = one._line._data;
        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        //The data and the coordinate are indexed separately
        if(skipData<0){
            return;
        }
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(one._line._color);
                paintLegend.setAlpha(DEFAULTALPHA);

                Double dval = d.get(dataIndex);
                if (dval.compareTo(INVALID_DOUBLE) != 0) {
                    String legendData = one._line._name + ":" + getDecimalData(String.valueOf(dval));
                    if (legendData != null) {
                        if (this._formulaname.equals("多空资金") || this._formulaname.equals("主力资金")) {
                            if (this.fuTu != null) {
                                if (this.fuTu.equals("fuTu1")) {
                                    fuTu1DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._line._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu1ColorList.pushString(color);
                                } else {
                                    fuTu2DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._line._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu2ColorList.pushString(color);
                                }
                            }
                        } else {
                            getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                            float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                            _legendTextX += space;
                        }

                    }

                }

            }

            Double value = one._line._data.get(dataIndex);
            if (value.equals(INVALID_DOUBLE)) {
                continue;
            }


            float left = getCoord().SX(i - getCoord().getRx());
            float right = getCoord().SX(i - getCoord().getRx() + 1);
            float centerS = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
            float width = right - left;
            float space = (float) (width * (1 - spaceRatio));
            float halfWidthS = (float) Math.floor(space);


            if (value > 0) {
                paintLine.setColor(Config.riseColorArea);
            } else if (value < 0) {
                paintLine.setColor(Config.dropColorArea);
            } else {
                paintLine.setColor(Config.normalColorArea);
            }
            paintLine.setStyle(Paint.Style.FILL_AND_STROKE);


            float centerPointY = getCoord().SY(value.floatValue());
            float centerPointX = centerS;
            float leftPointY = getCoord().SY(0);
            float leftPointX = centerS - halfWidthS / 2;
            float rightPointY = leftPointY;
            float rightPointX = centerS + halfWidthS / 2;

            Path path = new Path();
            path.moveTo(leftPointX, leftPointY);
            path.lineTo(centerPointX, centerPointY);
            path.lineTo(rightPointX, rightPointY);
            path.lineTo(leftPointX, leftPointY);
            path.close();
            path.setFillType(Path.FillType.WINDING);
            getCanvas().drawPath(path, paintLine);


//            if (this.isDayPeriod && this.isKeChuangStock) {
//
//                double fixedVolume = (double)kdata.getValue(dataIndex, 3);
//
//                if (fixedVolume<=0)
//                    continue;
//
//                vol = vol + fixedVolume;
//                float fixedVolumeStartY = getCoord().SY(vol.floatValue());
//
//                if((boolean)kdata.getValue(dataIndex, 1)){
//                    paintLine.setColor(Config.klineFixedVolumeRiseColor);
//                    paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
//                }else{
//                    paintLine.setColor(Config.klineFixedVolumeDropColor);
//                    paintLine.setStyle(Paint.Style.FILL_AND_STROKE);
//                }
//
//                getCanvas().drawRect(leftS, fixedVolumeStartY, rightS, qtyS, paintLine);
//
//            }


        }
    }

    private boolean isInteger(Double d) {
        return d == d.intValue();
    }

    private String setDecimal(Double d, Double decimal) {

        String zerolist = "#.";
        for (int i = 0; i < decimal; i++) {
            zerolist += ("0");
        }

        DecimalFormat df = new DecimalFormat(zerolist);
        return df.format(d);

    }

    private void drawFormulaDrawNumber(FormulaResultJava one) {
        ArrayList<Double> b = one._draw._drawPositon1;
        ArrayList<Double> d1 = one._draw._drawPositon2;
        ArrayList<Double> d2 = one._draw._drawPositon3;
        if (!(d1.size() == b.size() && b.size() == d2.size())) return;

        Paint paintText = new Paint();
        paintText.setColor(one._draw._color);
        paintText.setAlpha(DEFAULTALPHA);
        paintText.setStrokeWidth(3);
        paintText.setTextAlign(Paint.Align.LEFT);
        paintText.setTextSize(Config.legendFontSize);

        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(one._draw._color);
        paintLine.setAlpha(DEFAULTALPHA);
        paintLine.setStrokeWidth(Config.gridLineWidth);

        int count = b.size();
        final int skipData = getDataStartPos(count);

        android.graphics.Rect rect = new android.graphics.Rect();
        paintText.getTextBounds("源达", 0, 2, rect);
        final int fHeight = rect.height();

        int linelength = dip2px(canvas.getDensity(), 41);
        if (_formulaname.compareTo("趋势导航") == 0 && one._draw._para2 == 1) {
            linelength = dip2px(canvas.getDensity(), 20);
        }
        if(skipData<0){
            return;
        }
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            Double bval = b.get(dataIndex);
            if (bval > 0.000001) {
                Double number = d2.get(dataIndex);
                String strNumber = setDecimal(number, one._draw._para1);

                float pointY = getCoord().SY(number.floatValue());
                float centerS = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
                float strWidth = paintText.measureText(strNumber);

                canvas.drawText(strNumber, centerS - strWidth, pointY - fHeight / 2 + 1, paintText);
                canvas.drawLine(centerS - linelength, pointY, centerS, pointY, paintLine);

            }

        }
    }

    private void drawFormulaPointDot(FormulaResultJava one) {

        Paint paintLine = new Paint(Paint.ANTI_ALIAS_FLAG);
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(one._line._color);
        paintLine.setAlpha(DEFAULTALPHA);
        paintLine.setStrokeWidth(one._line._thick.floatValue());
        PathEffect effects = new DashPathEffect(new float[]{10, 20, 40, 80}, 1);
        paintLine.setPathEffect(effects);

        ArrayList<Double> d = one._line._data;
        int count = d.size();
        final int skipData = getDataStartPos(count);
        final int sn = Math.min(count, _ScreenNum);
        float lastpointx = Float.MAX_VALUE;
        float lastpointy = Float.MAX_VALUE;
        //The data and the coordinate are indexed separately
        if(skipData<0){
            return;
        }
        for (int i = getCoord().getRx(), dataIndex = skipData; i < _ScreenNum && dataIndex < count; i++, dataIndex++) {

            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(one._line._color);
                paintLegend.setAlpha(DEFAULTALPHA);

                Double dval = d.get(dataIndex);
                if (dval.compareTo(INVALID_DOUBLE) != 0) {

                    String legendData = one._line._name + ":" + getDecimalData(String.valueOf(dval));
                    if (legendData != null) {
                        if (this._formulaname.equals("强弱转换") || this._formulaname.equals("波动极限")) {
                            if (this.fuTu != null) {
                                if (this.fuTu.equals("fuTu1")) {
                                    fuTu1DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._line._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu1ColorList.pushString(color);
                                } else {
                                    fuTu2DataList.pushString(legendData);
                                    String color = Integer.toHexString(one._line._color);
                                    if (color.length() == 5) {
                                        color = "0" + color;
                                    } else if (color.length() == 4) {
                                        color = "00" + color;
                                    } else if (color.length() == 3) {
                                        color = "000" + color;
                                    } else if (color.length() == 2) {
                                        color = "0000" + color;
                                    } else if (color.length() == 1) {
                                        color = "00000" + color;
                                    }
                                    fuTu2ColorList.pushString(color);
                                }
                            }
                        } else {
                            getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
                            float space = paintLegend.measureText(legendData) + Config.LegendSpace;
                            _legendTextX += space;
                        }
                    }
                }

            }

            float pointy = getCoord().SY(d.get(dataIndex).floatValue());
            float pointx = (float) Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;

            if (Float.MAX_VALUE != lastpointx && Float.MAX_VALUE != lastpointy && i % 2 != 0)
                getCanvas().drawLine(lastpointx, lastpointy, pointx, pointy, paintLine);

            lastpointx = pointx;
            lastpointy = pointy;

        }

    }

    private int getSkipDataNumber(int ResponseDataNumber) {
        int skipData = ResponseDataNumber - _ScreenNum;
        if (skipData < 0)
            skipData = 0;

        return skipData;
    }

    protected int getDataStartPos(int ResponseDataNumber) {

        int res = -1;
        if (-1 == _DataStartPos) {
            res = getSkipDataNumber(ResponseDataNumber);
        } else {
            res = _DataStartPos;
        }

        return res;
    }

    protected int getScreenNumber() {
        return _ScreenNum;
    }

    protected void calcMaxMinWithFixed(MaxMin mm) {
        if (_frsJava == null) return;

        TableData datas = getLineGroup().data(0);
        if (datas.getRows() == 0) return;

        for (int n = 0; n < _frsJava.size(); ++n) {
            FormulaResultJava one = _frsJava.get(n);


            if (one._line != null) {
                ArrayList<Double> d = one._line._data;

                if (d.size() <= 0)
                    continue;

                int start = getDataStartPos(d.size());
                int sn = getScreenNumber();
                int indexEnd = start + sn;

                if (indexEnd > d.size()) {
                    indexEnd = d.size();
                }
                if(start<0){
                    start=0;
                }
                for (int i = start; i < indexEnd; i++) {
                    Double tmp = d.get(i);

                    if (one._line._name.contains("VOL")) {
                        double fixedVolume = (double) datas.getValue(i, 3);
                        tmp += fixedVolume;
                    }

                    if (tmp.equals(INVALID_DOUBLE))
                        continue;

                    mm.max = Math.max(mm.max, tmp);
                    if(one._line._name.contains("VOL")){
                        mm.min = Math.min(mm.min, 0.00);
                    }else{
                        mm.min = Math.min(mm.min, tmp);
                    }

                }
            }
        }
    }

    protected void calcMaxMinWithFundFlow(MaxMin mm) {
        if (_frsJava == null) return;

        TableData datas = getLineGroup().data(0);
        if (datas.getRows() == 0) return;

        for (int n = 0; n < _frsJava.size(); ++n) {
            FormulaResultJava one = _frsJava.get(n);


            if (one._line != null) {

            }

            if (one._draw != null) {

                int count = one._draw._drawPositon1.size();
                int indexStart = getDataStartPos(count);
                int indexEnd = indexStart + getScreenNumber();

                if (indexEnd > count) {
                    indexEnd = count;
                }
                if(indexStart<0){
                    indexStart=0;
                }
                for (int i = indexStart; i < indexEnd; i++) {
                    Double tmp1 = one._draw._drawPositon1.get(i);
                    Double tmp2 = one._draw._drawPositon2.get(i);
                    Double tmp3 = one._draw._drawPositon3.get(i);
                    Double tmp4 = one._draw._drawPositon4.get(i);
                    if (tmp1.equals(INVALID_DOUBLE)
                            || tmp2.equals(INVALID_DOUBLE)
                            || tmp3.equals(INVALID_DOUBLE)
                            || tmp4.equals(INVALID_DOUBLE))
                        continue;

                    mm.max = Math.max(mm.max, tmp1 + tmp3);
                    mm.min = Math.min(mm.min, 0 - tmp2 - tmp4);

                }

            }

        }
    }

    protected void calcMaxMin(MaxMin mm) {
        if (_frsJava == null) return;

        for (int n = 0; n < _frsJava.size(); ++n) {
            FormulaResultJava one = _frsJava.get(n);


            if (one._line != null) {
                ArrayList<Double> d = one._line._data;

                if (d.size() <= 0)
                    continue;

                int start = getDataStartPos(d.size());
                int sn = getScreenNumber();
                int indexEnd = start + sn;

                if (indexEnd > d.size()) {
                    indexEnd = d.size();
                }
                if(start<0){
                    start=0;
                }

                for (int i = start; i < indexEnd; i++) {
                    Double tmp = d.get(i);
                    if (tmp.equals(INVALID_DOUBLE))
                        continue;

                    mm.max = Math.max(mm.max, tmp);
                    if(this._formulaname.equals("VOL")){//特殊处理VOL最低价
                        mm.min = Math.min(mm.min, 0.00);
                    }else{
                        mm.min = Math.min(mm.min, tmp);
                    }


                }
            }
            if (one._draw != null) {

                if (one._draw._drawPositon1 != null
                        && FormulaDrawTypeEnum.STICKLINE != FormulaDrawTypeEnum.valueOf(one._draw._type)
                        && FormulaDrawTypeEnum.FILLRGN != FormulaDrawTypeEnum.valueOf(one._draw._type)
                        && FormulaDrawTypeEnum.DRAWNUMBER != FormulaDrawTypeEnum.valueOf(one._draw._type)
                        && FormulaDrawTypeEnum.PARTLINE != FormulaDrawTypeEnum.valueOf(one._draw._type)
                        && FormulaDrawTypeEnum.DRAWTEXT != FormulaDrawTypeEnum.valueOf(one._draw._type))
                    calcMaxMin(one._draw._drawPositon1, mm);
                if (one._draw._drawPositon2 != null) calcMaxMin(one._draw._drawPositon2, mm);
                if (one._draw._drawPositon3 != null) calcMaxMin(one._draw._drawPositon3, mm);
                if (one._draw._drawPositon4 != null) calcMaxMin(one._draw._drawPositon4, mm);
            }

        }
    }

    private void calcMaxMin(ArrayList<Double> data, MaxMin mm) {

        if (data == null || data.size() <= 0)
            return;

        int count = data.size();
        int indexStart = getDataStartPos(count);
        int indexEnd = indexStart + getScreenNumber();

        if (indexEnd > count) {
            indexEnd = count;
        }
        if(indexStart<0){
            indexStart=0;
        }
        for (int i = indexStart; i < indexEnd; i++) {
            Double tmp = data.get(i);
            if (tmp.equals(INVALID_DOUBLE))
                continue;

            mm.max = Math.max(mm.max, tmp);
            mm.min = Math.min(mm.min, tmp);

        }
    }

    class MaxMin {
        public Double max = Double.MIN_VALUE;
        public Double min = Double.MAX_VALUE;
    }

    protected boolean IsSpecificFormula() {

        if (!_formulaname.equals(null) && (
                _formulaname.compareTo("趋势导航") == 0 ||
                        _formulaname.compareTo("BOLL") == 0)) {
            return true;
        }

        return false;
    }

    public void calCoord4FormulaLine() {

        MaxMin mm = new MaxMin();

        if (this.isDayPeriod && this.isKeChuangStock && this._formulaname.equals("VOL")) {
            calcMaxMinWithFixed(mm);
        }
        else if (this._formulaname.equals("多空资金")) {
            calcMaxMinWithFundFlow(mm);
        }
        else {
            calcMaxMin(mm);
        }

        LineRange range;

        if (mm.min == Double.MAX_VALUE || mm.max == Double.MIN_VALUE) {
            if(mm.min!=Double.MAX_VALUE){
                range = new LineRange(mm.max, mm.min, mm.max - mm.min);
            }else if(mm.max!= Double.MIN_VALUE){
                range = new LineRange(mm.max, mm.min, mm.max - mm.min);
            }else{
                range = getLineGroup().range(getDataStartPos(getLineGroup().data(0).getRows()), getScreenNumber());
            }
            setRange(range);
        } else {

            range = new LineRange(mm.max, mm.min, mm.max - mm.min);
            setRange(range);
        }

//        Log.e("Coord","mm.max="+mm.max+"    mm.min="+mm.min);
//        Log.e("Coord","range.getMinVal="+range.getMinVal()+"    range.getMaxVal="+range.getMaxVal());

        Axis axis = new Axis(range.getMinVal(), range.getMaxVal(), getHeight());
        if (IsSpecificFormula()) axis = new Axis(range.getMinVal(), range.getMaxVal());
        setAxis(axis);

        float left = 0;
        float top = (float) axis.getMinValue();
        float width = _ScreenNum;
        float height = (float) (axis.getMaxValue() - axis.getMinValue());
        Rect realRect = new Rect(left, top, width, height);

        left = Config.leftRulerWidth + getLeft();
        top = getTop() + Config.LegendHeight;
        width = getWidth() - Config.leftRulerWidth - Config.rightRulerWidth;
        if (isShowAxisDate()) {
            height = getHeight() - Config.bottomRulerHeight;
        } else {
            height = getHeight();
        }
        Rect screenRect = new Rect(left, top, width, height - Config.LegendHeight);

        Coord coord = new Coord(realRect, screenRect, axis);
        setCoord(coord);

    }

    public abstract void calCoord();

    public Canvas getCanvas() {
        return canvas;
    }

    public Coord getCoord() {
        return coord;
    }

    public LineGroup getLineGroup() {
        return lines;
    }

    public Axis getAxis() {
        return axis;
    }

    public LineRange getRange() {
        return range;
    }

    public float getLeft() {
        return left;
    }

    public float getTop() {
        return top;
    }

    public float getHeight() {
        return height;
    }

    public float getWidth() {
        return width;
    }

    public void setCoord(Coord coord) {
        this.coord = coord;
    }

    public void setAxis(Axis axis) {
        this.axis = axis;
    }

    public void setRange(LineRange range) {
        this.range = range;
    }

    public boolean isShowAxisDate() {
        return showAxisDate;
    }

    public void setShowAxisDate(boolean showAxisDate) {
        this.showAxisDate = showAxisDate;
    }

    public int getGridRowNum() {
        return gridRowNum;
    }

    public void setGridRowNum(int gridRowNum) {
        this.gridRowNum = gridRowNum;
    }

    /**
     * 根据手机的分辨率从 dp 的单位 转成为 px(像素)
     */
    public static int dip2px(float scale, float dpValue) {
        return (int) (dpValue * scale + 0.5f);
    }

    /**
     * 根据手机的分辨率从 px(像素) 的单位 转成为 dp
     */
    public static int px2dip(float scale, float pxValue) {
        return (int) (pxValue / scale + 0.5f);
    }


    protected void drawFixedGrid(float startX, float startY, float endX, float endY) {

        Paint paintLine = new Paint();
        paintLine.setAntiAlias(true);
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(Config.minFixedGridLineColor);
        paintLine.setPathEffect(new DashPathEffect(new float[]{10, 5}, 1));

        Path path = new Path();
        path.moveTo(startX, startY);
        path.lineTo(endX, endY);
        getCanvas().drawPath(path, paintLine);
    }

}

