import React, { useState } from 'react';
import Modal from './Modal';
import InfoButton from './InfoButton.js';
import { CalculateVariantPrice } from '../Utils/CalulateVariantPrice.js';

const ProductCard = ({ product, variant, additionalImages, isSelected, handleSelect, selectedCategory, selectedSubCategory, quantityData, areasData, handelSelectedData, selectedSubCategory1 }) => {
    const [mainImageHovered, setMainImageHovered] = useState(false); // For main image hover effect
    const [showModal, setShowModal] = useState(false); // For modal visibility
    const [hoveredImage, setHoveredImage] = useState(null); // For additional image hover effect

    const handleExpandVariant = () => {
        setShowModal(true);
    };

    return (
        <>
            <div
                className={`relative bg-white rounded-lg shadow-md transition-transform duration-300`}
                onMouseEnter={() => setMainImageHovered(true)}
                onMouseLeave={() => setMainImageHovered(false)}
                onClick={handleExpandVariant}
                style={{
                    transform: mainImageHovered ? 'scale(1.3)' : 'scale(1)',
                    zIndex: mainImageHovered ? 10 : 1,
                }}
            >
                {/* Main Image */}
                <div className="relative w-full h-64 overflow-auto">
                    <img
                        src={hoveredImage || variant.image} // Displays hoveredImage or original main image
                        alt={variant.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Details Section */}
                {mainImageHovered && (
                    <div
                        className={`p-4 transition-opacity duration-300 bg-white w-full absolute -bottom-30 shadow-md ${mainImageHovered ? 'opacity-100 visible ' : 'opacity-0 invisible'
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <h1 className="text-gray-800 text-sm font-bold mb-2">{variant.title}</h1>
                            <div className="flex items-center gap-2 relative">
                                <p className="text-green-600 font-semibold mb-4 text-sm">
                                    Price: ₹{CalculateVariantPrice(selectedCategory, selectedSubCategory, variant.price, quantityData, areasData)}
                                </p>
                                {/* Info Button */}
                                <InfoButton
                                    selectedCategory={selectedCategory}
                                    selectedSubCategory={selectedSubCategory}
                                    quantityData={quantityData}
                                    areasData={areasData}
                                    variant={variant}
                                    price={variant.price}
                                />
                            </div>
                        </div>
                        <p className="text-gray-600 text-xs mb-2">{variant.description}</p>

                        {/* Additional Images */}
                        {additionalImages.length > 0 && (
                            <div className="additional-images flex gap-2 justify-start">
                                {additionalImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Angle ${idx + 1}`}
                                        onMouseEnter={() => setHoveredImage(img)} // Updates hoveredImage on hover
                                        onMouseLeave={() => setHoveredImage(null)} // Reverts to main image on leave
                                        className="w-10 h-10 object-cover cursor-pointer rounded-lg border-2 border-transparent"
                                    />
                                ))}
                            </div>
                        )}
                        {/* Select Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevents modal from opening
                                handelSelectedData(product, variant, selectedCategory, selectedSubCategory, selectedSubCategory1)
                            }}
                            className={`mt-4 px-4 py-1 rounded text-white text-xs ${isSelected ? 'bg-orange-500' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            {isSelected ? 'Selected' : 'Select'}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <Modal
                    showModal={showModal}
                    onClose={() => setShowModal(false)}
                    variant={variant}
                    additionalImages={additionalImages}
                    product={product}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
                    quantityData={quantityData}
                    areasData={areasData}
                />
            )}
        </>
    );
};

export default ProductCard;
