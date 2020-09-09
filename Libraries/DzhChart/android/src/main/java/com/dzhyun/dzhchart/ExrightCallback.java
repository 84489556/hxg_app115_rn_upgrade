package com.dzhyun.dzhchart;

import java.util.ArrayList;

import sadcup.android.jnaonas.ExRightJava;

public abstract class ExrightCallback {
    public abstract void sucessCallback( ArrayList<ExRightJava> exRightJavas);

    public abstract void failCallback(Exception e);
}
