"use client";
import { useState } from "react";
import Modal from "./Modal";
import facebook from "../../public/facebook.svg";
import instagram from "../../public/instagram.svg";
import youtube from "../../public/youtube.svg";
import tradedesk from "../../public/tradedesk.svg";
import quantcast from "../../public/quantcast.svg";
import adset from "../../public/adset_level.svg";
import channel from "../../public/channel_level.svg";
import Image from "next/image";
import { useCampaigns } from "app/utils/CampaignsContext";

const SetBudgetOverviewModel = ({
  openBudget,
  setOpenBudget,
  extractPlatforms,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { campaignFormData } = useCampaigns();


  const [view, setView] = useState<"Table" | "Timeline">("Table");

  return (
    <div>
      <button
        className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
        style={{ border: "1px solid #3175FF" }}
        onClick={() => {
          setOpenBudget((prev) => !prev);
          extractPlatforms(campaignFormData);
        }}
      >
        {`${openBudget ? "Hide" : "Show"} budget overview`}
      </button>
    </div>
  );
};

export default SetBudgetOverviewModel;
