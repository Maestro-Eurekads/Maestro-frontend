"use client"

import React from "react";
import SideNav from "../../components/SideNav";
import Bottom from "../../components/Bottom";
import CreationFlowHeader from "../../components/CreationFlowHeader";
// import Header from "../../components/Header";


function Layout({ children }: never) {


  return (
    <div id="page-wrapper">
      <CreationFlowHeader />
      <SideNav />
      <Bottom />
      <main className="!px-0 bg-[#F9FAFB]">{children}</main>
    </div>
  );
}

export default Layout;
