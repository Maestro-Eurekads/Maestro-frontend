import React, { useEffect, useState } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ObjectiveCard from "./common/ObjectiveCard";
import BuyingObjective from "./common/BuyingObjective";
import { useCampaigns } from "../../utils/CampaignsContext";

const SetBuyObjectivesAndTypesSubStep = () => {
  const [obj, setObj] = useState("");
  const { campaignFormData } = useCampaigns();
  useEffect(() => {
    if (campaignFormData) {
      setObj(campaignFormData?.campaign_objective);
    }
  }, [campaignFormData]);

  return (
    <div>
      <PageHeaderWrapper
        t1={
          "Nice ! Here’s a recap of the buying objectives and types you have set for each platform."
        }
        t2={
          "If it’s all good for you, click on Continue. If not, feel free to click on Edit for each funnel phase to adapt your choices as needed."
        }
      />

      <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
        <ObjectiveCard
          title="The main objective of your campaign"
          span={1}
          subtitle={obj}
          description="You have chosen this objective"
        />

        <BuyingObjective />
      </div>
    </div>
  );
};

export default SetBuyObjectivesAndTypesSubStep;
