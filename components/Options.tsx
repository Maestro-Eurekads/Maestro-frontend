
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
  "Add to cart rate": { type: "Currency", decimals: 2 },
  "CPATC": { type: "Currency", decimals: 2 },
  "CPPI": { type: "Currency", decimals: 2 },
  "CPP": { type: "Currency", decimals: 2 },

  // Percentage
  "VTR": { type: "Percentage", decimals: 1 },
  "Comp. rate": { type: "Percentage", decimals: 1 },
  "Eng Rate": { type: "Percentage", decimals: 1 },
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
  "Payment info rate": { type: "Percentage", decimals: 1 },


  // Seconds
  "Avg Visit Time": { type: "Seconds", decimals: 1 },

  // Volume/Numbers
  "Audience size": { type: "Number", decimals: 0 },
  "Impressions": { type: "Number", decimals: 0 },
  "Frequency": { type: "Number", decimals: 0 },
  "Purchases": { type: "Number", decimals: 0 },
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
  "Engagements": { type: "Number", decimals: 0 },
  "Add to carts": { type: "Number", decimals: 0 },
  "Payment infos": { type: "Number", decimals: 1 },
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
  { value: "AED", label: "AED", sign: "د.إ" },
  { value: "AFN", label: "AFN", sign: "؋" },
  { value: "ALL", label: "ALL", sign: "L" },
  { value: "AMD", label: "AMD", sign: "֏" },
  { value: "AOA", label: "AOA", sign: "Kz" },
  { value: "ARS", label: "ARS", sign: "$" },
  { value: "AUD", label: "AUD", sign: "A$" },
  { value: "AZN", label: "AZN", sign: "₼" },
  { value: "BAM", label: "BAM", sign: "KM" },
  { value: "BBD", label: "BBD", sign: "$" },
  { value: "BDT", label: "BDT", sign: "৳" },
  { value: "BGN", label: "BGN", sign: "лв" },
  { value: "BHD", label: "BHD", sign: ".د.ب" },
  { value: "BIF", label: "BIF", sign: "FBu" },
  { value: "BND", label: "BND", sign: "$" },
  { value: "BOB", label: "BOB", sign: "Bs." },
  { value: "BRL", label: "BRL", sign: "R$" },
  { value: "BSD", label: "BSD", sign: "$" },
  { value: "BTN", label: "BTN", sign: "Nu." },
  { value: "BWP", label: "BWP", sign: "P" },
  { value: "BYN", label: "BYN", sign: "Br" },
  { value: "BZD", label: "BZD", sign: "BZ$" },
  { value: "CAD", label: "CAD", sign: "C$" },
  { value: "CDF", label: "CDF", sign: "FC" },
  { value: "CHF", label: "CHF", sign: "Fr" },
  { value: "CLP", label: "CLP", sign: "$" },
  { value: "CNY", label: "CNY", sign: "¥" },
  { value: "COP", label: "COP", sign: "$" },
  { value: "CRC", label: "CRC", sign: "₡" },
  { value: "CUP", label: "CUP", sign: "$" },
  { value: "CVE", label: "CVE", sign: "$" },
  { value: "CZK", label: "CZK", sign: "Kč" },
  { value: "DJF", label: "DJF", sign: "Fdj" },
  { value: "DKK", label: "DKK", sign: "kr" },
  { value: "DOP", label: "DOP", sign: "RD$" },
  { value: "DZD", label: "DZD", sign: "د.ج" },
  { value: "EGP", label: "EGP", sign: "£" },
  { value: "ERN", label: "ERN", sign: "Nfk" },
  { value: "ETB", label: "ETB", sign: "Br" },
  { value: "EUR", label: "EUR", sign: "€" },
  { value: "FJD", label: "FJD", sign: "$" },
  { value: "GBP", label: "GBP", sign: "£" },
  { value: "GEL", label: "GEL", sign: "₾" },
  { value: "GHS", label: "GHS", sign: "₵" },
  { value: "GIP", label: "GIP", sign: "£" },
  { value: "GMD", label: "GMD", sign: "D" },
  { value: "GNF", label: "GNF", sign: "FG" },
  { value: "GTQ", label: "GTQ", sign: "Q" },
  { value: "GYD", label: "GYD", sign: "$" },
  { value: "HKD", label: "HKD", sign: "HK$" },
  { value: "HNL", label: "HNL", sign: "L" },
  { value: "HRK", label: "HRK", sign: "kn" },
  { value: "HTG", label: "HTG", sign: "G" },
  { value: "HUF", label: "HUF", sign: "Ft" },
  { value: "IDR", label: "IDR", sign: "Rp" },
  { value: "ILS", label: "ILS", sign: "₪" },
  { value: "INR", label: "INR", sign: "₹" },
  { value: "IQD", label: "IQD", sign: "ع.د" },
  { value: "IRR", label: "IRR", sign: "﷼" },
  { value: "ISK", label: "ISK", sign: "kr" },
  { value: "JMD", label: "JMD", sign: "J$" },
  { value: "JOD", label: "JOD", sign: "JD" },
  { value: "JPY", label: "JPY", sign: "¥" },
  { value: "KES", label: "KES", sign: "KSh" },
  { value: "KGS", label: "KGS", sign: "с" },
  { value: "KHR", label: "KHR", sign: "៛" },
  { value: "KMF", label: "KMF", sign: "CF" },
  { value: "KPW", label: "KPW", sign: "₩" },
  { value: "KRW", label: "KRW", sign: "₩" },
  { value: "KWD", label: "KWD", sign: "KD" },
  { value: "KZT", label: "KZT", sign: "₸" },
  { value: "LAK", label: "LAK", sign: "₭" },
  { value: "LBP", label: "LBP", sign: "ل.ل" },
  { value: "LKR", label: "LKR", sign: "₨" },
  { value: "LRD", label: "LRD", sign: "$" },
  { value: "LSL", label: "LSL", sign: "M" },
  { value: "LYD", label: "LYD", sign: "LD" },
  { value: "MAD", label: "MAD", sign: "د.م." },
  { value: "MDL", label: "MDL", sign: "L" },
  { value: "MGA", label: "MGA", sign: "Ar" },
  { value: "MKD", label: "MKD", sign: "ден" },
  { value: "MMK", label: "MMK", sign: "K" },
  { value: "MNT", label: "MNT", sign: "₮" },
  { value: "MOP", label: "MOP", sign: "MOP$" },
  { value: "MRU", label: "MRU", sign: "UM" },
  { value: "MUR", label: "MUR", sign: "₨" },
  { value: "MVR", label: "MVR", sign: "Rf" },
  { value: "MWK", label: "MWK", sign: "MK" },
  { value: "MXN", label: "MXN", sign: "$" },
  { value: "MYR", label: "MYR", sign: "RM" },
  { value: "MZN", label: "MZN", sign: "MT" },
  { value: "NAD", label: "NAD", sign: "$" },
  { value: "NGN", label: "NGN", sign: "₦" },
  { value: "NIO", label: "NIO", sign: "C$" },
  { value: "NOK", label: "NOK", sign: "kr" },
  { value: "NPR", label: "NPR", sign: "₨" },
  { value: "NZD", label: "NZD", sign: "NZ$" },
  { value: "OMR", label: "OMR", sign: "ر.ع." },
  { value: "PAB", label: "PAB", sign: "B/." },
  { value: "PEN", label: "PEN", sign: "S/" },
  { value: "PGK", label: "PGK", sign: "K" },
  { value: "PHP", label: "PHP", sign: "₱" },
  { value: "PKR", label: "PKR", sign: "₨" },
  { value: "PLN", label: "PLN", sign: "zł" },
  { value: "PYG", label: "PYG", sign: "₲" },
  { value: "QAR", label: "QAR", sign: "ر.ق" },
  { value: "RON", label: "RON", sign: "lei" },
  { value: "RSD", label: "RSD", sign: "дин" },
  { value: "RUB", label: "RUB", sign: "₽" },
  { value: "RWF", label: "RWF", sign: "FRw" },
  { value: "SAR", label: "SAR", sign: "ر.س" },
  { value: "SBD", label: "SBD", sign: "$" },
  { value: "SCR", label: "SCR", sign: "₨" },
  { value: "SDG", label: "SDG", sign: "£" },
  { value: "SEK", label: "SEK", sign: "kr" },
  { value: "SGD", label: "SGD", sign: "S$" },
  { value: "SLL", label: "SLL", sign: "Le" },
  { value: "SOS", label: "SOS", sign: "Sh" },
  { value: "SRD", label: "SRD", sign: "$" },
  { value: "SSP", label: "SSP", sign: "£" },
  { value: "STN", label: "STN", sign: "Db" },
  { value: "SYP", label: "SYP", sign: "£S" },
  { value: "SZL", label: "SZL", sign: "E" },
  { value: "THB", label: "THB", sign: "฿" },
  { value: "TJS", label: "TJS", sign: "SM" },
  { value: "TMT", label: "TMT", sign: "m" },
  { value: "TND", label: "TND", sign: "د.ت" },
  { value: "TOP", label: "TOP", sign: "T$" },
  { value: "TRY", label: "TRY", sign: "₺" },
  { value: "TTD", label: "TTD", sign: "TT$" },
  { value: "TWD", label: "TWD", sign: "NT$" },
  { value: "TZS", label: "TZS", sign: "TSh" },
  { value: "UAH", label: "UAH", sign: "₴" },
  { value: "UGX", label: "UGX", sign: "USh" },
  { value: "USD", label: "USD", sign: "$" },
  { value: "UYU", label: "UYU", sign: "$U" },
  { value: "UZS", label: "UZS", sign: "сўм" },
  { value: "VES", label: "VES", sign: "Bs" },
  { value: "VND", label: "VND", sign: "₫" },
  { value: "VUV", label: "VUV", sign: "VT" },
  { value: "WST", label: "WST", sign: "WS$" },
  { value: "XAF", label: "XAF", sign: "CFA" },
  { value: "XCD", label: "XCD", sign: "$" },
  { value: "XOF", label: "XOF", sign: "CFA" },
  { value: "YER", label: "YER", sign: "﷼" },
  { value: "ZAR", label: "ZAR", sign: "R" },
  { value: "ZMW", label: "ZMW", sign: "ZK" },
  { value: "ZWL", label: "ZWL", sign: "$" }
];

const selectCountry = [
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Argentina", label: "Argentina" },
  { value: "Armenia", label: "Armenia" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Barbados", label: "Barbados" },
  { value: "Belarus", label: "Belarus" },
  { value: "Belgium", label: "Belgium" },
  { value: "Belize", label: "Belize" },
  { value: "Benin", label: "Benin" },
  { value: "Bhutan", label: "Bhutan" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
  { value: "Botswana", label: "Botswana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Brunei", label: "Brunei" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cambodia", label: "Cambodia" },
  { value: "Canada", label: "Canada" },
  { value: "Cape Verde", label: "Cape Verde" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Chile", label: "Chile" },
  { value: "China", label: "China" },
  { value: "Colombia", label: "Colombia" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo", label: "Congo" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Croatia", label: "Croatia" },
  { value: "Cuba", label: "Cuba" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Denmark", label: "Denmark" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Dominican Republic", label: "Dominican Republic" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egypt", label: "Egypt" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Estonia", label: "Estonia" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Fiji", label: "Fiji" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Germany", label: "Germany" },
  { value: "Ghana", label: "Ghana" },
  { value: "Gibraltar", label: "Gibraltar" },
  { value: "Greece", label: "Greece" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haiti", label: "Haiti" },
  { value: "Honduras", label: "Honduras" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "Hungary", label: "Hungary" },
  { value: "Iceland", label: "Iceland" },
  { value: "India", label: "India" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Iran", label: "Iran" },
  { value: "Iraq", label: "Iraq" },
  { value: "Ireland", label: "Ireland" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Japan", label: "Japan" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kazakhstan", label: "Kazakhstan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Kiribati", label: "Kiribati" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Kyrgyzstan", label: "Kyrgyzstan" },
  { value: "Laos", label: "Laos" },
  { value: "Latvia", label: "Latvia" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libya", label: "Libya" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Macau", label: "Macau" },
  { value: "Macedonia", label: "Macedonia" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malawi", label: "Malawi" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Maldives", label: "Maldives" },
  { value: "Mali", label: "Mali" },
  { value: "Malta", label: "Malta" },
  { value: "Marshall Islands", label: "Marshall Islands" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Mexico", label: "Mexico" },
  { value: "Micronesia", label: "Micronesia" },
  { value: "Moldova", label: "Moldova" },
  { value: "Monaco", label: "Monaco" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Myanmar", label: "Myanmar" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nauru", label: "Nauru" },
  { value: "Nepal", label: "Nepal" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "North Korea", label: "North Korea" },
  { value: "Norway", label: "Norway" },
  { value: "Oman", label: "Oman" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Palau", label: "Palau" },
  { value: "Panama", label: "Panama" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Philippines", label: "Philippines" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Qatar", label: "Qatar" },
  { value: "Romania", label: "Romania" },
  { value: "Russia", label: "Russia" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
  { value: "Saint Lucia", label: "Saint Lucia" },
  { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
  { value: "Samoa", label: "Samoa" },
  { value: "San Marino", label: "San Marino" },
  { value: "São Tomé and Príncipe", label: "São Tomé and Príncipe" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Serbia", label: "Serbia" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Singapore", label: "Singapore" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Solomon Islands", label: "Solomon Islands" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  { value: "South Korea", label: "South Korea" },
  { value: "South Sudan", label: "South Sudan" },
  { value: "Spain", label: "Spain" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Sudan", label: "Sudan" },
  { value: "Suriname", label: "Suriname" },
  { value: "Swaziland", label: "Swaziland" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Syria", label: "Syria" },
  { value: "Taiwan", label: "Taiwan" },
  { value: "Tajikistan", label: "Tajikistan" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Thailand", label: "Thailand" },
  { value: "Tonga", label: "Tonga" },
  { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Turkey", label: "Turkey" },
  { value: "Turkmenistan", label: "Turkmenistan" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Uganda", label: "Uganda" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Uzbekistan", label: "Uzbekistan" },
  { value: "Vanuatu", label: "Vanuatu" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Yemen", label: "Yemen" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
];




function getFirstLetters(str: string | undefined | null) {
  if (typeof str !== "string" || !str.trim()) return "";
  const words = str.trim().split(/\s+/);
  return (words[0]?.[0] || '') + (words[1]?.[0] || '');
}


const cleanName = (name: string) => {
  if (!name) return "-";
  return name?.trim().split("-")[0];
};
const cleanNames = (name: string) => {
  if (!name) return "";
  return name?.trim().split("-")[0];
};

// Define clientRoles explicitly to match TableModel
const clientRoles = [
  { label: "Viewer", value: "viewer" },
  { label: "Approver", value: "client_approver" },
];

const agencyRoles = [
  { label: "Plan Creator", value: "agency_creator" },
  { label: "Plan Approver", value: "agency_approver" },
  { label: "Financial role", value: "financial_approver" },
];


const formatKPIValue = (value, kpiName, currencySymbol = "€") => {
  const format = kpiFormatMap[kpiName];
  if (!format || value === undefined || value === null) {
    if (format?.type === "Currency") return `${currencySymbol} 0,00`;
    if (format?.type === "Percentage") return "0,0%";
    if (format?.type === "Seconds") return "0,0 Sec";
    return "0";
  }

  const formatNumber = (val, decimals) =>
    val.toFixed(decimals);

  const withSeparators = (str) =>
    str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  switch (format.type) {
    case "Currency":
      return `${currencySymbol} ${withSeparators(formatNumber(value, format.decimals))}`;
    case "Percentage":
      return `${formatNumber(value, format.decimals)}%`;
    case "Seconds":
      return `${formatNumber(value, format.decimals)} Sec`;
    case "Number":
      return withSeparators(Math.round(value));
    default:
      return value.toString();
  }
};

const colorClassToHex: Record<string, string> = {
  "bg-blue-500": "#3B82F6",

  "bg-green-500": "#22C55E",

  "bg-orange-500": "#F59E42",

  "bg-red-500": "#EF4444",

  "bg-purple-500": "#A855F7",

  "bg-teal-500": "#14B8A6",

  "bg-pink-500": "#EC4899",

  "bg-indigo-500": "#6366F1",

  "bg-yellow-500": "#FACC15",

  "bg-cyan-500": "#06B6D4",

  "bg-lime-500": "#84CC16",

  "bg-amber-500": "#F59E42",

  "bg-fuchsia-500": "#D946EF",

  "bg-emerald-500": "#10B981",

  "bg-violet-600": "#7C3AED",

  "bg-rose-600": "#F43F5E",

  "bg-sky-500": "#0EA5E9",

  "bg-gray-800": "#1F2937",

  "bg-blue-800": "#166534",
};


const colorPalette = [
  "bg-blue-500",

  "bg-green-500",

  "bg-orange-500",

  "bg-red-500",

  "bg-purple-500",

  "bg-teal-500",

  "bg-pink-500",

  "bg-indigo-500",

  "bg-yellow-500",

  "bg-cyan-500",

  "bg-lime-500",

  "bg-amber-500",

  "bg-fuchsia-500",

  "bg-emerald-500",

  "bg-violet-600",

  "bg-rose-600",

  "bg-sky-500",

  "bg-gray-800",

  "bg-blue-800",

  "bg-green-800",
];

const distinctColorPalette = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#EF4444",
  "#A855F7",
  "#14B8A6",
  "#EC4899",
  "#6366F1",
  "#FACC15",
  "#06B6D4",
  "#84CC16",
  "#F59E0B",
  "#D946EF",
  "#10B981",
  "#7C3AED",
  "#F43F5E",
  "#0EA5E9",
  "#1F2937",
  "#1E40AF",
  "#166534",
  "#D8B4FE",
  "#1E3A8A",
  "#5B2C86",
  "#7EE787",
  "#FF9E66",
  "#A18072",
  "#C084FC",
  "#BDB2FF",
  "#4F46E5",
  "#06D6A0",
  "#A3B34D",
  "#7F2B2B",
  "#FFC4A3",
  "#B45309",
  "#D45D5D",
  "#FF8C42",
  "#FFDB58",
  "#B8860B",
  "#E5E4E2",
  "#C0C0C0",
  "#2C3539",
  "#7D8475",
  "#B5BAB6",
  "#C4D0D0",
  "#92B3B5",
  "#897F98",
  "#4E5180",
  "#191970",
];

const tailwindToHex: { [key: string]: string } = {
  "bg-blue-500": "#3B82F6",
  "bg-green-500": "#22C55E",
  "bg-orange-500": "#F97316",
  "bg-red-500": "#EF4444",
  "bg-purple-500": "#A855F7",
  "bg-teal-500": "#14B8A6",
  "bg-pink-500": "#EC4899",
  "bg-indigo-500": "#6366F1",
  "bg-yellow-500": "#FACC15",
  "bg-cyan-500": "#06B6D4",
  "bg-lime-500": "#84CC16",
  "bg-amber-500": "#F59E0B",
  "bg-fuchsia-500": "#D946EF",
  "bg-emerald-500": "#10B981",
  "bg-violet-600": "#7C3AED",
  "bg-rose-600": "#F43F5E",
  "bg-sky-500": "#0EA5E9",
  "bg-gray-800": "#1F2937",
  "bg-blue-800": "#1E40AF",
  "bg-green-800": "#166534",
  "bg-purple-300": "#D8B4FE",
  "bg-darkBlue-700": "#1E3A8A",
  "bg-deepPurple-600": "#5B2C86",
  "bg-lightGreen-400": "#7EE787",
  "bg-deepOrange-300": "#FF9E66",
  "bg-brown-500": "#A18072",
  "bg-heliotrope-500": "#A855F7",
  "bg-mauve-400": "#C084FC",
  "bg-lavender-300": "#BDB2FF",
  "bg-periwinkle-600": "#4F46E5",
  "bg-mint-500": "#06D6A0",
  "bg-olive-400": "#A3B34D",
  "bg-maroon-700": "#7F2B2B",
  "bg-peach-300": "#FFC4A3",
  "bg-rust-500": "#B45309",
  "bg-salmon-600": "#D45D5D",
  "bg-tangerine-500": "#FF8C42",
  "bg-mustard-300": "#FFDB58",
  "bg-gold-700": "#B8860B",
  "bg-platinum-400": "#E5E4E2",
  "bg-silver-300": "#C0C0C0",
  "bg-gunmetal-800": "#2C3539",
  "bg-cement-700": "#7D8475",
  "bg-storm-300": "#B5BAB6",
  "bg-mist-500": "#C4D0D0",
  "bg-frost-600": "#92B3B5",
  "bg-dusk-400": "#897F98",
  "bg-twilight-700": "#4E5180",
  "bg-midnight-900": "#191970",
};

const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

export {
  months,
  kpiCategories,
  categoryOrder,
  selectCurrency,
  agencyRoles,
  clientRoles,
  selectCountry,
  colorClassToHex,
  colorPalette,
  distinctColorPalette,
  tailwindToHex,
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
  aggregateKPIStatsFromExtracted,
  cleanName,
  cleanNames,
  formatKPIValue,
  isHexColor
};
