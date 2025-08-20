import type React from "react";
import Image from "next/image";
import { SummarySection } from "./SummarySection";
import { OutletType } from "types/types";
import { useEditing } from "app/utils/EditingContext";
import DefineAdSetPage from "../DefineAdSetPage";
import { useState, useEffect } from "react";

interface AdSetsSectionProps {
  platforms: Record<string, OutletType[]>;
}

export const AdSetsSection: React.FC<AdSetsSectionProps> = ({ platforms }) => {
  const { midcapEditing, setMidcapEditing } = useEditing();

  // Initialize view state from localStorage granularity selection
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
            return granularity;
          }
        }
      } catch (error) {}
    }

    // Default to channel if no stored selection
    return "channel";
  });

  const handleToggleChange = (newView: "channel" | "adset") => {
    setView(newView);
  };

  // Sync view state with localStorage granularity changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = () => {
        try {
          const granularityKeys = Object.keys(localStorage).filter((key) =>
            key.startsWith("granularity_")
          );

          if (granularityKeys.length > 0) {
            const mostRecentKey = granularityKeys[granularityKeys.length - 1];
            const granularity = localStorage.getItem(mostRecentKey);
            if (granularity === "adset" || granularity === "channel") {
              setView(granularity);
            }
          }
        } catch (error) {}
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

  return (
    <SummarySection title="Your Adset and Audiences" number={3}>
      <div>
        {midcapEditing.isEditing &&
        midcapEditing.step === "Your Adset and Audiences" ? (
          <DefineAdSetPage view={view} onToggleChange={handleToggleChange} />
        ) : (
          Object.keys(platforms).map((stage) => (
            <div key={stage} className="mb-6">
              <h2 className="font-semibold text-lg mb-2">{stage}</h2>
              <div className="flex flex-wrap gap-4">
                {platforms[stage]?.map(
                  (platform) =>
                    platform?.adSets?.length > 0 && (
                      <div
                        key={platform.id}
                        className="p-4 bg-gray-100 rounded-lg shadow-sm w-full max-w-[300px]">
                        <div className="flex items-center gap-2 mb-2">
                          <Image
                            src={platform.icon || "/placeholder.svg"}
                            alt={platform.outlet}
                            width={24}
                            height={24}
                          />
                          <span className="font-medium">{platform.outlet}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {platform.adSets.map((adSet, index) => (
                            <div key={index} className="mb-1 flex gap-3">
                              <span className="font-semibold">
                                {adSet.audience_type}
                              </span>
                              <span className="font-semibold">
                                {adSet.name}
                              </span>
                              <span className="font-semibold">
                                {adSet.size
                                  ? parseInt(adSet.size).toLocaleString()
                                  : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </SummarySection>
  );
};
