import React, { useState } from "react";
import ConfiguredSetPage from "./ConfiguredSetPage";
import CampaignBudget from "./CampaignBudget";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import DoughnutChat from "../../../components/DoughnutChat";
import ChannelDistributionChatTwo from "../../../components/ChannelDistribution/ChannelDistributionChatTwo";
import CampaignPhases from "./CampaignPhases";
import { useCampaigns } from "app/utils/CampaignsContext";

const ConfigureAdSetsAndBudget = () => {
  const [show, setShow] = useState(false); // Start with budget shown
  const campaignPhases = [
    { name: "Awareness", percentage: 25, color: "#3175FF" },
    { name: "Consideration", percentage: 50, color: "#00A36C" },
    { name: "Conversion", percentage: 25, color: "#FF9037" },
  ];

  const [channelData, setChannelData] = useState(null);
  const { campaignFormData } = useCampaigns();

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

  function extractPlatforms(data) {
    const platforms = [];
    data.channel_mix.forEach((stage) => {
      const stageName = stage.funnel_stage;
      const stageBudget = parseFloat(stage.stage_budget?.fixed_value);
      ["search_engines", "display_networks", "social_media"].forEach(
        (channelType) => {
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
                platform_budegt: platformBudget,
                stages_it_was_found: [
                  {
                    stage_name: stageName,
                    percentage: percentage,
                  },
                ],
              });
            }
          });
        }
      );
    });
    setChannelData(platforms);
  }

  return (
    <div>
      <CampaignBudget />
      <div>
        <div className="flex justify-between items-baseline">
          <PageHeaderWrapper
            t4="Allocate your budget across channels and ad sets of each phase"
            span={2}
            t1={""}
            t2={""}
          />

          <button
            onClick={() => {
              setShow(!show);
              extractPlatforms(campaignFormData);
            }}
          >
            <p className="font-semibold text-[16px] leading-[22px] flex items-center underline text-[#061237]">
              {show ? "Hide your budget overview" : "Show your budget overview"}
            </p>
          </button>
        </div>

        {show && (
          <div className="w-[100%] items-start p-[24px] gap-[10px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border mt-[20px]">
            <div className="allocate_budget_phase gap-[5px]">
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
                      {campaignFormData?.campaign_budget?.amount}{" "}
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

                <div className="campaign_phases_container mt-[24px]">
                  <div className="campaign_phases_container_one">
                    <DoughnutChat
                      data={campaignFormData?.channel_mix?.filter((c)=>Number(c?.stage_budget?.percentage_value) > 0)?.map((ch) =>
                        Number(ch?.stage_budget?.percentage_value)?.toFixed(0)
                      )}
                      color={campaignFormData?.channel_mix?.map((ch) =>
                        ch?.funnel_stage === "Awareness"
                          ? "#3175FF"
                          : ch?.funnel_stage === "Consideration"
                          ? "#00A36C"
                          : ch?.funnel_stage === "Conversion"
                          ? "#FF9037"
                          : "#F05406"
                      )}
                      insideText={`${
                        campaignFormData?.campaign_budget?.amount
                      } ${getCurrencySymbol(
                        campaignFormData?.campaign_budget?.currency
                      )}`}
                    />
                  </div>

                  <CampaignPhases
                    campaignPhases={campaignFormData?.channel_mix?.filter((c)=>Number(c?.stage_budget?.percentage_value) > 0)?.map(
                      (ch) => ({
                        name: ch?.funnel_stage,
                        percentage: Number(
                          ch?.stage_budget?.percentage_value
                        )?.toFixed(0),
                        color:
                          ch?.funnel_stage === "Awareness"
                            ? "#3175FF"
                            : ch?.funnel_stage === "Consideration"
                            ? "#00A36C"
                            : ch?.funnel_stage === "Conversion"
                            ? "#FF9037"
                            : "#F05406",
                      })
                    )}
                  />
                  {/* <div className='campaign_phases_container_two flex flex-col gap-[28px]'>
										<div className='flex items-center gap-2'>
											<div className="w-[12px] h-[12px] bg-[#3175FF] rounded-[4px]"></div>
											<p className="   font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
												Awareness (25%)
											</p>
										</div>
										<div className='flex items-center gap-2'>
											<div className="w-[12px] h-[12px] bg-[#00A36C] rounded-[4px]"></div>
											<p className="   font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
												Consideration (23%)
											</p>
										</div>
										<div className='flex items-center gap-2'>
											<div className="w-[12px] h-[12px] bg-[#FF9037] rounded-[4px]"></div>
											<p className="   font-medium text-[14px] leading-[19px] flex items-center text-[rgba(6,18,55,0.8)]">
												Conversion (25%)
											</p>
										</div>
									</div> */}
                </div>
              </div>
              <div className="allocate_budget_phase_two">
                <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
                  Channel distribution
                </h3>
                <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
                  Graph showing the total budget spent and its breakdown across
                  the three phases.
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
        )}
        <ConfiguredSetPage />
      </div>
    </div>
  );
};

export default ConfigureAdSetsAndBudget;
