export const buildTree = (data: any) => { 
  
  if (!data || !Array.isArray(data.parameters)) { 
    return [];
  }

  // Track used keys to ensure uniqueness
  const usedKeys = new Set<string>();
  
  const result = data.parameters.map((param, paramIndex) => { 
    
    // Ensure parent key is unique
    let parentKey = param.name;
    let counter = 1;
    while (usedKeys.has(parentKey)) {
      parentKey = `${param.name}-${counter}`;
      counter++;
    }
    usedKeys.add(parentKey);
    
    const children = (param.subParameters || []).map((sub: string, subIndex: number) => {
      // Ensure child key is unique
      let childKey = `${param.name}-${sub}`;
      counter = 1;
      while (usedKeys.has(childKey)) {
        childKey = `${param.name}-${sub}-${counter}`;
        counter++;
      }
      usedKeys.add(childKey);
       
      return {
        title: sub,
        value: childKey,
        key: childKey,
      };
    });
 
    return {
      title: param.name,
      value: param.name,
      key: parentKey,
      children,
    };
  });
 
  return result;
};
