package com.dzhyun.dzhchart;

/**
 * Created by Administrator on 2015/11/5.
 */
public class LineGroup {
    //private final static String schema = "type;name;obj;data";
    private TableData datas;

    public LineGroup(TableData datas){
        this.datas = datas;
    }

    public LineRange range(int isStopTrading){
        double minval = Double.MAX_VALUE;
        double maxval = Double.MIN_VALUE;
        int rowNum = count();

        for (int row = 0; row < rowNum; row++) {
            TableData data = (TableData)datas.getRow(row).getCell(1).getValue();
            int indexEnd = data.getRows();

            for (int i= 0; i< indexEnd; i++){
                for(int j=0; j<data.getCols();j++){
                    Object o = data.getValue(i,j);
                    if (o instanceof Double){
                        double val = (double)o;

                        //加此判断，因为深市9:30返回的是0，待数据端修改正确后去除此判断
                        if (val > 0){
                            if (val > maxval){
                                maxval = val;
                            }
                            if(val < minval){
                                minval = val;
                            }
                        }

                    }
                }
            }
        }

        if (1 == isStopTrading)
            return new LineRange(maxval, minval, maxval-minval);
        else
            return new LineRange(maxval,minval);

    }

    public LineRange range() {
        return range(0, -1);
    }

    public LineRange range(int skipDataNumber, int screenNum){
        double minval = Double.MAX_VALUE;
        double maxval = Double.MIN_VALUE;
        int rowNum = count();

        for (int row = 0; row < rowNum; row++) {
            TableData data = (TableData)datas.getRow(row).getCell(1).getValue();
            int indexEnd = data.getRows();
            if (indexEnd < screenNum) {

            }
            else if (screenNum > 0 ) {
                indexEnd = Math.min(skipDataNumber+screenNum, data.getRows());
            }
            if(skipDataNumber<0){
                skipDataNumber=0;
            }

            for (int i= skipDataNumber; i< indexEnd; i++){
                for(int j=0; j<data.getCols();j++){
                    Object o = data.getValue(i,j);
                    if (o instanceof Double){
                        double val = (double)o;

                        //加此判断，因为深市9:30返回的是0，待数据端修改正确后去除此判断
//                        if (val > 0){
                            if (val > maxval){
                                maxval = val;
                            }
                            if(val < minval){
                                minval = val;
                            }
//                        }

                    }
                }
            }
        }

        if (-1 == screenNum) return new LineRange(maxval,minval);
        return new LineRange(maxval, minval, maxval-minval);
    }

    public int count(){
        return datas.getRows();
    }

    public String type(int i){
        return (String) datas.getValue(i, 0);
    }

    public TableData data(int i){
        return (TableData) datas.getValue(i, 1);
    }

    public TableData getTradeTimeSection() {
        return (TableData) datas.getValue(0, 4);
    }

    public String name(int i){
        return (String) datas.getValue(i ,2);
    }

    public String obj(int i){
        return (String) datas.getValue(i, 3);
    }


    public void addLine(String type, TableData data, String name, String obj){
        datas.addRow(new Row(type, data, name, obj));
    }
}
