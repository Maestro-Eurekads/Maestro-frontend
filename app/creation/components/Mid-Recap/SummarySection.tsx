import type React from "react";
import Button from "../common/button";
import { useCampaigns } from "app/utils/CampaignsContext";
import { removeKeysRecursively } from "utils/removeID";
import { useState } from "react";
import { useEditing } from "app/utils/EditingContext";

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
  } = useCampaigns();

  const closeEditStep = () => {
    setMidcapEditing({
      isEditing: false,
      step: "",
    });
  };

  const cleanData = campaignData
    ? removeKeysRecursively(campaignData, [
        "id",
        "documentId",
        "createdAt",
        "publishedAt",
        "updatedAt",
      ])
    : {};

  const handleConfirmStep = async () => {
    try {
      setLoading(true);
      await updateCampaign({
        ...cleanData,
        funnel_stages: campaignFormData?.funnel_stages,
        channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
          "id",
          "isValidated",
          "formatValidated",
          "validatedStages",
          "documentId",
        ], ["preview"]),
        custom_funnels: campaignFormData?.custom_funnels,
        funnel_type: campaignFormData?.funnel_type,
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
            onClick={() => {
              if (!loading) {
                setMidcapEditing({
                  isEditing: true,
                  step: title,
                });
              }
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
};