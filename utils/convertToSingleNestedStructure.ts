interface FlatStructure {
  id: string | { id: string; value: string[] };
  value?: string[] | { id: string; value: string[] };
}

interface NestedStructure {
  title: string;
  parameters: { name: string; subParameters: string[] }[];
}

export function convertToSingleNestedStructure(options: FlatStructure[]): NestedStructure {
  // Default return for invalid or empty input
  if (!options || !Array.isArray(options) || options.length === 0) {
    return { title: "", parameters: [] };
  }

  let title = "";
  const paramMap: Record<string, string[]> = {};

  options.forEach((flat) => {
    if (!flat || typeof flat !== "object") return;

    let id: string;
    let values: string[] = [];

    // Handle nested id/value structure
    if (typeof flat.id === "object" && flat.id.id && Array.isArray(flat.id.value)) {
      id = flat.id.id;
      values = flat.id.value;
    } else if (typeof flat.id === "string" && Array.isArray(flat.value)) {
      id = flat.id;
      values = flat.value;
    } else {
      return;
    }

    // Set title from the first valid id
    if (!title && id) {
      title = id;
    }

    // Process values and add to paramMap
    values.forEach((entry) => {
      const [main, sub] = entry.split(/\s*-\s*/); // Split on hyphen with optional whitespace
      if (!main || !sub) return;

      if (!paramMap[main]) {
        paramMap[main] = [];
      }
      // Avoid duplicate sub-parameters
      if (!paramMap[main].includes(sub)) {
        paramMap[main].push(sub);
      }
    });
  });

  const parameters = Object.entries(paramMap).map(([name, subParameters]) => ({
    name,
    subParameters,
  }));

  return {
    title: title,
    parameters,
  };
}
