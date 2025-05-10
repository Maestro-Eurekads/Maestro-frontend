import axios from 'axios'  
 
 
  
   

 
 //  Create Comment
const getComment = async (commentId: any, client_commentId?: any) => {
  const filters: any = {
    "filters[commentId][$eq]": commentId,
  };

  if (client_commentId) {
    filters["filters[client_commentId][$eq]"] = client_commentId;
  }

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/comments`,
    {
      params: filters,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    }
  );

  return response.data;
};

 //  Cet Signed Approval
const getSignedApproval = async (id: any) => {  
  const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/client-signature-approvals`,{
      params: {
        "filters[clientId][$eq]": id, // Filtering by commentId
      },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    })    
  return response.data
}
 
 //  get General Comment
const getGeneralComment = async (commentId
: any) => {  
  const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/general-comments`,{
      params: {
        "filters[commentId][$eq]": commentId 
      },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    })    
  return response.data
}
 
 
const getCampaignById = async (clientId: string, campaignId: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?filters[user][id][$eq]=${clientId}&filters[documentId][$eq]=${campaignId}&populate=*`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    }
  );

  return response.data;
};

// const getCampaignById = async (campaignId: string) => {
//   const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignId}&populate=*`, {
//     headers: {
//       Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
//     },
//   });

//   return response.data;
// };
 
 


const  clientService = { getComment ,getSignedApproval ,getGeneralComment ,getCampaignById}

export default  clientService
