import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import '../styles/Card.css'
import { calculateTotalPriceHelper } from "../Utils/CalculateTotalPriceHelper";

const Card = ({ price, product_variants = [], addOns, initialMinimized = true, roomData, quantity, onAddToCart, data, subCat, onDone,
    addon_variants = [], setPrice, selectedData, setSelectedData, product, category, areasData, categoriesWithModal }) => {

    const [isMinimized, setIsMinimized] = useState(initialMinimized);
    const [selectedAddOns, setSelectedAddOns] = useState({});
    const [showModal, setShowModal] = useState(false);
    const colorOptions = product_variants
        .filter(variant => variant.image)  // Filter out variants with null or undefined images
        .map(variant => ({
            src: variant.image,
            label: variant.title || 'Default',
            title: variant.title,
            details: variant.details,
            price: variant.price,
            id: variant.id,
            images: variant.additional_images || [],
        }));

    const [selectedImage, setSelectedImage] = useState(colorOptions.find(option => option.src)?.src || null);
    const [additionalImages, setAdditionalImages] = useState(colorOptions.find(option => option.images)?.images || []);
    const [selectedTitle, setSelectedTitle] = useState(product_variants[0]?.title || null);
    const [selectedDetails, setSelectedDetails] = useState(product_variants[0]?.details || null);
    const [selectedPrice, setSelectedPrice] = useState(product_variants[0]?.price || 0);
    const [selectedId, setSelectedId] = useState(product_variants[0]?.id || 0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const basePrice = selectedPrice;  //price
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        const groupKey = `${category}-${subCat}`;
        setIsHighlighted(
            selectedData.some(item => item.groupKey === groupKey && item.id === product.id)
        );
        console.log("group key", groupKey)
    }, [selectedData]);


    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'; // Ensure scrolling is restored
        };
    }, [showModal])

    const handleImageLoad = () => {
        setIsImageLoaded(true);
    };

    const handleAddOnChange = (variant, isChecked) => {
        // Ensure the variant object has title, price, and image
        if (!variant || !variant.title || variant.price == null || !variant.image) return;

        setSelectedAddOns((prevSelectedAddOns) => {
            if (isChecked) {
                // Add the selected add-on with separate fields for title, price, and image
                return {
                    ...prevSelectedAddOns,
                    [variant.title]: {
                        addon_title: variant.title || "No Title", // Store the title of the add-on
                        addon_price: variant.price || "No Price", // Store the price of the add-on
                        addon_image: variant.image || "No Image", // Store the image of the add-on
                        addonId: variant.addonid || "No Id",
                        variantID: variant.id || "No Id",
                    }
                };
            } else {
                // Remove the unselected add-on by title
                const { [variant.title]: _, ...rest } = prevSelectedAddOns;
                return rest;
            }
        });
    };

    const calculateTotalPrice = useMemo(() => {
        const totalAddOnPrice = Object.values(selectedAddOns).reduce(
            (total, addOn) => total + (addOn.addon_price || 0),
            0
        );

        const quantity = calculateTotalPriceHelper(data, areasData, category, subCat);

        return (quantity || 0) * (selectedPrice + totalAddOnPrice);
    }, [selectedAddOns, selectedPrice, data, subCat, areasData, category]);

    const toggleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    // const handleRemoveFromCart = (titleToRemove) => {
    //   setCartItems((prev) => prev.filter((item) => item.title !== titleToRemove));
    //   toggleMinimize();
    // };

    const [selectedProductId, setSelectedProductId] = useState(null); // Dynamic selection
    useEffect(() => {
        if (product && product_variants.length > 0) {
            // Preselect data when the component mounts or product changes
            preselectData(product.id);
            setSelectedProductId(product.id);
        }
    }, [product, selectedData]); // Run this effect whenever `product` or `selectedData` changes

    const preselectData = (productID) => {
        const existingProduct = selectedData.find((item) => item.id === productID);

        if (existingProduct) {
            const variant = product_variants.find(
                (v) => v.title === existingProduct.product_variant.variant_title
            );

            if (variant) {
                setSelectedImage(variant.image);
                setSelectedTitle(variant.title);
                setSelectedDetails(variant.details);
                setSelectedPrice(variant.price);
                setSelectedId(variant.id);
                setAdditionalImages(variant.additional_images)
            }

            setSelectedAddOns(
                Object.keys(existingProduct.addons).reduce((acc, title) => {
                    const addon = existingProduct.addons[title];
                    if (addon) {
                        acc[title] = {
                            addon_title: addon.addon_title || "No Title",
                            addon_price: addon.addon_price || 0,
                            addon_image: addon.addon_image || "No Image",
                            addonId: addon.addonId,
                        };
                    }
                    return acc;
                }, {})
            );
        } else {
            // Default selection
            const defaultVariant = product_variants[0];
            if (defaultVariant) {
                setSelectedImage(defaultVariant.image);
                setSelectedTitle(defaultVariant.title);
                setSelectedDetails(defaultVariant.details);
                setSelectedPrice(defaultVariant.price);
                setSelectedId(defaultVariant.id);
                setAdditionalImages(defaultVariant.additional_images)
            }
            setSelectedAddOns({});
            console.log("No matching product found. Default selected.");
        }
    };

    const handleStartClick = (category, subCat, productID) => {
        // clearSelectedData();
        const key = `${category}-${subCat}`;

        const priceValue = Number(price[key] || 0); // Ensure it's a number
        const totalPrice = Number(calculateTotalPrice || 0); // Ensure it's a number

        if (priceValue - totalPrice > -1) {
            setPrice(key, priceValue, -totalPrice);
        } else {
            setPrice(key, priceValue, 0);
        }
        toggleMinimize();
        setSelectedProductId(productID);
        preselectData(productID);
        console.log(productID)
    };

    const handelSelectedData = () => {
        if (!product) return;

        // Unique group key to ensure only one selection per group
        const groupKey = `${category}-${subCat}`;

        const productData = {
            groupKey, // For group-level management
            id: product.id,
            category,
            subcategory: subCat,
            subcategory1: product.subcategory1,
            product_variant: {
                variant_title: selectedTitle,
                variant_image: selectedImage,
                variant_details: selectedDetails,
                variant_price: selectedPrice,
                variant_id: selectedId,
                additional_images: additionalImages,
            },
            addons: selectedAddOns,
        };

        // Update selectedData to replace any existing product in the group
        setSelectedData((prevData) => {
            // Check if the exact product already exists
            const isDuplicate = prevData.some(item => item.groupKey === groupKey && item.id === product.id);

            if (isDuplicate) {
                console.log("Duplicate product detected. Skipping addition.");
                return prevData; // Return unchanged data if duplicate is found
            }

            if (categoriesWithModal.includes(category)) {
                // Replace existing product in the same group
                const updatedData = prevData.filter(item => item.groupKey !== groupKey);
                updatedData.push(productData); // Add the new product
                localStorage.setItem("selectedData", JSON.stringify(updatedData)); // Persist updated state
                return updatedData;
            } else {
                // Add the product without replacing
                const updatedData = [...prevData, productData];
                localStorage.setItem("selectedData", JSON.stringify(updatedData)); // Persist updated state
                return updatedData;
            }
        });

        console.log("group key in selected data function", groupKey)
        // Reset UI state for proper replacement
        // toggleMinimize(); // Minimize card
    };




    const clearSelectedData = () => {
        localStorage.removeItem('selectedData');
    };

    if (!isMinimized) {
        return (
            <>
                <div key={product.id} className={`"minimized-card mb-5 mt-5" ${isHighlighted ? 'highlighted' : ''}`}>
                    <div className='flex justify-between'>
                        <div className="info">
                            <span>{selectedTitle}</span>
                            <p>Price/Product: ₹{basePrice}</p>
                            <p>Total Price: ₹{calculateTotalPrice}</p>
                        </div>
                        {/* Attach the remove function to the Start button */}
                        <button className="start-button"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering `toggleMinimize`
                                /*handleRemoveFromCart(selectedTitle);*/ // Call remove function
                                handleStartClick(subCat, product.id);
                            }}
                        >
                            Start
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // const handleAddToCartClick = () => {
    //   const cartItem = {
    //     title: selectedTitle,
    //     image: selectedImage,
    //     price: calculateTotalPrice,
    //     addOns: Object.keys(selectedAddOns).filter((key) => selectedAddOns[key] > 0),
    //   };
    //   onAddToCart(cartItem); // Add item to cart
    //   toggleMinimize();
    // };

    const handleImageClick = (imageSrc, title, details, price, images) => {
        if (imageSrc !== selectedImage) {
            setSelectedImage(imageSrc); // Only update the selected image if it's different
            setSelectedTitle(title); // Update the selected title
            setSelectedDetails(details);
            setSelectedPrice(price);
            setIsImageLoaded(false); // Reset image load state to trigger fade-in for the new image
            setAdditionalImages(images)
        }
    };

    const handleDoneClick = () => {
        onDone(calculateTotalPrice); // Pass the total price to the parent
        const key = `${category}-${subCat}`;

        setPrice(key, calculateTotalPrice);
        toggleMinimize();
        handelSelectedData();
        setShowModal(false);
        // clearSelectedData();
    };
    const handleExpandVariant = () => {
        setShowModal(true);
    };
    return (
        <div className="card-container">
            <CardSection className="card-image">
                <img src={selectedImage} alt={selectedTitle} className={`image ${isImageLoaded ? 'loaded' : ''} cursor-pointer`} onLoad={handleImageLoad} onClick={handleExpandVariant} />

                <div className="color-options">
                    {colorOptions.filter(option => option.src).map((option, index) => (
                        <img
                            key={index}
                            src={option.src}
                            alt={option.label}
                            className="color-thumbnail"
                            onClick={() => handleImageClick(option.src, option.title, option.details, option.price, option.images)}
                        />
                    ))}
                </div>

            </CardSection>
            {showModal && (
                <Modal
                    showModal={showModal}
                    selectedTitle={selectedTitle}//
                    selectedImage={selectedImage}//
                    additionalImages={additionalImages}
                    selectedDetails={selectedDetails}//
                    selectedPrice={selectedPrice}//
                    addOns={addOns}
                    selectedAddOns={selectedAddOns}//
                    handleAddOnChange={handleAddOnChange}
                    calculateTotalPrice={calculateTotalPrice}
                    handleDoneClick={handleDoneClick}
                    category={category}
                    onClose={() => setShowModal(false)}
                />
            )}

            <CardSection className="card-features">
                <h3>{selectedTitle}</h3>
                <p className='text-sm'>{selectedDetails}</p>
                {roomData && (
                    <div className="room-info">
                        <p>Room Data:</p>
                        <ul>
                            {Object.entries(roomData).map(([key, value]) => (
                                <li key={key}>{`${key}: ${value}`}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {quantity && (
                    <div className="quantity-info">
                        <p>Quantity: {quantity}</p>
                    </div>
                )}
            </CardSection>

            <CardSection className="card-add-ons overflow-y-auto">
                <h3 className='section-heading'>ADD ON</h3>
                <ul>
                    {addOns.map((addOn, index) => (
                        <li key={index} className="hover-card" style={{ position: 'relative', padding: '10px', borderRadius: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center' }} className="hover-trigger">
                                {addOn.title}
                            </label>
                            <ul className="addon-type text-xs">
                                {addon_variants
                                    .filter((variant) => variant.addonid === addOn.id) // Check if variant belongs to the current addOn
                                    .map((variant, index) => (
                                        <li key={variant.id || index} className='addon-variant flex flex-row'>
                                            <input type="checkbox" id={`addon-${variant.id || index}`}
                                                checked={!!selectedAddOns[variant.title]}
                                                onChange={(e) => handleAddOnChange(variant, e.target.checked, addOn.title)} />
                                            <label htmlFor={`addon-${variant.id || index}`}>{variant.title} (+₹{variant.price})</label>
                                            <img
                                                src={variant.image}
                                                alt={variant.title}
                                                className="hover-image"
                                            />
                                        </li>
                                    ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </CardSection>

            <CardSection className="card-summary">
                <h4>Summary</h4>
                <p>Price/Product: ₹{basePrice}</p>
                <p>Add-Ons: ₹{Object.values(selectedAddOns).reduce((total, addOn) => total + addOn.addon_price, 0)}</p>
                <p>Total Price: ₹{calculateTotalPrice}</p>
                <button className="done-button" onClick={handleDoneClick}>Done</button>

                {/* <button className="done-button" onClick={() => { handelSelectedData(); }} > Done </button> */}
            </CardSection>
        </div>
    );
};

const CardSection = ({ className, children }) => {
    return <div className={`card ${className}`}>{children}</div>;
};

export default Card;