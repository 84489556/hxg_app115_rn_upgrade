package sadcup.android.jnaonas;


/**
 * Created by yzj on 2019/1/21.
 */
public class ExRightJava {

    public Long lastUpdateTime;    //最后更新时间
    public String stockCode;         //股票代码
    public String subType;           //'A':A股、'B'：B股
    public Long exright_date;      //除权日期
    public Double alloc_interest;    //分红派息（每股）
    public Double give;              //送股（每股）
    public Double extend;            //转增股（每股）
    public Double match;             //配股（每股）
    public Double match_price;       //配股价


    @Override
    public String toString() {
        return "ExRightJava [lastUpdateTime=" + lastUpdateTime + ", stockCode=" + stockCode + ", subType=" + subType + ", exright_date=" + exright_date + ", alloc_interest=" + alloc_interest + "," + " give=" + give + ", extend=" + extend + ", match=" + match + ", match_price=" + match_price + "]";
    }
}
