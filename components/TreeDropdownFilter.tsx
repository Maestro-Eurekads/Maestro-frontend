'use client';

import React, { useEffect, useState } from 'react';
import { TreeSelect } from 'antd';
import { buildTree } from 'utils/buildTree';

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

	return (
		<div className="min-w-[180px]">
			<TreeSelect
				treeData={treeOptions}
				value={value}
				onChange={onChange}
				treeCheckable
				showCheckedStrategy={TreeSelect.SHOW_CHILD}
				placeholder={placeholder === "Level 1" ? "Client Architecture" : placeholder}
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
