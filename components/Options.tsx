
import { MdOutlineErrorOutline } from "react-icons/md";
import { SVGLoader } from "./SVGLoader";
import React from "react";
import { getPlatformIcon, platformStyles } from "./data";



// SVGLoader Fetch
const SVGLoaderFetch = ({ colSpan, text }: any) => (
  <tr>
    <td colSpan={colSpan} id="table-loader">
      <div className="center-content">
        <SVGLoader width={"40px"} height={"40px"} color={"#0866FF"} />

        <p className="mt-3">{text}</p>
      </div>
    </td>
  </tr>
);

// NoRecordFound
const NoRecordFound = ({ colSpan }: any) => (
  <tr>
    <td colSpan={colSpan} id="table-loader">
      <div className="center-content">
        <MdOutlineErrorOutline size={75} />
        <p id="mt-3">No record found</p>
      </div>
    </td>
  </tr>
);
// NoRecordFound
const NoRecordFoundD = ({ colSpan }: any) => (

  <div className="center-content" id="table-loader">
    <MdOutlineErrorOutline size={75} />
    <p id="mt-3">No record found</p>
  </div>
);


const kpiCategories = {
  "Video Views": [
    "VTR", "CPV", "Completed View", "Video Views", "Completion Rate", "CPCV"
  ],
  "Engagement": [
    "Eng Rate", "Engagements", "CPE"
  ],
  "Traffic": [
    "CTR", "CPC", "Lands", "Link Clicks", "Click to land rate", "CPL",
    "Avg Visit Time", "Avg pages/visit", "Bounce Rate", "Bounced Visits",
    "Cost/bounce", "Lead Rate", "Lead visits", "Cost/lead",
    "Off-funnel rate", "Off-funnel visits", "Cost/Off funnel"
  ],
  "Lead Generation (On platform)": [
    "CTR", "Cost / opened form", "Leads", "Forms open", "CVR", "Cost / lead"
  ],
  "Lead Generation (On website)": [
    "CTR", "CPC", "Lands", "CVR", "Cost / lead", "Link clicks",
    "Click to land rate", "CPL", "Leads"
  ],
  "Purchase": [
    "CTR", "CPC", "Lands", "Link Clicks", "Click to land rate", "CPL",
    "Avg Visit Time", "Avg pages/visit", "Bounce Rate", "Bounced Visits",
    "Cost/bounce", "Lead Rate", "Lead visits", "Cost/lead",
    "Off-funnel rate", "Off-funnel visits", "Cost/Off funnel",
    "Conversions", "CVR", "Cost/conversion",
    "CLV of associated product", "Generated Revenue", "Return on Ad Spent",
    "Add to cart rate", "Add to carts", "CPATC",
    "Payment info rate", "Payment infos", "CPPI",
    "Purchase rate", "Purchases", "CPP",
    "Conversion", "Cost/conversion"
  ],
  "App Install": [
    "CTR", "CPC", "Installs", "Link Clicks", "Install Rate", "CPI"
  ],
  "In-App Conversion": [
    "CTR", "CPC", "App Open", "Link Clicks", "Open Rate", "Cost/App Open",
    "CVR", "Cost/conversion", "CLV of associated product",
    "Generated Revenue", "Return on Ad Spent",
    "Conversion", "Cost/conversion"
  ],
  "Awareness Metrics": [
    "CPM", "Frequency", "Reach", "Impressions"
  ]
};


const categoryOrder = [
  "Awareness Metrics",
  "Purchase",
  "Traffic",
  "Lead Generation (On platform)",
  "Lead Generation (On website)",
  "App Install",
  "Engagement",
  "In-App Conversion",
  "Video Views",
];
export const kpiFormatMap = {
  // Currency
  "Budget": { type: "Currency", decimals: 2 },
  "CPM": { type: "Currency", decimals: 2 },
  "CPV": { type: "Currency", decimals: 2 },
  "CPCV": { type: "Currency", decimals: 2 },
  "CPE": { type: "Currency", decimals: 2 },
  "CPL": { type: "Currency", decimals: 2 },
  "CPC": { type: "Currency", decimals: 2 },
  "Cost/bounce": { type: "Currency", decimals: 2 },
  "Cost/lead": { type: "Currency", decimals: 2 },
  "Cost/App Open": { type: "Currency", decimals: 2 },
  "Cost/Off funnel": { type: "Currency", decimals: 2 },
  "Cost/conversion": { type: "Currency", decimals: 2 },
  "CLV of associated product": { type: "Currency", decimals: 2 },
  "Generated Revenue": { type: "Currency", decimals: 2 },
  "Return on Ad Spent": { type: "Currency", decimals: 2 },

  // Percentage
  "VTR": { type: "Percentage", decimals: 1 },
  "Comp. rate": { type: "Percentage", decimals: 1 },
  "Eng rate": { type: "Percentage", decimals: 1 },
  "CTR": { type: "Percentage", decimals: 1 },
  "Click to land rate": { type: "Percentage", decimals: 1 },
  "Bounce rate": { type: "Percentage", decimals: 1 },
  "lead rate": { type: "Percentage", decimals: 1 },
  "CVR lead": { type: "Percentage", decimals: 1 },
  "CVR": { type: "Percentage", decimals: 1 },
  "Conversions": { type: "Percentage", decimals: 1 },
  "Off-funnel rate": { type: "Percentage", decimals: 1 },
  "ATC rate": { type: "Percentage", decimals: 1 },
  "PI rate": { type: "Percentage", decimals: 1 },
  "Purchase rate": { type: "Percentage", decimals: 1 },
  "App open rate": { type: "Percentage", decimals: 1 },
  "Open Rate": { type: "Percentage", decimals: 1 },
  "Install rate": { type: "Percentage", decimals: 1 },
  "CVR app": { type: "Percentage", decimals: 1 },
  "Bounce Rate": { type: "Percentage", decimals: 1 },
  "Lead Rate": { type: "Percentage", decimals: 1 },

  // Seconds
  "Avg Visit Time": { type: "Seconds", decimals: 1 },

  // Volume/Numbers
  "Audience size": { type: "Number", decimals: 0 },
  "Impressions": { type: "Number", decimals: 0 },
  "Frequency": { type: "Number", decimals: 0 },
  "Reach": { type: "Number", decimals: 0 },
  "Video Views": { type: "Number", decimals: 0 },
  "Completed View": { type: "Number", decimals: 0 },
  "Completion Rate": { type: "Percentage", decimals: 0 },
  "Link Clicks": { type: "Number", decimals: 0 },
  "Avg page / visit": { type: "Number", decimals: 0 },
  "Bounced Visits": { type: "Number", decimals: 0 },
  "Leads": { type: "Number", decimals: 0 },
  "Conversion value": { type: "Number", decimals: 0 },
  "App Open": { type: "Number", decimals: 0 },
  "Conversion": { type: "Number", decimals: 0 },
  "Lands": { type: "Number", decimals: 0 },
  "Link clicks": { type: "Number", decimals: 0 },
  "Forms open": { type: "Number", decimals: 0 },
  "Avg pages/visit": { type: "Number", decimals: 0 },
  "Lead visits": { type: "Number", decimals: 0 },
};


function mapKPIStatsToStatsDataDynamic(aggregatedStats, kpiCategories, icons, finalCategoryOrder) {
  const categoryMappingBase = {
    "Awareness Metrics": {
      title: "Brand Awareness",
      background: "#E5F2F7",
      icons: { up: icons.upfull, down: icons.downoffline },
      priorityKPIs: ["Reach", "Frequency", "Impressions"]
    },
    "Traffic": {
      title: "Traffic",
      background: "#E6F4D5",
      icons: { up: icons.upfull, down: icons.downfull },
      priorityKPIs: ["CTR", "Link Clicks", "Bounce Rate"]
    },
    "Purchase": {
      title: "Purchase",
      background: "#FFE2C5",
      icons: { up: icons.upfull, down: icons.downfull },
      priorityKPIs: ["CTR", "Purchases", "CVR"]
    },
    "Lead Generation (On platform)": {
      title: "Lead Generation Platform",
      background: "#E5F2F7",
      icons: { up: icons.upfull, down: icons.downfull },
      priorityKPIs: ["CVR", "Leads", "Cost / lead"]
    },
    "Lead Generation (On website)": {
      title: "Lead Generation Website",
      background: "#E5F2F7",
      icons: { up: icons.upfull, down: icons.downfull },
      priorityKPIs: ["CVR", "Leads", "Cost / lead"]
    },
    "App Install": {
      title: "App Installs",
      background: "#E6F4D5",
      icons: { up: icons.upfull, down: icons.downfull },
      priorityKPIs: ["CTR", "Installs", "Install Rate"]
    },
    "Engagement": {
      title: "Engagement",
      background: "#FFE2C5",
      icons: { up: icons.upfull, down: icons.downfull },
      priorityKPIs: ["Eng Rate", "Engagements", "CPE"]
    },
    "In-App Conversion": {
      title: "In-App Conversion",
      background: "#E5F2F7",
      icons: { up: icons.upfull, down: icons.downfull },
      priorityKPIs: ["CTR", "CPC", "App Open", "Link Clicks", "Open Rate"]
    },
    "Video Views": {
      title: "Video Views",
      background: "#E6F4D5",
      icons: { up: icons.upoffline, down: icons.downfull },
      priorityKPIs: ["VTR", "Video Views", "Completion Rate"]
    }
  };


  // const formatKPIValue = (value, kpiName) => {
  //   if (value === undefined || value === null) {
  //     // Currency defaults
  //     const currencyKPIs = ["Budget", "CPM", "CPV", "CPCV", "CPE", "CPC", "Cost/bounce", "Cost/lead"];
  //     if (currencyKPIs.includes(kpiName)) return "€ 0,00";

  //     // Percentage defaults
  //     const percentageKPIs = [
  //       "VTR", "Comp. rate", "Eng rate", "CTR", "Click to land rate", "Bounce rate", "lead rate",
  //       "CVR lead", "CVR", "Off-funnel rate", "ATC rate", "PI rate", "Purchase rate", "App open rate", "Install rate", "CVR app"
  //     ];
  //     if (percentageKPIs.includes(kpiName)) return "0,0%";

  //     // Time default
  //     if (kpiName === "Avg visit time") return "0,0 Sec";

  //     // Number default
  //     return "0";
  //   }

  //   // Format Currency
  //   const currencyKPIs = ["Budget", "CPM", "CPV", "CPCV", "CPE", "CPC", "Cost/bounce", "Cost/lead"];
  //   if (currencyKPIs.includes(kpiName)) {
  //     return `€ ${value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
  //   }

  //   // Format Percentage
  //   const percentageKPIs = [
  //     "VTR", "Comp. rate", "Eng rate", "CTR", "Click to land rate", "Bounce rate", "lead rate",
  //     "CVR lead", "CVR", "Off-funnel rate", "ATC rate", "PI rate", "Purchase rate", "App open rate", "Install rate", "CVR app"
  //   ];
  //   if (percentageKPIs.includes(kpiName)) {
  //     return `${value.toFixed(1).replace(".", ",")}%`;
  //   }

  //   // Format Time
  //   if (kpiName === "Avg visit time") {
  //     return `${value.toFixed(1).replace(".", ",")} Sec`;
  //   }

  //   // Format Number (Volume or Count)
  //   return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  // };
  const formatKPIValue = (value, kpiName) => {
    const format = kpiFormatMap[kpiName];

    if (!format || value === undefined || value === null) {
      // Default fallback formatting
      if (format?.type === "Currency") return "€ 0,00";
      if (format?.type === "Percentage") return "0,0%";
      if (format?.type === "Seconds") return "0,0 Sec";
      return "0";
    }

    const numberWithSeparators = (val) =>
      val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const rounded = (val, decimals) =>
      val.toFixed(decimals).replace(".", ",");

    switch (format.type) {
      case "Currency":
        return `€ ${numberWithSeparators(rounded(value, format.decimals))}`;
      case "Percentage":
        return `${rounded(value, format.decimals)}%`;
      case "Seconds":
        return `${rounded(value, format.decimals)} Sec`;
      case "Number":
        return numberWithSeparators(Math.round(value));
      default:
        return value.toString();
    }
  };



  return React.useMemo(() => {
    return finalCategoryOrder?.filter((kpiCategory) => aggregatedStats[kpiCategory]) // Only include if data exists
      ?.map((kpiCategory, index) => {
        const category = categoryMappingBase[kpiCategory];
        const kpiData = aggregatedStats[kpiCategory] || {};
        const availableKPIs = Object.keys(kpiData);

        const selectedKPIs = [
          ...category?.priorityKPIs?.filter((kpi) => availableKPIs.includes(kpi)),
          ...availableKPIs?.filter((kpi) => !category?.priorityKPIs?.includes(kpi)),
        ].map((kpiName) => ({
          label: kpiName,
          value: formatKPIValue(kpiData[kpiName], kpiName),
        }));

        const indicators = Array(finalCategoryOrder?.length).fill("#C0C0C0");
        indicators[index] = "#3175FF";

        return {
          title: category?.title,
          background: category?.background,
          stats: selectedKPIs?.length > 0 ? selectedKPIs : [{ label: "No Data", value: "0" }],
          indicators,
          icons: category?.icons,
          kpiCategory,
        };
      });
  }, [aggregatedStats, kpiCategories, icons]);
}

function extractKPIByFunnelStage(data, kpiCategories) {
  const result = {};
  const channelMix = data?.channel_mix;

  channelMix?.forEach((stage) => {
    const funnelStage = stage?.funnel_stage;
    result[funnelStage] = [];

    const socialMedia = stage?.social_media || [];
    socialMedia.forEach((platform) => {
      const platformName = platform?.platform_name;
      const kpi = platform?.kpi || {};
      const groupedKPIs = {};

      Object.keys(kpiCategories).forEach((category) => {
        groupedKPIs[category] = {};
        const kpiList = kpiCategories[category];

        kpiList?.forEach((kpiName) => {
          const kpiKey = kpiName
            .toLowerCase()
            .replace(/ /g, "_")
            .replace("/", "__");
          if (kpi[kpiKey] !== undefined && kpi[kpiKey] !== null) {
            groupedKPIs[category][kpiName] = kpi[kpiKey];
          }
        });

        if (Object.keys(groupedKPIs[category])?.length === 0) {
          delete groupedKPIs[category];
        }
      });

      result[funnelStage].push({
        platform_name: platformName,
        kpi: groupedKPIs,
      });
    });
  });

  return result;
}


// function aggregateKPIStatsFromExtracted(extractedData, kpiCategories) {
//   const kpiAccumulator = {};

//   Object.keys(kpiCategories).forEach((category) => {
//     kpiAccumulator[category] = {};
//     kpiCategories[category].forEach((kpiName) => {
//       kpiAccumulator[category][kpiName] = {
//         values: [],
//         displayName: kpiName,
//       };
//     });
//   });

//   Object.keys(extractedData).forEach((funnelStage) => {
//     const platforms = extractedData[funnelStage] || [];

//     platforms.forEach((platform) => {
//       const kpi = platform?.kpi || {};

//       Object.keys(kpiCategories).forEach((category) => {
//         const kpiList = kpiCategories[category];
//         const categoryData = kpi[category] || {};

//         kpiList.forEach((kpiName) => {
//           if (categoryData[kpiName] !== undefined && categoryData[kpiName] !== null) {
//             kpiAccumulator[category][kpiName]?.values?.push(categoryData[kpiName]);
//           }
//         });
//       });
//     });
//   });

//   const aggregatedStats = {};

//   Object.keys(kpiAccumulator).forEach((category) => {
//     aggregatedStats[category] = {};

//     Object.keys(kpiAccumulator[category]).forEach((kpiName) => {
//       const kpiData = kpiAccumulator[category][kpiName];
//       const values = kpiData?.values;

//       if (values.length > 0) {
//         const average = values.reduce((sum, val) => sum + val, 0) / values?.length;
//         aggregatedStats[category][kpiData?.displayName] = Number(average.toFixed(2));
//       }
//     });

//     if (Object.keys(aggregatedStats[category])?.length === 0) {
//       delete aggregatedStats[category];
//     }
//   });

//   return aggregatedStats;
// }
function aggregateKPIStatsFromExtracted(extractedData, kpiCategories) {
  const kpiAccumulator = {};

  Object.keys(kpiCategories).forEach((category) => {
    kpiAccumulator[category] = {};
    kpiCategories[category].forEach((kpiName) => {
      kpiAccumulator[category][kpiName] = {
        values: [],
        displayName: kpiName,
      };
    });
  });

  Object.keys(extractedData || {}).forEach((funnelStage) => {
    const platforms = Array.isArray(extractedData[funnelStage]) ? extractedData[funnelStage] : [];
    platforms.forEach((platform) => {
      const kpi = platform?.kpi || {};

      Object.keys(kpiCategories).forEach((category) => {
        const kpiList = kpiCategories[category];
        const categoryData = kpi[category] || {};

        kpiList.forEach((kpiName) => {
          if (categoryData[kpiName] !== undefined && categoryData[kpiName] !== null) {
            kpiAccumulator[category][kpiName]?.values?.push(categoryData[kpiName]);
          }
        });
      });
    });
  });

  const aggregatedStats = {};

  Object.keys(kpiAccumulator).forEach((category) => {
    aggregatedStats[category] = {};

    Object.keys(kpiAccumulator[category]).forEach((kpiName) => {
      const kpiData = kpiAccumulator[category][kpiName];
      const values = kpiData?.values;

      if (values.length > 0) {
        const average = values.reduce((sum, val) => sum + val, 0) / values?.length;
        aggregatedStats[category][kpiData?.displayName] = average;
      }
    });

    if (Object.keys(aggregatedStats[category])?.length === 0) {
      delete aggregatedStats[category];
    }
  });

  return aggregatedStats;
}

const CapitalizeFirstLetter = (str: string | undefined | any) => {
  return str ? str?.charAt(0).toUpperCase() + str?.slice(1) : "";
};


// Color Functions
const getRandomColor = () => {
  const colors = ['#00A36C', '#EE1514', '#00A52C', '#FF8C00', '#C67003', '#14539A', '#02393E', '#275D2B', '#660D33', '#6F4439'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getContrastingColor = (color: string) => {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const invertedColor = `#${(0xFFFFFF ^ (r << 16 | g << 8 | b)).toString(16).padStart(6, '0')}`;
  return invertedColor;
};



const parseApiDate = (dateString: string | null): { day: number; month: number } | null => {
  if (!dateString) return null;
  const parsedDate = new Date(dateString);
  return {
    day: parsedDate.getDate(),
    month: parsedDate.getMonth(),
  };
};



const getInitials = (name: string | null | undefined) => {
  if (!name) return null;
  console.log("🚀 ~ getInitials ~ name:", name)
  const parts = name && name?.split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`
    : parts[0][0];
};


function extractPlatforms(data) {
  const platforms = [];
  data?.channel_mix?.length > 0 &&
    data.channel_mix.forEach((stage) => {
      const stageName = stage.funnel_stage;
      const stageBudget = parseFloat(stage.stage_budget?.fixed_value);
      ["search_engines", "display_networks", "social_media"].forEach(
        (channelType) => {
          stage[channelType].forEach((platform) => {
            const platformName = platform.platform_name;
            const platformBudget = parseFloat(
              platform.budget?.fixed_value || 0
            );
            const percentage = (platformBudget / stageBudget) * 100 || 0;
            const existingPlatform = platforms.find(
              (p) => p.platform_name === platformName
            );
            if (!existingPlatform) {
              const style =
                platformStyles.find((style) => style.name === platformName) ||
                platformStyles[
                Math.floor(Math.random() * platformStyles.length)
                ];
              platforms.push({
                platform_name: platformName,
                amount: platformBudget,
                stageName,
                icon: getPlatformIcon(platformName),
                bg: style?.bg,
              });
            }
          });
        }
      );
    });
  return platforms;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const selectCurrency = [
  { value: "US Dollar (USD)", label: "US Dollar (USD)", sign: "$" },
  { value: "Euro (EUR)", label: "Euro (EUR)", sign: "€" },
  { value: "British Pound (GBP)", label: "British Pound (GBP)", sign: "£" },
  { value: "Nigerian Naira (NGN)", label: "Nigerian Naira (NGN)", sign: "₦" },
  { value: "Japanese Yen (JPY)", label: "Japanese Yen (JPY)", sign: "¥" },
  {
    value: "Canadian Dollar (CAD)",
    label: "Canadian Dollar (CAD)",
    sign: "C$",
  },
];


function getFirstLetters(str) {
  const words = str?.trim().split(/\s+/);
  const first = words?.[0]?.[0] || '';
  const second = words?.[1]?.[0] || '';
  return (first + second).toUpperCase();
}
export {
  months,
  kpiCategories,
  categoryOrder,
  selectCurrency,
  getFirstLetters,
  extractPlatforms,
  NoRecordFound,
  SVGLoaderFetch,
  NoRecordFoundD,
  parseApiDate,
  CapitalizeFirstLetter,
  getRandomColor,
  getContrastingColor,
  getInitials,
  mapKPIStatsToStatsDataDynamic,
  extractKPIByFunnelStage,
  aggregateKPIStatsFromExtracted
};
