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

const calculateEngagements: FormulaFunction = (impression, engRate) => {
  return impression * engRate;
};

const calculateCPE: FormulaFunction = (budget, engagements) => {
  return budget / engagements;
};

export const calculateLinkClicks: FormulaFunction = (impression, ctr) => {
  return impression * ctr;
};

export const calculateCPC: FormulaFunction = (budget, linkClicks) => {
  return Math.round(budget / linkClicks);
};

export const calculateLands: FormulaFunction = (linkClicks, clr) => {
  return linkClicks * clr;
};

export const calculateCPL: FormulaFunction = (budget, lands) => {
  return Math.round(budget / lands);
};

const calculateBouncedVisits: FormulaFunction = (lands, br) => {
  return lands * br;
};

const calculateCostPerBounce: FormulaFunction = (budget, bouncedVisits) => {
  return budget / bouncedVisits;
};

const calculateLeadVisits: FormulaFunction = (lands, lr) => {
  return lands * lr;
};

const calculateCostPerLead: FormulaFunction = (budget, leadVisits) => {
  return budget / leadVisits;
};

const calculateConversion: FormulaFunction = (leadVisits, cvr) => {
  return leadVisits * cvr;
};

const calculateCostPerConversion: FormulaFunction = (budget, conversion) => {
  return budget / conversion;
};

const calculatePaymentInfo: FormulaFunction = (atc, pir) => {
  return atc * pir;
};

const calculateCPPI: FormulaFunction = (budg, pinfo) => {
  return budg / pinfo;
};

const calculatePurchases: FormulaFunction = (pinfo, pr) => {
  return pinfo * pr;
};

const calculateCPP:FormulaFunction = (budg, purchases)=>{
    return budg / purchases
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
