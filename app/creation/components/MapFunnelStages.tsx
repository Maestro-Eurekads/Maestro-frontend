import React, { useState } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import speakerWhite from "../../../public/mdi_megaphonewhite.svg";
import zoom from "../../../public/tabler_zoom-filled.svg";
import zoomWhite from "../../../public/tabler_zoom-filledwhite.svg";
import credit from "../../../public/mdi_credit-card.svg";
import creditWhite from "../../../public/mdi_credit-cardwhite.svg";
import addPlus from "../../../public/addPlus.svg";
import addPlusWhite from "../../../public/addPlusWhite.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useObjectives } from "../../utils/useObjectives";
import { useCampaigns } from "../../utils/CampaignsContext";

const MapFunnelStages = () => {
  const { selectedFunnels, setSelectedFunnels } = useObjectives();
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const selectedFunnel: any = selectedFunnels;
  const { setCampaignFormData, campaignFormData } = useCampaigns();

  const funnelStages = {
    1: "Awareness",
    2: "Consideration",
    3: "Conversion",
    4: "Loyalty",
  };

  // Toggle selection logic
  const handleSelect = (id: string) => {
    if (!isEditing) return; // Prevent selection if not editing
    console.log("jbfgjbjfgfg", campaignFormData);
    const updatedFunnels = campaignFormData?.funnel_stages?.includes(id)
      ? {
          ...campaignFormData,
          funnel_stages: campaignFormData?.funnel_stages?.filter(
            (name: string) => name !== id
          ),
        }
      : {
          ...campaignFormData,
          funnel_stages: [...campaignFormData?.funnel_stages, id],
        };
    setCampaignFormData(updatedFunnels);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className={"text-[22px]"}
          t1={
            "How many funnel stage(s) would you like to activate to achieve your objective ?"
          }
          t2={`This option is available only if you've selected any of the following main objectives:`}
          t3={"Traffic, Purchase, Lead Generation, or App Install."}
        />

        {isEditing ? null : (
          <button
            className="model_button_blue"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
        {/* Awareness */}
        <button
          className={`cursor-pointer awareness_card_one 
						${
              campaignFormData["funnel_stages"]?.includes("Awareness")
                ? "awareness_card_one_active"
                : ""
            } 
						${isEditing ? "" : "cursor-not-allowed"}`}
          onClick={() => handleSelect("Awareness")}
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

        {/* Consideration */}
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

        {/* Conversion */}
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

        {/* Loyalty */}
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
      </div>

      <div className="flex justify-end pr-6 mt-[50px]">
        {isEditing && (
          <button
            // disabled={selectedFunnel.length === 0}
            onClick={() => setIsEditing(false)}
            className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg bg-[#3175FF] text-white font-semibold text-base leading-6 disabled:opacity-50 hover:bg-[#2557D6] transition-colors"
          >
            Validate
          </button>
        )}
      </div>
    </div>
  );
};

export default MapFunnelStages;
