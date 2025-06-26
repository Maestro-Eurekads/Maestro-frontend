'use client';

import React, { useEffect, useState } from 'react';
import { TreeSelect } from 'antd';
import { buildTree } from 'utils/buildTree';
import { convertToNestedStructure } from 'utils/convertToNestedStructure';

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
	const [treeOptions, setTreeOptions] = useState([]);
	const [value, setValue] = useState<string[] | undefined>(undefined);

	const nested = convertToNestedStructure(campaignFormData?.[formId]?.value);
 

	useEffect(() => {
		if (data) {
			const tree = buildTree(data);
			setTreeOptions(tree);
		}
	}, [data]);

	const onChange = (newValue: string[]) => {
		setValue(newValue);
		setCampaignFormData((prev) => ({
			...prev,
			[formId]: {
				id: data?.title || "",
				value: newValue,
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
				style={{ width: "100%", height: "100%" }}
				size="large"
				allowClear
				className="custom-tree-select"
				treeLine // <-- shows lines between parent and child
				treeDefaultExpandAll
			/>
		</div>
	);
};

export default TreeDropdown;
