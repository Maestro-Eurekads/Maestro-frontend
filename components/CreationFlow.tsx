"use client";
import { useState, useEffect } from "react";
import { useActive } from "../app/utils/ActiveContext";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCampaigns } from "../app/utils/CampaignsContext";


const CreationFlow = ({ steps }) => {
  const { active, setActive, setSubStep } = useActive();
  const [hydrated, setHydrated] = useState(false);
  const query = useSearchParams();
  const cId = query.get("campaignId");
  const { campaignFormData } = useCampaigns();


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

  if (!hydrated) return null;

  return (
    <div id="Sidenavbar">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = active === stepNumber;
        const isCompleted = active > stepNumber;
        const stepColor = isActive
          ? "bg-blue-500 text-white"
          : isCompleted
            ? "bg-green-500 text-white"
            : "bg-gray-300 text-gray-700";
        const stepColors = isActive
          ? "SideBar_state_text_active"
          : isCompleted
            ? "SideBar_state_text_done"
            : "SideBar_state_text";

        return (
          <div
            className=" cursor-pointer"
            key={stepNumber}
            onClick={() => validateStepForNavigation(stepNumber)}
            // onClick={() => {
            //   if (!cId) {
            //     toast.error("Please complete client selection step first");
            //   } else {
            //     // Validate if we can navigate to the target step
            //     if (validateStepForNavigation(stepNumber)) {
            //       if (stepNumber === 7 || stepNumber === 8) {
            //       }
            //       setSubStep(0)
            //       setActive(stepNumber);
            //     }
            //   }
            // }}
            // onClick={() => {
            //   if (!cId) {
            //     toast.error("Please complete client selection step first");
            //   } else {
            //     // Validate if we can navigate to the target step
            //     if (validateStepForNavigation(stepNumber)) {
            //       if (stepNumber === 7 || stepNumber === 8) {
            //       }
            //       setSubStep(0)
            //       setActive(stepNumber);
            //     }
            //   }
            // }}
            style={{
              display: stepNumber === 6 ? "none" : "flex"
            }}
          >

            <div className="SideBar__state__container">
              <div className={`${step?.sidecircle} ${stepColor}`}>
                {step?.img}
              </div>
              {stepNumber !== steps?.length && (
                <div
                  className={`${step.vl} ${active > stepNumber + 1
                    ? `${step?.vl_done}`
                    : active === stepNumber + 1
                      ? `${step?.vl_active}`
                      : ""
                    }`}
                />
              )}
            </div>
            <div className={`${step?.state_text}`}>
              <span className={`mb-2 SideBar_state_text ${stepColors}`}>
                {step?.title}
              </span>
              {isCompleted && step?.objective && (
                <div
                  className="objective_step_text whitespace-nowrap overflow-hidden text-ellipsis  "
                  title={step?.objective?.join(" · ")}
                >
                  {step?.objective?.length > 0
                    ? step.objective.slice(0, 3).join(" · ") +
                    (step.objective.length > 3 ? " ..." : "")
                    : ""}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CreationFlow;
