package com.yuanda.cy_professional_select_stock.module;

/**
 * Created by yzj on 2017/2/14.
 *
 */
enum VideoEvent {
    EVENT_PREPARE("onPrepared"),
    EVENT_PROGRESS("onProgress"),
    EVENT_UPDATE("onBufferUpdate"),
    EVENT_ERROR("onErr"),
    EVENT_COMPLETION("onCompletion");

    private String mName;
    VideoEvent(String name) {
        this.mName = name;
    }

    @Override
    public String toString() {
        return mName;
    }
}

