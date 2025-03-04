"use client";

import React, { useState } from "react";
import { Select } from "../../../components/Select";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ClientSelection from "../../../components/ClientSelection";

export const SetupScreen = () => {
  const [isEditing, setIsEditing] = useState(false);

  const clients = [
    { value: "John Doe", label: "John Doe" },
    { value: "Jane Smith", label: "Jane Smith" },
    { value: "Michael Johnson", label: "Michael Johnson" },
    { value: "Emily Davis", label: "Emily Davis" },
  ];

  const businessLevel1 = [
    { value: "startup", label: "Startup" },
    { value: "small_business", label: "Small Business" },
    { value: "enterprise", label: "Enterprise" },
  ];

  const businessLevel2 = [
    { value: "retail", label: "Retail" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "saas", label: "SaaS" },
    { value: "manufacturing", label: "Manufacturing" },
  ];

  const businessLevel3 = [
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
    { value: "d2c", label: "D2C" },
    { value: "government", label: "Government" },
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
    { value: "10", label: "10%" },
    { value: "20", label: "20%" },
    { value: "30", label: "30%" },
    { value: "40", label: "40%" },
    { value: "50", label: "50%" },
    { value: "60", label: "60%" },
    { value: "70", label: "70%" },
    { value: "80", label: "80%" },
    { value: "90", label: "90%" },
    { value: "100", label: "100%" },
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
          <ClientSelection options={clients} label={"Select a client"} />

        </div>
        <div className="client_selection_flow  pb-12">
          <ClientSelection options={businessLevel1} label={"businessLevel1"} />
          <ClientSelection options={businessLevel2} label={"businessLevel2"} />
          <ClientSelection options={businessLevel3} label={"businessLevel3"} />

        </div>
        <div className="pb-12">
          <Title>Media Plan details</Title>
          <div className="flex flex-wrap gap-4">
            <ClientSelection options={mediaPlan} label={"Enter media plan name"} />
            <ClientSelection options={internalApprover} label={"Select internal approver"} />

          </div>
        </div>
        <div className="pb-12">
          <Title>Budget details</Title>
          <div className="flex flex-wrap gap-4">
            <ClientSelection options={selectCurrency} label={"Select currency"} />
            <ClientSelection options={mediaBudgetPercentage} label={"% of media budget"} />

            {/* <Select
              disabled={isEditing}
              name="budget1"
              onChange={(e) => setBudget1(e.target.value)}
              options={options}
              value={budget1}
              className="min-w-[320px]"
              placeholder="Budget Level 1"
            />
             */}
          </div>
        </div>
      </div>
      <div className="flex justify-end pr-6 mt-[20px]">

        {isEditing ? <button
          disabled={businessLevel1.length === 0}
          onClick={() => setIsEditing(false)}
          className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
        >
          Validate
        </button> : ""}

      </div>
    </div>
  );
};
