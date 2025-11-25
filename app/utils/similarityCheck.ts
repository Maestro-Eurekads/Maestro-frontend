export const areObjectsSimilar = (obj1: any, obj2: any): boolean => {
    // Handle null/undefined cases
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;
        return obj1.every((item, index) => areObjectsSimilar(item, obj2[index]));
    }

    // Handle Date objects
    if (obj1 instanceof Date && obj2 instanceof Date) {
        return obj1.getTime() === obj2.getTime();
    }

    // Handle regular objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => {
        return Object.prototype.hasOwnProperty.call(obj2, key) &&
            areObjectsSimilar(obj1[key], obj2[key]);
    });
};