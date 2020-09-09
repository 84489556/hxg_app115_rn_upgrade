package com.dzhyun.dzhchart;

import android.annotation.TargetApi;
import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.view.View;

import com.sun.jna.Native;

import sadcup.android.jnaonas.JNIFormulaResultFactoryMapping;

public class YDChartBase extends View {

    private static JNIFormulaResultFactoryMapping _frf = null;

    public YDChartBase(Context context) {
        super(context);

    }

    public YDChartBase(Context context, AttributeSet attrs) {
        super(context, attrs);

    }

    public YDChartBase(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);

    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public YDChartBase(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);

    }

    protected static JNIFormulaResultFactoryMapping get_frf() {
        if (_frf == null) {
            _frf = (JNIFormulaResultFactoryMapping) Native.loadLibrary("JNADemo", JNIFormulaResultFactoryMapping.class);
        }

        return _frf;
    }
}
