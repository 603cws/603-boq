import React, { useState, useEffect } from "react";
import "../styles/Modal.css";
import InfoButton from './InfoButton.js';
import { CalculateVariantPrice, CalculateAddonPrice } from '../Utils/CalulateVariantPrice.js';

const Modal = ({ onClose, variant, additionalImages, selectedAddOns, handleAddOnChange, calculateTotalPrice, handleDoneClick, product, selectedCategory, selectedSubCategory, quantityData, areasData }) => {
  const [hoveredImage, setHoveredImage] = useState(variant.image); // Default to main image
  const [variantPrice, setVariantPrice] = useState(CalculateVariantPrice(selectedCategory, selectedSubCategory, variant.price, quantityData, areasData));
  const [addonPrice, setAddonPrice] = useState(CalculateAddonPrice(selectedCategory, selectedSubCategory, 1234, quantityData, areasData)); //addon price is hardcoded for now
  const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';

  // Ensure hovered image resets when variant changes
  useEffect(() => {
    setHoveredImage(variant.image);
  }, [variant]);
  if (!product.addons || product.addons.length === 0) {
    return null; // Return nothing if there are no addons
  }

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
              <p className="font-semibold text-sm mt-2">Price: ₹{variantPrice}</p>
            </div>
          </div>
          {/* <h1 className="addons-container overflow-y-auto mt-4">Addon Price: {addonPrice}</h1> */}

          {/* Add-Ons Section */}
          {/* Add-Ons Section */}
          {product.addons && product.addons.length > 0 ? (
            <div className="addons-container overflow-y-auto mt-4">
              <h3 className="text-sm font-semibold mb-2">ADD-ONS</h3>
              {product.addons
                .filter((addon) => Array.isArray(addon.addon_variants) && addon.addon_variants.length > 0) // Filter add-ons with variants
                .map((addon) => (
                  <div key={addon.id} className="addon-item text-sm mb-3">
                    {/* Add-On Title */}
                    <h4>{addon?.title || "Untitled Add-On"}</h4>

                    {/* Add-On Variants */}
                    {addon.addon_variants.map((variant) => (
                      <div key={variant.id || Math.random()} className="addon-variant flex items-center mb-2">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          id={`addon-${variant.id || Math.random()}`}
                          // checked={!!selectedAddOns[variant.title]} // Check state
                          onChange={(e) => handleAddOnChange(variant, e.target.checked, addon?.title)}
                        />

                        {/* Variant Details */}
                        <label htmlFor={`addon-${variant.id || Math.random()}`} className="ml-2 flex items-center">
                          {/* Variant Image */}
                          <img
                            src={variant?.image || "default-image.png"} // Fallback image
                            alt={variant?.title || "Untitled Variant"}
                            className="addon-image w-10 h-10 object-cover"
                          />

                          {/* Variant Info */}
                          <div className="text-xs ml-2">
                            <h6 className="font-semibold">{variant?.title || "Untitled Variant"}</h6>
                            <p>Price: ₹{variant?.price || 0}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ) : (
            <p>No add-ons available for this product</p>
          )}

        </div>



        {/* Total Price Section */}
        <div className="absolute bottom-5 right-10 w-72 flex justify-between bg-white p-3 rounded-md shadow-lg">
          <div>
            <h4 className="font-semibold text-sm">Price: ₹{variantPrice + addonPrice}</h4>
            <InfoButton
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              quantityData={quantityData}
              areasData={areasData}
              variant={variant}
              price={variant.price}
              showTotal={true}
            />
            {/* <h4 className="font-semibold text-sm">Total Price: ₹{calculateTotalPrice()}</h4> */}
          </div>
          <button className="done-button bg-blue-500 text-white py-2 px-4 rounded" onClick={handleDoneClick}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
