"use client";
import Image from "next/image";
import left_arrow from "../public/blue_back_arrow.svg";
import CreationFlow from "./CreationFlow";
import closeicon from "../public/layout-left-line.svg";
import { useRouter, useSearchParams } from "next/navigation";
import { useActive } from "../app/utils/ActiveContext";
import {  useState } from "react";
import CreationFlowActive from "./CreationFlowActive";
import symbol from "../public/material-symbols_campaign-rounded.svg";
import funnel from "../public/ant-design_funnel-plot-filled.svg";
import channel from "../public/icon-park-solid_web-page.svg";
import devicefill from "../public/device-fill.svg";
import basket from "../public/bxs_basket.svg";
import click from "../public/fluent_cursor-click-24-filled.svg";
import workbench from "../public/icon-park-solid_workbench.svg";
import checkfill from "../public/mingcute_check-fill.svg";
import Calender from "../public/Calender.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import Skeleton from "react-loading-skeleton";
import { useComments } from "app/utils/CommentProvider";
import { useEffect } from "react";

const SideNav: React.FC = () => {
  const { setClose, close } = useComments();
  const router = useRouter();
  const { setActive, setSubStep, active } = useActive();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const { campaignData, getActiveCampaign, setCampaignData, isLoading, loadingCampaign, loading } = useCampaigns();

  useEffect(() => {
    if (active == 10 || active == 9) {
      console.log('active', active, "here", close)
      setClose(true)
    } else {
      setClose(false)
    }
  }, [active])

  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCampaignData(null);
    setActive(0);
    setSubStep(0);
    router.push("/");
  };

  const steps = [
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Map funnel stages",
      objective:
        campaignData?.funnel_stages?.length > 0
          ? campaignData?.funnel_stages?.length > 3
            ? campaignData?.funnel_stages?.slice(0, 3).join(" · ") + " ..."
            : campaignData?.funnel_stages?.join(" · ")
          : "",
      img: <Image src={funnel} alt="funnel" />,
    },
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Select channel mix",
      img: <Image src={channel} alt="channel" />,
    },
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Configure ad sets and audiences",
      img: <Image src={click} alt="click" />,
    },
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Formats selection",
      img: <Image src={devicefill} alt="devicefill" />,
    },

    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Set buy objectives and types",
      img: <Image src={basket} alt="basket" />,
    },
    {
      vl: "vls",
      vl_done: "vl_dones",
      vl_active: "vl_actives",
      state_text: "SideBar_Menu_state_sub",
      sidecircle: "SideBar_Menu_active_sub",
      title: "Mid-recap",
    },
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Plan campaign schedule",
      img: <Image src={Calender} alt="click" />,
    },
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Allocate Campaign Budget",
      img: <Image src={click} alt="click" />,
    },
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Establish goals",
      img: <Image src={workbench} alt="workbench" />,
    },
    {
      vl: "vl",
      vl_done: "vl_done",
      vl_active: "vl_active",
      state_text: "SideBar_Menu_state",
      sidecircle: "SideBar_Menu_active",
      title: "Overview of your campaign",
      img: <Image src={checkfill} alt="checkfill" />,
    },
  ];

  return (
    <div
      id={close ? "side-nav-active" : "side-nav"}
      className="!flex !flex-col !h-full"
    >
      <div className="flex flex-col">
        <div
          className={`flex ${close ? "justify-center mb-[30px]" : "justify-end"
            } w-full`}
        >
          <button onClick={() => setClose(!close)}>
            <Image src={closeicon} alt="closeicon" />
          </button>
        </div>
        {!close && (
          <div className="flex flex-col items-start mb-8">
            <button
              onClick={handleBackClick}
              className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF] flex items-center gap-2"
            >
              <Image src={left_arrow} alt="menu" />
              <p>Back to Dashboard</p>
            </button>
            {loading || loadingCampaign ? (
              <Skeleton height={20} width={200} />
            ) : !campaignData?.client?.client_name ||
              campaignData?.media_plan_details?.plan_name ===
              undefined ? null : (
              <div>
                <h6 className="font-general-sans font-semibold text-[24px] leading-[36px] text-[#152A37]">
                  {campaignData?.media_plan_details?.plan_name
                    ? campaignData?.media_plan_details?.plan_name
                      .charAt(0)
                      .toUpperCase() +
                    campaignData?.media_plan_details?.plan_name.slice(1)
                    : ""}
                </h6>
              </div>
            )}
            <div className="flex items-center gap-[8px]">
              {loading ? (
                <Skeleton height={20} width={150} />
              ) : !campaignData?.client?.client_name ||
                campaignData?.media_plan_details?.plan_name === undefined ? (
                <p className="text-[#152A37] text-[15px] font-medium leading-[175%] not-italic mt-3">
                  Follow the steps to set up an effective and successful
                  campaign strategy.
                </p>
              ) : (
                <p className="text-[#152A37] text-[15px] font-medium leading-[175%] not-italic">
                  {campaignData?.client?.client_name
                    ? campaignData?.client?.client_name
                      .charAt(0)
                      .toUpperCase() +
                    campaignData?.client?.client_name.slice(1)
                    : ""}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {close ? (
        <CreationFlowActive steps={steps} close={close} />
      ) : (
        <CreationFlow steps={steps} />
      )}
      {!close && (
        <p className="font-general-sans italic font-medium text-[12px] leading-[21px] text-[rgba(6,18,55,0.8)]">
          This screen, all the other ones, as well as the system they build
          together are protected by copyright © - all use, display, and any
          other rights are exclusively reserved to Eurekads Pte. Ltd.
        </p>
      )}
    </div>
  );
};

export default SideNav;
