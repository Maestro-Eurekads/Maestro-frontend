import Image from "next/image";
import React, { useState } from "react";
import FiltersDropdowns from "./FiltersDropdowns";
import Table from "components/Table";
import blueBtn from "../../../public/blueBtn.svg";
import FinanceTable from "./FinanceTable";
import AddFinanceModal from "./AddFinanceModal";

function FinanceView({ setOpenModal }) {
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
      <FinanceTable />
    </div>
  );
}

export default FinanceView;
