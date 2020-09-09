package sadcup.android.jnaonas;


import com.sun.jna.NativeLong;
import com.sun.jna.Structure;

import java.util.Arrays;
import java.util.List;


/**
 * Created by yzj on 2016/5/31.
 */
public class KLineStickJava {

    public Long time;
    public Double open;
    public Double high;
    public Double low;
    public Double close;
    public Double volume;
    public Double amount;

    public Long getTime() {
        return time;
    }
    public void setTime(Long t) {
        this.time = t;
    }
    public Double getOpen() {
        return open;
    }
    public void setOpen(Double open) {
        this.open = open;
    }
    public Double getHigh() {
        return high;
    }
    public void setHigh(Double high) {
        this.high = high;
    }
    public Double getLow() {
        return low;
    }
    public void setLow(Double low) {
        this.low = low;
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
        return "KLineStickJava [time=" + time + ", open=" + open + ", high=" + high + ", low=" + low + ", close=" + close + ", volume=" + volume + ", amount=" + amount + "]";
    }
}
