
import { authOptions } from "utils/auth";
import Homepage from "./homepage/page";
import { getServerSession } from "next-auth";
import ClientView from "./client/ClientView";

export default async function Home() {
  const token = await getServerSession(authOptions);

  // @ts-ignore
<<<<<<< HEAD
  const userType = token?.user?.data?.user?.user_type;
  const isClient = userType === "client" || userType === "client_approver";

  return isClient ? <ClientView /> : <Homepage />;
=======
  return token?.user?.data?.user?.user_type === "client" ? (
    <ClientView />
  ) : (
    <Homepage />
  );
>>>>>>> b59150a9e7e84e9bdadb256b226046b36b54c867

}
