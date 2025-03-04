import axios from 'axios'  
 
 
  
   
 //  Create Client
const createClient = async (inputs: any) => { 
    const formattedData = {
    ...inputs,
    sports: inputs.sports.map((sport: string) => ({ id: sport })), 
    categories: inputs.categories.map((category: string) => ({ id: category })), 
    businessUnits: inputs.businessUnits.map((unit: string) => ({ id: unit }))
  };
   const response = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,
      {
    data: inputs,  
  })   
  return response.data
}
 
 //  Get Created Client 
 const getCreateClient = async (input: void ) => { 
   const { data } = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local/register`,input)  
  return data
}
 
  


const  clientService = { createClient , getCreateClient}

export default  clientService
