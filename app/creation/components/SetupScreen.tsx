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
import ClientSelection from "components/ClientSelection";
import SaveProgressButton from "app/utils/SaveProgressButton";
import { useActive } from "app/utils/ActiveContext";
import BackConfirmModal from "../../../components/BackConfirmModal";

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
  const router = useRouter();
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
    setCurrencySign,
    selectedClient,
    setClientUsers,
    clientUsers,
    jwt,
    FC,
    setFC,
    selectedId,
    selectedOption,
    setSelectedOption,
  } = useCampaigns();
  const query = useSearchParams();
  const documentId = query.get("campaignId");
  const lastFetchedClientId = useRef(null);
  const { data: session } = useSession();
  const { client_selection } = campaignFormData || {};
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState({ agencyAccess: [], clientAccess: [] });
  const { setIsDrawerOpen, setClose } = useComments();
  const { isAdmin, userID } = useUserPrivileges();
  const [internalapproverOptions, setInternalApproverOptions] = useState<
    DropdownOption[]
  >([]);
  const [clientapprovalOptions, setClientApprovalOptions] = useState<
    DropdownOption[]
  >([]);
  const [level1Options, setlevel1Options] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(null);

  // --- Navigation/modal logic (moved here to fix linter errors) ---
  const { change, setChange, showModal, setShowModal } = useActive();
  const [showBackModal, setShowBackModal] = useState(false);

  useEffect(() => {
    window.onpopstate = (event) => {
      if (change) {
        setShowBackModal(true);
        window.history.pushState(null, "", window.location.href); // Prevent back
      }
    };
    return () => {
      window.onpopstate = null;
    };
  }, [change]);

  // Handle navigation after modal
  const handleNavigate = () => {
    setChange(false);
    setShowBackModal(false);
    localStorage.removeItem("campaignFormData");
    router.push("/dashboard");
  };

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
    const cached = localStorage.getItem("filteredClient");
    const storedClientId = localStorage.getItem(userID);
    setClientId(storedClientId);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFC(parsed);
      } catch (err) {}
    }
  }, []);

  const fetchUsers = async () => {
    // Pick the first available ID
    const effectiveClientId = clientId || selectedClient || FC?.id;
    if (!effectiveClientId) return;

    const baseUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/users`;
    const filterParams = [
      `filters[clients][id][$eq]=${encodeURIComponent(effectiveClientId)}`,
    ];
    const populateParams = ["populate=*"];

    setLoading(true);

    try {
      const response = await fetch(
        `${baseUrl}?${[...filterParams, ...populateParams].join("&")}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const agencyAccess = data?.filter((user) =>
        ["agency_creator", "agency_approver", "financial_approver"].includes(
          user.user_type
        )
      );
      const clientAccess = data?.filter((user) =>
        ["client", "client_approver"].includes(user.user_type)
      );

      setUsers({ agencyAccess, clientAccess });
    } catch (error) {
      toast.error(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [
    clientId,
    selectedClient,
    FC?.id,
    campaignFormData?.client_selection?.id,
  ]);

  useEffect(() => {
    //@ts-ignore
    dispatch(
      getCreateClient({
        userId: !isAdmin ? session?.user?.data?.user?.id : null,
        agencyId: FC?.id,
        jwt,
      })
    );
  }, [isAdmin, session, dispatch]);

  useEffect(() => {
    if (FC) {
      const agencyUserOptions =
        users?.agencyAccess
          ?.filter(
            (user) =>
              user?.user_type === "agency_approver" ||
              user?.user_type === "financial_approver"
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
      setCampaignFormData((prev) => ({
        ...prev,
        campaign_budget: {
          currency: campaignFormData?.budget_details_currency?.id,
        },
        ["client_selection"]: {
          id: selectedClient || FC?.id,
          value: FC?.client_name || "",
        },
        level_1: prev.level_1 || campaignFormData?.level_1, // always preserve if present
      }));
    }
  }, [FC, selectedClient, users]);

  useEffect(() => {
    if (FC) {
      const data = FC;
      setlevel1Options(data?.level_1);
    }
  }, [FC]);

  useEffect(() => {
    // Only load from localStorage if campaignFormData is empty/null
    if (!campaignFormData || Object.keys(campaignFormData).length === 0) {
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
    }
  }, [campaignFormData]);

  // useEffect(() => {
  //   if (documentId === null && !isInitialized) {
  //     // Only load from localStorage if campaignFormData is empty/null
  //     if (!campaignFormData || Object.keys(campaignFormData).length === 0) {
  //       const savedFormData = localStorage.getItem("campaignFormData");
  //       if (savedFormData) {
  //         setCampaignFormData(JSON.parse(savedFormData));
  //       } else {
  //         const initialFormData = {
  //           client_selection: {
  //             id: selectedClient || FC?.id,
  //             value: FC?.client_name || '',
  //           },
  //           media_plan: "",
  //           internal_approver: [],
  //           client_approver: [],
  //           approver_id: [],
  //           budget_details_currency: {},
  //           country_details: {},
  //           budget_details_fee_type: {},
  //           budget_details_value: "",
  //           level_1: {},
  //           campaign_version: "V1",
  //         };
  //         setCampaignFormData(initialFormData);
  //         localStorage.setItem("campaignFormData", JSON.stringify(initialFormData));
  //       }
  //     }
  //     setIsInitialized(true);
  //   } else if (documentId === null && isInitialized) {
  //     // Only update client_selection if already initialized
  //     setCampaignFormData(prev => {
  //       const updated = {
  //         ...prev,
  //         client_selection: {
  //           id: selectedClient || FC?.id,
  //           value: FC?.client_name || '',
  //         },
  //       };
  //       localStorage.setItem("campaignFormData", JSON.stringify(updated));
  //       return updated;
  //     });
  //   }
  // }, [documentId, isInitialized, selectedClient, FC, campaignFormData]);

  useEffect(() => {
    if (campaignFormData?.campaign_budget?.currency) {
      const currency = selectCurrency?.find(
        (c) => c?.value === campaignFormData?.campaign_budget?.currency
      );
      if (currency) {
        if (
          campaignFormData?.budget_details_fee_type?.id === "Fix budget fee"
        ) {
          setCurrencySign(currency.sign);
        } else if (
          campaignFormData?.budget_details_fee_type?.id === "Tooling"
        ) {
          setCurrencySign(
            selectedOption === "percentage" ? "%" : currency.sign
          );
        }
      }
    }
  }, [
    campaignFormData?.campaign_budget?.currency,
    campaignFormData?.budget_details_fee_type?.id,
    selectedOption,
  ]);

  useEffect(() => {
    const currencyData = campaignFormData?.budget_details_currency;

    if (currencyData?.value) {
      setSelectedOption({
        label: currencyData.value,
        value: currencyData.value,
      });
    }
  }, [campaignFormData?.budget_details_currency]);

  useEffect(() => {
    // If form is already filled, stop loading immediately
    if (
      campaignFormData?.media_plan &&
      campaignFormData?.budget_details_currency?.id
    ) {
      setLoading(false);
    }
  }, [campaignFormData]);

  if (!campaignFormData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-row justify-between w-full align-center">
        <PageHeaderWrapper t1="Set up your new campaign" />
        <SaveProgressButton setIsOpen={undefined} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-6 mt-5">
          <div>
            <Skeleton height={50} width={"60%"} />
            <Skeleton height={30} width={"80%"} />
            <Skeleton height={30} width={"100%"} />
            <Skeleton height={30} width={"100%"} />
          </div>
          <div>
            <Skeleton height={70} width={"50%"} />
            <Skeleton height={50} width={"60%"} />
            <Skeleton height={30} width={"80%"} />
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
                  title={"Client Architecture"}
                  campaignFormData={campaignFormData}
                />
              </div>
            </div>
          </div>

          {/* Media Plan Details Section */}
          <div className="mb-16">
            <Title className="text-2xl font-semibold text-gray-800 mb-4">
              Media Plan Details
            </Title>
            <div className="flex flex-wrap items-start gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700  ">
                  Name
                </label>
                <ClientSelectionInput
                  label="Enter media plan name"
                  formId="media_plan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Internal Approver
                </label>
                <InternalApproverDropdowns
                  label="Client Approver"
                  formId={"internal_approver"}
                  options={internalapproverOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 ">
                  Client Approver
                </label>

                <ClientApproverDropdowns
                  label="Client Approver"
                  formId={"client_approver"}
                  options={clientapprovalOptions}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-6 mb-14">
            <div className="pb-1">
              <Title className="text-2xl font-semibold text-gray-800 mb-4">
                Budget details
              </Title>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 ">
                  Currency
                </label>
                <ClientSelection
                  options={selectCurrency}
                  label={"Select Currency"}
                  formId="budget_details_currency"
                />
              </div>
            </div>
          </div>
          <div className="">
            <Title className="text-2xl font-semibold text-gray-800 mb-4">
              Country details
            </Title>
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
        </div>
      )}

      {/* BackConfirmModal for step 0 */}
      <BackConfirmModal
        isOpen={showBackModal}
        onClose={() => setShowBackModal(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
