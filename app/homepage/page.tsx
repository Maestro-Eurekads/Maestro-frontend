"use client";
import React, { useEffect, useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import Header from "../../components/Header";
import TableModel from "./TableModel";
import Overview from "./components/Overview";
import Dashboard from "./components/Dashboard";
import FinanceView from "./components/FinanceView";
import AddFinanceModal from "./components/AddFinanceModal";
import ViewClientModal from "./components/ViewClientModal";
import { useActive } from "app/utils/ActiveContext";
import BackConfirmModal from "components/BackConfirmModal";
import SaveProgressButton from "app/utils/SaveProgressButton";

const Homepage = () => {
  const { change, setChange } = useActive()
  const [isOpen, setIsOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deskTopShow, setDeskTopShow] = useState(false);
  const [active, setActive] = useState("Overview");
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [userRole, setUserRole] = useState("guest");



  useEffect(() => {
    if (change) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [change])




  const handleConfirmSave = () => {
    handleSave();
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    setChange(false);
  };

  const handleSave = () => {
    setChange(false);
    setShowModal(false);
  };

  return (
    <>
      <div id="page-wrapper">
        <Header setIsOpen={setIsOpen}
          setIsView={setIsView} />
        <main className="!px-0">
          <div>
            <div className="px-[72px]">
              <ToggleSwitch active={active} setActive={setActive} />
            </div>
            {active === "Finance" ? (
              <FinanceView setOpenModal={setOpenModal} userRole={userRole} />
            ) : active === "Dashboard" ? (
              <Dashboard />
            ) : (
              <Overview />
            )}
          </div>
        </main>
        <TableModel isOpen={isOpen} setIsOpen={setIsOpen} />
        <ViewClientModal isView={isView} setIsView={setIsView} />
        <AddFinanceModal
          isOpen={openModal}
          setIsOpen={setOpenModal}
          setSelectedRow={setSelectedRow}
          selectedRow={selectedRow}
          userRole={userRole}
        />
        {/* <SaveProgressButton
          deskTopShow={deskTopShow}
          setDeskTopShow={setDeskTopShow} /> */}
        <BackConfirmModal
          isOpen={showModal}
          onClose={handleCancel}
          onConfirm={handleConfirmSave}
        />
      </div>
    </>
  );
};

export default Homepage;
