package com.dzhyun.dzhchart;

import androidx.annotation.Nullable;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

public class MinChartManager extends SimpleViewManager<YDMinChart> {

    public static final String REACT_CLASS = "RCTYdMinline";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected YDMinChart createViewInstance(ThemedReactContext themedReactContext) {
        return new YDMinChart(themedReactContext);
    }

    @ReactProp(name = "chartData")
    public void setChartData(YDMinChart chart, @Nullable String data) {
        chart.drawDzhChart( data);
    }

    @ReactProp(name = "legendPos")
    public void setLegendPos(YDMinChart chart, @Nullable int data) {
        chart.setLegendPos(data);
    }

    @ReactProp(name = "mainName")
    public void setMainName(YDMinChart chart, @Nullable String data) {
        chart.setMainFormulaName(data);
    }

    @ReactProp(name = "viceName")
    public void setViceName(YDMinChart chart, @Nullable String data) {
        chart.setAssistFormulaName(data);
    }

    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
        builder.put( "sendData", MapBuilder.of("registrationName", "getData"));
        return builder.build();
    }
}

