
import { MdOutlineErrorOutline } from "react-icons/md";
import { SVGLoader } from "./SVGLoader";
import React from "react";



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
    if (value === undefined || value === null) {
      if (kpiName.includes("Cost") || kpiName.includes("CPL")) return "$0";
      if (kpiName.includes("Rate") || ["CTR", "CVR", "Frequency"].includes(kpiName)) return "0%";
      return "0";
    }
    const formattedValue = value.toString();
    if (kpiName.includes("Cost") || kpiName.includes("CPL")) return `$${formattedValue}`;
    if (kpiName.includes("Rate") || ["CTR", "CVR", "Frequency"].includes(kpiName)) return `${formattedValue}%`;
    return formattedValue;
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
        kpi: groupedKPIs, // Fixed: Changed zonedKPIs to groupedKPIs
      });
    });
  });

  return result;
}


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

  Object.keys(extractedData).forEach((funnelStage) => {
    const platforms = extractedData[funnelStage] || [];

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
        aggregatedStats[category][kpiData?.displayName] = Number(average.toFixed(2));
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
  const parts = name.split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`
    : parts[0][0];
};



export {
  kpiCategories,
  categoryOrder,
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
