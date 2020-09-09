package sadcup.android.jnaonas;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Vector;

/**
 * Created by yzj on 6/3/2016.
 */
public class FormulaLineJava
{
    public String              _name;
    public ArrayList<Double>   _data;

    public int                 _type;
    public Double              _thick;
    public int                 _color;
    public int                 _color2;
    public boolean             _nodraw;

    public FormulaLineJava()
    {
        _type = 0;
        _thick = 1.0;
        _color = 0x000000;
        _color2 = 0x000000;

    }
}
