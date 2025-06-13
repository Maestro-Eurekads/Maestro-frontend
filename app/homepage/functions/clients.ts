import axios from "axios";

export const addNewClient = async (data: any, jwt:any) => {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,
    {
      data: { ...data },
    },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const addClientUser = async (userData: any, jwt:any) => {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/custom-register`,
    {
      ...userData,
    },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const checkExisitingEmails = async (emailList: any, jwt:any) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users`,
    {
      params: {
        filters: {
          email: {
            $in: emailList,
          },
        },
      },
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
  return response.data;
};

export const updateUsersWithCampaign = async (userIds: string[], campaignId: string, jwt:any) => {
  const updatePromises = userIds.map((userId) =>
    axios.put(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${userId}`,
      {
        campaigns: campaignId,
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
  );

  return await Promise.all(updatePromises);
};



export const updateClient = async (id: string, data: any) => {
  return await axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${id}`,
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
