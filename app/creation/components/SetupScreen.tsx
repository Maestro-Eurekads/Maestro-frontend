"use client";
import React, { useEffect, useRef, useState } from "react";
import { Title } from "../../../components/Title";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import ClientSelectionInput from "../../../components/ClientSelectionInput";
import AlertMain from "components/Alert/AlertMain";
import { useComments } from "app/utils/CommentProvider";
import { useUserPrivileges } from "utils/userPrivileges";
import { selectCountry, selectCurrency } from "components/Options";
import ClientApproverDropdowns from "components/ClientApproverDropdowns";
import { useRouter, useSearchParams } from "next/navigation";
import InternalApproverDropdowns from "components/InternalApproverDropdowns";
import TreeDropdown from "components/TreeDropdown";
import { useAppDispatch } from "store/useStore";
import { useSession } from "next-auth/react";
import { getCreateClient } from "features/Client/clientSlice";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import ClientSelectionInputbudget from "components/ClientSelectionInputbudget";
import ClientSelection from "components/ClientSelection";


interface DropdownOption {
  label: string;
  value: string;
}

interface SelectedItem {
  value: string;
  label: string;
  id?: string;
  clientId?: string;
}
export const SetupScreen = () => {
  const router: any = useRouter();


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
    jwt,
    FC,
    setFC,
    selectedId,
    selectedOption,
    setSelectedOption

  } = useCampaigns();
  const query = useSearchParams();
  const documentId = query.get("campaignId");
  const lastFetchedClientId = useRef(null);
  const { data: session } = useSession()
  const { client_selection } = campaignFormData || {};

  const [alert, setAlert] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState({ agencyAccess: [], clientAccess: [] });
  const { setIsDrawerOpen, setClose } = useComments();
  const { isAdmin, userID } = useUserPrivileges();
  const [internalapproverOptions, setInternalApproverOptions] = useState<DropdownOption[]>([]);
  const [clientapprovalOptions, setClientApprovalOptions] = useState<DropdownOption[]>([]);
  const [level1Options, setlevel1Options] = useState<DropdownOption[]>([]);
  const [clientApprovers, setClientApprovers] = useState<SelectedItem[]>([]);
  const [internalApprovers, setInternalApprovers] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(null);



  useEffect(() => {
    const cached = localStorage.getItem("filteredClient");
    const storedClientId = localStorage.getItem(userID);
    setClientId(storedClientId)
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFC(parsed);
      } catch (err) {
        console.error("Failed to parse FC from localStorage", err);
      }
    }
  }, []);





  const fetchUsers = async () => {
    if (!clientId) return;

    const baseUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/users`;
    const filterParams = [`filters[clients][id][$eq]=${encodeURIComponent(clientId)}`];
    const populateParams = ['populate=*'];

    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}?${[...filterParams, ...populateParams].join('&')}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const agencyAccess = data?.filter((user) =>
        ['agency_creator', 'agency_approver', 'financial_approver'].includes(user.user_type)
      );
      const clientAccess = data?.filter((user) =>
        ['client', 'client_approver'].includes(user.user_type)
      );

      setUsers({ agencyAccess, clientAccess });
    } catch (error) {
      toast.error(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    if (clientId && lastFetchedClientId.current !== clientId) {
      lastFetchedClientId.current = clientId;
      fetchUsers();
    }
  }, [clientId]);






  useEffect(() => {
    //@ts-ignore
    dispatch(getCreateClient({ userId: !isAdmin ? session?.user?.data?.user?.id : null, jwt }));
  }, [isAdmin, session, dispatch]);


  useEffect(() => {
    if (FC) {
      const agencyUserOptions =
        users?.agencyAccess
          ?.filter(
            (user) =>
              user?.user_type === "agency_approver" || user?.user_type === "financial_approver"
          )
          .map((user) => ({
            value: user?.id,
            label: user?.agency_user?.full_name,
          })) || [];

      const clientUserOptions =
        users?.clientAccess
          ?.filter((user) => user?.user_type === "client_approver")
          .map((user) => ({
            value: user?.id,
            label: user?.client_user?.full_name,
          })) || [];




      setInternalApproverOptions(agencyUserOptions);
      setClientApprovalOptions(clientUserOptions);
      setClientUsers(FC || []);
      setCampaignFormData(prev => ({
        ...prev,
        campaign_budget: {
          currency: campaignFormData?.budget_details_currency?.id,
        },
        ["client_selection"]: {
          id: selectedClient || FC?.id,
          value: FC?.client_name || '',
        },
      }));
    }
  }, [FC, selectedClient, users]);

  useEffect(() => {
    if (FC) {
      const data = FC
      setlevel1Options(data?.level_1);
    }
  }, [FC]);

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


  useEffect(() => {
    if (documentId === null && !isInitialized) {
      const initialFormData = {
        client_selection: {
          id: selectedClient || FC?.id,
          value: FC?.client_name || '',
        },
        media_plan: "",
        internal_approver: [],
        client_approver: [],
        approver_id: [],
        budget_details_currency: {},
        country_details: {},
        budget_details_fee_type: {},
        budget_details_value: "",
        level_1: {},
      };

      setCampaignFormData(initialFormData);
      localStorage.setItem("campaignFormData", JSON.stringify(initialFormData));
      setIsInitialized(true);
    } else if (documentId === null && isInitialized) {
      // Only update client_selection if already initialized
      setCampaignFormData(prev => {
        const updated = {
          ...prev,
          client_selection: {
            id: selectedClient || FC?.id,
            value: FC?.client_name || '',
          },
        };
        localStorage.setItem("campaignFormData", JSON.stringify(updated));
        return updated;
      });
    }
  }, [documentId, isInitialized, selectedClient, FC, setCampaignFormData]);


  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);




  useEffect(() => {
    if (campaignFormData?.campaign_budget?.currency) {
      const currency = selectCurrency?.find(
        (c) => c?.value === campaignFormData?.campaign_budget?.currency
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
    campaignFormData?.campaign_budget?.currency,
    campaignFormData?.budget_details_fee_type?.id,
    selectedOption,
    setCurrencySign,
  ]);

  // useEffect(() => {
  //   const currencyData = campaignFormData?.budget_details_currency;

  //   if (currencyData?.value) {
  //     setSelectedOption({
  //       label: currencyData.value,
  //       value: currencyData.value,
  //     });
  //   }
  // }, [campaignFormData?.budget_details_currency]);





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
    ];

    const evaluatedFields = fieldsToCheck.map(getFieldValue);
    setRequiredFields(evaluatedFields);
  }, [campaignFormData, cId, setRequiredFields]);



  useEffect(() => {
    const approverIds = campaignFormData?.internal_approver_ids || [];
    const campaignId = campaignFormData?.campaign_id;
    const clientId = campaignFormData?.client_selection?.id;

    if (approverIds.length && internalapproverOptions.length) {
      const mapped = approverIds
        .map((id) => {
          const found = internalapproverOptions.find((opt) => String(opt.value) === String(id));
          if (!found) return null;
          return {
            value: found.value,
            label: found.label,
            id: campaignId,
            clientId,
          };
        })
        .filter(Boolean) as SelectedItem[];

      setInternalApprovers(mapped);
    }
  }, [
    campaignFormData?.internal_approver_ids,
    internalapproverOptions,
    campaignFormData?.campaign_id,
    campaignFormData?.client_selection?.id,
  ]);


  useEffect(() => {
    const { client_approver_ids = [], campaign_id, client_selection } = campaignFormData || {};
    const clientId = client_selection?.id;

    if (client_approver_ids.length && clientapprovalOptions.length && campaign_id && clientId) {
      const mapped = client_approver_ids
        .map((id) => {
          const match = clientapprovalOptions.find((opt) => String(opt.value) === String(id));
          return match
            ? {
              value: match.value,
              label: match.label,
              id: campaign_id,
              clientId,
            }
            : null;
        })
        .filter(Boolean) as SelectedItem[];

      setClientApprovers(mapped);
    }
  }, [
    campaignFormData?.client_approver_ids,
    campaignFormData?.campaign_id,
    campaignFormData?.client_selection?.id,
    clientapprovalOptions,
  ]);





  if (!campaignFormData) {
    return <div>Loading...</div>;
  }

  return (

    <div className="container mx-auto px-4">
      <PageHeaderWrapper t1="Set up your new campaign" />
      {alert && <AlertMain alert={alert} />}

      {loading ? (
        <div className="flex flex-col gap-6 mt-5">
          <div>
            <Skeleton height={50} width={'60%'} />
            <Skeleton height={30} width={'80%'} />
            <Skeleton height={30} width={'100%'} />
            <Skeleton height={30} width={'100%'} />
          </div>
          <div>
            <Skeleton height={70} width={'50%'} />
            <Skeleton height={50} width={'60%'} />
            <Skeleton height={30} width={'80%'} />
          </div>
        </div>
      ) : (
        <div className="mt-10">
          {/* Client Selection Section */}
          <div className="mb-6">
            <Title className="text-2xl font-semibold text-gray-800 mb-4">
              Client Architecture
            </Title>
            <div className="flex items-center flex-wrap gap-4 pb-12">
              <div>
                <TreeDropdown
                  data={level1Options}
                  setCampaignFormData={setCampaignFormData}
                  formId="level_1"
                  title={"Client Architecture"} campaignFormData={campaignFormData} />
              </div>
            </div>
          </div>

          {/* Media Plan Details Section */}
          <div className="mb-16">
            <Title className="text-2xl font-semibold text-gray-800 mb-4">
              Media Plan Details
            </Title>
            <div className="flex flex-wrap items-start gap-6">
              <div >
                <label className="block text-sm font-medium text-gray-700  ">
                  Name
                </label>
                <ClientSelectionInput
                  label="Enter media plan name"
                  formId="media_plan"
                />
              </div>
              <div >
                <label className="block text-sm font-medium text-gray-700">
                  Internal Approver
                </label>
                <InternalApproverDropdowns
                  options={internalapproverOptions}
                  //@ts-ignore
                  value={{ internal_approver: internalApprovers }}
                  onChange={(field, selected) => {
                    setInternalApprovers(selected);
                    setCampaignFormData((prev) => ({
                      ...prev,
                      [`${field}_ids`]: selected.map((item) => item.value),
                      [field]: selected,
                    }));
                  }}
                />
              </div>


              <div >
                <label className="block text-sm font-medium text-gray-700 ">
                  Client Approver
                </label>
                <ClientApproverDropdowns
                  options={clientapprovalOptions}
                  //@ts-ignore
                  value={{ client_approver: clientApprovers }}
                  onChange={(field, selected) => {
                    setClientApprovers(selected);
                    setCampaignFormData((prev) => ({
                      ...prev,
                      [`${field}_ids`]: selected.map((item) => item.value),
                      [field]: selected,
                    }));
                  }}
                />

              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-6 mb-14">
            <div className="pb-1">
              <Title className="text-2xl font-semibold text-gray-800 mb-4">Budget details</Title>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 ">
                  Currency
                </label>
                <ClientSelection
                  options={selectCurrency}
                  label={"Select country"}
                  formId="budget_details_currency"
                />
              </div>
            </div>
          </div>
          <div className="">
            <Title className="text-2xl font-semibold text-gray-800 mb-4">Country details</Title>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 ">
                Country
              </label>
              <ClientSelection
                options={selectCountry}
                label={"Select Country"}
                formId="country_details"
              />
            </div>
          </div>
        </div>)
      }
    </div >
  );
};