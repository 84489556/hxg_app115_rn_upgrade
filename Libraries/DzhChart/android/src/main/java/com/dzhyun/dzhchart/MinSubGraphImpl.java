package com.dzhyun.dzhchart;

import android.graphics.Canvas;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import sadcup.android.jnaonas.FormulaLineJava;
import sadcup.android.jnaonas.FormulaResultJava;

/**
 * 分时副图实现类
 */
public class MinSubGraphImpl extends GrapQtyImpl {


    public MinSubGraphImpl(Canvas canvas,
                           LineGroup lineGroup,
                           float left,
                           float top,
                           float width,
                           float height,
                           boolean isKeChuangStock){
        super(canvas, lineGroup, left, top, width, height);

        this.isKeChuangStock = isKeChuangStock;

    }

    @Override
    public void draw(){

        drawFormula();

    }

    public void calCoordFromFormula(){

        double minval = Double.MAX_VALUE;
        double maxval = Double.MIN_VALUE;
        if(_frsJava==null){
            return;
        }

        for (int i=0; i<_frsJava.size(); i++) {
            FormulaResultJava fr = _frsJava.get(i);

            if (fr._line != null && fr._line._data != null) {

                ArrayList<Double> ls = fr._line._data;

                for (int row = 0; row < ls.size(); row++) {

                    Double val = ls.get(row);

                    if (val > maxval){
                        maxval = val;
                    }
                    if(val < minval){
                        minval = val;
                    }

                }

            }
        }

        if (minval == Double.MAX_VALUE || maxval == Double.MIN_VALUE)
            return;

        LineRange range = new LineRange(maxval,minval);
        setRange(range);

        Axis axis = new Axis(range.getMinVal(), range.getMaxVal(), 0, getHeight(), 0);
        setAxis(axis);

        float left = 0;
        float top = (float)axis.getMinValue();
        float width = getLineGroup().data(0).getRows();
        float height = (float)(axis.getMaxValue() - axis.getMinValue());
        Rect realRect = new Rect(left, top, width, height);

        left = Config.leftRulerWidth + getLeft();
        top = getTop() + Config.LegendHeight;
        width = getWidth() - Config.leftRulerWidth - Config.rightRulerWidth;
        if(isShowAxisDate()){
            height = getHeight() - Config.bottomRulerHeight - Config.LegendHeight;
        }else{
            height = getHeight() - Config.LegendHeight;
        }
        Rect screenRect = new Rect(left, top, width, height);

        Coord coord = new Coord(realRect, screenRect, axis);
        setCoord(coord);
    }

    @Override
    protected void drawFormula() {

        _legendTextX = resetLegendPosition();

        switch (_formulaname) {

            case "成交量":
                drawLine_MinVOL();
                break;
            case "资金流入":
                drawLine_FundFlow();
                break;
            default:
                break;

        }

    }

    private void drawLine_MinVOL() {
        calCoord();
        drawGrid();
        drawQty();
        drawAxisPrice();
    }

    private void drawLine_FundFlow() {

        calCoordFromFormula();
        drawFunction();
        drawAxisPrice();

    }

    private void drawQty(){
        TableData datas = getLineGroup().data(0);
        Paint paint = new Paint();
        paint.setStyle(Paint.Style.FILL_AND_STROKE);
        paint.setColor(Config.minLineColor);

        double spaceRatio = Config.spaceRatio;
        int count = getCoord().getRw() + getCoord().getRx();
        if (datas.getRows() == 0) return;

        Object qtyObj = datas.getValue(0, 0);
        if (qtyObj == null){
            drawMinAssistLegend(-1);
            return;
        }

        if (this.isKeChuangStock) {

            float generalNumber = 266;
            float fixedNumber = 25;
            float fixedTimePosX = getWidth() * (generalNumber / (generalNumber + fixedNumber));

            LineRange range = getLineGroup().range();
            float startY = getCoord().SY((float)range.getMaxVal());
            float endY = getTop() + getHeight();

            drawFixedGrid(fixedTimePosX, startY, fixedTimePosX, endY);

        }

        boolean drawn = false;
        for (int i = getCoord().getRx(); i < count; i++) {
            qtyObj = datas.getValue(i, 0);
            if(qtyObj == null){

                if (false == drawn){

                    if (this._legendDataPositionForMin == -1) {
                        drawMinAssistLegend((double) (datas.getValue(i-1, 0)));
                    }
                    else {
                        drawMinAssistLegend(-1);
                    }

                }

                break;
            }
            double qty = (double)qtyObj;

            if ( (this._legendDataPositionForMin > -1 && i == this._legendDataPositionForMin)
                    || (false==drawn && i==count-1) ) {
                drawn = true;
                drawMinAssistLegend(qty);
            }


            float qtyS = getCoord().SY((float)qty);
            float left = getCoord().SX(i - getCoord().getRx());
            float right = getCoord().SX(i - getCoord().getRx() + 1);
            float centerS = (float)Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
            float width = right - left;
            float halfWidthS = (float) Math.floor(width * (1 - spaceRatio) / 2);
            float leftS = centerS - halfWidthS;
            float rightS = centerS + halfWidthS;

            if((boolean)datas.getValue(i, 1)){
                paint.setColor(Config.riseColor);
            }else{
                paint.setColor(Config.dropColor);
            }

            if((int)datas.getValue(i,2) == 1){
                paint.setColor(Config.minFixedVolColor);
            }

            if(Math.abs(halfWidthS - 0) < 0.0000001){
                getCanvas().drawLine(centerS, qtyS, centerS, getCoord().getSh() + getCoord().getSy(), paint);
            }else{
                getCanvas().drawRect(leftS, qtyS, rightS, getCoord().getSh() + getCoord().getSy(), paint);
            }
        }


    }
    boolean show;
    private void drawMinAssistLegend(double chengJiaoliang) {

        Paint paintLegend = new Paint();
        paintLegend.setTextSize(Config.legendFontSize);
        paintLegend.setAntiAlias(true);
        paintLegend.setColor(0x333333);
        paintLegend.setAlpha(DEFAULTALPHA);

        String legendData = "成交量:--";
        if (chengJiaoliang != -1) {
            legendData = "成交量:" + getDecimalData(String.valueOf(chengJiaoliang));
        }

//        getCanvas().drawText(legendData, _legendMinTextX, getTop()+ Config.topLegendHeight, paintLegend);

        if(!show) {
            if(Config.freshTimeAmount==0L||System.currentTimeMillis()-Config.freshTimeAmount>500) {
                WritableMap event = Arguments.createMap();
//        Log.w("EventEmitter","EventEmitter --chengjiaoliang:"+legendData);
                event.putString("chengjiaoliang", legendData);
                getReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("sendChengjiaoliangForMin", event);
                Config.freshTimeAmount=System.currentTimeMillis();
            }
            show=true;
        }else{
            show=false;
        }
//        getCanvas().drawText(legendData, getLeft()+Config.LegendLeftPadding+Config.LegendLeftPaddingSpace, getTop()+ Config.topLegendHeight, paintLegend);
    }

    @Override
    protected void drawFunction() {
        if (_frsJava == null) return;

        for (int n = 0; n < _frsJava.size(); ++n) {
            one = _frsJava.get(n);
            if (one._line != null) {

                if (FormulaLineTypeEnum.LINE == FormulaLineTypeEnum.valueOf(one._line._type)) {
                    drawFormulaLine(one);
                }
            }

            if (one._draw != null) {

            }


        }
    }

    private void drawFormulaLine(FormulaResultJava one) {

        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setColor(one._line._color);
        paintLine.setAlpha(DEFAULTALPHA);
//        paintLine.setStrokeWidth(one._line._thick.floatValue()* Config.formulaWidthMultiple);
        paintLine.setStrokeWidth(Config.formulaWidthMultiple);


        ArrayList<Double> d = one._line._data;


        float lastpointx = Float.MAX_VALUE;
        float lastpointy = Float.MAX_VALUE;
        if(null==getCoord()||d==null)return;
        int count=0;
        if(Config.minNum>0){
            count=Math.min(Config.minNum,d.size());
        }else{
            count=d.size();
        }
        String legendData = "";
        if (_legendDataPositionForMin == -1) {
            legendData = one._line._name + ":" + getDecimalData(d.get(count-1).toString());
        }
        else {
            if(_legendDataPositionForMin<=d.size()-1) {
                legendData = one._line._name + ":" + getDecimalData(d.get(_legendDataPositionForMin).toString());
            }
        }
        Paint paintLegend = new Paint();
        paintLegend.setTextSize(Config.legendFontSize);
        paintLegend.setAntiAlias(true);
        paintLegend.setColor(one._line._color);
        paintLegend.setAlpha(DEFAULTALPHA);
        if(paintLegend.measureText(legendData) +_legendTextX<getWidth()) {
            getCanvas().drawText(legendData, _legendTextX, getTop()+ Config.topLegendHeight, paintLegend);
            float space = paintLegend.measureText(legendData) + Config.LegendSpace;
            _legendTextX += space;
        }


//        Log.e("zjlr","_legendDataPositionForMin="+_legendDataPositionForMin);
//        Log.e("zjlr","_formulaname="+this._formulaname);
//        Log.e("zjlr","d.size()="+d.size());
//        Log.e("zjlr","minWidth="+Config.minNum);


        for (int i=0; i<count; i++) {

            float pointy = getCoord().SY(d.get(i).floatValue());
            float pointx = (float)Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;

            if (Float.MAX_VALUE != lastpointx && Float.MAX_VALUE != lastpointy)
                getCanvas().drawLine(lastpointx, lastpointy, pointx, pointy, paintLine);

            lastpointx = pointx;
            lastpointy = pointy;

        }
    }
}
