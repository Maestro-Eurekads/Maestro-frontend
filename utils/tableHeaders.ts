const defaultHeaders = [
  { name: "Channel", showInput: false },
  { name: "Audience", showInput: false },
  { name: "Start Date", showInput: false },
  { name: "End Date", showInput: false },
  { name: "Audience Size", showInput: false },
  { name: "Budget Size", showInput: false },
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
    },
    {
      name: "Engagemnets",
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
    },
    {
      name: "Link Clicks",
      showInputs: false,
    },
    {
      name: "CPC",
      showInputs: false,
    },
  ],
  "Lead Generation": [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
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
      name: "CVR",
      showInput: true,
    },
    {
      name: "Lead",
      showInput: false,
    },
    {
      name: "CPL",
      showInput: false,
    },
  ],
  Purchase: [
    ...defaultHeaders,
    {
      name: "CTR",
      showInput: true,
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
    },
    {
      name: "Lead visits",
      showInput: false,
    },
    {
      name: "Cost / lead",
      showInput: false,
    },
    {
      name: "Off-funnel rate",
      showInput: true,
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
    },
    {
      name: "Conversion",
      showInput: false,
    },
    {
      name: "Cosy / conversion",
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
    },
    {
      name: "Conversion",
      showInput: false,
    },
    {
      name: "Cosy / conversion",
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
