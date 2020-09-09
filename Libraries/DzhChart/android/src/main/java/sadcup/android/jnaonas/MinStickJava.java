package sadcup.android.jnaonas;



/**
 * Created by yzj on 2019/8/22.
 */

public class MinStickJava {

    public Long time;
    public Double price;
    public Double avgprice;
    public Double volume;
    public Double amount;

    public Long getTime() {
        return time;
    }
    public void setTime(Long t) {
        this.time = t;
    }
    public Double getPrice() {
        return price;
    }
    public void setPrice(Double price) {
        this.price = price;
    }
    public Double getAvgPrice() {
        return avgprice;
    }
    public void setAvgPrice(Double avgprice) {
        this.avgprice = avgprice;
    }
    public Double getVolume() {
        return volume;
    }
    public void setVolume(Double volume) {
        this.volume = volume;
    }
    public Double getAmount() {
        return amount;
    }
    public void setAmount(Double amount) {
        this.amount = amount;
    }

    @Override
    public String toString() {
        return "MinStickJava [time=" + time + ", price=" + price + ", avgprice=" + avgprice + ", amount=" + amount + ", volume=" + volume + "]";
    }
}
