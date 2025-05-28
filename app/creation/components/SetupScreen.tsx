"use client";
import React, { useEffect, useState } from "react";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import ClientSelection from "../../../components/ClientSelection";
import { useCampaigns } from "../../utils/CampaignsContext";
import ClientSelectionInput from "../../../components/ClientSelectionInput";
import AlertMain from "components/Alert/AlertMain";
import { useComments } from "app/utils/CommentProvider";
import { useUserPrivileges } from "utils/userPrivileges";
import { selectCurrency } from "components/Options";
import ClientApproverDropdowns from "components/ClientApproverDropdowns";


interface DropdownOption {
  label: string;
  value: string;
}
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
    requiredFields,
  } = useCampaigns();
  const { client_selection } = campaignFormData || {};
  const [selectedOption, setSelectedOption] = useState("percentage");
  const [alert, setAlert] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setIsDrawerOpen, setClose } = useComments();
  const { isAgencyCreator, isAgencyApprover, isFinancialApprover } = useUserPrivileges();



  const [approvalOptions, setApprovalOptions] = useState<DropdownOption[]>([]);
  const [clientapprovalOptions, setClientApprovalOptions] = useState<DropdownOption[]>([]);
  const [clientOptions, setClientOptions] = useState<DropdownOption[]>([]);
  const [level1Options, setlevel1Options] = useState<DropdownOption[]>([]);
  const [level2Options, setlevel2Options] = useState<DropdownOption[]>([]);
  const [level3Options, setlevel3Options] = useState<DropdownOption[]>([]);

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  // Load saved form data from localStorage on mount
  // useEffect(() => {
  //   const savedFormData = localStorage.getItem("campaignFormData");
  //   if (savedFormData) {
  //     const parsedData = JSON.parse(savedFormData);
  //     setCampaignFormData({
  //       ...parsedData,
  //       internal_approver: Array.isArray(parsedData?.internal_approver)
  //         ? parsedData?.internal_approver?.filter((v: string | null) => v != null)
  //         : [],
  //       client_approver: Array.isArray(parsedData?.client_approver)
  //         ? parsedData?.client_approver?.filter((v: string | null) => v != null)
  //         : [],
  //     });
  //   }
  // }, [setCampaignFormData]);

  // Initialize campaignFormData if empty
  useEffect(() => {
    if (!campaignFormData && !isInitialized) {
      const initialFormData = {
        client_selection: {},
        media_plan: "",
        internal_approver: [],
        client_approver: [],
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

  // Save form data to localStorage whenever it changes, cleaning null values
  // useEffect(() => {
  //   if (campaignFormData) {
  //     const cleanedData = {
  //       ...campaignFormData,
  //       internal_approver: Array.isArray(campaignFormData.internal_approver)
  //         ? campaignFormData?.internal_approver?.filter((v: string | null) => v != null)
  //         : [],
  //       client_approver: Array.isArray(campaignFormData.client_approver)
  //         ? campaignFormData.client_approver.filter((v: string | null) => v != null)
  //         : [],
  //     };
  //     console.log("Saving to localStorage:", cleanedData);
  //     localStorage.setItem("campaignFormData", JSON.stringify(cleanedData));
  //   }
  // }, [campaignFormData]);



  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);





  useEffect(() => {
    if (isAgencyCreator || isAgencyApprover || isFinancialApprover) {
      if (profile?.clients) {
        const options = profile?.clients?.map((c) => ({
          id: c?.documentId,
          value: c?.client_name,
          label: c?.client_name,
        }));
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
  }, [allClients, profile, isAgencyCreator, isAgencyApprover, isFinancialApprover]);

  useEffect(() => {
    if (!allClients || !client_selection) return;

    const client = allClients?.find((c) => c?.documentId === client_selection?.id);

    setApprovalOptions(() => {
      const options = client?.approver?.map((l) => ({
        value: l,
        label: l,
      }));
      return options?.filter((opt) => opt?.value != null && opt?.label != null) || [];
    });

    setClientApprovalOptions(() => {
      const options = client?.client_emails?.map((l) => ({
        value: l?.full_name,
        label: l?.full_name,
      }));
      return options?.filter((opt) => opt?.value != null && opt?.label != null) || [];
    });

    setlevel1Options(() => {
      const options = client?.level_1?.map((l) => ({
        value: l,
        label: l,
      }));
      return options?.filter((opt) => opt?.value != null && opt?.label != null) || [];
    });

    setlevel2Options(() => {
      const options = client?.level_2?.map((l) => ({
        value: l,
        label: l,
      }));
      return options?.filter((opt) => opt?.value != null && opt?.label != null) || [];
    });

    setlevel3Options(() => {
      const options = client?.level_3?.map((l) => ({
        value: l,
        label: l,
      }));
      return options?.filter((opt) => opt?.value != null && opt?.label != null) || [];
    });

    setCampaignFormData((prev) => ({
      ...prev,
      internal_approver: Array.isArray(prev.internal_approver) && prev.internal_approver.length > 0
        ? prev.internal_approver.filter((v: string | null) => v != null)
        : (client?.internal_approver?.filter((v: string | null) => v != null) || []),
      client_approver: Array.isArray(prev.client_approver) && prev.client_approver.length > 0
        ? prev.client_approver.filter((v: string | null) => v != null)
        : (client?.client_emails?.map((e) => e?.full_name).filter((v: string | null) => v != null) || []),
    }));
  }, [client_selection, allClients, setCampaignFormData]);

  useEffect(() => {
    if (campaignFormData?.budget_details_currency?.id) {
      const currency = selectCurrency.find(
        (c) => c.value === campaignFormData.budget_details_currency.id
      );
      if (currency) {
        if (campaignFormData?.budget_details_fee_type?.id === "Fix budget fee") {
          setCurrencySign(currency.sign);
        } else if (campaignFormData?.budget_details_fee_type?.id === "Tooling") {
          setCurrencySign(selectedOption === "percentage" ? "%" : currency.sign);
        }
      }
    }
  }, [
    campaignFormData?.budget_details_currency?.id,
    campaignFormData?.budget_details_fee_type?.id,
    selectedOption,
    setCurrencySign,
  ]);

  useEffect(() => {
    const getFieldValue = (field) => {
      if (Array.isArray(field)) {
        return field?.length > 0;
      }
      if (typeof field === "object" && field !== null) {
        return Object.keys(field)?.length > 0;
      }
      return Boolean(field);
    };

    const fieldsToCheck = [
      campaignFormData?.client_selection?.value,
      campaignFormData?.media_plan,
      campaignFormData?.internal_approver,
      campaignFormData?.client_approver,
      campaignFormData?.level_1?.id,
      campaignFormData?.level_2?.id,
      campaignFormData?.level_3?.id,
    ];

    const evaluatedFields = fieldsToCheck.map(getFieldValue);
    setRequiredFields(evaluatedFields);
  }, [campaignFormData, cId, setRequiredFields]);

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
        <div className="pb-12 w-full ">
          <Title>Media Plan details</Title>
          <div className="w-full flex items-center flex-row flex-wrap gap-4 pb-12">
            <ClientSelectionInput
              label={"Enter media plan name"}
              formId="media_plan"
            />
            <ClientApproverDropdowns
              options={approvalOptions}
              option={clientapprovalOptions}
              value={{
                internal_approver: campaignFormData?.internal_approver?.map((val) => ({
                  value: val,
                  label: val,
                })),
                client_approver: campaignFormData?.client_approver?.map((val) => ({
                  value: val,
                  label: val,
                })),
              }}
              onChange={(field, selected) => {
                setCampaignFormData((prev) => ({
                  ...prev,
                  [field]: selected?.map((opt) => opt?.value)?.filter((v: string | null) => v != null),
                }));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};