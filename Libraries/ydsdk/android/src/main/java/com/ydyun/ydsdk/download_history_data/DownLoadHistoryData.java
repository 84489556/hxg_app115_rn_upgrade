package com.ydyun.ydsdk.download_history_data;


import android.os.Environment;
import android.util.Log;


import com.alibaba.fastjson.JSON;
import com.facebook.react.bridge.Promise;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okio.BufferedSink;
import okio.Okio;
import okio.Sink;
import yuanda.DataDefine;
import yuanda.HistorydataDefine;

public class DownLoadHistoryData {

    ArrayList jsonList = new ArrayList();
    public DownLoadHistoryData() {

    }

    public void downLoadFile(final String url, final Promise promise) {

        Request request = new Request.Builder().url(url).build();
        new OkHttpClient().newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                // 下载失败
                e.printStackTrace();
                Log.i("DOWNLOAD","download failed");
            }
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Sink sink = null;
                BufferedSink bufferedSink = null;
                try {
                    String mSDCardPath= Environment.getExternalStorageDirectory().getAbsolutePath();
                    String fileName = "index.data";
                    if(url.indexOf("index") == -1)fileName = "message.data";
                    File dest = new File(mSDCardPath,   fileName);
                    if(dest.exists()){dest.delete();}
                    sink = Okio.sink(dest);
                    bufferedSink = Okio.buffer(sink);
                    bufferedSink.writeAll(response.body().source());
                    bufferedSink.close();
                    if(url.indexOf("index") == -1){
                        getMessage(dest,promise);
                    }else{
                        String test = getIndex(dest,promise);
                        promise.resolve(test);
                    }
                    Log.i("!@!@!@!@!@!@!@!!@","download success");
                } catch (Exception e) {
                    e.printStackTrace();
                    Log.i("!@!@!@!@!@!@!@!!@","download failed");
                } finally {
                    if(bufferedSink != null){
                        bufferedSink.close();
                    }

                }
            }
        });
    }

    private void getMessage(File file,Promise promise){
        byte[] bytes = new byte[0];
        jsonList.clear();
        DataDefine.CandleStick candleStick = null;
        JSONArray jsonArray = new JSONArray();
        JSONObject tmpObj = null;
        try {
            bytes = InputStream2ByteArray(file.getAbsolutePath());
            byte[] bytes1 = subByte(bytes,0,4);
            byte[] bytes2 = subByte(bytes,4,4);
            int startIndex = bytes2Int(bytes1)+8;
            int length = bytes.length - startIndex;
            candleStick = DataDefine.CandleStick.parseFrom(subByte(bytes,bytes2Int(bytes1)+8,length));
            List<DataDefine.CandleStickEntity> entitiesList = candleStick.getEntitiesList();
            for(int i = 0;i < entitiesList.size();i++) {
                Log.d("k线数据",entitiesList.get(i).toString());
                tmpObj = new JSONObject();
                tmpObj.put("amount" , entitiesList.get(i).getAmount());
                tmpObj.put("close" , entitiesList.get(i).getClose());
                tmpObj.put("high", entitiesList.get(i).getHigh());
                tmpObj.put("low", entitiesList.get(i).getLow());
                tmpObj.put("open", entitiesList.get(i).getOpen());
                tmpObj.put("time", entitiesList.get(i).getTime());
                tmpObj.put("volume", entitiesList.get(i).getVolume());
                jsonArray.put(tmpObj);
                tmpObj = null;
            }
            promise.resolve(jsonArray.toString());
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }


    private String getIndex(File file,Promise promise){
        String lableStr = "";
        byte[] bytes = new byte[0];
        HistorydataDefine.MultiIndex multiIndex = null;
        try {
            bytes = InputStream2ByteArray(file.getAbsolutePath());
            multiIndex = HistorydataDefine.MultiIndex.parseFrom(bytes);
        } catch (IOException e) {
            e.printStackTrace();
        }

        List<HistorydataDefine.Index> dataLis = multiIndex.getDataList();
        for(HistorydataDefine.Index attribute : dataLis) {
            lableStr += attribute.getLabel()+",";
        }
        return lableStr;
//        promise.resolve(lableStr);
    }

    private int bytes2Int(byte[] bytes )
    {
        //如果不与0xff进行按位与操作，转换结果将出错，有兴趣的同学可以试一下。

        int int1=bytes[0]&0xff;
        int int2=(bytes[1]&0xff)<<8;
        int int3=(bytes[2]&0xff)<<16;
        int int4=(bytes[3]&0xff)<<24;

        return int1|int2|int3|int4;
    }

    /**
     * 截取byte数组   不改变原数组
     * @param b 原数组
     * @param off 偏差值（索引）
     * @param length 长度
     * @return 截取后的数组
     */
    public byte[] subByte(byte[] b,int off,int length){
        byte[] b1 = new byte[length];
        System.arraycopy(b, off, b1, 0, length);
        return b1;
    }



    private byte[] InputStream2ByteArray(String filePath) throws IOException {

        InputStream in = new FileInputStream(filePath);
        byte[] data = toByteArray(in);
        in.close();

        return data;
    }

    private byte[] toByteArray(InputStream in) throws IOException {

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024 * 4];
        int n = 0;
        while ((n = in.read(buffer)) != -1) {
            out.write(buffer, 0, n);
        }
        return out.toByteArray();
    }

}
