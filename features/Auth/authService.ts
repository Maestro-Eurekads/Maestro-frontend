import axios from 'axios'  
 
 
  
   
 //  Login user 
 const login = async (input: void ) => { 
   const { data } = await axios.post(  `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local`,input)  
  return data
}
 
 //  SignUp user 
 const signUp = async (input: void ) => { 
   const { data } = await axios.post(  `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local/register`,input)  
  return data
}
 
  


const authService = { login ,signUp}

export default authService
