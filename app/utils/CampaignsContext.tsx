"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import useCampaignHook from "./useCampaignHook";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { channelMixPopulate } from "utils/fetcher";
import { signOut, useSession } from "next-auth/react";
import { updateUsersWithCampaign } from "app/homepage/functions/clients";
import {
  extractObjectives,
  getFilteredMetrics,
} from "app/creation/components/EstablishedGoals/table-view/data-processor";
import { useUserPrivileges } from "utils/userPrivileges";
import { toast } from "sonner";
import { useAppDispatch } from "store/useStore";
import { reset } from "features/Comment/commentSlice";

// Get initial state from localStorage if available
const getInitialState = (campaignId?: string | null) => {
  if (typeof window !== "undefined" && campaignId) {
    const savedState = localStorage.getItem(`campaignFormData_${campaignId}`);
    if (savedState) {
      return JSON.parse(savedState);
    }
  }

  return {
    client_selection: { id: "", value: "" },
    level_1: { id: "", value: "" },
    media_plan: "",
    internal_approver: [],
    client_approver: [],
    campaign_builder: "",
    budget_details_currency: { id: "", value: "", label: "" },
    budget_details_fee_type: { id: "", value: "" },
    budget_details_sub_fee_type: "",
    budget_details_value: "",
    country_details: { id: "", value: "" },
    campaign_objectives: "",
    campaign_objective: "", // Add campaign_objective to initial state
    funnel_stages: [],
    channel_mix: [],
    campaign_timeline_start_date: "",
    campaign_timeline_end_date: "",
    campaign_budget: {},
    goal_level: "",
    validatedStages: {},
    campaign_id: {},
    cId: "",
    campaign_version: "V1",
    table_headers: {}, // Add table_headers to initial state
    selected_metrics: {}, // Add selected_metrics to initial state
  };
};

const CampaignContext = createContext<any>(null);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const id = (session?.user as { id?: string })?.id;
  const jwt = (session?.user as { data?: { jwt: string } })?.data?.jwt;
  const campaign_builder = session?.user;
  const query = useSearchParams();
  const cId = query.get("campaignId");
  const [campaignFormData, setCampaignFormData] = useState(
    getInitialState(cId)
  );
  const [campaignData, setCampaignData] = useState(null);
  const dispatch = useAppDispatch();
  const [clientCampaignData, setClientCampaignData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [getloading, setgetLoading] = useState(false);
  const [profile, setGetProfile] = useState(null);
  const [platformName, setPlatformName] = useState(0);
  const [isEditingBuyingObjective, setIsEditingBuyingObjective] =
    useState(false);
  const [selectedOption, setSelectedOption] = useState("percentage");
  const { loadingClients: hookLoadingClients, allClients: hookAllClients } =
    useCampaignHook();
  const [FC, setFC] = useState(null);
  const [loadingObj, setLoadingObj] = useState(false);
  const [platformList, setPlatformList] = useState({});
  const [objectives, setObjectives] = useState([]);
  const [buyObj, setBuyObj] = useState([]);
  const [buyType, setBuyType] = useState([]);
  const [clientPOs, setClientPOs] = useState([]);
  const [fetchingPO, setFetchingPO] = useState(false);
  const [currencySign, setCurrencySign] = useState("");
  const { loggedInUser, agency_user } = useUserPrivileges();
  const [user, setUser] = useState(null);
  const [headerData, setHeaderData] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    year: [],
    quarter: [],
    month: [],
    level_1: [],
    made_by: [],
    approved_by: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({});
  const [clientUsers, setClientUsers] = useState([]);
  const [agencyId, setAgencyId] = useState<string | number | null>(null);
  const [selectedClient, setSelectedClient] = useState();
  const [agencyData, setAgencyData] = useState(null);
  const [selectedId, setSelectedId] = useState<string>("");

  // Memoized selectors to prevent unnecessary re-renders
  const selectReduxClients = createSelector(
    [(state: any) => state.client?.getCreateClientData?.data],
    (data) => data || []
  );

  const selectReduxLoadingClients = createSelector(
    [(state: any) => state.client?.getCreateClientIsLoading],
    (loading) => loading || false
  );

  const reduxClients = useSelector(selectReduxClients);
  const reduxLoadingClients = useSelector(selectReduxLoadingClients);

  const allClients = reduxClients?.length > 0 ? reduxClients : hookAllClients;
  const loadingClients = reduxLoadingClients || hookLoadingClients || false;

  // Save form data to localStorage with debounce
  useEffect(() => {
    if (typeof window !== "undefined" && campaignFormData && cId) {
      const timeout = setTimeout(() => {
        try {
          localStorage.setItem(
            `campaignFormData_${cId}`,
            JSON.stringify(campaignFormData)
          );
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }, 500); // Increased debounce time to 500ms
      return () => clearTimeout(timeout);
    }
  }, [campaignFormData, cId]);

  const [businessLevelOptions, setBusinessLevelOptions] = useState({
    level1: [],
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);

  // Set agencyId from session data when available
  useEffect(() => {
    if (agency_user?.agency?.id) {
      setAgencyId(agency_user.agency.id);
    }
    // Reset profile fetch flag when user changes
    setHasFetchedProfile(false);
  }, [agency_user]);

  const getActiveCampaign = useCallback(
    async (docId?: string) => {
      const campaignId = cId || docId;

      // If no campaign ID but we have a client selected, fetch client data
      if (!campaignId) {
        const clientId = campaignFormData?.client_selection?.id;
        if (clientId && jwt) {
          try {
            setLoadingCampaign(true);
            const res = await axios.get(
              `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}`,
              {
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );

            const clientData = res.data.data;
            setCampaignData({
              client: clientData,
              custom_funnels: clientData?.custom_funnels || [],
              funnel_configs: clientData?.custom_funnel_configs || [],
            });
          } catch (error) {
            if (error?.response?.status === 401) {
              const event = new Event("unauthorizedEvent");
              window.dispatchEvent(event);
            }
            console.error("Error fetching client data:", error);
          } finally {
            setLoadingCampaign(false);
          }
        } else {
          // For new plans without client ID, ensure loading is set to false
          setLoadingCampaign(false);
        }
        return;
      }

      // Clear localStorage if switching to a different campaign
      const clearCampaignData = () => {
        if (typeof window === "undefined") return;
        try {
          // Clear sessionStorage for channel state
          const keysToRemove: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith("channelLevelAudienceState_")) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => sessionStorage.removeItem(key));

          // Clear window channel state
          if ((window as any).channelLevelAudienceState) {
            Object.keys((window as any).channelLevelAudienceState).forEach(
              (stageName) => {
                delete (window as any).channelLevelAudienceState[stageName];
              }
            );
          }

          // Clear all localStorage items related to campaign creation
          const localStorageKeysToRemove = [
            "campaignFormData",
            "filteredClient",
            "selectedOptions",
            "funnelStageStatuses",
            "seenFunnelStages",
            "formatSelectionOpenTabs",
            "step1_validated",
            "active",
            "change",
            "comments",
            "subStep",
            "verifybeforeMove",
          ];

          // Remove campaign-specific localStorage items
          localStorageKeysToRemove.forEach((key) => {
            localStorage.removeItem(key);
          });

          // Remove quantities-related localStorage items (format selection)
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("quantities_")) {
              localStorage.removeItem(key);
            }
          });

          // Remove modal dismissal keys
          Object.keys(localStorage).forEach((key) => {
            if (
              key.includes("modal_dismissed") ||
              key.includes("goalLevelModalDismissed")
            ) {
              localStorage.removeItem(key);
            }
          });

          // Remove format error trigger keys
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("triggerFormatError_")) {
              localStorage.removeItem(key);
            }
          });

          // Remove channel mix related localStorage items
          Object.keys(localStorage).forEach((key) => {
            if (
              key.includes("openItems") ||
              key.includes("selected") ||
              key.includes("stageStatuses") ||
              key.includes("showMoreMap") ||
              key.includes("openChannelTypes")
            ) {
              localStorage.removeItem(key);
            }
          });


        } catch (error) {
          console.error("Error clearing campaign data:", error);
        }

        // Reset Redux state
        dispatch(reset());
      };

      // Check if we're switching to a different campaign
      const currentCampaignId = campaignFormData?.cId;
      if (currentCampaignId && currentCampaignId !== campaignId) {
        clearCampaignData();
        // Reset context state when switching campaigns
        setCampaignFormData({});
        setCampaignData(null);
      }

      try {
        setLoadingCampaign(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignId}`,
          {
            params: {
              populate: {
                client: true,
                campaign_builder: true,
                agency_profile: true,
                media_plan_details: {
                  populate: {
                    internal_approver: {
                      populate: "user",
                    },
                    client_approver: {
                      populate: "user",
                    },

                    approved_by: {
                      populate: "user",
                    },
                  },
                },
                budget_details: "*",
                client_selection: "*",
                user: true,
                campaign_budget: { populate: ["budget_fees"] },
                channel_mix: {
                  populate: { ...channelMixPopulate, stage_budget: "*" },
                },
              },
            },
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        const data = res?.data?.data;

        if (!data) return;
        // const obj = await extractObjectives(campaignFormData);
        // const sMetrics = await getFilteredMetrics(obj)
        setCampaignData(data);
        setHeaderData(data?.table_headers || {});

        // Set flag to indicate user has an active campaign (prevents data clearing)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("hasActiveCampaign", "true");

        }

        // NEW: Restore channel audience data from local storage
        if (typeof window !== "undefined" && data?.channel_mix) {
          try {
            // Import the merge function dynamically to avoid circular dependencies
            const { mergeChannelAudienceIntoCampaign } = await import(
              "../creation/components/common/AdSetsFlow"
            );

            // Merge the loaded campaign data with stored audience data
            const campaignWithAudienceData = mergeChannelAudienceIntoCampaign(
              data,
              campaignId
            );

            // Update the campaign data with merged audience information
            if (campaignWithAudienceData !== data) {
              setCampaignData(campaignWithAudienceData);

            }
          } catch (importError) {
            console.warn(
              "Could not restore audience data (import failed):",
              importError
            );
          }
        }

        setCampaignFormData((prev) => {
          // Check if we're loading a different campaign than what's currently loaded
          const isDifferentCampaign = prev?.cId !== cId;

          // If it's a different campaign, don't preserve local data
          const shouldPreserveLocalData =
            !isDifferentCampaign && prev && Object.keys(prev).length > 0;



          return {
            ...prev,
            client_selection: {
              id: data?.client?.documentId ?? prev?.client_selection?.id,
              value: data?.client?.client_name ?? prev?.client_selection?.value,
            },
            agency_profile: data?.agency_profile ?? prev.agency_profile,
            level_1:
              data?.client_selection?.level_1 &&
                ((Array.isArray(data?.client_selection?.level_1.value) &&
                  data?.client_selection?.level_1.value.length > 0) ||
                  (typeof data?.client_selection?.level_1.value === "string" &&
                    data?.client_selection?.level_1.value))
                ? {
                  id: data?.client_selection?.level_1.id ?? prev.level_1?.id,
                  value:
                    data?.client_selection?.level_1.value ??
                    prev.level_1?.value,
                }
                : prev.level_1,
            media_plan:
              shouldPreserveLocalData && prev.media_plan
                ? prev.media_plan
                : data?.media_plan_details?.plan_name ?? prev.media_plan,
            budget_details_currency: {
              id: data?.budget_details?.currency,
              value: data?.budget_details?.currency,
            },
            country_details: {
              id: data?.budget_details?.value,
              value: data?.budget_details?.value,
            },
            internal_approver:
              data?.media_plan_details?.internal_approver ??
              prev.internal_approver,
            client_approver:
              data?.media_plan_details?.client_approver ?? prev.client_approver,
            approved_by:
              data?.media_plan_details?.approved_by ?? prev.approved_by,
            campaign_objectives:
              data?.campaign_objective ?? prev.campaign_objectives,
            campaign_objective: data?.campaign_objective ?? prev.campaign_objective,
            funnel_stages: data?.funnel_stages ?? prev.funnel_stages,
            // funnel_stages:
            //   shouldPreserveLocalData &&
            //   prev.funnel_stages &&
            //   prev.funnel_stages.length > 0
            //     ? prev.funnel_stages
            //     : data?.funnel_stages ?? prev.funnel_stages,
            channel_mix:
              shouldPreserveLocalData &&
                prev.channel_mix &&
                Object.keys(prev.channel_mix).length > 0
                ? prev.channel_mix
                : data?.channel_mix ?? prev.channel_mix,
            campaign_timeline_start_date:
              shouldPreserveLocalData && prev.campaign_timeline_start_date
                ? prev.campaign_timeline_start_date
                : data?.campaign_timeline_start_date ?? "",
            campaign_timeline_end_date:
              shouldPreserveLocalData && prev.campaign_timeline_end_date
                ? prev.campaign_timeline_end_date
                : data?.campaign_timeline_end_date ?? "",
            campaign_budget:
              shouldPreserveLocalData && prev.campaign_budget && Object.keys(prev.campaign_budget).length > 0
                ? prev.campaign_budget
                : data?.campaign_budget ?? prev.campaign_budget,
            goal_level: data?.goal_level ?? prev.goal_level,
            ad_sets_granularity:
              data?.ad_sets_granularity ?? prev.ad_sets_granularity,
            progress_percent: data?.progress_percent ?? prev.progress_percent,
            custom_funnels: data?.custom_funnels ?? prev.custom_funnels,
            campaign_builder: data?.campaign_builder ?? prev.campaign_builder,
            user: data?.user ?? prev.user,
            campaign_id: data?.id ?? prev.id,
            cId: cId,
            campaign_version: data?.campaign_version ?? prev.campaign_version,
            isApprove: data?.isApprove,
            table_headers: data?.table_headers ?? prev?.table_headers,
            selected_metrics: data?.selected_metrics ?? prev?.selected_metrics,
          };
        });
        setLoadingCampaign(false);
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }
      } finally {
        setLoadingCampaign(false);
      }
    },
    [cId, campaignFormData?.cId]
  );

  const createCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`,
        {
          data: {
            //@ts-ignore
            campaign_builder: loggedInUser?.id,
            client: campaignFormData?.client_selection?.id,
            client_selection: {
              client: campaignFormData?.client_selection?.value,
              level_1: campaignFormData?.level_1?.id,
            },
            media_plan_details: {
              plan_name: campaignFormData?.media_plan,
              internal_approver: campaignFormData?.internal_approver?.map(
                (ff) => ff?.value
              ),
              client_approver: campaignFormData?.client_approver?.map(
                (ff) => ff?.value
              ),
            },
            agency_profile: agencyId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      await updateUsersWithCampaign(
        clientUsers?.map((uu) => uu?.id),
        response?.data?.data?.id,
        jwt
      );
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [campaignFormData]);

  const getProfile = useCallback(async () => {
    if (!id) return;

    // If we already have agency_user from session, use it
    if (agency_user?.agency?.id) {
      setAgencyId(agency_user.agency.id);
      // Only fetch profile if we don't have it yet and need additional data
      if (!profile) {
        try {
          setLoading(true);
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/get-profile/${id}`,
            {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            }
          );
          setGetProfile(response?.data);
          setHasFetchedProfile(true);
          return response;
        } catch (error) {
          if (error?.response?.status === 401) {
            const event = new Event("unauthorizedEvent");
            window.dispatchEvent(event);
          }
          throw error;
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // Fallback to fetching profile if agency_user is not in session
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/get-profile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setGetProfile(response?.data);
      setHasFetchedProfile(true);

      const aId =
        response?.data?.user_type === "admin"
          ? response?.data?.admin?.agency?.id
          : response?.data?.user_type?.includes("cleint")
            ? response?.data?.cleint_user?.agency?.id
            : response?.data?.agency_user?.agency?.id;

      setAgencyId(aId);
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [id, agency_user, jwt]);

  // Fetch profile data when we have agency_user from session but need additional profile data
  useEffect(() => {
    if (id && jwt && agency_user?.agency?.id && !hasFetchedProfile) {
      getProfile();
      setHasFetchedProfile(true);
    }
  }, [id, jwt, agency_user, hasFetchedProfile]);

  const getAgency = useCallback(async () => {
    // get-agency-profile
    if (!agencyId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/get-agency-profile/${agencyId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setAgencyData(response?.data);

      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  const updateCampaign = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
          { data },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        return response;
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cId]
  );

  // const fetchBusinessLevelOptions = useCallback(async (clientId: string) => {
  //   if (!clientId) return;
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}?populate=*`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${jwt}`,
  //         },
  //       }
  //     );
  //     const data = response?.data?.data || {};
  //    
  //     setBusinessLevelOptions({
  //       level1:
  //         data?.level_1?.map((item: string) => ({
  //           id: item,
  //           value: item,
  //           label: item,
  //         })) || [],
  //     });
  //   } catch (error) {
  //     console.error("Error fetching Client Architecture options:", error);
  //     setBusinessLevelOptions({ level1: [], level2: [], level3: [] });
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const fetchObjectives = useCallback(async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-objectives?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const data = res?.data?.data;
      const formattedData = data?.map((d: any) => ({
        id: d?.id,
        title: d?.title,
        description: d?.subtitle,
        icon: d?.icon?.url,
      }));
      setObjectives(formattedData);
    } catch (err) {
      console.error("Error fetching objectives:", err);
    } finally {
      setLoadingObj(false);
    }
  }, []);

  const fetchBuyObjectives = useCallback(async () => {
    setLoadingObj(true);
    try {
      // Get all buy objectives (default + custom)
      const allObjectivesRes = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/buy-objectives?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const allObjectives = allObjectivesRes?.data?.data || [];

      // Filter: show all default objectives (where agency is null/empty) + custom objectives from current agency
      const filteredObjectives = allObjectives?.filter((objective: any) => {
        // Show default objectives (no agency specified)
        if (
          !objective.agency ||
          objective.agency === null ||
          objective.agency === ""
        ) {
          return true;
        }
        // Show custom objectives from current agency
        if (agencyId && objective.agency === agencyId.toString()) {
          return true;
        }
        return false;
      });

      setBuyObj(filteredObjectives);
    } catch (err) {
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoadingObj(false);
    }
  }, [agencyId, jwt]);

  const fetchBuyTypes = useCallback(async () => {
    setLoadingObj(true);
    try {
      // Get all buy types (default + custom)
      const allTypesRes = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/buy-types?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const allTypes = allTypesRes?.data?.data || [];

      // Filter: show all default types (where agency is null/empty) + custom types from current agency
      const filteredTypes = allTypes.filter((type: any) => {
        // Show default types (no agency specified)
        if (!type.agency || type.agency === null || type.agency === "") {
          return true;
        }
        // Show custom types from current agency
        if (agencyId && type.agency === agencyId.toString()) {
          return true;
        }
        return false;
      });

      setBuyType(filteredTypes);
    } catch (err) {
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoadingObj(false);
    }
  }, [agencyId, jwt]);

  const getUserByUserType = async (userTypes) => {
    setgetLoading(true);
    try {
      const queryString = userTypes
        .map((type) => `filters[user_type][$in]=${type}`)
        .join("&");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/users?${queryString}&pagination[page]=1&pagination[pageSize]=100`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const users = response.data;
      setUser(users);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setgetLoading(false);
    }
  };

  const organizeAdvertisingPlatforms = useCallback((data) => {
    const result = {
      online: {
        social_media: [],
        display_networks: [],
        search_engines: [],
        e_commerce: [],
        streaming: [],
        mobile: [],
        ooh: [],
        print: [],
        broadcast: [],
        messaging: [],
        in_game: [],
      },
      offline: {
        social_media: [],
        display_networks: [],
        search_engines: [],
        e_commerce: [],
        streaming: [],
        mobile: [],
        ooh: [],
        print: [],
        broadcast: [],
        messaging: [],
        in_game: [],
      },
    };

    data.forEach((platform) => {
      const typeCategory = platform.type.toLowerCase();
      let channelType = platform.channel_type
        .toLowerCase()
        .replace(/\s+/g, "_");
      if (channelType === "in-game") channelType = "in_game";
      if (channelType === "e-commerce") channelType = "e_commerce";
      if (result[typeCategory] && result[typeCategory][channelType]) {
        result[typeCategory][channelType].push({
          id: platform.id,
          documentId: platform.documentId,
          platform_name: platform.platform_name,
          description: platform.description,
        });
      }
    });

    return result;
  }, []);

  const fetchPlatformLists = useCallback(async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/platform-lists?pagination[pageSize]=200`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const data = res?.data?.data;
      const organizedPlatforms = organizeAdvertisingPlatforms(data);
      setPlatformList(organizedPlatforms);
    } catch (err) {
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoadingObj(false);
    }
  }, [organizeAdvertisingPlatforms]);

  // FetchClient Architecture options when client selection changes
  // useEffect(() => {
  //   // const clientId = campaignFormData?.client_selection?.id;
  //   if (selectedClient) {
  //     fetchBusinessLevelOptions(selectedClient);
  //     setCampaignFormData((prev) => ({
  //       ...prev,
  //       level_1: { id: "", value: "" },
  //     }));
  //   }
  // }, [selectedClient, fetchBusinessLevelOptions]);

  // Initial data fetching
  const updateStatus = async (
    stage: string,
    label: string,
    cId: string | number,
    jwt: string,
    user: any,
    getActiveCampaign: (id: string | number) => void
  ) => {
    try {
      const newStatus = [
        {
          id: Date.now(),
          stage,
          label,
          actor: {
            id: user?.id,
            name: user?.username,
            role: user?.user_type,
          },
          date: new Date().toISOString(),
        },
      ];

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        {
          data: {
            isStatus: newStatus, // ← overwrite old status
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      getActiveCampaign(cId);
      toast.success(`Media plan marked as '${label}'`);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
      toast.error("Failed to update status");
      throw error;
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          // Only fetch profile if we don't have agency_user from session
          id && !agency_user?.agency?.id && getProfile(),
          agencyId && getAgency(),
          cId && getActiveCampaign(),
          fetchBuyObjectives(),
          fetchObjectives(),
          fetchPlatformLists(),
          fetchBuyTypes(),
        ]);
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }
      }
    };
    if (jwt) {
      fetchInitialData();
    }
  }, [
    cId,
    id,
    getActiveCampaign,
    fetchBuyObjectives,
    fetchObjectives,
    fetchPlatformLists,
    fetchBuyTypes,
    jwt,
    agencyId,
    agency_user,
  ]);

  const contextValue = useMemo(
    () => ({
      loadingClients,
      allClients,
      campaignFormData,
      setCampaignFormData,
      createCampaign,
      updateCampaign,
      campaignData,
      cId,
      getActiveCampaign,
      getUserByUserType,
      getloading,
      clientCampaignData,
      setClientCampaignData,
      loading,
      setLoading,
      setCampaignData,
      businessLevelOptions,
      isLoggedIn,
      setIsLoggedIn,
      platformList,
      loadingObj,
      buyObj,
      objectives,
      buyType,
      setBuyObj,
      setBuyType,
      clientPOs,
      setClientPOs,
      fetchingPO,
      setFetchingPO,
      filterOptions,
      setFilterOptions,
      selectedFilters,
      setSelectedFilters,
      isLoading,
      setIsLoading,
      profile,
      loadingCampaign,
      setLoadingCampaign,
      getProfile,
      isEditingBuyingObjective,
      setIsEditingBuyingObjective,
      selectedOption,
      setSelectedOption,
      currencySign,
      setCurrencySign,
      user,
      setClientUsers,
      clientUsers,
      jwt,
      agencyId,
      selectedClient,
      setSelectedClient,
      selectedId,
      setSelectedId,
      FC,
      setFC,
      agencyData,
      setAgencyData,
      updateStatus,
      setPlatformName,
      platformName,
      headerData,
      setHeaderData,
    }),
    [
      loadingClients,
      allClients,
      campaignFormData,
      createCampaign,
      updateCampaign,
      campaignData,
      cId,
      getActiveCampaign,
      getUserByUserType,
      getloading,
      clientCampaignData,
      loading,
      businessLevelOptions,
      isLoggedIn,
      platformList,
      loadingObj,
      buyObj,
      objectives,
      buyType,
      clientPOs,
      fetchingPO,
      filterOptions,
      selectedFilters,
      isLoading,
      profile,
      loadingCampaign,
      getProfile,
      isEditingBuyingObjective,
      selectedOption,
      currencySign,
      user,
      clientUsers,
      jwt,
      agencyId,
      selectedClient,
      selectedId,
      FC,
      agencyData,
      updateStatus,
      platformName,
      headerData,
    ]
  );

  // Auto-save campaignFormData to localStorage whenever it changes
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      campaignFormData &&
      Object.keys(campaignFormData).length > 0 &&
      cId
    ) {
      localStorage.setItem(
        `campaignFormData_${cId}`,
        JSON.stringify(campaignFormData)
      );
      localStorage.setItem(
        `campaignFormData_${cId}_timestamp`,
        Date.now().toString()
      );
    }
  }, [campaignFormData, cId]);

  // Load campaign-specific data when campaign ID changes
  useEffect(() => {
    if (cId && typeof window !== "undefined") {
      const savedState = localStorage.getItem(`campaignFormData_${cId}`);
      if (savedState) {
        try {
          const parsedData = JSON.parse(savedState);
          setCampaignFormData(parsedData);
        } catch (error) {
          console.error(
            "Error loading campaign data from localStorage:",
            error
          );
          // If there's an error parsing, reset to initial state
          setCampaignFormData(getInitialState(cId));
        }
      } else {
        // No saved data for this campaign, use initial state
        setCampaignFormData(getInitialState(cId));
      }
    }
  }, [cId]);

  // Clean up old localStorage data when switching campaigns
  useEffect(() => {
    if (cId && typeof window !== "undefined") {
      // Get all localStorage keys that start with "campaignFormData_"
      const keysToCheck = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith("campaignFormData_") &&
          key !== `campaignFormData_${cId}`
      );

      // Remove old campaign data (keep only the current campaign and a few recent ones)
      if (keysToCheck.length > 10) {
        // Keep only the 10 most recent campaigns
        const sortedKeys = keysToCheck.sort((a, b) => {
          const aTime = localStorage.getItem(`${a}_timestamp`) || "0";
          const bTime = localStorage.getItem(`${b}_timestamp`) || "0";
          return parseInt(bTime) - parseInt(aTime);
        });

        // Remove older campaigns
        sortedKeys.slice(10).forEach((key) => {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        });
      }
    }
  }, [cId]);

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context)
    throw new Error("useCampaigns must be used within a CampaignProvider");
  return context;
};
