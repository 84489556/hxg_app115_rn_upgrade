package com.yuanda.cy_professional_select_stock;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import com.umeng.analytics.MobclickAgent;
import com.umeng.socialize.UMShareAPI;

public class MainActivity extends ReactActivity2 {
    private View mRootView;
   // private ImageView img;
    private BroadcastReceiver hiddenReceiver;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "CY_Stock";
    }

    private boolean isRegistered = false;
    private NetWorkChangReceiver netWorkChangReceiver;
    private TextView versionText ;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.launch_screen);
        versionText = findViewById(R.id.version_tx);

        //MainApplication.getRefWatcher().watch(this);
      //  getKaiPingTuFromYDYun();

        mRootView = getRootView();
       // img = (ImageView)findViewById(R.id.splash_image);
        hiddenReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                setContentView(mRootView);
            }
        };
        registerReceiver(hiddenReceiver, new IntentFilter("com.yuanda.hidden"));
        //ShareModule.initActivity(this);

        // 设置透明状态栏
        if (Build.VERSION.SDK_INT >= 21) {
            View decorView = getWindow().getDecorView();
            int option = View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
            decorView.setSystemUiVisibility(option);
            getWindow().setStatusBarColor(Color.TRANSPARENT);
        }

        registerNetWork();

        setVersion();




//        Log.e("获取手机型号-----", "onCreate: =================" );
//        Log.e("获取手机型号-----", "onCreate: ================="+android.os.Build.MODEL );
//        Log.e("获取手机型号-----", "onCreate: ================="+ OSUtils.getRomType());
//        Log.e("获取手机型号-----", "onCreate: ================="+ OSUtils.getSystemProperty());

    }

    private void setVersion() {
        versionText.setText("版本号信息 "+BuildConfig.VERSION_NAME);
    }

    /**
     * 解决react-native-orientation 中 RN0.59.8现在屏幕旋转没有监听的问题
     * */
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }

    private void registerNetWork(){
        netWorkChangReceiver = new NetWorkChangReceiver();
        IntentFilter filter = new IntentFilter();
        filter.addAction(WifiManager.WIFI_STATE_CHANGED_ACTION);
        filter.addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION);
        filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
        registerReceiver(netWorkChangReceiver, filter);
        isRegistered = true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        unregisterReceiver(hiddenReceiver);
        if(isRegistered) {
            unregisterReceiver(netWorkChangReceiver);
        }
    }

//    public static Bitmap getBitmap(String path) throws IOException {
//
//        URL url = new URL(path);
//        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
//        conn.setConnectTimeout(5000);
//        conn.setRequestMethod("GET");
//        if (conn.getResponseCode() == 200){
//            InputStream inputStream = conn.getInputStream();
//            Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
//            return bitmap;
//        }
//        return null;
//    }

    /**
     * 分享或登录处理后的回调
     * @param requestCode
     * @param resultCode
     * @param data
     */
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);
    }

//    public void getKaiPingTuFromYDYun() {
//
//        final String ydyunRootPath = "ydhxgtest";
//        final String url = "https://yun.ydtg.com.cn/node/sdkapi?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjoxLCJ1aWQiOiIxNTY0NTU3MDE4MzYyIiwiYWRtaW4iOmZhbHNlLCJpYXQiOjE1NjQ0NzA2MTgsImV4cCI6MTU2NTE2MTgxOCwiY2xhaW1zIjp7InN5c3JvbGUiOiJ1c2VyIn19.DUea52ZXqFbb8TNQOJfoL1HvAnAIhlJYSsTThxk_THA";
//        final String param = "{\n" +
//                "\t\"api\": \"/get\",\n" +
//                "\t\"count\": true,\n" +
//                "\t\"nodePath\": \"/" +
//                ydyunRootPath +
//                "/KaiPingTu/image/uri\"\n" +
//                "}";
//
//        //Log.e("TAG", "getKaiPingTuFromYDYun: ||||"+ );
//
//        new Thread(new Runnable() {
//            @Override
//            public void run() {
//                try {
//
//                    String imgPath = trimSemicolon(doPost(url, param));
//                    final Bitmap imgBitMap = getBitmap(imgPath);
//
//                    runOnUiThread(new Runnable() {
//                        @Override
//                        public void run() {
//                            if(img != null)
//                                img.setImageBitmap(imgBitMap);
//                        }
//                    });
//
//
//                } catch (Exception e) {
//                    e.printStackTrace();
//                }
//            }
//        }).start();
//
//    }
//
//    public static String doPost(String httpUrl, String param) {
//
//        HttpURLConnection connection = null;
//        InputStream is = null;
//        OutputStream os = null;
//        BufferedReader br = null;
//        String result = null;
//        try {
//            URL url = new URL(httpUrl);
//            // 通过远程url连接对象打开连接
//            connection = (HttpURLConnection) url.openConnection();
//            // 设置连接请求方式
//            connection.setRequestMethod("POST");
//            // 设置连接主机服务器超时时间：15000毫秒
//            connection.setConnectTimeout(15000);
//            // 设置读取主机服务器返回数据超时时间：60000毫秒
//            connection.setReadTimeout(60000);
//
//            // 默认值为：false，当向远程服务器传送数据/写数据时，需要设置为true
//            connection.setDoOutput(true);
//            // 默认值为：true，当前向远程服务读取数据时，设置为true，该参数可有可无
//            connection.setDoInput(true);
//            // 设置传入参数的格式:请求参数应该是 name1=value1&name2=value2 的形式。
//            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
//            // 设置鉴权信息：Authorization: Bearer da3efcbf-0845-4fe3-8aba-ee040be542c0
//            connection.setRequestProperty("Authorization", "Bearer da3efcbf-0845-4fe3-8aba-ee040be542c0");
//            // 通过连接对象获取一个输出流
//            os = connection.getOutputStream();
//            // 通过输出流对象将参数写出去/传输出去,它是通过字节数组写出的
//            os.write(param.getBytes());
//            // 通过连接对象获取一个输入流，向远程读取
//            if (connection.getResponseCode() == 200) {
//
//                is = connection.getInputStream();
//                // 对输入流对象进行包装:charset根据工作项目组的要求来设置
//                br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
//
//                StringBuffer sbf = new StringBuffer();
//                String temp = null;
//                // 循环遍历一行一行读取数据
//                while ((temp = br.readLine()) != null) {
//                    sbf.append(temp);
//                    sbf.append("\r\n");
//                }
//
//
//                JSONObject object = (JSONObject) JSONObject.parse(sbf.toString());
//                if (object.containsKey("nodeContent")) {
//                    result = object.getString("nodeContent");
//                }
//
//
//            }
//        } catch (MalformedURLException e) {
//            e.printStackTrace();
//        } catch (IOException e) {
//            e.printStackTrace();
//        } finally {
//            // 关闭资源
//            if (null != br) {
//                try {
//                    br.close();
//                } catch (IOException e) {
//                    e.printStackTrace();
//                }
//            }
//            if (null != os) {
//                try {
//                    os.close();
//                } catch (IOException e) {
//                    e.printStackTrace();
//                }
//            }
//            if (null != is) {
//                try {
//                    is.close();
//                } catch (IOException e) {
//                    e.printStackTrace();
//                }
//            }
//            // 断开与远程地址url的连接
//            connection.disconnect();
//        }
//        return result;
//    }
//
//    private String trimSemicolon(String src) {
//
//        if (src.length()<2)
//            return src;
//
//        return src.replace("\"", "");
//    }

}
