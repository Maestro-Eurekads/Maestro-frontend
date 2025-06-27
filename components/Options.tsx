
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
  { value: "USD", label: "USD", sign: "$" },
  { value: "EUR", label: "EUR", sign: "€" },
  { value: "GBP", label: "GBP", sign: "£" },
  { value: "NGN", label: "NGN", sign: "₦" },
  { value: "JPY", label: "JPY", sign: "¥" },
  { value: "CAD", label: "CAD", sign: "C$" },
];

const selectCountry = [
  { value: "Afghan Afghani (AFN)", label: "Afghan Afghani (AFN)" },
  { value: "Albanian Lek (ALL)", label: "Albanian Lek (ALL)" },
  { value: "Algerian Dinar (DZD)", label: "Algerian Dinar (DZD)" },
  { value: "Andorran Euro (EUR)", label: "Andorran Euro (EUR)" },
  { value: "Angolan Kwanza (AOA)", label: "Angolan Kwanza (AOA)" },
  { value: "Argentine Peso (ARS)", label: "Argentine Peso (ARS)" },
  { value: "Armenian Dram (AMD)", label: "Armenian Dram (AMD)" },
  { value: "Australian Dollar (AUD)", label: "Australian Dollar (AUD)" },
  { value: "Austrian Euro (EUR)", label: "Austrian Euro (EUR)" },
  { value: "Azerbaijani Manat (AZN)", label: "Azerbaijani Manat (AZN)" },
  { value: "Bahamian Dollar (BSD)", label: "Bahamian Dollar (BSD)" },
  { value: "Bahraini Dinar (BHD)", label: "Bahraini Dinar (BHD)" },
  { value: "Bangladeshi Taka (BDT)", label: "Bangladeshi Taka (BDT)" },
  { value: "Barbadian Dollar (BBD)", label: "Barbadian Dollar (BBD)" },
  { value: "Belarusian Ruble (BYN)", label: "Belarusian Ruble (BYN)" },
  { value: "Belgian Euro (EUR)", label: "Belgian Euro (EUR)" },
  { value: "Belize Dollar (BZD)", label: "Belize Dollar (BZD)" },
  { value: "Beninese CFA Franc (XOF)", label: "Beninese CFA Franc (XOF)" },
  { value: "Bhutanese Ngultrum (BTN)", label: "Bhutanese Ngultrum (BTN)" },
  { value: "Bolivian Boliviano (BOB)", label: "Bolivian Boliviano (BOB)" },
  { value: "Bosnia and Herzegovina Convertible Mark (BAM)", label: "Bosnia and Herzegovina Convertible Mark (BAM)" },
  { value: "Botswana Pula (BWP)", label: "Botswana Pula (BWP)" },
  { value: "Brazilian Real (BRL)", label: "Brazilian Real (BRL)" },
  { value: "British Pound Sterling (GBP)", label: "British Pound Sterling (GBP)" },
  { value: "Brunei Dollar (BND)", label: "Brunei Dollar (BND)" },
  { value: "Bulgarian Lev (BGN)", label: "Bulgarian Lev (BGN)" },
  { value: "Burundian Franc (BIF)", label: "Burundian Franc (BIF)" },
  { value: "Cambodian Riel (KHR)", label: "Cambodian Riel (KHR)" },
  { value: "Canadian Dollar (CAD)", label: "Canadian Dollar (CAD)" },
  { value: "Cape Verdean Escudo (CVE)", label: "Cape Verdean Escudo (CVE)" },
  { value: "Central African CFA Franc (XAF)", label: "Central African CFA Franc (XAF)" },
  { value: "Chilean Peso (CLP)", label: "Chilean Peso (CLP)" },
  { value: "Chinese Yuan Renminbi (CNY)", label: "Chinese Yuan Renminbi (CNY)" },
  { value: "Colombian Peso (COP)", label: "Colombian Peso (COP)" },
  { value: "Comorian Franc (KMF)", label: "Comorian Franc (KMF)" },
  { value: "Congolese Franc (CDF)", label: "Congolese Franc (CDF)" },
  { value: "Costa Rican Colón (CRC)", label: "Costa Rican Colón (CRC)" },
  { value: "Croatian Kuna (HRK)", label: "Croatian Kuna (HRK)" },
  { value: "Cuban Peso (CUP)", label: "Cuban Peso (CUP)" },
  { value: "Czech Koruna (CZK)", label: "Czech Koruna (CZK)" },
  { value: "Danish Krone (DKK)", label: "Danish Krone (DKK)" },
  { value: "Djiboutian Franc (DJF)", label: "Djiboutian Franc (DJF)" },
  { value: "Dominican Peso (DOP)", label: "Dominican Peso (DOP)" },
  { value: "East Caribbean Dollar (XCD)", label: "East Caribbean Dollar (XCD)" },
  { value: "Ecuadorian Dollar (USD)", label: "Ecuadorian Dollar (USD)" },
  { value: "Egyptian Pound (EGP)", label: "Egyptian Pound (EGP)" },
  { value: "Eritrean Nakfa (ERN)", label: "Eritrean Nakfa (ERN)" },
  { value: "Estonian Euro (EUR)", label: "Estonian Euro (EUR)" },
  { value: "Ethiopian Birr (ETB)", label: "Ethiopian Birr (ETB)" },
  { value: "Euro (EUR)", label: "Euro (EUR)" },
  { value: "Fijian Dollar (FJD)", label: "Fijian Dollar (FJD)" },
  { value: "Finnish Euro (EUR)", label: "Finnish Euro (EUR)" },
  { value: "French Euro (EUR)", label: "French Euro (EUR)" },
  { value: "Gabonese CFA Franc (XAF)", label: "Gabonese CFA Franc (XAF)" },
  { value: "Gambian Dalasi (GMD)", label: "Gambian Dalasi (GMD)" },
  { value: "Georgian Lari (GEL)", label: "Georgian Lari (GEL)" },
  { value: "German Euro (EUR)", label: "German Euro (EUR)" },
  { value: "Ghanaian Cedi (GHS)", label: "Ghanaian Cedi (GHS)" },
  { value: "Gibraltar Pound (GIP)", label: "Gibraltar Pound (GIP)" },
  { value: "Greek Euro (EUR)", label: "Greek Euro (EUR)" },
  { value: "Guatemalan Quetzal (GTQ)", label: "Guatemalan Quetzal (GTQ)" },
  { value: "Guinean Franc (GNF)", label: "Guinean Franc (GNF)" },
  { value: "Guyanese Dollar (GYD)", label: "Guyanese Dollar (GYD)" },
  { value: "Haitian Gourde (HTG)", label: "Haitian Gourde (HTG)" },
  { value: "Honduran Lempira (HNL)", label: "Honduran Lempira (HNL)" },
  { value: "Hong Kong Dollar (HKD)", label: "Hong Kong Dollar (HKD)" },
  { value: "Hungarian Forint (HUF)", label: "Hungarian Forint (HUF)" },
  { value: "Icelandic Krona (ISK)", label: "Icelandic Krona (ISK)" },
  { value: "Indian Rupee (INR)", label: "Indian Rupee (INR)" },
  { value: "Indonesian Rupiah (IDR)", label: "Indonesian Rupiah (IDR)" },
  { value: "Iranian Rial (IRR)", label: "Iranian Rial (IRR)" },
  { value: "Iraqi Dinar (IQD)", label: "Iraqi Dinar (IQD)" },
  { value: "Irish Euro (EUR)", label: "Irish Euro (EUR)" },
  { value: "Israeli New Shekel (ILS)", label: "Israeli New Shekel (ILS)" },
  { value: "Italian Euro (EUR)", label: "Italian Euro (EUR)" },
  { value: "Jamaican Dollar (JMD)", label: "Jamaican Dollar (JMD)" },
  { value: "Japanese Yen (JPY)", label: "Japanese Yen (JPY)" },
  { value: "Jordanian Dinar (JOD)", label: "Jordanian Dinar (JOD)" },
  { value: "Kazakhstani Tenge (KZT)", label: "Kazakhstani Tenge (KZT)" },
  { value: "Kenyan Shilling (KES)", label: "Kenyan Shilling (KES)" },
  { value: "Kiribati Dollar (AUD)", label: "Kiribati Dollar (AUD)" },
  { value: "Kuwaiti Dinar (KWD)", label: "Kuwaiti Dinar (KWD)" },
  { value: "Kyrgyzstani Som (KGS)", label: "Kyrgyzstani Som (KGS)" },
  { value: "Lao Kip (LAK)", label: "Lao Kip (LAK)" },
  { value: "Latvian Euro (EUR)", label: "Latvian Euro (EUR)" },
  { value: "Lebanese Pound (LBP)", label: "Lebanese Pound (LBP)" },
  { value: "Lesotho Loti (LSL)", label: "Lesotho Loti (LSL)" },
  { value: "Liberian Dollar (LRD)", label: "Liberian Dollar (LRD)" },
  { value: "Libyan Dinar (LYD)", label: "Libyan Dinar (LYD)" },
  { value: "Lithuanian Euro (EUR)", label: "Lithuanian Euro (EUR)" },
  { value: "Macanese Pataca (MOP)", label: "Macanese Pataca (MOP)" },
  { value: "Macedonian Denar (MKD)", label: "Macedonian Denar (MKD)" },
  { value: "Malagasy Ariary (MGA)", label: "Malagasy Ariary (MGA)" },
  { value: "Malawian Kwacha (MWK)", label: "Malawian Kwacha (MWK)" },
  { value: "Malaysian Ringgit (MYR)", label: "Malaysian Ringgit (MYR)" },
  { value: "Maldivian Rufiyaa (MVR)", label: "Maldivian Rufiyaa (MVR)" },
  { value: "Malian CFA Franc (XOF)", label: "Malian CFA Franc (XOF)" },
  { value: "Maltese Euro (EUR)", label: "Maltese Euro (EUR)" },
  { value: "Marshall Islands Dollar (USD)", label: "Marshall Islands Dollar (USD)" },
  { value: "Mauritanian Ouguiya (MRU)", label: "Mauritanian Ouguiya (MRU)" },
  { value: "Mauritian Rupee (MUR)", label: "Mauritian Rupee (MUR)" },
  { value: "Mexican Peso (MXN)", label: "Mexican Peso (MXN)" },
  { value: "Micronesian Dollar (USD)", label: "Micronesian Dollar (USD)" },
  { value: "Moldovan Leu (MDL)", label: "Moldovan Leu (MDL)" },
  { value: "Monégasque Euro (EUR)", label: "Monégasque Euro (EUR)" },
  { value: "Mongolian Tögrög (MNT)", label: "Mongolian Tögrög (MNT)" },
  { value: "Moroccan Dirham (MAD)", label: "Moroccan Dirham (MAD)" },
  { value: "Mozambican Metical (MZN)", label: "Mozambican Metical (MZN)" },
  { value: "Myanmar Kyat (MMK)", label: "Myanmar Kyat (MMK)" },
  { value: "Namibian Dollar (NAD)", label: "Namibian Dollar (NAD)" },
  { value: "Nauruan Dollar (AUD)", label: "Nauruan Dollar (AUD)" },
  { value: "Nepalese Rupee (NPR)", label: "Nepalese Rupee (NPR)" },
  { value: "Netherlands Euro (EUR)", label: "Netherlands Euro (EUR)" },
  { value: "New Zealand Dollar (NZD)", label: "New Zealand Dollar (NZD)" },
  { value: "Nicaraguan Córdoba (NIO)", label: "Nicaraguan Córdoba (NIO)" },
  { value: "Nigerian Naira (NGN)", label: "Nigerian Naira (NGN)" },
  { value: "North Korean Won (KPW)", label: "North Korean Won (KPW)" },
  { value: "Norwegian Krone (NOK)", label: "Norwegian Krone (NOK)" },
  { value: "Omani Rial (OMR)", label: "Omani Rial (OMR)" },
  { value: "Pakistani Rupee (PKR)", label: "Pakistani Rupee (PKR)" },
  { value: "Palauan Dollar (USD)", label: "Palauan Dollar (USD)" },
  { value: "Panamanian Balboa (PAB)", label: "Panamanian Balboa (PAB)" },
  { value: "Papua New Guinean Kina (PGK)", label: "Papua New Guinean Kina (PGK)" },
  { value: "Paraguayan Guaraní (PYG)", label: "Paraguayan Guaraní (PYG)" },
  { value: "Peruvian Sol (PEN)", label: "Peruvian Sol (PEN)" },
  { value: "Philippine Peso (PHP)", label: "Philippine Peso (PHP)" },
  { value: "Polish Zloty (PLN)", label: "Polish Zloty (PLN)" },
  { value: "Portuguese Euro (EUR)", label: "Portuguese Euro (EUR)" },
  { value: "Qatari Riyal (QAR)", label: "Qatari Riyal (QAR)" },
  { value: "Romanian Leu (RON)", label: "Romanian Leu (RON)" },
  { value: "Russian Ruble (RUB)", label: "Russian Ruble (RUB)" },
  { value: "Rwandan Franc (RWF)", label: "Rwandan Franc (RWF)" },
  { value: "Saint Kitts and Nevis Dollar (XCD)", label: "Saint Kitts and Nevis Dollar (XCD)" },
  { value: "Saint Lucia Dollar (XCD)", label: "Saint Lucia Dollar (XCD)" },
  { value: "Saint Vincent and the Grenadines Dollar (XCD)", label: "Saint Vincent and the Grenadines Dollar (XCD)" },
  { value: "Samoan Tala (WST)", label: "Samoan Tala (WST)" },
  { value: "San Marino Euro (EUR)", label: "San Marino Euro (EUR)" },
  { value: "São Tomé and Príncipe Dobra (STN)", label: "São Tomé and Príncipe Dobra (STN)" },
  { value: "Saudi Riyal (SAR)", label: "Saudi Riyal (SAR)" },
  { value: "Serbian Dinar (RSD)", label: "Serbian Dinar (RSD)" },
  { value: "Seychellois Rupee (SCR)", label: "Seychellois Rupee (SCR)" },
  { value: "Sierra Leonean Leone (SLL)", label: "Sierra Leonean Leone (SLL)" },
  { value: "Singapore Dollar (SGD)", label: "Singapore Dollar (SGD)" },
  { value: "Slovak Euro (EUR)", label: "Slovak Euro (EUR)" },
  { value: "Slovenian Euro (EUR)", label: "Slovenian Euro (EUR)" },
  { value: "Solomon Islands Dollar (SBD)", label: "Solomon Islands Dollar (SBD)" },
  { value: "Somali Shilling (SOS)", label: "Somali Shilling (SOS)" },
  { value: "South African Rand (ZAR)", label: "South African Rand (ZAR)" },
  { value: "South Korean Won (KRW)", label: "South Korean Won (KRW)" },
  { value: "South Sudanese Pound (SSP)", label: "South Sudanese Pound (SSP)" },
  { value: "Spanish Euro (EUR)", label: "Spanish Euro (EUR)" },
  { value: "Sri Lankan Rupee (LKR)", label: "Sri Lankan Rupee (LKR)" },
  { value: "Sudanese Pound (SDG)", label: "Sudanese Pound (SDG)" },
  { value: "Surinamese Dollar (SRD)", label: "Surinamese Dollar (SRD)" },
  { value: "Swazi Lilangeni (SZL)", label: "Swazi Lilangeni (SZL)" },
  { value: "Swedish Krona (SEK)", label: "Swedish Krona (SEK)" },
  { value: "Swiss Franc (CHF)", label: "Swiss Franc (CHF)" },
  { value: "Syrian Pound (SYP)", label: "Syrian Pound (SYP)" },
  { value: "Taiwanese Dollar (TWD)", label: "Taiwanese Dollar (TWD)" },
  { value: "Tajikistani Somoni (TJS)", label: "Tajikistani Somoni (TJS)" },
  { value: "Tanzanian Shilling (TZS)", label: "Tanzanian Shilling (TZS)" },
  { value: "Thai Baht (THB)", label: "Thai Baht (THB)" },
  { value: "Tongan Paʻanga (TOP)", label: "Tongan Paʻanga (TOP)" },
  { value: "Trinidad and Tobago Dollar (TTD)", label: "Trinidad and Tobago Dollar (TTD)" },
  { value: "Tunisian Dinar (TND)", label: "Tunisian Dinar (TND)" },
  { value: "Turkish Lira (TRY)", label: "Turkish Lira (TRY)" },
  { value: "Turkmenistani Manat (TMT)", label: "Turkmenistani Manat (TMT)" },
  { value: "Tuvaluan Dollar (AUD)", label: "Tuvaluan Dollar (AUD)" },
  { value: "Ugandan Shilling (UGX)", label: "Ugandan Shilling (UGX)" },
  { value: "Ukrainian Hryvnia (UAH)", label: "Ukrainian Hryvnia (UAH)" },
  { value: "United Arab Emirates Dirham (AED)", label: "United Arab Emirates Dirham (AED)" },
  { value: "United States Dollar (USD)", label: "United States Dollar (USD)" },
  { value: "Uruguayan Peso (UYU)", label: "Uruguayan Peso (UYU)" },
  { value: "Uzbekistani Som (UZS)", label: "Uzbekistani Som (UZS)" },
  { value: "Vanuatu Vatu (VUV)", label: "Vanuatu Vatu (VUV)" },
  { value: "Venezuelan Bolívar (VES)", label: "Venezuelan Bolívar (VES)" },
  { value: "Vietnamese Dong (VND)", label: "Vietnamese Dong (VND)" },
  { value: "Yemeni Rial (YER)", label: "Yemeni Rial (YER)" },
  { value: "Zambian Kwacha (ZMW)", label: "Zambian Kwacha (ZMW)" },
  { value: "Zimbabwean Dollar (ZWL)", label: "Zimbabwean Dollar (ZWL)" },
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

// Define clientRoles explicitly to match TableModel
const clientRoles = [
  { label: "Campaign Viewer", value: "viewer" },
  { label: "Client Campaign Approver", value: "client_approver" },
];

const agencyRoles = [
  { label: "Campaign Creator", value: "agency_creator" },
  { label: "Agency Campaign Approver", value: "agency_approver" },
  { label: "Financial Approver", value: "financial_approver" },
];




export {
  months,
  kpiCategories,
  categoryOrder,
  selectCurrency,
  agencyRoles,
  clientRoles,
  selectCountry,
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
  cleanName
};
