package com.ydyun.ydsdk;

import java.util.ArrayList;

import com.facebook.react.bridge.Callback;

public class SingleQuoteInfo {
    private String _key;
    private SingleQuotePrice _sqp;

    public SingleQuoteInfo() {

    }

    public SingleQuoteInfo(String key, SingleQuotePrice sqp, ArrayList<Callback> funcs) {
        this._key = key;
        this._sqp = sqp;
    }
}
