package com.dzhyun.dzhchart;

import android.annotation.TargetApi;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
//import android.support.v4.view.GestureDetectorCompat;
import android.util.AttributeSet;
import android.util.Log;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.widget.OverScroller;
import android.widget.RelativeLayout;

import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.events.NativeGestureUtil;
import com.facebook.react.views.scroll.ReactScrollViewHelper;

import androidx.core.view.GestureDetectorCompat;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

/**
 * 可以滑动和放大的view
 * Created by tian on 2016/5/3.
 */
public abstract class ScrollAndScaleView extends RelativeLayout implements
        GestureDetector.OnGestureListener,
        ScaleGestureDetector.OnScaleGestureListener {
    protected int FRESH_RATE=4;
    protected int mScrollX = 0;
    protected GestureDetectorCompat mDetector;
    protected ScaleGestureDetector mScaleDetector;

    protected volatile boolean isLongPress = false;

    private OverScroller mScroller;

    protected  boolean touch = false;

    protected float mScaleX = 1;

    protected float mScaleXMax = 2f;

    protected float mScaleXMin = 0.5f;

    private boolean mMultipleTouch=false;

    private boolean mScrollEnable=true;

    private boolean mScaleEnable=true;

    protected boolean isLeft=false;
    protected boolean isRight=false;
    //控制延迟十字光标
    volatile  boolean cancleDelay=false;


    public boolean isScrollFinished(){
        return mScroller.isFinished();
    }
    public ScrollAndScaleView(Context context) {
        super(context);
        init();
    }

    public ScrollAndScaleView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public ScrollAndScaleView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public ScrollAndScaleView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr,defStyleRes);
        init();
    }
    private void init() {
        setWillNotDraw(false);
        mDetector = new GestureDetectorCompat(getContext(), this);
        mScaleDetector = new ScaleGestureDetector(getContext(), this);
        mScroller = new OverScroller(getContext());
    }

    @Override
    public boolean onDown(MotionEvent e) {
        return false;
    }

    @Override
    public void onShowPress(MotionEvent e) {

    }

    @Override
    public boolean onSingleTapUp(MotionEvent e) {
        Config.isTouch=false;
        cancleDelay=false;
        isLongPress=false;
        return false;
    }

    @Override
    public boolean onScroll(MotionEvent e1, MotionEvent e2, float distanceX, float distanceY) {
        if (!isLongPress&&!isMultipleTouch()) {
            scrollBy(Math.round(distanceX), 0);

            return true;
        }
        return false;
    }

    @Override
    public void onLongPress(MotionEvent e) {
        isLongPress = true;
        cancleDelay=true;
    }

    @Override
    public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
        if (!isTouch()&&isScrollEnable()) {
            mScroller.fling(mScrollX, 0
                    , Math.round(velocityX / mScaleX), 0,
                    Integer.MIN_VALUE, Integer.MAX_VALUE,
                    0, 0);
        }
        return true;
    }

    @Override
    public void computeScroll() {
        if (mScroller.computeScrollOffset()) {
            if (!isTouch()) {
                Config.isScrollFinished=false;
                scrollTo(mScroller.getCurrX(), mScroller.getCurrY());
            } else {
                mScroller.forceFinished(true);
                Config.freshTime=0;
                Config.freshFutu=0;
            }
        }else{
            Config.isScrollFinished=true;
            Log.i("controlKline","------finish---------");

        }
//        if(mScroller.isFinished()){
//        }
    }

    @Override
    public void scrollBy(int x, int y) {
        scrollTo(mScrollX - Math.round(x / mScaleX), 0);
    }


    @Override
    public void scrollTo(int x, int y) {
//        if(x<3&&y<3&&){
//            Log.i("controlKline","------finish---------");
//        }
        if(!isScrollEnable())
        {
            mScroller.forceFinished(true);
            Config.freshTime=0;
            Config.freshFutu=0;
            return;
        }
        int oldX = mScrollX;
        mScrollX = x;
        if (mScrollX < getMinScrollX()) {
//            Log.i("controlKline","------finish---------");
            mScrollX = getMinScrollX();
            onRightSide();
            mScroller.forceFinished(true);
            Config.freshTime=0;
            Config.freshFutu=0;
        }
        else if (mScrollX > getMaxScrollX()) {
            mScrollX = getMaxScrollX();
//            Log.i("controlKline","------finish---------");
            onLeftSide();
            mScroller.forceFinished(true);
            Config.freshTime=0;
            Config.freshFutu=0;
        }
        onScrollChanged(mScrollX, 0, oldX, 0);

//        if(mScrollX==0){
//            Log.i("controlKline","------finish---------");
//
//        }

//        if(Math.abs(oldX-mScrollX)>0) {
            invalidate();
//        }
    }

    @Override
    public boolean onScale(ScaleGestureDetector detector) {
        if(!isScaleEnable())
        {
            return false;
        }
        float oldScale=mScaleX;
        mScaleX *= detector.getScaleFactor();
        if (mScaleX < mScaleXMin) {
            mScaleX = mScaleXMin;
        } else if (mScaleX > mScaleXMax) {
            mScaleX = mScaleXMax;
        } else {
            onScaleChanged(mScaleX,oldScale);
        }
        return true;
    }

    protected void onScaleChanged(float scale,float oldScale)
    {
        invalidate();
    }

    @Override
    public boolean onScaleBegin(ScaleGestureDetector detector) {
        return true;
    }

    @Override
    public void onScaleEnd(ScaleGestureDetector detector) {

    }


    public float getCrossX() {
        return crossX;
    }
    public float getCrossY() {
        return crossY;
    }
    float crossX;
    float crossY;
    int mLastX;
    int mLastY;
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int x = (int) event.getX();
        int y = (int) event.getY();
        switch (event.getAction() & MotionEvent.ACTION_MASK) {

            case MotionEvent.ACTION_DOWN:
                touch = true;
                Config.isTouch=true;
//                isLongPress=false;
                break;
            case MotionEvent.ACTION_MOVE:

                if (event.getPointerCount() == 1) {
                    cancleDelay=true;
                    int deltaX = x - mLastX;
                    int deltaY = y - mLastY;
//                    Log.i("Kllinedata=","deltaX1="+deltaX+"    deltaY1="+deltaY);
                    //长按之后移动
                    if (isLongPress) {
//                        Log.i("postDelayed=","isLongPress------------");

                        crossX = event.getX();
                        crossY=event.getY();
//                        Log.i("Kllinedata=","crossX="+crossX);

                        onLongPress(event);
                        getParent().requestDisallowInterceptTouchEvent(true);;

                    }else{
//                        Log.i("postDelayed=","ACTION_MOVE------------");
//                        Log.i("Kllinedata=","deltaX1="+deltaX+"    deltaY1="+deltaY);
                        if(Math.abs(deltaY)-Math.abs(deltaX)>30){
                            reset();
                            getParent().requestDisallowInterceptTouchEvent(false);
//                            requestDisallowInterceptTouchEvent(false);
                        }else{
                            getParent().requestDisallowInterceptTouchEvent(true);
//                            requestDisallowInterceptTouchEvent(true);

                        }
//                        NativeGestureUtil.notifyNativeGestureStarted(this, event);
//                        ReactScrollViewHelper.emitScrollBeginDragEvent(this);
                    }
                }
                break;
            case MotionEvent.ACTION_POINTER_UP:
                {
//                    Log.i("postDelayed=","ACTION_POINTER_UP------------");
                    reset();
                    invalidate();
                    requestDisallowInterceptTouchEvent(false);

                }
                break;
            case MotionEvent.ACTION_UP:
                {
                    cancleDelay=false;
                    delayCross();

                }
                break;
            case MotionEvent.ACTION_CANCEL:
                {
//                    Log.i("postDelayed=","ACTION_CANCEL------------");
                    reset();
                    invalidate();
                    requestDisallowInterceptTouchEvent(false);
                }
                break;

        }
        mLastX = x;
        mLastY = y;
        mMultipleTouch=event.getPointerCount()>1;
        this.mDetector.onTouchEvent(event);
        this.mScaleDetector.onTouchEvent(event);
        return true;
    }
    Runnable delayRunnable= new Runnable() {
        @Override
        public void run() {
            if(cancleDelay){
                return;
            }

//            Log.i("postDelayed=","postDelayed------------");
            reset();
            invalidate();
            requestDisallowInterceptTouchEvent(false);
        }
    };
    private void delayCross() {
        if(isLongPress&&!mMultipleTouch){
//            Log.i("postDelayed=","isLongPress&&!mMultipleTouch------------");
            if(delayRunnable!=null) {
                getHandler().removeCallbacks(delayRunnable);
            }
            postDelayed(delayRunnable, 2000);

        }else{
//            Log.i("postDelayed=","isLongPress&&!mMultipleTouch---else---------");
            reset();
            invalidate();
            requestDisallowInterceptTouchEvent(false);
        }
    }

    private void reset(){
        Log.i("postDelayed=","reset------------");

            cancleDelay=false;
            isLongPress = false;
            touch = false;
            Config.isTouch = false;
            crossX = -1;

    }


    /**
     * 滑到了最左边
     */
    abstract public void onLeftSide();

    /**
     * 滑到了最右边
     */
    abstract public void onRightSide();

    /**
     * 是否在触摸中
     *
     * @return
     */
    public boolean isTouch() {
        return touch;
    }

    /**
     * 获取位移的最小值
     *
     * @return
     */
    public abstract int getMinScrollX();

    /**
     * 获取位移的最大值
     *
     * @return
     */
    public abstract int getMaxScrollX();

    /**
     * 设置ScrollX
     *
     * @param scrollX
     */
    public void setScrollX(int scrollX) {
        this.mScrollX = scrollX;
        scrollTo(scrollX, 0);
    }

    /**
     * 是否是多指触控
     * @return
     */
    public boolean isMultipleTouch() {
        return mMultipleTouch;
    }

    protected void checkAndFixScrollX() {
        if (mScrollX < getMinScrollX()) {
            mScrollX = getMinScrollX();
            mScroller.forceFinished(true);
            Config.freshTime=0;
            Config.freshFutu=0;
        } else if (mScrollX > getMaxScrollX()) {
            mScrollX = getMaxScrollX();
            mScroller.forceFinished(true);
            Config.freshTime=0;
            Config.freshFutu=0;
        }
    }

    public float getScaleXMax() {
        return mScaleXMax;
    }

    public float getScaleXMin() {
        return mScaleXMin;
    }

    public boolean isScrollEnable() {
        return mScrollEnable;
    }

    public boolean isScaleEnable() {
        return mScaleEnable;
    }

    /**
     * 设置缩放的最大值
     */
    public void setScaleXMax(float scaleXMax) {
        mScaleXMax = scaleXMax;
    }

    /**
     * 设置缩放的最小值
     */
    public void setScaleXMin(float scaleXMin) {
        mScaleXMin = scaleXMin;
    }

    /**
     * 设置是否可以滑动
     */
    public void setScrollEnable(boolean scrollEnable) {
        mScrollEnable = scrollEnable;
    }

    /**
     * 设置是否可以缩放
     */
    public void setScaleEnable(boolean scaleEnable) {
        mScaleEnable = scaleEnable;
    }

    @Override
    public float getScaleX() {
        return mScaleX;
    }
}
