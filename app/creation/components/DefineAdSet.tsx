"use client";

import { useEffect, useState, useRef } from "react";
import DefineAdSetPage from "./DefineAdSetPage";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useEditing } from "../../utils/EditingContext";
import { useComments } from "app/utils/CommentProvider";
import SaveProgressButton from "app/utils/SaveProgressButton";
import SaveAllProgressButton from "./SaveProgres/SaveAllProgressButton";

const DefineAdSet = () => {
  const { setIsEditing } = useEditing();
  const { setIsDrawerOpen, setClose } = useComments();
  const isUpdatingView = useRef(false);
  const [view, setView] = useState<"channel" | "adset">(() => {
    // Try to get the stored granularity selection from localStorage
    if (typeof window !== "undefined") {
      try {
        // Look for any granularity data in localStorage
        const granularityKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith("granularity_")
        );

        if (granularityKeys.length > 0) {
          // Get the most recent granularity selection
          const mostRecentKey = granularityKeys[granularityKeys.length - 1];
          const granularity = localStorage.getItem(mostRecentKey);
          if (granularity === "adset" || granularity === "channel") {
            console.log("Initializing view from localStorage:", granularity);
            return granularity;
          }
        }
      } catch (error) {
        console.error("Error reading granularity from localStorage:", error);
      }
    }

    // Default to channel if no stored selection
    return "channel";
  });

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
    setIsEditing(true);
  }, [setIsDrawerOpen, setClose, setIsEditing]);

  // Sync view state with localStorage granularity changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = () => {
        // Prevent infinite loop - don't update if we're already updating
        if (isUpdatingView.current) {
          console.log(
            "Skipping storage change handler - already updating view"
          );
          return;
        }

        try {
          const granularityKeys = Object.keys(localStorage).filter((key) =>
            key.startsWith("granularity_")
          );

          if (granularityKeys.length > 0) {
            const mostRecentKey = granularityKeys[granularityKeys.length - 1];
            const granularity = localStorage.getItem(mostRecentKey);
            if (granularity === "adset" || granularity === "channel") {
              console.log(
                "Storage change detected, updating view to:",
                granularity
              );
              isUpdatingView.current = true;
              setView(granularity);
              // Reset the flag after a short delay
              setTimeout(() => {
                isUpdatingView.current = false;
              }, 100);
            }
          }
        } catch (error) {
          console.error("Error handling storage change:", error);
        }
      };

      // Listen for storage changes
      window.addEventListener("storage", handleStorageChange);

      // Also check for changes when the component becomes visible
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          handleStorageChange();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, []);

  const handleToggleChange = (newView: "channel" | "adset") => {
    console.log("DefineAdSet handleToggleChange called with:", newView);
    isUpdatingView.current = true;
    setView(newView);
    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingView.current = false;
    }, 100);
  };

  return (
    <div>
      <div className="flex flex-row justify-between ">
        <PageHeaderWrapper
          t1={"Define ad sets"}
          t2={
            "Specify the details and audiences for each ad set within your campaign."
          }
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
