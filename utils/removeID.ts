export const removeKeysRecursively = (data, keysToRemove) => {
    if (Array.isArray(data)) {
      return data.map(item => removeKeysRecursively(item, keysToRemove));
    } else if (typeof data === "object" && data !== null) {
      return Object.fromEntries(
        Object.entries(data)
          .map(([key, value]) => [key, removeKeysRecursively(value, keysToRemove)]) // Recursively process values
          .filter(([key]) => !keysToRemove.includes(key)) // Remove specified keys but keep objects
      );
    }
    return data; // Return primitive values as they are
  };