"use client";

import React, { Suspense, useState, useEffect } from "react";
import SideNav from "../../components/SideNav";
import Bottom from "../../components/Bottom";
import CreationFlowHeader from "../../components/CreationFlowHeader";
import ComfirmModel from "../../components/Modals/ComfirmModel";
import CommentsDrawer from "components/Drawer/CommentsDrawer";
import { useComments } from "app/utils/CommentProvider";
import BackConfirmModal from "../../components/BackConfirmModal";
import { useActive } from "../utils/ActiveContext";
import { useRouter } from "next/navigation";

function Layout({ children }: never) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const { isDrawerOpen, setIsDrawerOpen } = useComments();
  const { change, setChange } = useActive();
  const router = useRouter();

  // Handle browser back button and navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (change) {
        event.preventDefault();
        event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (change) {
        event.preventDefault();
        setShowBackModal(true);
        // Prevent the navigation by pushing the current state back
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push initial state to enable popstate detection
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [change]);

  // Handle navigation after modal decision
  const handleNavigateAway = () => {
    setChange(false);
    setShowBackModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    } else {
      // Default navigation - go back to dashboard or previous page
      router.push("/");
    }
  };

  const handleStayOnPage = () => {
    setShowBackModal(false);
    setPendingNavigation(null);
  };

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

      {/* Back confirmation modal for unsaved changes */}
      <BackConfirmModal
        isOpen={showBackModal}
        onClose={handleStayOnPage}
        onNavigate={handleNavigateAway}
      />
    </div>
  );
}

export default Layout;
