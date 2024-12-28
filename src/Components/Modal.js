import React, { useState, useEffect } from "react";
import "../styles/Modal.css";
import InfoButton from './InfoButton.js';
import { CalculateVariantPrice } from '../Utils/CalulateVariantPrice.js';

const Modal = ({ onClose, variant, additionalImages, selectedAddOns, handleAddOnChange, calculateTotalPrice, handleDoneClick, product, selectedCategory, selectedSubCategory, quantityData, areasData }) => {
  const [hoveredImage, setHoveredImage] = useState(variant.image); // Default to main image
  const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';

  // Ensure hovered image resets when variant changes
  useEffect(() => {
    setHoveredImage(variant.image);
  }, [variant]);

  // Parse additional images safely
  // const additional_Images = (() => {
  //   try {
  //     return additionalImages && additionalImages !== "" ? JSON.parse(additionalImages) : [];
  //   } catch (error) {
  //     console.error("Error parsing additional images:", error);
  //     return [];
  //   }
  // })();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-5 relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        {/* Product Details */}
        <div className="modal-product-details flex gap-4">
          {/* Additional Images on Left */}
          <div className="variant-sides-img flex flex-col w-1/3">
            <img
              src={variant.image}
              className={`variant-thumbnail cursor-pointer ${hoveredImage === variant.image ? "highlighted-thumbnail" : ""}`}
              onMouseEnter={() => setHoveredImage(variant.image)}
            />
            {Array.isArray(additionalImages) && additionalImages.length > 0 ? (
              additionalImages.map((image, index) => {
                const fullImageURL = image.startsWith('http') ? image : `${baseImageUrl}${image}`;
                return (
                  <img
                    key={index}
                    src={fullImageURL}
                    alt={`Variant ${index + 1}`}
                    className={`variant-thumbnail cursor-pointer ${hoveredImage === fullImageURL ? "highlighted-thumbnail" : ""} w-20 h-20 object-cover mb-2`} // Thumbnail size
                    onMouseEnter={() => setHoveredImage(fullImageURL)} // Change main image on hover
                  // onMouseLeave={() => setHoveredImage(variant.image)} // Revert to original on leave
                  />
                );
              })
            ) : (
              <p>No additional images available</p>
            )}
          </div>

          {/* Main Image and Product Info */}
          <div className="product-info w-2/3">
            {/* Main Image */}
            <img
              src={hoveredImage || variant.image} // Ensure hovered image is displayed
              alt={variant.title}
              className="modal-variant-img mb-2 w-full h-auto object-cover" // Larger image in modal
            />

            <div className="product-details mt-4">
              {/* Product Title */}
              <h3 className="text-xl font-semibold">{variant.title}</h3>

              {/* Product Description */}
              <p className="text-xs text-wrap">{variant.details}</p>

              {/* Product Price */}
              <p className="font-semibold text-sm mt-2">Price: ₹{CalculateVariantPrice(selectedCategory, selectedSubCategory, variant.price, quantityData, areasData)}</p>
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
        </div>

        {/* Add-Ons Section */}
        {variant.addOns && variant.addOns.length > 0 && (
          <div className="addons-container overflow-y-auto mt-4">
            <h3 className="text-sm font-semibold mb-2">ADD-ONS</h3>
            {variant.addOns.map((addon) => (
              <div key={addon.id} className="addon-item text-sm mb-3">
                <h4>{addon.title}</h4>
                {addon.addon_variants.map((variant) => (
                  <div key={variant.id} className="addon-variant flex items-center">
                    <input
                      type="checkbox"
                      id={`addon-${variant.id}`}
                      checked={!!selectedAddOns[variant.title]} // Check if the add-on is selected
                      onChange={(e) => handleAddOnChange(variant, e.target.checked, addon.title)}
                    />
                    <label htmlFor={`addon-${variant.id}`} className="ml-2 flex items-center">
                      <img
                        src={variant.image || variant.title} // Fallback for missing image
                        alt={variant.title}
                        className="addon-image w-10 h-10 object-cover"
                      />
                      <div className="text-xs ml-2">
                        <h6 className="font-semibold">{variant.title}</h6>
                        <p>Price: ₹{variant.price}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Total Price Section */}
        <div className="absolute bottom-5 right-10 w-72 flex justify-between bg-white p-3 rounded-md shadow-lg">
          <div>
            <h4 className="font-semibold text-sm">Price: ₹{variant.price}</h4>
            {/* <h4 className="font-semibold text-sm">Total Price: ₹{calculateTotalPrice()}</h4> */}
          </div>
          <button
            className="done-button bg-blue-500 text-white py-2 px-4 rounded"
            onClick={handleDoneClick}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
