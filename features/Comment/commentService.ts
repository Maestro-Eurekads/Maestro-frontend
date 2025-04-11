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
 

 
 


const  clientService = { getComment ,getSignedApproval}

export default  clientService
