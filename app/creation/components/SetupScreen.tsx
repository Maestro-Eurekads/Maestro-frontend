"use client";

import React, { useState } from "react";
import { Select } from "../../../components/Select";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ClientSelection from "../../../components/ClientSelection";
import { useCampaigns } from "../../utils/CampaignsContext";
import ClientSelectionInput from "../../../components/ClientSelectionInput";

export const SetupScreen = () => {
  const { state, dispatch } = useCampaigns();
  const [isEditing, setIsEditing] = useState(false);



  const handleObjectiveSelection = () => {
    dispatch({
      type: "UPDATE_CAMPAIGN",
      payload: {
        step: "defineCampaignObjective",
        data: { selectedObjective: "Brand Awareness" },
      },
    });
  };

  // const campaigns = [

  // {
  //   campaigns: {
  //     mediaplan: {
  //       setupNewCampaign: {},
  //       defineCampaignObjective: {},
  //       mapFunnelStages: {},
  //       selectChannelMix: {},
  //       formatsSelection: {},
  //       setBuyObjectivesandTypes: {},
  //       midRecap: {},
  //       planCampaignSchedule: {},
  //       configureAdSetsandBudget: {},
  //       establishGoals: {},
  //       overviewOfYourCampaign: {},
  //     }
  //   }
  // },
  // ];

  const clients = [
    { value: "John Doe", label: "John Doe" },
    { value: "Jane Smith", label: "Jane Smith" },
    { value: "Michael Johnson", label: "Michael Johnson" },
    { value: "Emily Davis", label: "Emily Davis" },
  ];

  const businessLevel = [
    { value: "Marketing division", label: "Marketing division" },
    { value: "Digital campaigns", label: "Digital campaigns" },
    { value: "Product launch", label: "Product launch" },
  ];



  const mediaPlan = [
    { value: "Social Media", label: "Social Media Advertising" },
    { value: "Search Engine", label: "Search Engine Marketing" },
    { value: "Display Ads", label: "Display Advertising" },
    { value: "Video Ads", label: "Video Advertising" },
    { value: "Influencer Marketing", label: "Influencer Marketing" },
  ];

  const internalApprover = [
    { value: "Marketing Manager", label: "Marketing Manager" },
    { value: "Finance Team", label: "Finance Team" },
    { value: "Ceo", label: "CEO" },
    { value: "Board of directors", label: "Board of Directors" },
  ];


  const selectCurrency = [
    { value: "usd", label: "US Dollar (USD)" },
    { value: "eur", label: "Euro (EUR)" },
    { value: "gbp", label: "British Pound (GBP)" },
    { value: "ngn", label: "Nigerian Naira (NGN)" },
    { value: "jpy", label: "Japanese Yen (JPY)" },
    { value: "cad", label: "Canadian Dollar (CAD)" },
  ];

  const mediaBudgetPercentage = [
    { value: "Fix Budget fee", label: "Fix Budget fee" },
    { value: "Fix Budget fee", label: "% of media budget" },

  ];

  const currencyPercentage = [
    { value: "0 %", label: "0 %" },
    { value: "0 €  ", label: "0 €" }
  ]



  return (
    <div>
      <div className="flex w-full items-center justify-between">
        <PageHeaderWrapper
          t1={'Set up your new campaign'}
          t2={"Fill in the following information to define the foundation of your media plan."}
          t3={"This information helps structure your campaign strategy and align with business goals."}
        />
        {isEditing ? "" : <button
          className="model_button_blue"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Disable Edit" : "Edit"}
        </button>}

      </div>

      <div className="mt-[42px]">
        <Title>Client selection</Title>
        <div>
          <ClientSelection options={clients} label={"Select a client"} isEditing={isEditing} />

        </div>
        <div className="client_selection_flow  pb-12">
          <ClientSelection options={businessLevel} label={"Business level 1"} isEditing={isEditing} />
          <ClientSelection options={businessLevel} label={"Business level 2"} isEditing={isEditing} />
          <ClientSelection options={businessLevel} label={"Business level 3"} isEditing={isEditing} />

        </div>
        <div className=" pb-12">
          <Title>Media Plan details</Title>
          <div className="client_selection_flow flex flex-wrap gap-4 ">
            <ClientSelectionInput label={"Spring Collection Launch 2025"} isEditing={isEditing} />
            <ClientSelection options={internalApprover} label={"Select internal approver"} isEditing={isEditing} />
          </div>
        </div>
        <div className="pb-1">
          <Title className="mb-1">Budget details</Title>
          <div className="flex items-center flex-wrap gap-4">
            <ClientSelection options={selectCurrency} label={"Select currency"} isEditing={isEditing} />
            <ClientSelection options={mediaBudgetPercentage} label={"% of media budget"} isEditing={isEditing} />
            <div className="flex gap-6 mt-[20px]">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-[18px] h-[18px] rounded-md border-[0.69px] border-gray-400 cursor-pointer appearance-none checked:bg-blue-500 checked:border-transparent relative 
      before:content-['✔'] before:absolute before:text-white before:text-[12px] before:font-bold before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
                />
                <p className="whitespace-nowrap">Fix amount</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-[18px] h-[18px] rounded-md border-[0.69px] border-gray-400 cursor-pointer appearance-none checked:bg-blue-500 checked:border-transparent relative 
      before:content-['✔'] before:absolute before:text-white before:text-[12px] before:font-bold before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
                />
                <p>Percentage</p>
              </div>
            </div>



          </div>
        </div>
        <ClientSelectionInput label={"0 %"} isEditing={isEditing} />
      </div>
      <div className="flex justify-end pr-6 mt-[20px]">

        {isEditing ? <button
          disabled={businessLevel.length === 0}
          onClick={() => setIsEditing(false)}
          className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
        >
          Validate
        </button> : ""}

      </div>
    </div>
  );
};
