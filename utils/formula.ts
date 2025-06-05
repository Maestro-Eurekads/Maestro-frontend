type FormulaFunction = (a: number, b: number) => number;

export const calculateImpression: FormulaFunction = (budget, cpm) => {
  return (budget / cpm) * 1000;
};

export const calculateReach: FormulaFunction = (impression, freq) => {
  return impression / freq;
};

export const calculateVideoViews: FormulaFunction = (impression, VTR) => {
  return impression * VTR;
};

export const calculateCPV: FormulaFunction = (budget, videoViews) => {
  return budget / videoViews;
};

export const calculateCompletedView: FormulaFunction = (
  videoViews,
  completionRate
) => {
  return videoViews * completionRate;
};

export const calculateCPCV: FormulaFunction = (budget, completedViews) => {
  return budget / completedViews;
};

export const calculateEngagements: FormulaFunction = (impression, engRate) => {
  return impression * engRate;
};

export const calculateCPE: FormulaFunction = (budget, engagements) => {
  return budget / engagements;
};

export const calculateLinkClicks: FormulaFunction = (impression, ctr) => {
  return impression * ctr;
};

export const calculateCPC: FormulaFunction = (budget, linkClicks) => {
  return Number((budget / linkClicks));
};

export const calculateLands: FormulaFunction = (linkClicks, clr) => {
  return Number((linkClicks * clr));
};

export const calculateCPL: FormulaFunction = (budget, lands) => {
  return budget / lands
};

export const calculateBouncedVisits: FormulaFunction = (lands, br) => {
  return lands * br;
};

export const calculateCostPerBounce: FormulaFunction = (budget, bouncedVisits) => {
  return budget / bouncedVisits;
};

export const calculateLeadVisits: FormulaFunction = (lands, lr) => {
  return lands * lr;
};

export const calculateCostPerLead: FormulaFunction = (budget, leadVisits) => {
  return budget / leadVisits;
};

export const calculateConversion: FormulaFunction = (leadVisits, cvr) => {
  return leadVisits * cvr;
};

const calculateCostPerConversion: FormulaFunction = (budget, conversion) => {
  return budget / conversion;
};

export const calculatePaymentInfo: FormulaFunction = (atc, pir) => {
  return atc * pir;
};

const calculateCPPI: FormulaFunction = (budg, pinfo) => {
  return budg / pinfo;
};

export const calculatePurchases: FormulaFunction = (pinfo, pr) => {
  return pinfo * pr;
};

export const calculateCPP:FormulaFunction = (budg, purchases)=>{
    return budg / purchases
}

export const calculateAdReturn: FormulaFunction=(revenue, budget)=>{
  return revenue / budget
}


export const Formulas = {
  "Brand Awareness": {
    impression: calculateImpression,
    reach: calculateReach,
  },
  "Video Views": {
    impression: calculateImpression,
    reach: calculateReach,
    video_views: calculateVideoViews,
    cpv: calculateCPV,
    completed_views: calculateCompletedView,
    cpcv: calculateCPCV,
  },
  Engagement: {
    impression: calculateImpression,
    reach: calculateReach,
    engagements: calculateEngagements,
    cpe: calculateCPE,
  },
  Traffic: {
    impression: calculateImpression,
    reach: calculateReach,
    link_clicks: calculateLinkClicks,
    cpc: calculateCPC,
    lands: calculateLands,
    cpl: calculateCPL,
    bounced_visits: calculateBouncedVisits,
    cost_bounce: calculateCostPerBounce,
    lead_visits: calculateLeadVisits,
    cost_per_lead: calculateCostPerLead,
  },
  "Lead Generation": {
    impression: calculateImpression,
    reach: calculateReach,
    forms_open: calculateLinkClicks,
    link_clicks: calculateLinkClicks,
    cpc: calculateCPC,
    lands: calculateLands,
    cpl: calculateCPL,
  },
  Purchase: {
    impression: calculateImpression,
    reach: calculateReach,
    link_clicks: calculateLinkClicks,
    cpc: calculateCPC,
    lands: calculateLands,
    cpl: calculateCPL,
    bounced_visits: calculateBouncedVisits,
    cost_bounce: calculateCostPerBounce,
    lead_visits: calculateLeadVisits,
    cost_per_lead: calculateCostPerLead,
    conversion: calculateConversion,
    cost_per_conversion: calculateCostPerConversion,
  },
  "App Install": {
    impression: calculateImpression,
    reach: calculateReach,
    link_clicks: calculateLinkClicks,
    cpc: calculateCPC,
    lands: calculateLands,
    cpl: calculateCPL,
  },
  "In App Conversion": {
    impression: calculateImpression,
    reach: calculateReach,
    link_clicks: calculateLinkClicks,
    cpc: calculateCPC,
    lands: calculateLands,
    cpl: calculateCPL,
    conversion: calculateConversion,
    cost_per_conversion: calculateCostPerConversion,
  }
};
