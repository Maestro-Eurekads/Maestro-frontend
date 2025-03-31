"use client";

import { signOut } from "next-auth/react";
import React from "react";

function ClientView() {
  return (
    <div className="p-4">
      <p>Client View to be developed</p>
      <div
      className="text-[18px]"
        onClick={async () =>
          await signOut({
            callbackUrl: "/",
          })
        }
      >
        Logout
      </div>
    </div>
  );
}

export default ClientView;
