import type React from "react";
import Button from "../common/button";
import { useCampaigns } from "app/utils/CampaignsContext";
import { removeKeysRecursively } from "utils/removeID";
import { useState } from "react";
import { useEditing } from "app/utils/EditingContext";
import { extractObjectives } from "../EstablishedGoals/table-view/data-processor";

interface SummarySectionProps {
  title: string;
  number: number;
  children: React.ReactNode;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  number,
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const { midcapEditing, setMidcapEditing } = useEditing();
  const {
    updateCampaign,
    getActiveCampaign,
    campaignData,
    campaignFormData,
    setCampaignFormData,
    setIsEditingBuyingObjective,
  } = useCampaigns();

  const closeEditStep = () => {
    // Reset form data to original campaign data when canceling
    if (title === "Your buying objectives") {
      setCampaignFormData({
        ...campaignFormData,
        buying_objectives: campaignData?.buying_objectives || [],
      });
    } else {
      // Reset other relevant form data based on the step
      setCampaignFormData({
        ...campaignFormData,
        funnel_stages: campaignData?.funnel_stages,
        channel_mix: campaignData?.channel_mix,
        custom_funnels: campaignData?.custom_funnels,
        funnel_type: campaignData?.funnel_type,
        table_headers: campaignData?.table_headers,
      });
    }
    
    setMidcapEditing({
      isEditing: false,
      step: "",
    });
    setIsEditingBuyingObjective(false);
  };

  const cleanData = campaignData
    ? removeKeysRecursively(campaignData, [
        "id",
        "documentId",
        "createdAt",
        "publishedAt",
        "updatedAt",
        "_aggregated",
      ])
    : {};

  const handleConfirmStep = async () => {
    try {
      setLoading(true);
      let updatedCampaignFormData = campaignFormData;

      const obj = extractObjectives(campaignFormData);
      // console.log("🚀 ~ handleStepFour ~ obj:", obj);
      updatedCampaignFormData = {
        ...campaignFormData,
        table_headers: obj || {},
      };
      setCampaignFormData(updatedCampaignFormData);
       await updateCampaign({
        ...cleanData,
        funnel_stages: updatedCampaignFormData?.funnel_stages,
        channel_mix: removeKeysRecursively(
          updatedCampaignFormData?.channel_mix,
          [
            "id",
            "isValidated",
            "formatValidated",
            "validatedStages",
            "documentId",
            "_aggregated",
          ],
          ["preview"]
        ),
        custom_funnels: updatedCampaignFormData?.custom_funnels,
        funnel_type: updatedCampaignFormData?.funnel_type,
        table_headers: updatedCampaignFormData?.table_headers,
      });
      await getActiveCampaign();
      closeEditStep();
    } catch (error) {
      console.error("Error updating campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClick = async (step: string) => {
    switch (step) {
      case "Your funnel stages":
      case "Your channel mix":
      case "Your Adset and Audiences":
      case "Your format selections":
      case "Your buying objectives":
        await handleConfirmStep();
        break;
      default:
        break;
    }
  };

  const isEditing = midcapEditing.isEditing && midcapEditing.step === title;

  const handleEditClick = () => {
    if (!loading) {
      // Preserve the current campaign data before editing
      if (title === "Your buying objectives") {
        setCampaignFormData({
          ...campaignFormData,
          buying_objectives: campaignData?.buying_objectives || [],
        });
        setIsEditingBuyingObjective(true);
      }
      setMidcapEditing({
        isEditing: true,
        step: title,
      });
    }
  };

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
            <span className="text-white font-bold">{number}</span>
          </div>
          <h1 className="text-blue-500 font-semibold text-base">{title}</h1>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-[15px]">
            <Button
              text={loading ? "Loading..." : "Confirm Changes"}
              variant="primary"
              className="!w-[180px] !h-[40px] !rounded-[8px] !hover:ease-in-out"
              onClick={() => !loading && handleConfirmClick(title)}
              loading={loading}
              disabled={loading}
            />
            <Button
              text="Cancel"
              variant="secondary"
              className="!w-[180px] !h-[40px] !rounded-[8px] !hover:ease-in-out"
              onClick={closeEditStep}
            />
          </div>
        ) : (
          <Button
            text="Edit"
            variant="primary"
            className="!w-[85px] !h-[40px]"
            onClick={handleEditClick}
          />
        )}
      </div>
      {children}
    </div>
  );
};