"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import FiltersDropdowns from "./FiltersDropdowns";
import FinanceTable from "./FinanceTable";
import AddFinanceModal from "./AddFinanceModal";
import Modal from "components/Modals/Modal";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCampaignHook from "app/utils/useCampaignHook";
import { useCampaigns } from "app/utils/CampaignsContext";
import blueBtn from "../../../public/blueBtn.svg";
import { useSession } from "next-auth/react";
import { useUserPrivileges } from "utils/userPrivileges";
import { toast } from "sonner";

function FinanceView({ setOpenModal, userRole }) {
  const { data: session } = useSession();
  // @ts-ignore 
  const userType = session?.user?.data?.user?.id || "";
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page
  const { fetchClientPOS } = useCampaignHook();
  const { clientPOs, setClientPOs, setFetchingPO, jwt } = useCampaigns();
  const { isFinancialApprover, isAdmin } = useUserPrivileges();

  // Calculate paginated data with safety checks
  const totalItems = Array.isArray(clientPOs) ? clientPOs.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = Array.isArray(clientPOs)
    ? clientPOs.slice(startIndex, endIndex)
    : [];

  // Reset currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleDeletePO = async () => {
    if (!selectedRow?.documentId) {
      console.error("No documentId for deletion");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders/${selectedRow?.documentId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setOpenDelete(false);
      setSelectedRow(null);
      setFetchingPO(true);
      try {
        const res = await fetchClientPOS(selectedRow?.client?.id);
        localStorage.setItem(userType.toString(), selectedRow?.client?.id);
        setClientPOs(Array.isArray(res?.data?.data) ? res.data.data : []);
        setCurrentPage(1); // Reset to page 1 after deletion
      } catch (fetchError) {
        console.error("Error fetching POs:", fetchError);
        setClientPOs([]);
      } finally {
        setFetchingPO(false);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoading(false);
    }
  };

  // Pagination controls
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  ;

  return (
    <div className="px-[72px] ">
      <div className="flex items-center gap-2 mt-[36.5px] mb-5">
        <h1 className="media_text">Purchase Order Library</h1>
        {(isFinancialApprover || isAdmin) ?
          <button onClick={() => setOpenModal(true)}>
            <Image src={blueBtn} alt="menu" />
          </button> : <button onClick={() => toast.error("Role doesn't have permission")}>
            <Image src={blueBtn} alt="menu" />
          </button>}

      </div>

      <FinanceTable
        data={paginatedData}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        openDelete={openDelete}
        setOpenDelete={setOpenDelete}
        openView={openView}
        setOpenView={setOpenView}
      />
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className={`p-2 rounded-md ${currentPage === 1
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`p-2 rounded-md ${currentPage === totalPages
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      <AddFinanceModal
        isOpen={openEdit}
        setIsOpen={setOpenEdit}
        mode="edit"
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        userRole={userRole}
      />
      <Modal isOpen={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="bg-white shadow-md rounded-md p-4 w-[500px]">
          <p className="text-center">
            Are you sure you want to delete this Purchase Order?
          </p>
          <p className="text-center">PO Number: {selectedRow?.PO_number}</p>
          <div className="flex gap-3 items-center w-full mt-4">
            <button
              className="btn border text-[16px] rounded-md py-3 w-1/2 font-semibold"
              onClick={() => setOpenDelete(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 text-white rounded-md py-3 w-1/2 text-[16px] font-semibold"
              onClick={handleDeletePO}
            >
              {loading ? (
                <center>
                  <FaSpinner className="animate-spin" />
                </center>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FinanceView;
