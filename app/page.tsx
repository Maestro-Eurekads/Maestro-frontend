
import { authOptions } from "utils/auth";
import Homepage from "./homepage/page";
import { getServerSession } from "next-auth";
import Login from "features/Login";
import ClientView from "./client/ClientView";

export default async function Home() {
  const token = await getServerSession(authOptions);
  // @ts-ignore
console.log(token?.user?.data?.user?.user_type)
  // @ts-ignore
  return token?.user?.data?.user?.user_type === "client" ? (
    <ClientView />
  ) : (
    <Homepage />
  );

}
