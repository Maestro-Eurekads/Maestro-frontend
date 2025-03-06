"use client";

import React, { useState, useEffect } from "react";
import mdEdit from "../../../public/line-md_edit.svg";
import blueSmallPlue from "../../../public/blueSmallPlue.svg";
import Image from "next/image";
import { MdOutlineCancel } from "react-icons/md";

const EditInput =  ({
	placeholder,
	inputs,
	setInputs,
	categoryList,
	setCategoryList,
  }: {
	placeholder: string;
	inputs: any;
	setInputs: any;
	categoryList: string[];
	setCategoryList: any;
  }) => {
  const [fields, setFields] = useState<{ id: number; text: string }[]>([
    { id: 1, text: "" },
  ]);

  // Sync fields with global state
  useEffect(() => {
    setInputs((prev: any) => ({
      ...prev,
      categories: fields.map((item) => item.text),
    }));
  }, [fields, setInputs]);

 // Handle adding a new field
 const handleAddField = () => {
    if (categoryList.includes(inputs.categories.toLowerCase())) {
      alert("Business unit already exists");
    } else {
      setCategoryList([...categoryList, inputs.categories.toLowerCase()]);
      setInputs((prevState) => ({
        ...prevState,
        categories: "",
      }));
    }
  };

  // Handle removing a field
  const handleRemoveSport = (sport) => {
    const filteredEmails = categoryList.filter((e) => e !== sport);
    setCategoryList(filteredEmails);
  };

  // Handle clearing a field
  const handleClear = () => {
    setInputs((prevState) => ({
      ...prevState,
      categories: "",
    }));
  };

  // Handle input change
  const handleInputChange = (text: string) => {
    setInputs((prevState) => ({
      ...prevState,
      categories: text,
    }));
  };

  return (
    <div className="relative w-full">
     <div className="mb-4">
        <label className="font-medium text-[15px] leading-5 text-gray-600">
          {placeholder}
        </label>
        <div className="mt-[8px] flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px]">
          <input
            type="text"
            className="w-full bg-transparent outline-none text-gray-600"
            placeholder={placeholder}
            value={inputs.categories}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <span className="ml-auto text-gray-500 cursor-pointer">
            <Image src={mdEdit} alt="edit" />
          </span>
        </div>

        <div className="flex items-center gap-2 mt-[8px]">
          {/* Add button */}
          <button
            onClick={handleAddField}
            className="flex items-center gap-1 text-[#3175FF] font-semibold text-[14px]"
          >
            <Image src={blueSmallPlue} alt="add" />
            Add
          </button>

          {/* Clear button */}
          {inputs.categories && (
            <button
              onClick={handleClear}
              className="text-gray-500 font-semibold text-[14px]"
            >
              Clear
            </button>
          )}
        </div>
        {categoryList.map((sport) => (
          <div key={sport} className="flex justify-between items-center">
            <p className="capitalize">{sport}</p>
            <MdOutlineCancel
              size={18}
              color="red"
              onClick={() => handleRemoveSport(sport)}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryDropdown = ({
  inputs,
  setInputs,
  categoryList,
  setCategoryList,
}: {
  inputs: any;
  setInputs: any;
  categoryList: any;
  setCategoryList: any;
}) => {
  return (
    <div className="flex flex-col gap-4 mt-[20px]">
      <EditInput
        placeholder="Category"
        inputs={inputs}
        setInputs={setInputs}
        categoryList={categoryList}
        setCategoryList={setCategoryList}
      />
    </div>
  );
};

export default CategoryDropdown;
