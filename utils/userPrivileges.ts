import { useSession } from "next-auth/react";

export function useUserPrivileges() {
  const { data: session } = useSession();
 // @ts-ignore 
  const userType = session?.user?.data?.user?.user_type || "";
 // @ts-ignore
  const userID = session?.user?.data?.user?.id?.toString() || "";
  const isAdmin = userType === "admin";
  const isAgencyCreator = userType === "agency_creator";
  const isAgencyApprover = userType === "agency_approver";
  const isFinancialApprover = userType === "financial_approver";
  const isClientApprover = userType === "client_approver";
  const isClient = userType === "client"; // @ts-ignore 
  const loggedInUser  = session?.user?.data?.user;
  // @ts-ignore
  const agency_user = session?.user?.agency_user;

  return {
    isAdmin,
    isAgencyCreator,
    isAgencyApprover,
    isFinancialApprover,
    isClient,
    isClientApprover,
    loggedInUser,
    userID,
    agency_user
  };
}


