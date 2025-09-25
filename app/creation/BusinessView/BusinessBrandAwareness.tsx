"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import info from "../../../public/info-circle.svg";
import Skeleton from "react-loading-skeleton";
import { MdOutlineErrorOutline } from "react-icons/md";
import { formatKPIValue, kpiFormatMap } from "components/Options";
import { getCurrencySymbol } from "components/data";






const BusinessBrandAwareness = ({ statsData = [], aggregatedStats = {}, loading, isLoadingCampaign, campaign }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [animationState, setAnimationState] = useState("");
	const currency = getCurrencySymbol(campaign?.campaign_budget?.currency) ?? "";


	const handlePrev = () => {
		setAnimationState("in");
		setCurrentIndex((prev) => (prev === 0 ? statsData.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setAnimationState("in");
		setCurrentIndex((prev) => (prev === statsData.length - 1 ? 0 : prev + 1));
	};

	useEffect(() => {
		if (animationState) {
			const timeout = setTimeout(() => setAnimationState(""), 500);
			return () => clearTimeout(timeout);
		}
	}, [animationState]);

	const currentStat = statsData[currentIndex] || {};
	const { title, background, indicators = [], icons = {} } = currentStat;

	const currentCategory = currentStat?.kpiCategory;
	const currentCategoryKPIs = aggregatedStats[currentCategory] || {};



	const allStats = useMemo(() =>
		Object.keys(currentCategoryKPIs).map((kpiName) => ({
			label: kpiName,
			value: formatKPIValue(currentCategoryKPIs[kpiName], kpiName, currency),
		}))
		, [currentCategoryKPIs, currency]);


	const showNoData = statsData?.length === 0 && !loading && !isLoadingCampaign;

	return (
		<div className="relative">
			<div
				className="flex flex-col justify-between w-full h-[200px] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]"
				style={{ backgroundColor: background }}
			>
				{showNoData ? (
					<div className="center-content">
						<MdOutlineErrorOutline size={75} color="#29292968" />
						<p className="mt-3 text-[#29292968]">No record found</p>
					</div>
				) : (
					<div className="flex flex-col gap-4 w-full">
						{loading || isLoadingCampaign ? (
							<Skeleton height={20} width="70%" />
						) : (
							<div className="flex items-center justify-between">
								<h3 className={`font-medium text-[24px] leading-[32px] text-black ${animationState === "in" ? "animate-slide-up" : animationState === "out" ? "animate-slide-down" : ""}`}>
									{title}
								</h3>
								<div className="flex items-center gap-2">
									<button disabled={currentIndex === 0} onClick={handlePrev}>
										{icons?.down && <Image src={icons.down} alt="previous" />}
									</button>
									<button disabled={currentIndex === statsData.length - 1} onClick={handleNext}>
										{icons?.up && <Image src={icons.up} alt="next" />}
									</button>
								</div>
							</div>
						)}

						{loading || isLoadingCampaign ? (
							<Skeleton height={20} width="100%" />
						) : (
							<div className="flex flex-row w-full overflow-auto gap-4">
								{allStats?.map((stat, index) => (
									<div key={`stat-${index}-${currentIndex}`}>
										<div className={`flex items-center gap-2 ${animationState === "in" ? "animate-slide-up" : animationState === "out" ? "animate-slide-down" : ""}`}>
											<p className="font-medium text-[12px] leading-[16px] text-[#667085]">{stat.label}</p>
											<Image src={info} alt="info" />
										</div>
										<h1 className={`min-w-[250px] font-medium text-[36px] leading-[49px] text-[#101828] whitespace-nowrap ${animationState === "in" ? "animate-slide-up" : animationState === "out" ? "animate-slide-down" : ""}`}>
											{stat?.value}
										</h1>
									</div>
								))}
							</div>
						)}

						{loading || isLoadingCampaign ? (
							<Skeleton height={20} width="100%" />
						) : (
							<div className="flex items-center gap-2 justify-center">
								{indicators?.map((color, index) => (
									<div key={index} className="w-[31px] h-0 border-t-[5px] rounded-full" style={{ borderColor: color }} />
								))}
							</div>
						)}
					</div>
				)}
			</div>

			<style jsx>{`
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.5s ease-out forwards; }
      `}</style>
		</div>
	);
};

export default BusinessBrandAwareness;