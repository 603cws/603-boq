import { calculateTotalPriceHelper } from "./CalculateTotalPriceHelper";

export const CalculateVariantPrice = (cat, subCat, price, quantityData, areasData) => {
    const total = calculateTotalPriceHelper(quantityData[0], areasData[0], cat, subCat);
    return total * price;
};

export const CalculateAddonPrice = (cat, subCat, addonPrice, quantityData, areasData) => {
    const total = calculateTotalPriceHelper(quantityData[0], areasData[0], cat, subCat);
    // return total * addonPrice;
    return total * 1234; // Hardcoded for now
}