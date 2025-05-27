import axios from "axios";

export const addNewClient = async (data: any) => {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,
    {
      data: { ...data },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    }
  );
};

export const addClientUser = async (userData: any) => {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local/register`,
    {
      ...userData,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    }
  );
};
