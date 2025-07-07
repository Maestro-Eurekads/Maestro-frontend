
// 'use client';

// import React, { useEffect, useState, useRef } from 'react';
// import { TreeSelect } from 'antd';
// import { buildTree } from 'utils/buildTree';
// import { convertToNestedStructure } from 'utils/convertToNestedStructure';

// interface Props {
// 	campaignFormData: any;
// 	data: any;
// 	title: any;
// 	formId: 'level_1';
// 	setCampaignFormData: React.Dispatch<React.SetStateAction<any>>;
// }

// const TreeDropdown: React.FC<Props> = ({
// 	data,
// 	formId,
// 	setCampaignFormData,
// 	title,
// 	campaignFormData,
// }) => {
// 	const [treeOptions, setTreeOptions] = useState<any[]>([]);
// 	const [value, setValue] = useState<string[]>([]);
// 	const hasSetInitialValue = useRef(false);

// 	const nested = convertToNestedStructure(campaignFormData?.[formId]?.value);

// 	console.log('convertToNestedStructure', nested);
// 	console.log('treeOptions00---bbb', treeOptions);
// 	console.log('campaignFormData?.[formId]?.value)', campaignFormData?.[formId]?.value);


// 	useEffect(() => {
// 		if (!hasSetInitialValue.current && nested?.parameters?.length > 0) {
// 			const selected = nested.parameters.flatMap((param: any) =>
// 				param.subParameters.length > 0
// 					? param.subParameters.map((sub: string) => `${param.name.trim()}-${sub.trim()}`)
// 					: [`${param.name.trim()}`] // fallback for entries like "keke"
// 			);
// 			setValue(selected);
// 			hasSetInitialValue.current = true;
// 		}
// 	}, [nested]);

// 	useEffect(() => {
// 		if (data) {
// 			const tree = buildTree(data);
// 			setTreeOptions(tree);
// 		}
// 	}, [data]);

// 	const onChange = (newValue: string[]) => {
// 		setValue(newValue);
// 		setCampaignFormData((prev) => ({
// 			...prev,
// 			[formId]: {
// 				id: data?.title || '',
// 				value: newValue,
// 			},
// 		}));
// 	};

// 	return (
// 		<div className="w-[330px]">
// 			<TreeSelect
// 				treeData={treeOptions}
// 				value={value}
// 				onChange={onChange}
// 				treeCheckable
// 				showCheckedStrategy={TreeSelect.SHOW_CHILD}
// 				placeholder={data?.title || title}
// 				style={{ width: '100%', height: '100%' }}
// 				size="large"
// 				allowClear
// 				className="custom-tree-select"
// 				treeLine
// 				treeDefaultExpandAll
// 			/>
// 		</div>
// 	);
// };

// export default TreeDropdown;
'use client';

import React, { useEffect, useState, useRef } from 'react';
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
	const [treeOptions, setTreeOptions] = useState<any[]>([]);
	const [value, setValue] = useState<string[]>([]);
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

			setValue(selected);
			loadAttempts.current += 1;
		}
	}, [treeOptions, nested]);

	const onChange = (newValue: string[]) => {
		setValue(newValue);
		setCampaignFormData((prev) => ({
			...prev,
			[formId]: {
				id: data?.title || '',
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
