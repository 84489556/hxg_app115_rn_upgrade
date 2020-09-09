package sadcup.android.jnaonas;

import com.sun.jna.Library;
import com.sun.jna.Pointer;


/**
 * Created by yzj on 12/23/15.
 */
public interface JNIFormulaResultFactoryMapping extends Library {

//    public Pointer initializeFE();
    //public String getFormulaResultJson(Pointer demoString, String formulaName, KLineStickJava[] sticks, int len);
    public String getFormulaResultJson(String formulaName, String sticks);
    public String getFormulaResultJson4Min(String formulaName, String sticks);
    public String getSplitDataJson(String sticks, String exright, int split, int period);
//    public void finalizeFE(Pointer demoString);

}
