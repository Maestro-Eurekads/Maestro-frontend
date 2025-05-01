import { useSession } from "next-auth/react";

export function useUserPrivileges() {
  const { data: session } = useSession();
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
    isClient,
  };
}


