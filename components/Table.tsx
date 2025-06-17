
"use client";

import Image from "next/image";
import edit from "../public/ri-edit-line.svg";
import share from "../public/ri-share-box-line.svg";
import line from "../public/ri-file-copy-line.svg";
import ProgressBar from "./ProgressBar";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { useRouter } from "next/navigation";
import { cleanName, getFirstLetters, NoRecordFound, SVGLoaderFetch } from "./Options";
import { useCampaignSelection } from "../app/utils/CampaignSelectionContext";
import { useEffect, useState } from "react";
import Modal from "./Modals/Modal";
import { removeKeysRecursively } from "utils/removeID";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useActive } from "app/utils/ActiveContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrencySymbol } from "./data";
import { useSession } from "next-auth/react";

interface Campaign {
  isApprove: any;
  id: string;
  internal_approver: string;
  campaign_builder: string;
  documentId: string;
  media_plan_details: {
    plan_name: string;
    client_approver: string;
    internal_approver: string;
    approved_by: string;
  };
  budget_details: {
    value: number;
    currency: string;
  };
  campaign_budget?: {
    amount: number;
    currency: string;
  };
  progress_percent: number;
  copyCount: number;
}

interface ClientPO {
  PO_number: string;
  assigned_media_plans: { campaign: { id: string }; amount: number }[];
  PO_currency: string;
  PO_status: string;
}

const Table = () => {
  const {
    clientCampaignData,
    loading,
    setClientCampaignData,
    allClients,
    fetchingPO,
    clientPOs,
    jwt
  } = useCampaigns();
  const { data: session } = useSession();
  // @ts-ignore 
  const userType = session?.user?.data?.user?.id || "";
  const { setSelectedCampaignId } = useCampaignSelection();
  const router = useRouter();
  const [openModal, setOpenModal] = useState("");
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [loadingg, setLoading] = useState(false);
  const { setActive } = useActive();
  const [clientId, setClientId] = useState<string | null>(null);



  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ensure it's an array and sort it by createdAt descending
  const campaignArray = Array.isArray(clientCampaignData)
    ? [...clientCampaignData]?.sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() -
        new Date(a?.createdAt || 0).getTime()
    )
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = campaignArray.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(campaignArray.length / itemsPerPage);




  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedClientId = localStorage.getItem(userType?.toString());
      setClientId(storedClientId);
    }
  }, [userType]);

  // Reset page if data length changes
  useEffect(() => {
    if (campaignArray?.length <= itemsPerPage && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [campaignArray?.length, itemsPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleDuplicateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const clean_data = removeKeysRecursively(selected, [
      "id",
      "documentId",
      "createdAt",
      "publishedAt",
      "updatedAt",
      "_aggregated",
    ]);
    const clientId = localStorage.getItem(userType?.toString());
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?populate=*`,
        {
          data: {
            ...clean_data,
            media_plan_details: {
              ...clean_data?.media_plan_details,
              plan_name: duplicateName
                ? duplicateName
                : `${clean_data?.media_plan_details?.plan_name}-copy-${(selected?.copyCount || 0) + 1}`,
            },
            client: clientId ? clientId : allClients[0]?.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setClientCampaignData((prev: Campaign[]) => [...prev, res?.data?.data]);
      setOpenModal("");
      setDuplicateName("");
      setSelected(null);
      await updateOrignalCmapignCount(selected?.documentId, (selected?.copyCount || 0) + 1);
    } catch (err) {
      console.error("Error duplicating campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrignalCmapignCount = async (id: string, count: number) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${id}`,
        {
          data: {
            copyCount: count,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
    } catch (err) {
      console.error("Error updating campaign count:", err);
    }
  };






  return (
    <div className="flex flex-col overflow-x-scroll">
      <div className="table-container  mt-[20px] ">
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-[12px] px-[16px]">Name</th>
              <th className="py-[12px] px-[16px]">Version</th>
              <th className="py-[12px] px-[16px]">Progress</th>
              <th className="py-[12px] px-[16px]">Status</th>
              <th className="py-[12px] px-[16px]">Budget</th>
              <th className="py-[12px] px-[16px] whitespace-nowrap text-center">
                Purchase Order <br />
                <p className="text-center">(PO Number, Amount)</p>
              </th>
              <th className="py-[12px] px-[16px] whitespace-nowrap">Made by</th>
              <th className="py-[12px] px-[16px] whitespace-nowrap">Approved by</th>
              <th className="py-[12px] px-[16px] text-center w-[400px]">Actions</th>
            </tr>
          </thead>
          <tbody className="data-table-content">
            {loading || fetchingPO ? (
              <SVGLoaderFetch colSpan={9} text={"Loading client campaigns"} />
            ) : campaignArray?.length === 0 ? (
              <NoRecordFound colSpan={9}>No Client campaigns!</NoRecordFound>
            ) : (
              currentItems?.map((data: Campaign) => {
                const POs = clientPOs?.reduce((acc: any[], po: ClientPO) => {
                  const matchedPlan = po?.assigned_media_plans?.find(
                    (plan) => plan?.campaign?.id === data?.id
                  );
                  if (matchedPlan) {
                    acc.push({
                      PO_number: po?.PO_number,
                      amount: `${getCurrencySymbol(po?.PO_currency)}${Number(
                        matchedPlan?.amount
                      ).toLocaleString()}`,
                      status: po?.PO_status,
                    });
                  }
                  return acc;
                }, []) || [];
                return (
                  <tr
                    key={data?.id || data?.documentId} // Fallback to documentId if id is undefined
                    onClick={() => {
                      setSelectedCampaignId(data?.documentId);
                      const activeStepFromPercentage = Math.ceil(
                        (data?.progress_percent * 10) / 100
                      );
                      setActive(activeStepFromPercentage === 0 ? 1 : activeStepFromPercentage);
                      router.push(`/creation?campaignId=${data?.documentId}`);
                    }}
                    className="cursor-pointer"
                  >
                    <td className=" py-[12px] px-[16px] ">
                      {data?.media_plan_details?.plan_name || "N/A"} -{" "}
                      {data?.progress_percent < 100 ? "Running" : "Completed"}
                    </td>
                    <td className="py-[12px] px-[16px]">V9</td>
                    <td className="py-[12px] px-[16px]">
                      <ProgressBar progress={data?.progress_percent || 0} />
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className={data?.isApprove ? "approved" : "Not_Approved"}>
                        {data?.isApprove ? "Approved" : "Not Approved"}</div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="flex felx-row  gap-1">
                        <div>
                          {!data?.campaign_budget?.amount
                            ? "N/A"
                            : Number(
                              typeof data?.campaign_budget?.amount === "string"  //@ts-ignore
                                ? data?.campaign_budget?.amount.replace(/[^\d.-]/g, "")
                                : data?.campaign_budget?.amount
                            ).toLocaleString()}

                        </div>
                        <div>
                          {data?.campaign_budget?.currency
                            && !data?.campaign_budget
                              ?.currency.includes("%")
                            ? getCurrencySymbol(data?.campaign_budget
                              ?.currency)
                            : ""}
                        </div>
                      </div>


                    </td>
                    <td className="py-[12px] px-[16px]">
                      {POs?.length > 0 ? (
                        <div className="space-y-2">
                          {POs?.map((p) => (
                            <div key={p?.PO_number} className="flex gap-2">
                              <p
                                className={`${p?.status === "fully_paid" || p?.status === "reconcilled"
                                  ? "bg-green-400"
                                  : p?.status === "open"
                                    ? "bg-blue-400"
                                    : "bg-orange-400"
                                  } text-white text-xs px-3 py-1 rounded-full`}
                                title={p?.status?.replace("_", " ")?.toUpperCase()}
                              >
                                {p?.PO_number}
                              </p>
                              <p className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                {p?.amount}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center">-</p>
                      )}
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="flex items-center whitespace-nowrap gap-3">
                        <div className="view_content_table">
                          {/* @ts-ignore */}
                          {cleanName(getFirstLetters(data?.campaign_builder?.username || "-"))}
                        </div>
                        {/* @ts-ignore */}
                        {cleanName(data?.campaign_builder?.username) || "-"}
                      </div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="flex items-center whitespace-nowrap gap-3">
                        <div className="view_content_table"> {/* @ts-ignore */}
                          {/* @ts-ignore */}  {data?.media_plan_details?.approved_by?.length > 0 ? (
                            data?.media_plan_details?.approved_by?.map((approver: any, idx: number) => (
                              <span key={idx}>{cleanName(getFirstLetters(approver?.username)) || "-"}</span>
                            ))
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                        <p>
                          {/* @ts-ignore */}{data?.media_plan_details?.approved_by?.length > 0 ? (
                            data?.media_plan_details?.approved_by?.map((approver: any,
                              idx: number) => (
                              <span key={idx}>{cleanName(approver?.username) || "-"}</span>
                            ))
                          ) : (
                            <span>-</span>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="py-[12px] px-[16px] w-[120px]">
                      <div
                        className="flex items-center justify-center gap-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Image
                          src={edit || "/placeholder.svg"}
                          alt="edit"
                          onClick={() => {
                            const activeStepFromPercentage = Math.ceil(
                              (data?.progress_percent * 10) / 100
                            );
                            setActive(activeStepFromPercentage === 0 ? 1 : activeStepFromPercentage);
                            router.push(`/creation?campaignId=${data?.documentId}`);
                          }}
                        />
                        <Image
                          src={share || "/placeholder.svg"}
                          alt="share"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Image
                          src={line || "/placeholder.svg"}
                          alt="duplicate"
                          onClick={() => {
                            setOpenModal("copy");
                            setSelected(data);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loadingg && campaignArray?.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, campaignArray?.length)} of {campaignArray?.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:bg-blue-50"
                }`}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === number ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-50"
                  }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:bg-blue-50"
                }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-md p-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {openModal === "copy" && (
        <Modal isOpen={openModal === "copy"} onClose={() => setOpenModal("")}>
          <div className="bg-white shadow-md rounded-md w-[500px] p-4">
            <p className="text-center font-semibold text-[18px] mb-[14px]">
              Duplicate "{selected?.media_plan_details?.plan_name || "N/A"}"
            </p>
            <form onSubmit={handleDuplicateAction}>
              <label className="font-medium flex items-center gap-[5px]">
                New Media Plan Name{" "}
                <span className="text-[14px] text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md p-2 border my-[10px] outline-none"
                placeholder={`${selected?.media_plan_details?.plan_name || "N/A"}-copy`}
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
              <div className="flex justify-between items-center w-full gap-[20px] mt-[10px]">
                <button
                  type="button"
                  className="w-full rounded-md border bg-slate-200 p-2 text-[16px] font-semibold h-[40px]"
                  onClick={() => setOpenModal("")}
                  disabled={loadingg}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded-md border bg-blue-500 text-white p-2 text-[16px] font-semibold flex justify-center items-center h-[40px]"
                  disabled={loadingg}
                >
                  {loadingg ? <FaSpinner className="animate-spin" /> : "Duplicate"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Table;