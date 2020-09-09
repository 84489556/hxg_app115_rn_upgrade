package com.dzhyun.dzhchart;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;

/**
 * 副图基类
 */
public abstract class GrapQtyImpl extends Graph {

    public GrapQtyImpl(Canvas canvas,
                       LineGroup lineGroup,
                       float left,
                       float top,
                       float width,
                       float height){
        super(canvas, lineGroup, left, top, width, height);

    }

    protected abstract void drawFormula();

    @Override
    public void calCoord(){
        LineRange range = getLineGroup().range();
        setRange(range);

        Axis axis = new Axis(range.getMinVal(), range.getMaxVal(), getHeight());
        setAxis(axis);

        float left = 0;
        float top = (float)axis.getMinValue();
        float width = getLineGroup().data(0).getRows();
        float height = (float)(axis.getMaxValue() - axis.getMinValue());
        Rect realRect = new Rect(left, top, width, height);

        left = Config.leftRulerWidth + getLeft();
        top = getTop()+ Config.LegendHeight;
        width = getWidth() - Config.leftRulerWidth - Config.rightRulerWidth;
        if(isShowAxisDate()){
            height = getHeight() - Config.bottomRulerHeight;
        }else{
            height = getHeight();
        }
        Rect screenRect = new Rect(left, top, width, height- Config.LegendHeight);

        Coord coord = new Coord(realRect, screenRect, axis);
        setCoord(coord);
    }

}
