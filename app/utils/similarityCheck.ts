export const areObjectsSimilar = (
    obj1: any,
    obj2: any,
    skipKeys: string[] = []
): boolean => {
    const isEmpty = (value: any): boolean => {
        return value == null ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0);
    };

    const shouldSkipKey = (key: string, currentPath: string = ''): boolean => {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        return skipKeys.some(skipKey =>
            skipKey === key || skipKey === fullPath || fullPath.startsWith(skipKey + '.')
        );
    };

    const filterNonEmptyKeys = (obj: any, currentPath: string = ''): string[] => {
        if (!obj || typeof obj !== 'object') return [];
        return Object.keys(obj).filter(key =>
            !isEmpty(obj[key]) && !shouldSkipKey(key, currentPath)
        );
    };

    const compareObjects = (o1: any, o2: any, currentPath: string = ''): boolean => {
        if (o1 === o2) return true;
        if (isEmpty(o1) && isEmpty(o2)) return true;
        if (o1 == null || o2 == null) return false;
        if (typeof o1 !== 'object' || typeof o2 !== 'object') return o1 === o2;

        if (Array.isArray(o1) && Array.isArray(o2)) {
            if (o1.length !== o2.length) return false;
            return o1.every((item, index) => compareObjects(item, o2[index], `${currentPath}[${index}]`));
        }

        if (Array.isArray(o1) !== Array.isArray(o2)) {
            return isEmpty(o1) && isEmpty(o2);
        }

        if (o1 instanceof Date && o2 instanceof Date) {
            return o1.getTime() === o2.getTime();
        }

        const keys1 = filterNonEmptyKeys(o1, currentPath);
        const keys2 = filterNonEmptyKeys(o2, currentPath);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(key => {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            return Object.prototype.hasOwnProperty.call(o2, key) &&
                !isEmpty(o2[key]) &&
                compareObjects(o1[key], o2[key], newPath);
        });
    };

    return compareObjects(obj1, obj2);
};