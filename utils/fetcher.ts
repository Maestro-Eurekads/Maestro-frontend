/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetcher = async (url: any, options = {}) => {
  let response;
  try {
    if (!options) {
      response = await fetch(url);
    } else {
      response = await fetch(url, options);
    }
    const data = await response.json();
    if (
      data?.error?.status == 401 &&
      !window?.location?.pathname?.includes("sign-in")
    ) {
      return;
    }
    return data;
  } catch (error) {}
};

const channelKeys = [
  "social_media",
  "display_networks",
  "search_engines",
  "streaming",
  "ooh",
  "broadcast",
  "messaging",
  "print",
  "e_commerce",
  "in_game",
  "mobile",
];

// Build the nested populate structure for ad_sets inside each channel
const nestedAdSetPopulate = {
  ad_sets: {
    populate: {
      format: {
        populate: ["previews"],
      },
      kpi: "*",
      budget: "*",
    },
  },
};

export const channelMixPopulate = {};
channelKeys.forEach((key) => {
  channelMixPopulate[key] = {
    populate: {
      format: {
        populate: ["previews"],
      },
      budget: "*",
      kpi: "*",
      ...nestedAdSetPopulate,
    },
  };
});
