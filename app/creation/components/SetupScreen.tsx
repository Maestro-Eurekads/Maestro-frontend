import React, { useState } from "react";
import { Select } from "../../utils/components/Select";
import { Title } from "../../utils/components/Title";

export const SetupScreen = ({}) => {
  const options = [
    { value: "client1", label: "Client 1" },
    { value: "client2", label: "Client 2" },
    { value: "client3", label: "Client 3" },
  ];
  const [client, setClient] = useState<string>("");

  return (
    <div>
      <header className="pb-[48px]">
        <h2 className="text-2xl font-bold">Set up your new campaign</h2>
        <p className="max-w-[992px] my-4">
          Fill in the following information to define the foundation of your
          media plan. This information helps structure your campaign strategy
          and align with business goals.
        </p>
      </header>
      <form action="">
        <Title>Client selection</Title>
        <div>
          <Select
            name="client"
            onChange={(e) => setClient(e.target.value)}
            options={options}
            value={client}
          />
        </div>
        <div className="flex  gap-4 pb-[48px]">
          <Select
            name="client"
            onChange={(e) => setClient(e.target.value)}
            options={options}
            value={client}
            className="min-w-[320px]"
            placeholder="Business Level 1"
          />
          <Select
            name="client"
            onChange={(e) => setClient(e.target.value)}
            options={options}
            value={client}
            className="min-w-[320px]"
            placeholder="Business Level 2"
          />
          <Select
            name="client"
            onChange={(e) => setClient(e.target.value)}
            options={options}
            value={client}
            className="min-w-[320px]"
            placeholder="Business Level 3"
          />
        </div>
        <div className="pb-[48px]">
          <Title>Market plan details</Title>
          <div className="flex gap-4">
            <Select
              name="client"
              onChange={(e) => setClient(e.target.value)}
              options={options}
              value={client}
              className="min-w-[320px]"
              placeholder="Business Level 2"
            />
            <Select
              name="client"
              onChange={(e) => setClient(e.target.value)}
              options={options}
              value={client}
              className="min-w-[320px]"
              placeholder="Business Level 3"
            />
          </div>
        </div>
        <div className="pb-[48px]">
          <Title>Budget details</Title>
          <div className="flex gap-4">
            <Select
              name="client"
              onChange={(e) => setClient(e.target.value)}
              options={options}
              value={client}
              className="min-w-[320px]"
              placeholder="Business Level 2"
            />
            <Select
              name="client"
              onChange={(e) => setClient(e.target.value)}
              options={options}
              value={client}
              className="min-w-[320px]"
              placeholder="Business Level 3"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
