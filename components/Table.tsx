"use client";

import Image from "next/image";
import edit from "../public/ri-edit-line.svg";
import share from "../public/ri-share-box-line.svg";
import line from "../public/ri-file-copy-line.svg";
import ProgressBar from "./ProgressBar";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { useRouter } from "next/navigation";
import { NoRecordFound, SVGLoaderFetch } from "./Options";
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

const Table = () => {
  const {
    clientCampaignData,
    loading,
    setClientCampaignData,
    allClients,
    fetchingPO,
    clientPOs,
  } = useCampaigns();
  const { data: session } = useSession();
  // @ts-ignore 
  const userType = session?.user?.data?.user?.id || "";
  const { setSelectedCampaignId } = useCampaignSelection();
  const router = useRouter();
  const [openModal, setOpenModal] = useState("");
  const [selected, setSelected] = useState<any>({});
  const [duplicateName, setDuplicateName] = useState("");
  const [loadingg, setLoading] = useState(false);
  const { setActive } = useActive();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get clientId from localStorage
  const clientId = localStorage.getItem("selectedClient");

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems =
    clientCampaignData?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil(
    (clientCampaignData?.length || 0) / itemsPerPage
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleDuplicateAction = async (e: any) => {
    e.preventDefault();
    if (!clientId && !allClients[0]?.id) {
      alert("No client selected or available to duplicate the campaign.");
      return;
    }

    const clean_data = removeKeysRecursively(selected, [
      "id",
      "documentId",
      "createdAt",
      "publishedAt",
      "updatedAt",
      "_aggregated",
    ]); 
    const clientId = localStorage.getItem(userType.toString()); 
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?populate=*`,
        {
          data: {
            ...clean_data,
            media_plan_details: {
              ...clean_data?.media_plan_details,
              plan_name: duplicateName
                ? duplicateName
                : `${clean_data?.media_plan_details?.plan_name}-copy-${
                    (selected?.copyCount || 0) + 1
                  }`,
            },
            client: clientId ? clientId : allClients[0]?.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      setClientCampaignData((prev) => [...prev, response?.data?.data]);
      setOpenModal("");
      setDuplicateName("");
      setSelected({});
      await updateOrignalCmapignCount(
        selected?.documentId,
        (selected?.copyCount || 0) + 1
      );
    } catch (err) {
      console.error("Error duplicating campaign:", err);
      alert("Failed to duplicate campaign. Please try again.");
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
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
    } catch (err) {
      console.error("Error updating campaign copy count:", err);
    }
  };

  // Reset pagination and clear campaigns when no client is selected
  useEffect(() => {
    if (!clientId) {
      setClientCampaignData([]); // Clear campaigns when no client is selected
      setCurrentPage(1);
    } else if (clientCampaignData?.length <= itemsPerPage && currentPage !== 1) {
      setCurrentPage(1);
    }
 
  }, [clientCampaignData, itemsPerPage]);

  const clientId = localStorage.getItem(userType.toString());
 
  }, [clientId, clientCampaignData, itemsPerPage, setClientCampaignData]);
 

  return (
    <div className="flex flex-col">
      <div className="table-container rounded-[8px] mt-[20px] overflow-x-auto">
        <table className="w-full min-w-[1200px]">
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
              <th className="py-[12px] px-[16px] whitespace-nowrap">
                Approved by
              </th>
              <th className="py-[12px] px-[16px] text-center w-[400px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="data-table-content">
            {loading || fetchingPO ? (
              <SVGLoaderFetch colSpan={9} text={"Loading client campaigns"} />
            ) : !clientId ? (
              <NoRecordFound colSpan={9}>
                No client selected. Please select a client to view campaigns.
              </NoRecordFound>
            ) : clientCampaignData?.length === 0 ? (
              <NoRecordFound colSpan={9}>
                No campaigns found for the selected client.
              </NoRecordFound>
            ) : (
              currentItems.map((data) => {
                let POs: { PO_number: string; amount: string; status: string }[] = [];
                clientPOs?.forEach((po) => {
                  const matchedPlan = po?.assigned_media_plans?.find(
                    (plan) => plan?.campaign?.id === data?.id
                  );
                  if (matchedPlan) {
                    POs.push({
                      PO_number: po?.PO_number,
                      amount: `${getCurrencySymbol(po?.PO_currency)}${Number(
                        matchedPlan?.amount
                      ).toLocaleString()}`,
                      status: po?.PO_status,
                    });
                  }
                });
                return (
                  <tr
                    key={data?.id}
                    onClick={() => {
                      setSelectedCampaignId(data?.documentId);
                      const activeStepFromPercentage = Math.ceil(
                        (data?.progress_percent * 9) / 100
                      );
                      setActive(
                        activeStepFromPercentage === 0
                          ? 1
                          : activeStepFromPercentage
                      );
                      router.push(`/creation?campaignId=${data?.documentId}`);
                    }}
                    className="cursor-pointer"
                  >
                    <td className="whitespace-normal py-[12px] px-[16px] break-words max-w-[200px]">
                      {data?.media_plan_details?.plan_name} -{" "}
                      {data?.progress_percent < 100 ? "Running" : "Completed"}
                    </td>
                    <td className="py-[12px] px-[16px]">V9</td>
                    <td className="py-[12px] px-[16px]">
                      <ProgressBar progress={data?.progress_percent || 0} />
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="approved">Approved</div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      {data?.budget_details?.value}{" "}
                      {!data?.budget_details?.currency?.includes("%") &&
                      data?.budget_details?.currency?.includes("EUR")
                        ? "€"
                        : ""}
                    </td>
                    <td className="py-[12px] px-[16px]">
                      {POs?.length > 0 ? (
                        <div className="space-y-2">
                          {POs?.map((p) => (
                            <div key={p.PO_number} className="flex gap-2">
                              <p
                                className={`${
                                  p?.status === "fully_paid" ||
                                  p?.status === "reconcilled"
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
                        <div className="view_content_table">MD</div>
                        {data?.media_plan_details?.client_approver}
                      </div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="flex items-center whitespace-nowrap gap-3">
                        <div className="view_content_table">JB</div>
                        <p>{data?.media_plan_details?.internal_approver}</p>
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
                              (data?.progress_percent * 9) / 100
                            );
                            setActive(
                              activeStepFromPercentage === 0
                                ? 1
                                : activeStepFromPercentage
                            );
                            router.push(
                              `/creation?campaignId=${data?.documentId}`
                            );
                          }}
                        />
                        <Image
                          src={share || "/placeholder.svg"}
                          alt="share"
                          onClick={() => {
                            // Add share functionality if needed
                          }}
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
      {!loadingg && clientId && clientCampaignData?.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, clientCampaignData.length)} of{" "}
            {clientCampaignData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-500 hover:bg-blue-50"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {number}
                </button>
              )
            )}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
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
              Duplicate "{selected?.media_plan_details?.plan_name}"
            </p>
            <form onSubmit={handleDuplicateAction}>
              <label
                htmlFor="duplicateName"
                className="font-medium flex items-center gap-[5px]"
              >
                New Media Plan Name{" "}
                <span className="text-[14px] text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                id="duplicateName"
                className="w-full rounded-md p-2 border my-[10px] outline-none"
                placeholder={`${selected?.media_plan_details?.plan_name}-copy`}
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
                  {loadingg ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Duplicate"
                  )}
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
