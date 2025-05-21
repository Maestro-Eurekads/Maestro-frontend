
import { authOptions } from "utils/auth";
import Homepage from "./homepage/page";
import { getServerSession } from "next-auth";
import ClientView from "./client/ClientView";

export default async function Home() {
  const token = await getServerSession(authOptions);

  // @ts-ignore
  const userType = token?.user?.data?.user?.user_type;
  const isClient = userType === "client" || userType === "client_approver";

  return isClient ? <ClientView /> : <Homepage />;

}
