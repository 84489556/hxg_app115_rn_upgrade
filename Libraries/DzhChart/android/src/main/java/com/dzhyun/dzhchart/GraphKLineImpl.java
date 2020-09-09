package com.dzhyun.dzhchart;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.text.SimpleDateFormat;
import java.util.Date;


/**
 * Created by Administrator on 2015/11/14.
 */
public class GraphKLineImpl extends Graph {

    private float _maxX = -1, _maxY = -1, _minX = -1, _minY = -1;
    private double _KlineMax = 0, _KlineMin = Double.MAX_VALUE;

    public float get_maxX() {
        return _maxX;
    }

    public float get_maxY() {
        return _maxY;
    }

    public float get_minX() {
        return _minX;
    }

    public float get_minY() {
        return _minY;
    }

    public double get_KlineMax() {
        return _KlineMax;
    }

    public double get_KlineMin() {
        return _KlineMin;
    }


    private ReactContext reactContext = null;
    int id;



    public GraphKLineImpl(Canvas canvas, LineGroup lines, float left, float top, float width, float height, ReactContext reactContext, int id, boolean isKeChuangStock){
        super(canvas, lines, left, top, width, height);
        this.reactContext = reactContext;
        this.id = id;
        this.isKeChuangStock = isKeChuangStock;
    }

    @Override
    public void calCoord(){
        LineRange range = getLineGroup().range(getDataStartPos(getLineGroup().data(0).getRows()),getScreenNumber());
        setRange(range);

//        Axis axis = new Axis(range.getMinVal(), range.getMaxVal(), getHeight(), 2);
        Axis axis = new Axis(range.getMinVal(), range.getMaxVal());

        setAxis(axis);

        float left = 0;
        float top = (float)axis.getMinValue();
        float width = _ScreenNum;
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
            start = 0;
            displayLen = axises.length();
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

            float textWidth = paint.measureText(text);
            float pxl = getLeft() + Config.leftRulerWidth * (1 - Config.axisSpaceRation) - textWidth;
            pxl = pxl > 0 ? pxl : 0;
            getCanvas().drawText(text, pxl+ Config.LegendLeftPadding, sy - correct, paint);
        }
    }

    private void drawMinMax() {

        if (_maxX == -1 || _maxY == -1 || _minX == -1 || _minY == -1) return;

//        LineRange lr = getRange();
//        double max = lr.getMaxVal();
//        double min = lr.getMinVal();
        java.text.DecimalFormat   df   =new   java.text.DecimalFormat("#.00");

        double max = _KlineMax, min = _KlineMin;


        Paint paintMM = new Paint();
        paintMM.setAntiAlias(true);
//        paintMM.setStyle(Paint.Style.STROKE);
        paintMM.setColor(Config.kLineMinMaxSignColor);
        paintMM.setTextSize(Config.legendFontSize);
        float fontHeight = paintMM.getFontMetrics().descent - paintMM.getFontMetrics().ascent;
        float shortLineLength = paintMM.measureText("AA", 0, 2);
        float screenWidth = getWidth();

        {

//            String strMax = Double.toString(max);
            String strMax = df.format(max);

            float maxX = _maxX;
            float maxY = _maxY;

            float strWidth = paintMM.measureText(strMax, 0, strMax.length());
            if (maxX + strWidth*2 > screenWidth) {
                getCanvas().drawLine(maxX, maxY, maxX-shortLineLength, maxY+fontHeight/2, paintMM);
                getCanvas().drawText(strMax, maxX - shortLineLength - strWidth, maxY+fontHeight, paintMM);
            }
            else {
                getCanvas().drawLine(maxX, maxY, maxX+shortLineLength, maxY+fontHeight, paintMM);
                getCanvas().drawText(strMax, maxX + shortLineLength, maxY+2*fontHeight, paintMM);
            }

        }

        {
//            String strMin = Double.toString(min);
            String strMin = df.format(min);

            float minX = _minX;
            float minY = _minY;

            float strWidth = paintMM.measureText(strMin, 0, strMin.length());
            if (minX + strWidth*2 > screenWidth) {
                getCanvas().drawLine(minX, minY, minX-shortLineLength, minY-fontHeight/2, paintMM);
                getCanvas().drawText(strMin, minX - shortLineLength - strWidth, minY-fontHeight, paintMM);
            }
            else {
                getCanvas().drawLine(minX, minY, minX+shortLineLength, minY-fontHeight, paintMM);
                getCanvas().drawText(strMin, minX + shortLineLength, minY-fontHeight, paintMM);
            }

        }
    }

    public void drawkLine(){
        TableData kdatas = getLineGroup().data(0);
        if (kdatas.getRows() <= 0 )
            return;

        Paint paintDate = new Paint();
        paintDate.setTextSize(Config.scaleFontSize);
        paintDate.setAntiAlias(true);
        paintDate.setColor(Config.scaleColor);
        SimpleDateFormat format = new SimpleDateFormat("yyy-MM-dd");
        Paint.FontMetrics fontMetrics = paintDate.getFontMetrics();
        float padding = fontMetrics.top/2;
        final int skipData = getDataStartPos(kdatas.getRows());
        //int dateIndex[] = {skipData, (skipData + kdatas.getRows()) / 2, kdatas.getRows() - 1};

        //int sn = Math.min(kdatas.getRows(), _ScreenNum);
        //int dateIndex[] = {skipData, (sn + 2*skipData) / 2, skipData + sn - 1};
        int dateIndex[] = {skipData, (_ScreenNum + 2*skipData) / 2, skipData + _ScreenNum - 1};

        Paint paint = new Paint();
        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setStrokeWidth(Config.kLineWidth);


        double spaceRatio = Config.spaceRatio;
        final int scaleLineLength = 2;

//        LineRange lr = getRange();
//        double max = lr.getMaxVal();
//        double min = lr.getMinVal();
//        boolean maxDrawn = false, minDrawn = false;
        double lastmax = 0, lastmin = Double.MAX_VALUE;
        double lastClose = 0;
        if(skipData<0){
            return;
        }

        //The data and the coordinate are indexed separately
        for (int i = getCoord().getRx(),dataIndex = skipData; i < _ScreenNum && dataIndex < kdatas.getRows(); i++,dataIndex++) {

            double open = (double) kdatas.getValue(dataIndex, 1);
            double high = (double) kdatas.getValue(dataIndex, 2);
            double low = (double) kdatas.getValue(dataIndex, 3);
            double close = (double) kdatas.getValue(dataIndex, 4);

            float openS = getCoord().SY((float) open);
            float highS = getCoord().SY((float) high);
            float lowS = getCoord().SY((float) low);
            float closeS = getCoord().SY((float) close);

            float left = getCoord().SX(i - getCoord().getRx());
            float right = getCoord().SX(i - getCoord().getRx() + 1);
            float centerS = (float)Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;
            float width = right - left;
            float space = (float) (width * (1-spaceRatio));
            float halfWidthS = (float) Math.floor(space);
            float leftS = centerS - halfWidthS/2;
            float rightS = centerS + halfWidthS/2;

            //draw date
//            if (dataIndex==dateIndex[0] || dataIndex==dateIndex[1] || dataIndex==dateIndex[2]) {
//                paintLine.setColor(Config.scaleColor);
//                float zeroY = getHeight() - Config.bottomRulerHeight/2  - padding;
//                getCanvas().drawLine(centerS, zeroY, centerS, zeroY+scaleLineLength, paintLine);
//
//                String text = format.format((Date)kdatas.getValue(dataIndex, 0));
//                float textWidth = paintDate.measureText(text);
//
//                if(dataIndex==dateIndex[0]){
//                    getCanvas().drawText(text, getLeft()+ Config.LegendLeftPadding, getHeight() - Config.bottomRulerHeight/2 - padding, paintDate);
//                }else if(dataIndex==dateIndex[2]){
//                    getCanvas().drawText(text, getWidth() - textWidth - Config.LegendLeftPadding, getHeight() - Config.bottomRulerHeight/2  - padding, paintDate);
//                }else{
//                    getCanvas().drawText(text, centerS - textWidth/2, getHeight() - Config.bottomRulerHeight/2  - padding, paintDate);
//                }
//            }
            //end

            //draw min and max
            //if (high == max && !maxDrawn) {
            if (high > lastmax) {
                lastmax = high;
                _maxX = centerS;
                _maxY = highS;
//                maxDrawn = true;
            }

//            if (low == min && !minDrawn) {
            if (low < lastmin) {
                lastmin = low;
                _minX = centerS;
                _minY = lowS;
//                minDrawn = true;
            }
            //end draw min and max


            if (open > close || (open == close && open<lastClose) ) {
                paint.setColor(Config.dropColor);
                paintLine.setColor(Config.dropColor);
                getCanvas().drawLine(centerS, highS, centerS, openS, paintLine);
                getCanvas().drawLine(centerS, closeS, centerS, lowS, paintLine);

                paint.setStyle(Paint.Style.FILL_AND_STROKE);
				if (Math.abs(openS - closeS) < 1) {
                    getCanvas().drawLine(leftS, openS, rightS, openS, paintLine);
                }else {
                    getCanvas().drawRect(leftS, openS, rightS, closeS, paint);
                }
            } else {
                paint.setColor(Config.riseColor);
                paintLine.setColor(Config.riseColor);
                getCanvas().drawLine(centerS, highS, centerS, closeS, paintLine);
                getCanvas().drawLine(centerS, openS, centerS, lowS, paintLine);

                paint.setStyle(Paint.Style.FILL_AND_STROKE);
			    if (Math.abs(openS - closeS) < 1) {
                    getCanvas().drawLine(leftS, closeS, rightS, closeS, paintLine);
                } else {
                    getCanvas().drawRect(leftS, closeS, rightS, openS, paint);
                }
            }

            lastClose = close;
        }

        _KlineMax = lastmax;
        _KlineMin = lastmin;

    }

    protected void drawAxisDate(){
        TableData kdatas = getLineGroup().data(0);
        if (kdatas.getRows() <= 0 )
            return;

        Paint paintDate = new Paint();
        paintDate.setTextSize(Config.scaleFontSize);
        paintDate.setAntiAlias(true);
        paintDate.setColor(Config.scaleColor);

        SimpleDateFormat format = new SimpleDateFormat("yyy-MM-dd");
        Paint.FontMetrics fontMetrics = paintDate.getFontMetrics();
        float padding = fontMetrics.top/2;
        int skipData = getDataStartPos(kdatas.getRows());
        if(skipData<0){
            skipData=0;
        }
        int dateIndex[] = {skipData, (_ScreenNum + 2*skipData) / 2, skipData + _ScreenNum - 1};

        Paint paintLine = new Paint();
        paintLine.setStyle(Paint.Style.STROKE);
        paintLine.setStrokeWidth(Config.kLineWidth);



        final int scaleLineLength = 2;

        for (int i = getCoord().getRx(),dataIndex = skipData; i < _ScreenNum && dataIndex < kdatas.getRows(); i++,dataIndex++) {

            float centerS = (float)Math.floor(getCoord().SX(i - getCoord().getRx() + 0.5f)) - 0.5f;

            if (dataIndex==dateIndex[0] || dataIndex==dateIndex[1] || dataIndex==dateIndex[2]) {
                paintLine.setColor(Config.scaleColor);
                float zeroY = getHeight() - Config.bottomRulerHeight/2  - padding;
                getCanvas().drawLine(centerS, zeroY, centerS, zeroY+scaleLineLength, paintLine);

                String text = format.format((Date)kdatas.getValue(dataIndex, 0));
                float textWidth = paintDate.measureText(text);

                if(dataIndex==dateIndex[0]){
                    getCanvas().drawText(text, getLeft()+Config.LegendLeftPadding, getHeight() - Config.bottomRulerHeight/2 - padding, paintDate);
                }else if(dataIndex==dateIndex[2]){
                    getCanvas().drawText(text, getWidth() - textWidth - Config.LegendLeftPadding, getHeight() - Config.bottomRulerHeight/2  - padding, paintDate);
                }else{
                    getCanvas().drawText(text, centerS - textWidth/2, getHeight() - Config.bottomRulerHeight/2  - padding, paintDate);
                }
            }

        }

    }

    protected void drawLegendDate() {
        TableData kdatas = getLineGroup().data(0);
        if (kdatas.getRows() <= 0 )
            return;

        SimpleDateFormat format = new SimpleDateFormat("yyy/MM/dd");
        final int skipData = getDataStartPos(kdatas.getRows());
        final int sn = Math.min(kdatas.getRows(), _ScreenNum);
        if(skipData<0){
            return;
        }

        for (int i = getCoord().getRx(),dataIndex = skipData; i < _ScreenNum && dataIndex < kdatas.getRows(); i++,dataIndex++) {
            //legend area
            if ((this._legendDataPosition == -1 && dataIndex == skipData + sn - 1)
                    || (this._legendDataPosition > -1 && dataIndex == this._legendDataPosition)) {

                Paint paintLegend = new Paint();
                paintLegend.setTextSize(Config.legendFontSize);
                paintLegend.setAntiAlias(true);
                paintLegend.setColor(Color.BLACK);
                paintLegend.setAlpha(DEFAULTALPHA);

                String legendData = format.format((Date) kdatas.getValue(dataIndex, 0));
//                getCanvas().drawText(legendData, _legendTextX, getTop() + Config.topLegendHeight, paintLegend);
//                float space = paintLegend.measureText(legendData) + Config.LegendSpace;
//                _legendTextX += space;
//                if(reactContext != null){
//                    WritableMap event = Arguments.createMap();
//                    event.putString("time",legendData);
//                    reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
//                            id,//native和js两个视图会依据getId()而关联在一起
//                            "sendTimeForKLine",//事件名称
//                            event
//                    );
//                }

            }
        }
    }

    public void drawFormulaLine() {
        _legendTextX = resetLegendPosition();
        drawLegendDate();

        switch (_formulaname) {

            case "MA":
                drawLine_MA();
                break;
            case "BOLL":
                drawLine_BOLL();
                break;
            case "点石成金":
                drawLine_DSCJ();
                break;
            case "抄底策略":
                drawLine_CDCL();
                break;
            case "逃顶策略":
                drawLine_TDCL();
                break;
            case "短线趋势":
                drawLine_DXQS();
                break;
            case "中线趋势":
                drawLine_ZXQS();
                break;
            case "趋势彩虹":
                drawLine_QSCH();
                break;
            case "短线趋势彩虹":
                drawLine_SQSCH();
                break;
            case "济安线":
                drawLine_JAX();
                break;
            case "中期彩带":
            case "蓝粉彩带":
                drawLine_LFCD();
                break;
            case "趋势导航":
                drawLine_QSDH();
                break;
            case "多空预警"://原九转战法
                drawGraph_JZXL();
                break;
            case "顶底判断":
                drawGraph_DDPD();
                break;
            default:
                break;

        }
    }

    private void drawLine_MA() {
        drawFunction();
    }

    private void drawLine_BOLL() {
        drawFunction();
    }

    private void drawLine_DSCJ() {
        drawFunction();
    }

    private void drawLine_CDCL() {
        drawFunction();
    }

    private void drawLine_TDCL() {
        drawFunction();
    }

    private void drawLine_DXQS() {
        drawFunction();
        drawkLine();
    }

    private void drawLine_ZXQS() {
        drawFunction();
        drawkLine();
    }

    private void drawLine_QSCH() {
        drawFunction();
        drawkLine();
    }
	
	private void drawLine_SQSCH() {
        drawFunction();
        drawkLine();
    }

    private void drawLine_JAX() {
        drawFunction();
    }

    private void drawLine_LFCD() {
        drawFunction();
        drawkLine();
    }

    private void drawLine_QSDH() {
        drawFunction();
    }

    private void drawGraph_JZXL() {
        drawFunction();
        drawkLine();
    }

    private void drawGraph_DDPD() {
        drawFunction();
        drawkLine();
    }

    public void draw(){

        setShowAxisDate(true);

//        if(IsSpecificFormula()) calCoord4FormulaLine();
////        else calCoord();

        calCoord4KLine();


        drawGrid();

        if(!IsSpecificFormula() || _formulaname.compareTo("BOLL")==0) drawkLine();
        drawFormulaLine();
        drawAxisPrice();
        drawAxisDate();
        if(!IsSpecificFormula() || _formulaname.compareTo("BOLL")==0) drawMinMax();

    }

    private void calCoord4KLine() {

        MaxMin mm = new MaxMin();

        if (this.isDayPeriod && this.isKeChuangStock && this._formulaname.equals("VOL")) {
            calcMaxMinWithFixed(mm);
        }
        else{
            calcMaxMin(mm);
        }

        LineRange range;

        // 指标数据获取的最大最小为无效值，则获取原始K线的最大最小值
        if(mm.min == Double.MAX_VALUE || mm.max == Double.MIN_VALUE) {

            range = getLineGroup().range(getDataStartPos(getLineGroup().data(0).getRows()),getScreenNumber());
            setRange(range);
        }
        else {

            range = getLineGroup().range(getDataStartPos(getLineGroup().data(0).getRows()),getScreenNumber());
            double max = Math.max(mm.max,range.getMaxVal());
            double min = Math.min(mm.min,range.getMinVal());
            range = new LineRange(max, min, max-min);

            setRange(range);
        }

        Axis axis = new Axis(range.getMinVal(), range.getMaxVal());
        setAxis(axis);

        float left = 0;
        float top = (float)axis.getMinValue();
        float width = _ScreenNum;
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

}
