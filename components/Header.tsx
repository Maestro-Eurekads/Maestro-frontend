"use client";
import Image from "next/image";
import nike from "../public/nike.svg";
import plus from "../public/plus.svg";
import white from "../public/white-plus.svg";
import down from "../public/ri-arrow-down-s-line.svg";
import Link from "next/link";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { FiLoader } from "react-icons/fi";
import useCampaignHook from "../app/utils/useCampaignHook";
import { useEffect, useState } from "react";
import AllClientsCustomDropdown from "./AllClientsCustomDropdown";

const Header = ({ setIsOpen }) => {
  const { loadingClients, allClients, setClientCampaignData, setLoading } = useCampaigns();
  const [selected, setSelected] = useState("");
  const { fetchClientCampaign } = useCampaignHook();

  useEffect(() => {
    if (allClients) {
      setLoading(true);
      if (selected === "") {
        fetchClientCampaign(allClients[0]?.id)
          .then((res) => {
            setClientCampaignData(res?.data?.data);
          })
          .catch((err)=>{
            console.log("err", err)
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        fetchClientCampaign(selected)
          .then((res) => {
            setClientCampaignData(res?.data?.data);
          })
          .catch((err)=>{
            console.log("err", err)
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [selected, allClients]);

  return (
    <div id="header">
      <div className="flex items-center">
        {loadingClients && (
          <div className="flex items-center gap-2">
            {" "}
            <FiLoader className="animate-spin" />
            <p>Loading clients...</p>
          </div>
        )}
        {/* {!loadingClients && (
          <select
            name=""
            id=""
            className="bg-[#F7F7F7] border border-[#EFEFEF] rounded-[8px] py-[8px] px-[16px] outline-none text-[#061237] font-semibold text-[16px] min-w-[60px]"
            onChange={(e) => {
              setSelected(e.target.value);
            }}
          >
            {!loadingClients &&
              allClients &&
              allClients
                ?.filter((c) => c?.client_name)
                ?.map((cl) => (
                  <option key={cl?.id} value={cl?.id}>
                    {cl?.client_name}
                  </option>
                ))}
          </select>
        )} */}
        <AllClientsCustomDropdown setSelected={setSelected} selected={selected} allClients={allClients} loadingClients={loadingClients} />
        <button className="client_btn_text whitespace-nowrap" onClick={() => setIsOpen(true)}>
          {" "}
          <Image src={plus} alt="plus" />
          New Client
        </button>
      </div>

      <div className="profiledropdown_container_main">
        <div className="profiledropdown_container">
          <Link href={`/creation`}>
            <button className="new_plan_btn">
              <Image src={white} alt="white" />
              <p className="new_plan_btn_text">New media plan</p>
            </button>
          </Link>
          <div className="profile_container">MD</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
