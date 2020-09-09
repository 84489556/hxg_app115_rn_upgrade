package sadcup.android.jnaonas;


/**
 * Created by yzj on 2016/5/31.
 */
public class FormulaResultJava {

    public FormulaLineJava     _line;
    public FormulaDrawJava     _draw;

    public FormulaResultJava(){

    }
    public FormulaResultJava(FormulaLineJava line){
        _line = line;
    }
    public FormulaResultJava(FormulaDrawJava draw){
        _draw = draw;
    }

}
