"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";


const Header = ({ setIsOpen }) => {


  return (
    <div id="client_header">
      <div className="flex flex-col">
        <button
          className="w-[35px] h-[22px] font-semibold text-[16px] leading-[22px] text-[#061237] font-[General Sans]"

          onClick={() => setIsOpen(true)}  >
          Nike
        </button>
        <h1 className="w-[348px] h-[32px] font-semibold text-[24px] leading-[32px] text-[#292929] font-[General Sans]"
        >
          Spring Collection Launch 2025
        </h1>
      </div>
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
};

export default Header;
