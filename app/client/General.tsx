// import React, { useMemo } from "react";
// import Image from "next/image";
// import info from "../../public/info-circle.svg";
// import Skeleton from "react-loading-skeleton";

import axios from "axios";
import { getCurrencySymbol } from "components/data";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";
import info from "../../public/info-circle.svg";
import { months } from "components/Options";
// const General = ({ campaign, loading, isLoadingCampaign }) => {
// 	const budget = campaign?.campaign_budget?.amount || "0";
// 	const currency = campaign?.budget_details?.currency || "USD";

// 	// Extract and calculate total impressions and average CPM
// 	const { totalImpressions, averageCpm } = useMemo(() => {
// 		let impressions = 0;
// 		let cpmValues = [];

// 		const parseChannels = (channels) => {
// 			channels.forEach((platform) => {
// 				const kpi = platform?.kpi;
// 				if (kpi) {
// 					if (kpi?.impressions) impressions += kpi?.impressions;
// 					if (kpi?.cpm) cpmValues?.push(kpi?.cpm);
// 				}
// 			});
// 		};

// 		campaign?.channel_mix?.forEach((channel) => {
// 			Object.keys(channel).forEach((channelType) => {
// 				if (Array.isArray(channel[channelType])) {
// 					parseChannels(channel[channelType]);
// 				}
// 			});
// 		});

// 		const avgCpm =
// 			cpmValues.length > 0
// 				? (cpmValues?.reduce((sum, value) => sum + value, 0) / cpmValues?.length).toFixed(2)
// 				: "0.00";

// 		return {
// 			totalImpressions: impressions,
// 			averageCpm: avgCpm,
// 		};
// 	}, [campaign]);

// 	const budgetChange = "+2.5%";
// 	const impressionsChange = "+3.1%";
// 	const cpmChange = "-1.2%";

// 	const formatNumber = (value) => {
// 		if (!value) return "0";
// 		return Intl.NumberFormat("en-US").format(value);
// 	};

// 	return (
// 		<div className="flex flex-col justify-between w-full h-[153px] bg-white border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]">
// 			{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 				<h3 className="font-medium text-[24px] leading-[32px] text-black">General</h3>}

// 			<div className="flex items-center justify-between">
// 				{/* Total Budget */}
// 				<div>
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 						<div className="flex items-center gap-2">
// 							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">Total Budget</p>
// 							<Image src={info} alt="info" />
// 						</div>}
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
// 						<div className="flex items-end gap-2">
// 							<div className="flex justify-center items-center p-[5px] w-[48px] h-[19px] bg-[#B8FFE6] rounded-full text-[12px] leading-[16px] text-[#00A331] mb-2">
// 								{budgetChange}
// 							</div>
// 							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
// 								{currency} {formatNumber(budget)}
// 							</h1>
// 						</div>}
// 				</div>

// 				{/* Total Impressions */}
// 				<div>
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 						<div className="flex items-center gap-2">
// 							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">Total Impressions</p>
// 							<Image src={info} alt="info" />
// 						</div>}
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
// 						<div className="flex items-end gap-2">
// 							<div className="flex justify-center items-center p-[5px] w-[48px] h-[19px] bg-[#B8FFE6] rounded-full text-[12px] leading-[16px] text-[#00A331] mb-2">
// 								{impressionsChange}
// 							</div>
// 							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
// 								{totalImpressions}
// 							</h1>
// 						</div>}
// 				</div>

// 				{/* CPM */}
// 				<div>
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 						<div className="flex items-center gap-2">
// 							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">CPM</p>
// 							<Image src={info} alt="info" />
// 						</div>}
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
// 						<div className="flex items-end gap-2">
// 							<div className="flex justify-center items-center p-[5px] w-[48px] h-[19px] bg-[#FFE1E0] rounded-full text-[12px] leading-[16px] text-[#FF0302] mb-2">
// 								{cpmChange}
// 							</div>
// 							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
// 								{currency} {averageCpm}
// 							</h1>
// 						</div>}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default General;



// Month names for mapping


// async function updateTrendData(budgetChange, impressionsChange, cpmChange, campaign_id) {
// 	try {
// 		const currentDate = new Date();
// 		const currentMonthIndex = currentDate.getMonth();
// 		const currentMonth = months[currentMonthIndex];

// 		// Initialize trendData structure
// 		let trendData = {
// 			budgetChange: months.reduce((acc, month) => ({ ...acc, [month]: "0%" }), {}),
// 			impressionsChange: months.reduce((acc, month) => ({ ...acc, [month]: "0%" }), {}),
// 			cpmChange: months.reduce((acc, month) => ({ ...acc, [month]: "0%" }), {}),
// 		};

// 		// Fetch existing data from Strapi for the campaign_id
// 		const response = await axios.get(
// 			`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-trends?filters[campaign_id][$eq]=${campaign_id}`,
// 			{
// 				headers: {
// 					"Content-Type": "application/json",
// 					Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
// 				},
// 			}
// 		);










// Compare with previous month (if available)
// 		const previousMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
// 		const previousMonth = months[previousMonthIndex];

// 		const comparison = {
// 			budgetChange: {
// 				current: trendData.budgetChange[currentMonth],
// 				previous: trendData.budgetChange[previousMonth],
// 				trend: calculateTrend(trendData.budgetChange[currentMonth], trendData.budgetChange[previousMonth]),
// 			},
// 			impressionsChange: {
// 				current: trendData.impressionsChange[currentMonth],
// 				previous: trendData.impressionsChange[previousMonth],
// 				trend: calculateTrend(trendData.impressionsChange[currentMonth], trendData.impressionsChange[previousMonth]),
// 			},
// 			cpmChange: {
// 				current: trendData.cpmChange[currentMonth],
// 				previous: trendData.cpmChange[previousMonth],
// 				trend: calculateTrend(trendData.cpmChange[currentMonth], trendData.cpmChange[previousMonth]),
// 			},
// 		};


// 		return trendData;
// 	} catch (error) {
// 		console.error("Error updating trend data:", error.message);
// 		throw error;
// 	}
// }

// function calculateTrend(current, previous) {
// 	// Remove percentage signs and convert to numbers
// 	const currentValue = parseFloat(current.replace('%', '')) || 0;
// 	// If previous month data is not available (i.e., "0%"), use current value as previous
// 	const previousValue = previous === "0%" ? currentValue : parseFloat(previous.replace('%', '')) || 0;

// 	if (currentValue === previousValue) return "0%";

// 	// Calculate percentage difference
// 	let trend;
// 	if (previousValue === 0) {
// 		trend = currentValue > 0 ? "+100%" : "-100%";
// 	} else {
// 		const difference = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
// 		const roundedDifference = Math.round(difference * 10) / 10; // Round to 1 decimal place
// 		trend = roundedDifference >= 0
// 			? `+${roundedDifference}%`
// 			: `${roundedDifference}%`; // Negative values already include the minus sign
// 	}

// 	return trend;
// }

// Component to display general campaign information like budget, impressions, and CPM
// const General = ({ campaign, loading, isLoadingCampaign, campaign_id }) => {
// 	const budget = campaign?.campaign_budget?.amount ?? "0";
// 	const currency = getCurrencySymbol(campaign?.campaign_budget?.currency) ?? "";

// 	// State for trend data
// 	const [trendData, setTrendData] = useState({
// 		budgetChange: "0%",
// 		impressionsChange: "0%",
// 		cpmChange: "0%"
// 	});

// 	// Extract and calculate total impressions and average CPM
// 	const { totalImpressions, averageCpm } = useMemo(() => {
// 		let impressions = 0;
// 		let cpmValues = [];

// 		const parseChannels = (channels) => {
// 			channels.forEach((platform) => {
// 				const kpi = platform?.kpi;
// 				if (kpi) {
// 					if (kpi?.impressions) impressions += kpi?.impressions;
// 					if (kpi?.cpm) cpmValues?.push(kpi.cpm);
// 				}
// 			});
// 		};

// 		campaign?.channel_mix?.forEach((channel) => {
// 			Object.keys(channel).forEach((channelType) => {
// 				if (Array.isArray(channel[channelType])) {
// 					parseChannels(channel[channelType]);
// 				}
// 			});
// 		});

// 		const avgCpm =
// 			cpmValues.length > 0
// 				? (cpmValues?.reduce((sum, value) => sum + value, 0) / cpmValues?.length).toFixed(2)
// 				: "0.00";

// 		return {
// 			totalImpressions: impressions,
// 			averageCpm: avgCpm,
// 		};
// 	}, [campaign]);

// 	// Fetch or initialize trend data
// 	useEffect(() => {
// 		if (campaign_id && budget && totalImpressions && averageCpm) {
// 			const currentMonth = months[new Date().getMonth()];

// 			// Calculate initial trends based on current values (assuming previous values are 0 if no data)
// 			const calculateInitialTrend = (current, previous = 0) => {
// 				const currentValue = parseFloat(current) || 0;
// 				//@ts-ignore
// 				const previousValue = parseFloat(previous) || 0;
// 				if (previousValue === 0) return currentValue > 0 ? "+100%" : "0%";
// 				const difference = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
// 				const roundedDifference = Math.round(difference * 10) / 10;
// 				return roundedDifference >= 0 ? `+${roundedDifference}%` : `${roundedDifference}%`;
// 			};

// 			const initialBudgetChange = calculateInitialTrend(budget);
// 			const initialImpressionsChange = calculateInitialTrend(totalImpressions);
// 			const initialCpmChange = calculateInitialTrend(averageCpm);



// 			updateTrendData(initialBudgetChange, initialImpressionsChange, initialCpmChange, campaign_id)
// 				.then((data) => {
// 					setTrendData({
// 						budgetChange: data.budgetChange[currentMonth],
// 						impressionsChange: data.impressionsChange[currentMonth],
// 						cpmChange: data.cpmChange[currentMonth]
// 					}); 
// 				})
// 				.catch((err) => console.error("Failed to fetch or create trend data:", err));
// 		}
// 	}, [campaign_id, budget, totalImpressions, averageCpm]);

// 	const formatNumber = (value) => {
// 		if (!value) return "0";
// 		return Intl.NumberFormat("en-US").format(value);
// 	};

// 	// Function to determine trend styles based on value
// 	const getTrendStyles = (trend) => {
// 		if (!trend || trend === "0%") {
// 			return {
// 				backgroundColor: "#E5E7EB", // Neutral gray for no change
// 				color: "#6B7280" // Neutral gray text
// 			};
// 		}
// 		const isPositive = trend.startsWith("+");
// 		return {
// 			backgroundColor: isPositive ? "#B8FFE6" : "#FFE1E0",
// 			color: isPositive ? "#00A331" : "#FF0302"
// 		};
// 	};

// 	return (
// 		<div className="flex flex-col justify-between w-full h-[153px] bg-white border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]">
// 			{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 				<h3 className="font-medium text-[24px] leading-[32px] text-black">General</h3>}

// 			<div className="flex items-center justify-between">
// 				{/* Total Budget */}
// 				<div>
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 						<div className="flex items-center gap-2">
// 							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">Total Budget</p>
// 							<Image src={info} alt="info" />
// 						</div>}
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
// 						<div className="flex items-end gap-2">
// 							<div
// 								className="flex justify-center items-center p-[5px] w-[48px] h-[19px] rounded-full text-[12px] leading-[16px] mb-2"
// 								style={getTrendStyles(trendData.budgetChange)}
// 							>
// 								{trendData.budgetChange}
// 							</div>
// 							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
// 								{currency} {formatNumber(budget)}
// 							</h1>
// 						</div>}
// 				</div>

// 				{/* Total Impressions */}
// 				<div>
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 						<div className="flex items-center gap-2">
// 							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">Total Impressions</p>
// 							<Image src={info} alt="info" />
// 						</div>}
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
// 						<div className="flex items-end gap-2">
// 							<div
// 								className="flex justify-center items-center p-[5px] w-[48px] h-[19px] rounded-full text-[12px] leading-[16px] mb-2"
// 								style={getTrendStyles(trendData.impressionsChange)}
// 							>
// 								{trendData.impressionsChange}
// 							</div>
// 							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
// 								{formatNumber(totalImpressions)}
// 							</h1>
// 						</div>}
// 				</div>

// 				{/* CPM */}
// 				<div>
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
// 						<div className="flex items-center gap-2">
// 							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">CPM</p>
// 							<Image src={info} alt="info" />
// 						</div>}
// 					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
// 						<div className="flex items-end gap-2">
// 							<div
// 								className="flex justify-center items-center p-[5px] w-[48px] h-[19px] rounded-full text-[12px] leading-[16px] mb-2"
// 								style={getTrendStyles(trendData.cpmChange)}
// 							>
// 								{trendData.cpmChange}
// 							</div>
// 							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
// 								{currency} {averageCpm}
// 							</h1>
// 						</div>}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default General;


// import React, { useMemo, useState, useEffect } from "react";
// import Image from "next/image";
// import info from "../../../public/info-circle.svg";
// import Skeleton from "react-loading-skeleton";
// import { getCurrencySymbol } from "components/data";
// import axios from "axios";

// // Month names for mapping
// const months = [
// 	"January", "February", "March", "April", "May", "June",
// 	"July", "August", "September", "October", "November", "December"
// ];

// async function getTrendDataOnly(campaign_id) {
// 	try {
// 		const response = await axios.get(
// 			`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-trends?filters[campaign_id][$eq]=${campaign_id}`,
// 			{
// 				headers: {
// 					"Content-Type": "application/json",
// 					Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
// 				},
// 			}
// 		);

// 		const records = response.data.data;
// 		if (!records || records.length === 0) {
// 			return null;
// 		}

// 		// Use the most recently updated record
// 		const sortedRecords = records.sort((a, b) =>
// 			new Date(b.attributes.updatedAt).getTime() - new Date(a.attributes.updatedAt).getTime()
// 		);
// 		const trendData = sortedRecords[0].attributes.trend?.trendData;

// 		if (!trendData) return null;

// 		const currentMonthIndex = new Date().getMonth();
// 		const currentMonth = months[currentMonthIndex];
// 		const previousMonth = months[(currentMonthIndex + 11) % 12];

// 		const calculateTrend = (current, previous) => {
// 			const currentValue = parseFloat(current.replace('%', '')) || 0;
// 			const previousValue = parseFloat(previous.replace('%', '')) || 0;

// 			if (currentValue === previousValue) return "0%";
// 			if (previousValue === 0) return currentValue > 0 ? "+100%" : "-100%";

// 			const diff = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
// 			const rounded = Math.round(diff * 10) / 10;
// 			return (rounded >= 0 ? "+" : "") + rounded + "%";
// 		};

// 		return {
// 			budgetChange: calculateTrend(trendData.budgetChange[currentMonth], trendData.budgetChange[previousMonth]),
// 			impressionsChange: calculateTrend(trendData.impressionsChange[currentMonth], trendData.impressionsChange[previousMonth]),
// 			cpmChange: calculateTrend(trendData.cpmChange[currentMonth], trendData.cpmChange[previousMonth])
// 		};
// 	} catch (error) {
// 		console.error("Failed to fetch trend data:", error.message);
// 		return null;
// 	}
// }

const General = ({ campaign, loading, isLoadingCampaign, campaign_id }) => {
	const budget = campaign?.campaign_budget?.amount ?? "0";
	const currency = getCurrencySymbol(campaign?.campaign_budget?.currency) ?? "";

	const [trendData, setTrendData] = useState({
		budgetChange: "0%",
		impressionsChange: "0%",
		cpmChange: "0%"
	});

	const { totalImpressions, averageCpm } = useMemo(() => {
		let impressions = 0;
		let cpmValues = [];

		const parseChannels = (channels) => {
			channels.forEach((platform) => {
				const kpi = platform?.kpi;
				if (kpi) {
					if (kpi?.impressions) impressions += kpi?.impressions;
					if (kpi?.cpm) cpmValues?.push(kpi.cpm);
				}
			});
		};

		campaign?.channel_mix?.forEach((channel) => {
			Object.keys(channel).forEach((channelType) => {
				if (Array.isArray(channel[channelType])) {
					parseChannels(channel[channelType]);
				}
			});
		});

		const avgCpm =
			cpmValues.length > 0
				? (cpmValues?.reduce((sum, value) => sum + value, 0) / cpmValues?.length).toFixed(2)
				: "0.00";

		return {
			totalImpressions: impressions,
			averageCpm: avgCpm,
		};
	}, [campaign]);

	// useEffect(() => {
	// 	if (campaign_id) {
	// 		getTrendDataOnly(campaign_id)
	// 			.then(data => {
	// 				if (data) setTrendData(data);
	// 			})
	// 			.catch(err => console.error("Error getting trend data:", err));
	// 	}
	// }, [campaign_id]);

	const formatNumber = (value) => {
		if (!value) return "0";
		return Intl.NumberFormat("en-US").format(value);
	};

	// const getTrendStyles = (trend) => {
	// 	if (!trend || trend === "0%") {
	// 		return {
	// 			backgroundColor: "#E5E7EB",
	// 			color: "#6B7280"
	// 		};
	// 	}
	// 	const isPositive = trend.startsWith("+");
	// 	return {
	// 		backgroundColor: isPositive ? "#B8FFE6" : "#FFE1E0",
	// 		color: isPositive ? "#00A331" : "#FF0302"
	// 	};
	// };

	return (
		<div className="flex flex-col justify-between w-full h-[153px] bg-white border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]">
			{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
				<h3 className="font-medium text-[24px] leading-[32px] text-black">General</h3>}

			<div className="flex items-center justify-between">
				{/* Total Budget */}
				<div>
					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
						<div className="flex items-center gap-2">
							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">Total Budget</p>
							<Image src={info} alt="info" />
						</div>}
					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
						<div className="flex items-end gap-2">
							{/* <div
								className="flex justify-center items-center p-[5px] w-[48px] h-[19px] rounded-full text-[12px] leading-[16px] mb-2"
								style={getTrendStyles(trendData.budgetChange)}
							>
								{trendData?.budgetChange}
							</div> */}
							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
								{currency} {formatNumber(budget)}
							</h1>
						</div>}
				</div>

				{/* Total Impressions */}
				<div>
					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
						<div className="flex items-center gap-2">
							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">Total Impressions</p>
							<Image src={info} alt="info" />
						</div>}
					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
						<div className="flex items-end gap-2">
							{/* <div
								className="flex justify-center items-center p-[5px] w-[48px] h-[19px] rounded-full text-[12px] leading-[16px] mb-2"
								style={getTrendStyles(trendData.impressionsChange)}
							>
								{trendData.impressionsChange}
							</div> */}
							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
								{formatNumber(totalImpressions)}
							</h1>
						</div>}
				</div>

				{/* CPM */}
				<div>
					{loading || isLoadingCampaign ? <Skeleton height={20} width={100} /> :
						<div className="flex items-center gap-2">
							<p className="font-medium text-[12px] leading-[16px] text-[#667085]">CPM</p>
							<Image src={info} alt="info" />
						</div>}
					{loading || isLoadingCampaign ? <Skeleton height={20} width={200} /> :
						<div className="flex items-end gap-2">
							{/* <div
								className="flex justify-center items-center p-[5px] w-[48px] h-[19px] rounded-full text-[12px] leading-[16px] mb-2"
								style={getTrendStyles(trendData.cpmChange)}
							>
								{trendData.cpmChange}
							</div> */}
							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
								{currency} {formatNumber(averageCpm)}
							</h1>
						</div>}
				</div>
			</div>
		</div>
	);
};

export default General;
