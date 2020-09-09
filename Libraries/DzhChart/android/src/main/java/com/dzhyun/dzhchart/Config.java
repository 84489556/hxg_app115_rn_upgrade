package com.dzhyun.dzhchart;

import android.content.res.Resources;
import android.graphics.Color;
import android.util.Log;

/**
 * Created by Administrator on 2015/11/9.
 */
public class Config {
    public static String chartKLine;
    public static String chartMin;
    public static int bgColor;
    public static int borderColor;
    public static int gridLineColor;
    public static int minFixedGridLineColor;
    public static int minFixedVolColor;
    public static int klineFixedVolumeDropColor;
    public static int klineFixedVolumeRiseColor;
    public static int gridFontColor;
    public static int dropColor;
    public static int riseColor;
    public static int riseColorArea;
    public static int dropColorArea;
    public static int normalColorArea;
    public static int scaleColor;
    public static int minLineColor;
    public static int avgLineColor;
    public static int LegendTextColor;
    public static int zuoShouColor;
    public static int minFillColor;
    public static int kLineMinMaxSignColor;
    public static float borderLineWidth;
    public static float gridLineWidth;
    public static float leftRulerWidth;
    public static float rightRulerWidth;
    public static float bottomRulerHeight;
    public static float topLegendHeight;
    public static float LegendSpace;
    public static float LegendLeftPadding;
    public static float LegendLeftPaddingSpace;
    public static float LegendHeight;
    public static float kLineWidth;
    public static float minLineWidth;
    public static float avgLineWidth;
    public static float fontSize;
    public static float legendFontSize;
    public static float countRatio;
    public static float spaceRatio;
    public static float axisSpaceRation;
    public static float scaleFontSize;
    public static float formulaWidthMultiple;
    public static int minNum;
    public static int freshRate=0;
    public static long freshCanvas=0;
    public static long freshTimeAmount=0;
    public static long freshTime=0;
    public static long freshFutu=0;
    public static boolean isTouch;
    public static boolean isScrollFinished=true;
    public static void init(Resources res){
        chartKLine = res.getString(R.string.dzhChartKLine);
        chartMin = res.getString(R.string.dzhChartMin);
        bgColor = res.getColor(R.color.dzhChartBgColor);
        borderColor = res.getColor(R.color.dzhChartBorderColor);
        gridLineColor = res.getColor(R.color.dzhChartGridLineColor);
        minFixedGridLineColor = res.getColor(R.color.dzhChartMinFixedGridLineColor);
        minFixedVolColor = res.getColor(R.color.dzhChartMinFixedVolColor);
        klineFixedVolumeDropColor = res.getColor(R.color.dzhChartKlineFixedVolumeDropColor);
        klineFixedVolumeRiseColor = res.getColor(R.color.dzhChartKlineFixedVolumeRiseColor);
        gridFontColor = res.getColor(R.color.dzhChartGridFontColor);
        dropColor = res.getColor(R.color.dzhChartDropColor);
        riseColor = res.getColor(R.color.dzhChartRiseColor);
        dropColorArea = res.getColor(R.color.dzhChartDropColorArea);
        riseColorArea = res.getColor(R.color.dzhChartRiseColorArea);
        normalColorArea = res.getColor(R.color.dzhChartNormalColorArea);
        scaleColor = res.getColor(R.color.dzhChartScaleColor);
        minLineColor = res.getColor(R.color.dzhChartMinLineColor);
        avgLineColor = res.getColor(R.color.dzhChartAvgLineColor);
        LegendTextColor = res.getColor(R.color.dzhChartLegendTextColor);
        zuoShouColor = res.getColor(R.color.dzhChartZuoShouColor);
        minFillColor = res.getColor(R.color.dzhChartMinFillColor);
        kLineMinMaxSignColor = res.getColor(R.color.chartKLineMinMaxSignColor);
        borderLineWidth = res.getDimension(R.dimen.dzhChartBorderLineWidth);
        gridLineWidth = res.getDimension(R.dimen.dzhChartGridLineWidth);
        leftRulerWidth = res.getDimension(R.dimen.dzhChartLeftRulerWidth);
        rightRulerWidth = res.getDimension(R.dimen.dzhChartRightRulerWidth);
        bottomRulerHeight = res.getDimension(R.dimen.dzhChartBottomRulerHeight);
        topLegendHeight = res.getDimension(R.dimen.dzhChartTopLegendHeight);
        LegendSpace = res.getDimension(R.dimen.dzhChartLegendSpace);
        LegendLeftPadding = res.getDimension(R.dimen.dzhChartLegendLeftPadding);
        LegendLeftPaddingSpace = res.getDimension(R.dimen.dzhChartLegendLeftPaddingSpace);
        LegendHeight = res.getDimension(R.dimen.dzhChartLegendHeight);
        kLineWidth = res.getDimension(R.dimen.dzhChartKLineWidth);
        minLineWidth = res.getDimension(R.dimen.dzhChartMinLineWidth);
        avgLineWidth = res.getDimension(R.dimen.dzhChartAvgLineWidth);
        fontSize = res.getDimension(R.dimen.dzhChartFontSize);
        legendFontSize = res.getDimension(R.dimen.dzhChartlegendFontSize);
        scaleFontSize = res.getDimension(R.dimen.dzhChartScaleFontSize);
        countRatio = 1f;
        spaceRatio = 0.1f;
        axisSpaceRation = 0.2f;
        formulaWidthMultiple = res.getDimension(R.dimen.dzhChartFormulaWidthMultiple);
    }
    public static int color2int(int old){
        try {
            String dcolor = Integer.toHexString(old);
            if (dcolor.length() == 6) {
                dcolor = "#ff" + dcolor;
                return Color.parseColor(dcolor);
            } else if (dcolor.length() == 4) {
                dcolor = "#ff00" + dcolor;
                return Color.parseColor(dcolor);
            } else if (dcolor.length() == 2) {
                dcolor = "#ff0000" + dcolor;
                return Color.parseColor(dcolor);
            } else {
                return old;
            }
        }catch (Exception e){
            return old;
        }
    }
}
