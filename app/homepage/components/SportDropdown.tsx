"use client";

import React, { useState, useEffect } from "react";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import Image from "next/image";
import { MdOutlineCancel } from "react-icons/md";

const EditInput = ({
  placeholder,
  setInputs,
  label,
  setAlert,
}) => {
  const [fields, setFields] = useState([{ id: 1, text: "" }]);

  // Sync fields with global state
  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      sports: fields.map((item) => item.text),
    }));
  }, [fields, setInputs]);

  // Handle adding a new field
  const handleAddField = () => {
    if (fields.length >= 5) {
      setAlert({
        variant: "warning",
        message: "Maximum 5 Business Type allowed",
        position: "bottom-right",
      });
      return;
    }
    if (!fields[fields.length - 1].text.trim()) {
      setAlert({
        variant: "error",
        message: "Business Type cannot be empty",
        position: "bottom-right",
      });
      return;
    }
    setFields((prev) => [...prev, { id: prev.length + 1, text: "" }]);
  };

  // Handle removing a field
  const handleRemoveField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle input change
  const handleInputChange = (index, text) => {
    setFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text } : item))
    );
  };

  return (
    <div className="relative w-full">
      <div className="mb-4">
        <label className="font-medium text-[15px] leading-5 text-gray-600">
          {label}
        </label>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="mt-[8px] flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px]"
          >
            <input
              type="text"
              className="w-full bg-transparent outline-none text-gray-600"
              placeholder={index === 0 ? "Business Level 1" : `Parameter ${index}`}
              value={field.text}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
            {fields.length > 1 && (
              <MdOutlineCancel
                size={18}
                color="red"
                onClick={() => handleRemoveField(index)}
                className="cursor-pointer"
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 mt-[8px]">
          <button
            onClick={handleAddField}
            className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
          >
            <Image src={blueSmallPlue} alt="add" />
            Add parameter
          </button>
        </div>
      </div>
    </div>
  );
};

const SportDropdown = ({ setInputs, setAlert }) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        placeholder="Business Type"
        setInputs={setInputs}
        setAlert={setAlert}
        label="Business level 1"
      />
    </div>
  );
};

export default SportDropdown;