
import { MdOutlineErrorOutline } from "react-icons/md";
import { SVGLoader } from "./SVGLoader";



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
  getInitials
};
