"use client";

import React, { Suspense, useState, useEffect } from "react";
import SideNav from "../../components/SideNav";
import Bottom from "../../components/Bottom";
import CreationFlowHeader from "../../components/CreationFlowHeader";
import ComfirmModel from "../../components/Modals/ComfirmModel";
import CommentsDrawer from "components/Drawer/CommentsDrawer";
import { useComments } from "app/utils/CommentProvider";
import { useActive } from "app/utils/ActiveContext";
import { useRouter } from "next/navigation";

function Layout({ children }: never) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDrawerOpen, setIsDrawerOpen } = useComments();
  const { change, setChange, showModal, setShowModal, active } = useActive();
  const router = useRouter();

  // Global browser back button handler (only for non-SetupScreen pages)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Only handle popstate if we're not on the SetupScreen (step 0)
      // SetupScreen has its own popstate handler
      if (change && !showModal && active !== 0) {
        event.preventDefault();
        setShowModal(true);
        // Prevent the navigation by pushing the current state back
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Add a state to the history stack to enable popstate detection
    window.history.pushState(null, "", window.location.href);

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [change, showModal, setShowModal, active]);

  return (
    <div id="page-wrapper-flow">
      <CreationFlowHeader />
      <SideNav />
      <CommentsDrawer isOpen={isDrawerOpen} onClose={setIsDrawerOpen} />

      <Bottom setIsOpen={setIsOpen} />
      <Suspense>
        <main className="!px-0 bg-[#F9FAFB] !h-full">{children}</main>
      </Suspense>
      <ComfirmModel isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

export default Layout;
