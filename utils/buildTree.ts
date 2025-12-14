export const buildTree = (data: any, keepRoot = false) => {
  if (!data || !Array.isArray(data.parameters)) return [];

  const buildNode = (param: any, parentPath: string = '') => {
    const currentPath = parentPath ? `${parentPath}-${param.name}` : param.name;

    const node = {
      title: param.name,
      value: currentPath,
      key: currentPath,
      children: [],
    };

    // Recursively build children if subParameters exist
    if (param.subParameters && param.subParameters.length > 0) {
      node.children = param.subParameters.map(sub => buildNode(sub, currentPath));
    }

    return node;
  };

  const children = data.parameters.map((param) => buildNode(param));

  if (keepRoot) {
    return [{
      title: data.title || 'Root',
      value: 'root',
      key: 'root',
      children: children,
    }];
  } else {
    return children;

  }
};