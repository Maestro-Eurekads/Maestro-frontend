"use client";

import React, { useState } from "react";
import { Select } from "../../../components/Select";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";

export const SetupScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const options = [
    { value: "client1", label: "Client 1" },
    { value: "client2", label: "Client 2" },
    { value: "client3", label: "Client 3" },
  ];

  const [client, setClient] = useState("");
  const [businessLevel1, setBusinessLevel1] = useState("");
  const [businessLevel2, setBusinessLevel2] = useState("");
  const [businessLevel3, setBusinessLevel3] = useState("");
  const [marketPlan1, setMarketPlan1] = useState("");
  const [marketPlan2, setMarketPlan2] = useState("");
  const [budget1, setBudget1] = useState("");
  const [budget2, setBudget2] = useState("");

  return (
    <div>
      <div className="flex w-full items-center justify-between">
        <PageHeaderWrapper
          t1={'Set up your new campaign'}
          t2={"Fill in the following information to define the foundation of your media plan."}
          t3={"This information helps structure your campaign strategy and align with business goals."}
        />
        <button
          className="model_button_blue"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Disable Edit" : "Edit"}
        </button>
      </div>

      <form>
        <Title>Client selection</Title>
        <div>
          <Select
            disabled={isEditing}
            name="client"
            onChange={(e) => setClient(e.target.value)}
            options={options}
            value={client}
            placeholder="Select a client"
          />
        </div>
        <div className="flex gap-4 pb-12">
          <Select
            disabled={isEditing}
            name="businessLevel1"
            onChange={(e) => setBusinessLevel1(e.target.value)}
            options={options}
            value={businessLevel1}
            className="min-w-[320px]"
            placeholder="Business Level 1"
          />
          <Select
            disabled={isEditing}
            name="businessLevel2"
            onChange={(e) => setBusinessLevel2(e.target.value)}
            options={options}
            value={businessLevel2}
            className="min-w-[320px]"
            placeholder="Business Level 2"
          />
          <Select
            disabled={isEditing}
            name="businessLevel3"
            onChange={(e) => setBusinessLevel3(e.target.value)}
            options={options}
            value={businessLevel3}
            className="min-w-[320px]"
            placeholder="Business Level 3"
          />
        </div>
        <div className="pb-12">
          <Title>Market plan details</Title>
          <div className="flex gap-4">
            <Select
              disabled={isEditing}
              name="marketPlan1"
              onChange={(e) => setMarketPlan1(e.target.value)}
              options={options}
              value={marketPlan1}
              className="min-w-[320px]"
              placeholder="Market Plan 1"
            />
            <Select
              disabled={isEditing}
              name="marketPlan2"
              onChange={(e) => setMarketPlan2(e.target.value)}
              options={options}
              value={marketPlan2}
              className="min-w-[320px]"
              placeholder="Market Plan 2"
            />
          </div>
        </div>
        <div className="pb-12">
          <Title>Budget details</Title>
          <div className="flex gap-4">
            <Select
              disabled={isEditing}
              name="budget1"
              onChange={(e) => setBudget1(e.target.value)}
              options={options}
              value={budget1}
              className="min-w-[320px]"
              placeholder="Budget Level 1"
            />
            <Select
              disabled={isEditing}
              name="budget2"
              onChange={(e) => setBudget2(e.target.value)}
              options={options}
              value={budget2}
              className="min-w-[320px]"
              placeholder="Budget Level 2"
            />
          </div>
        </div>
      </form>
      <div className="flex justify-end pr-6 mt-[20px]">
        <button
          disabled={businessLevel1.length === 0}
          // onClick={() => handleValidate(stage.name)} // Uncomment and fix stage reference when ready
          className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
        >
          Validate
        </button>
      </div>
    </div>
  );
};
