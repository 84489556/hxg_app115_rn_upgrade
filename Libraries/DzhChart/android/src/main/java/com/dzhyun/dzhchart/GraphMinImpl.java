package com.dzhyun.dzhchart;

import android.graphics.Canvas;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import sadcup.android.jnaonas.FormulaResultJava;

/**
 * Created by Administrator on 2015/11/14.
 */
public class GraphMinImpl extends Graph {
    private float zuoShou;
    private ReactContext reactContext = null;
    int id;
    boolean isKeChuangStock = false;
    double circulateEquityA = 0;
    public GraphMinImpl(Canvas canvas, LineGroup lines, float zuoSHou, float left, float top, float width, float height, ReactContext reactContext, int id, boolean isKeChuangStock, double circulateEquityA){
        super(canvas, lines, left, top, width, height);
        this.reactContext = reactContext;
        this.zuoShou = zuoSHou;
        this.id = id;
        this.isKeChuangStock = isKeChuangStock;
        this.circulateEquityA = circulateEquityA;
    }

    public float getZuoShou() {
        return zuoShou;
    }

    public void setZuoShou(float zuoShou) {
        this.zuoShou = zuoShou;
    }

    public void draw(){
        setShowAxisDate(true);
        calCoord();
        drawGrid();
        drawTradeSectionPosition();
        drawFormula();
        drawAxisPrice();
    }

    protected void drawFormula() {

        switch (_formulaname) {

            case "分时走势":
                drawMin();
                break;
            case "分时冲关":
                drawLine_STZF();
                break;
            default:
                break;

        }


    }

    @Override
    public void calCoord(){
        LineRange range = getLineGroup().range(this._isStopTrading);
        if(range.getMinVal()==Double.MAX_VALUE&&range.getMaxVal()==Double.MIN_VALUE){
            range.setMinVal(-0.10);
            range.setMaxVal(0.10);
        }
        setRange(range);

        Axis axis = new Axis(range.getMinVal(), range.getMaxVal(), zuoShou, getHeight(), 0);
        setAxis(axis);

        float left = 0;
        float top = (float)axis.getMinValue();
        float width = getLineGroup().data(0).getRows();
        float height = (float)(axis.getMaxValue() - axis.getMinValue());
        Rect realRect = new Rect(left, top, width, height);

        left = Config.leftRulerWidth + getLeft();
        top = getTop();
        width = getWidth() - Config.leftRulerWidth - Config.rightRulerWidth;
        if(isShowAxisDate()){
            height = getHeight() - Config.bottomRulerHeight;
        }else{
            height = getHeight();
        }
        Rect screenRect = new Rect(left, top, width, height);

        Coord coord = new Coord(realRect, screenRect, axis);
        setCoord(coord);
    }

    @Override
    public void drawAxisPrice(){
        Paint paint = new Paint();
        paint.setAntiAlias(true);
//        paint.setStyle(Paint.Style.STROKE);
        paint.setColor(Config.scaleColor);
        paint.setTextSize(Config.scaleFontSize);
        Paint.FontMetrics fontMetrics = paint.getFontMetrics();

        Axis axises = getCoord().getAxis();
        float correct = 0;
        int displayLen = axises.length()-1;
        int start = 1;

        if (axises.length() == 3) {
            displayLen = 3;
            start = 0;
        }
        for (int i = start; i < displayLen; i++) {
            float ry = (float)axises.getAxis(i);
            float sy = getCoord().SY(ry);

            if (i == 0) {
                correct = fontMetrics.bottom;
            } else if (i == displayLen - 1) {
                correct = fontMetrics.top;
            } else {
                correct = 0;
            }

            String text = String.format("%#.2f", ry);
//            if(ry > 1000000){
//                text = String.format("%dM", (int)(ry / 1000000));
//            }else if(ry > 1000){
//                text = String.format("%dK", (int)(ry / 1000));
//            }else{
//                text = String.format("%#.2f", ry);
//            }
            if (text.length() > 5) {
                text = text.replace(".00", "");
            }

            float zhangdie = ry-zuoShou;
            if(Math.abs(zhangdie) < 0.000001){
                paint.setColor(Config.scaleColor);
            }else if(zhangdie > 0){
                paint.setColor(Config.riseColor);
            }else{
                paint.setColor(Config.dropColor);
            }
            float textWidth = paint.measureText(text);
            float pxl = getLeft() + Config.leftRulerWidth * (1 - Config.axisSpaceRation) - textWidth;
            pxl = pxl > 0 ? pxl : 0;
            getCanvas().drawText(text, pxl+ Config.LegendLeftPadding, sy - correct, paint);

            if(Math.abs(zhangdie) < 0.000001){
                paint.setColor(Config.scaleColor);
            }else if(zhangdie > 0){
                paint.setColor(Config.riseColor);
            }else{
                paint.setColor(Config.dropColor);
            }
            text = String.format("%#.2f%%", zhangdie/zuoShou * 100);
            textWidth = paint.measureText(text);
            if(zuoShou!=0) {
                getCanvas().drawText(text, getLeft() + getWidth() - textWidth, sy - correct, paint);
            }
        }
    }

    private void drawTradeSectionPosition() {

        TableData tradeTimeSectionDatum = getLineGroup().getTradeTimeSection();
        int rows = tradeTimeSectionDatum.getRows();
        int cols = tradeTimeSectionDatum.getCols();
        if (rows > 0 && cols > 0) {
            String[] sectionPosArray = new String[rows+1];
            String textTimePos = (String) tradeTimeSectionDatum.getValue(0, 0);
            if (!textTimePos.isEmpty()) {
                sectionPosArray[0] = textTimePos.substring(0, textTimePos.length() -2) + ":" + textTimePos.substring(textTimePos.length() -2, textTimePos.length());
            }
            for(int sectionIndex = 0; sectionIndex < rows && (sectionIndex+1) < sectionPosArray.length; sectionIndex++) {
                textTimePos = (String) tradeTimeSectionDatum.getValue(sectionIndex, 1);
                sectionPosArray[sectionIndex+1] = textTimePos.substring(0, textTimePos.length() -2) + ":" + textTimePos.substring(textTimePos.length() -2, textTimePos.length());
            }

            Paint paintDate = new Paint();
            paintDate.setTextSize(Config.scaleFontSize);
            paintDate.setAntiAlias(true);
            paintDate.setColor(Config.scaleColor);
            Paint.FontMetrics fontMetrics = paintDate.getFontMetrics();
            float padding = fontMetrics.top/2;


            if (this.isKeChuangStock) {

                float generalNumber = 266;
                float fixedNumber = 26;
                float fixedTimePosX = getWidth() * (generalNumber / (generalNumber + fixedNumber));

                for (int i = 0; i < sectionPosArray.length; i++) {
                    String text = sectionPosArray[i];
                    float textWidth = paintDate.measureText(text);
                    float height = getHeight() - Config.bottomRulerHeight / 2 - padding;

                    float thirdStart = fixedTimePosX - textWidth/2 - Config.LegendLeftPadding;
                    float secondStart = (fixedTimePosX - textWidth) / 2;

                    if (i == 0) {
                        getCanvas().drawText(text, getLeft() + Config.LegendLeftPadding, height, paintDate);
                    } else if (i == sectionPosArray.length - 1) {
                        getCanvas().drawText(text, thirdStart, height, paintDate);
                        drawFixedGrid(fixedTimePosX, height, fixedTimePosX, 0);
                    } else {
                        getCanvas().drawText(text, secondStart, height, paintDate);
                    }


                }
            }

            else {

                for (int i=0; i<sectionPosArray.length; i++) {
                    String text = sectionPosArray[i];
                    float textWidth = paintDate.measureText(text);
                    float height = getHeight() - Config.bottomRulerHeight/2 - padding;

                    if(i == 0){
                        getCanvas().drawText(text, getLeft()+ Config.LegendLeftPadding, height, paintDate);
                    }else if(i == sectionPosArray.length -1){
                        getCanvas().drawText(text, getWidth() - textWidth - Config.LegendLeftPadding, height, paintDate);
                    }else{
                        getCanvas().drawText(text, (getWidth() - textWidth)/2, height, paintDate);
                    }
                }

            }


        }
    }

    public void drawMin(){

        //draw zuo shou price line.
        Paint paintZs = new Paint();
        paintZs.setColor(Config.zuoShouColor);
        paintZs.setStyle(Paint.Style.STROKE);
        paintZs.setStrokeWidth(Config.gridLineWidth);
        paintZs.setPathEffect(new DashPathEffect(new float[]{10, 5}, 1));
        float zuoShouY = getCoord().SY(zuoShou);
        Path path = new Path();
        path.moveTo(getLeft(), zuoShouY);
        path.lineTo(getLeft() + getWidth(), zuoShouY);
        getCanvas().drawPath(path, paintZs);

        //dram min and avg price line
        Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setStyle(Paint.Style.FILL_AND_STROKE);
        paint.setStrokeWidth(Config.minLineWidth);
        paint.setColor(Config.minLineColor);
        paint.setStrokeWidth(Config.minLineWidth);
        Paint paintAvg = new Paint();
        paintAvg.setAntiAlias(true);
        paintAvg.setStyle(Paint.Style.FILL_AND_STROKE);
        paintAvg.setStrokeWidth(Config.avgLineWidth);
        paintAvg.setColor(Config.avgLineColor);

        TableData datas = getLineGroup().data(0);
        if (datas.getRows() == 0) return;

        float lastX = getCoord().SX(getCoord().getRx() + 0.5f);
        Object priceObj = datas.getValue(0, 1);
        Object priceAvgObj = datas.getValue(0, 2);
        if (priceObj == null || priceAvgObj == null){
//            drawLegend("--", -1, -1);
            if(reactContext != null){
                WritableMap event = Arguments.createMap();
                event.putString("shijian","--");
                event.putDouble("chengjiaojia",-1);
                event.putDouble("junjia",-1);
                event.putDouble("zuoshou",zuoShou);
                reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                        id,//native和js两个视图会依据getId()而关联在一起
                        "sendData",//事件名称
                        event
                );
            }
            return;
        }
        double price = (double)priceObj;
        float lastY = getCoord().SY((float) price);
        int count = getCoord().getRw() + getCoord().getRx();

        double priceAvg = (double)priceAvgObj;
        float lastYAvg = getCoord().SY((float) priceAvg);
        Path pathMin = new Path();
        pathMin.moveTo(getLeft(), getTop() + getHeight() - Config.bottomRulerHeight);
//        boolean drawn = false;
//        SimpleDateFormat format = new SimpleDateFormat("HH:mm");
//        Log.e("zjlr","count="+count);
//        Log.e("zjlr","datas.getRows()="+datas.getRows());
        for (int i = getCoord().getRx() + 1; i < count || i < datas.getRows(); i++) {
            Object chengJiaoObj = datas.getValue(i, 1);
            Object junJiaObj = datas.getValue(i, 2);
            if(chengJiaoObj == null || junJiaObj == null){
                Config.minNum=i;
//                Log.e("zjlr","minWidth="+Config.minNum);

//                if (false == drawn){
//
//                    if (this._legendDataPositionForMin == -1) {
//                        drawn = true;
//
//                        double chengJiaoJia = (double)(datas.getValue(i-1, 1));
//                        double junJia = (double)(datas.getValue(i-1, 2));
////                        drawLegend(format.format((Date)datas.getValue(i, 0)), chengJiaoJia, junJia);
//                        if(reactContext != null){
//                            WritableMap event = Arguments.createMap();
////                            event.putString("shijian",format.format((Date)datas.getValue(i, 0)));
//                            event.putString("shijian",format.format((Date)datas.getValue(i-1, 0)));
//                            event.putDouble("chengjiaojia",chengJiaoJia);
//                            event.putDouble("junjia",junJia);
//                            event.putDouble("zuoshou",zuoShou);
//                            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
//                                    id,//native和js两个视图会依据getId()而关联在一起
//                                    "sendData",//事件名称
//                                    event
//                            );
//                        }
//                    }
//                    else {
////                        drawLegend(format.format((Date)datas.getValue(this._legendDataPositionForMin, 0)), -1, -1);
//                        if(reactContext != null){
//                            WritableMap event = Arguments.createMap();
//                            event.putString("shijian",format.format((Date)datas.getValue(i, 0)));
//                            event.putDouble("chengjiaojia",-1);
//                            event.putDouble("junjia",-1);
//                            event.putDouble("zuoshou",zuoShou);
//                            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
//                                    id,//native和js两个视图会依据getId()而关联在一起
//                                    "sendData",//事件名称
//                                    event
//                            );
//                        }
//                    }
//
//                }

                break;
            }

            double chengJiaoJia = (double)chengJiaoObj;
            double junJia = (double)junJiaObj;

//            if ( (this._legendDataPositionForMin > -1 && i == this._legendDataPositionForMin)
//                    || (false==drawn && i==count-1) ) {
//                drawn = true;
//                if(reactContext != null){
//                    WritableMap event = Arguments.createMap();
//                    if(this._legendDataPositionForMin==0){
//                        Object chengJiaoObjtemp = datas.getValue(0, 1);
//                        Object junJiaObjtemp = datas.getValue(0, 2);
//                        event.putString("shijian",format.format((Date)datas.getValue(0, 0)));
//                        event.putDouble("chengjiaojia",(double)chengJiaoObjtemp);
//                        event.putDouble("junjia",(double)junJiaObjtemp);
//                    }else {
//                        event.putString("shijian",format.format((Date)datas.getValue(i, 0)));
//                        event.putDouble("chengjiaojia",chengJiaoJia);
//                        event.putDouble("junjia",junJia);
//                    }
//                    event.putDouble("zuoshou",zuoShou);
//                    reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
//                            id,//native和js两个视图会依据getId()而关联在一起
//                            "sendData",//事件名称
//                            event
//                    );
//                }
//            }

            float currentY = getCoord().SY((float)chengJiaoJia);
            float currentYAvg = getCoord().SY((float)junJia);
            float currentX = getCoord().SX(i - getCoord().getRx() + 0.5f);

            getCanvas().drawLine(lastX, lastY, currentX, currentY, paint);
            pathMin.lineTo(currentX, currentY);
            if(isKeChuangStock){
                if(i<266) {//科创
                    Config.minNum = i;
                }
            }else{
                if(i<241) {
                    Config.minNum = i;
                }
            }
            if(i<241){//科创均价也是241个点
//                Log.e("zjlr","minWidth="+Config.minNum);
                getCanvas().drawLine(lastX, lastYAvg, currentX, currentYAvg, paintAvg);
            }

            lastX = currentX;
            lastY = currentY;
            lastYAvg = currentYAvg;
        }
        pathMin.lineTo(lastX, getTop() + getHeight() - Config.bottomRulerHeight);
        pathMin.close();
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Config.minFillColor);
        getCanvas().drawPath(pathMin, paint);
    }

    private void drawLine_STZF() {

        drawMin();
        drawFunction();
//        drawShuangChong();
    }

    private void drawLegend(String strTime, double chengJiaoJia, double junJia) {
        Paint paintLegend = new Paint();
        paintLegend.setTextSize(Config.legendFontSize);
        paintLegend.setAntiAlias(true);
        paintLegend.setColor(Config.LegendTextColor);
        paintLegend.setAlpha(DEFAULTALPHA);

        String legendData = "时间:" + strTime;
        getCanvas().drawText(legendData, _legendMinTextX, getTop()+ Config.topLegendHeight, paintLegend);
        float space = paintLegend.measureText(legendData) + Config.LegendSpace;
        _legendMinTextX += space;

        if (chengJiaoJia == -1) {
            legendData = "现价:--";
            getCanvas().drawText(legendData, _legendMinTextX, getTop()+ Config.topLegendHeight, paintLegend);
            space = paintLegend.measureText(legendData) + Config.LegendSpace;
            _legendMinTextX += space;

            legendData = "涨幅:--";
            getCanvas().drawText(legendData, _legendMinTextX, getTop()+ Config.topLegendHeight, paintLegend);
            space = paintLegend.measureText(legendData) + Config.LegendSpace;
            _legendMinTextX += space;
        }
        else {
            if (chengJiaoJia-zuoShou > 0) {
                paintLegend.setColor(Config.riseColor);
            }
            else if (chengJiaoJia-zuoShou == 0) {
                paintLegend.setColor(Config.LegendTextColor);
            }
            else {
                paintLegend.setColor(Config.dropColor);
            }
            legendData = "现价:" + String.valueOf(chengJiaoJia);
            getCanvas().drawText(legendData, _legendMinTextX, getTop()+ Config.topLegendHeight, paintLegend);
            space = paintLegend.measureText(legendData) + Config.LegendSpace;
            _legendMinTextX += space;

            legendData = "涨幅:" + getDecimalData(String.valueOf( (chengJiaoJia-zuoShou) * 100 / zuoShou )) + "%";
            getCanvas().drawText(legendData, _legendMinTextX, getTop()+ Config.topLegendHeight, paintLegend);
            space = paintLegend.measureText(legendData) + Config.LegendSpace;
            _legendMinTextX += space;
        }

        if (junJia == -1) {
            legendData = "均价:--";
        }
        else {
            legendData = "均价:" + getDecimalData(String.valueOf(junJia));
        }
        paintLegend.setColor(Config.avgLineColor);
        getCanvas().drawText(legendData, _legendMinTextX, getTop()+ Config.topLegendHeight, paintLegend);
        space = paintLegend.measureText(legendData) + Config.LegendSpace;
        _legendMinTextX += space;

    }
}
