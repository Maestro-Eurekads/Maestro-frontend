// export function convertToNestedStructure(flat: { id: string; value: string[] }) {
//   if (!flat || typeof flat !== "object" || !flat.id || !Array.isArray(flat.value)) {
//     return { title: '', parameters: [] };
//   }

//   const paramMap: Record<string, string[]> = {};

//   flat.value.forEach((entry) => {
//     const [main, sub] = entry.split(/\s*-\s*/); // Handles "Line - Hug" or "Line-Pen"
//     if (!main || !sub) return;

//     if (!paramMap[main]) {
//       paramMap[main] = [];
//     }

//     paramMap[main].push(sub);
//   });

//   const parameters = Object.entries(paramMap).map(([name, subParameters]) => ({
//     name,
//     subParameters,
//   }));

//   return {
//     title: flat.id,
//     parameters,
//   };
// }


export function convertToNestedStructure(flat: { id: string; value: string[] }) {
  if (!flat || typeof flat !== "object" || !flat.id || !Array.isArray(flat.value)) {
    return { title: '', parameters: [] };
  }

  const paramMap: Record<string, string[]> = {};

  flat.value.forEach((entry) => {
    const parts = entry.split(/\s*-\s*/);

    if (parts.length === 2) {
      const [main, sub] = parts;
      if (!paramMap[main]) paramMap[main] = [];
      paramMap[main].push(sub);
    } else if (parts.length === 1) {
      const main = parts[0];
      if (!paramMap[main]) paramMap[main] = [];
    }
  });

  const parameters = Object.entries(paramMap).map(([name, subParameters]) => ({
    name,
    subParameters,
  }));

  return {
    title: flat.id,
    parameters,
  };
}

