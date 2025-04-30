import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getUserPrivileges(): Promise<{ 
  isAdmin: boolean;  
  isAgencyCreator: boolean;
  isAgencyApprover: boolean;
  isFinancialApprover: boolean; 
  isClient: boolean; 
}> {
  const session = await getServerSession(authOptions);

	// Safely access user_type assuming it’s a string like "admin", "client", etc.
		// @ts-ignore  
	const userType = session?.user?.data?.user?.user_type || ""; 

  const isAdmin = userType === "admin";
  const isAgencyCreator = userType === "agency_creator";
  const isAgencyApprover = userType === "agency_approver";
  const isFinancialApprover = userType === "financial_approver";
  const isClient = userType === "client";

  return {  
    isAdmin,  
    isAgencyCreator,  
    isAgencyApprover,
    isFinancialApprover,
    isClient
  };
}
