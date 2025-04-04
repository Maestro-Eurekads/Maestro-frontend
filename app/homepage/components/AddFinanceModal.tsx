"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import closefill from "../../../public/close-fill.svg";
import blueprofile from "../../../public/blueprofile.svg";
import blueBtn from "../../../public/blueBtn.svg";
import { MdOutlineCancel } from "react-icons/md";
import { CustomSelect } from "./CustomReactSelect";
import { Trash2 } from "lucide-react";

const AddFinanceModal = ({ isOpen, setIsOpen }) => {
  const [mediaPlans, setMediaPlans] = useState([]);
  const removeMP = (index) => {
    setMediaPlans((prev) => {
      const filtered = prev?.filter((_, ind) => ind !== index);

      return filtered;
    });
  };
  return (
    <div className="z-50">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-[700px] bg-white rounded-[32px] max-h-[90vh]">
            <div className="w-full flex justify-end px-5 pt-5"></div>

            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-[32px]">
              <div className="flex items-center gap-5">
                <div className="madel_profile">
                  <Image src={blueprofile} alt="menu" />
                </div>
                <div className="madel_profile_text_container">
                  <h3>Add purchase order</h3>
                </div>
              </div>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setIsOpen(false)}
              >
                <Image src={closefill} alt="menu" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-start gap-3 w-full">
                <div className="w-1/2">
                  <label htmlFor="">Client Name</label>
                  <CustomSelect className="mt-2" />
                </div>
                <div className="w-1/2">
                  <label htmlFor="">Client Responsible</label>
                  <input
                    type="text"
                    placeholder="Client Responsible"
                    className="w-full border rounded-md p-[6px] mt-2 outline-none"
                  />
                </div>
              </div>
              <div className="w-1/2 mt-3">
                <label htmlFor="">Financial Responsible</label>
                <CustomSelect
                  className="mt-2"
                  placeholder="Select responsible"
                />
              </div>
              <div className="flex items-start gap-3 w-full mt-3">
                <div className="w-1/2">
                  <label htmlFor="">PO Number</label>
                  <input
                    type="text"
                    placeholder="PO Number"
                    className="w-full border rounded-md p-[6px] mt-2 outline-none"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="">PO Currency</label>
                  <CustomSelect
                    className="mt-2"
                    placeholder="Select currency"
                  />
                </div>
              </div>
              <div className="w-1/2 mt-3">
                <label htmlFor="">PO Total Amount</label>
                <input
                  type="text"
                  placeholder="PO Total Amount"
                  className="w-full border rounded-md p-[6px] mt-2 outline-none"
                />
              </div>
              <div>
                <p className="font-semibold my-3">Assigned Media Plan</p>

                {mediaPlans?.length > 0 && (
                  <>
                    {/* <p className="mb-[20px] font-semibold">
                      Media Plans Linked
                    </p> */}
                    <div className="space-y-3">
                      {mediaPlans.map((plan, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <CustomSelect
                            placeholder="Select media plan"
                            className="rounded-3xl"
                          />
                          <CustomSelect
                            placeholder="Select amount"
                            className="rounded-3xl"
                          />
                          <input
                            type="text"
                            placeholder="Enter amount"
                            className="w-full border rounded-md p-[6px] outline-none"
                          />
                          <Trash2
                            color="red"
                            className="shrink-0 cursor-pointer"
                            size={16}
                            onClick={() => removeMP(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div
                  className="bg-white w-fit flex items-center gap-2 cursor-pointer text-[14px] shadow-lg px-3 py-1 rounded-2xl mt-[20px]"
                  onClick={() => setMediaPlans((prev) => [...prev, {}])}
                >
                  <Image src={blueBtn} alt="menu" width={14} height={14} />
                  <p className="text-blue-500">Assign Media Plan</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end rounded-b-[32px]">
              <div className="flex items-center gap-5">
                <button className="btn_model_outline">Cancel</button>
                <button className="btn_model_active whitespace-nowrap">
                  Create PO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFinanceModal;
