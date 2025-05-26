"use client";

import { signOut, useSession } from "next-auth/react";
import React from "react";

function ClientView() {
  const { data: session } = useSession();
  // @ts-ignore
  const userType = session?.user?.data?.user?.id?.toString() || "";
  return (
    <div className="p-4">
      <p>Client View to be developed</p>
      <div
        className="text-[18px]"
        onClick={async () => {
          localStorage.removeItem("campaignFormData");
          localStorage.removeItem("selectedClient");
          localStorage.removeItem("profileclients");
          localStorage.removeItem(userType || "");
          await signOut({
            callbackUrl: "/",
          });
        }}
      >
        Logout
      </div>
    </div>
  );
}

export default ClientView;
