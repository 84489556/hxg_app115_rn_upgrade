package com.ydyun.ydsdk;


import org.json.JSONObject;



class SingleQuotePrice {
    private String Name;
    private String Code;
    private double ZhangDie;
    private double ZhangDieFu;
    private double ZuiXinJia;

    public SingleQuotePrice() {
        this.Name = "";
        this.Code = "";
        this.ZuiXinJia = 0.0;
        this.ZhangDie = 0.0;
        this.ZhangDieFu = 0.0;
    }

    public SingleQuotePrice(String Name, String Code, double ZuiXinJia, double ZhangDie, double ZhangDieFu) {
        this.Name = Name;
        this.Code = Code;
        this.ZuiXinJia = ZuiXinJia;
        this.ZhangDie = ZhangDie;
        this.ZhangDieFu = ZhangDieFu;
    }

    public String toJson() {

        try {
            JSONObject jsonObject = new JSONObject();

            jsonObject.put("ZhongWenJianCheng", this.Name);
            jsonObject.put("Obj", this.Code);
            jsonObject.put("ZuiXinJia", this.ZuiXinJia);
            jsonObject.put("ZhangDie", this.ZhangDie);
            jsonObject.put("ZhangFu", this.ZhangDieFu);

            return jsonObject.toString();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }

    public String getName() {
        return Name;
    }
    public void setName(String Name) {
        this.Name = Name;
    }

    public String getCode() {
        return Code;
    }
    public void setCode(String Code) {
        this.Code = Code;
    }

    public double getZuiXinJia() {
        return ZuiXinJia;
    }
    public void setZuiXinJia(double ZuiXinJia) {
        this.ZuiXinJia = ZuiXinJia;
    }

    public double getZhangDie() {
        return ZhangDie;
    }
    public void setZhangDie(double ZhangDie) {
        this.ZhangDie = ZhangDie;
    }

    public double getZhangDieFu() {
        return ZhangDieFu;
    }
    public void setZhangDieFu(double ZhangDieFu) {
        this.ZhangDieFu = ZhangDieFu;
    }
}
