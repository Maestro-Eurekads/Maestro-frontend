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
    },
    {
      name: "CPE",
      showInput: false,
      type: "currency"
    },
  ],
  // Traffic: [
  //   ...defaultHeaders,
  //   {
  //     name: "CTR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Link Clicks",
  //     showInputs: false,
  //     type: "number"
  //   },
  //   {
  //     name: "CPC",
  //     showInputs: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Click to land rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Lands",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "CPL",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Avg Visit Time",
  //     showInput: true,
  //     type: "seconds"
  //   },
  //   {
  //     name: "Avg pages / visit",
  //     showInput: true,
  //     type: "number"
  //   },
  //   {
  //     name: "Bounce Rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Bounced Visits",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost/bounce",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Lead Rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Lead visits",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost/lead",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Off-funnel rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Off-funnel visits",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost / Off funnel",
  //     showInput: false,
  //     type: "currency"
  //   },
  // ],
  "Website Traffic": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Link Clicks",
      showInputs: false,
      type: "number"
    },
    {
      name: "CPC",
      showInputs: false,
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
  // "Lead Generation (On platform)": [
  //   ...defaultHeaders,
  //   {
  //     name: "CTR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Forms open",
  //     showInputs: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost / opened form",
  //     showInputs: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "CVR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Leads",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost / lead",
  //     showInput: false,
  //     type: "currency"
  //   },
  // ],
  "Lead": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
      type: "percent"
    },
    {
      name: "Forms open",
      showInputs: false,
      type: "number"
    },
    {
      name: "Cost / opened form",
      showInputs: false,
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
  // "Lead Generation (On website)": [
  //   ...defaultHeaders,
  //   {
  //     name: "CTR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Link clicks",
  //     showInputs: false,
  //     type: "number"
  //   },
  //   {
  //     name: "CPC",
  //     showInputs: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Click to land rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Lands",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "CPL",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "CVR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Leads",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost / lead",
  //     showInput: false,
  //     type: "currency"
  //   },
  // ],
  // Purchase: [
  //   ...defaultHeaders,
  //   {
  //     name: "CTR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Link Clicks",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "CPC",
  //     showInput: false,
  //     type:"currency"
  //   },
  //   {
  //     name: "Click to land rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Lands",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "CPL",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Avg Visit Time",
  //     showInput: true,
  //     type: "seconds"
  //   },
  //   {
  //     name: "Avg pages / visit",
  //     showInput: true,
  //     type: "number"
  //   },
  //   {
  //     name: "Bounce Rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Bounced Visits",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost/bounce",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Lead Rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Lead visits",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost/lead",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "Off-funnel rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Off-funnel visits",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost / Off funnel",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "CVR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Conversions",
  //     showInput: false,
  //     type: "number"
  //   },
  //   {
  //     name: "Cost/conversion",
  //     showInput: false,
  //     type: "currency"
  //   },
  //   {
  //     name: "CLV of associated product",
  //     showInput: true,
  //   },
  //   {
  //     name: "Generated Revenue",
  //     showInput: false,
  //   },
  //   {
  //     name: "Return on Ad Spent",
  //     showInput: false,
  //   },
  // ],
  // "Purchase (Pro)": [
  //   ...defaultHeaders,
  //   {
  //     name: "CTR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Link Clicks",
  //     showInput: false,
  //   },
  //   {
  //     name: "CPC",
  //     showInput: false,
  //   },
  //   {
  //     name: "Click to land rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Lands",
  //     showInput: false,
  //   },
  //   {
  //     name: "CPL",
  //     showInput: false,
  //   },
  //   {
  //     name: "Avg Visit Time",
  //     showInput: true,
  //   },
  //   {
  //     name: "Avg pages / visit",
  //     showInput: true,
  //   },
  //   {
  //     name: "Bounce Rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Bounced Visits",
  //     showInput: false,
  //   },
  //   {
  //     name: "Cost/bounce",
  //     showInput: false,
  //   },
  //   {
  //     name: "Lead Rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Lead visits",
  //     showInput: false,
  //   },
  //   {
  //     name: "Cost/lead",
  //     showInput: false,
  //   },
  //   {
  //     name: "Off-funnel rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Off-funnel visits",
  //     showInput: false,
  //   },
  //   {
  //     name: "Cost / Off funnel",
  //     showInput: false,
  //   },
  //   {
  //     name: "Add to cart rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Add to carts",
  //     showInput: false,
  //   },
  //   {
  //     name: "CPATC",
  //     showInput: false,
  //   },
  //   {
  //     name: "Payment info rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Payment infos",
  //     showInput: false,
  //   },
  //   {
  //     name: "CPPI",
  //     showInput: false,
  //   },
  //   {
  //     name: "Purchase rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Purchases",
  //     showInput: false,
  //   },
  //   {
  //     name: "CPP",
  //     showInput: false,
  //   },
  //   {
  //     name: "CLV of associated product",
  //     showInput: true,
  //   },
  //   {
  //     name: "Generated Revenue",
  //     showInput: false,
  //   },
  //   {
  //     name: "Return on Ad Spent",
  //     showInput: false,
  //   },
  // ],
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
      type: "number"
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
      type: "number"
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
  // "In App Conversion": [
  //   ...defaultHeaders,
  //   {
  //     name: "CTR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Link Clicks",
  //     showInput: false,
  //   },
  //   {
  //     name: "CPC",
  //     showInput: false,
  //   },
  //   {
  //     name: "Open Rate",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "App Open",
  //     showInput: false,
  //   },
  //   {
  //     name: "Cost / App Open",
  //     showInput: false,
  //   },
  //   {
  //     name: "CVR",
  //     showInput: true,
  //     type: "percent"
  //   },
  //   {
  //     name: "Conversion",
  //     showInput: false,
  //   },
  //   {
  //     name: "Cost / conversion",
  //     showInput: false,
  //   },
  //   {
  //     name: "CLV of associated product",
  //     showInput: true,
  //   },
  //   {
  //     name: "Generated Revenue",
  //     showInput: false,
  //   },
  //   {
  //     name: "Return on Ad Spent",
  //     showInput: false,
  //   },
  // ],
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
