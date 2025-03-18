"use client";

import React, { Suspense, useState } from "react";
import SideNav from "../../components/SideNav";
import Bottom from "../../components/Bottom";
import CreationFlowHeader from "../../components/CreationFlowHeader";
import ComfirmModel from "../../components/Modals/ComfirmModel";
import { HeroUIProvider } from "@heroui/react";

function Layout({ children }: never) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="page-wrapper-flow">
      <CreationFlowHeader />
      <SideNav />
      <Bottom setIsOpen={setIsOpen} />
      <Suspense>
        <HeroUIProvider>
          <main className="!px-0 bg-[#F9FAFB]">{children}</main>
        </HeroUIProvider>
      </Suspense>
      <ComfirmModel isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

export default Layout;
