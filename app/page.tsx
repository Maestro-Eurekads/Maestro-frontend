"use client";
import { authOptions } from "utils/auth";
import Homepage from "./homepage/page";
import { getServerSession } from "next-auth";
import Login from "features/Login";
import ClientView from "./client/ClientView";

export default async function Home() {
  const token = await getServerSession(authOptions);

  // const {
  //   isAdmin,
  //   isAgencyCreator,
  //   isAgencyApprover,
  //   isFinancialApprover
  // } = await getUserPrivileges();

  // const hasPrivilegedAccess = isAdmin || isAgencyCreator || isAgencyApprover || isFinancialApprover;
  // @ts-ignore
  return token?.user?.data?.user?.user_type === "admin" || "agency_creator" || "agency_approver" || "financial_approver" ? (
    <Homepage />
  ) : (
    <ClientView />
  );

}
