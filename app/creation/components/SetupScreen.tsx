"use client";

import React, { useState } from "react";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ClientSelection from "../../../components/ClientSelection";
import { useCampaigns } from "../../utils/CampaignsContext";
import ClientSelectionInput from "../../../components/ClientSelectionInput";
import Checkbox from "../../../components/Checkbox";

export const SetupScreen = () => {
  const { state, dispatch } = useCampaigns();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOption, setSelectedOption] = useState("percentage");

  const getInputValue = () => {
    if (selectedOption === "fix-amount") {
      return "€10";
    } else if (selectedOption === "percentage") {
      return "15%";
    }
    return "";
  };


  const handleObjectiveSelection = () => {
    dispatch({
      type: "UPDATE_CAMPAIGN",
      payload: {
        step: "defineCampaignObjective",
        data: { selectedObjective: "Brand Awareness" },
      },
    });
  };





  const businessLevel = [
    { value: "Marketing division", label: "Marketing division" },
    { value: "Digital campaigns", label: "Digital campaigns" },
    { value: "Product launch", label: "Product launch" },
  ];


  const internalApprover = [
    { value: "Karl Roida", label: "Karl Roida" },
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
    { value: "Tooling", label: "Tooling" },

  ];
  const clientselection = [
    { value: "Nike", label: "Nike" },
    { value: "Sony", label: "Sony" },

  ];





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
          <ClientSelection options={clientselection} label={"Select Client"} isEditing={isEditing} />
        </div>
        <div className="client_selection_flow  pb-12">
          <ClientSelection options={businessLevel} label={"Business level 1"} isEditing={isEditing} />
          <ClientSelection options={businessLevel} label={"Business level 2"} isEditing={isEditing} />
          <ClientSelection options={businessLevel} label={"Business level 3"} isEditing={isEditing} />

        </div>
        <div className=" pb-12">
          <Title>Media Plan details</Title>
          <div className="client_selection_flow flex flex-wrap gap-4 ">
            <ClientSelectionInput label={"Enter media plan name"} isEditing={isEditing} />
            <ClientSelection options={internalApprover} label={"Select"} isEditing={isEditing} />
          </div>
        </div>
        <div className="pb-1">
          <Title className="mb-1">Budget details</Title>
          <div className="flex items-center flex-wrap gap-4">
            <ClientSelection options={selectCurrency} label={"Select currency"} isEditing={isEditing} />
            <ClientSelection options={mediaBudgetPercentage} label={"% of media budget"} isEditing={isEditing} />

            {/* Radio Buttons */}
            <div className="flex gap-6 mt-[20px]">
              <div className="flex items-center gap-3">
                <Checkbox id="fix-amount" isEditing={isEditing} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
                <p className="whitespace-nowrap font-medium text-[16px] text-[#061237] mb-1">
                  Fix amount
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="percentage" isEditing={isEditing} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
                <p className="font-medium text-[16px] text-[#061237] mb-1">
                  Percentage
                </p>
              </div>
            </div>




          </div>
        </div>
        {/* Display the selected value */}
        <ClientSelectionInput label={getInputValue()} isEditing={isEditing} />
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
