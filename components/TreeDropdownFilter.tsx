"use client";

import React, { useEffect, useState } from "react";
import { TreeSelect } from "antd";
import { buildTree } from "utils/buildTree";

interface Props {
  data: any;
  placeholder: string;
  label: string;
  selectedFilters: Record<string, any>;
  handleSelect: (key: string, value: string[]) => void;
  isDisabled?: boolean;
}

const TreeDropdownFilter: React.FC<Props> = ({
  data,
  placeholder,
  label,
  selectedFilters,
  handleSelect,
  isDisabled = false,
}) => {
  const [treeOptions, setTreeOptions] = useState([]);
  const lowerLabel = label.toLowerCase();
  const [value, setValue] = useState<string[] | undefined>(
    selectedFilters[lowerLabel] || undefined
  );

  useEffect(() => {
    if (data) {
      console.log("TreeDropdownFilter: Building tree with data:", data);

      // Validate data structure before building tree
      if (!data.parameters || !Array.isArray(data.parameters)) {
        console.warn(
          "TreeDropdownFilter: Invalid data structure, missing parameters array:",
          data
        );
        setTreeOptions([]);
        return;
      }

      // Check for duplicate names in parameters
      const paramNames = data.parameters.map((p) => p.name);
      const duplicateNames = paramNames.filter(
        (name, index) => paramNames.indexOf(name) !== index
      );
      if (duplicateNames.length > 0) {
        console.warn(
          "TreeDropdownFilter: Duplicate parameter names found:",
          duplicateNames
        );
      }

      const tree = buildTree(data);
      setTreeOptions(tree);
    }
  }, [data]);

  useEffect(() => {
    // Keep value in sync with external selectedFilters
    if (selectedFilters[lowerLabel] !== value) {
      setValue(selectedFilters[lowerLabel] || undefined);
    }
  }, [selectedFilters, lowerLabel]);

  const onChange = (newValue: string[]) => {
    setValue(newValue);
    handleSelect(lowerLabel, newValue); // mimic Dropdown behavior
  };

  // If no valid tree data, show a placeholder
  if (!treeOptions || treeOptions.length === 0) {
    return (
      <div className="min-w-[180px]">
        <div className="w-full h-[40px] px-4 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
          <span className="text-gray-500">No options available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[180px]">
      <TreeSelect
        key={`tree-filter-${label}-${treeOptions.length}`}
        treeData={treeOptions}
        value={value}
        onChange={onChange}
        treeCheckable
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        placeholder={
          placeholder === "Level 1" ? "Client Architecture" : placeholder
        }
        allowClear
        disabled={isDisabled}
        style={{ width: "100%", height: "100%" }}
        size="large"
        className="custom-tree-select"
      />
    </div>
  );
};

export default TreeDropdownFilter;
