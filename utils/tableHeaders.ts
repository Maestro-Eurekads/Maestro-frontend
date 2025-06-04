const defaultHeaders = [
  { name: "Channel", showInput: false },
  { name: "AdSets", showInput: false },
  { name: "Audience", showInput: false },
  { name: "Start Date", showInput: false },
  { name: "End Date", showInput: false },
  { name: "Audience Size", showInput: true, type: "number" },
  { name: "Budget Size", showInput: true, type:"currency" },
  { name: "CPM", showInput: true, type: "currency" },
  { name: "Impressions", showInput: false, type: "number" },
  { name: "Frequency", showInput: true, type: "number" },
  { name: "Reach", showInput: false, type: "number" },
  { name: "GRP", showInput: true, type: "number" },
];

export const tableHeaders = {
  "Brand Awareness": [...defaultHeaders],
  "Video Views": [
    ...defaultHeaders,
    {
      name: "VTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Video Views",
      showInput: false,
      type: "number"
    },
    {
      name: "CPV",
      showInput: false,
      type: "currency"
    },
    {
      name: "Completion Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Completed View",
      showInput: false,
      type: "number"
    },
    {
      name: "CPCV",
      showInput: false,
      type: "currency"
    },
  ],
  Engagement: [
    ...defaultHeaders,
    {
      name: "Eng Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Engagements",
      showInput: false,
      type: "number"
    },
    {
      name: "CPE",
      showInput: false,
      type: "currency"
    },
  ],
  "Website Traffic": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
      type: "number"
    },
    {
      name: "CPL",
      showInput: false,
      type: "currency"
    },
    {
      name: "Avg Visit Time",
      showInput: true,
      type: "seconds"
    },
    {
      name: "Avg pages / visit",
      showInput: true,
      type: "number"
    },
    {
      name: "Bounce Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Bounced Visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost/bounce",
      showInput: false,
      type: "currency"
    },
    {
      name: "Lead Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lead visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost/lead",
      showInput: false,
      type: "currency"
    },
    {
      name: "Off-funnel rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Off-funnel visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / Off funnel",
      showInput: false,
      type: "currency"
    },
  ],
  "Lead (On platform)": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Forms open",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / opened form",
      showInput: false,
      type: "currency"
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Leads",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / lead",
      showInput: false,
      type: "currency"
    },
  ],
  "Lead": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Forms open",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / opened form",
      showInput: false,
      type: "currency"
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Leads",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / lead",
      showInput: false,
      type: "currency"
    },
  ],
  "Lead (On website)": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
      type: "number"
    },
    {
      name: "CPL",
      showInput: false,
      type: "currency"
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Leads",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / lead",
      showInput: false,
      type: "currency"
    },
  ],
  Purchase: [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type:"currency"
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
      type: "number"
    },
    {
      name: "CPL",
      showInput: false,
      type: "currency"
    },
    {
      name: "Avg Visit Time",
      showInput: true,
      type: "seconds"
    },
    {
      name: "Avg pages / visit",
      showInput: true,
      type: "number"
    },
    {
      name: "Bounce Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Bounced Visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost/bounce",
      showInput: false,
      type: "currency"
    },
    {
      name: "Lead Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lead visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost/lead",
      showInput: false,
      type: "currency"
    },
    {
      name: "Off-funnel rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Off-funnel visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / Off funnel",
      showInput: false,
      type: "currency"
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Conversions",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost/conversion",
      showInput: false,
      type: "currency"
    },
    {
      name: "CLV of associated product",
      showInput: true,
      type: "currency"
    },
    {
      name: "Generated Revenue",
      showInput: false,
      type: "currency"
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
      type: "currency"
    },
  ],
  "Purchase (Pro)": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
      type: "number"
    },
    {
      name: "CPL",
      showInput: false,
      type: "currency"
    },
    {
      name: "Avg Visit Time",
      showInput: true,
      type: "seconds"
    },
    {
      name: "Avg pages / visit",
      showInput: true,
      type: "number"
    },
    {
      name: "Bounce Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Bounced Visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost/bounce",
      showInput: false,
      type: "currency"
    },
    {
      name: "Lead Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lead visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost/lead",
      showInput: false,
      type: "currency"
    },
    {
      name: "Off-funnel rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Off-funnel visits",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / Off funnel",
      showInput: false,
      type: "currency"
    },
    {
      name: "Add to cart rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Add to carts",
      showInput: false,
      type: "number"
    },
    {
      name: "CPATC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Payment info rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Payment infos",
      showInput: false,
      type: "number"
    },
    {
      name: "CPPI",
      showInput: false,
      type: "currency"
    },
    {
      name: "Purchase rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Purchases",
      showInput: false,
      type: "number"
    },
    {
      name: "CPP",
      showInput: false,
      type: "currency"
    },
    {
      name: "CLV of associated product",
      showInput: true,
      type: "currency"
    },
    {
      name: "Generated Revenue",
      showInput: false,
      type: "currency"
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
      type: "currency"
    },
  ],
  "App Install": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Install Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Installs",
      showInput: false,
      type: "number"
    },
    {
      name: "CPI",
      showInput: false,
      type: "currency"
    },
  ],
  "Conversions": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Open Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "App Open",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / App Open",
      showInput: false,
      type: "currency"
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Conversion",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / conversion",
      showInput: false,
      type: "currency"
    },
    {
      name: "CLV of associated product",
      showInput: true,
      type: "currency"
    },
    {
      name: "Generated Revenue",
      showInput: false,
      type: "currency"
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
      type: "currency"
    },
  ],
  "In App Conversion": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Open Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "App Open",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / App Open",
      showInput: false,
      type: "currency"
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Conversion",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / conversion",
      showInput: false,
      type: "currency"
    },
    {
      name: "CLV of associated product",
      showInput: true,
      type: "currency"
    },
    {
      name: "Generated Revenue",
      showInput: false,
      type: "currency"
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
      type: "currency"
    },
  ],
  "Physical Store Visit": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInput: false,
      type: "number"
    },
    {
      name: "CPC",
      showInput: false,
      type: "currency"
    },
    {
      name: "Open Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "App Open",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / App Open",
      showInput: false,
      type: "currency"
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Conversion",
      showInput: false,
      type: "number"
    },
    {
      name: "Cost / conversion",
      showInput: false,
      type: "currency"
    },
    {
      name: "CLV of associated product",
      showInput: true,
      type: "currency"
    },
    {
      name: "Generated Revenue",
      showInput: false,
      type: "currency"
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
      type: "currency"
    },
  ],
};

export const tableBody = Object.fromEntries(
    Object.entries(tableHeaders).map(([key, headers]) => [
        key,
        headers
            .filter((header) => typeof header !== "string")
            .map((header) =>
                header.name
                    .toLowerCase()
                    .replace(/ /g, "_")
                    .replace(/\//g, "")
                    .replace(/-/g, "_")
            ),
    ])
);