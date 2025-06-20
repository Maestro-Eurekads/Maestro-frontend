"use client";

import React, { useEffect, useState } from "react";
import MultiDatePicker from "../../../components/MultiDatePicker";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import { removeKeysRecursively } from "../../../utils/removeID";
import { useSelectedDates } from "../../utils/SelectedDatesContext";
import dayjs from "dayjs";
import AlertMain from "../../../components/Alert/AlertMain";
import { SVGLoader } from "../../../components/SVGLoader";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { useVerification } from "app/utils/VerificationContext";
import { useComments } from "app/utils/CommentProvider";

const PlanCampaignSchedule: React.FC = () => {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const [isEditing, setIsEditing] = useState(false);
  const { setIsDrawerOpen, setClose } = useComments();
  const [loading, setLoading] = useState(false);
  const { selectedDates } = useSelectedDates();
  const [alert, setAlert] = useState<{
    variant: string;
    message: string;
    position: string;
  } | null>(null);
  const currentYear = new Date().getFullYear();
  const { updateCampaign, campaignData, getActiveCampaign } = useCampaigns();
  const { setHasChanges, hasChanges } = useVerification();
  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  useEffect(() => {
    if (campaignId) {
      getActiveCampaign(campaignId);
    }
  }, [campaignId]);

  //   Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleValidate = async (selectedDates: any) => {
    if (!selectedDates?.from || !selectedDates?.to) {
      setAlert({
        variant: "error",
        message: "Please select a valid start and end date.",
        position: "bottom-right",
      });
      return;
    }

    setLoading(true);

    const campaign_timeline_start_date = dayjs(
      new Date(
        currentYear,
        selectedDates?.from?.month - 1,
        selectedDates.from.day
      )
    ).format("YYYY-MM-DD");

    const campaign_timeline_end_date = dayjs(
      new Date(currentYear, selectedDates?.to?.month - 1, selectedDates.to.day)
    ).format("YYYY-MM-DD");

    if (!campaignData) {
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
      "_aggregated",
    ]);

    try {
      await updateCampaign({
        ...cleanData,
        campaign_timeline_start_date,
        campaign_timeline_end_date,
      });
      await getActiveCampaign(cleanData);
      setHasChanges(false);
      setAlert({
        variant: "success",
        message: "Date successfully updated!",
        position: "bottom-right",
      });
    } catch (error) {
      setAlert({
        variant: "error",
        message: "Failed to update date.",
        position: "bottom-right",
      });
    }

    setLoading(false);
    setIsEditing(false);
  };

  return (
    <div className="creation_continer">
      <div className="flex justify-between">
        <PageHeaderWrapper
          t1="Setup the timeline of your campaign?"
          // t2="Choose your campaign start and end dates, then arrange each funnel phase within the timeline."
          span={1}
          t4="Choose your start and end date for the campaign"
        />
        {/* {!isEditing && (
					<button className="model_button_blue" onClick={() => { setIsEditing(true); setHasChanges(true) }}>
						Edit
					</button>
				)} */}
      </div>
      {/* @ts-ignore      */}
      {alert && <AlertMain alert={alert} />}

      <MultiDatePicker isEditing={isEditing} campaignData={campaignData} />

      {/* <div className="flex justify-end pr-[24px] mt-4">
				{isEditing && (
					<button
						onClick={() => handleValidate(selectedDates)}
						className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#3175FF] hover:bg-[#2563eb]"}`}
						disabled={loading}
					>
						{loading ? <SVGLoader width={"24px"} height={"24px"} color={"#fff"} /> : "Validate"}
					</button>
				)}
			</div> */}
    </div>
  );
};

export default PlanCampaignSchedule;
