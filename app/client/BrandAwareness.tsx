import React, { useEffect, useState } from "react";
import Image from "next/image";
import info from "../../public/info-circle.svg";
import downoffline from "../../public/arrow-down-outline.svg";
import upfull from "../../public/arrow-up-full.svg";
import downfull from "../../public/arrow-down-full.svg";
import upoffline from "../../public/arrow-up-offline.svg";
import Skeleton from "react-loading-skeleton";

const BrandAwareness = ({ campaign, loading, isLoadingCampaign }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [animationState, setAnimationState] = useState("");

	const statsData = React.useMemo(() => {
		return [
			{
				title: "Brand Awareness",
				background: "#E5F2F7",
				stats: [
					{ label: "Reach", value: campaign?.brand_awareness?.reach || "0" },
					{ label: "Frequency", value: campaign?.brand_awareness?.frequency || "0%" },
				],
				indicators: ["#3175FF", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0"],
				icons: { up: upfull, down: downoffline },
			},
			{
				title: "Traffic",
				background: "#E6F4D5",
				stats: [
					{ label: "CTR", value: campaign?.traffic?.ctr || "0" },
					{ label: "Total Clicks", value: campaign?.traffic?.total_clicks || "0%" },
					{ label: "Bounce Rate", value: campaign?.traffic?.bounce_rate || "0%" },
				],
				indicators: ["#C0C0C0", "#3175FF", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0"],
				icons: { up: upfull, down: downfull },
			},
			{
				title: "Purchase",
				background: "#FFE2C5",
				stats: [
					{ label: "CTR", value: campaign?.purchase?.ctr || "0" },
					{ label: "Total Orders", value: campaign?.purchase?.total_orders || "0%" },
					{ label: "Conversion Rate", value: campaign?.purchase?.conversion_rate || "0%" },
				],
				indicators: ["#C0C0C0", "#C0C0C0", "#3175FF", "#C0C0C0", "#C0C0C0", "#C0C0C0"],
				icons: { up: upfull, down: downfull },
			},
			{
				title: "Lead Generation",
				background: "#E5F2F7",
				stats: [
					{ label: "CVR", value: campaign?.leads?.cvr || "0" },
					{ label: "Total Leads", value: campaign?.leads?.total || "0" },
					{ label: "CPL", value: campaign?.leads?.cpl || "0%" },
				],
				indicators: ["#C0C0C0", "#C0C0C0", "#C0C0C0", "#3175FF", "#C0C0C0", "#C0C0C0"],
				icons: { up: upfull, down: downfull },
			},
			{
				title: "App Installs",
				background: "#E6F4D5",
				stats: [
					{ label: "CTR", value: campaign?.installs?.ctr || "0" },
					{ label: "Total Installs", value: campaign?.installs?.total || "0%" },
					{ label: "Install Rate", value: campaign?.installs?.rate || "0%" },
				],
				indicators: ["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#3175FF", "#C0C0C0"],
				icons: { up: upfull, down: downfull },
			},
			{
				title: "Video Views",
				background: "#FFE2C5",
				stats: [
					{ label: "CTR", value: campaign?.video?.ctr || "0" },
					{ label: "Total Views", value: campaign?.video?.views || "0%" },
					{ label: "Watch Rate", value: campaign?.video?.watch_rate || "0%" },
				],
				indicators: ["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#3175FF"],
				icons: { up: upoffline, down: downfull },
			},
		];
	}, [campaign]);

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
			const timeout = setTimeout(() => {
				setAnimationState("");
			}, 500);
			return () => clearTimeout(timeout);
		}
	}, [animationState]);

	const { title, background, stats, indicators, icons } = statsData[currentIndex];

	return (
		<div className="relative">
			<div
				className="flex flex-col justify-between w-full h-[200px] border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]"
				style={{ backgroundColor: background }}
			>
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
							<Image src={icons.down} alt="down" />
						</button>
						<button
							disabled={currentIndex === statsData.length - 1}
							onClick={handleNext}
						>
							<Image src={icons.up} alt="up" />
						</button>
					</div>
				</div>

				<div className={`grid ${stats.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
					{stats.map((stat, index) => (
						<div key={`stat-${index}-${currentIndex}`}>
							<div
								className={`flex items-center gap-2 ${animationState === "in"
									? "animate-slide-up"
									: animationState === "out"
										? "animate-slide-down"
										: ""
									}`}
							>
								{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
									<p className="font-medium text-[12px] leading-[16px] text-[#667085]">
										{stat.label}
									</p>}
								<Image src={info} alt="info" />
							</div>
							{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
								<h1
									className={`font-medium text-[36px] leading-[49px] text-[#101828] whitespace-nowrap ${animationState === "in"
										? "animate-slide-up"
										: animationState === "out"
											? "animate-slide-down"
											: ""
										}`}
								>
									{stat.value}
								</h1>}
						</div>
					))}
				</div>

				<div className="flex items-center gap-2 justify-center">
					{indicators.map((color, index) => (
						<div
							key={index}
							className="w-[31px] h-0 border-t-[5px] rounded-full"
							style={{ borderColor: color }}
						/>
					))}
				</div>
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

export default BrandAwareness;
