import React, { useState, useEffect } from "react";
import "../styles//Modal.css";

const Modal = ({
  children,
  onClose,
  selectedImage,
  additionalImages,
  selectedTitle,
  selectedDetails,
  selectedPrice,
  addOns,
  handleAddOnChange,
  selectedAddOns,
  calculateTotalPrice,
  handleDoneClick,

}) => {

  const [hoveredImage, setHoveredImage] = useState(selectedImage);
  const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';

  useEffect(() => {
    setHoveredImage(selectedImage); // Ensure hoveredImage matches the main image initially
  }, [selectedImage]);



  const additional_Images = (() => {
    try {
      return additionalImages && additionalImages !== "" ? JSON.parse(additionalImages) : [];
    } catch (error) {
      console.error("Error parsing additional images:", error);
      return [];
    }
  })();


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-5 relative" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>


        <div className="modal-product-details flex justify-between gap-1">
          <div className="modal-product-details modal-product flex justify-between gap-2">
            <div className="variant-sides-img flex flex-col">
              <img src={selectedImage}
                className={`mb-2 variant-thumbnail ${hoveredImage === selectedImage ? "highlighted-thumbnail" : ""}`}
                onMouseEnter={() => setHoveredImage(selectedImage)}
              />
              {Array.isArray(additional_Images) && additional_Images.length > 0 ? (
                additional_Images.map((image, index) => {
                  const fullImageURL = image.startsWith('http') ? image : `${baseImageUrl}${image}`;
                  return (
                    <img
                      key={index}
                      src={fullImageURL}
                      alt={`Variant ${index + 1}`}
                      className={`variant-thumbnail cursor-pointer ${hoveredImage === fullImageURL ? "highlighted-thumbnail" : ""}`}
                      onMouseEnter={() => setHoveredImage(fullImageURL)} // Update hovered image on hover
                    />
                  );
                })
              ) : (
                <p></p>
              )}
            </div>
            <div className="">
              <h3 className="text-xl">{selectedTitle}</h3>
              <div className="">
                <img src={hoveredImage} className="modal-variant-img mb-2" alt={selectedTitle} />
                <p className="text-xs text-wrap">{selectedDetails}  </p>
              </div>

            </div>
          </div>
          <div className="addons-container overflow-y-auto">
            <h3 className="text-sm">ADD-ONS</h3>
            {(addOns || []).map((addon) => (
              <div key={addon.id} className="addon-item text-sm">
                <h3>{addon.title}</h3>
                {addon.addon_variants.map((variant) => (
                  <div key={variant.id} className="addon-variant flex items-center">
                    <input
                      type="checkbox"
                      id={`addon-${variant.id}`}
                      checked={!!selectedAddOns[variant.title]} // Check if the add-on is selected
                      onChange={(e) =>
                        handleAddOnChange(variant, e.target.checked, addon.title)
                      }
                    />
                    <label htmlFor={`addon-${variant.id}`} className="ml-2">
                      <div className="flex items-center">
                        <img
                          src={variant.image || variant.title} // Fallback for missing image
                          alt={variant.title}
                          className="addon-image"
                        />
                        <div className="text-xs ml-2">
                          <h6 className="font-semibold">{variant.title}</h6>
                          <p>Price: ₹{variant.price}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ))}

          </div>
          <div className="absolute bottom-5 right-10 w-72 flex justify-between bg-white">
            <div>
              <h4 className="font-semibold text-sm">Price: ₹{selectedPrice}</h4>
              <h4 className="font-semibold text-sm">Total Price: ₹{calculateTotalPrice}</h4>
            </div>
            <button className="done-button " onClick={handleDoneClick}>Done</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Modal;
