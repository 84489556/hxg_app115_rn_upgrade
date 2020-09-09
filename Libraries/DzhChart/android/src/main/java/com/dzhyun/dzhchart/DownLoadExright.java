package com.dzhyun.dzhchart;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import sadcup.android.jnaonas.ExRightJava;

public class DownLoadExright {

    public void downLoadFile(String code, final ReposeCallback reposeCallback) {
        String url = "http://cdnapp.ydtg.com.cn/fenhongkuosan/"+code+".txt";
        final Request request = new Request.Builder().url(url).build();
        final Call call = new OkHttpClient().newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                reposeCallback.failCallback(e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String tempResponse =  response.body().string();
                String Json = toJson(tempResponse);
                ArrayList<ExRightJava> exRightJavas = toExright(tempResponse);
                reposeCallback.sucessCallback(exRightJavas);
//                reposeCallback.sucessCallback(Json);
            }
        });
    }
    public void downLoadFile(YDKChart chart,String code, final ReposeCallback reposeCallback) {
        String url = "http://cdnapp.ydtg.com.cn/fenhongkuosan/"+code+".txt";
        final Request request = new Request.Builder().url(url).build();
        final Call call = new OkHttpClient().newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                reposeCallback.failCallback(e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String tempResponse =  response.body().string();
                String Json = toJson(tempResponse);
                ArrayList<ExRightJava> exRightJavas = toExright(tempResponse);
                reposeCallback.sucessCallback(exRightJavas);
//                reposeCallback.sucessCallback(Json);
            }
        });
    }
    private ArrayList<ExRightJava> toExright(String s){
        ArrayList<ExRightJava> result = new ArrayList<ExRightJava>();
        String dataJson = s;
        try {
            JSONArray data = new JSONArray(dataJson);
                for(int i=0;i<data.length();i++){
                    JSONObject job = data.getJSONObject(i);
                    if (!job.has("cqrq") || !job.has("zhgxsj")) continue;
                    ExRightJava one = new ExRightJava();
                    one.lastUpdateTime = Long.valueOf(getStringWithFilterNull(job,"zhgxsj"));
                    one.stockCode = getStringWithFilterNull(job,"gpdm");
                    one.subType = getStringWithFilterNull(job,"zqlb");
                    one.exright_date = Long.valueOf(getStringWithFilterNull(job,"cqrq"));
                    if (one.exright_date == 0) continue;
                    one.alloc_interest = Double.valueOf(getStringWithFilterNull(job,"fhpx"))/10;
                    one.give = Double.valueOf(getStringWithFilterNull(job,"sg"))/10;
                    one.extend = Double.valueOf(getStringWithFilterNull(job,"zzg"))/10;
                    one.match = Double.valueOf(getStringWithFilterNull(job,"pg"))/10;
                    one.match_price = Double.valueOf(getStringWithFilterNull(job,"pgj"));
                    result.add(one);
                }
            } catch (Exception e) {
            e.printStackTrace();
            return  new ArrayList<ExRightJava>();
        }
        return result;
    }

        private String toJson(String s){
        JSONArray jaExRight = new JSONArray();
        try {
            JSONArray jsonArray = new JSONArray(s);
            for (int i = 0;i<jsonArray.length();i++){
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                JSONObject newJson = new JSONObject();
                newJson.put("lastUpdateTime", jsonObject.getString("zhgxsj"));
                newJson.put("stockCode", jsonObject.getString("gpdm"));
                newJson.put("subType", jsonObject.getString("zqlb"));
                newJson.put("exright_date", jsonObject.getString("cqrq"));
                newJson.put("alloc_interest", jsonObject.getString("fhpx"));
                newJson.put("give", jsonObject.getString("sg"));
                newJson.put("extend",jsonObject.getString("zzg"));
                newJson.put("match", jsonObject.getString("pg"));
                newJson.put("match_price",jsonObject.getString("pgj"));
                jaExRight.put(newJson);
                newJson = null;
                jsonObject = null;
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return jaExRight.toString();
    }
    private String getStringWithFilterNull(JSONObject job, String key) {

        try {

            String val;

            if (job.has(key)) {
                val = job.getString(key);
                if (val.contentEquals("null"))
                    val = "0";
            }
            else {
                val = "0";
            }

            return val;


        } catch(Exception e) {
            e.printStackTrace();
            return "";
        }


    }
}
