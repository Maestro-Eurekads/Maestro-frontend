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

export const buildTreeWithHierarchicalTitles = (data: any, keepRoot = false, separator = ' > ') => {
  if (!data || !Array.isArray(data.parameters)) return [];

  const buildNode = (param: any, parentPath: string = '', titlePath: string = '') => {
    const currentPath = parentPath ? `${parentPath}-${param.name}` : param.name;
    const currentTitlePath = titlePath ? `${titlePath}${separator}${param.name}` : param.name;

    const node = {
      title: param.name,
      paramName: currentTitlePath,
      value: currentPath,
      key: currentPath,
      children: [],
    };

    // Recursively build children if subParameters exist
    if (param.subParameters && param.subParameters.length > 0) {
      node.children = param.subParameters.map(sub => buildNode(sub, currentPath, currentTitlePath));
    }

    return node;
  };

  const children = data.parameters.map((param) => buildNode(param));

  if (keepRoot) {
    const rootTitle = data.title || 'Root';
    // Build children with root title included in the titlePath from the start
    const childrenWithRoot = data.parameters.map((param) => buildNode(param, '', rootTitle));

    return [{
      title: rootTitle,
      paramName: rootTitle,
      value: 'root',
      key: 'root',
      children: childrenWithRoot,
    }];
  } else {
    return children;
  }
};