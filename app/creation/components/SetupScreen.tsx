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
import { useSearchParams } from "next/navigation";
import ResponsibleApproverDropdownsCampaign from "components/ResponsibleApproverDropdownsCampaign";
import InternalApproverDropdowns from "components/InternalApproverDropdowns";
import ResponsibleApproverDropdowns from "components/ResponsibleApproverDropdowns";
import { useRouter } from "next/router";
import TreeDropdown from "components/TreeDropdown";
import { useAppDispatch } from "store/useStore";
import { useSession } from "next-auth/react";
import { getCreateClient } from "features/Client/clientSlice";


interface DropdownOption {
  label: string;
  value: string;
}
export const SetupScreen = () => {
  const dispatch = useAppDispatch();
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
    selectedClient,
    setClientUsers,
    clientUsers,
    jwt
  } = useCampaigns();
  const query = useSearchParams();
  const documentId = query.get("campaignId");
  const { data: session } = useSession()
  const { client_selection } = campaignFormData || {};
  const [selectedOption, setSelectedOption] = useState("percentage");
  const [alert, setAlert] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setIsDrawerOpen, setClose } = useComments();
  const { isAgencyCreator, isAgencyApprover, isFinancialApprover, isAdmin } = useUserPrivileges();
  const [internalapproverOptions, setInternalApproverOptions] = useState<DropdownOption[]>([]);
  const [clientapprovalOptions, setClientApprovalOptions] = useState<DropdownOption[]>([]);
  const [clientOptions, setClientOptions] = useState<DropdownOption[]>([]);

  const [level1Options, setlevel1Options] = useState<DropdownOption[]>([]);
  const [level2Options, setlevel2Options] = useState<DropdownOption[]>([]);
  const [level3Options, setlevel3Options] = useState<DropdownOption[]>([]);


  useEffect(() => {
    //@ts-ignore
    dispatch(getCreateClient({ userId: !isAdmin ? session?.user?.data?.user?.id : null, jwt }));

  }, [isAdmin, session, dispatch]);






  useEffect(() => {
    if (allClients.length > 0) {
      const agency = allClients[0]?.agency;
      const agencyUserOptions = agency?.agency_users?.map((user) => ({
        value: user?.id,
        label: user?.full_name,
      })) || [];

      const clientUserOptions = agency?.client_users?.map((user) => ({
        value: user?.id,
        label: user?.full_name,
      })) || [];

      setInternalApproverOptions(agencyUserOptions);
      setClientApprovalOptions(clientUserOptions);
      setClientUsers(allClients || []);
      setCampaignFormData(prev => ({
        ...prev,
        ["client_selection"]: {
          id: allClients[0]?.documentId || '',
          value: allClients[0]?.client_name || '',
        },
      }));
    }
  }, [allClients]);

  useEffect(() => {
    if (allClients?.length > 0) {
      const data = allClients[0]
      setlevel1Options(data?.level_1);
      setlevel2Options(data?.level_2);
      setlevel3Options(data?.level_3);
    }
  }, []);


  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);


  useEffect(() => {
    const savedFormData = localStorage.getItem("campaignFormData");
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);

      const normalizeApprovers = (approvers: any[]) =>
        Array.isArray(approvers)
          ? approvers?.map((val: any) =>
            typeof val === "string"
              ? { id: "", clientId: "", value: val }
              : {
                id: val?.id ?? "",
                clientId: val?.clientId ?? "",
                value: val?.value ?? "",
              }
          )
          : [];

      setCampaignFormData({
        ...parsedData,
        internal_approver: normalizeApprovers(parsedData?.internal_approver),
        client_approver: normalizeApprovers(parsedData?.client_approver),
      });
    }
  }, [setCampaignFormData]);

  // Initialize campaignFormData if empty
  useEffect(() => {
    if (documentId === null) {
      const initialFormData = {
        client_selection: {},
        media_plan: "",
        internal_approver: [],
        client_approver: [],
        approver_id: [],
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
  }, [setCampaignFormData, isInitialized]);

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



    const options = client?.approver?.map((l) => ({
      value: l?.id,
      label: l?.username,
    })) || [];

    const filteredUsers = client?.agency?.client_users?.filter(user => user?.role == "client_approver");
    const clientOptions = filteredUsers?.map((l) => ({
      value: l?.id,
      label: l?.full_name,
    })) || [];

  }, [client_selection, allClients, setCampaignFormData]);



  useEffect(() => {
    if (campaignFormData?.budget_details_currency?.id) {
      const currency = selectCurrency?.find(
        (c) => c?.value === campaignFormData?.budget_details_currency?.id
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
      // campaignFormData?.client_selection?.value,
      campaignFormData?.media_plan,
      // campaignFormData?.internal_approver_ids,
      // campaignFormData?.client_approver_ids,
      // campaignFormData?.level_1?.id,
      // campaignFormData?.level_2?.id,
      // campaignFormData?.level_3?.id,
    ];

    const evaluatedFields = fieldsToCheck.map(getFieldValue);
    setRequiredFields(evaluatedFields);
  }, [campaignFormData, cId, setRequiredFields]);

  // const sampleData = {
  //   title: 'Toshiba',
  //   parameters: [
  //     {
  //       name: 'parasonic',
  //       subParameters: ['battery']
  //     },
  //     {
  //       name: 'Radio',
  //       subParameters: ['Wave', 'Book']
  //     }
  //   ]
  // };

  if (!campaignFormData) {
    return <div>Loading...</div>;
  }

  return (
    // <div>
    //   <PageHeaderWrapper t1={"Set up your new campaign"} />

    //   {alert && <AlertMain alert={alert} />}
    //   <div className="mt-[42px]">
    //     <Title>Client selection</Title>
    //     <div className="flex items-center flex-wrap gap-4 pb-12">

    //       <TreeDropdown
    //         data={level1Options}
    //         setCampaignFormData={setCampaignFormData} formId={"level_1"} />
    //       <TreeDropdown data={level2Options}
    //         setCampaignFormData={setCampaignFormData} formId={"level_2"} />
    //       <TreeDropdown data={level3Options}
    //         setCampaignFormData={setCampaignFormData} formId={"level_3"} />

    //     </div>
    //     <div className="pb-12 w-full ">
    //       <Title>Media Plan details</Title>
    //       <div className="w-full flex items-center flex-row flex-wrap gap-4 pb-12">
    //         <ClientSelectionInput
    //           label={"Enter media plan name"}
    //           formId="media_plan"
    //         />

    //         <InternalApproverDropdowns
    //           options={internalapproverOptions}
    //           value={{
    //             internal_approver: campaignFormData?.internal_approver_ids?.map((id) => {
    //               const match = internalapproverOptions?.find((opt) => String(opt?.value) === String(id));
    //               return match
    //                 ? {
    //                   value: match.value,
    //                   label: match.label,
    //                   id: campaignFormData?.campaign_id,
    //                   clientId: campaignFormData?.client_selection?.id,
    //                 }
    //                 : null;
    //             }).filter(Boolean) ?? [],
    //           }}

    //           onChange={(field, selected) => {
    //             setCampaignFormData((prev) => ({
    //               ...prev,
    //               [`${field}_ids`]: selected?.map((item) => item?.value),
    //               [field]: selected,
    //             }));
    //           }}
    //         />

    //         <ClientApproverDropdowns
    //           option={clientapprovalOptions}
    //           value={{
    //             client_approver:
    //               campaignFormData?.client_approver_ids?.map((id) => {
    //                 const match = clientapprovalOptions?.find((opt) => opt?.value === id);
    //                 return match
    //                   ? {
    //                     value: match.value,
    //                     label: match.label,
    //                     id: campaignFormData?.campaign_id,
    //                     clientId: campaignFormData?.client_selection?.id,
    //                   }
    //                   : null;
    //               }).filter(Boolean) ?? [],
    //           }}
    //           onChange={(field, selected) => {
    //             setCampaignFormData((prev) => ({
    //               ...prev,
    //               [`${field}_ids`]: selected?.map((item) => item?.value),
    //               [field]: selected,
    //             }));
    //           }}
    //         />

    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="container mx-auto px-4">
      <PageHeaderWrapper t1="Set up your new campaign" />

      {alert && <AlertMain alert={alert} />}

      <div className="mt-10">
        {/* Client Selection Section */}
        <div className="mb-12">
          <Title className="text-2xl font-semibold text-gray-800 mb-4">
            Business Levels
          </Title>
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {/* Level 1 */}
              </label>
              <TreeDropdown
                data={level1Options}
                setCampaignFormData={setCampaignFormData}
                formId="level_1"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {/* Level 2 */}
              </label>
              <TreeDropdown
                data={level2Options}
                setCampaignFormData={setCampaignFormData}
                formId="level_2"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {/* Level 3 */}
              </label>
              <TreeDropdown
                data={level3Options}
                setCampaignFormData={setCampaignFormData}
                formId="level_3"
              />
            </div>
          </div>
        </div>

        {/* Media Plan Details Section */}
        <div className="mb-12">
          <Title className="text-2xl font-semibold text-gray-800 mb-4">
            Media Plan Details
          </Title>
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700  ">
                Name
              </label>
              <ClientSelectionInput
                label="Enter media plan name"
                formId="media_plan"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700  ">
                Internal Approver
              </label>
              <InternalApproverDropdowns
                options={internalapproverOptions}
                value={{
                  internal_approver:
                    campaignFormData?.internal_approver_ids?.map((id) => {
                      const match = internalapproverOptions?.find(
                        (opt) => String(opt?.value) === String(id)
                      );
                      return match
                        ? {
                          value: match.value,
                          label: match.label,
                          id: campaignFormData?.campaign_id,
                          clientId: campaignFormData?.client_selection?.id,
                        }
                        : null;
                    }).filter(Boolean) ?? [],
                }}
                onChange={(field, selected) => {
                  setCampaignFormData((prev) => ({
                    ...prev,
                    [`${field}_ids`]: selected?.map((item) => item?.value),
                    [field]: selected,
                  }));
                }}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 ">
                Client Approver
              </label>
              <ClientApproverDropdowns
                option={clientapprovalOptions}
                value={{
                  client_approver:
                    campaignFormData?.client_approver_ids?.map((id) => {
                      const match = clientapprovalOptions?.find(
                        (opt) => opt?.value === id
                      );
                      return match
                        ? {
                          value: match.value,
                          label: match.label,
                          id: campaignFormData?.campaign_id,
                          clientId: campaignFormData?.client_selection?.id,
                        }
                        : null;
                    }).filter(Boolean) ?? [],
                }}
                onChange={(field, selected) => {
                  setCampaignFormData((prev) => ({
                    ...prev,
                    [`${field}_ids`]: selected?.map((item) => item?.value),
                    [field]: selected,
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};