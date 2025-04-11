"use client";
import { useComments } from "app/utils/CommentProvider";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Approved from '../../components/Drawer/Approved';
import { useAppDispatch, useAppSelector } from "store/useStore";
import { useEffect } from "react";
import { getSignedApproval } from "features/Comment/commentSlice";
import Skeleton from "react-loading-skeleton";
import tickcircles from "../../public/solid_circle-check.svg";


const Header = ({ setIsOpen }) => {
  const { isDrawerOpen, setModalOpen, createApprovalSuccess, setCreateApprovalSuccess } = useComments();
  const { data: session }: any = useSession();
  const { dataApprove, isLoadingApprove, isSuccessApprove } = useAppSelector((state) => state.comment);
  const dispatch = useAppDispatch();
  const id = session?.user?.id;

  useEffect(() => {
    if (createApprovalSuccess) {
      setModalOpen(false);
      dispatch(getSignedApproval(id));
      setCreateApprovalSuccess(null);
    }
    dispatch(getSignedApproval(id));
  }, [dispatch, id, createApprovalSuccess]);

  const handleDrawerOpen = () => {
    setModalOpen(true);
    dispatch(getSignedApproval(id));
  };

  const isSignature = dataApprove?.[0]?.isSignature || false;


  return (
    <div
      id="client_header"
      className={`py-[2.8rem] px-[50px] ${isDrawerOpen ? 'md:px-[100px]' : 'xl:px-[300px]'} relative`}>
      <div className="flex flex-col">
        <button
          className="w-[35px] h-[22px] font-semibold text-[16px] leading-[22px] text-[#061237] font-[General Sans]">
          Nike
        </button>
        <h1 className="w-[348px] h-[32px] font-semibold text-[24px] leading-[32px] text-[#292929] font-[General Sans]"
        >
          Spring Collection Launch 2025
        </h1>
      </div>
      <div>
        {isLoadingApprove ? <Skeleton height={20} width={200} /> :
          <div>
            {isSignature ? <button
              className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start flex items-center	gap-[10px]"
              style={{ border: "1px solid #3175FF" }}
              onClick={handleDrawerOpen}>
              <Image src={tickcircles} alt="tickcircle" className="w-[18px] " />
              Approved
            </button> :
              <button
                className="bg-[#FAFDFF] text-[16px] font-[600] text-[#3175FF] rounded-[10px] py-[14px] px-6 self-start"
                style={{ border: "1px solid #3175FF" }}
                onClick={() => setIsOpen(true)}>
                Approve & Sign Media plan
              </button>}
          </div>
        }

      </div>
      {isDrawerOpen ? "" :
        <div
          className="text-[18px] absolute right-[30px] top-[20px] cursor-pointer"
          onClick={async () =>
            await signOut({
              callbackUrl: "/",
            })
          }
        >
          Logout
        </div>}

    </div >
  );
};

export default Header;
