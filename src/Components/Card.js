import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';


const Card = ({ price, product_variants = [], addOns, initialMinimized = false, roomData, quantity, onAddToCart, data, subCat, onDone,
    addon_variants = [], setPrice, selectedData, setSelectedData, product }) => {

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

    console.log("variant data", colorOptions);

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

    const handleAddOnChange = (variant, isChecked, addOn) => {
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
        const normalizedSubCat = subCat.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchedKey = Object.keys(data).find((key) =>
            normalizedSubCat.includes(key.toLowerCase())
        );
        const quantity = matchedKey ? data[matchedKey] : 1;
        return (quantity || 0) * (selectedPrice + totalAddOnPrice);
    }, [selectedAddOns, selectedPrice, data, subCat]);

    const toggleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    // const handleRemoveFromCart = (titleToRemove) => {
    //   setCartItems((prev) => prev.filter((item) => item.title !== titleToRemove));
    //   toggleMinimize();
    // };

    // useEffect(() => {
    //   updateBOQTotal(calculateTotalPrice);
    // }, [calculateTotalPrice]); 

    useEffect(() => {
        if (product && product_variants.length > 0) {
            // Preselect data when the component mounts or product changes
            preselectData(product.id);
        }
    }, [product, selectedData]); // Run this effect whenever `product` or `selectedData` changes

    const [selectedProductId, setSelectedProductId] = useState(null); // Dynamic selection

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

    const handleStartClick = (subCat, productID) => {
        // clearSelectedData();
        const priceValue = Number(price[subCat]); // Ensure it's a number
        const totalPrice = Number(calculateTotalPrice); // Ensure it's a number

        if (priceValue - totalPrice > -1) {
            setPrice(subCat, -totalPrice);
        } else {
            setPrice(subCat, 0);
        }
        toggleMinimize();
        setSelectedProductId(productID);
        preselectData(productID);
        console.log(productID)
    };

    const handelSelectedData = () => {
        if (!product || product.id !== selectedProductId) {
            console.error("Product not found or ID does not match.");
            return;
        }
        const productData = {
            id: product.id,
            category: product.category,
            subcategory: product.subcategory,
            subcategory1: product.subcategory1,
            product_variant: {
                variant_title: selectedTitle,
                variant_iamge: selectedImage,
                variant_details: selectedDetails,
                variant_price: selectedPrice,
                variant_id: selectedId,
                additional_images: additionalImages,
            },
            addons: selectedAddOns,
        };

        // Update selectedData state
        setSelectedData((prevData) => {
            // Find if the product already exists by product.id
            const productIndex = prevData.findIndex(
                (item) => item.id === product.id // Check by `id` not by `product_variant.id`
            );

            let updatedData;

            if (productIndex !== -1) {
                // Product exists, update it
                updatedData = [...prevData];
                updatedData[productIndex] = { ...updatedData[productIndex], ...productData };
            } else {
                // Product does not exist, add it
                updatedData = [...prevData, productData];
            }

            // Save updated data to localStorage
            localStorage.setItem("selectedData", JSON.stringify(updatedData));

            return updatedData;
        });
    };

    const clearSelectedData = () => {
        localStorage.removeItem('selectedData');
    };

    console.log("selected data", selectedData)
    // console.log("product",product)

    if (!isMinimized) {
        return (
            <>
                <div key={product.id} className="minimized-card mb-5">
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
    // console.log("productsData length:", product.length);
    // console.log("productsData content:", product);
    // console.log("sub category",subCat)

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
        setPrice(subCat, calculateTotalPrice);
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
                    selectedTitle={selectedTitle}
                    selectedImage={selectedImage}
                    additionalImages={additionalImages}
                    selectedDetails={selectedDetails}
                    selectedPrice={selectedPrice}
                    addOns={addOns}
                    selectedAddOns={selectedAddOns}
                    handleAddOnChange={handleAddOnChange}
                    calculateTotalPrice={calculateTotalPrice}
                    handleDoneClick={handleDoneClick}
                    onClose={() => setShowModal(false)} />
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


                {/* <button
            className="done-button"
            onClick={() => {
              handelSelectedData();
            }}
          >
            Done
          </button> */}
            </CardSection>
        </div>
    );
};

const CardSection = ({ className, children }) => {
    return <div className={`card ${className}`}>{children}</div>;
};

export default Card;