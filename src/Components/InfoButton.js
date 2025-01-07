import React, { useState } from 'react';
import { calculateTotalPriceHelper } from '../Utils/CalculateTotalPriceHelper';
import { normalizeKey } from '../Utils/CalculateTotalPriceHelper';

const InfoButton = ({ selectedCategory, selectedSubCategory, quantityData, areasData, variant, price, showTotal = false, addonPrice }) => {
    const [showInfo, setShowInfo] = useState(false);

    const findClosestKey = (targetKey, dataObject) => {
        if (!targetKey || !dataObject) return null;

        const normalizedTargetKey = normalizeKey(targetKey);
        const keys = Object.keys(dataObject);

        return keys.find((key) => normalizedTargetKey.includes(normalizeKey(key))) || null;
    };

    const calculationDetails = () => {
        const normalizedSubCat =
            findClosestKey(selectedSubCategory, quantityData[0]) ||
            findClosestKey(selectedSubCategory, areasData[0]);

        const quantity = quantityData[0]?.[normalizedSubCat] || 0;
        const area = areasData[0]?.[normalizedSubCat] || 0;
        if (selectedCategory === "Furniture" || selectedCategory === "HVAC" || selectedCategory === "Partitions / Ceilings") {
            return { quantity, price: variant.price, addonPrice };
        } else {
            return { area, price: variant.price, addonPrice };
        }
    };

    const details = calculationDetails();

    const calculateTotalPrice = () => {
        const total = calculateTotalPriceHelper(quantityData[0], areasData[0], selectedCategory, selectedSubCategory);
        return total * price;
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
        >
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer">
                i
                {showInfo && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-100 text-gray-700 text-xs p-2 rounded shadow-lg z-10">
                        {details.quantity > 0 && <p>Quantity: {details.quantity}</p>}
                        {details.area > 0 && <p>Area: {details.area}</p>}
                        <p>Unit Price: ₹{details.price}</p>
                        <p>Total: ₹{calculateTotalPrice()}</p>
                    </div>
                )}
                {showTotal && showInfo && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-100 text-gray-700 text-xs p-2 rounded shadow-lg z-10">
                        {details.quantity > 0 && <p>Quantity: {details.quantity}</p>}
                        {details.area > 0 && <p>Area: {details.area}</p>}
                        <p>Product Price: ₹{details.price} / pp</p>
                        <p>Addon Price: ₹{addonPrice} / pp</p>       {/*Addon Price*/}
                        <p>Total: ₹{(details.price + addonPrice) * (details.quantity > 0 && details.quantity || details.area > 0 && details.area)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoButton;
