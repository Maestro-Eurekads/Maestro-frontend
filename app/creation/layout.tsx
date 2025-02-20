"use client"

import React, { useState } from "react";
import SideNav from "../../components/SideNav";
import Bottom from "../../components/Bottom";
import CreationFlowHeader from "../../components/CreationFlowHeader";
import ComfirmModel from "../homepage/components/ComfirmModel";


function Layout({ children }: never) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="page-wrapper-flow">
      <CreationFlowHeader />
      <SideNav />
      <Bottom setIsOpen={setIsOpen} />
      <main className="!px-0 bg-[#F9FAFB]">{children}</main>
      <ComfirmModel isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

export default Layout;
