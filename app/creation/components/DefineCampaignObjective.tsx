import React, { useEffect, useState } from "react";
import Image from "next/image";
import Mark from "../../../public/Mark.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { campaignObjectives } from "../../../components/data";
import AlertMain from "../../../components/Alert/AlertMain";
import { useObjectives } from "../../utils/useObjectives";
import { useCampaigns } from "../../utils/CampaignsContext";
import {
  useVerification,
  validationRules,
} from "app/utils/VerificationContext";
import { removeKeysRecursively } from "utils/removeID";
import { SVGLoader } from "components/SVGLoader";
import { useSearchParams } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

const DefineCampaignObjective = () => {
  const {
    campaignData,
    campaignFormData,
    updateCampaign,
    setCampaignFormData,
    getActiveCampaign,
    cId,
  } = useCampaigns();
  const searchParams = useSearchParams();
  const { selectedObjectives, setSelectedObjectives } = useObjectives();
  const { verifyStep, validateStep, setHasChanges, hasChanges } =
    useVerification();
  const { loadingObj, objectives } = useCampaigns();
  const campaignId = searchParams.get("campaignId");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [previousValidationState, setPreviousValidationState] = useState<
    boolean | null
  >(null);
  const [tempSelectedObjective, setTempSelectedObjective] = useState<
    { id: number; title: string }[]
  >([]);

  // Load initial campaign data and validation state from localStorage
  useEffect(() => {
    if (campaignId) {
      getActiveCampaign(campaignId);
      const savedValidationState = localStorage.getItem(
        `step1_validated_${campaignId}`
      );
      if (savedValidationState) {
        setPreviousValidationState(JSON.parse(savedValidationState));
      }
    }
  }, [campaignId]);

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Validate step and persist validation state
  useEffect(() => {
    const isValid = validationRules["step1"](campaignData);
    if (isValid !== previousValidationState && campaignId) {
      verifyStep("step1", isValid, cId);
      setPreviousValidationState(isValid);
      localStorage.setItem(
        `step1_validated_${campaignId}`,
        JSON.stringify(isValid)
      );
    }
  }, [campaignData, cId, previousValidationState, verifyStep, campaignId]);

  // Load saved objective on mount
  useEffect(() => {
    if (campaignData?.campaign_objective) {
      const matchingObjective = objectives?.find(
        obj => obj?.title === campaignData?.campaign_objective
      );
      if (matchingObjective) {
        setSelectedObjectives([
          {
            id: matchingObjective?.id,
            title: matchingObjective?.title,
          },
        ]);
        setTempSelectedObjective([
          {
            id: matchingObjective.id,
            title: matchingObjective.title,
          },
        ]);
        setCampaignFormData((prev) => ({
          ...prev,
          campaign_objectives: matchingObjective?.title,
        }));
      }
    }
  }, [campaignData, setCampaignFormData, setSelectedObjectives, objectives]);

  const handleStepOne = async () => {
    if (tempSelectedObjective?.length === 0) {
      setAlert({
        variant: "error",
        message: "Please select at least one campaign objective!",
        position: "bottom-right",
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    if (!campaignFormData) {
      setAlert({
        variant: "error",
        message: "Campaign data is missing.",
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

    try {
      await updateCampaign({
        ...cleanData,
        campaign_objective: campaignFormData?.campaign_objectives,
      });
      await getActiveCampaign(cleanData);

      // Update the actual selected objectives after validation
      setSelectedObjectives(tempSelectedObjective);

      setAlert({
        variant: "success",
        message: "Campaign Objective successfully updated!",
        position: "bottom-right",
      });
      setIsEditing(false);
      setHasChanges(false);

      // Save validation state after successful update
      if (campaignId) {
        localStorage.setItem(
          `step1_validated_${campaignId}`,
          JSON.stringify(true)
        );
      }
    } catch (error) {
      const errors: any =
        error.response?.data?.error?.details?.errors ||
        error.response?.data?.error?.message ||
        error.message ||
        [];
      setAlert({ variant: "error", message: errors, position: "bottom-right" });
    }

    setLoading(false);
  };

  const handleSelect = (id: number, title: string) => {
    setTempSelectedObjective((prev) => {
      const alreadySelected = prev.some((obj) => obj.id === id);

      if (alreadySelected) {
        return []; // Deselect if already selected
      }
      return [{ id, title }]; // Store both ID & Title
    });
    setCampaignFormData((prev) => ({
      ...prev,
      campaign_objectives: title,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setHasChanges(true);
    // Initialize temp selection with current selection
    setTempSelectedObjective([...selectedObjectives]);
  };

  if (loadingObj) {
    return (
      <center>
        <FaSpinner size={40} className="animate-spin" color="#3175FF" />
      </center>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          t1={"What is the main objective of your campaign ?"}
          t2={"Please select only one objective."}
        />

        {!isEditing && (
          <button className="model_button_blue" onClick={handleEditClick}>
            Edit
          </button>
        )}
      </div>
      {alert && <AlertMain alert={alert} />}
      {/* Alert Notification */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-[80px] mt-[50px] place-items-center">
        {objectives?.map((item) => {
          const isSelected = isEditing
            ? tempSelectedObjective.some((obj) => obj.title === item.title)
            : selectedObjectives.some((obj) => obj.title === item.title);
          return (
            <div
              key={item.id}
              className={`relative p-4 rounded-lg transition-all duration-300 ${
                isSelected ? "creation_card_active shadow-lg" : "creation_card"
              } ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}
              onClick={() =>
                isEditing
                  ? handleSelect(item.id, item.title)
                  : setAlert({
                      variant: "info",
                      message: "Please click on Edit!",
                      position: "bottom-right",
                    })
              }
            >
              {isSelected && (
                <div className="absolute right-4 top-4">
                  <Image src={Mark} alt="Selected" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={24}
                  height={24}
                />
                <h6 className="text-[18px] font-semibold text-[#061237]">
                  {item.title}
                </h6>
              </div>
              <p className="text-[15px] font-medium text-[#061237] leading-[175%]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {isEditing && (
        <div className="flex justify-end pr-6 mt-[50px]">
          <button
            onClick={handleStepOne}
            className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg text-white font-semibold text-base leading-6 transition-colors bg-[#3175FF] hover:bg-[#2557D6]"
          >
            {loading ? (
              <SVGLoader width="30px" height="30px" color="#FFF" />
            ) : (
              "Validate"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DefineCampaignObjective;
