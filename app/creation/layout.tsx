"use client";

import React, { Suspense, useState } from "react";
import SideNav from "../../components/SideNav";
import Bottom from "../../components/Bottom";
import CreationFlowHeader from "../../components/CreationFlowHeader";
import ComfirmModel from "../../components/Modals/ComfirmModel";
import CommentsDrawer from "components/Drawer/CommentsDrawer";
import { useComments } from "app/utils/CommentProvider";

function Layout({ children }: never) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDrawerOpen, setIsDrawerOpen } = useComments();

  return (
    <div id="page-wrapper-flow">
      <CreationFlowHeader />
      <SideNav />
      <CommentsDrawer isOpen={isDrawerOpen} onClose={setIsDrawerOpen} />
      <Bottom setIsOpen={setIsOpen} />
      <Suspense>
        <main className="!px-0 bg-[#F9FAFB]">{children}</main>
      </Suspense>
      <ComfirmModel isOpen={isOpen} setIsOpen={setIsOpen} planId={undefined} />
    </div>
  );
}

export default Layout;
