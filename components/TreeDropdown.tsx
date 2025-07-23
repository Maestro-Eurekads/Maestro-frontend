'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TreeSelect } from 'antd';
import { buildTree } from 'utils/buildTree';
import { convertToNestedStructure } from 'utils/convertToNestedStructure';
import { useActive } from 'app/utils/ActiveContext';

interface Props {
	campaignFormData: any;
	data: any;
	title: any;
	formId: 'level_1';
	setCampaignFormData: React.Dispatch<React.SetStateAction<any>>;
}

// Helper to normalize value to array of strings
function normalizeValue(val: any): string[] {
	if (Array.isArray(val)) {
		// If array of objects, extract string values
		if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
			return val.map(v => v.value || v.label || v.id || "");
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
	const { setChange } = useActive()
	const [treeOptions, setTreeOptions] = useState<any[]>([]);
	const [value, setValue] = useState<string[]>(normalizeValue(campaignFormData?.[formId]?.value));
	const hasSetInitialValue = useRef(false);
	const loadAttempts = useRef(0);
	const nested = convertToNestedStructure(campaignFormData?.[formId]?.value);




	// Build tree when data is ready
	useEffect(() => {
		if (data) {
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
					? param.subParameters.map((sub: string) => `${param.name.trim()}-${sub.trim()}`)
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
		setChange(true)
		setValue(newValue);
		setCampaignFormData((prev) => ({
			...prev,
			[formId]: {
				id: data?.title || '',
				value: newValue, // always an array of strings
			},
		}));
	};

	return (
		<div className="w-[330px]">
			<TreeSelect
				treeData={treeOptions}
				value={value}
				onChange={onChange}
				treeCheckable
				showCheckedStrategy={TreeSelect.SHOW_CHILD}
				placeholder={data?.title || title}
				style={{ width: '100%', height: '100%' }}
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
