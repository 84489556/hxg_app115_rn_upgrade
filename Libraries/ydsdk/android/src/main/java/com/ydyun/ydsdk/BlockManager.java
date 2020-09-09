package com.ydyun.ydsdk;

import android.text.TextUtils;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class BlockManager {

    Map<String, Callback> mapBlockCallback = new HashMap<String, Callback>();

    Map<String, String > mapBlockStocks = new HashMap<String, String >();

    private ReactApplicationContext context = null;

    private int startIndex = 0;


    public void setContext(ReactApplicationContext context) {
        this.context = context;
    }

    public ReactApplicationContext getContext() {
        return this.context;
    }

    public void setCallback(String blockid, Callback rnCallback) {

        mapBlockCallback.put(blockid, rnCallback);
    }

    public void setStartIndex(int nIndex) {
        this.startIndex = nIndex;
    }

    public int getStartIndex() {
        return this.startIndex;
    }

    public void setSortedCodes(String blockid, String sortedCodes) {
        String codes = mapBlockStocks.get(blockid);
        if(sortedCodes.equals(codes)){
            return;
        }
        this.UnReg(blockid);

        this.changeList(blockid,sortedCodes);

        this.Reg(blockid, sortedCodes);

    }
    public void setSortedCodes(String blockid, java.util.List<yuanda.DataDefine.SortEntity> entities) {
        String uncodes = mapBlockStocks.get(blockid);
        String str = "";

        for (int i=0; i<entities.size(); i++) {

            yuanda.DataDefine.SortEntity tmp = entities.get(i);

            str = str.concat(tmp.getLabel());

            if (i < entities.size()-1)
                str = str.concat(",");
        }
//        if(str.equals(codes)||TextUtils.isEmpty(str)){
//            return;
//        }

//        this.UnReg(blockid);
//
//        this.changeList(blockid,str);
//
//        this.Reg(blockid, str,entities);
//        this.invokeRNCallback(blockid, str);
//        YdYunClient.getInstance().FetchFullQuoteTest(str,"");
        if(uncodes==null){
            uncodes="";
        }


        if(!uncodes.equals(str)||null==YdYunClient.getInstance().getmFullQuoteStreamObserver()) {
            if (!TextUtils.isEmpty(uncodes)) {
                SingleQuoteManager.getInstance().unregister(uncodes);
//                YdYunClient.getInstance().FetchFullQuoteTest("", uncodes);
            }
            this.changeList(blockid, str);

            SingleQuoteManager.getInstance().register(entities, new QuoteCallback(blockid));

            this.invokeRNCallback(blockid, str);

            YdYunClient.getInstance().FetchFullQuoteTest(str, uncodes);
        }
    }
    private void changeList(String blockid, String sortedCodes) {

//        String value = mapBlockStocks.get(blockid);

//        for(int i = 0;value != null && i < value.size(); i++){
//            Log.d("zzzz Old:",value.get(i));
//        }
//
//        for(int i = 0;i < sortedCodes.size(); i++){
//            Log.d("zzzz New:",sortedCodes.get(i));
//        }

//        Log.w("stock-sortedCodes:",sortedCodes.toString());


        mapBlockStocks.put(blockid, sortedCodes);

//        this.invokeRNCallback(blockid, sortedCodes);

    }

    private void UnReg(String blockid) {

        if (mapBlockStocks.isEmpty())
            return;

        String codes = mapBlockStocks.get(blockid);

        if (codes == null || codes.isEmpty()) return;

        YdYunClient.getInstance().FetchFullQuoteTest("", codes);

        SingleQuoteManager.getInstance().unregister(codes);


    }
    private void Reg(String blockid, String codes) {

        QuoteCallback qcb = new QuoteCallback(blockid);

        YdYunClient.getInstance().FetchFullQuoteTest(codes,"");

        SingleQuoteManager.getInstance().register(codes, qcb);

    }
    private void Reg(String blockid, String codes,java.util.List<yuanda.DataDefine.SortEntity> entities) {

        QuoteCallback qcb = new QuoteCallback(blockid);

//        YdYunClient.getInstance().FetchFullQuoteTest(codes,"");

        SingleQuoteManager.getInstance().register(entities, qcb);

    }

    public void invokeRNCallback(String blockid, String strSortedCodes) {
//        Log.w("stock-strSortedCodes",strSortedCodes.toString());
        try {

            Callback rnCallback = mapBlockCallback.get(blockid);


            String [] sortedCodes= strSortedCodes.split(",");

            if (/*rnCallback != null &&*/ sortedCodes.length>0){

                if (sortedCodes.length == 1) {

                    String code = sortedCodes[0];

                    String jsonStr=SingleQuoteManager.getInstance().getQuoteListDataJson(code);
                    if (TextUtils.isEmpty(jsonStr)) {
                        return;
                    }
                    JSONObject jsonQuoteData = new JSONObject(jsonStr);

                    String eventName = "ydChannelBlockSortQuoteMessage";

                    if (this.context != null) {

                        WritableMap params = Arguments.createMap();
                        params.putString("data", jsonQuoteData.toString());
//                        Log.w("stock-stockData",jsonQuoteData.toString());
                        if (sortedCodes.length > 1) params.putInt("startIndex",BlockManager.getInstance().getStartIndex());
                        this.context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);

                    }
                }
                else {
                    JSONArray jsonArray = new JSONArray();

                    for(int i = 0;i < sortedCodes.length; i++){

                        String code = sortedCodes[i];
                        JSONObject jsonQuoteData = new JSONObject(SingleQuoteManager.getInstance().getQuoteListDataJson(code));
                        jsonArray.put(jsonQuoteData);

                    }

                    String eventName = "ydChannelBlockSortMessage";

                    if (this.context != null) {

                        WritableMap params = Arguments.createMap();
                        params.putString("data", jsonArray.toString());
//                        Log.w("stock-stockData2",jsonArray.toString());
                        if (sortedCodes.length > 1) params.putInt("startIndex",BlockManager.getInstance().getStartIndex());
                        this.context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);

                    }
                }

            }

        } catch (Exception e) {

            e.printStackTrace();

        }

    }

//    public void invokeRNCallback(String blockid, SingleQuotePrice sqp) {
//
//        try {
//
//            Callback rnCallback = mapBlockCallback.get(blockid);
//
//            if (rnCallback != null){
//
//                JSONObject jsonObject = new JSONObject(sqp.toJson());
//                JSONArray jsonArray = new JSONArray();
//                jsonArray.put(jsonObject);
//
//                rnCallback.invoke(jsonArray.toString());
//            }
//
//        } catch (Exception e) {
//
//            e.printStackTrace();
//
//        }
//
//    }


    private BlockManager() {}

    private static BlockManager single=null;

    public static BlockManager getInstance() {
        if (single == null) {
            single = new BlockManager();
        }
        return single;
    }

}
