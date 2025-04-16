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
    } catch (error) { 
    }
  };
  