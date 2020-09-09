package com.ydyun.ydsdk;



import com.facebook.react.bridge.ReactApplicationContext;

import yuanda.DataDefine;


public class ConstituentStreamObserver<V> extends YDStreamObserver<V>  {


    ConstituentStreamObserver(ReactApplicationContext c, int qid) {
        super(c,qid);

    }

    @Override
    protected void parseLabel(V value) {

//        try {

            DataDefine.FullSortResponse fsr = (DataDefine.FullSortResponse)value;

            java.util.List<yuanda.DataDefine.SortEntity> entities = fsr.getDataList();

//            String str = "";
//        Log.d("xxxxxxxx parseLabel","value---------");
//            for (int i=0; i<entities.size(); i++) {
//
//                yuanda.DataDefine.SortEntity tmp = entities.get(i);
//
//                str = str.concat(tmp.getLabel());
//                Log.d("xxxxxxxx parseLabel","value="+tmp.getValue());
//                if (i < entities.size()-1)
//                    str = str.concat(",");
//            }

            BlockManager.getInstance().setSortedCodes(fsr.getBlockId(),entities);


//            Log.d("xxxxxxxx parseLabel",str);

//        }catch (Exception ex){
//            ex.printStackTrace();
//        }
    }

    @Override
    public void onNext(V value) {

        final  V v = value;
        SingleQuoteManager.getInstance().getExecutorService().execute(new Runnable() {
            @Override
            public void run() {
                parseLabel(v);
            }
        });


    }


}
