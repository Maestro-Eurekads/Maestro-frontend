"use client";
import React, { useEffect, useState } from "react";
import facebook from "../../../public/facebook.svg";
import instagram from "../../../public/instagram.svg";
import youtube from "../../../public/youtube.svg";
import tradedesk from "../../../public/tradedesk.svg";
import quantcast from "../../../public/quantcast.svg";
import adset from "../../../public/adset_level.svg";
import channel from "../../../public/channel_level.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ToggleSwitch from "./EstablishedGoals/ToggleSwitch";
import SetBudgetOverviewModel from "../../../components/Modals/SetBudgetOverviewModel";
import TimelineView from "./EstablishedGoals/TimelineView";
import Modal from "components/Modals/Modal";
import Image from "next/image";
import { useCampaigns } from "app/utils/CampaignsContext";
import TableView from "./EstablishedGoals/table-view/table-view";
import ChannelDistributionChatTwo from "components/ChannelDistribution/ChannelDistributionChatTwo";
import { getCurrencySymbol, mediaTypes } from "components/data";
import CampaignPhases from "./CampaignPhases";
import DoughnutChart from "components/DoughnutChat";
import { useComments } from "app/utils/CommentProvider";

export const EstablishedGoals = () => {
  const [active, setActive] = useState("Timeline View");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [openBudget, setOpenBudget] = useState(false);
  const [channelData, setChannelData] = useState(null);
  const { setCampaignFormData, campaignFormData } = useCampaigns();
  const { setIsDrawerOpen, setClose } = useComments();

  useEffect(() => {
    setIsDrawerOpen(false);
    // setClose(false);
  }, [setIsDrawerOpen]);

  useEffect(() => {
    if (campaignFormData) {
      if (campaignFormData?.goal_level) {
        setIsModalOpen(false);
      } else {
        setIsModalOpen(true);
      }
    }
  }, [campaignFormData]);

  function extractPlatforms(data) {
    const platforms = [];
    data?.channel_mix?.forEach((stage) => {
      const stageName = stage?.funnel_stage;
      const stageBudget = parseFloat(stage?.stage_budget?.fixed_value);
      mediaTypes?.forEach((channelType) => {
        stage[channelType]?.forEach((platform) => {
          const platformName = platform?.platform_name;
          const platformBudget = parseFloat(platform?.budget?.fixed_value);
          const percentage = (platformBudget / stageBudget) * 100;
          const existingPlatform = platforms?.find(
            (p) => p?.platform_name === platformName
          );
          if (existingPlatform) {
            existingPlatform?.stages_it_was_found?.push({
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
      });
    });
    setChannelData(platforms);
  }

  return (
    <div>
      <div className="creation_continer">
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
            extractPlatforms={extractPlatforms}
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
                      {parseInt(campaignFormData?.campaign_budget?.amount).toLocaleString()}{" "}
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
                    <DoughnutChart
                      insideText={`${parseInt(campaignFormData?.campaign_budget?.amount).toLocaleString()} ${getCurrencySymbol(
                        campaignFormData?.campaign_budget?.currency
                      )}`}
                    />
                  </div>

                  <CampaignPhases
                    campaignPhases={campaignFormData?.channel_mix
                      ?.filter((c) => Number(c?.stage_budget?.percentage_value) > 0)
                      ?.map((ch) => ({
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
                      }))}
                  />
                </div>
              </div>
              <div className="allocate_budget_phase_two">
                <h3 className="font-semibold text-[22px] leading-[24px] flex items-center text-[#061237]">
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
        {/* <div className="my-9">
          <ToggleSwitch active={active} setActive={setActive} />
        </div> */}
      </div>

      <TableView />
    </div>
  );
};