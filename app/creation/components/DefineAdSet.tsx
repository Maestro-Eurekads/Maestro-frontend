"use client";

import React, { useEffect } from "react";
import DefineAdSetPage from "./DefineAdSetPage";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useComments } from "app/utils/CommentProvider";

const DefineAdSet = () => {
  const { setIsDrawerOpen, setClose } = useComments();
  
  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          t1={"Define ad sets"}
          t2={"Specify the details and audiences for each ad set within your campaign."}
          span={1}
        />
      </div>
      <DefineAdSetPage />
    </div>
  );
};

export default DefineAdSet;