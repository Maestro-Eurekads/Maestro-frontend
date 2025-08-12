export const buildTree = (data: any) => {
  console.log('buildTree input data:', data);
  
  if (!data || !Array.isArray(data.parameters)) {
    console.log('buildTree: No data or parameters array, returning empty array');
    return [];
  }

  // Track used keys to ensure uniqueness
  const usedKeys = new Set<string>();
  
  const result = data.parameters.map((param, paramIndex) => {
    console.log('buildTree processing param:', param);
    
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
      
      console.log('buildTree creating child with key:', childKey);
      return {
        title: sub,
        value: childKey,
        key: childKey,
      };
    });

    console.log('buildTree creating parent with key:', parentKey);
    return {
      title: param.name,
      value: param.name,
      key: parentKey,
      children,
    };
  });

  console.log('buildTree final result:', result);
  return result;
};
