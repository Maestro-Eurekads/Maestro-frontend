export const removeKeysRecursively = (data, keysToRemove, exemptions = {}, parentKey = null) => {
  if (Array.isArray(data)) {
    return data.map(item =>
      removeKeysRecursively(item, keysToRemove, exemptions, parentKey)
    );
  } else if (typeof data === "object" && data !== null) {
    return Object.fromEntries(
      Object.entries(data)
        .map(([key, value]) => [
          key,
          removeKeysRecursively(value, keysToRemove, exemptions, key),
        ])
        .filter(([key]) => {
          const exemptKeys = exemptions[data.name] || [];

          // Skip removal of `id` if the parent is `previews`
          if (parentKey === "previews" && key === "id") return true;

          return !keysToRemove.includes(key) || exemptKeys.includes(key);
        })
    );
  }
  return data;
};
