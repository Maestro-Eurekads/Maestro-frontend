"use client";

import { useEffect, useState } from "react";
import DefineAdSetPage from "./DefineAdSetPage";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useEditing } from "../../utils/EditingContext";
import { useComments } from "app/utils/CommentProvider";
import SaveProgressButton from "app/utils/SaveProgressButton";
import SaveAllProgressButton from "./SaveProgres/SaveAllProgressButton";

const DefineAdSet = () => {
  const { setIsEditing } = useEditing();
  const { setIsDrawerOpen, setClose } = useComments();
  const [view, setView] = useState<"channel" | "adset">("channel");

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
    setIsEditing(true);
  }, [setIsDrawerOpen, setClose, setIsEditing]);

  const handleToggleChange = (newView: "channel" | "adset") => {

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
        {/* <SaveProgressButton setIsOpen={undefined} /> */}
        <SaveAllProgressButton />
      </div>

      <DefineAdSetPage view={view} onToggleChange={handleToggleChange} />
    </div>
  );
};

export default DefineAdSet;