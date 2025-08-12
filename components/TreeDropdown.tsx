"use client";

import React, { useEffect, useState, useRef } from "react";
import { TreeSelect } from "antd";
import { buildTree } from "utils/buildTree";
import { convertToNestedStructure } from "utils/convertToNestedStructure";
import { useActive } from "app/utils/ActiveContext";

interface Props {
  campaignFormData: any;
  data: any;
  title: any;
  formId: "level_1";
  setCampaignFormData: React.Dispatch<React.SetStateAction<any>>;
}

// Helper to normalize value to array of strings
function normalizeValue(val: any): string[] {
  if (Array.isArray(val)) {
    // If array of objects, extract string values
    if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      return val.map((v) => v.value || v.label || v.id || "");
    }
    // If array of strings, return as is
    return val;
  }
  return [];
}

const TreeDropdown: React.FC<Props> = ({
  data,
  formId,
  setCampaignFormData,
  title,
  campaignFormData,
}) => {
  const { setChange } = useActive();
  const [treeOptions, setTreeOptions] = useState<any[]>([]);
  const [value, setValue] = useState<string[]>(
    normalizeValue(campaignFormData?.[formId]?.value)
  );
  const hasSetInitialValue = useRef(false);
  const loadAttempts = useRef(0);
  const nested = convertToNestedStructure(campaignFormData?.[formId]?.value);

  console.log("---campaignFormData", campaignFormData);
  console.log("---nested", nested);
  console.log("---treeOptions", treeOptions);
  console.log("---value", value);
  console.log("---data", data);

  // Build tree when data is ready
  useEffect(() => {
    if (data) {
      console.log("TreeDropdown: Building tree with data:", data);

      // Validate data structure before building tree
      if (!data.parameters || !Array.isArray(data.parameters)) {
        console.warn(
          "TreeDropdown: Invalid data structure, missing parameters array:",
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
          "TreeDropdown: Duplicate parameter names found:",
          duplicateNames
        );
      }

      const tree = buildTree(data);
      setTreeOptions(tree);
    }
  }, [data]);

  // Set initial selected values only when treeOptions and nested are ready
  useEffect(() => {
    if (
      loadAttempts.current < 3 &&
      treeOptions.length > 0 &&
      nested?.parameters?.length > 0
    ) {
      const selected = nested.parameters.flatMap((param: any) =>
        param.subParameters.length > 0
          ? param.subParameters.map(
              (sub: string) => `${param.name.trim()}-${sub.trim()}`
            )
          : [`${param.name.trim()}`]
      );
      if (JSON.stringify(value) !== JSON.stringify(selected)) {
        setValue(selected);
      }
      loadAttempts.current += 1;
    }
    // Only update if the normalized value is different
    else if (campaignFormData?.[formId]?.value) {
      const normalized = normalizeValue(campaignFormData[formId].value);
      if (JSON.stringify(value) !== JSON.stringify(normalized)) {
        setValue(normalized);
      }
    }
    // eslint-disable-next-line
  }, [treeOptions, nested, formId]);

  const onChange = (newValue: string[]) => {
    setChange(true);
    setValue(newValue);
    setCampaignFormData((prev) => ({
      ...prev,
      [formId]: {
        id: data?.title || "",
        value: newValue, // always an array of strings
      },
    }));
  };

  // Validate treeData to ensure all nodes have unique keys
  const validateTreeData = (nodes: any[]): any[] => {
    const usedKeys = new Set<string>();

    const validateNode = (node: any): any => {
      // Ensure key is unique
      let key = node.key;
      let counter = 1;
      while (usedKeys.has(key)) {
        key = `${node.key}-${counter}`;
        counter++;
      }
      usedKeys.add(key);

      // Validate children if they exist
      const children = node.children
        ? node.children.map(validateNode)
        : undefined;

      return {
        ...node,
        key,
        children,
      };
    };

    return nodes.map(validateNode);
  };

  const validatedTreeData = validateTreeData(treeOptions);
  console.log("Validated tree data:", validatedTreeData);

  // If no valid tree data, show a placeholder
  if (!validatedTreeData || validatedTreeData.length === 0) {
    return (
      <div className="w-[330px]">
        <div className="w-full h-[40px] px-4 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
          <span className="text-gray-500">No options available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[330px]">
      <TreeSelect
        key={`tree-select-${data?.title || title}-${validatedTreeData.length}`}
        treeData={validatedTreeData}
        value={value}
        onChange={onChange}
        treeCheckable
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        placeholder={data?.title || title}
        style={{ width: "100%", height: "100%" }}
        size="large"
        allowClear
        className="custom-tree-select"
        treeLine
        treeDefaultExpandAll
      />
    </div>
  );
};

export default TreeDropdown;
