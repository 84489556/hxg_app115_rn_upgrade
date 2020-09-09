#include<ctime>
#include "SplitCalculate.hpp"


const int _unit = 1;

bool comp(const ExRight &a, const ExRight &b){
	return a.exright_date < b.exright_date;
}


CSplitCalculate::CSplitCalculate()
{
}


CSplitCalculate::~CSplitCalculate()
{
}

//void CSplitCalculate::calcSplitData(const std::vector<KLineStick>& source, std::vector<ExRight>& exrights, SplitT split,
//                                    std::map<std::string, int>& mSucceedSplitDate, std::vector<KLineStick>& des)
//{
//	if (SplitT::NONE == split)
//		return;
//
//	CSplitCalculate splitCal;
//	std::map<std::string, int> mNewDateSucceedSplit;
//
//	time_t currentTime = time(NULL);
//	for (int i = 0; i < source.size(); ++i) {
//		const KLineStick& sourceCandleStick = source.at(i);
////		if (sourceCandleStick.entities_size() == 0)
////			continue;
//
//		int exrightDateInFile = 0;													// 文件中保存的最后除权日期
//
//		if (exrights.empty())
//			continue;																	// 无除复权信息，不计算
//		else {
//			auto it = mSucceedSplitDate.find(sourceCandleStick.label());
//			if (it != mSucceedSplitDate.end())
//				exrightDateInFile = it->second;
//			if (exrights[exrights.size() - 1].exright_date <= exrightDateInFile)		// 最后一个除复权日期大于保存日期，则重新计算除复权
//				continue;
//
//			// 过滤大于当前天时间的除复权信息
//			for (auto iter = exrights.begin(); iter != exrights.end(); ) {
//				if (iter->exright_date > currentTime)
//					iter = exrights.erase(iter);
//				else
//					iter++;
//			}
//		}
//
//		if (exrights.empty()) // 无有效除复权信息，不计算
//			continue;
//
////        KLineStick* desCandleStick = des;
//		if (SplitT::FORMER == split)
//			splitCal.reCalcHisFormerData(exrights, sourceCandleStick, des);
//		else if (SplitT::LATTER == split)
//			splitCal.reCalcHisLatterData(exrights, sourceCandleStick, des);
//		else
//			continue;
//
//		// 保存最新除复权日期
//		mNewDateSucceedSplit[sourceCandleStick.label()] = exrights[exrights.size() - 1].exright_date;	// 更新最后时间
//	}
//	// 更新除复权成功日期
//	for (auto a : mNewDateSucceedSplit)
//		mSucceedSplitDate[a.first] = a.second;										// 已存在， 替换
//}

void CSplitCalculate::calcSplitData(const std::vector<KLineStick> source, std::vector<ExRight> exrights, SplitT split, PeriodT period, std::vector<KLineStick>& des)
{
	if (source.empty()) return;

	if (exrights.empty() || SplitT::NONE == split || PeriodT::DAY != period)
	{
		des.assign(source.begin(),source.end());
		return;
	}

	time_t currentTime = time(NULL);

	// 过滤大于当前天时间的除复权信息，及没有除权日期的
	for (auto iter = exrights.begin(); iter != exrights.end(); ) {
		if (iter->exright_date > currentTime || iter->exright_date == -28800)
			iter = exrights.erase(iter);
		else
			iter++;
	}

	// 排序：早-》晚
	sort(exrights.begin(),exrights.end(),comp);

	std::vector<KLineStick> desCandleStick;
	if (SplitT::FORMER == split){

		desCandleStick = reCalcHisFormerData(exrights,source);
		des.assign(desCandleStick.begin(),desCandleStick.end());
	}
	else if (SplitT::LATTER == split){

		desCandleStick = reCalcHisLatterData(exrights,source);
		des.assign(desCandleStick.begin(),desCandleStick.end());
	}

}

std::vector<KLineStick> CSplitCalculate::reCalcHisFormerData(const vector<ExRight_t>& vExRight, const std::vector<KLineStick>& noneStick)
{
	std::vector<KLineStick> desCandleStick;
	desCandleStick.assign(noneStick.begin(),noneStick.end());
	for (const auto& exRight : vExRight) {

		for (int i = 0; i < desCandleStick.size(); ++i) {
			KLineStick& tempEntity = desCandleStick.at(i);
			if (tempEntity.time < exRight.exright_date) {
				tempEntity.close = (calcFormerData(tempEntity.close, exRight));
				tempEntity.open = (calcFormerData(tempEntity.open, exRight));
				tempEntity.low = (calcFormerData(tempEntity.low, exRight));
				tempEntity.high = (calcFormerData(tempEntity.high, exRight));
			}
		}

	}

	return desCandleStick;
}

std::vector<KLineStick> CSplitCalculate::reCalcHisLatterData(const vector<ExRight_t>& vExRight, const std::vector<KLineStick>& noneStick)
{
	std::vector<KLineStick> desCandleStick;
	desCandleStick.assign(noneStick.begin(),noneStick.end());
	for (auto exRight = vExRight.rbegin(); exRight != vExRight.rend(); exRight++) {

		for (int i = desCandleStick.size() - 1; i >= 0; --i) {
			KLineStick& tempEntity = desCandleStick.at(i);
			if (tempEntity.time >= (*exRight).exright_date) {
				tempEntity.close = (calcLatterData(tempEntity.close, *exRight));
				tempEntity.open = (calcLatterData(tempEntity.open, *exRight));
				tempEntity.low = (calcLatterData(tempEntity.low, *exRight));
				tempEntity.high = (calcLatterData(tempEntity.high, *exRight));
			}
		}

	}

	return desCandleStick;
}

double CSplitCalculate::calcFormerData(const double& price, const ExRight_t& exRight)
{
	double tempValue = (exRight.extend + exRight.give + exRight.match)/_unit;
	return ((price - exRight.alloc_interest/_unit) + exRight.match_price*tempValue) / (1 + tempValue);
}

double CSplitCalculate::calcLatterData(const double& price, const ExRight_t& exRight) 
{
	double tempValue = (exRight.extend + exRight.give + exRight.match)/_unit;
	return price * (1 + tempValue) - exRight.match_price*tempValue + exRight.alloc_interest/_unit;
}
