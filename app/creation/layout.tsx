"use client"

import React from "react";
import SideNav from "../../components/SideNav";
import Bottom from "../../components/Bottom";
import CreationFlowHeader from "../../components/CreationFlowHeader";


function Layout({ children }: never) {


  return (
    <div id="page-wrapper-flow">
      <CreationFlowHeader />
      <SideNav />
      <Bottom />
      <main className="!px-0 bg-[#F9FAFB]">{children}</main>
    </div>
  );
}

export default Layout;
