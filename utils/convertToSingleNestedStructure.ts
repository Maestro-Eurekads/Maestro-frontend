interface FlatStructure {
  id: string | { id: string; value: string[] };
  value?: string[] | { id: string; value: string[] };
}

interface SubParameter {
  name: string;
  subParameters: SubParameter[];
}

interface NestedStructure {
  title: string;
  parameters: { name: string; subParameters: SubParameter[] }[];
}

export function convertToSingleNestedStructure(
  options: FlatStructure[]
): NestedStructure {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return { title: "", parameters: [] };
  }

  let title = "";
  const paramMap: Record<string, Set<string>> = {};

  options.forEach((flat) => {
    if (!flat || typeof flat !== "object") return;

    let id: string;
    let values: string[] = [];

    // Extract id and values from flat structure
    if (
      typeof flat.id === "object" &&
      flat.id.id &&
      Array.isArray(flat.id.value)
    ) {
      id = flat.id.id;
      values = flat.id.value;
    } else if (typeof flat.id === "string" && Array.isArray(flat.value)) {
      id = flat.id;
      values = flat.value;
    } else {
      return;
    }

    if (!title && id) title = id;

    values.forEach((entry) => {
      if (!entry) return;

      if (entry.includes("-")) {
        // Main - Sub case
        const [main, sub] = entry.split(/\s*-\s*/);
        if (!paramMap[main]) paramMap[main] = new Set();
        paramMap[main].add(sub);
      } else {
        // Only main param selected, no sub
        if (!paramMap[entry]) paramMap[entry] = new Set();
      }
    });
  });

  const parameters = Object.entries(paramMap).map(([name, subSet]) => ({
    name,
    subParameters: Array.from(subSet).map((sub) => ({
      name: sub,
      subParameters: [],
    })),
  }));

  return {
    title,
    parameters,
  };
}
