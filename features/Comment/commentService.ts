import axios from 'axios'  
 
 
  
   

 
 //  Create Comment
const getComment = async (commentId: any) => {  
  const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/comments`,{
      params: {
        "filters[commentId][$eq]": commentId, // Filtering by commentId
      },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    })    
  return response.data
}
 

 
 


const  clientService = { getComment }

export default  clientService
