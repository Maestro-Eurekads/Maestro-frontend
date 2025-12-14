
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

const TreeDropdown: React.FC<Props> = ({
	data,
	formId,
	setCampaignFormData,
	title,
	campaignFormData,
}) => {
	const { setChange } = useActive()
	const [treeOptions, setTreeOptions] = useState<any[]>([]);
	const [value, setValue] = useState<string[]>([]);
	const hasSetInitialValue = useRef(false);
	// Build tree when data is ready
	useEffect(() => {
		if (data) {
			const tree = buildTree(data, true);
			setTreeOptions(tree);
		}
	}, [data]);

	useEffect(() => {

		const selected = campaignFormData?.client_selection?.[formId]?.value || [];
		setValue(selected);
	}, [campaignFormData?.client_selection]);

	const onChange = (newValue: string[]) => {
		setChange(true)
		setValue(newValue);
		setCampaignFormData((prev) => ({
			...prev,
			client_selection: {
				...prev.client_selection,

				[formId]: {
					id: data?.title || '',
					value: newValue,
				},
			}
		}));
	};

	return (
		<div className="w-[330px]">
			<TreeSelect
				treeData={treeOptions}
				value={value}
				onChange={onChange}
				treeCheckable
				showCheckedStrategy={TreeSelect.SHOW_ALL}
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
