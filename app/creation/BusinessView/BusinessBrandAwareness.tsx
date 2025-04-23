"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import info from "../../../public/info-circle.svg";
import Skeleton from "react-loading-skeleton";

const BusinessBrandAwareness = ({ statsData, aggregatedStats, loading, isLoadingCampaign }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [animationState, setAnimationState] = useState("");

	const handlePrev = () => {
		setAnimationState("in");
		setCurrentIndex((prev) => (prev === 0 ? statsData?.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setAnimationState("in");
		setCurrentIndex((prev) => (prev === statsData?.length - 1 ? 0 : prev + 1));
	};

	useEffect(() => {
		if (animationState) {
			const timeout = setTimeout(() => {
				setAnimationState("");
			}, 500);
			return () => clearTimeout(timeout);
		}
	}, [animationState]);

	const currentStat = statsData[currentIndex] ?? {};
	const { title, background, indicators, icons } = currentStat;


	// Get all KPIs for the current category
	const currentCategory = statsData[currentIndex]?.kpiCategory;
	const currentCategoryKPIs = aggregatedStats[currentCategory] || {};
	const allStats = Object.keys(currentCategoryKPIs).map((kpiName) => ({
		label: kpiName,
		value: (() => {
			const value = currentCategoryKPIs[kpiName];
			if (value === undefined || value === null) {
				if (kpiName.includes("Cost") || kpiName.includes("CPL")) return "$0";
				if (kpiName.includes("Rate") || kpiName === "CTR" || kpiName === "CVR" || kpiName === "Frequency") return "0%";
				return "0";
			}
			const formattedValue = value % 1 !== 0 ? value.toFixed(2) : value;
			if (kpiName.includes("Cost") || kpiName.includes("CPL")) return `$${formattedValue}`;
			if (kpiName.includes("Rate") || kpiName === "CTR" || kpiName === "CVR" || kpiName === "Frequency") return `${formattedValue}%`;
			return formattedValue;
		})(),
	}));

	return (
		<div className="relative">
			<div
				className="flex flex-col justify-between w-full h-[200px] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]"
				style={{ backgroundColor: background }}
			>
				{loading || isLoadingCampaign ? <Skeleton height={20} width={"70%"} /> :
					<div className="flex items-center justify-between">
						<h3
							key={`title-${currentIndex}`}
							className={`font-medium text-[24px] leading-[32px] text-black ${animationState === "in"
								? "animate-slide-up"
								: animationState === "out"
									? "animate-slide-down"
									: ""
								}`}
						>
							{title}
						</h3>
						<div className="flex items-center gap-2">
							<button disabled={currentIndex === 0} onClick={handlePrev}>
								<Image src={icons?.down} alt="previous" />
							</button>
							<button
								disabled={currentIndex === statsData?.length - 1}
								onClick={handleNext}
							>
								<Image src={icons?.up} alt="next" />
							</button>
						</div>
					</div>}
				{loading || isLoadingCampaign ? <Skeleton height={20} width={"100%"} /> :
					<div className={"flex flex-row w-full overflow-auto"}>
						{allStats?.map((stat, index) => (
							<div key={`stat-${index}-${currentIndex}`}>
								<div
									className={`flex items-center gap-2 ${animationState === "in"
										? "animate-slide-up"
										: animationState === "out"
											? "animate-slide-down"
											: ""
										}`}
								>
									<p className="font-medium text-[12px] leading-[16px] text-[#667085]">
										{stat?.label}
									</p>
									<Image src={info} alt="info" />
								</div>
								<h1
									className={` min-w-[250px] font-medium text-[36px] leading-[49px] text-[#101828] whitespace-nowrap ${animationState === "in"
										? "animate-slide-up"
										: animationState === "out"
											? "animate-slide-down"
											: ""
										}`}
								>
									{stat?.value}
								</h1>
							</div>
						))}
					</div>}
				{loading || isLoadingCampaign ? <Skeleton height={20} width={"100%"} /> :
					<div className="flex items-center gap-2 justify-center">
						{indicators?.map((color, index) => (
							<div
								key={index}
								className="w-[31px] h-0 border-t-[5px] rounded-full"
								style={{ borderColor: color }}
							/>
						))}
					</div>}
			</div>

			<style jsx>{`
        @keyframes slide-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-down {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out forwards;
        }
      `}</style>
		</div>
	);
};

export default BusinessBrandAwareness;