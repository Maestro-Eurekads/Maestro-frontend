import React, { useEffect, useState, useMemo } from "react";
import ConfiguredSetPage from "./ConfiguredSetPage";
import CampaignBudget from "./CampaignBudget";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import DoughnutChat from "../../../components/DoughnutChat";
import ChannelDistributionChatTwo from "../../../components/ChannelDistribution/ChannelDistributionChatTwo";
import CampaignPhases from "./CampaignPhases";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useComments } from "app/utils/CommentProvider";
import Modal from "components/Modals/Modal";
import adset from "../../../public/adset_level.svg";
import channel from "../../../public/channel_level.svg";
import Image from "next/image";
import FeeSelectionStep from "./FeeSelectionStep";
import { mediaTypes } from "components/data";
import PhasedistributionProgress from "../../../components/PhasedistributionProgress";

const ConfigureAdSetsAndBudget = ({ num, netAmount }) => {
  const { setIsDrawerOpen, setClose } = useComments();
  const [step, setStep] = useState(1);
  const [channelData, setChannelData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  useEffect(() => {
    if (campaignFormData) {
      if (campaignFormData?.goal_level) {
        setIsModalOpen(false);
      } else {
        setIsModalOpen(true);
      }
    }
  }, [campaignFormData]);

  const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
      case "EUR":
        return "€";
      case "USD":
        return "$";
      case "GBP":
        return "£";
      case "NGN":
        return "₦";
      case "JPY":
        return "¥";
      case "CAD":
        return "$";
      default:
        return "€";
    }
  };

  // Map Tailwind bg- classes to hex colors for charts
  const tailwindToHex = (tailwindClass: string): string => {
    const colorMap = {
      "bg-blue-500": "#3B82F6",
      "bg-green-500": "#10B981",
      "bg-orange-500 border border-orange-500": "#F97316",
      "bg-red-500 border border-red-500": "#EF4444",
      "bg-purple-500": "#8B5CF6",
      "bg-teal-500": "#14B8A6",
      "bg-pink-500 border border-pink-500": "#EC4899",
      "bg-indigo-500": "#6366F1",
    };
    return colorMap[tailwindClass] || "#6B7280"; // Default to gray if not found
  };

  function extractPlatforms(data) {
    const platforms = [];
    data.channel_mix.forEach((stage) => {
      const stageName = stage.funnel_stage;
      const stageBudget = parseFloat(stage.stage_budget?.fixed_value);
      mediaTypes.forEach((channelType) => {
        stage[channelType].forEach((platform) => {
          const platformName = platform.platform_name;
          const platformBudget = parseFloat(platform.budget?.fixed_value);
          const percentage = (platformBudget / stageBudget) * 100;
          const existingPlatform = platforms.find(
            (p) => p.platform_name === platformName
          );
          if (existingPlatform) {
            existingPlatform.stages_it_was_found.push({
              stage_name: stageName,
              percentage: percentage,
            });
          } else {
            platforms.push({
              platform_name: platformName,
              platform_budget: platformBudget,
              stages_it_was_found: [
                {
                  stage_name: stageName,
                  percentage: percentage,
                },
              ],
            });
          }
        });
      });
    });
    setChannelData(platforms);
  }

  // Get colors from custom_funnels
  const getFunnelColor = (funnelStage: string): string => {
    const funnel = campaignFormData?.custom_funnels?.find(
      (f: any) => f.name === funnelStage
    );
    return funnel ? tailwindToHex(funnel.color) : "#6B7280"; // Default gray if not found
  };

  // Always extract platforms when campaignFormData changes
  useEffect(() => {
    if (campaignFormData) {
      extractPlatforms(campaignFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignFormData]);

  // Prepare funnel stages for DoughnutChat
  const funnelStages =
    campaignFormData?.channel_mix
      ?.filter((c) => Number(c?.stage_budget?.percentage_value) > 0)
      ?.map((ch) => ch?.funnel_stage) || [];

  // Prepare custom funnels for DoughnutChat
  const customFunnels =
    campaignFormData?.custom_funnels?.map((f) => ({
      id: f.id || f.name,
      name: f.name,
      bg: tailwindToHex(f.color),
    })) || [];

  // Prepare insideText for DoughnutChat and calculate dynamic font size
  const insideText = useMemo(() => {
    const amount = parseInt(campaignFormData?.campaign_budget?.amount);
    const currency = getCurrencySymbol(campaignFormData?.campaign_budget?.currency);
    return `${amount.toLocaleString()} ${currency}`;
  }, [campaignFormData]);

  // Calculate total fees amount, defaulting to 0 if not present or invalid
  const totalFeesAmount = useMemo(() => {
    const feesArr = campaignFormData?.campaign_budget?.budget_fees;
    if (!Array.isArray(feesArr) || feesArr.length === 0) {
      return 0;
    }
    const sum = feesArr.reduce(
      (total, fee) => total + Number(fee.value || 0),
      0
    );
    // If sum is not a number (e.g. all fee values are empty), return 0
    return isNaN(sum) ? 0 : sum;
  }, [campaignFormData]);

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <PageHeaderWrapper
          t4="Allocate your budget across channels and ad sets of each phase"
          span={num}
          t1={""}
          t2={""}
        />
      </div>

      <ConfiguredSetPage netAmount={netAmount} />

      <div className="w-[100%] items-start p-[24px] gap-[10px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border mt-[20px]">
        <div className="flex items-center gap-[30px]">
          <p>
            Media Budget Amount:{" "}
            {parseInt(
              campaignFormData?.campaign_budget?.amount
            ).toLocaleString()}
            {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
          </p>
          <p>
            Total Fees Amount:{" "}
            {totalFeesAmount.toLocaleString()}
            {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
          </p>
        </div>

        <div className="allocate_budget_phase gap-[40px]">
          <div className="allocate_budget_phase_one">
            <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
              Your budget by campaign phase
            </h3>
            <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
              Here is a percentage of the total budget allocated to each
              campaign phase.
            </p>
            <div className="flex items-center gap-5 mt-[16px]">
              <div>
                <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                  Total budget
                </p>
                <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                  {parseInt(
                    campaignFormData?.campaign_budget?.amount
                  )?.toLocaleString()}{" "}
                  {getCurrencySymbol(
                    campaignFormData?.campaign_budget?.currency
                  )}
                </h3>
              </div>
              <div>
                <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                  Campaign phases
                </p>
                <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                  {campaignFormData?.funnel_stages?.length} phases
                </h3>
              </div>
            </div>
            <>
            
              <div className="campaign_phases_container mt-[24px] space-x-4">
                <div className="campaign_phases_container_one">
                  <DoughnutChat
                    insideText={insideText}
                    
                  />
                </div>

                <CampaignPhases
                  campaignPhases={campaignFormData?.channel_mix
                    ?.filter(
                      (c) => Number(c?.stage_budget?.percentage_value) > 0
                    )
                    ?.map((ch) => ({
                      name: ch?.funnel_stage,
                      percentage: Number(
                        ch?.stage_budget?.percentage_value
                      )?.toFixed(0),
                      color: getFunnelColor(ch?.funnel_stage),
                    }))}
                />
              </div>
              <PhasedistributionProgress />
            </>
          </div>
          <div className="allocate_budget_phase_two">
            <h3 className="font-semibold text-[22px] leading-[24px] flex items-center text-[#061237]">
              Channel distribution
            </h3>
            <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
              Graph showing the total budget spent and its breakdown across the
              channels.
            </p>
            <div className="mt-[16px]">
              <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                Channels
              </p>
              <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                {channelData?.length} channels
              </h3>
            </div>
            <ChannelDistributionChatTwo
              channelData={channelData}
              currency={getCurrencySymbol(
                campaignFormData?.campaign_budget?.currency
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureAdSetsAndBudget;
