"use client";
import React from "react";
import DoughnutChart from "components/DoughnutChat";
import CampaignPhases from "./CampaignPhases";
import ChannelDistributionChatTwo from "components/ChannelDistribution/ChannelDistributionChatTwo";
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
  // Budget information
  totalBudget: number;
  currency: string;
  
  // Phase information
  campaignPhases: CampaignPhase[];
  phasesCount?: number; // Optional, will use campaignPhases.length if not provided
  
  // Channel information
  channelData: ChannelDataItem[] | null;
  channelDistributionTitle?: string;
  channelDistributionDescription?: string;
  customFunnels?: Array<{ id: string; name: string; color: string }>;
  
  // Section titles (optional, with defaults)
  budgetByPhaseTitle?: string;
  channelDistributionTitleOverride?: string;
  
  // Styling
  className?: string;
  containerClassName?: string;
}

const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  totalBudget,
  currency,
  campaignPhases,
  phasesCount,
  channelData,
  channelDistributionTitle = "Channel distribution",
  channelDistributionDescription = "Graph showing the total budget spent and its breakdown across the three phases.",
  budgetByPhaseTitle = "Your budget by campaign phase",
  customFunnels,
  className = "",
  containerClassName = "",
}) => {
  const formattedBudget = parseInt(String(totalBudget || 0)).toLocaleString();
  const currencySymbol = getCurrencySymbol(currency || "");
  const insideText = `${formattedBudget} ${currencySymbol}`;
  const displayPhasesCount = phasesCount ?? campaignPhases?.length ?? 0;
  const displayChannelsCount = channelData?.length ?? 0;

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

          <div className="campaign_phases_container mt-[24px]">
            <div className="campaign_phases_container_one">
              <DoughnutChart 
                insideText={insideText}
                campaignPhases={campaignPhases}
                customFunnels={customFunnels}
                totalBudget={totalBudget}
                currency={currency}
              />
            </div>
            <CampaignPhases campaignPhases={campaignPhases} customFunnels={customFunnels} />
          </div>
        </div>

        {/* Right Section: Channel Distribution */}
        <div className="allocate_budget_phase_two">
          <h3 className="font-semibold text-[22px] leading-[24px] flex items-center text-[#061237]">
            {channelDistributionTitle}
          </h3>
          <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
            {channelDistributionDescription}
          </p>
          <div className="mt-[16px]">
            <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
              Channels
            </p>
            <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
              {displayChannelsCount} channels
            </h3>
          </div>
          <ChannelDistributionChatTwo
            channelData={channelData}
            currency={currencySymbol}
            customFunnels={customFunnels}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetOverviewCard;

