package com.bokecc.livemodule.live.function.practice.adapter;

import android.content.Context;
import android.graphics.Color;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.bokecc.livemodule.R;
import com.bokecc.sdk.mobile.live.pojo.PracticeStatisInfo;

import java.util.ArrayList;

/**
 * 随堂测统计柱状图列表适配器
 */
public class PracticeStatisAdapter extends RecyclerView.Adapter<PracticeStatisAdapter.ResultViewHolder> {

    private Context mContext;
    private ArrayList<PracticeStatisInfo.OptionStatis> practiceStatisices;
    private LayoutInflater mInflater;

    private int practiceNumber;

    public PracticeStatisAdapter(Context context) {
        practiceStatisices = new ArrayList<>();
        mContext = context;
        mInflater = LayoutInflater.from(mContext);
    }

    public void setAllPracticeNumber(int number) {
        practiceNumber = number;
    }

    /**
     * 添加数据
     */
    public void add(ArrayList<PracticeStatisInfo.OptionStatis> practiceStatisices) {
        this.practiceStatisices = practiceStatisices;
        notifyDataSetChanged();
    }

    @Override
    public ResultViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View itemView = mInflater.inflate(R.layout.practice_summary_single, parent, false);
        return new ResultViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(ResultViewHolder holder, int position) {

        PracticeStatisInfo.OptionStatis optionSingle = practiceStatisices.get(position);

        holder.mWrongProgressBar.setMax(practiceNumber);
        holder.mRightProgressBar.setMax(practiceNumber);

        if (optionSingle.isCorrect()) {
            holder.mWrongProgressBar.setVisibility(View.GONE);
            holder.mRightProgressBar.setVisibility(View.VISIBLE);
            holder.mRightProgressBar.setProgress(optionSingle.getCount());
        } else {
            holder.mWrongProgressBar.setVisibility(View.VISIBLE);
            holder.mRightProgressBar.setVisibility(View.GONE);
            holder.mWrongProgressBar.setProgress(optionSingle.getCount());
        }

        holder.mSummaryOrder.setText(orders[optionSingle.getIndex()]);

        String userCount = optionSingle.getCount() + "人 ";

        String percent = "(" + optionSingle.getPercent() + ")";

        String msg = userCount + percent;

        SpannableString ss = new SpannableString(msg);

        ss.setSpan(new ForegroundColorSpan(Color.parseColor("#666666")),
                0,
                userCount.length(),
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

        ss.setSpan(new ForegroundColorSpan(Color.parseColor("#333333")),
                userCount.length(),
                msg.length(),
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

        holder.mSummaryCount.setText(ss);
    }

    String[] orders = new String[]{"A：", "B：", "C：", "D：", "E：", "F："};

    @Override
    public int getItemCount() {
        return practiceStatisices == null ? 0 : practiceStatisices.size();
    }

    final class ResultViewHolder extends RecyclerView.ViewHolder {

        TextView mSummaryOrder;

        ProgressBar mRightProgressBar;
        ProgressBar mWrongProgressBar;

        TextView mSummaryCount;

        ResultViewHolder(View itemView) {
            super(itemView);
            mSummaryOrder = itemView.findViewById(R.id.qs_summary_order);
            mRightProgressBar = itemView.findViewById(R.id.right_summary_progressBar);
            mWrongProgressBar = itemView.findViewById(R.id.wrong_summary_progressBar);
            mSummaryCount = itemView.findViewById(R.id.qs_summary_count);
        }
    }
}