"use client";

import React, { useEffect, useState } from "react";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ClientSelection from "../../../components/ClientSelection";
import { useCampaigns } from "../../utils/CampaignsContext";
import ClientSelectionInput from "../../../components/ClientSelectionInput";
import Checkbox from "../../../components/Checkbox";
import { removeKeysRecursively } from "utils/removeID";
import AlertMain from "components/Alert/AlertMain";
import { SVGLoader } from "components/SVGLoader";
import { useVerification, validationRules } from "app/utils/VerificationContext";

export const SetupScreen = () => {
  const {
    createCampaign,
    updateCampaign,
    campaignData,
    campaignFormData,
    allClients,
    cId,
    getActiveCampaign,
    setCampaignFormData,
  } = useCampaigns();
  const { client_selection } = campaignFormData;
  const [isEditing, setIsEditing] = useState(true);
  const [selectedOption, setSelectedOption] = useState("percentage");
  const [previousValidationState, setPreviousValidationState] = useState(null);
  const [isStepZeroValid, setIsStepZeroValid] = useState(false); //   Track form validity
  const [clientOptions, setClientOptions] = useState([]);
  const [level1Options, setlevel1Options] = useState([]);
  const [level2Options, setlevel2Options] = useState([]);
  const [level3Options, setlevel3Options] = useState([]);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const { verifyStep, verifybeforeMove, setverifybeforeMove } = useVerification();



  console.log('verifybeforeMove', verifybeforeMove)


  useEffect(() => {
    const isValid = validationRules["step0"](campaignData);
    if (isValid !== previousValidationState) {
      verifyStep("step0", isValid);
      setPreviousValidationState(isValid);
    }
  }, [campaignData, previousValidationState, verifyStep]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    const storedState = localStorage.getItem("verifybeforeMove");
    if (storedState) {
      setverifybeforeMove(JSON.parse(storedState));
    }
  }, [setverifybeforeMove]);

  useEffect(() => {
    localStorage.setItem("verifybeforeMove", JSON.stringify(verifybeforeMove));
  }, [verifybeforeMove]);

  useEffect(() => {
    let fields = [
      campaignFormData?.client_selection?.id,
      campaignFormData?.level_1?.id,
      campaignFormData?.level_2?.id,
      campaignFormData?.media_plan,
      campaignFormData?.approver,
    ];

    const isValid = fields.every((field) => field !== undefined && field !== "");
    setRequiredFields(fields);
    setIsStepZeroValid(isValid);

    setverifybeforeMove((prev: any) => {
      // Ensure `prev` is an array
      if (!Array.isArray(prev)) return [{ step0: true }];

      return prev.map((step) => ({ ...step, step0: true })); // Force step0 to be true
    });
  }, [campaignFormData]); // Trigger on campaignFormData changes










  //  Automatically reset alert after showing
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000); // Reset after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [alert]);


  useEffect(() => {
    if (allClients) {
      const options = allClients.map(
        (c: { documentId: string; client_name: string }) => ({
          id: c?.documentId,
          value: c?.client_name,
          label: c?.client_name,
        })
      );
      setClientOptions(options);
    }
  }, [allClients]);

  useEffect(() => {
    const client = allClients.find((c) => c.documentId === client_selection?.id);
    setlevel1Options(() => {
      const options = client?.level_1?.map((l) => ({
        value: l,
        label: l,
      }));
      return options;
    });
    setlevel2Options(() => {
      const options = client?.level_2?.map((l) => ({
        value: l,
        label: l,
      }));
      return options;
    });
    setlevel3Options(() => {
      const options = client?.level_3?.map((l) => ({
        value: l,
        label: l,
      }));
      return options;
    });
    setCampaignFormData((prev) => ({
      ...prev,
      approver: client?.approver,
    }));
  }, [client_selection]);



  const getInputValue = () => {
    if (selectedOption === "fix-amount") {
      return "€10";
    } else if (selectedOption === "percentage") {
      return "15%";
    }
    return "";
  };




  const selectCurrency = [
    { value: "US Dollar (USD)", label: "US Dollar (USD)" },
    { value: "Euro (EUR)", label: "Euro (EUR)" },
    { value: "British Pound (GBP)", label: "British Pound (GBP)" },
    { value: "Nigerian Naira (NGN)", label: "Nigerian Naira (NGN)" },
    { value: "Japanese Yen (JPY)", label: "Japanese Yen (JPY)" },
    { value: "Canadian Dollar (CAD)", label: "Canadian Dollar (CAD)" },
  ];

  const mediaBudgetPercentage = [
    { value: "Tooling", label: "Tooling" },
    { value: "Fix budget fee", label: "Fix budget fee" },
  ];
  const updateCampaignData = async (data: any) => {
    await updateCampaign(data);
    await getActiveCampaign(data);
  };
  const cleanData = removeKeysRecursively(campaignData, [
    "id",
    "documentId",
    "createdAt",
    "publishedAt",
    "updatedAt",
  ]);


  useEffect(() => {
    setIsStepZeroValid(prev => !prev);  // Toggle state
    setTimeout(() => setIsStepZeroValid(requiredFields.every(field => field)), 0);
  }, [campaignFormData, cId]);




  useEffect(() => {
    let fields = [];

    if (cId) {
      //   Editing an existing campaign
      fields = [
        campaignFormData?.client_selection?.value,
        campaignFormData?.media_plan,
        campaignFormData?.approver,
        campaignFormData?.budget_details_currency?.id,
        campaignFormData?.budget_details_fee_type?.id,
        campaignFormData?.budget_details_value,
      ];
    } else {
      //   Creating a new campaign
      fields = [
        campaignFormData?.client_selection?.id,
        campaignFormData?.level_1?.id,
        campaignFormData?.level_2?.id,
        campaignFormData?.media_plan,
        campaignFormData?.approver,
      ];
    }

    //   Store fields for reference
    setRequiredFields(fields);

    //   Enable button if ANY field is changed (not necessarily filled)
    setIsStepZeroValid(fields.some((field) => field !== undefined && field !== ""));
  }, [campaignFormData, cId]); //   Re-run only when form data changes




  const handleStepZero = async () => {
    setLoading(true);
    try {
      if (!isStepZeroValid) {
        setAlert({
          variant: "error",
          message: "Please complete all required fields before proceeding.",
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }

      if (cId && campaignData) {
        // Updating an existing campaign
        await updateCampaign({
          ...removeKeysRecursively(campaignData, ["id", "documentId", "createdAt", "publishedAt", "updatedAt"]),
          client: campaignFormData?.client_selection?.id,
          client_selection: {
            client: campaignFormData?.client_selection?.value,
            level_1: campaignFormData?.level_1?.id,
            level_2: campaignFormData?.level_2?.id,
            level_3: campaignFormData?.level_3?.id,
          },
          media_plan_details: {
            plan_name: campaignFormData?.media_plan,
            internal_approver: campaignFormData?.approver,
          },
          budget_details: {
            currency: campaignFormData?.budget_details_currency?.id,
            fee_type: campaignFormData?.budget_details_fee_type?.id,
            sub_fee_type: campaignFormData?.budget_details_sub_fee_type,
            value: campaignFormData?.budget_details_value,
          },
        });

        setAlert({ variant: "success", message: "Campaign updated successfully!", position: "bottom-right" });
      } else {
        // Creating a new campaign
        const res = await createCampaign();
        const url = new URL(window.location.href);
        url.searchParams.set("campaignId", `${res?.data?.data.documentId}`);
        window.history.pushState({}, "", url.toString());
        await getActiveCampaign(res?.data?.data.documentId);
        setAlert({ variant: "success", message: "Campaign created successfully!", position: "bottom-right" });
      }

      //   After validation, set step0 to false
      setverifybeforeMove((prev: any) =>
        prev.map((step: any) => (step.hasOwnProperty("step0") ? { ...step, step0: false } : step))
      );
    } catch (error) {
      console.error("Error in handleStepZero:", error);
      setAlert({ variant: "error", message: "Something went wrong. Please try again.", position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* <div className="flex w-full items-center justify-between"> */}
      <PageHeaderWrapper
        t1={"Set up your new campaign"}
        t2={"Fill in the following information to define the foundation of your media plan."}
        t3={"This information helps structure your campaign strategy and align with business goals."}
      />
      {/* {isEditing ? (
          ""
        ) : (
          <button
            className="model_button_blue"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Disable Edit" : "Edit"}
          </button>
        )} */}
      {/* </div> */}
      {/* Show Alert */}
      {alert && <AlertMain alert={alert} />}
      <div className="mt-[42px]">
        <Title>Client selection</Title>
        <div>
          <ClientSelection
            options={clientOptions}
            label={"Select Client"}
            isEditing={isEditing}
            formId="client_selection"
          />
        </div>
        <div className="flex items-center flex-wrap gap-4 pb-12">
          <ClientSelection
            options={level1Options}
            label={"Parameter Level 1"}
            isEditing={isEditing}
            formId="level_1"
          />

          <ClientSelection
            options={level2Options}
            label={"Parameter Level 2"}
            isEditing={isEditing}
            formId="level_2"
          />
          <ClientSelection
            options={level3Options}
            label={"Parameter Level 3"}
            isEditing={isEditing}
            formId="level_3"
          />
        </div>
        <div className=" pb-12">
          <Title>Media Plan details</Title>
          <div className="client_selection_flow flex flex-wrap gap-4 ">
            <ClientSelectionInput
              label={"Enter media plan name"}
              isEditing={isEditing}
              formId="media_plan"
            />
            <ClientSelectionInput
              label={"Internal Approver"}
              isEditing={isEditing}
              formId="approver"
            />
            {/* <ClientSelection
              options={internalApprover}
              label={"Select internal approver"}
              isEditing={isEditing}
            /> */}
          </div>
        </div>
        <div className="pb-1">
          <Title className="mb-1">Budget details</Title>
          <div className="flex items-center flex-wrap gap-4">
            <ClientSelection
              options={selectCurrency}
              label={"Select currency"}
              isEditing={isEditing}
              formId="budget_details_currency"
            />
            <ClientSelection
              options={mediaBudgetPercentage}
              label={"% of media budget"}
              isEditing={isEditing}
              formId="budget_details_fee_type"
            />
            {campaignFormData?.budget_details_fee_type?.id === "Tooling" && (
              <div className="flex gap-6 mt-[20px]">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="fix-amount"
                    isEditing={isEditing}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    formId="budget_details_sub_fee_type"
                  />
                  <p className="whitespace-nowrap font-medium text-[16px] text-[#061237] mb-1">
                    Fix amount
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="percentage"
                    isEditing={isEditing}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    formId="budget_details_sub_fee_type"
                  />
                  <p className="font-medium text-[16px] text-[#061237] mb-1">
                    Percentage
                  </p>
                </div>
              </div>
            )}
            {/* Display the selected value */}
            <div className="w-full">
              <ClientSelectionInput
                label={getInputValue()}
                isEditing={isEditing}
                formId="budget_details_value"
              />
            </div>
          </div>
        </div>
      </div>
      {/*   BUTTON - Enabled only when required fields are filled */}

      {verifybeforeMove?.[0]?.step0 && (
        <div className="flex justify-end pr-6 mt-[20px]">
          <button
            onClick={handleStepZero}
            className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg text-white font-semibold text-base leading-6 transition-colors bg-[#3175FF] hover:bg-[#2557D6]"
          >
            {loading ? <SVGLoader width="30px" height="30px" color="#FFF" /> : "Validate"}
          </button>
        </div>)}

    </div>
  );
};


