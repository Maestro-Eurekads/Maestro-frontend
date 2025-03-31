import { authOptions } from "utils/auth";
import Homepage from "./homepage/page";
import { getServerSession } from "next-auth";
import Login from "features/Login";
import ClientView from "features/ClientView";

export default async function Home() {
  const token = await getServerSession(authOptions);
  console.log("🚀 ~ Home ~ token:", token);
  if (!token) {
    return <Login />;
  }
  // @ts-ignore
  return token?.user?.data?.user?.user_type === "admin" ? (
    <Homepage />
  ) : (
    <ClientView />
  );
}
