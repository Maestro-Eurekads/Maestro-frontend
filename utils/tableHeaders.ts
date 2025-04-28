const defaultHeaders = [
  { name: "Channel", showInput: false },
  { name: "Audience", showInput: false },
  { name: "Start Date", showInput: false },
  { name: "End Date", showInput: false },
  { name: "Audience Size", showInput: false },
  { name: "Budget Size", showInput: true },
  { name: "CPM", showInput: true },
  { name: "Impressions", showInput: false },
  { name: "Frequency", showInput: true },
  { name: "Reach", showInput: false },
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
    },
    {
      name: "CPV",
      showInput: false,
    },
    {
      name: "Completion Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Completed View",
      showInput: false,
    },
    {
      name: "CPCV",
      showInput: false,
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
    },
    {
      name: "CPE",
      showInput: false,
    },
  ],
  Traffic: [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInputs: false,
    },
    {
      name: "CPC",
      showInputs: false,
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
    },
    {
      name: "CPL",
      showInput: false,
    },
    {
      name: "Avg Visit Time",
      showInput: true,
    },
    {
      name: "Avg pages / visit",
      showInput: true,
    },
    {
      name: "Bounce Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Bounced Visits",
      showInput: false,
    },
    {
      name: "Cost/bounce",
      showInput: false,
    },
    {
      name: "Lead Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lead visits",
      showInput: false,
    },
    {
      name: "Cost/lead",
      showInput: false,
    },
    {
      name: "Off-funnel rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Off-funnel visits",
      showInput: false,
    },
    {
      name: "Cost / Off funnel",
      showInput: false,
    },
  ],
  "Website Traffic": [
    // ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInputs: false,
    },
    {
      name: "CPC",
      showInputs: false,
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
    },
    {
      name: "CPL",
      showInput: false,
    },
    {
      name: "Avg Visit Time",
      showInput: true,
    },
    {
      name: "Avg pages / visit",
      showInput: true,
    },
    {
      name: "Bounce Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Bounced Visits",
      showInput: false,
    },
    {
      name: "Cost/bounce",
      showInput: false,
    },
    {
      name: "Lead Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lead visits",
      showInput: false,
    },
    {
      name: "Cost/lead",
      showInput: false,
    },
    {
      name: "Off-funnel rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Off-funnel visits",
      showInput: false,
    },
    {
      name: "Cost / Off funnel",
      showInput: false,
    },
  ],
  "Lead Generation (On platform)": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Forms open",
      showInputs: false,
    },
    {
      name: "Cost / opened form",
      showInputs: false,
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Leads",
      showInput: false,
    },
    {
      name: "Cost / lead",
      showInput: false,
    },
  ],
  "Lead Generation (On website)": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link clicks",
      showInputs: false,
    },
    {
      name: "CPC",
      showInputs: false,
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
    },
    {
      name: "CPL",
      showInput: false,
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Leads",
      showInput: false,
    },
    {
      name: "Cost / lead",
      showInput: false,
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
    },
    {
      name: "CPC",
      showInput: false,
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
    },
    {
      name: "CPL",
      showInput: false,
    },
    {
      name: "Avg Visit Time",
      showInput: true,
    },
    {
      name: "Avg pages / visit",
      showInput: true,
    },
    {
      name: "Bounce Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Bounced Visits",
      showInput: false,
    },
    {
      name: "Cost/bounce",
      showInput: false,
    },
    {
      name: "Lead Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lead visits",
      showInput: false,
    },
    {
      name: "Cost/lead",
      showInput: false,
    },
    {
      name: "Off-funnel rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Off-funnel visits",
      showInput: false,
    },
    {
      name: "Cost / Off funnel",
      showInput: false,
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Conversions",
      showInput: false,
    },
    {
      name: "Cost/conversion",
      showInput: false,
    },
    {
      name: "CLV of associated product",
      showInput: true,
    },
    {
      name: "Generated Revenue",
      showInput: false,
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
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
    },
    {
      name: "CPC",
      showInput: false,
    },
    {
      name: "Click to land rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lands",
      showInput: false,
    },
    {
      name: "CPL",
      showInput: false,
    },
    {
      name: "Avg Visit Time",
      showInput: true,
    },
    {
      name: "Avg pages / visit",
      showInput: true,
    },
    {
      name: "Bounce Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Bounced Visits",
      showInput: false,
    },
    {
      name: "Cost/bounce",
      showInput: false,
    },
    {
      name: "Lead Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Lead visits",
      showInput: false,
    },
    {
      name: "Cost/lead",
      showInput: false,
    },
    {
      name: "Off-funnel rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Off-funnel visits",
      showInput: false,
    },
    {
      name: "Cost / Off funnel",
      showInput: false,
    },
    {
      name: "Add to cart rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Add to carts",
      showInput: false,
    },
    {
      name: "CPATC",
      showInput: false,
    },
    {
      name: "Payment info rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Payment infos",
      showInput: false,
    },
    {
      name: "CPPI",
      showInput: false,
    },
    {
      name: "Purchase rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Purchases",
      showInput: false,
    },
    {
      name: "CPP",
      showInput: false,
    },
    {
      name: "CLV of associated product",
      showInput: true,
    },
    {
      name: "Generated Revenue",
      showInput: false,
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
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
    },
    {
      name: "CPC",
      showInput: false,
    },
    {
      name: "Install Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "Installs",
      showInput: false,
    },
    {
      name: "CPI",
      showInput: false,
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
    },
    {
      name: "CPC",
      showInput: false,
    },
    {
      name: "Open Rate",
      showInput: true,
      type: "percent"
    },
    {
      name: "App Open",
      showInput: false,
    },
    {
      name: "Cost / App Open",
      showInput: false,
    },
    {
      name: "CVR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Conversion",
      showInput: false,
    },
    {
      name: "Cost / conversion",
      showInput: false,
    },
    {
      name: "CLV of associated product",
      showInput: true,
    },
    {
      name: "Generated Revenue",
      showInput: false,
    },
    {
      name: "Return on Ad Spent",
      showInput: false,
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
