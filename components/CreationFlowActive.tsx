"use client";
import { useState, useEffect, SetStateAction } from "react";
import { useActive } from "../app/utils/ActiveContext";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCampaigns } from "../app/utils/CampaignsContext";


const CreationFlowActive = ({ steps, close }) => {
  const { active, setActive, setSubStep } = useActive();
  const [hydrated, setHydrated] = useState(false);
  const query = useSearchParams();
  const cId = query.get("campaignId");
  const { campaignFormData } = useCampaigns();
  // Ensure component is mounted before rendering
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Validation function using the exact same logic as Bottom component
  const validateStepForNavigation = (targetStep: number) => {
    // Check if client selection is completed first
    // if (!cId) {
    //   toast.error("Please complete client selection step first");
    //   return;
    // }

    // Check if we can navigate to the target step by validating all previous steps

    // Step 1: Check if Step 0 (Setup Screen) is completed
    if (targetStep >= 1) {
      if (!campaignFormData?.media_plan) {
        toast.error("Media Plan name is required");
        return;
      }
      if (!campaignFormData?.budget_details_currency?.id) {
        toast.error("Currency is required");
        return;
      }
    }

    // Step 3: Check if Step 2 (Channel Mix) is completed
    if (targetStep >= 3) {
      const CHANNEL_KEYS = [
        'social_media', 'display_networks', 'search_engines', 'streaming', 'ooh',
        'broadcast', 'messaging', 'print', 'e_commerce', 'in_game', 'mobile'
      ];
      const hasSelectedChannel =
        Array.isArray(campaignFormData?.channel_mix) &&
        campaignFormData.channel_mix.some((mix) =>
          CHANNEL_KEYS.some((key) => Array.isArray(mix?.[key]) && mix[key].length > 0)
        );
      if (!hasSelectedChannel) {
        toast.error("Please select at least one channel mix before proceeding!");
        return;
      }
    }

    // Step 8: Check if Step 7 (Campaign Schedule) is completed
    if (targetStep >= 8) {
      const isValidDate = (d) => typeof d === 'string' && d.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(d);
      if (!isValidDate(campaignFormData?.campaign_timeline_start_date) || !isValidDate(campaignFormData?.campaign_timeline_end_date)) {
        toast.error("Please select both start and end dates before proceeding!");
        return;
      }
    }

    // Step 9: Check if Step 8 (Budget) is completed
    if (targetStep >= 9) {
      const amount = campaignFormData?.campaign_budget?.amount;
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        toast.error("Please enter a valid budget amount before proceeding!");
        return;
      }
    }

    // If all validation passes, navigate to the target step
    if (targetStep === 7 || targetStep === 8) {
      // Handle special cases for steps 7 and 8
    }
    setSubStep(0);
    setActive(targetStep);
  };

  // Prevent hydration errors by returning null until mounted
  if (!hydrated) return null;

  const handleStepClick = (stepNumber: number) => {
    validateStepForNavigation(stepNumber);
  };



  return (
    <div id={close ? "Sidenavbar_active" : "Sidenavbar"}>
      <div id="SideBar__container">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = active === stepNumber;
          const isCompleted = active > stepNumber;
          const stepColor = isActive
            ? "bg-blue-500 text-white" // Active step (blue)
            : isCompleted
              ? "bg-green-500 text-white" // Completed step (green)
              : "bg-gray-300 text-gray-700"; // Inactive step (gray)

          const stepColors = isActive
            ? "SideBar_state_text_active"
            : isCompleted
              ? "SideBar_state_text_done"
              : "SideBar_state_text";

          return (
            <div
              className="cursor-pointer"
              key={stepNumber}
              onClick={() =>
                !cId
                  ? toast.error("Please complete client selection step first")
                  : handleStepClick(stepNumber)
              } // Handle step click
              style={{
                display: stepNumber === 6 ? "none" : "flex"
              }}
            >

              <div className="SideBar__state__container">
                {/* Step Icon */}
                <div className={`${step.sidecircle} ${stepColor}`}>
                  {step.img}
                </div>

                {/* Line Connector (Not for last item) */}
                {stepNumber !== steps.length && (
                  <div
                    className={`${step.vl} ${active > stepNumber + 1
                      ? `${step.vl_done}`
                      : active === stepNumber + 1
                        ? `${step.vl_active}`
                        : ""
                      }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreationFlowActive;
