package com.yuanda.cy_professional_select_stock.wxapi;

import android.os.Bundle;
import android.util.Log;

import com.umeng.socialize.weixin.view.WXCallbackActivity;

public class WXEntryActivity extends WXCallbackActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
       // WeChatModule.handleIntent(getIntent());
        Log.e("TAG------", "onCreate:这是测试回调走不走22）））））" );

        finish();
    }

}
