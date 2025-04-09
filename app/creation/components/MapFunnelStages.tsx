"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import zoom from "../../../public/tabler_zoom-filled.svg";
import credit from "../../../public/mdi_credit-card.svg";
import addPlus from "../../../public/addPlus.svg";
import creditWhite from "../../../public/mdi_credit-cardwhite.svg";
import zoomWhite from "../../../public/tabler_zoom-filledwhite.svg";
import speakerWhite from "../../../public/mdi_megaphonewhite.svg";
import addPlusWhite from "../../../public/addPlusWhite.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useObjectives } from "../../utils/useObjectives";
import { useCampaigns } from "../../utils/CampaignsContext";
import { removeKeysRecursively } from "utils/removeID";
import {
  useVerification,
  validationRules,
} from "app/utils/VerificationContext";
import { SVGLoader } from "components/SVGLoader";
import AlertMain from "components/Alert/AlertMain";

const MapFunnelStages = () => {
  const {
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    setCampaignFormData,
  } = useCampaigns();
  const [previousValidationState, setPreviousValidationState] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const { verifyStep, setHasChanges, hasChanges, setverifybeforeMove } =
    useVerification();

  useEffect(() => {
    const isValid =
      Array.isArray(campaignData?.funnel_stages) &&
      campaignData.funnel_stages.length > 0;
    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId);
      setPreviousValidationState(isValid);
    }
  }, [campaignData, cId, verifyStep]);

  //   Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleSelect = (id: string) => {
    if (!isEditing) return;
    setHasChanges(true);

    const updatedFunnels = {
      ...campaignFormData,
      funnel_stages: campaignFormData?.funnel_stages
        ? campaignFormData.funnel_stages.includes(id)
          ? campaignFormData.funnel_stages.filter((name: string) => name !== id)
          : [...campaignFormData.funnel_stages, id]
        : [id], // If undefined, initialize with selected id
      channel_mix: campaignFormData?.channel_mix
        ? [...campaignFormData.channel_mix, { funnel_stage: id }]
        : [{ funnel_stage: id }],
    };

    setCampaignFormData(updatedFunnels);
  };

  // const handleSelect = (id: string) => {
  //   if (!isEditing) return;
  //   setHasChanges(true);

  //   const updatedFunnels = campaignFormData?.funnel_stages.includes(id)
  //     ? {
  //       ...campaignFormData,
  //       funnel_stages: campaignFormData.funnel_stages.filter(
  //         (name: string) => name !== id
  //       ),
  //       channel_mix: campaignFormData?.channel_mix?.filter(
  //         (ch) => ch?.funnel_stage !== id
  //       ),
  //     }
  //     : {
  //       ...campaignFormData,
  //       funnel_stages: [...campaignFormData.funnel_stages, id],
  //       channel_mix: [
  //         ...campaignFormData?.channel_mix,
  //         {
  //           funnel_stage: id,
  //         },
  //       ],
  //     };
  //   setCampaignFormData(updatedFunnels);
  // };

  const handleStepTwo = async () => {
    setLoading(true);
    try {
      if (
        !Array.isArray(campaignFormData?.funnel_stages) ||
        campaignFormData.funnel_stages.length === 0
      ) {
        setAlert({
          variant: "error",
          message: "Please select at least one funnel stage before proceeding.",
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }

      const cleanData = removeKeysRecursively(campaignData, [
        "id",
        "documentId",
        "createdAt",
        "publishedAt",
        "updatedAt",
      ]);
      if (cId && campaignData) {
        await updateCampaign({
          ...cleanData,
          funnel_stages: campaignFormData?.funnel_stages,
        });

        setAlert({
          variant: "success",
          message: "Funnel Stages updated successfully!",
          position: "bottom-right",
        });
      } else {
        const url = new URL(window.location.href);
        window.history.pushState({}, "", url.toString());
        setAlert({
          variant: "success",
          message: "Funnel Stages created successfully!",
          position: "bottom-right",
        });
      }
      setHasChanges(false);
      setIsEditing(false);
      setverifybeforeMove((prev: any) =>
        Array.isArray(prev)
          ? prev.map((step: any) =>
              step.hasOwnProperty("step2") ? { ...step, step2: true } : step
            )
          : prev
      );
    } catch (error) {
      const errors: any =
        error.response?.data?.error?.details?.errors ||
        error.response?.data?.error?.message ||
        error.message ||
        [];
      console.error("Error in handleStepTwo:", error);
      setAlert({ variant: "error", message: errors, position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditing = () => {
    setIsEditing(true);
    setHasChanges(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className={"text-[22px]"}
          t1={
            "How many funnel stage(s) would you like to activate to achieve your objective ?"
          }
          // t2={`This option is available only if you've selected any of the following main objectives:`}
          // t3={"Traffic, Purchase, Lead Generation, or App Install."}
        />
      </div>
      <div className="mt-[56px] grid grid-cols-3 gap-[32px]">
        <div className="bg-blue-500 rounded-md p-[14px]">
          <p className="text-center text-white font-semibold mb-[20px]">Conversion Funnel</p>
          <Image src="" alt="" className="w-full h-[100px]"/>
        </div>
        <div className="bg-blue-500 rounded-md p-[14px]">
          <p className="text-center text-white font-semibold mb-[20px]">Targeting - Retargeting</p>
          <Image src="" alt="" className="w-full h-[100px]"/>
        </div>
        <div className="bg-blue-500 rounded-md p-[14px]">
          <p className="text-center text-white font-semibold mb-[20px]">Custom</p>
          <Image src="" alt="" className="w-full h-[100px]"/>
        </div>
      </div>
      {/* <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
        <button
          className={`cursor-pointer awareness_card_one 
    ${
      campaignFormData["funnel_stages"]?.includes("Awareness")
        ? "awareness_card_one_active"
        : ""
    } 
    ${!isEditing ? "" : "cursor-not-allowed"}`}
          onClick={() => {
            if (!isEditing) {
              setAlert({
                variant: "info",
                message: "Please click on Edit!",
                position: "bottom-right",
              });
              return; // Prevent selection if not editing
            }
            handleSelect("Awareness");
          }}
          onMouseEnter={() => setHovered(1)}
          onMouseLeave={() => setHovered(null)}
          disabled={!isEditing}
        >
          {campaignFormData["funnel_stages"]?.includes("Awareness") ||
          hovered === 1 ? (
            <Image src={speakerWhite} alt="speakerWhite" />
          ) : (
            <Image src={speaker} alt="speaker" />
          )}
          <p>Awareness</p>
        </button>

        <button
          className={`cursor-pointer awareness_card_two 
						${
              campaignFormData["funnel_stages"]?.includes("Consideration")
                ? "awareness_card_two_active"
                : ""
            } 
						${isEditing ? "" : "cursor-not-allowed"}`}
          onClick={() => handleSelect("Consideration")}
          onMouseEnter={() => setHovered(2)}
          onMouseLeave={() => setHovered(null)}
          disabled={!isEditing}
        >
          {campaignFormData["funnel_stages"]?.includes("Consideration") ||
          hovered === 2 ? (
            <Image src={zoomWhite} alt="zoomWhite" />
          ) : (
            <Image src={zoom} alt="zoom" />
          )}
          <p>Consideration</p>
        </button>

        <button
          className={`cursor-pointer awareness_card_three 
						${
              campaignFormData["funnel_stages"]?.includes("Conversion")
                ? "awareness_card_three_active"
                : ""
            } 
						${isEditing ? "" : "cursor-not-allowed"}`}
          onClick={() => handleSelect("Conversion")}
          onMouseEnter={() => setHovered(3)}
          onMouseLeave={() => setHovered(null)}
          disabled={!isEditing}
        >
          {campaignFormData["funnel_stages"]?.includes("Conversion") ||
          hovered === 3 ? (
            <Image src={creditWhite} alt="creditWhite" />
          ) : (
            <Image src={credit} alt="credit" />
          )}
          <p>Conversion</p>
        </button>

        <button
          className={`cursor-pointer awareness_card_four 
						${
              campaignFormData["funnel_stages"]?.includes("Loyalty")
                ? "awareness_card_four_active"
                : ""
            } 
						${isEditing ? "" : "cursor-not-allowed"}`}
          onClick={() => handleSelect("Loyalty")}
          onMouseEnter={() => setHovered(4)}
          onMouseLeave={() => setHovered(null)}
          disabled={!isEditing}
        >
          {campaignFormData["funnel_stages"]?.includes("Loyalty") ||
          hovered === 4 ? (
            <Image src={addPlusWhite} alt="addPlusWhite" />
          ) : (
            <Image src={addPlus} alt="addPlus" />
          )}
          <p>Loyalty</p>
        </button>
      </div> */}
    </div>
  );
};

export default MapFunnelStages;
