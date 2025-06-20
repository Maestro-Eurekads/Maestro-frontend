import type React from "react";
import Button from "../common/button";
import { useCampaigns } from "app/utils/CampaignsContext";
import { removeKeysRecursively } from "utils/removeID";
import { useState } from "react";
import { useEditing } from "app/utils/EditingContext";
import { extractObjectives, getFilteredMetrics } from "../EstablishedGoals/table-view/data-processor";

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
  const [hideButtons, setHideButtons] = useState(false);
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
    // Only reset form data for specific sections to avoid overwriting changes
    if (title === "Your buying objectives") {
      setCampaignFormData({
        ...campaignFormData,
        buying_objectives: campaignData?.buying_objectives || [],
      });
    }

    setMidcapEditing({
      isEditing: false,
      step: "",
    });
    setIsEditingBuyingObjective(false);
    setHideButtons(false);
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
      let updatedCampaignFormData = { ...campaignFormData };

      // Handle specific updates based on the section title
      switch (title) {
        case "Your buying objectives":
          const obj = await extractObjectives(campaignFormData);
          const sMetrics = await getFilteredMetrics(obj)
          updatedCampaignFormData = {
            ...updatedCampaignFormData,
            table_headers: obj || {},
            selected_metrics: sMetrics||{}
          };
          break;
        case "Your funnel stages":
          updatedCampaignFormData = {
            ...updatedCampaignFormData,
            funnel_stages: updatedCampaignFormData?.funnel_stages || [],
          };
          break;
        case "Your channel mix":
          updatedCampaignFormData = {
            ...updatedCampaignFormData,
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
          };
          break;
        case "Your Adset and Audiences":
          updatedCampaignFormData = {
            ...updatedCampaignFormData,
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
          };
          break;
        case "Your format selections":
          updatedCampaignFormData = {
            ...updatedCampaignFormData,
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
          };
          break;
        default:
          break;
      }

      // Update local state to reflect changes immediately
      setCampaignFormData(updatedCampaignFormData);
      const { media_plan_details, user, ...rest } = cleanData;

      // Update the campaign with the cleaned and updated data
      await updateCampaign({
        ...rest,
        funnel_stages: updatedCampaignFormData?.funnel_stages,
        channel_mix: updatedCampaignFormData?.channel_mix,
        custom_funnels: updatedCampaignFormData?.custom_funnels,
        funnel_type: updatedCampaignFormData?.funnel_type,
        table_headers: updatedCampaignFormData?.table_headers,
      });

      // Fetch the updated campaign to ensure the UI reflects the latest data
      await getActiveCampaign();

      // Hide buttons and close the edit step
      setHideButtons(true);
      setTimeout(() => {
        closeEditStep();
      }, 200); // Short delay for UI smoothness
    } catch (error) {
      console.error("Error updating campaign:", error);
      setHideButtons(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClick = async (step: string) => {
    await handleConfirmStep();
  };

  const isEditing = midcapEditing.isEditing && midcapEditing.step === title;

  const handleEditClick = () => {
    if (!loading) {
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
      setHideButtons(false);
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
          !hideButtons && (
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
          )
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