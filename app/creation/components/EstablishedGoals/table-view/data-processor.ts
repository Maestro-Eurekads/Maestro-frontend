import moment from "moment";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import { tableHeaders } from "utils/tableHeaders";

export function extractPlatforms(data) {
  const platforms = {};
  const headers =
    tableHeaders[data?.campaign_objective] || tableHeaders["Brand Awareness"];

  data?.channel_mix?.length > 0 &&
    data.channel_mix.forEach((stage) => {
      const stageName = stage?.funnel_stage;
      platforms[stageName] = platforms[stageName] || [];
      [
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
      ]?.forEach((channelType) => {
        stage[channelType]?.forEach((platform) => {
          const platformName = platform.platform_name;
          const existingPlatform = platforms[stageName].find(
            (p) => p.name === platformName
          );

          if (!existingPlatform) {
            // Find platform style or use random one
            const style =
              platformStyles.find((style) => style.name === platformName) ||
              platformStyles[Math.floor(Math.random() * platformStyles.length)];

            // Map headers to values
            const rowData = mapHeadersToValues(headers, platform);

            // Create platform object with all necessary data
            platforms[stageName].push(
              createPlatformObject(
                platformName,
                style,
                platform,
                channelType,
                rowData,
                data
              )
            );
          }
        });
      });
    });

  return platforms;
}

function mapHeadersToValues(headers, platform) {
  return headers
    ?.filter((h) => h?.showInput)
    .reduce((acc, header) => {
      const key = formatHeaderKey(header.name);
      acc[key] = platform?.["kpi"]?.[key] || (header.showInput ? "" : "-");
      return acc;
    }, {});
}

function formatHeaderKey(headerName) {
  return headerName
    .replace(/ /g, "_")
    .replace(/\//g, "")
    .replace(/-/g, "_")
    .toLowerCase();
}

function createPlatformObject(
  platformName,
  style,
  platform,
  channelType,
  rowData,
  data
) {
  return {
    icon: getPlatformIcon(platformName),
    name: platformName,
    color: style?.color,
    audience:
      platform?.ad_sets &&
      platform?.ad_sets.length > 0 &&
      platform?.ad_sets[0]?.audience_type,
    start_date: platform.campaign_start_date
      ? moment(platform.campaign_start_date).format("DD/MM/YYYY")
      : moment(data.campaign_timeline_start_date).format("DD/MM/YYYY"),
    end_date: platform.campaign_end_date
      ? moment(platform.campaign_end_date).format("DD/MM/YYYY")
      : moment(data.campaign_timeline_end_date).format("DD/MM/YYYY"),
    audience_size: platform?.ad_sets?.reduce((total, adSet) => {
      const baseSize = Number(adSet.size) || 0;
      const extraSize = (adSet.extra_audiences || []).reduce(
        (subTotal, extra) => subTotal + (Number(extra.size) || 0),
        0
      );
      return total + baseSize + extraSize;
    }, 0),
    budget_size:
      Number(platform?.budget?.fixed_value) > 0
        ? `${Number(platform?.budget?.fixed_value)}`
        : 0,
    impressions: platform.impressions,
    reach: platform.reach,
    adsets: platform?.ad_sets?.length,
    ad_sets: platform?.ad_sets?.map((ad) => {
      const baseSize = Number(ad.size) || 0;
      const extraSize = (ad.extra_audiences || []).reduce(
        (sum, extra) => sum + (Number(extra.size) || 0),
        0
      );
      return {
        ...ad,
        // size: baseSize + extraSize,
        budget:
          ad?.budget === null || ad?.budget === undefined
            ? { fixed_value: platform?.budget?.fixed_value }
            : ad?.budget,
      };
    }),
    channel_name: channelType,
    kpi: platform?.kpi,
    ...rowData,
  };
}

export async function extractObjectives(data) {
  const result = {};

  data.channel_mix &&
    data.channel_mix?.length > 0 &&
    data.channel_mix.forEach((channel) => {
      const funnelStage = channel.funnel_stage;
      if (!result[funnelStage]) {
        result[funnelStage] = [];
      }

      mediaTypes.forEach((mediaType) => {
        if (channel[mediaType]) {
          channel[mediaType].forEach((media) => {
            if (
              media.objective_type &&
              !result[funnelStage].includes(media.objective_type)
            ) {
              result[funnelStage].push(media.objective_type);
            } else {
              if (!result[funnelStage].includes("Brand Awareness")) {
                result[funnelStage].push("Brand Awareness");
              }
            }
          });
        }
      });
    });

  return result as {
    [key: string]: string[];
  };
}

export async function getFilteredMetrics(selectedHeaders) {
  const defaultHeaders = [
    "Channel",
    "AdSets",
    "Audience",
    "Start Date",
    "End Date",
    "Audience Size",
    "Budget Size",
    "CPM",
    "Impressions",
    "Frequency",
    "Reach",
    "GRP",
  ];

  const result = {};

  Object.keys(selectedHeaders).forEach((stage) => {
    const objectives = selectedHeaders[stage];
    objectives?.forEach((objective: string) => {
      const availableMetrics = tableHeaders[objective] || [];

      // Ensure result[stage] accumulates metrics for all objectives
      result[stage] = result[stage] || [];
      result[stage].push(
        ...availableMetrics
          ?.filter((metric: { name: string }) =>
            !defaultHeaders.includes(metric.name)
          )
          .map((metric: { [key: string]: any }) => ({
            ...metric,
            obj: objective, // Add the new property 'obj' with the current objective
          }))
      );
    });
  });

  return result;
}
