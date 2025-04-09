import Image from "next/image";
import React, { useState } from "react";
import FiltersDropdowns from "./FiltersDropdowns";
import Table from "components/Table";
import blueBtn from "../../../public/blueBtn.svg";
import FinanceTable from "./FinanceTable";
import AddFinanceModal from "./AddFinanceModal";
import Modal from "components/Modals/Modal";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import useCampaignHook from "app/utils/useCampaignHook";
import { useCampaigns } from "app/utils/CampaignsContext";

function FinanceView({ setOpenModal }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const { fetchClientPOS } = useCampaignHook();
  const { setClientPOs, setFetchingPO } = useCampaigns();

  const handleDeletePO = async () => {
    setLoading(true);
    await axios
      .delete(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders/${selectedRow?.documentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      )
      .then((res) => {
        setOpenDelete(false);
        setSelectedRow(null);
        setFetchingPO(true);
        fetchClientPOS(selectedRow?.client?.id)
          .then((res) => {
            localStorage.setItem("selectedClient", selectedRow?.client?.id)
            setClientPOs(res?.data?.data || []);
          })
          .finally(() => {
            setFetchingPO(false);
          });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="px-[72px]">
      <div className="flex items-center gap-2 mt-[36.5px]">
        <h1 className="media_text">Purchase Order Library</h1>
        <button onClick={() => setOpenModal(true)}>
          <Image src={blueBtn} alt="menu" />
        </button>
      </div>
      <div className="mt-[20px]">
        {/* <FiltersDropdowns hideTitle={true}/> */}
      </div>
      <FinanceTable
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        openDelete={openDelete}
        setOpenDelete={setOpenDelete}
        openView={openView}
        setOpenView={setOpenView}
      />
      <AddFinanceModal
        isOpen={openEdit}
        setIsOpen={setOpenEdit}
        mode="edit"
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
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
