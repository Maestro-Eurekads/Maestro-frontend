// utils/buildTree.ts

export const buildTree = (data: any) => {
	if (!data || !Array.isArray(data.parameters)) return [];

	return data.parameters.map((param) => {
		const children = (param.subParameters || []).map((sub: string) => ({
			title: sub,
			value: `${param.name}-${sub}`,
			key: `${param.name}-${sub}`,
		}));

		return {
			title: param.name,
			value: param.name,
			key: param.name,
			children,
		};
	});
};
