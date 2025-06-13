'use client';

import React, { useEffect, useState } from 'react';
import { TreeSelect } from 'antd';
import { buildTree } from 'utils/buildTree';

interface Props {
	data: any; // { title: string, parameters: [...] }
	formId: 'level_1' | 'level_2' | 'level_3';
	setCampaignFormData: React.Dispatch<React.SetStateAction<any>>;
}

const TreeDropdown: React.FC<Props> = ({ data, formId, setCampaignFormData }) => {
	const [treeOptions, setTreeOptions] = useState([]);
	const [value, setValue] = useState<string[] | undefined>(undefined);

	useEffect(() => {
		if (data) {
			const tree = buildTree(data);
			setTreeOptions(tree);
		}
	}, [data]);

	const onChange = (newValue: string[]) => {
		setValue(newValue);

		// Update the specific level in campaignFormData
		setCampaignFormData(prev => ({
			...prev,
			[formId]: {
				id: data?.title || '', // you can use some unique id if available
				value: newValue,
			},
		}));
	};

	return (
		<div className='w-[330px]'>
			<TreeSelect
				treeData={treeOptions}
				value={value}
				onChange={onChange}
				treeCheckable
				showCheckedStrategy={TreeSelect.SHOW_CHILD}
				placeholder={data?.title || 'Select parameters'}
				style={{ width: '100%', height: '100%' }}
				allowClear
				className="custom-tree-select"
			/>
		</div>
	);
};

export default TreeDropdown;
