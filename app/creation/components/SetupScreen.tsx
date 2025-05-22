"use client";
import React, { useEffect, useState } from "react";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ClientSelection from "../../../components/ClientSelection";
import { useCampaigns } from "../../utils/CampaignsContext";
import ClientSelectionInput from "../../../components/ClientSelectionInput";
import AlertMain from "components/Alert/AlertMain";
import {
  useVerification,
  validationRules,
} from "app/utils/VerificationContext";
import { useComments } from "app/utils/CommentProvider";
import { useUserPrivileges } from "utils/userPrivileges";
import { useRouter } from "next/navigation";
import { selectCurrency } from "components/Options";
import InternalApproverSelection from "components/InternalApproverSelection";

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
    profile,
    setRequiredFields,
    setCurrencySign,
    getUserByUserType,
    user,
    requiredFields
  } = useCampaigns();
  const { client_selection } = campaignFormData || {}; // Add default empty object
  const [selectedOption, setSelectedOption] = useState("percentage");
  const [previousValidationState, setPreviousValidationState] = useState(null);

  const [approvalOptions, setApprovalOptions] = useState([]);
  const [clientapprovalOptions, setClientApprovalOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [level1Options, setlevel1Options] = useState([]);
  const [level2Options, setlevel2Options] = useState([]);
  const [level3Options, setlevel3Options] = useState([]);

  const [alert, setAlert] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setIsDrawerOpen, setClose } = useComments();
  const {
    verifyStep,
    verifybeforeMove,
    setverifybeforeMove,
  } = useVerification();
  const { isAgencyCreator, isAgencyApprover, isFinancialApprover } = useUserPrivileges();

  const router = useRouter();

  useEffect(() => {
    router.refresh(); // Forces a refresh of the current page
  }, [router]);

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);


  console.log('campaignFormData-campaignFormData', campaignFormData)
  console.log('approvalOptions-approvalOptions', approvalOptions)


  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("campaignFormData");
    if (savedFormData) {
      setCampaignFormData(JSON.parse(savedFormData));
    }
  }, []);

  // Initialize campaignFormData if empty
  useEffect(() => {
    if (!campaignFormData && !isInitialized) {
      const initialFormData = {
        client_selection: {},
        media_plan: "",
        approver: "",
        client_approver: "",
        budget_details_currency: {},
        budget_details_fee_type: {},
        budget_details_value: "",
        level_1: {},
        level_2: {},
        level_3: {},
      };
      setCampaignFormData(initialFormData);
      localStorage.setItem("campaignFormData", JSON.stringify(initialFormData));
      setIsInitialized(true);
    }
  }, [campaignFormData, setCampaignFormData, isInitialized]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {

    if (campaignFormData) {
      localStorage.setItem(
        "campaignFormData",
        JSON.stringify(campaignFormData)
      );
    }
  }, [campaignFormData]);

  useEffect(() => {
    const isValid = validationRules["step0"](campaignData);
    if (isValid !== previousValidationState) {
      verifyStep("step0", isValid, cId);
      setPreviousValidationState(isValid);
    }
  }, [campaignData, previousValidationState, verifyStep, cId]);

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
    if (isAgencyCreator || isAgencyApprover || isFinancialApprover) {
      if (profile?.clients) {
        const options = profile?.clients?.map((c) => ({
          id: c?.documentId,
          value: c?.client_name,
          label: c?.client_name,
        }))
        setClientOptions(options);
      }
    } else {
      if (allClients) {
        const options = allClients?.map((c) => ({
          id: c?.documentId,
          value: c?.client_name,
          label: c?.client_name,
        }));
        setClientOptions(options);
      }
    }
  }, [allClients, profile, isAgencyApprover]);

  useEffect(() => {
    if (!allClients || !client_selection) return;

    const client = allClients.find(
      (c) => c?.documentId === client_selection?.id
    );
    // console.log('user-clientOptions', client)
    setApprovalOptions(() => {
      const options = client?.approver?.map((l) => ({
        value: l,
        label: l,
      }));
      return options || [];
    });
    setClientApprovalOptions(() => {
      const options = client?.client_emails?.map((l) => ({
        value: l.full_name,
        label: l.full_name,
      }));
      return options || [];
    });
    setlevel1Options(() => {
      const options = client?.level_1?.map((l) => ({
        value: l,
        label: l,
      }));
      return options || [];
    });
    setlevel2Options(() => {
      const options = client?.level_2?.map((l) => ({
        value: l,
        label: l,
      }));
      return options || [];
    });
    setlevel3Options(() => {
      const options = client?.level_3?.map((l) => ({
        value: l,
        label: l,
      }));
      return options || [];
    });
    setCampaignFormData((prev) => ({
      ...prev,
      approver: client?.approver,
    }));
  }, [client_selection, allClients, setCampaignFormData]);


  console.log('approvalOptions-approvalOptions', approvalOptions)

  // Updated useEffect to handle currencySign dynamically
  useEffect(() => {
    if (campaignFormData?.budget_details_currency?.id) {
      const currency = selectCurrency.find(
        (c) => c.value === campaignFormData.budget_details_currency.id
      );
      if (currency) {
        if (
          campaignFormData?.budget_details_fee_type?.id === "Fix budget fee"
        ) {
          setCurrencySign(currency.sign); // Currency symbol for Fix budget fee
        } else if (
          campaignFormData?.budget_details_fee_type?.id === "Tooling"
        ) {
          setCurrencySign(
            selectedOption === "percentage" ? "%" : currency.sign
          ); // % for percentage, currency for fix-amount
        }
      }
    }
  }, [
    campaignFormData?.budget_details_currency?.id,
    campaignFormData?.budget_details_fee_type?.id,
    selectedOption,
  ]);





  useEffect(() => {
    let fields = [];

    if (cId) {
      fields = [
        campaignFormData?.client_selection?.value,
        campaignFormData?.media_plan,
        campaignFormData?.approver?.value,
        campaignFormData?.client_approver?.value,
        campaignFormData?.level_1?.id,
        campaignFormData?.level_2?.id,
        campaignFormData?.level_3?.id,
      ];
    } else {
      fields = [
        campaignFormData?.client_selection?.value,
        campaignFormData?.media_plan,
        campaignFormData?.approver?.value,
        campaignFormData?.client_approver?.value,
        campaignFormData?.level_1?.id,
        campaignFormData?.level_2?.id,
        campaignFormData?.level_3?.id,
      ];
    }

    setRequiredFields(fields);
  }, [campaignFormData, cId]);

  if (!campaignFormData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageHeaderWrapper t1={"Set up your new campaign"} />

      {alert && <AlertMain alert={alert} />}
      <div className="mt-[42px]">
        <Title>Client selection</Title>
        <div>
          <ClientSelection
            options={clientOptions}
            label={"Select Client"}
            formId="client_selection"
          />
        </div>
        <div className="flex items-center flex-wrap gap-4 pb-12">
          <ClientSelection
            options={level1Options?.slice(1)}
            label={
              level1Options?.length > 0
                ? level1Options[0]?.label
                : "Business Level 1"
            }
            formId="level_1"
          />
          <ClientSelection
            options={level2Options?.slice(1)}
            label={
              level2Options?.length > 0
                ? level2Options[0]?.label
                : "Business Level 2"
            }
            formId="level_2"
          />
          <ClientSelection
            options={level3Options?.slice(1)}
            label={
              level3Options?.length > 0
                ? level3Options[0]?.label
                : "Business Level 3"
            }
            formId="level_3"
          />
        </div>
        <div className="pb-12">
          <Title>Media Plan details</Title>
          <div className="client_selection_flow flex flex-wrap gap-4">
            <ClientSelectionInput
              label={"Enter media plan name"}
              formId="media_plan"
            />
            <InternalApproverSelection
              options={approvalOptions}
              label={"Internal Approver"}
              formId="approver"
            />
            <ClientSelection
              options={clientapprovalOptions}
              label={"Client Approver"}
              formId="client_approver"
            />
            {/* <ClientSelectionInput
              label={"Internal Approver"}
              formId="approver" 
            />
            <ClientSelectionInput
              label={"Client Approver"}
              formId="client_approver" 
            /> */}
          </div>
        </div>
        {/* <div className="pb-1">
          <Title className="mb-1">Budget details</Title>
          <div className="flex items-center flex-wrap gap-4">
            <ClientSelection
              options={selectCurrency}
              label={"Select currency"}
              formId="budget_details_currency" 
            />
            <ClientSelection
              options={mediaBudgetPercentage}
              label={"% of media budget"}
              formId="budget_details_fee_type" 
            />
            {campaignFormData?.budget_details_fee_type?.id === "Tooling" && (
              <div className="flex gap-6 mt-[20px]">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="fix-amount"
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
            <div className="w-full">
              <ClientSelectionInputbudget 
                label={getInputValue()}
                formId="budget_details_value"
                currencySign={currencySign}
                isSuffix={
                  campaignFormData?.budget_details_fee_type?.id === "Tooling" &&
                  selectedOption === "percentage"
                }
              />
            </div>
          </div>
        </div> */}
      </div>

      {/* {hasChanges && (
        <div className="flex justify-end pr-6 mt-[20px]">
          <button
            onClick={handleStepZero}
            className="flex items-center justify-center w-[142px] h-[52px] px-10 py-4 gap-2 rounded-lg text-white font-semibold text-base leading-6 transition-colors bg-[#3175FF] hover:bg-[#2557D6]"
          >
            {loading ? (
              <SVGLoader width="30px" height="30px" color="#FFF" />
            ) : (
              "Validate"
            )}
          </button>
        </div>
      )} */}
    </div>
  );
};
