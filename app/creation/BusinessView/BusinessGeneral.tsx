import React, { useMemo } from "react";
import Image from "next/image";
import info from "../../../public/info-circle.svg";
import Skeleton from "react-loading-skeleton";
import { getCurrencySymbol } from "components/data";
import axios from "axios";

// Component to display general campaign information like budget, impressions, and CPM
const BusinessGeneral = ({ campaign, loading, isLoadingCampaign, campaign_id }) => {
	const budget = campaign?.campaign_budget?.amount ?? "0";
	const currency = getCurrencySymbol(campaign?.campaign_budget.currency) ?? "";



	// Extract and calculate total impressions and average CPM
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


	// const budgetChange = "+2.5%";
	// const impressionsChange = "+3.1%";
	// const cpmChange = "-1.2%";

	const formatNumber = (value) => {
		if (!value) return "0";
		return Intl.NumberFormat("en-US").format(value);
	};


	const budgetChange = formatNumber(budget);
	const impressionsChange = formatNumber(totalImpressions);
	const cpmChange = averageCpm;

	// Month names for mapping
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	async function updateTrendData(budgetChange, impressionsChange, cpmChange, campaign_id) {
		try {
			const currentDate = new Date();
			const currentMonthIndex = currentDate.getMonth();
			const currentMonth = months[currentMonthIndex];

			// Initialize trendData structure
			let trendData = {
				budgetChange: months.reduce((acc, month) => ({ ...acc, [month]: "0%" }), {}),
				impressionsChange: months.reduce((acc, month) => ({ ...acc, [month]: "0%" }), {}),
				cpmChange: months.reduce((acc, month) => ({ ...acc, [month]: "0%" }), {}),
			};

			// Fetch existing data from Strapi
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-trends?filters[campaign_id][$eq]=${campaign_id}&filters[trend][lastUpdatedMonth][$eq]=${currentMonth}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);

			let storedData = response.data.data[0]?.attributes || null;
			let recordId = response.data.data[0]?.id || null;

			// If data exists, populate trendData with stored values
			if (storedData && storedData.trendData) {
				trendData = storedData.trendData;
			}

			// Check if fetched data matches static data
			const isDataIdentical =
				(!budgetChange || budgetChange === trendData.budgetChange[currentMonth]) &&
				(!impressionsChange || impressionsChange === trendData.impressionsChange[currentMonth]) &&
				(!cpmChange || cpmChange === trendData.cpmChange[currentMonth]);

			// If data is identical, return early without creating or updating
			if (isDataIdentical) {
				console.log("Fetched data matches static data. No update or creation needed.");
				return trendData;
			}

			// Check if any of the values differ from the API data
			let shouldUpdate = false;
			if (budgetChange && budgetChange !== trendData.budgetChange[currentMonth]) {
				trendData.budgetChange[currentMonth] = budgetChange;
				shouldUpdate = true;
			}
			if (impressionsChange && impressionsChange !== trendData.impressionsChange[currentMonth]) {
				trendData.impressionsChange[currentMonth] = impressionsChange;
				shouldUpdate = true;
			}
			if (cpmChange && cpmChange !== trendData.cpmChange[currentMonth]) {
				trendData.cpmChange[currentMonth] = cpmChange;
				shouldUpdate = true;
			}

			// If no changes are needed and data exists, return early
			if (!shouldUpdate && storedData) {
				console.log("No changes detected for the current month.");
				return trendData;
			}

			// Only create or update if there are changes or no existing record
			const updatePayload = {
				data: {
					campaign_id,
					trend: {
						trendData,
						lastUpdatedMonth: currentMonth,
					},
				},
			};

			if (storedData && recordId) {
				// Update existing record
				await axios.put(
					`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-trends/${recordId}`,
					updatePayload,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
						},
					}
				);
				console.log("Data updated in Strapi successfully.");
			} else if (shouldUpdate) {
				// Create new record only if there are changes
				await axios.post(
					`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-trends`,
					updatePayload,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
						},
					}
				);
				console.log("New data created in Strapi successfully.");
			} else {
				console.log("No new data to create.");
				return trendData;
			}

			// Compare with previous month (if available)
			const previousMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
			const previousMonth = months[previousMonthIndex];

			const comparison = {
				budgetChange: {
					current: trendData.budgetChange[currentMonth],
					previous: trendData.budgetChange[previousMonth],
					trend: calculateTrend(trendData.budgetChange[currentMonth], trendData.budgetChange[previousMonth]),
				},
				impressionsChange: {
					current: trendData.impressionsChange[currentMonth],
					previous: trendData.impressionsChange[previousMonth],
					trend: calculateTrend(trendData.impressionsChange[currentMonth], trendData.impressionsChange[previousMonth]),
				},
				cpmChange: {
					current: trendData.cpmChange[currentMonth],
					previous: trendData.cpmChange[previousMonth],
					trend: calculateTrend(trendData.cpmChange[currentMonth], trendData.cpmChange[previousMonth]),
				},
			};

			console.log("Comparison with previous month:", comparison);
			return trendData;
		} catch (error) {
			console.error("Error updating trend data:", error.message);
			throw error;
		}
	}

	function calculateTrend(current, previous) {
		if (current === previous) return "No change";
		return "Updated";
	}

	// Example usage
	if (budgetChange || impressionsChange || cpmChange) {
		updateTrendData(budgetChange, impressionsChange, cpmChange, campaign_id)
			.then((data) => console.log("Final trend data:", data))
			.catch((err) => console.error(err));
	} else {
		console.log("No data available to update trend data.");
	}




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
							<div className="flex justify-center items-center p-[5px] w-[48px] h-[19px] bg-[#B8FFE6] rounded-full text-[12px] leading-[16px] text-[#00A331] mb-2">
								{budgetChange}
							</div>
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
							<div className="flex justify-center items-center p-[5px] w-[48px] h-[19px] bg-[#B8FFE6] rounded-full text-[12px] leading-[16px] text-[#00A331] mb-2">
								{impressionsChange}
							</div>

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
							<div className="flex justify-center items-center p-[5px] w-[48px] h-[19px] bg-[#FFE1E0] rounded-full text-[12px] leading-[16px] text-[#FF0302] mb-2">
								{cpmChange}
							</div>
							<h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
								{currency} {averageCpm}
							</h1>
						</div>}
				</div>
			</div>
		</div>
	);
};

export default BusinessGeneral;

