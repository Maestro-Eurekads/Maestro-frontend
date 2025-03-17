"use client";

import React, { useEffect, useState } from "react";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ClientSelection from "../../../components/ClientSelection";
import { useCampaigns } from "../../utils/CampaignsContext";
import ClientSelectionInput from "../../../components/ClientSelectionInput";
import Checkbox from "../../../components/Checkbox";

export const SetupScreen = () => {
  const {
    state,
    dispatch,
    loadingClients,
    allClients,
    campaignFormData,
    setCampaignFormData,
  } = useCampaigns();
  const { client_selection } = campaignFormData;
  const [isEditing, setIsEditing] = useState(true);
  const [selectedOption, setSelectedOption] = useState("percentage");
  const [clientOptions, setClientOptions] = useState([]);
  const [level1Options, setlevel1Options] = useState([]);
  const [level2Options, setlevel2Options] = useState([]);
  const [level3Options, setlevel3Options] = useState([]);


 

  useEffect(() => {
    if (allClients) {
      const options = allClients.map(
        (c: { documentId: string; client_name: string }) => ({
          id: c?.documentId,
          value: c?.client_name,
          label: c?.client_name,
        })
      );
      setClientOptions(options);
    }
  }, [allClients]);

  useEffect(() => {
    const client = allClients.find((c) => c.documentId === client_selection?.id);
    setlevel1Options(() => {
      const options = client?.level_1?.map((l) => ({
        value: l,
        label: l,
      }));
      return options;
    });
    setlevel2Options(() => {
      const options = client?.level_2?.map((l) => ({
        value: l,
        label: l,
      }));
      return options;
    });
    setlevel3Options(() => {
      const options = client?.level_3?.map((l) => ({
        value: l,
        label: l,
      }));
      return options;
    });
    setCampaignFormData((prev) => ({
      ...prev,
      approver: client?.approver,
    }));
  }, [client_selection]);

 

  const getInputValue = () => {
    if (selectedOption === "fix-amount") {
      return "€10";
    } else if (selectedOption === "percentage") {
      return "15%";
    }
    return "";
  };



  const businessLevel = [
    { value: "Marketing division", label: "Marketing division" },
    { value: "Digital campaigns", label: "Digital campaigns" },
    { value: "Product launch", label: "Product launch" },
  ];



  const selectCurrency = [
    { value: "US Dollar (USD)", label: "US Dollar (USD)" },
    { value: "Euro (EUR)", label: "Euro (EUR)" },
    { value: "British Pound (GBP)", label: "British Pound (GBP)" },
    { value: "Nigerian Naira (NGN)", label: "Nigerian Naira (NGN)" },
    { value: "Japanese Yen (JPY)", label: "Japanese Yen (JPY)" },
    {

      value: "Canadian Dollar (CAD)",
      label: "Canadian Dollar (CAD)",
    },
  ];

  const mediaBudgetPercentage = [
    { value: "Tooling", label: "Tooling" },
    { value: "Fix budget fee", label: "Fix budget fee" },
  ];


  return (
    <div>
      {/* <div className="flex w-full items-center justify-between"> */}
      <PageHeaderWrapper
        t1={"Set up your new campaign"}
        t2={"Fill in the following information to define the foundation of your media plan."}
        t3={"This information helps structure your campaign strategy and align with business goals."}
      />
      {/* {isEditing ? (
          ""
        ) : (
          <button
            className="model_button_blue"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Disable Edit" : "Edit"}
          </button>
        )} */}
      {/* </div> */}

      <div className="mt-[42px]">
        <Title>Client selection</Title>
        <div>
          <ClientSelection
            options={clientOptions}
            label={"Select Client"}
            isEditing={isEditing}
            formId="client_selection"
          />
        </div>
        <div className="flex items-center flex-wrap gap-4 pb-12">
          <ClientSelection
            options={level1Options}
            label={"Parameter Level 1"}
            isEditing={isEditing}
            formId="level_1"
          />

          <ClientSelection
            options={level2Options}
            label={"Parameter Level 2"}
            isEditing={isEditing}
            formId="level_2"
          />
          <ClientSelection
            options={level3Options}
            label={"Parameter Level 3"}
            isEditing={isEditing}
            formId="level_3"
          />
        </div>
        <div className=" pb-12">
          <Title>Media Plan details</Title>
          <div className="client_selection_flow flex flex-wrap gap-4 ">
            <ClientSelectionInput
              label={"Enter media plan name"}
              isEditing={isEditing}
              formId="media_plan"
            />
            <ClientSelectionInput
              label={"Internal Approver"}
              isEditing={isEditing}
              formId="approver"
            />
            {/* <ClientSelection
              options={internalApprover}
              label={"Select internal approver"}
              isEditing={isEditing}
            /> */}
          </div>
        </div>
        <div className="pb-1">
          <Title className="mb-1">Budget details</Title>
          <div className="flex items-center flex-wrap gap-4">
            <ClientSelection
              options={selectCurrency}
              label={"Select currency"}
              isEditing={isEditing}
              formId="budget_details_currency"
            />
            <ClientSelection
              options={mediaBudgetPercentage}
              label={"% of media budget"}
              isEditing={isEditing}
              formId="budget_details_fee_type"
            />
            {campaignFormData?.budget_details_fee_type?.id === "Tooling" && (
              <div className="flex gap-6 mt-[20px]">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="fix-amount"
                    isEditing={isEditing}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    formId="budget_details_sub_fee_type"
                  />
                  <p className="whitespace-nowrap font-medium text-[16px] text-[#061237] mb-1">
                    Fix amount
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="percentage"
                    isEditing={isEditing}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    formId="budget_details_sub_fee_type"
                  />
                  <p className="font-medium text-[16px] text-[#061237] mb-1">
                    Percentage
                  </p>
                </div>
              </div>
            )}
            {/* Display the selected value */}
            <div className="w-[150px]">
              <ClientSelectionInput
                label={getInputValue()}
                isEditing={isEditing}
                formId="budget_details_value"
              />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex justify-end pr-6 mt-[20px]">
        {isEditing ? (
          <button
            disabled={businessLevel.length === 0}
            onClick={() => setIsEditing(false)}
            className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
          >
            Validate
          </button>
        ) : (
          ""
        )}
      </div> */}
    </div>
  );
};
