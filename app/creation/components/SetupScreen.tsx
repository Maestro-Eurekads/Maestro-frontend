import React, { useState } from "react";
import { Select } from "../../../components/Select";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";

export const SetupScreen = () => {
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
      <PageHeaderWrapper
        t1={'Set up your new campaign'}
        t2={"Fill in the following information to define the foundation of your media plan. This information helps structure your campaign strategy and align with business goals."}
      />
      <form>
        <Title>Client selection</Title>
        <div>
          <Select
            name="client"
            onChange={(e) => setClient(e.target.value)}
            options={options}
            value={client}
            placeholder="Select a client"
          />
        </div>
        <div className="flex gap-4 pb-12">
          <Select
            name="businessLevel1"
            onChange={(e) => setBusinessLevel1(e.target.value)}
            options={options}
            value={businessLevel1}
            className="min-w-[320px]"
            placeholder="Business Level 1"
          />
          <Select
            name="businessLevel2"
            onChange={(e) => setBusinessLevel2(e.target.value)}
            options={options}
            value={businessLevel2}
            className="min-w-[320px]"
            placeholder="Business Level 2"
          />
          <Select
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
              name="marketPlan1"
              onChange={(e) => setMarketPlan1(e.target.value)}
              options={options}
              value={marketPlan1}
              className="min-w-[320px]"
              placeholder="Market Plan 1"
            />
            <Select
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
              name="budget1"
              onChange={(e) => setBudget1(e.target.value)}
              options={options}
              value={budget1}
              className="min-w-[320px]"
              placeholder="Budget Level 1"
            />
            <Select
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
    </div>
  );
};
