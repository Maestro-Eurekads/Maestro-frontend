"use client";
import React, { useEffect, useState, useMemo } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import SetBudgetOverviewModel from "../../../components/Modals/SetBudgetOverviewModel";
import { useCampaigns } from "app/utils/CampaignsContext";
import TableView from "./EstablishedGoals/table-view/table-view";
import { getCurrencySymbol, mediaTypes } from "components/data";
import CampaignPhases from "./CampaignPhases";
import DoughnutChart from "components/DoughnutChat";
import { useComments } from "app/utils/CommentProvider";
import SaveProgressButton from "app/utils/SaveProgressButton";

export const EstablishedGoals = () => {
  const [openBudget, setOpenBudget] = useState(false);
  const { campaignFormData } = useCampaigns();
  const { setIsDrawerOpen } = useComments();

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [setIsDrawerOpen]);

  const CHANNEL_COLORS = [
    "#3175FF",
    "#00A36C",
    "#FF6B6B",
    "#FFB347",
    "#9B59B6",
    "#1ABC9C",
    "#E74C3C",
    "#F39C12",
    "#3498DB",
    "#2ECC71",
  ];

  const PHASE_COLORS: Record<string, string> = {
    Awareness: "#3175FF",
    Consideration: "#00A36C",
    Conversion: "#FF9037",
  };

  const phaseData = useMemo(() => {
    if (!campaignFormData?.channel_mix) return [];
    return campaignFormData.channel_mix
      .filter((c) => Number(c?.stage_budget?.percentage_value) > 0)
      .map((ch, i) => ({
        name: ch?.funnel_stage,
        percentage: Number(ch?.stage_budget?.percentage_value)?.toFixed(0),
        color:
          PHASE_COLORS[ch?.funnel_stage] ||
          CHANNEL_COLORS[i % CHANNEL_COLORS.length],
      }));
  }, [campaignFormData]);

  const channelData = useMemo(() => {
    if (!campaignFormData?.channel_mix) return [];
    const platforms = [];
    let totalBudget = 0;
    campaignFormData.channel_mix.forEach((stage) => {
      mediaTypes.forEach((channelType) => {
        stage[channelType]?.forEach((platform) => {
          const platformBudget = parseFloat(platform?.budget?.fixed_value) || 0;
          totalBudget += platformBudget;
          const existing = platforms.find(
            (p) => p.name === platform?.platform_name
          );
          if (existing) {
            existing.budget += platformBudget;
          } else {
            platforms.push({
              name: platform?.platform_name,
              budget: platformBudget,
            });
          }
        });
      });
    });
    return platforms
      .filter((p) => p.budget > 0)
      .map((p, i) => ({
        ...p,
        percentage:
          totalBudget > 0 ? Math.round((p.budget / totalBudget) * 100) : 0,
        color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [campaignFormData]);

  return (
    <div>
      <div className="creation_continer">
        <div className="flex flex-row w-full justify-between mb-5">
          <div />
          <SaveProgressButton />
        </div>
        <div className="flex justify-between ">
          <PageHeaderWrapper
            t1={"Establish your goals"}
            t2={
              "Define the KPIs for each phase, channel, and ad set. Use the Table View to input and customize"
            }
            t3={
              "your metrics, and switch to the Timeline View to visualize them across the campaign."
            }
          />

          <SetBudgetOverviewModel
            openBudget={openBudget}
            setOpenBudget={setOpenBudget}
          />
        </div>
        {openBudget && (
          <div className="w-[100%] items-start p-[24px] gap-[10px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border mt-[20px]">
            <div className="allocate_budget_phase gap-[5px]">
              <div className="allocate_budget_phase_one">
                <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
                  Your budget by campaign phase
                </h3>
                <div className="flex items-center gap-5 mt-[16px]">
                  <div>
                    <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                      Total budget
                    </p>
                    <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                      {parseInt(
                        campaignFormData?.campaign_budget?.amount
                      ).toLocaleString()}{" "}
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
                      {phaseData?.length || 0} phases
                    </h3>
                  </div>
                </div>

                <div className="campaign_phases_container mt-[24px]">
                  <div className="campaign_phases_container_one">
                    <DoughnutChart
                      insideText={`${parseInt(
                        campaignFormData?.campaign_budget?.amount
                      ).toLocaleString()} ${getCurrencySymbol(
                        campaignFormData?.campaign_budget?.currency
                      )}`}
                      campaignPhases={phaseData}
                    />
                  </div>
                  <CampaignPhases campaignPhases={phaseData} />
                </div>
              </div>
              <div className="allocate_budget_phase_two">
                <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
                  Your budget by Channels
                </h3>
                <div className="flex items-center gap-5 mt-[16px]">
                  <div>
                    <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                      Total budget
                    </p>
                    <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                      {parseInt(
                        campaignFormData?.campaign_budget?.amount
                      ).toLocaleString()}{" "}
                      {getCurrencySymbol(
                        campaignFormData?.campaign_budget?.currency
                      )}
                    </h3>
                  </div>
                  <div>
                    <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                      Channels
                    </p>
                    <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                      {channelData?.length || 0} channels
                    </h3>
                  </div>
                </div>
                <div className="campaign_phases_container mt-[24px]">
                  <div className="campaign_phases_container_one">
                    <DoughnutChart
                      insideText={`${parseInt(
                        campaignFormData?.campaign_budget?.amount
                      ).toLocaleString()} ${getCurrencySymbol(
                        campaignFormData?.campaign_budget?.currency
                      )}`}
                      campaignPhases={channelData}
                    />
                  </div>
                  <CampaignPhases campaignPhases={channelData} />
                </div>
              </div>
            </div>
          </div>
        )}
        {/* <div className="my-9">
          <ToggleSwitch active={active} setActive={setActive} />
        </div> */}
      </div>

      <TableView />
    </div>
  );
};
