package com.dzhyun.dzhchart;

import android.annotation.TargetApi;
import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.view.View;

import com.sun.jna.Native;

import sadcup.android.jnaonas.JNIFormulaResultFactoryMapping;

public class YDKChartBase extends ScrollAndScaleView {

    private static JNIFormulaResultFactoryMapping _frf = null;

    public YDKChartBase(Context context) {
        super(context);

    }

    public YDKChartBase(Context context, AttributeSet attrs) {
        super(context, attrs);

    }

    public YDKChartBase(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);

    }

    @Override
    public void onLeftSide() {

    }

    @Override
    public void onRightSide() {

    }

    @Override
    public int getMinScrollX() {
        return 0;
    }

    @Override
    public int getMaxScrollX() {
        return 0;
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public YDKChartBase(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);

    }

    protected static JNIFormulaResultFactoryMapping get_frf() {
        if (_frf == null) {
            _frf = (JNIFormulaResultFactoryMapping) Native.loadLibrary("JNADemo", JNIFormulaResultFactoryMapping.class);
        }

        return _frf;
    }
}
