package com.dzhyun.dzhchart;

import android.graphics.Canvas;


/**
 * K线副图实现类
 */
public class KLineSubGraphImpl extends GrapQtyImpl {



    public KLineSubGraphImpl(Canvas canvas,
                       LineGroup lineGroup,
                       float left,
                       float top,
                       float width,
                       float height,
                       boolean isKeChuangStock,
                       int period){
        super(canvas, lineGroup, left, top, width, height);

        this.isKeChuangStock = isKeChuangStock;
        this.isDayPeriod = (period == 5);//5代表日K，与RN中定义一致
    }

    @Override
    public void draw(){

        calCoord4FormulaLine();
        drawGrid();
        drawFormula();

        drawAxisPrice();
    }

    @Override
    protected void drawFormula() {


        switch (_formulaname) {

            case "VOL":
                drawGraph_VOL();
                break;
            case "MACD":
                drawGraph_MACD();
                break;
            case "KDJ":
                drawGraph_KDJ();
                break;
            case "RSI":
                drawGraph_RSI();
                break;
            case "BIAS":
                drawGraph_BIAS();
                break;
            case "CCI":
                drawGraph_CCI();
                break;
            case "WR":
                drawGraph_WR();
                break;
            case "DMA":
                drawGraph_DMA();
                break;
            case "变盘预测":
                drawGraph_BPYC();
                break;
            case "仓位策略":
                drawGraph_CWCL();
                break;
            case "主力动态":
                drawGraph_ZLDT();
                break;
            case "操盘提醒":
                drawGrpah_CPTX();
                break;
            case "底部出击":
                drawGraph_ZLXC();
                break;
            case "趋势强度":
                drawGraph_QSQD();
                break;
            case "量能黄金":
                drawGraph_LNHJ();
                break;
            case "强弱转换":
                drawGraph_QRZH();
                break;
            case "波动极限":
                drawGraph_BDJX();
                break;
            case "周期拐点":
                drawGraph_ZQGD();
                break;
            case "多空资金":
                drawGraph_DKZJ();
                break;
            case "主力资金":
                drawGraph_ZLZJ();
                break;
            case "资金雷达":
                drawGraph_ZLZJ();
                break;
            default:
                break;

        }
    }

    private void drawGraph_VOL() {
        drawFunction();
    }

    private void drawGraph_MACD() {
        drawFunction();
    }

    private void drawGraph_KDJ() {
        drawFunction();
    }

    private void drawGraph_RSI() {
        drawFunction();
    }

    private void drawGraph_BIAS() {
        drawFunction();
    }

    private void drawGraph_CCI() {
        drawFunction();
    }

    private void drawGraph_WR() {
        drawFunction();
    }

    private void drawGraph_DMA() {
        drawFunction();
    }

    private void drawGraph_BPYC() {
        drawFunction();
    }

    private void drawGraph_CWCL() {
        drawFunction();
    }

    private void drawGraph_ZLDT() {
        drawFunction();
    }

    private void drawGrpah_CPTX() {
        drawFunction();
    }

    private void drawGraph_ZLXC() {
        drawFunction();
    }

    private void drawGraph_QSQD() {
        drawFunction();
    }

    private void drawGraph_LNHJ() {
        drawFunction();
    }

    private void drawGraph_QRZH() {
        drawFunction();
    }

    private void drawGraph_BDJX() {
        drawFunction();
    }

    private void drawGraph_ZQGD() {
        drawFunction();
    }

    private void drawGraph_DKZJ() {
        drawFunction();
    }

    private void drawGraph_ZLZJ() {
        drawFunction();
    }

}
