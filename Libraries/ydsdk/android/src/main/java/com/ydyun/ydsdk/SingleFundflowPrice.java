package com.ydyun.ydsdk;

import org.json.JSONObject;

public class SingleFundflowPrice {

    private String Name;
    private String Code;
    private double littleIn;
    private double littleOut;
    private double mediumIn;
    private double mediumOut;
    private double largeIn;
    private double largeOut;
    private double superIn;
    private double superOut;
    private double hugeIn;
    private double hugeOut;
    private double hugeNet1day;
    private double hugeNet3day;
    private double hugeNet5day;
    private double hugeNet10day;

    public double getHugeNet1day() {
        return hugeNet1day;
    }

    public void setHugeNet1day(double hugeNet1day) {
        this.hugeNet1day = hugeNet1day;
    }

    public double getHugeNet3day() {
        return hugeNet3day;
    }

    public void setHugeNet3day(double hugeNet3day) {
        this.hugeNet3day = hugeNet3day;
    }

    public double getHugeNet5day() {
        return hugeNet5day;
    }

    public void setHugeNet5day(double hugeNet5day) {
        this.hugeNet5day = hugeNet5day;
    }

    public double getHugeNet10day() {
        return hugeNet10day;
    }

    public void setHugeNet10day(double hugeNet10day) {
        this.hugeNet10day = hugeNet10day;
    }


    public SingleFundflowPrice() {
        this.Name = "";
        this.Code = "";
        this.littleIn = 0.0;
        this.littleOut = 0.0;
        this.mediumIn = 0.0;
        this.mediumOut = 0.0;
        this.largeIn = 0.0;
        this.largeOut = 0.0;
        this.superIn = 0.0;
        this.superOut = 0.0;
        this.hugeIn = 0.0;
        this.hugeOut = 0.0;
        this.hugeNet1day = 0.0;
        this.hugeNet3day = 0.0;
        this.hugeNet5day = 0.0;
        this.hugeNet10day = 0.0;
    }

    public SingleFundflowPrice(String Name, String Code,
                               double littleIn, double littleOut,
                               double mediumIn, double mediumOut,
                               double largeIn, double largeOut,
                               double superIn, double superOut,
                               double hugeIn, double hugeOut,
                               double hugeNet1day, double hugeNet3day,
                               double hugeNet5day, double hugeNet10day) {
        this.Name = Name;
        this.Code = Code;
        this.littleIn = littleIn;
        this.littleOut = littleOut;
        this.mediumIn = mediumIn;
        this.mediumOut = mediumOut;
        this.largeIn = largeIn;
        this.largeOut = largeOut;
        this.superIn = superIn;
        this.superOut = superOut;
        this.hugeIn = hugeIn;
        this.hugeOut = hugeOut;
        this.hugeNet1day = hugeNet1day;
        this.hugeNet3day = hugeNet3day;
        this.hugeNet5day = hugeNet5day;
        this.hugeNet10day = hugeNet10day;
    }

    public String toJson() {

        try {
            JSONObject jsonObject = new JSONObject();

            jsonObject.put("ZhongWenJianCheng", this.Name);
            jsonObject.put("Obj", this.Code);
            jsonObject.put("littleIn", this.littleIn);
            jsonObject.put("littleOut", this.littleOut);
            jsonObject.put("mediumIn", this.mediumIn);
            jsonObject.put("littleIn", this.mediumOut);
            jsonObject.put("littleOut", this.largeIn);
            jsonObject.put("mediumIn", this.largeOut);
            jsonObject.put("littleIn", this.superIn);
            jsonObject.put("littleOut", this.superOut);
            jsonObject.put("mediumIn", this.hugeIn);
            jsonObject.put("mediumIn", this.hugeOut);
            jsonObject.put("hugeNet1day", this.hugeNet1day);
            jsonObject.put("hugeNet3day", this.hugeNet3day);
            jsonObject.put("hugeNet5day", this.hugeNet5day);
            jsonObject.put("hugeNet10day", this.hugeNet10day);

            return jsonObject.toString();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }

    public String getName() {
        return Name;
    }

    public String getCode() {
        return Code;
    }

    public double getLittleIn() {
        return littleIn;
    }

    public double getLittleOut() {
        return littleOut;
    }

    public double getMediumIn() {
        return mediumIn;
    }

    public double getMediumOut() {
        return mediumOut;
    }

    public double getLargeIn() {
        return largeIn;
    }

    public double getLargeOut() {
        return largeOut;
    }

    public double getSuperIn() {
        return superIn;
    }

    public double getSuperOut() {
        return superOut;
    }

    public double getHugeIn() {
        return hugeIn;
    }

    public double getHugeOut() {
        return hugeOut;
    }

    public void setName(String name) {
        Name = name;
    }

    public void setCode(String code) {
        Code = code;
    }

    public void setLittleIn(double littleIn) {
        this.littleIn = littleIn;
    }

    public void setLittleOut(double littleOut) {
        this.littleOut = littleOut;
    }

    public void setMediumIn(double mediumIn) {
        this.mediumIn = mediumIn;
    }

    public void setMediumOut(double mediumOut) {
        this.mediumOut = mediumOut;
    }

    public void setLargeIn(double largeIn) {
        this.largeIn = largeIn;
    }

    public void setLargeOut(double largeOut) {
        this.largeOut = largeOut;
    }

    public void setSuperIn(double superIn) {
        this.superIn = superIn;
    }

    public void setSuperOut(double superOut) {
        this.superOut = superOut;
    }

    public void setHugeIn(double hugeIn) {
        this.hugeIn = hugeIn;
    }

    public void setHugeOut(double hugeOut) {
        this.hugeOut = hugeOut;
    }

}
