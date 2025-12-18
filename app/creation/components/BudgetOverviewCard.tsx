"use client";
import React from "react";
import DoughnutChart from "components/DoughnutChat";
import CampaignPhases from "./CampaignPhases";
import { getCurrencySymbol } from "components/data";

export interface CampaignPhase {
  name: string;
  percentage: string;
  color: string;
}

export interface ChannelDataItem {
  platform_name: string;
  platform_budegt?: number;
  platform_budget?: number;
  stages_it_was_found?: Array<{
    stage_name: string;
    percentage: number;
  }>;
}

export interface BudgetOverviewCardProps {
  totalBudget: number;
  currency: string;
  campaignPhases: CampaignPhase[];
  phasesCount?: number;
  channelPhases?: CampaignPhase[];
  channelsCount?: number;
  customFunnels?: Array<{ id: string; name: string; color: string }>;
  budgetByPhaseTitle?: string;
  channelDistributionTitle?: string;
  className?: string;
  containerClassName?: string;
}

const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  totalBudget,
  currency,
  campaignPhases,
  phasesCount,
  channelPhases = [],
  channelsCount = 0,
  budgetByPhaseTitle = "Your budget by campaign phase",
  channelDistributionTitle = "Your budget by channel",
  customFunnels,
  className = "",
  containerClassName = "",
}) => {
  const formattedBudget = parseInt(String(totalBudget || 0)).toLocaleString();
  const currencySymbol = getCurrencySymbol(currency || "");
  const insideText = `${formattedBudget} ${currencySymbol}`;
  const displayPhasesCount = phasesCount ?? campaignPhases?.length ?? 0;

  return (
    <div
      className={`w-[100%] items-start p-[24px] gap-[10px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border mt-[20px] ${containerClassName}`}
    >
      <div className={`allocate_budget_phase gap-[5px] ${className}`}>
        {/* Left Section: Budget by Campaign Phase */}
        <div className="allocate_budget_phase_one">
          <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
            {budgetByPhaseTitle}
          </h3>

          <div className="flex items-center gap-5 mt-[16px]">
            <div>
              <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                Total budget
              </p>
              <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                {formattedBudget} {currencySymbol}
              </h3>
            </div>
            <div>
              <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                Campaign phases
              </p>
              <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                {displayPhasesCount} phases
              </h3>
            </div>
          </div>

          <div className="campaign_phases_container mt-[24px] items-start"> 
            <div className="campaign_phases_container_one">
              <DoughnutChart
                insideText={insideText}
                campaignPhases={campaignPhases}
                customFunnels={customFunnels}
                totalBudget={totalBudget}
                currency={currency}
              />
            </div>
            <CampaignPhases
              campaignPhases={campaignPhases}
              customFunnels={customFunnels}
            />
          </div>
        </div>

        {/* Right Section: Budget by Channel (same layout as left) */}
        <div className="allocate_budget_phase_two">
          <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
            {channelDistributionTitle}
          </h3>

          <div className="flex items-center gap-5 mt-[16px]">
            <div>
              <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                Total budget
              </p>
              <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                {formattedBudget} {currencySymbol}
              </h3>
            </div>
            <div>
              <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                Channels
              </p>
              <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                {channelsCount} channels
              </h3>
            </div>
          </div>

          <div className="campaign_phases_container mt-[24px] items-start">
            <div className="campaign_phases_container_one">
              <DoughnutChart
                insideText={insideText}
                campaignPhases={channelPhases}
                totalBudget={totalBudget}
                currency={currency}
              />
            </div>
            <CampaignPhases campaignPhases={channelPhases} customFunnels={[]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverviewCard;
