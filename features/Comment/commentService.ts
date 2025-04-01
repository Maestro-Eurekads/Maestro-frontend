import axios from 'axios'  
 
 
  
   

 
 //  Create Comment
const getComment = async (inputs: any) => {  
  const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/comments`,{
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
     })    
  return response.data
}
 
 //  Get Created Client 
//  const getCreateClient = async () => { 
//    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,{
//         headers: {
//           Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
//         },
//    })  
  
//   return data
// }
    


const  clientService = { getComment }

export default  clientService
