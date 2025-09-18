"use client";
import React, { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import Header from "../../components/Header";
import TableModel from "./TableModel";
import Overview from "./components/Overview";
import Dashboard from "./components/Dashboard";
import FinanceView from "./components/FinanceView";
import AddFinanceModal from "./components/AddFinanceModal";
import ViewClientModal from "./components/ViewClientModal";
import { useComments } from "app/utils/CommentProvider";

const Homepage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const [active, setActive] = useState("Overview");
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [userRole, setUserRole] = useState("guest"); // Assuming a default role
  const { clearCommentStates } = useComments();

  // Clear channel state only when starting a new plan, not when continuing existing ones
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Check if user is currently working on a saved campaign
        const hasActiveCampaign =
          sessionStorage.getItem("hasActiveCampaign") === "true";
        const hasCampaignData = sessionStorage.getItem("campaignFormData");

        // Only clear if there's no active campaign and no campaign data
        if (!hasActiveCampaign && !hasCampaignData) {
          // Clear all channel state keys from sessionStorage
          const keysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith("channelLevelAudienceState_")) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => sessionStorage.removeItem(key));

          // Clear all channel state keys from localStorage
          const localStorageKeysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              key.startsWith("persistent_channelLevelAudienceState_")
            ) {
              localStorageKeysToRemove.push(key);
            }
          }
          localStorageKeysToRemove.forEach((key) =>
            localStorage.removeItem(key)
          );

          // Clear global state
          if ((window as any).channelLevelAudienceState) {
            Object.keys((window as any).channelLevelAudienceState).forEach(
              (stageName) => {
                delete (window as any).channelLevelAudienceState[stageName];
              }
            );
          }

          // Clear the new plan session ID to ensure complete isolation
          if ((window as any).__newPlanSessionId) {
            delete (window as any).__newPlanSessionId;
          }

          // Also clear comment states when starting a fresh plan
          clearCommentStates();

          console.log(
            "Cleared channel state and comment states on homepage load - starting fresh plan"
          );
        } else {
          console.log(
            "Preserved channel state - user has active campaign or campaign data"
          );
        }
      } catch (error) {
        console.error("Error managing channel state on homepage load:", error);
      }
    }
  }, []);

  return (
    <>
      <div id="page-wrapper">
        <Header setIsOpen={setIsOpen} setIsView={setIsView} />
        <main className="!px-0">
          <div>
            <div className="px-[72px]">
              <ToggleSwitch active={active} setActive={setActive} />
            </div>
            {active === "Finance" ? (
              <FinanceView setOpenModal={setOpenModal} userRole={userRole} />
            ) : active === "Dashboard" ? (
              <Dashboard />
            ) : (
              <Overview />
            )}
          </div>
        </main>
        <TableModel isOpen={isOpen} setIsOpen={setIsOpen} />
        <ViewClientModal isView={isView} setIsView={setIsView} />
        <AddFinanceModal
          isOpen={openModal}
          setIsOpen={setOpenModal}
          setSelectedRow={setSelectedRow}
          selectedRow={selectedRow}
          userRole={userRole}
        />
      </div>
    </>
  );
};

export default Homepage;
