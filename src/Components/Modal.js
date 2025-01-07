import React, { useState, useEffect } from "react";
import "../styles/Modal.css";
import InfoButton from './InfoButton.js';
import { CalculateVariantPrice, CalculateAddonPrice } from '../Utils/CalulateVariantPrice.js';
import { useGrandTotal } from "../GrandTotalContext.js";

const Modal = ({ onClose, variant, additionalImages, selectedAddOns, handleAddOnChange, calculateTotalPrice, product, selectedCategory,
  selectedSubCategory, selectedSubCategory1, quantityData, areasData, handelSelectedData, isSelected, selectedData, setSelectedData }) => {
  const [hoveredImage, setHoveredImage] = useState(variant.image); // Default to main image
  const [variantPrice, setVariantPrice] = useState(CalculateVariantPrice(selectedCategory, selectedSubCategory, variant.price, quantityData, areasData));
  const [addonPrice, setAddonPrice] = useState(CalculateAddonPrice(selectedCategory, selectedSubCategory, 0, quantityData, areasData)); //addon price is hardcoded for now
  const [singleAddonPrice, setSingleAddonPrice] = useState(0);
  const [isDone, setIsDone] = useState(isSelected); // Tracks button state
  const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';

  const { grandTotal, setGrandTotal } = useGrandTotal();

  // Load selectedData from localStorage on component mount
  useEffect(() => {
    // Load selectedData from localStorage
    const storedData = JSON.parse(localStorage.getItem("selectedData")) || [];

    // Check if the current variant is already selected
    const isVariantSelected = storedData.some(
      (item) =>
        item.category === selectedCategory &&
        item.subcategory === selectedSubCategory &&
        item.subcategory1 === selectedSubCategory1 &&
        item.product_variant.variant_id === variant.id
    );

    // Update isDone state based on the selected status
    setIsDone(isVariantSelected);

    // Update selectedData state from localStorage
    setSelectedData(storedData);
  }, [variant, selectedCategory, selectedSubCategory, selectedSubCategory1]);

  // useEffect(() => {
  //   localStorage.removeItem("selectedData");
  // }, [])

  // Ensure hovered image resets when variant changes
  useEffect(() => {
    setHoveredImage(variant.image);
  }, [variant]);

  if (!product.addons || product.addons.length === 0) {
    return null; // Return nothing if there are no addons
  }

  const handleButtonClick = () => {
    if (!isDone) {
      // Add prices to grandTotal
      setGrandTotal(grandTotal + variantPrice + addonPrice);
      handelSelectedData(product, variant, selectedCategory, selectedSubCategory, selectedSubCategory1);
    } else {
      // Subtract prices from grandTotal
      setGrandTotal(grandTotal - variantPrice - addonPrice);
      // Remove the product from selectedData
      setSelectedData((prevData) => {
        const updatedData = prevData.filter(
          (item) =>
            !(
              item.category === selectedCategory &&
              item.subcategory === selectedSubCategory &&
              item.subcategory1 === selectedSubCategory1 &&
              item.product_variant.variant_id === variant.id
            )
        );

        // Persist the updated data in localStorage
        localStorage.setItem("selectedData", JSON.stringify(updatedData));
        return updatedData;
      });
    }
    setIsDone(!isDone); // Toggle button state
  };

  const handleChange = (checked, price) => {
    if (checked) {
      setSingleAddonPrice(price);
      setAddonPrice(addonPrice + CalculateAddonPrice(selectedCategory, selectedSubCategory, price, quantityData, areasData));
    } else {
      setSingleAddonPrice(singleAddonPrice - price);
      setAddonPrice(addonPrice - CalculateAddonPrice(selectedCategory, selectedSubCategory, price, quantityData, areasData));
    }
  };

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
                    className={`variant-thumbnail cursor-pointer ${hoveredImage === fullImageURL ? "highlighted-thumbnail" : ""} w-20 h-20 object-cover mb-2`}
                    onMouseEnter={() => setHoveredImage(fullImageURL)}
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
              src={hoveredImage || variant.image}
              alt={variant.title}
              className="modal-variant-img mb-2 w-full h-auto object-cover"
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

          {/* Add-Ons Section */}
          {product.addons && product.addons.length > 0 ? (
            <div className="addons-container overflow-y-auto mt-4">
              <h3 className="text-sm font-semibold mb-2">ADD-ONS</h3>
              {product.addons
                .filter((addon) => Array.isArray(addon.addon_variants) && addon.addon_variants.length > 0)
                .map((addon) => (
                  <div key={addon.id} className="addon-item text-sm mb-3">
                    <h4>{addon?.title || "Untitled Add-On"}</h4>
                    {addon.addon_variants.map((variant) => (
                      // Check if this addonId exists in selectedData
                      // const isAddonSelected = selectedData.some(
                      //   (item) =>
                      //     item.product_variant.variant_id === variantID && // Check for matching variant ID
                      //     item.category === selectedCategory && // Check for matching category
                      //     item.addons.some((addonItem) => addonItem.addonId === variant.id) // Check for matching addon ID
                      // );
                      <div key={variant.id || Math.random()} className="addon-variant flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`addon-${variant.id || Math.random()}`}
                          checked={
                            selectedData &&
                            selectedData.some((item) =>
                              item.category === selectedCategory &&
                              item.subcategory === selectedSubCategory &&
                              item.subcategory1 === selectedSubCategory1 &&
                              Object.values(item.addons || {}).some((addon) => addon.variantID === variant.id)
                            )
                          }
                          onChange={(e) => {
                            handleAddOnChange(variant, e.target.checked, addon?.title);
                            handelSelectedData(product, variant, selectedCategory, selectedSubCategory, selectedSubCategory1);
                            handleChange(e.target.checked, variant.price);
                          }}
                        />
                        <label htmlFor={`addon-${variant.id || Math.random()}`} className="ml-2 flex items-center">
                          <img
                            src={variant?.image || "default-image.png"}
                            alt={variant?.title || "Untitled Variant"}
                            className="addon-image w-10 h-10 object-cover"
                          />
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
              addonPrice={singleAddonPrice}
            />
          </div>
          <button className="done-button bg-blue-500 text-white py-2 px-4 rounded" onClick={handleButtonClick}>
            {isDone ? "Remove" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
