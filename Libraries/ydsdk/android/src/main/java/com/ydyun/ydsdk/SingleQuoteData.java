package com.ydyun.ydsdk;



public class SingleQuoteData {

    private SingleQuotePrice _sqp;

    private SingleFundflowPrice _sffp;

    private QuoteCallback _callback;

    public SingleQuoteData(){}

    public SingleQuoteData(SingleQuotePrice sqp, SingleFundflowPrice sffp, QuoteCallback callback) {
        this._sqp = sqp;
        this._sffp = sffp;
        this._callback = callback;
    }

    public SingleQuotePrice getSingleQuotePrice() {
        return this._sqp;
    }

    public SingleFundflowPrice getSingleFundflowPrice() {
        return this._sffp;
    }

    public void setSingleQuotePrice(SingleQuotePrice sqp) {
        this._sqp = sqp;
    }

    public void setSingleFundflowPrice(SingleFundflowPrice sffp) {
        this._sffp = sffp;
    }

    public QuoteCallback getCallback() {
        return this._callback;
    }

    public void setCallback(QuoteCallback callback) {
        this._callback = callback;
    }

}
