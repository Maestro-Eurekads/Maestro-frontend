import { getCurrencySymbol } from "components/data";
import { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";
import info from "../../public/info-circle.svg";

interface Campaign {
  channel_mix?: Array<Record<string, any>>;
  campaign_budget?: {
    amount?: string;
    currency?: string;
    budget_type?: string;
    sub_budget_type?: string;
    budget_fees?: Array<{ value: number }>;
  };
  agency_id?: string | number;
}

const General = ({
  campaign = {} as Campaign,
  loading,
  isLoadingCampaign,
  clientId,
}: {
  campaign?: Campaign;
  loading: boolean;
  isLoadingCampaign: boolean;
  clientId?: string;
}) => {
  // Calculate total campaign budget using the same logic as CampaignBudget component
  const calculateTotalBudget = () => {
    if (!campaign?.campaign_budget) return 0;

    const budgetAmount = Number(campaign?.campaign_budget?.amount) || 0;
    const budgetType = campaign?.campaign_budget?.budget_type; // "top_down" or "bottom_up"
    const subBudgetType = campaign?.campaign_budget?.sub_budget_type; // "gross" or "net"
    const fees = campaign?.campaign_budget?.budget_fees || [];

    if (budgetType === "bottom_up") {
      // For bottom-up: Total campaign budget is the sum of all stage budgets
      const stageBudgetsSum =
        campaign?.channel_mix?.reduce(
          (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
          0
        ) || 0;

      if (subBudgetType === "gross") {
        // If gross, the stage budgets sum is the gross amount
        return stageBudgetsSum;
      } else if (subBudgetType === "net") {
        // If net, gross = net (stage budgets sum) + fees
        const totalFees = fees.reduce(
          (total, fee) => total + Number(fee.value || 0),
          0
        );
        return Number((stageBudgetsSum + totalFees).toFixed(2));
      }
    } else {
      // For top-down: Total campaign budget is the entered amount
      if (subBudgetType === "gross") {
        return budgetAmount;
      } else if (subBudgetType === "net") {
        const totalFees = fees.reduce(
          (total, fee) => total + Number(fee.value || 0),
          0
        );
        return Number((budgetAmount + totalFees).toFixed(2));
      }
    }
    return budgetAmount; // fallback to original amount
  };

  const budget = calculateTotalBudget();
  const currency = getCurrencySymbol(campaign?.campaign_budget?.currency) ?? "";

  // Extract and calculate total impressions and average CPM
  const { totalImpressions, averageCpm } = useMemo(() => {
    let impressions = 0;
    let cpmValues = [];

    const parseChannels = (channels) => {
      channels.forEach((platform) => {
        const kpi = platform?.kpi;
        if (kpi) {
          if (kpi?.impressions) impressions += kpi.impressions;
          if (kpi?.cpm) cpmValues.push(kpi.cpm);
        }
      });
    };

    const channelMix = Array.isArray(campaign?.channel_mix)
      ? campaign.channel_mix
      : [];
    channelMix.forEach((channel) => {
      const platformTypes = [
        "social_media",
        "display_networks",
        "search_engines",
        "streaming",
        "ooh",
        "broadcast",
        "messaging",
        "print",
        "e_commerce",
        "in_game",
        "mobile",
      ];

      platformTypes.forEach((channelType) => {
        if (Array.isArray(channel[channelType])) {
          parseChannels(channel[channelType]);
        }
      });
    });

    const avgCpm =
      cpmValues.length > 0
        ? (
            cpmValues.reduce((sum, value) => sum + value, 0) / cpmValues.length
          ).toFixed(2)
        : "0.00";

    return {
      totalImpressions: impressions,
      averageCpm: avgCpm,
    };
  }, [campaign]);

  const formatNumber = (value) => {
    if (!value) return "0";
    // For impressions, ensure they are displayed as whole numbers
    const roundedValue = Math.round(Number(value));
    return Intl.NumberFormat("en-US").format(roundedValue);
  };

  return (
    <div className="flex flex-col justify-between w-full h-[153px] bg-white border border-[rgba(49,117,255,0.3)] rounded-[12px] box-border p-[20px] shadow-[0px_4px_14px_rgba(0,38,116,0.15)]">
      {loading || isLoadingCampaign ? (
        <Skeleton height={20} width={100} />
      ) : (
        <h3 className="font-medium text-[24px] leading-[32px] text-black">
          General
        </h3>
      )}

      <div className="flex items-center justify-between">
        {/* Total Budget */}
        <div>
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={100} />
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium text-[12px] leading-[16px] text-[#667085]">
                Total Budget
              </p>
              <Image src={info} alt="info" />
            </div>
          )}
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={200} />
          ) : (
            <div className="flex items-end gap-2">
              <h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
                {currency} {formatNumber(budget)}
              </h1>
            </div>
          )}
        </div>

        {/* Total Impressions */}
        <div>
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={100} />
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium text-[12px] leading-[16px] text-[#667085]">
                Total Impressions
              </p>
              <Image src={info} alt="info" />
            </div>
          )}
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={200} />
          ) : (
            <div className="flex items-end gap-2">
              <h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
                {formatNumber(totalImpressions)}
              </h1>
            </div>
          )}
        </div>

        {/* CPM */}
        <div>
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={100} />
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium text-[12px] leading-[16px] text-[#667085]">
                CPM
              </p>
              <Image src={info} alt="info" />
            </div>
          )}
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={200} />
          ) : (
            <div className="flex items-end gap-2">
              <h1 className="font-medium text-[32px] leading-[49px] text-[#101828] whitespace-nowrap">
                {currency} {formatNumber(averageCpm)}
              </h1>
            </div>
          )}
        </div>

        {/* Agency ID */}
        <div>
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={100} />
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium text-[12px] leading-[16px] text-[#667085]">
                Client ID
              </p>
              <Image src={info} alt="info" />
            </div>
          )}
          {loading || isLoadingCampaign ? (
            <Skeleton height={20} width={200} />
          ) : (
            <div className="flex items-end gap-2">
              <h1 className="font-medium text-[16px] leading-[24px] text-[#101828] whitespace-nowrap">
                {clientId || "N/A"}
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default General;
