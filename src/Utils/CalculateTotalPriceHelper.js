// Helper to normalize keys
export const normalizeKey = (key) => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, "");
};

// Pure utility function
export const calculateTotalPriceHelper = (roomNumbersMap, areasData, category, subcategory) => {
    const normalizedSubCat = normalizeKey(subcategory);

    let matchedKey, quantity;

    if (category === "Furniture" || category === "HVAC" || category === "Partitions / Ceilings") {
        // Calculation of price * quantity
        matchedKey = Object.keys(roomNumbersMap || {}).find((key) =>
            normalizedSubCat.includes(key.toLowerCase())
        );
        quantity = matchedKey ? roomNumbersMap[matchedKey] : 1;
    } else {
        // Calculation of price * area
        matchedKey = Object.keys(areasData || {}).find((key) =>
            normalizedSubCat.includes(key.toLowerCase())
        );
        quantity = matchedKey ? areasData[matchedKey] : 1;
    }

    return quantity;
};
