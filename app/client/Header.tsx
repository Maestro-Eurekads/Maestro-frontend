"use client";
import { useComments } from "app/utils/CommentProvider";
import { signOut } from "next-auth/react";
import Image from "next/image";


const Header = ({ setIsOpen }) => {
  const { isDrawerOpen } = useComments();

  return (
    <div
      id="client_header"
      className={`py-[2.8rem] px-[50px] ${isDrawerOpen ? 'md:px-[100px]' : 'xl:px-[300px]'}`}
    >
      <div className="flex flex-col">
        <button
          className="w-[35px] h-[22px] font-semibold text-[16px] leading-[22px] text-[#061237] font-[General Sans]"  >
          Nike
        </button>
        <h1 className="w-[348px] h-[32px] font-semibold text-[24px] leading-[32px] text-[#292929] font-[General Sans]"
        >
          Spring Collection Launch 2025
        </h1>
      </div>
      {/* <div
        className="text-[18px]"
        onClick={async () =>
          await signOut({
            callbackUrl: "/",
          })
        }
      >
        Logout
      </div> */}
      <div>
        <button
          className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
          style={{ border: "1px solid #3175FF" }}
          onClick={() => setIsOpen(true)}
        >
          Approve & Sign Media plan
        </button>
      </div>
    </div >
  );
};

export default Header;
