package com.ydyun.ydsdk;

import java.util.ArrayList;

public class QuoteCallback {

    private String blockid;

    public QuoteCallback(String blockid) {
        this.blockid = blockid;
    }

    public void execute(String code) {
//        ArrayList<String> tmp = new ArrayList<String>();
//        tmp.add(code);
        BlockManager.getInstance().invokeRNCallback(this.blockid, code);
    }

}
