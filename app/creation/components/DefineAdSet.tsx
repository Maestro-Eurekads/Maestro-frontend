"use client";

import { useEffect, useState } from "react";
import DefineAdSetPage from "./DefineAdSetPage";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useEditing } from "../../utils/EditingContext";
import { useComments } from "app/utils/CommentProvider";
import { useActive } from "app/utils/ActiveContext";
import { useCampaigns } from "app/utils/CampaignsContext";

const DefineAdSet = () => {
  const { setChange } = useActive()
  const { setIsEditing } = useEditing();
  const { setIsDrawerOpen, setClose } = useComments();
  const { campaignData, campaignFormData } = useCampaigns()

  const [view, setView] = useState<"channel" | "adset">("channel");

  useEffect(() => {
    setView(campaignFormData?.goal_level === "Adset level" ? "adset" : "channel");
  }, [campaignFormData]);

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
    setIsEditing(true);
  }, [setIsDrawerOpen, setClose, setIsEditing]);

  const handleToggleChange = (newView: "channel" | "adset") => {
    setChange(true)
    setView(newView);
  };
  return (
    <div>
      <div className="flex flex-row justify-between ">
        <PageHeaderWrapper
          t1={"Define ad sets"}
          t2={"Specify the details and audiences for each ad set within your campaign."}
          span={1}
        />
      </div>

      <DefineAdSetPage view={view} onToggleChange={handleToggleChange} />
    </div>
  );
};

export default DefineAdSet;