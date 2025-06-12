'use client';

import React, { useEffect, useState } from 'react';
import { TreeSelect } from 'antd';
import { buildTree } from 'utils/buildTree';

interface Props {
	data: any;
}

const TreeDropdown: React.FC<Props> = ({ data }) => {
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
		console.log('Selected:', newValue);
	};

	return (
		<div >
			<h2>Select Parameters & Sub-Parameters</h2>
			<TreeSelect
				treeData={treeOptions}
				value={value}
				onChange={onChange}
				treeCheckable
				showCheckedStrategy={TreeSelect.SHOW_CHILD}
				placeholder="Select parameters"
				style={{ width: '100%' }}
				allowClear
			/>
		</div>
	);
};

export default TreeDropdown;
