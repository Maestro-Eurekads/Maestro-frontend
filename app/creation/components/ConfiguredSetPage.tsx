import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Button from "./common/button";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import {
  formatNumberWithCommas,
  getCurrencySymbol,
  getPlatformIcon,
  mediaTypes,
} from "components/data";
import { useCampaigns } from "app/utils/CampaignsContext";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";

interface OutletType {
  id: number;
  outlet: string;
  icon: StaticImageData;
  ad_sets: any[];
  budget: {
    fixed_value: string | number;
    percentage_value: string | number;
  };
  channel: string;
}

const calculateNetFromGross = (grossAmount: number, fees: any[]): number => {
  const totalFees = fees.reduce(
    (total, fee) => total + Number(fee.amount || 0),
    0
  );
  return Math.max(0, Number(grossAmount) - totalFees);
};

const calculateGrossFromNet = (netAmount: number, fees: any[]): number => {
  const totalFees = fees.reduce(
    (total, fee) => total + Number(fee.amount || 0),
    0
  );
  return Number(netAmount) + totalFees;
};

const calculatePhaseRemainingBudget = (
  stageName: string,
  campaignFormData: any
): string => {
  if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
    return "0.00";
  }
  const stage = campaignFormData?.channel_mix?.find(
    (ch) => ch?.funnel_stage === stageName
  );
  if (!stage) return "0.00";
  const stageBudget = Number(stage?.stage_budget?.fixed_value) || 0;
  let allocated = 0;
  mediaTypes.forEach((type) => {
    if (stage[type]) {
      allocated += stage[type].reduce(
        (acc, p) => acc + (Number(p?.budget?.fixed_value) || 0),
        0
      );
    }
  });
  const remaining = stageBudget - allocated;
  return remaining > 0 ? remaining.toFixed(2) : "0.00";
};

const formatPercent = (value: number | string): string => {
  return `${Math.round(Number(value))}`;
};

const calculateTotalLineHeight = (adSets: any[]): number => {
  if (!adSets || adSets.length === 0) return 0;
  let totalHeight = 0;
  adSets.forEach((adSet) => {
    totalHeight += 77;
    if (adSet.extra_audiences && adSet.extra_audiences.length > 0) {
      totalHeight += adSet.extra_audiences.length * 77;
    }
  });
  return totalHeight;
};

const ConfiguredSetPage = ({
  netAmount,
  fees = [],
  campaignBudgetType = "gross",
}) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({});
  const [stageStatus, setStageStatus] = useState<Record<string, string>>({});
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({});
  const [validatedStages, setValidatedStages] = useState<
    Record<string, boolean>
  >({});
  const [results, setResults] = useState<Record<string, any[]>>({});

  const funnelStages: string[] = Array.isArray(campaignFormData?.funnel_stages)
    ? campaignFormData.funnel_stages
    : [];

  useEffect(() => {
    if (funnelStages.length > 0) {
      setOpenItems((prev) => {
        const next = { ...prev };
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = false;
        });
        return next;
      });

      setOpenChannels((prev) => {
        const next = { ...prev };
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = false;
        });
        return next;
      });

      setStageStatus((prev) => {
        const next = { ...prev };
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = "Not started";
        });
        return next;
      });

      setValidatedStages((prev) => {
        const next = { ...prev };
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = false;
        });
        return next;
      });

      setResults((prev) => {
        const next = { ...prev };
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = [];
        });
        return next;
      });
    }
  }, [funnelStages]);

  const getPlatformsFromStage = (
    channelMix: any[]
  ): Record<string, OutletType[]> => {
    if (channelMix?.length > 0) {
      const platformsByStage: Record<string, OutletType[]> = {};
      channelMix.forEach((stage) => {
        const { funnel_stage } = stage;
        if (!platformsByStage[funnel_stage]) {
          platformsByStage[funnel_stage] = [];
        }
        mediaTypes.forEach((channel) => {
          if (Array.isArray(stage[channel])) {
            stage[channel].forEach((platform) => {
              const icon = getPlatformIcon(platform?.platform_name);
              if (icon) {
                const platformData = {
                  id: Math.floor(Math.random() * 1000000),
                  outlet: platform.platform_name,
                  ad_sets: platform?.ad_sets || [],
                  icon,
                  budget: platform?.budget || {
                    fixed_value: "",
                    percentage_value: "",
                  },
                  channel,
                };
                platformsByStage[funnel_stage].push(platformData);
              }
            });
          }
        });
      });
      return platformsByStage;
    }
    return {};
  };

  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      const newPlatforms = getPlatformsFromStage(campaignFormData.channel_mix);
      setPlatforms(newPlatforms);
    }
  }, [campaignFormData?.channel_mix]);

  useEffect(() => {
    funnelStages.forEach((stageName) => {
      const stageData = campaignFormData?.channel_mix?.find(
        (ch) => ch?.funnel_stage === stageName
      );
      if (stageData?.stage_budget?.fixed_value > 0) {
        setStageStatus((prev) => ({
          ...prev,
          [stageName]: validatedStages[stageName] ? "Completed" : "In progress",
        }));
      } else {
        setStageStatus((prev) => ({
          ...prev,
          [stageName]: "Not started",
        }));
      }
    });
  }, [campaignFormData?.channel_mix, validatedStages]);

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const toggleChannel = (stage: string) => {
    setOpenChannels((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const isButtonEnabled = (stage: string): boolean => {
    const stageData = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === stage
    );
    if (stageData?.stage_budget?.fixed_value) return true;
    const hasPlatformBudget = mediaTypes.some((type) =>
      stageData?.[type]?.some(
        (platform) =>
          platform?.budget?.fixed_value &&
          Number(platform.budget.fixed_value) > 0
      )
    );
    const hasAdSetBudget = mediaTypes.some((type) =>
      stageData?.[type]?.some((platform) =>
        platform?.ad_sets?.some(
          (adSet) =>
            adSet?.budget?.fixed_value && Number(adSet.budget.fixed_value) > 0
        )
      )
    );
    return hasPlatformBudget || hasAdSetBudget;
  };

  const handleValidateClick = (stage: string) => {
    setValidatedStages((prev) => ({ ...prev, [stage]: true }));
    setStageStatus((prev) => ({ ...prev, [stage]: "Completed" }));
    const stageData = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === stage
    );
    const newResults: any[] = [];
    if (stageData?.stage_budget?.fixed_value) {
      newResults.push({
        platform: "Top",
        budget: stageData.stage_budget.fixed_value,
        currency: campaignFormData?.campaign_budget?.currency,
      });
    }
    mediaTypes.forEach((type) => {
      stageData?.[type]?.forEach((platform) => {
        if (platform?.budget?.fixed_value) {
          newResults.push({
            platform: platform.platform_name,
            budget: platform.budget.fixed_value,
            currency: campaignFormData?.campaign_budget?.currency,
          });
        }
        platform?.ad_sets?.forEach((adSet) => {
          if (adSet?.budget?.fixed_value) {
            newResults.push({
              platform: `${platform.platform_name} - ${adSet.name}`,
              budget: adSet.budget.fixed_value,
              currency: campaignFormData?.campaign_budget?.currency,
            });
          }
        });
      });
    });
    setResults((prev) => ({ ...prev, [stage]: newResults }));
  };

  const handleAutoSplitBudget = (
    stage: { name: string },
    channel: string,
    platform: string
  ) => {
    const stageName = stage.name;
    const stageData = campaignFormData.channel_mix.find(
      (ch) => ch.funnel_stage === stageName
    );
    const findPlatform = Array.isArray(stageData?.[channel])
      ? stageData[channel].find((ch) => ch?.platform_name === platform)
      : undefined;
    if (stageData && findPlatform) {
      const totalPlatformBudget =
        Number(findPlatform?.budget?.fixed_value) || 0;
      if (!totalPlatformBudget || totalPlatformBudget <= 0) {
        toast.error("Please set platform budget first before auto-splitting", {
          position: "bottom-right",
        });
        return;
      }
      let totalAudienceSize = 0;
      const audienceItems: any[] = [];
      findPlatform?.ad_sets?.forEach((adSet, adSetIndex) => {
        const mainAudienceSize =
          Number(String(adSet?.size || "0").replace(/,/g, "")) || 0;
        if (mainAudienceSize > 0) {
          totalAudienceSize += mainAudienceSize;
          audienceItems.push({
            type: "main",
            adSetIndex,
            audienceSize: mainAudienceSize,
            extraIndex: null,
          });
        }
        if (Array.isArray(adSet?.extra_audiences)) {
          adSet.extra_audiences.forEach((extraAudience, extraIndex) => {
            const extraAudienceSize =
              Number(String(extraAudience?.size || "0").replace(/,/g, "")) || 0;
            if (extraAudienceSize > 0) {
              totalAudienceSize += extraAudienceSize;
              audienceItems.push({
                type: "extra",
                adSetIndex,
                audienceSize: extraAudienceSize,
                extraIndex,
              });
            }
          });
        }
      });
      if (totalAudienceSize === 0 || audienceItems.length === 0) {
        toast.warning(
          "No audience size data available, falling back to equal split",
          {
            position: "bottom-right",
          }
        );
        const totalAdSetCount =
          findPlatform?.ad_sets?.reduce((acc, ad) => {
            const extraAudienceCount = ad?.extra_audiences?.length || 0;
            return acc + 1 + extraAudienceCount;
          }, 0) || 0;
        if (!totalAdSetCount) return;
        const splitBudget = (totalPlatformBudget / totalAdSetCount).toFixed(2);
        const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
          if (ch.funnel_stage === stageName) {
            if (ch[channel]) {
              ch[channel] = ch[channel].map((p) => {
                if (p.platform_name === platform) {
                  return {
                    ...p,
                    ad_sets:
                      p.ad_sets?.map((adSet) => {
                        const updatedExtraAudiences =
                          adSet.extra_audiences?.map((extraAudience) => ({
                            ...extraAudience,
                            budget: {
                              fixed_value: splitBudget,
                              percentage_value: (
                                (Number(splitBudget) / totalPlatformBudget) *
                                100
                              ).toFixed(1),
                            },
                          })) || [];
                        return {
                          ...adSet,
                          budget: {
                            fixed_value: splitBudget,
                            percentage_value: (
                              (Number(splitBudget) / totalPlatformBudget) *
                              100
                            ).toFixed(1),
                          },
                          extra_audiences: updatedExtraAudiences,
                        };
                      }) || [],
                  };
                }
                return p;
              });
            }
          }
          return ch;
        });
        setCampaignFormData({
          ...campaignFormData,
          channel_mix: updatedChannelMix,
        });
        return;
      }
      const budgetAllocations = audienceItems.map((item) => {
        const allocation =
          totalPlatformBudget * (item.audienceSize / totalAudienceSize);
        return {
          ...item,
          budgetAllocation: Number(allocation.toFixed(2)),
          percentage: Number(
            ((allocation / totalPlatformBudget) * 100).toFixed(1)
          ),
        };
      });
      const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          if (ch[channel]) {
            ch[channel] = ch[channel].map((p) => {
              if (p.platform_name === platform) {
                return {
                  ...p,
                  ad_sets:
                    p.ad_sets?.map((adSet, adSetIndex) => {
                      const mainAllocation = budgetAllocations.find(
                        (item) =>
                          item.type === "main" && item.adSetIndex === adSetIndex
                      );
                      const extraAllocations = budgetAllocations.filter(
                        (item) =>
                          item.type === "extra" &&
                          item.adSetIndex === adSetIndex
                      );
                      const updatedExtraAudiences =
                        adSet.extra_audiences?.map(
                          (extraAudience, extraIndex) => {
                            const extraAllocation = extraAllocations.find(
                              (item) => item.extraIndex === extraIndex
                            );
                            return {
                              ...extraAudience,
                              budget: {
                                fixed_value: extraAllocation
                                  ? extraAllocation.budgetAllocation.toString()
                                  : "0",
                                percentage_value: extraAllocation
                                  ? extraAllocation.percentage.toString()
                                  : "0",
                              },
                            };
                          }
                        ) || [];
                      return {
                        ...adSet,
                        budget: {
                          fixed_value: mainAllocation
                            ? mainAllocation.budgetAllocation.toString()
                            : "0",
                          percentage_value: mainAllocation
                            ? mainAllocation.percentage.toString()
                            : "0",
                        },
                        extra_audiences: updatedExtraAudiences,
                      };
                    }) || [],
                };
              }
              return p;
            });
          }
        }
        return ch;
      });
      setCampaignFormData({
        ...campaignFormData,
        channel_mix: updatedChannelMix,
      });
    } else {
      toast.error("Could not find platform data for budget allocation", {
        position: "bottom-right",
      });
    }
  };

  const handleResetBudget = (
    stage: { name: string },
    channel: string,
    platform: string
  ) => {
    const stageName = stage.name;
    const stageData = campaignFormData.channel_mix.find(
      (ch) => ch.funnel_stage === stageName
    );
    if (stageData) {
      const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          if (ch[channel]) {
            ch[channel] = ch[channel].map((p) => {
              if (p.platform_name === platform) {
                return {
                  ...p,
                  ad_sets:
                    p.ad_sets?.map((adSet) => {
                      const updatedExtraAudiences =
                        adSet.extra_audiences?.map((extraAudience) => ({
                          ...extraAudience,
                          budget: {
                            fixed_value: "",
                            percentage_value: "",
                          },
                        })) || [];
                      return {
                        ...adSet,
                        budget: {
                          fixed_value: "",
                          percentage_value: "",
                        },
                        extra_audiences: updatedExtraAudiences,
                      };
                    }) || [],
                };
              }
              return p;
            });
          }
        }
        return ch;
      });
      setCampaignFormData({
        ...campaignFormData,
        channel_mix: updatedChannelMix,
      });
      toast.success("Budget allocation reset successfully", {
        position: "bottom-right",
      });
    }
  };

  const handleStageBudgetUpdate = (
    stageName: string,
    value: string,
    isPercentage = false
  ) => {
    let newBudget = 0;
    let newPercentage = 0;
    const currentStageBudget =
      Number(
        campaignFormData?.channel_mix?.find(
          (ch) => ch?.funnel_stage === stageName
        )?.stage_budget?.fixed_value
      ) || 0;

    if (
      !isPercentage &&
      (value === "" ||
        value === "0" ||
        value.replace(/,/g, "") === "" ||
        Number(value.replace(/,/g, "")) === 0)
    ) {
      const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          const clearedCh = {
            ...ch,
            stage_budget: {
              fixed_value: "",
              percentage_value: "",
            },
          };
          mediaTypes.forEach((type) => {
            if (clearedCh[type]) {
              clearedCh[type] = clearedCh[type].map((p) => ({
                ...p,
                budget: {
                  fixed_value: "",
                  percentage_value: "",
                },
                ad_sets: Array.isArray(p.ad_sets)
                  ? p.ad_sets.map((adSet) => ({
                      ...adSet,
                      budget: {
                        fixed_value: "",
                        percentage_value: "",
                      },
                      extra_audiences: Array.isArray(adSet.extra_audiences)
                        ? adSet.extra_audiences.map((extra) => ({
                            ...extra,
                            budget: {
                              fixed_value: "",
                              percentage_value: "",
                            },
                          }))
                        : [],
                    }))
                  : [],
              }));
            }
          });
          return clearedCh;
        }
        return ch;
      });
      const newCampaignBudget = { ...campaignFormData.campaign_budget };
      if (
        campaignFormData?.campaign_budget?.budget_type === "bottom_up" &&
        updatedChannelMix.every(
          (stage) =>
            !stage.stage_budget?.fixed_value ||
            Number(stage.stage_budget.fixed_value) === 0
        )
      ) {
        newCampaignBudget.amount = "";
      }
      setCampaignFormData({
        ...campaignFormData,
        channel_mix: updatedChannelMix,
        ...(campaignFormData?.campaign_budget?.budget_type === "bottom_up" && {
          campaign_budget: newCampaignBudget,
        }),
      });
      return;
    }

    if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
      const otherStagesTotal =
        campaignFormData?.channel_mix?.reduce((acc, stage) => {
          if (stage.funnel_stage === stageName) {
            return acc;
          }
          return acc + (Number(stage?.stage_budget?.fixed_value) || 0);
        }, 0) || 0;
      if (isPercentage) {
        const percentageValue = Math.min(100, Math.max(0, Number(value) || 0));
        newPercentage = percentageValue;
        const existingTotal = otherStagesTotal + currentStageBudget;
        const minimumTotal = Math.max(existingTotal, 10000);
        newBudget = (minimumTotal * percentageValue) / 100;
        if (percentageValue > 100) {
          toast.error("Percentage cannot exceed 100%", {
            position: "bottom-right",
            theme: "colored",
          });
          return;
        }
      } else {
        const inputValue = Number(value.replace(/,/g, "")) || 0;
        newBudget = inputValue;
        const projectedTotal = otherStagesTotal + newBudget;
        newPercentage =
          projectedTotal > 0 ? (newBudget / projectedTotal) * 100 : 0;
        if (newPercentage > 100) {
          newPercentage = 100;
          const maxAllowedBudget =
            otherStagesTotal > 0 ? otherStagesTotal : newBudget;
          newBudget = maxAllowedBudget;
          toast.warning("Budget adjusted to maintain reasonable percentage", {
            position: "bottom-right",
            theme: "colored",
          });
        }
      }
    } else {
      const totalBudget =
        campaignBudgetType === "gross"
          ? calculateNetFromGross(netAmount, fees)
          : netAmount || 0;
      if (isPercentage) {
        const percentageValue = Math.min(100, Math.max(0, Number(value) || 0));
        newPercentage = percentageValue;
        if (campaignBudgetType === "gross") {
          const grossBudget = (netAmount * percentageValue) / 100;
          newBudget = calculateNetFromGross(grossBudget, fees);
        } else {
          newBudget = (totalBudget * percentageValue) / 100;
        }
      } else {
        const inputValue = Number(value.replace(/,/g, "")) || 0;
        if (campaignBudgetType === "gross" && fees.length > 0) {
          newBudget = calculateNetFromGross(inputValue, fees);
          newPercentage = netAmount ? (inputValue / netAmount) * 100 : 0;
        } else {
          newBudget = inputValue;
          newPercentage = totalBudget ? (newBudget / totalBudget) * 100 : 0;
        }
        if (newPercentage > 100) {
          newPercentage = 100;
          if (campaignBudgetType === "gross" && fees.length > 0) {
            const maxGrossBudget = netAmount;
            newBudget = calculateNetFromGross(maxGrossBudget, fees);
          } else {
            newBudget = totalBudget;
          }
          toast.error("Budget cannot exceed 100% of available budget", {
            position: "bottom-right",
            theme: "colored",
          });
        }
      }
      const currentTotal =
        campaignFormData?.channel_mix?.reduce((acc, stage) => {
          return acc + (Number(stage?.stage_budget?.fixed_value) || 0);
        }, 0) || 0;
      const availableBudget =
        campaignBudgetType === "gross"
          ? calculateNetFromGross(netAmount, fees)
          : netAmount;
      if (currentTotal - currentStageBudget + newBudget > availableBudget) {
        toast.error(
          "The sum of all stage budgets cannot exceed the available budget.",
          {
            position: "bottom-right",
            theme: "colored",
          }
        );
        return;
      }
    }

    const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
      if (ch.funnel_stage === stageName) {
        let updatedCh = {
          ...ch,
          stage_budget: {
            fixed_value: newBudget.toString(),
            percentage_value: newPercentage.toFixed(1),
          },
        };
        if (campaignFormData?.campaign_budget?.budget_type !== "bottom_up") {
          let sumChannelBudgets = 0;
          mediaTypes.forEach((type) => {
            if (ch[type]) {
              sumChannelBudgets += ch[type].reduce(
                (acc, p) => acc + (Number(p?.budget?.fixed_value) || 0),
                0
              );
            }
          });
          if (newBudget === 0 || sumChannelBudgets > newBudget) {
            const clearedChannels = {};
            mediaTypes.forEach((type) => {
              if (ch[type]) {
                clearedChannels[type] = ch[type].map((p) => ({
                  ...p,
                  budget: {
                    fixed_value: "",
                    percentage_value: "",
                  },
                  ad_sets: Array.isArray(p.ad_sets)
                    ? p.ad_sets.map((adSet) => ({
                        ...adSet,
                        budget: {
                          fixed_value: "",
                          percentage_value: "",
                        },
                        extra_audiences: Array.isArray(adSet.extra_audiences)
                          ? adSet.extra_audiences.map((extra) => ({
                              ...extra,
                              budget: {
                                fixed_value: "",
                                percentage_value: "",
                              },
                            }))
                          : [],
                      }))
                    : [],
                }));
              }
            });
            updatedCh = {
              ...updatedCh,
              ...clearedChannels,
            };
          } else {
            const recalculatedChannels = {};
            mediaTypes.forEach((type) => {
              if (ch[type]) {
                recalculatedChannels[type] = ch[type].map((p) => {
                  const channelBudget = Number(p?.budget?.fixed_value) || 0;
                  let newChannelBudget = channelBudget;
                  if (channelBudget > newBudget) {
                    newChannelBudget = newBudget;
                  }
                  return {
                    ...p,
                    budget: {
                      fixed_value: newChannelBudget.toString(),
                      percentage_value:
                        newBudget > 0
                          ? ((newChannelBudget / newBudget) * 100).toFixed(1)
                          : "",
                    },
                  };
                });
              }
            });
            updatedCh = {
              ...updatedCh,
              ...recalculatedChannels,
            };
          }
        }
        return updatedCh;
      }
      return ch;
    });

    const newNetTotal = updatedChannelMix.reduce(
      (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
      0
    );
    setCampaignFormData({
      ...campaignFormData,
      channel_mix: updatedChannelMix,
      ...(campaignFormData?.campaign_budget?.budget_type === "bottom_up" && {
        campaign_budget: {
          ...campaignFormData.campaign_budget,
          amount:
            campaignBudgetType === "gross"
              ? calculateGrossFromNet(newNetTotal, fees).toString()
              : newNetTotal.toString(),
        },
      }),
    });
  };

  const handlePlatformBudgetUpdate = (
    stageName: string,
    platformOutlet: string,
    value: string,
    isPercentage = false
  ) => {
    const stageData = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === stageName
    );
    if (!stageData) return;
    const isBottomUp = campaignFormData?.campaign_budget?.budget_type === "bottom_up";
    const stageBudget = Number(stageData.stage_budget?.fixed_value) || 0;
    
    if (!isBottomUp && stageBudget === 0) {
      toast.error("Please set stage budget first", {
        position: "bottom-right",
        theme: "colored",
      });
      return;
    }
    
    let newBudget = 0;
    let newPercentage = 0;
    
    if (isBottomUp) {
      const budgetValue = Number(value.replace(/,/g, "")) || 0;
      newBudget = budgetValue;
      
      const channelTypes = mediaTypes;
      let currentTotalPlatformBudget = 0;
      for (const channelType of channelTypes) {
        if (stageData[channelType]) {
          currentTotalPlatformBudget += stageData[channelType].reduce((acc, p) => {
            if (p.platform_name === platformOutlet) {
              return acc + newBudget;
            }
            return acc + (Number(p?.budget?.fixed_value) || 0);
          }, 0);
        }
      }
      
      newPercentage = currentTotalPlatformBudget > 0 
        ? (newBudget / currentTotalPlatformBudget) * 100 
        : 0;
    } else {
      if (isPercentage) {
        const percentageValue = Math.min(100, Math.max(0, Number(value) || 0));
        newPercentage = percentageValue;
        newBudget = (stageBudget * percentageValue) / 100;
      } else {
        const budgetValue = Number(value.replace(/,/g, "")) || 0;
        newBudget = budgetValue;
        newPercentage = stageBudget ? (newBudget / stageBudget) * 100 : 0;
      }
      
      const channelTypes = mediaTypes;
      let totalPlatformBudget = 0;
      for (const channelType of channelTypes) {
        if (stageData[channelType]) {
          totalPlatformBudget += stageData[channelType].reduce((acc, p) => {
            if (p.platform_name === platformOutlet) {
              return acc + newBudget;
            }
            return acc + (Number(p?.budget?.fixed_value) || 0);
          }, 0);
        }
      }
      if (totalPlatformBudget > stageBudget) {
        toast.error(
          "The sum of all channels budgets cannot exceed the stage budget.",
          {
            position: "bottom-right",
            theme: "colored",
          }
        );
        return;
      }
      if (newBudget > stageBudget) {
        newBudget = 0;
        newPercentage = 0;
      }
      if (newPercentage > 100) {
        newPercentage = 100;
        newBudget = stageBudget;
        toast.error("Percentage cannot exceed 100%", {
          position: "bottom-right",
          theme: "colored",
        });
      }
    }
    setCampaignFormData((prevData) => {
      const isBottomUp = prevData.campaign_budget?.budget_type === "bottom_up";
      const channelTypes = mediaTypes;
      const updatedChannelMix = prevData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          const updatedChannelType = channelTypes.find((type) =>
            ch[type]?.some((p) => p.platform_name === platformOutlet)
          );
          if (updatedChannelType) {
            let newStageBudget = Number(ch.stage_budget?.fixed_value) || 0;
            if (isBottomUp) {
              let totalPlatformBudgets = 0;
              for (const channelType of channelTypes) {
                if (ch[channelType]) {
                  totalPlatformBudgets += ch[channelType].reduce((acc, p) => {
                    if (p.platform_name === platformOutlet) {
                      return acc + newBudget;
                    }
                    return acc + (Number(p?.budget?.fixed_value) || 0);
                  }, 0);
                }
              }
              newStageBudget = totalPlatformBudgets;
            }
            
            return {
              ...ch,
              stage_budget: isBottomUp ? {
                fixed_value: newStageBudget.toString(),
                percentage_value: "",
              } : ch.stage_budget,
              [updatedChannelType]: ch[updatedChannelType].map((p) =>
                p.platform_name === platformOutlet
                  ? {
                      ...p,
                      budget: {
                        fixed_value: newBudget ? newBudget.toString() : "",
                        percentage_value:
                          newBudget === 0
                            ? ""
                            : isBottomUp
                            ? ((newBudget / (newStageBudget || 1)) * 100).toFixed(1)
                            : ((newBudget / (stageBudget || 1)) * 100).toFixed(1),
                      },
                      ad_sets:
                        newBudget === 0 && !isBottomUp && Array.isArray(p.ad_sets)
                          ? p.ad_sets.map((adSet) => ({
                              ...adSet,
                              budget: {
                                fixed_value: "",
                                percentage_value: "",
                              },
                              extra_audiences: Array.isArray(
                                adSet.extra_audiences
                              )
                                ? adSet.extra_audiences.map((extra) => ({
                                    ...extra,
                                    budget: {
                                      fixed_value: "",
                                      percentage_value: "",
                                    },
                                  }))
                                : [],
                            }))
                          : p.ad_sets,
                    }
                  : p
              ),
            };
          }
        }
        return ch;
      });
      
      if (isBottomUp) {
        const newNetTotal = updatedChannelMix.reduce(
          (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
          0
        );
        return {
          ...prevData,
          channel_mix: updatedChannelMix,
          campaign_budget: {
            ...prevData.campaign_budget,
            amount:
              campaignBudgetType === "gross"
                ? calculateGrossFromNet(newNetTotal, fees).toString()
                : newNetTotal.toString(),
          },
        };
      }
      
      return {
        ...prevData,
        channel_mix: updatedChannelMix,
      };
    });
  };

  if (
    !campaignFormData?.custom_funnels ||
    campaignFormData.custom_funnels.length === 0
  ) {
    return (
      <div className="mt-12 text-red-500">
        Error: Funnel stages are not configured. Please set up funnel stages
        first.
      </div>
    );
  }

  return (
    <div className="mt-12 flex items-start flex-col gap-8 w-full">
      {funnelStages.map((stageName, index) => {
        const stageData = campaignFormData?.channel_mix?.find(
          (ch) => ch?.funnel_stage === stageName
        );
        const stageBudget = Number(stageData?.stage_budget?.fixed_value) || 0;

        let totalBudget: number;
        if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
          totalBudget =
            Number(campaignFormData?.campaign_budget?.amount) ||
            campaignFormData?.channel_mix?.reduce(
              (acc, stage) =>
                acc + (Number(stage?.stage_budget?.fixed_value) || 0),
              0
            ) ||
            0;
        } else {
          totalBudget =
            campaignBudgetType === "gross"
              ? calculateNetFromGross(netAmount, fees)
              : netAmount || 0;
        }

        const percentage = (() => {
          const storedPercentage = Number(
            stageData?.stage_budget?.percentage_value
          );
          if (storedPercentage && storedPercentage > 0) {
            return storedPercentage;
          }
          if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
            const totalOfStages =
              campaignFormData?.channel_mix?.reduce(
                (acc, stage) =>
                  acc + (Number(stage?.stage_budget?.fixed_value) || 0),
                0
              ) || 0;
            if (campaignBudgetType === "gross" && fees.length > 0) {
              const grossTotal = calculateGrossFromNet(totalOfStages, fees);
              const grossStageBudget = calculateGrossFromNet(stageBudget, fees);
              return grossTotal ? (grossStageBudget / grossTotal) * 100 : 0;
            } else {
              return totalOfStages ? (stageBudget / totalOfStages) * 100 : 0;
            }
          } else {
            if (campaignBudgetType === "gross" && fees.length > 0) {
              const grossStageBudget = calculateGrossFromNet(stageBudget, fees);
              return totalBudget ? (grossStageBudget / totalBudget) * 100 : 0;
            } else {
              return totalBudget ? (stageBudget / totalBudget) * 100 : 0;
            }
          }
        })();

        const stage = campaignFormData?.custom_funnels?.find(
          (s) => s.name === stageName
        );
        if (!stage) return null;

        const funnelStageLabel = stage?.name || stageName;

        const phaseRemainingBudget = calculatePhaseRemainingBudget(
          stageName,
          campaignFormData
        );

        const currency = campaignFormData?.campaign_budget?.currency || "CAD";
        const stagePercentage = totalBudget
          ? (stageBudget / totalBudget) * 100
          : 0;

        return (
          <div key={index} className="w-full">
            <div
              className="flex items-center justify-between px-6 py-3 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-3">
                {stage?.icon ? (
                  <Image
                    src={stage.icon}
                    alt={`${stage.name} icon`}
                    width={20}
                    height={20}
                  />
                ) : (
                  <span className="w-5 h-5" />
                )}
                <p className="text-md font-semibold text-[#061237]">
                  {stage.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <p
                  className={`font-semibold text-base ${
                    stageStatus[stage.name] === "Completed"
                      ? "text-green-500 flex items-center gap-1.5"
                      : stageStatus[stage.name] === "In progress"
                      ? "text-[#3175FF]"
                      : "text-[#061237] opacity-50"
                  }`}
                >
                  {stageStatus[stage.name]}
                  {stageStatus[stage.name] === "Completed" && <FaCheckCircle />}
                </p>
              </div>
              <div>
                {openItems[stage.name] ? (
                  <Image src={up} alt="collapse" width={18} height={18} />
                ) : (
                  <Image src={down2} alt="expand" width={18} height={18} />
                )}
              </div>
            </div>
            {openItems[stage.name] && (
              <>
                <div className="pt-3 bg-[#FCFCFC] rounded-lg cursor-pointer border px-6 border-[rgba(6,18,55,0.1)]">
                  <div className="flex mt-4 flex-col items-start gap-4">
                    {fees.length > 0 && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 mb-1">
                          Applied Fees:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {fees.map((fee, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                            >
                              {fee.label}:{" "}
                              {getCurrencySymbol(
                                campaignFormData?.campaign_budget?.currency
                              )}
                              {formatNumberWithCommas(fee.amount)}
                              {fee.isPercent && ` (${fee.percentValue}%)`}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-0.5">
                          Total Fees:{" "}
                          {getCurrencySymbol(
                            campaignFormData?.campaign_budget?.currency
                          )}
                          {formatNumberWithCommas(
                            fees
                              .reduce(
                                (total, fee) => total + Number(fee.amount || 0),
                                0
                              )
                              .toFixed(2)
                          )}
                        </p>
                      </div>
                    )}
                    <div className="flex mb-4 justify-center gap-4">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-center font-bold text-sm">
                          {campaignBudgetType === "gross"
                            ? "Gross Budget"
                            : "Net Budget"}
                          {fees.length > 0 &&
                            campaignBudgetType === "gross" && (
                              <span className="text-xs text-gray-500 block font-normal">
                                (Fees will be deducted automatically)
                              </span>
                            )}
                        </h2>
                        <div className="flex items-center justify-between px-3 w-[180px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                          <p className="font-bold">
                            {getCurrencySymbol(
                              campaignFormData?.campaign_budget?.currency
                            )}
                          </p>
                          <input
                            type="text"
                            className="w-full px-2 focus:outline-none text-sm"
                            disabled={validatedStages[stageName]}
                            value={
                              campaignBudgetType === "gross" && fees.length > 0
                                ? formatNumberWithCommas(
                                    calculateGrossFromNet(
                                      campaignFormData?.channel_mix?.find(
                                        (ch: { funnel_stage: string }) =>
                                          ch?.funnel_stage === stageName
                                      )?.stage_budget?.fixed_value || 0,
                                      fees
                                    )
                                  )
                                : formatNumberWithCommas(
                                    campaignFormData?.channel_mix?.find(
                                      (ch: { funnel_stage: string }) =>
                                        ch?.funnel_stage === stageName
                                    )?.stage_budget?.fixed_value || ""
                                  )
                            }
                            onChange={(e) =>
                              handleStageBudgetUpdate(
                                stageName,
                                e.target.value,
                                false
                              )
                            }
                          />
                          <span>
                            {campaignFormData?.campaign_budget?.currency}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start flex-col gap-2">
                        <h2 className="text-center font-bold text-sm">
                          Percentage
                        </h2>
                        <div className="flex items-center gap-2">
                          <div className="bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full focus:outline-none text-right text-sm"
                                disabled={validatedStages[stageName]}
                                value={formatPercent(percentage)}
                                onChange={(e) =>
                                  handleStageBudgetUpdate(
                                    stageName,
                                    e.target.value,
                                    true
                                  )
                                }
                              />
                              <span>%</span>
                            </div>
                          </div>
                          <p className="tracking-tight text-xs">
                            of total budget
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start flex-col gap-2 ms-2">
                        <h2 className="text-center font-bold text-sm">
                          Net Budget:
                        </h2>
                        <div className="mt-2 flex gap-2 items-center">
                          <span className="font-bold">
                            {getCurrencySymbol(currency)}
                            {formatNumberWithCommas(stageBudget.toFixed(2))}
                          </span>
                          {stagePercentage > 0 && (
                            <span className="text-xs text-gray-600 tracking-tight">
                              ({formatPercent(stagePercentage)}% of net budget)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start flex-col gap-2 ms-2">
                        <h2 className="text-center font-bold text-sm">
                          Remaining:
                        </h2>
                        <div
                          className={`mt-2 font-bold ${
                            Number(phaseRemainingBudget) < 1
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {getCurrencySymbol(currency)}
                          {formatNumberWithCommas(phaseRemainingBudget)}
                        </div>
                      </div>
                    </div>
                    <hr className="text-gray-200 w-full p-0.5" />
                    <div className="font-bold">Channels</div>
                    {platforms[stage.name]?.filter(p => p && p.outlet).map((platform, pIdx) => {
                        const stageObj = campaignFormData?.channel_mix?.find(
                          (stage) => stage.funnel_stage === stageName
                        );
                        if (!stageObj) return null;
                      const channelTypes = mediaTypes;
                      let platformBudget = "";
                      let platformPercentage = 0;
                      for (const channelType of channelTypes) {
                        const foundPlatform = stageObj[channelType]?.find(
                          (p) => p.platform_name === platform?.outlet
                        );
                        if (foundPlatform) {
                          platformBudget =
                            foundPlatform?.budget?.fixed_value || "";
                          const stageBudgetVal =
                            Number(stageObj?.stage_budget?.fixed_value) || 0;
                          platformPercentage =
                            stageBudgetVal > 0
                              ? ((Number(platformBudget) || 0) /
                                  stageBudgetVal) *
                                100
                              : 0;
                          break;
                        }
                      }
                      const budgetValue = platformBudget;
                      return (
                        <div
                          key={`${stageName}${platform?.outlet}${pIdx}`}
                          className="w-full"
                          id={`${stageName}${platform?.outlet}${pIdx}`}
                        >
                          <div className="flex mb-4 items-end gap-2">
                            <div className="flex items-start flex-col gap-1">
                              {platform?.ad_sets?.length > 0 && (
                                <div className="flex rounded-[50px] bg-[#00A36C1A] border border-[#00A36C1A] w-[70px] h-[22px] items-center gap-1">
                                  <span className="text-[#00A36C] pl-2 text-xs">
                                    {platform?.ad_sets?.length} ad sets
                                  </span>
                                </div>
                              )}
                              <div className="flex gap-1 indent-[8px]">
                                {campaignFormData?.campaign_budget?.level ===
                                  "Adset level" &&
                                  platform?.ad_sets?.length > 0 && (
                                    <div
                                      className="l-shape-container-cb"
                                      style={{ position: "relative" }}
                                    >
                                      <div
                                        className="l-vertical-cb-long"
                                        style={{
                                          height: `${calculateTotalLineHeight(
                                            platform?.ad_sets
                                          )}px`,
                                          position: "absolute",
                                          left: "10px",
                                          top: 0,
                                          width: "2px",
                                          background: "#D1D5DB",
                                        }}
                                      ></div>
                                    </div>
                                  )}
                              </div>
                              <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[180px] h-[40px] rounded-[8px] items-center gap-1">
                                <div className="flex justify-between w-full px-3 items-center">
                                  <div className="flex items-center gap-1">
                                    <Image
                                      src={platform?.icon}
                                      className="size-5"
                                      alt={platform?.outlet || "platform"}
                                      width={20}
                                      height={20}
                                    />
                                    <span className="text-sm">
                                      {platform?.outlet}
                                    </span>
                                  </div>
                                  {campaignFormData?.campaign_budget?.level ===
                                    "Adset level" &&
                                    platform?.ad_sets?.length > 0 && (
                                      <Image
                                        src={down2}
                                        className="size-5"
                                        alt="arrow down"
                                        width={18}
                                        height={18}
                                      />
                                    )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start flex-col gap-1">
                              <h2 className="text-center font-bold text-xs">
                                Budget
                              </h2>
                              <div className="flex items-center justify-between px-3 w-[180px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                                <p className="font-bold text-sm">
                                  {getCurrencySymbol(
                                    campaignFormData?.campaign_budget?.currency
                                  )}
                                </p>
                                <input
                                  type="text"
                                  className="w-full px-2 focus:outline-none text-sm"
                                  value={formatNumberWithCommas(budgetValue)}
                                  disabled={validatedStages[stageName]}
                                  onChange={(e) =>
                                    handlePlatformBudgetUpdate(
                                      stageName,
                                      platform.outlet,
                                      e.target.value,
                                      false
                                    )
                                  }
                                />
                                <span className="text-sm">
                                  {campaignFormData?.campaign_budget?.currency}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-start flex-col gap-1">
                              <h2 className="text-center font-bold text-xs">
                                Percentage
                              </h2>
                              <div
                                className="flex items-center gap-1 flex-wrap w-full"
                                style={{
                                  minWidth: 0,
                                  width: "100%",
                                  maxWidth: "100%",
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                }}
                              >
                                <div className="bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      className="w-full focus:outline-none text-right text-sm"
                                      disabled={validatedStages[stageName]}
                                      value={formatPercent(platformPercentage)}
                                      onChange={(e) =>
                                        handlePlatformBudgetUpdate(
                                          stageName,
                                          platform.outlet,
                                          e.target.value,
                                          true
                                        )
                                      }
                                    />
                                    <span>%</span>
                                  </div>
                                </div>
                                <p className="whitespace-nowrap tracking-tight text-xs">
                                  of {funnelStageLabel} budget
                                </p>
                                {platform?.ad_sets?.length > 1 &&
                                  campaignFormData?.campaign_budget?.level ===
                                    "Adset level" && (
                                    <div
                                      className="flex items-center gap-1 w-full md:w-auto"
                                      style={{
                                        flex: "1 1 0",
                                        minWidth: 0,
                                        overflow: "visible",
                                        maxWidth: "100%",
                                      }}
                                    >
                                      <label
                                        htmlFor={`${stage.name}-${platform?.outlet}`}
                                        className="relative inline-block h-5 w-10 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-blue-500 peer-checked:bg-blue-500"
                                      >
                                        <input
                                          type="checkbox"
                                          id={`${stage.name}-${platform?.outlet}`}
                                          disabled={validatedStages[stageName]}
                                          className="peer sr-only"
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              handleAutoSplitBudget(
                                                stage,
                                                platform?.channel,
                                                platform?.outlet
                                              );
                                            } else {
                                              handleResetBudget(
                                                stage,
                                                platform?.channel,
                                                platform?.outlet
                                              );
                                            }
                                          }}
                                        />
                                        <span className="absolute inset-y-0 left-0 w-5 h-5 rounded-full bg-white transition-transform duration-200 transform peer-checked:translate-x-5"></span>
                                      </label>
                                      <div
                                        className="text-[#061237] text-nowrap text-xs font-semibold tracking-tighter"
                                        style={{
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: "100%",
                                          minWidth: 0,
                                          flex: "1 1 0",
                                        }}
                                        title="Auto-split budget based on audience size"
                                      >
                                        Auto-split budget based on audience size
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div className="pb-4 space-y-3" id="setContainer">
                            {campaignFormData?.campaign_budget?.level === "Adset level" && platform?.ad_sets?.map((ad_set, adSetIdx) => {
                                const getAdSetBudget = (adSet: any): string => {
                                  return adSet?.budget?.fixed_value &&
                                    platform.ad_sets?.length
                                    ? Number(
                                        adSet?.budget?.fixed_value
                                      ).toFixed(2)
                                    : "0";
                                };
                                const adSetPercentage =
                                  (ad_set?.budget?.percentage_value ||
                                    platform?.budget?.fixed_value) &&
                                  Number(getAdSetBudget(ad_set))
                                    ? (
                                        (Number(getAdSetBudget(ad_set)) /
                                          Number(
                                            platform?.budget?.fixed_value
                                          )) *
                                        100
                                      ).toFixed(1)
                                    : "0";
                                const getAdSetExtraBudget = (
                                  adSet: any,
                                  extraIndex: number
                                ): string => {
                                  return adSet?.extra_audiences?.[extraIndex]
                                    ?.budget?.fixed_value
                                    ? Number(
                                        adSet?.extra_audiences[extraIndex]
                                          ?.budget?.fixed_value
                                      ).toFixed(2)
                                    : "0";
                                };
                                const getAdSetExtraBudgetPercentage = (
                                  adSet: any,
                                  extraIndex: number
                                ): string => {
                                  const extraBudget =
                                    adSet?.extra_audiences?.[extraIndex]?.budget
                                      ?.fixed_value || 0;
                                  const platformBudget =
                                    platform?.budget?.fixed_value || 0;
                                  if (Number(platformBudget) > 0) {
                                    return (
                                      (Number(extraBudget) /
                                        Number(platformBudget)) *
                                      100
                                    ).toFixed(1);
                                  }
                                  return "0";
                                };
                                return (
                                  <div
                                    className="ml-[10px] relative flex items-center"
                                    key={adSetIdx}
                                    style={{ minHeight: 40 }}
                                  >
                                    {campaignFormData?.campaign_budget
                                      ?.level === "Adset level" && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          left: 0,
                                          top: "50%",
                                          transform: "translateY(-50%)",
                                          width: 0,
                                          height: 0,
                                          zIndex: 1,
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            width: "20px",
                                            height: "2px",
                                            background: "#D1D5DB",
                                            transform: "translateY(-50%)",
                                          }}
                                        />
                                      </div>
                                    )}
                                    <div
                                      style={{
                                        marginLeft: "20px",
                                        width: "100%",
                                      }}
                                    >
                                      <div className="flex gap-2 items-end">
                                        <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                          <div className="flex justify-between w-full px-3 items-center">
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs">
                                                {ad_set?.name ||
                                                  "Unnamed Ad Set"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[140px] h-[40px] rounded-[8px] items-center gap-1">
                                          <div className="flex justify-between w-full px-3 items-center">
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs">
                                                {ad_set?.audience_type || "N/A"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                          <div className="flex justify-between w-full px-3 items-center">
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs">
                                                {ad_set?.size
                                                  ? Number(
                                                      ad_set?.size
                                                    ).toLocaleString()
                                                  : "N/A"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-start flex-col gap-1">
                                          <h2 className="text-center font-bold text-xs">
                                            Budget
                                          </h2>
                                          <div className="flex items-center justify-between px-3 w-[140px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                                            <p className="font-bold text-xs">
                                              {getCurrencySymbol(
                                                campaignFormData
                                                  ?.campaign_budget?.currency
                                              )}
                                            </p>
                                            <input
                                              type="text"
                                              className="w-full px-2 focus:outline-none text-xs"
                                              value={formatNumberWithCommas(
                                                getAdSetBudget(ad_set)
                                              )}
                                              disabled={
                                                validatedStages[stageName]
                                              }
                                              onChange={(e) => {
                                                const inputValue =
                                                  e.target.value.replace(
                                                    /,/g,
                                                    ""
                                                  );
                                                const newBudget = inputValue;
                                                setCampaignFormData(
                                                  (prevData) => {
                                                    const isBottomUp = prevData.campaign_budget?.budget_type === "bottom_up";
                                                    const channelTypes = mediaTypes;
                                                    const updatedChannelMix =
                                                      prevData.channel_mix.map(
                                                        (ch) => {
                                                          if (
                                                            ch.funnel_stage ===
                                                            stageName
                                                          ) {
                                                            const updatedChannelType =
                                                              channelTypes.find(
                                                                (type) =>
                                                                  ch[
                                                                    type
                                                                  ]?.some(
                                                                    (p) =>
                                                                      p.platform_name ===
                                                                      platform.outlet
                                                                  )
                                                              );
                                                            if (
                                                              updatedChannelType
                                                            ) {
                                                              const updatedPlatforms = ch[
                                                                    updatedChannelType
                                                                  ].map((p) => {
                                                                    if (
                                                                      p.platform_name ===
                                                                      platform.outlet
                                                                    ) {
                                                                      const updatedAdSets =
                                                                        p.ad_sets?.map(
                                                                          (
                                                                            adSet,
                                                                            adSetIdx2
                                                                          ) => {
                                                                            if (
                                                                              adSetIdx2 ===
                                                                              adSetIdx
                                                                            ) {
                                                                              let totalAdSetBudget = 0;
                                                                              const tempAdSets =
                                                                                p.ad_sets?.map(
                                                                                  (
                                                                                    a,
                                                                                    idx
                                                                                  ) => {
                                                                                    if (
                                                                                      idx ===
                                                                                      adSetIdx2
                                                                                    ) {
                                                                                      totalAdSetBudget +=
                                                                                        Number(
                                                                                          newBudget
                                                                                        ) ||
                                                                                        0;
                                                                                      return {
                                                                                        ...a,
                                                                                        budget:
                                                                                          {
                                                                                            fixed_value:
                                                                                              newBudget,
                                                                                            percentage_value:
                                                                                              p
                                                                                                .budget
                                                                                                ?.fixed_value
                                                                                                ? (
                                                                                                    (Number(
                                                                                                      newBudget
                                                                                                    ) /
                                                                                                      Number(
                                                                                                        p
                                                                                                          .budget
                                                                                                          .fixed_value
                                                                                                      )) *
                                                                                                    100
                                                                                                  ).toFixed(
                                                                                                    2
                                                                                                  )
                                                                                                : "0",
                                                                                          },
                                                                                      };
                                                                                    } else {
                                                                                      totalAdSetBudget +=
                                                                                        Number(
                                                                                          a
                                                                                            .budget
                                                                                            ?.fixed_value
                                                                                        ) ||
                                                                                        0;
                                                                                      if (!isBottomUp && a.extra_audiences) {
                                                                                        totalAdSetBudget += a.extra_audiences.reduce(
                                                                                          (acc, extra) => acc + (Number(extra?.budget?.fixed_value) || 0),
                                                                                          0
                                                                                        );
                                                                                      }
                                                                                      return a;
                                                                                    }
                                                                                  }
                                                                                ) ||
                                                                                [];
                                                                              
                                                                              if (isBottomUp) {
                                                                                tempAdSets.forEach((adSet) => {
                                                                                  if (adSet.extra_audiences) {
                                                                                    totalAdSetBudget += adSet.extra_audiences.reduce(
                                                                                      (acc, extra) => acc + (Number(extra?.budget?.fixed_value) || 0),
                                                                                      0
                                                                                    );
                                                                                  }
                                                                                });
                                                                              }
                                                                              
                                                                              if (!isBottomUp && totalAdSetBudget > Number(p.budget?.fixed_value || 0)) {
                                                                                toast.error(
                                                                                  "The sum of all ad set budgets cannot exceed the platform budget.",
                                                                                  {
                                                                                    position:
                                                                                      "bottom-right",
                                                                                    theme:
                                                                                      "colored",
                                                                                    toastId:
                                                                                      "sum",
                                                                                  }
                                                                                );
                                                                                return adSet;
                                                                              }
                                                                              
                                                                              const newPlatformBudget = isBottomUp ? totalAdSetBudget : Number(p.budget?.fixed_value || 0);
                                                                              const updatedAdSet = {
                                                                                ...tempAdSets[adSetIdx2],
                                                                                budget: {
                                                                                  ...tempAdSets[adSetIdx2].budget,
                                                                                  percentage_value: isBottomUp && newPlatformBudget > 0
                                                                                    ? ((Number(newBudget) / newPlatformBudget) * 100).toFixed(2)
                                                                                    : tempAdSets[adSetIdx2].budget.percentage_value,
                                                                                },
                                                                              };
                                                                              return updatedAdSet;
                                                                            }
                                                                            return adSet;
                                                                          }
                                                                        );
                                                                      
                                                                      if (isBottomUp) {
                                                                        let totalAdSetAndExtraBudget = 0;
                                                                        updatedAdSets.forEach((adSet) => {
                                                                          totalAdSetAndExtraBudget += Number(adSet?.budget?.fixed_value || 0);
                                                                          if (adSet.extra_audiences) {
                                                                            totalAdSetAndExtraBudget += adSet.extra_audiences.reduce(
                                                                              (acc, extra) => acc + (Number(extra?.budget?.fixed_value) || 0),
                                                                              0
                                                                            );
                                                                          }
                                                                        });
                                                                        
                                                                        const newPlatformBudget = totalAdSetAndExtraBudget;
                                                                        
                                                                        const updatedAdSetsWithPercentages = updatedAdSets.map((adSet) => ({
                                                                          ...adSet,
                                                                          budget: {
                                                                            ...adSet.budget,
                                                                            percentage_value: newPlatformBudget > 0
                                                                              ? ((Number(adSet.budget?.fixed_value || 0) / newPlatformBudget) * 100).toFixed(2)
                                                                              : "0",
                                                                          },
                                                                          extra_audiences: (adSet.extra_audiences || []).map((extra) => ({
                                                                            ...extra,
                                                                            budget: {
                                                                              ...extra.budget,
                                                                              percentage_value: newPlatformBudget > 0
                                                                                ? ((Number(extra.budget?.fixed_value || 0) / newPlatformBudget) * 100).toFixed(2)
                                                                                : "0",
                                                                            },
                                                                          })),
                                                                        }));
                                                                        
                                                                        const platformResult = {
                                                                          ...p,
                                                                          budget: {
                                                                            ...p.budget,
                                                                            fixed_value: newPlatformBudget.toString(),
                                                                          },
                                                                          ad_sets: updatedAdSetsWithPercentages,
                                                                        };
                                                                        return platformResult;
                                                                      }
                                                                      
                                                                      const platformResult = {
                                                                        ...p,
                                                                        ad_sets: updatedAdSets || [],
                                                                      };
                                                                      return platformResult;
                                                                    }
                                                                    return p;
                                                                  });
                                                              
                                                              if (isBottomUp) {
                                                                let totalPlatformBudgets = 0;
                                                                for (const channelType of channelTypes) {
                                                                  if (ch[channelType]) {
                                                                    const platformsToSum = channelType === updatedChannelType 
                                                                      ? updatedPlatforms 
                                                                      : ch[channelType];
                                                                    totalPlatformBudgets += platformsToSum.reduce((acc, pl) => {
                                                                      return acc + (Number(pl?.budget?.fixed_value) || 0);
                                                                    }, 0);
                                                                  }
                                                                }
                                                                
                                                                const updatedPlatformsWithPercentages = updatedPlatforms.map((pl) => ({
                                                                  ...pl,
                                                                  budget: {
                                                                    ...pl.budget,
                                                                    percentage_value: totalPlatformBudgets > 0
                                                                      ? ((Number(pl.budget?.fixed_value || 0) / totalPlatformBudgets) * 100).toFixed(1)
                                                                      : "",
                                                                  },
                                                                }));
                                                                
                                                                const stageResult = {
                                                                  ...ch,
                                                                  stage_budget: {
                                                                    ...ch.stage_budget,
                                                                    fixed_value: totalPlatformBudgets.toString(),
                                                                    percentage_value: "",
                                                                  },
                                                                  [updatedChannelType]: updatedPlatformsWithPercentages,
                                                                };
                                                                return stageResult;
                                                              }
                                                              
                                                              const stageResult = {
                                                                ...ch,
                                                                [updatedChannelType]: updatedPlatforms,
                                                              };
                                                              return stageResult;
                                                            }
                                                          }
                                                          return ch;
                                                        }
                                                      );
                                                      
                                                      if (isBottomUp) {
                                                        const newNetTotal = updatedChannelMix.reduce(
                                                          (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
                                                          0
                                                        );
                                                        const result = {
                                                          ...prevData,
                                                          channel_mix: updatedChannelMix,
                                                          campaign_budget: {
                                                            ...prevData.campaign_budget,
                                                            amount:
                                                              campaignBudgetType === "gross"
                                                                ? calculateGrossFromNet(newNetTotal, fees).toString()
                                                                : newNetTotal.toString(),
                                                          },
                                                        };
                                                        return result;
                                                      }
                                                      
                                                    const result = {
                                                      ...prevData,
                                                      channel_mix: updatedChannelMix,
                                                    };
                                                    return result;
                                                  }
                                                );
                                              }}
                                            />
                                            <span className="text-xs">
                                              {
                                                campaignFormData
                                                  ?.campaign_budget?.currency
                                              }
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-start flex-col gap-1">
                                          <h2 className="text-center font-bold text-xs">
                                            Percentage
                                          </h2>
                                          <div className="flex items-center gap-1">
                                            <div className="bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                                              <div className="flex items-center gap-1">
                                                <p className="text-xs">
                                                  {formatPercent(
                                                    adSetPercentage
                                                  )}
                                                </p>
                                                <span className="text-xs">
                                                  %
                                                </span>
                                              </div>
                                            </div>
                                            <p className="whitespace-nowrap tracking-tight text-xs">
                                              of {platform?.outlet} budget
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      {ad_set?.extra_audiences?.length > 0 &&
                                        ad_set?.extra_audiences?.map(
                                          (addSet, extraIdx) => (
                                            <div
                                              key={extraIdx}
                                              className="flex gap-2 items-end ml-[12px] mt-[10px] relative"
                                              style={{ minHeight: 40 }}
                                            >
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  left: "-20px",
                                                  top: "50%",
                                                  transform: "translateY(-50%)",
                                                  width: 0,
                                                  height: 0,
                                                  zIndex: 1,
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    position: "absolute",
                                                    left: 0,
                                                    top: "50%",
                                                    width: "20px",
                                                    height: "2px",
                                                    background: "#D1D5DB",
                                                    transform:
                                                      "translateY(-50%)",
                                                  }}
                                                />
                                              </div>
                                              <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                                <div className="flex justify-between w-full px-3 items-center">
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-xs">
                                                      {addSet?.name ||
                                                        "Unnamed Extra Audience"}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[140px] h-[40px] rounded-[8px] items-center gap-1">
                                                <div className="flex justify-between w-full px-3 items-center">
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-xs">
                                                      {addSet?.audience_type ||
                                                        "N/A"}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                                <div className="flex justify-between w-full px-3 items-center">
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-xs">
                                                      {addSet?.size
                                                        ? Number(
                                                            addSet?.size
                                                          ).toLocaleString()
                                                        : "N/A"}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-start flex-col gap-1">
                                                <h2 className="text-center font-bold text-xs">
                                                  Budget
                                                </h2>
                                                <div className="flex items-center justify-between px-3 w-[140px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                                                  <p className="font-bold text-xs">
                                                    {getCurrencySymbol(
                                                      campaignFormData
                                                        ?.campaign_budget
                                                        ?.currency
                                                    )}
                                                  </p>
                                                  <input
                                                    type="text"
                                                    className="w-full px-2 focus:outline-none text-xs"
                                                    disabled={
                                                      validatedStages[stageName]
                                                    }
                                                    value={formatNumberWithCommas(
                                                      getAdSetExtraBudget(
                                                        ad_set,
                                                        extraIdx
                                                      )
                                                    )}
                                                    onChange={(e) => {
                                                      const inputValue =
                                                        e.target.value.replace(
                                                          /,/g,
                                                          ""
                                                        );
                                                      const newBudget =
                                                        inputValue;
                                                      setCampaignFormData(
                                                        (prevData) => {
                                                          const isBottomUp = prevData.campaign_budget?.budget_type === "bottom_up";
                                                          const updatedChannelMix =
                                                            prevData.channel_mix.map(
                                                              (ch) => {
                                                                if (
                                                                  ch.funnel_stage ===
                                                                  stageName
                                                                ) {
                                                                  const updatedChannelType =
                                                                    channelTypes.find(
                                                                      (type) =>
                                                                        ch[
                                                                          type
                                                                        ]?.some(
                                                                          (p) =>
                                                                            p.platform_name ===
                                                                            platform.outlet
                                                                        )
                                                                    );
                                                                  if (
                                                                    updatedChannelType
                                                                  ) {
                                                                    const updatedPlatforms = ch[
                                                                          updatedChannelType
                                                                        ].map(
                                                                          (
                                                                            p
                                                                          ) => {
                                                                            if (
                                                                              p.platform_name ===
                                                                              platform.outlet
                                                                            ) {
                                                                              const updatedAdSets =
                                                                                p.ad_sets?.map(
                                                                                  (
                                                                                    adSet,
                                                                                    adSetIdx2
                                                                                  ) => {
                                                                                    if (
                                                                                      adSetIdx2 ===
                                                                                      adSetIdx
                                                                                    ) {
                                                                                      const updatedExtraAudiences =
                                                                                        adSet.extra_audiences?.map(
                                                                                          (
                                                                                            extra,
                                                                                            exIdx
                                                                                          ) => {
                                                                                            if (
                                                                                              exIdx ===
                                                                                              extraIdx
                                                                                            ) {
                                                                                              let totalAdSetBudget = 0;
                                                                                              p.ad_sets?.forEach((aSet) => {
                                                                                                totalAdSetBudget += Number(aSet?.budget?.fixed_value || 0);
                                                                                              });
                                                                                              
                                                                                              const tempExtraAudiences =
                                                                                                adSet.extra_audiences?.map(
                                                                                                  (
                                                                                                    ea,
                                                                                                    idx
                                                                                                  ) => {
                                                                                                    if (
                                                                                                      idx ===
                                                                                                      exIdx
                                                                                                    ) {
                                                                                                      totalAdSetBudget +=
                                                                                                        Number(
                                                                                                          newBudget
                                                                                                        ) ||
                                                                                                        0;
                                                                                                      return {
                                                                                                        ...ea,
                                                                                                        budget:
                                                                                                          {
                                                                                                            fixed_value:
                                                                                                              newBudget,
                                                                                                            percentage_value:
                                                                                                              p
                                                                                                                .budget
                                                                                                                ?.fixed_value
                                                                                                                ? (
                                                                                                                    (Number(
                                                                                                                      newBudget
                                                                                                                    ) /
                                                                                                                      Number(
                                                                                                                        p
                                                                                                                          .budget
                                                                                                                          .fixed_value
                                                                                                                      )) *
                                                                                                                    100
                                                                                                                  ).toFixed(
                                                                                                                    2
                                                                                                                  )
                                                                                                                : "0",
                                                                                                          },
                                                                                                      };
                                                                                                    } else {
                                                                                                      totalAdSetBudget +=
                                                                                                        Number(
                                                                                                          ea
                                                                                                            .budget
                                                                                                            ?.fixed_value
                                                                                                        ) ||
                                                                                                        0;
                                                                                                      return ea;
                                                                                                    }
                                                                                                  }
                                                                                                ) ||
                                                                                                [];
                                                                                              
                                                                                              if (!isBottomUp) {
                                                                                                p.ad_sets?.forEach((aSet, idx) => {
                                                                                                  if (aSet.extra_audiences && idx !== adSetIdx2) {
                                                                                                    totalAdSetBudget += aSet.extra_audiences.reduce(
                                                                                                      (acc, extra) => acc + (Number(extra?.budget?.fixed_value) || 0),
                                                                                                      0
                                                                                                    );
                                                                                                  }
                                                                                                });
                                                                                              }
                                                                                              
                                                                                              if (!isBottomUp && totalAdSetBudget > Number(p.budget?.fixed_value || 0)) {
                                                                                                toast.error(
                                                                                                  "Total budget (ad sets + extras) cannot exceed platform budget",
                                                                                                  {
                                                                                                    toastId:
                                                                                                      "extraToast",
                                                                                                    position:
                                                                                                      "bottom-right",
                                                                                                    theme:
                                                                                                      "colored",
                                                                                                  }
                                                                                                );
                                                                                                return extra;
                                                                                              }
                                                                                              
                                                                                              const updatedExtra = tempExtraAudiences[exIdx];
                                                                                              return updatedExtra;
                                                                                            }
                                                                                            return extra;
                                                                                          }
                                                                                        ) ||
                                                                                        [];
                                                                                      const adSetResult = {
                                                                                        ...adSet,
                                                                                        extra_audiences: updatedExtraAudiences,
                                                                                      };
                                                                                      return adSetResult;
                                                                                    }
                                                                                    return adSet;
                                                                                  }
                                                                                );
                                                                              
                                                                              if (isBottomUp) {
                                                                                let totalPlatformBudget = 0;
                                                                                updatedAdSets.forEach((aSet) => {
                                                                                  const adSetBudget = Number(aSet?.budget?.fixed_value || 0);
                                                                                  totalPlatformBudget += adSetBudget;
                                                                                  if (aSet.extra_audiences && aSet.extra_audiences.length > 0) {
                                                                                    const extrasTotal = aSet.extra_audiences.reduce(
                                                                                      (acc, ext) => acc + (Number(ext?.budget?.fixed_value || 0)),
                                                                                      0
                                                                                    );
                                                                                    totalPlatformBudget += extrasTotal;
                                                                                  }
                                                                                });
                                                                                
                                                                                const updatedAdSetsWithPercentages = updatedAdSets.map((aSet) => ({
                                                                                  ...aSet,
                                                                                  budget: {
                                                                                    ...aSet.budget,
                                                                                    percentage_value: totalPlatformBudget > 0
                                                                                      ? ((Number(aSet.budget?.fixed_value || 0) / totalPlatformBudget) * 100).toFixed(2)
                                                                                      : "0",
                                                                                  },
                                                                                  extra_audiences: aSet.extra_audiences?.map((ext) => ({
                                                                                    ...ext,
                                                                                    budget: {
                                                                                      ...ext.budget,
                                                                                      percentage_value: totalPlatformBudget > 0
                                                                                        ? ((Number(ext.budget?.fixed_value || 0) / totalPlatformBudget) * 100).toFixed(2)
                                                                                        : "0",
                                                                                    },
                                                                                  })),
                                                                                }));
                                                                                
                                                                                const platformResult = {
                                                                                  ...p,
                                                                                  budget: {
                                                                                    ...p.budget,
                                                                                    fixed_value: totalPlatformBudget.toString(),
                                                                                  },
                                                                                  ad_sets: updatedAdSetsWithPercentages,
                                                                                };
                                                                                return platformResult;
                                                                              }
                                                                              
                                                                              const platformResult = {
                                                                                ...p,
                                                                                ad_sets: updatedAdSets,
                                                                              };
                                                                              return platformResult;
                                                                            }
                                                                            return p;
                                                                          }
                                                                        );
                                                                      
                                                                      if (isBottomUp) {
                                                                        let totalPlatformBudgets = 0;
                                                                        for (const channelType of channelTypes) {
                                                                          if (ch[channelType]) {
                                                                            const platformsToSum = channelType === updatedChannelType 
                                                                              ? updatedPlatforms 
                                                                              : ch[channelType];
                                                                            totalPlatformBudgets += platformsToSum.reduce((acc, pl) => {
                                                                              return acc + (Number(pl?.budget?.fixed_value) || 0);
                                                                            }, 0);
                                                                          }
                                                                        }
                                                                        
                                                                        const updatedPlatformsWithPercentages = updatedPlatforms.map((pl) => ({
                                                                          ...pl,
                                                                          budget: {
                                                                            ...pl.budget,
                                                                            percentage_value: totalPlatformBudgets > 0
                                                                              ? ((Number(pl.budget?.fixed_value || 0) / totalPlatformBudgets) * 100).toFixed(1)
                                                                              : "",
                                                                          },
                                                                        }));
                                                                        
                                                                        const stageResult = {
                                                                          ...ch,
                                                                          stage_budget: {
                                                                            ...ch.stage_budget,
                                                                            fixed_value: totalPlatformBudgets.toString(),
                                                                            percentage_value: "",
                                                                          },
                                                                          [updatedChannelType]: updatedPlatformsWithPercentages,
                                                                        };
                                                                        return stageResult;
                                                                      }
                                                                      
                                                                      const stageResult = {
                                                                        ...ch,
                                                                        [updatedChannelType]: updatedPlatforms,
                                                                      };
                                                                      return stageResult;
                                                                  }
                                                                }
                                                                return ch;
                                                              }
                                                            );
                                                          
                                                          if (isBottomUp) {
                                                            const newNetTotal = updatedChannelMix.reduce(
                                                              (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
                                                              0
                                                            );
                                                            const result = {
                                                              ...prevData,
                                                              channel_mix: updatedChannelMix,
                                                              campaign_budget: {
                                                                ...prevData.campaign_budget,
                                                                amount:
                                                                  campaignBudgetType === "gross"
                                                                    ? calculateGrossFromNet(newNetTotal, fees).toString()
                                                                    : newNetTotal.toString(),
                                                              },
                                                            };
                                                            return result;
                                                          }
                                                          
                                                          const result = {
                                                            ...prevData,
                                                            channel_mix: updatedChannelMix,
                                                          };
                                                          return result;
                                                        }
                                                      );
                                                    }}
                                                  />
                                                  <span className="text-xs">
                                                    {
                                                      campaignFormData
                                                        ?.campaign_budget
                                                        ?.currency
                                                    }
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex items-start flex-col gap-1">
                                                <h2 className="text-center font-bold text-xs">
                                                  Percentage
                                                </h2>
                                                <div className="flex items-center gap-1">
                                                  <div className="bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                                                    <div className="flex items-center gap-1">
                                                      <p className="text-xs">
                                                        {formatPercent(
                                                          getAdSetExtraBudgetPercentage(
                                                            ad_set,
                                                            extraIdx
                                                          )
                                                        )}
                                                      </p>
                                                      <span className="text-xs">
                                                        %
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <p className="whitespace-nowrap tracking-tight text-xs">
                                                    of {platform?.outlet} budget
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                 
                    {/* <div className="flex w-full my-4 justify-end items-center">
                      <Button
                        text={validatedStages[stage.name] ? "Edit" : "Validate"}
                        onClick={
                          validatedStages[stage.name]
                            ? () =>
                                setValidatedStages((prev) => ({
                                  ...prev,
                                  [stage.name]: false,
                                }))
                            : () => handleValidateClick(stage.name)
                        }
                        disabled={!isButtonEnabled(stage.name)}
                        variant="primary"
                        className="h-[40px] rounded-md px-4 py-1"
                      />
                    </div> */}
                  
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConfiguredSetPage;
