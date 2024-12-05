import React, { useState, useMemo, useEffect } from 'react';
import { Slider, Skeleton, Select, MenuItem, Button } from '@mui/material';
import { supabase } from './supabase';
import RoomDataBox from './RoomDataBox';
import './boq.css';
// import Cart from './Cart';
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
// import * as XLSX from "xlsx";
// import ExcelJS from "exceljs";
// import fs from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import './Modal'
import Modal from './Modal';
// import { MdExpandMore, MdExpandLess } from 'react-icons/md';

const Card = ({ title, price, image, details, product_variants = [], addOns, initialMinimized = false, roomData, quantity, onAddToCart, data, subCat, onDone, addon_variants = [], setPrice, selectedData, setSelectedData, product }) => {
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
      images : variant.additional_images || [],
    }));

  const [selectedImage, setSelectedImage] = useState(colorOptions.find(option => option.src)?.src || null);
  const [additionalImages, setAdditionalImages] = useState(colorOptions.find(option => option.images)?.images || []);
  const [selectedTitle, setSelectedTitle] = useState(product_variants[0]?.title || null);
  const [selectedDetails, setSelectedDetails] = useState(product_variants[0]?.details || null);
  const [selectedPrice, setSelectedPrice] = useState(product_variants[0]?.price || 0);
  const [selectedId, setSelectedId] = useState(product_variants[0]?.id || 0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const basePrice = selectedPrice;  //price

console.log("variant data",colorOptions);

  useEffect(()=>{
    if(showModal){
      document.body.style.overflow='hidden'
    }else{
      document.body.style.overflow='auto'
    }
    return () => {
      document.body.style.overflow = 'auto'; // Ensure scrolling is restored
    };
  },[showModal])

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
  }, [selectedAddOns, selectedPrice, data]);


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
            <button
              className="start-button"
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

  const handleImageClick = (imageSrc, title, details, price,images) => {
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
              onClick={() => handleImageClick(option.src, option.title, option.details, option.price,option.images)}
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
          onClose={() => setShowModal(false)}/>
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

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([1000, 12000]);
  const [productsData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  // const [open, setOpen] = useState(false);
  // const [cartItems, setCartItems] = useState([]);
  const [totalBOQCost, setTotalBOQCost] = useState(0);
  const [selectedData, setSelectedData] = useState([]);


  const categories = [
    'Furniture',
    'Civil / Plumbing',
    'Lighting',
    'Electrical',
    'Partitions- door / windows / ceilings',
    'Paint',
    'HVAC',
    'Smart Solutions',
    'Flooring',
    'Accessories'
  ];

  async function fetchRoomData() {
    try {
      const { data, error } = await supabase
        .from('quantity')
        .select()
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latestRoomData = data[0];
        const roomsArray = {
          linear: latestRoomData.linear,
          ltype: latestRoomData.ltype,
          md: latestRoomData.md,
          manager: latestRoomData.manager,
          small: latestRoomData.small,
          ups: latestRoomData.ups,
          bms: latestRoomData.bms,
          server: latestRoomData.server,
          reception: latestRoomData.reception,
          lounge: latestRoomData.lounge,
          sales: latestRoomData.sales,
          phonebooth: latestRoomData.phonebooth,
          discussionroom: latestRoomData.discussionroom,
          interviewroom: latestRoomData.interviewroom,
          conferenceroom: latestRoomData.conferenceroom,
          boardroom: latestRoomData.boardroom,
          meetingroom: latestRoomData.meetingroom,
          meetingroomlarge: latestRoomData.meetingroomlarge,
          hrroom: latestRoomData.hrroom,
          financeroom: latestRoomData.financeroom,
        };
        setRoomNumbers([roomsArray]);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  }

  async function fetchProductsData() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          addons(*,
            addon_variants(*)
          ),
          product_variants (*)
        `);

      if (error) throw error;

      // Flatten all images from products, addons, and product_variants
      const allImages = data.flatMap(product => [
        ...product.product_variants.map(variant => variant.image),
        ...product.addons.flatMap(addon => [
          addon.image,
          ...addon.addon_variants.map(variant => variant.image)
        ])
      ]).filter(Boolean); // Remove null or undefined images

      const uniqueImages = [...new Set(allImages)];

      const { data: signedUrls, error: signedUrlError } = await supabase.storage
        .from("addon")
        .createSignedUrls(uniqueImages, 3600);

      if (signedUrlError) throw signedUrlError;

      const urlMap = Object.fromEntries(signedUrls.map(item => [item.path, item.signedUrl]));

      const processedData = data.map(product => ({
        ...product,
        product_variants: product.product_variants.map(variant => ({
          ...variant,
          image: urlMap[variant.image] || ''
        })),
        addons: product.addons.map(addon => ({
          ...addon,
          image: urlMap[addon.image] || '',
          addon_variants: addon.addon_variants.map(variant => ({
            ...variant,
            image: urlMap[variant.image] || ''
          }))
        }))
      }));
      console.log("all images", allImages)
      setProductData(processedData);
    } catch (error) {
      console.error('Error fetching products data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([fetchRoomData(), fetchProductsData()]);
  }, []);
  useEffect(() => {
    const savedData = localStorage.getItem('selectedData');

    if (savedData) {
      setSelectedData(JSON.parse(savedData)); // Parse and set the data
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // const updateBOQTotal = (newTotalPrice) => {
  //   setTotalBOQCost(prev => prev + newTotalPrice);
  // };
  const updateBOQTotal = () => {
    const total = Object.values(price).reduce((acc, curr) => acc + curr, 0); // Sum of all prices
    setTotalBOQCost(total);
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      // Ensure product_variants2 exists and has at least one element
      if (!product.product_variants || product.product_variants.length === 0) {
        return false;
      }

      // Check if any variant matches the criteria
      const matchesVariant = product.product_variants.some((variant) => {
        // Ensure title, details, and price exist in the variant
        const matchesSearch =
          variant.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variant.details?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice =
          variant.price >= priceRange[0] && variant.price <= priceRange[1];
        return matchesSearch && matchesPrice;
      });

      const matchesCategory =
        selectedCategory === '' || product.category === selectedCategory;

      return matchesVariant && matchesCategory;
    });
  }, [productsData, searchQuery, priceRange, selectedCategory]);


  const groupedProducts = useMemo(() => {
    const grouped = {};
    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = {};
      }
      if (!grouped[product.category][product.subcategory]) {
        grouped[product.category][product.subcategory] = [];
      }
      grouped[product.category][product.subcategory].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  // const toggleCart = () => {
  //   setOpen(true);
  // }

  // const handleAddToCart = (item) => {
  //   setCartItems((prev) => [...prev, item]);
  // };

  const [expandedSubcategory, setExpandedSubcategory] = useState(null);

  const toggleSubcategory = (subcategory) => {
    setExpandedSubcategory((prev) => (prev === subcategory ? null : subcategory));
  };

  const [price, setPrice] = useState({});

  const handlePrice = (subCat, value) => {
    setPrice((prevPrices) => {
      const updatedPrices = {
        ...prevPrices,
        [subCat]: Math.max(0, (prevPrices[subCat] || 0) + value), // Ensure price doesn't go below 0
      };

      // Update the BOQ Total
      const total = Object.values(updatedPrices).reduce((acc, curr) => acc + curr, 0);
      setTotalBOQCost(total);

      return updatedPrices; // Ensure the new state is returned
    });
  };


   // Helper function to fetch an image as Base64
//    async function fetchImageAsBase64(url) {
//     try {
//         console.log("Fetching image URL:", url);
//         const response = await fetch(url, { mode: "cors" });

//         if (!response.ok) {
//             console.error("Failed to fetch image:", response.status, response.statusText);
//             return null;
//         }

//         const blob = await response.blob();
//         console.log("Fetched blob:", blob);

//         const contentType = response.headers.get("Content-Type");
//         const imageType = contentType === "image/png"
//             ? "PNG"
//             : contentType === "image/jpeg"
//             ? "JPEG"
//             : null;

//         if (!imageType) {
//             console.error("Unsupported image type:", contentType);
//             return null;
//         }

//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 const base64Image = reader.result; // Use full Base64 string
//                 resolve({ base64Image, imageType });
//             };
//             reader.onerror = (error) => {
//                 console.error("Failed to convert image to Base64:", url, error);
//                 reject(error);
//             };
//             reader.readAsDataURL(blob);
//         });
//     } catch (error) {
//         console.error("Error fetching image URL:", url, error);
//         return null;
//     }
// }


    


// const handleDownloadPDF = async () => {
//   const data = JSON.parse(localStorage.getItem("selectedData")) || [];

//   if (data.length === 0) {
//     console.error("No data to export");
//     return;
//   }

//   const fetchAllImages = async (item) => {
//     const fetchImages = async (urls) => {
//       return Promise.all(
//         urls.map(async (path) => {
//           const publicUrl = `https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/${path}`;

//           const base64Data = await fetchImageAsBase64(path);
//           if (!base64Data) {
//             console.warn(`Skipping image for path: ${path}`);
//             return { base64Image: null, imageType: null };
//           }
//           return base64Data;
//         })
//       );
//     };

//     // Generate direct public URL for Variant Image
//     if (item.product_variant?.variant_image) {
//       const publicUrl = `https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/${item.product_variant.variant_image}`;
//       const base64Data = await fetchImageAsBase64(item.product_variant.variant_image);
//       item.product_variant.variantBase64Image = base64Data || { base64Image: null, imageType: null };
//     }

//     // Generate direct public URLs for Addon Images
//     if (item.addons) {
//       const addonImages = Object.values(item.addons)
//         .filter((addon) => addon.addon_image)
//         .map((addon) => addon.addon_image);

//       const addonBase64Images = await fetchImages(addonImages);
//       item.addonsBase64Images = addonBase64Images.filter((img) => img.base64Image);
//     }
//   };

//   for (const item of data) {
//     await fetchAllImages(item);
//   }

//   const pageWidth = 500;
//   const pageHeight = 210;
//   const doc = new jsPDF("landscape", "mm", [pageWidth, pageHeight]);

//   let BOQTotal = 0;

//   doc.setFontSize(18);
//   doc.text("Selected Products Report", pageWidth / 2, 15, { align: "center" });

//   const tableHeaders = [
//     "ID",
//     "Category",
//     "Subcategory",
//     "SubSubcategory",
//     "Variant Title",
//     "Variant Details",
//     "Variant Price",
//     "Variant Image",
//     "Addon Title",
//     "Addon Price",
//     "Addon Image",
//   ];

//   const tableBody = [];
//   for (const item of data) {
//     const variantPrice = parseFloat(item.product_variant?.variant_price) || 0;
//     const addonPrice = Object.values(item.addons || {}).reduce((acc, addon) => {
//       return acc + (parseFloat(addon.addon_price) || 0);
//     }, 0);

//     BOQTotal += variantPrice + addonPrice;
//     console.log(item.addonsBase64Images);
//     tableBody.push([
//       item.id,
//       item.category,
//       item.subcategory,
//       item.subcategory1,
//       item.product_variant?.variant_title || "No Title",
//       item.product_variant?.variant_details || "No Details",
//       variantPrice.toFixed(2),
//       { imageBase64: item.product_variant?.variantBase64Image  || "N/A" },
//       Object.values(item.addons || {}).map((a) => a.addon_title).join(", "),
//       addonPrice.toFixed(2),
//       { imageBase64s: item.addonsBase64Images || "N/A" },
//     ]);
//   }

//   tableBody.push([
//     "",
//     "",
//     "",
//     "",
//     "",
//     "Total BOQ Cost",
//     BOQTotal.toFixed(2),
//     "",
//     "",
//     "",
//     "",
//   ]);

//   console.log("Table Body:", tableBody);

//   doc.autoTable({
//     head: [tableHeaders],
//     body: tableBody,
//     startY: 25,
//     tableWidth: "wrap",
//     headStyles: { fillColor: [29, 140, 248] },
//     bodyStyles: { valign: "middle", halign: "center", fontSize: 8 },
//     columnStyles: {
//       0: { cellWidth: 40 },
//       1: { cellWidth: 30 },
//       2: { cellWidth: 30 },
//       3: { cellWidth: 35 },
//       4: { cellWidth: 35 },
//       5: { cellWidth: 50 },
//       6: { cellWidth: 20 },
//       7: { cellWidth: 30 }, // Variant Image
//       8: { cellWidth: 40 },
//       9: { cellWidth: 20 },
//       10: { cellWidth: 40 }, // Addon Image
//     },
//     didDrawCell: (data) => {
//       // Handle Variant Image
//       if (data.column.index === 7 && data.cell.raw?.imageBase64s) {
//         const { base64Image, imageType } = data.cell.raw.imageBase64s;
//         if (base64Image && imageType) {
//           const x = data.cell.x + 2;
//           const y = data.cell.y + 2;
//           doc.addImage(base64Image, imageType, x, y, 15, 15); // Add image (adjust dimensions if needed)
//           console.log("Base64 data for images:", base64Image, imageType);
//         }
//       }

//       // Handle Addon Images
//       if (data.column.index === 10 && data.cell.raw?.imageBase64s) {
//         const imageBase64s = data.cell.raw.imageBase64s;
//         let x = data.cell.x + 2;
//         let y = data.cell.y + 2;

//         for (const { base64Image, imageType } of imageBase64s) {
//           if (base64Image && imageType) {
//             doc.addImage(base64Image, imageType, x, y, 15, 15); // Add each image
//             x += 20; // Adjust position for the next image in the same cell
//             if (x > data.cell.x + data.cell.width - 10) {
//               x = data.cell.x + 2; // Reset x position
//               y += 22; // Move down for the next row of images
//             }
//             // console.log("Base64 data for images:", base64Image, imageType);
//           }
//         }
//       }
//     },
//   });

//   doc.save("SelectedProductsScrollableReport.pdf");
// };
  
  

  // Normalize function for consistent comparison
  const normalizeKey = (key) => {
    return (key || "").toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const calculateTotalPriceBySubcategory = (data, roomNumbers) => {
    if (!data || !Array.isArray(data) || !roomNumbers || !roomNumbers[0]) return {};

    // Extract the first object from roomNumbers (since it's an array with a single object)
    const roomNumbersMap = roomNumbers[0];

    

    return data.reduce((acc, item) => {
      const subcategory = item?.subcategory || "Unknown";
      const normalizedSubCat = normalizeKey(subcategory); // Normalize the subcategory name

      

      // Match keys using partial comparison
      const matchedKey = Object.keys(roomNumbersMap).find((key) =>
        normalizedSubCat.includes(normalizeKey(key))
      );

     

      // Get quantity from roomNumbersMap, default to 1 if no match
      const quantity = matchedKey ? roomNumbersMap[matchedKey] : 1;
      

      const variantPrice = item?.product_variant?.variant_price || 0;

      // Addon price calculation (access price for each addon in the object)
      const addonPrice = Object.values(item?.addons || {}).reduce((sum, addon) => {
        const addonPrice = addon?.addon_price || 0; // Assuming each addon has a `price` key
        return sum + addonPrice;
      }, 0);

      if (!acc[subcategory]) {
        acc[subcategory] = 0;
      }

      // Multiply total price by quantity
      acc[subcategory] += (variantPrice + addonPrice) * quantity;

      return acc;
    }, {});
  };

  // Update price state whenever selectedData or roomNumbers change
  useEffect(() => {
    if (selectedData && selectedData.length > 0) {
      const calculatedPrice = calculateTotalPriceBySubcategory(selectedData, roomNumbers);
      setPrice(calculatedPrice);
    } else {
      setPrice({});
    }
  }, [selectedData, roomNumbers]);

  return (
    <div className="App">
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
        <Button onClick={toggleFilters} variant="contained" color="primary">
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        {showFilters && (
          <div className="filters">
            <Slider
              value={priceRange}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              min={1000}
              max={12000}
              className="price-slider"
            />
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              displayEmpty
              className="category-select"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </div>
        )}
      </div>

      {roomNumbers.length > 0 && (
        <RoomDataBox roomData={Object.fromEntries(Object.entries(roomNumbers[0]).filter(([_, value]) => value > 0))} />
      )}

      <div className="products-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card-skeleton-container">
              <Skeleton variant="rectangular" height={150} width="100%" className="skeleton-card-image" />
              <Skeleton variant="text" width="60%" height={20} style={{ margin: '10px 0' }} />
              <Skeleton variant="text" width="80%" height={20} style={{ margin: '5px 0' }} />
              <Skeleton variant="text" width="50%" height={20} style={{ margin: '5px 0' }} />
            </div>
          ))
        ) : (
          Object.entries(groupedProducts).map(([category, subcategories]) => (
            <div key={category} className="category-section">
              <h2>{category}</h2>
              {Object.entries(subcategories)
                .filter(([subcategory]) => {
                  const roomCount = roomNumbers[0]; // Assuming roomNumbers[0] holds the counts

                  // Helper function to normalize strings by removing special characters and spaces
                  const normalize = (str) =>
                    str.toLowerCase().replace(/[^a-z0-9]/g, ''); // Keeps only alphanumeric characters

                  // Check if the subcategory belongs to "Furniture"
                  const isFurniture = normalize(category) === 'furniture'; // Assuming parentCategory identifies the main category
                  if (!isFurniture) {
                    return true; // Include subcategories not under "Furniture" without filtering
                  }

                  // Normalize subcategory and roomNumbers keys for comparison
                  const normalizedSubcategory = normalize(subcategory);

                  // Check if normalized subcategory matches any normalized roomNumber key
                  const matchFound = Object.keys(roomCount).some((roomKey) => {
                    const normalizedRoomKey = normalize(roomKey);
                    return normalizedSubcategory.includes(normalizedRoomKey); // Match logic
                  });

                  if (!matchFound) {
                    console.warn(`Subcategory "${subcategory}" does not match any roomNumbers keys.`);
                    return false; // Exclude subcategories that do not match
                  }

                  // Check if the count for the matching room is not 0
                  const matchingRoomKey = Object.keys(roomCount).find((roomKey) =>
                    normalizedSubcategory.includes(normalize(roomKey))
                  );

                  if (roomCount[matchingRoomKey] === 0) {
                    console.log(`Excluding subcategory "${subcategory}" because its count is 0.`);
                    return false; // Exclude if count is 0
                  }

                  return true; // Include subcategory
                })
                .map(([subcategory, products]) => (
                  <div key={subcategory} className="subcategory-section">
                    <h3
                      className="subcategory-heading"
                      onClick={() => toggleSubcategory(subcategory)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      {subcategory}
                      <h6 className="text-xs" style={{ margin: '0 10px' }}>
                        Total Cost of {subcategory}: ₹ {price[subcategory] || 0}
                      </h6>
                      <span style={{ marginLeft: '50px' }}>
                        {expandedSubcategory === subcategory ? (
                          <ArrowUpNarrowWide size={20} />
                        ) : (
                          <ArrowDownNarrowWide size={20} />
                        )}
                      </span>
                    </h3>
                    {expandedSubcategory === subcategory && (
                      <div className="subcategory-content">
                        {products.map((product) => (
                          <div key={product.id}>
                            <Card
                              addOns={product.addons}
                              addon_variants={
                                product.addons?.flatMap((addon) =>
                                  addon.addon_variants?.map((variant) => ({
                                    ...variant,
                                    addonTitle: addon.title, // Optionally add addon title to the variant
                                  }))
                                ) || []
                              }
                              product_variants={product.product_variants}
                              initialMinimized={product.initialMinimized}
                              // onAddToCart={handleAddToCart}
                              // setCartItems={setCartItems}
                              data={roomNumbers[0]}
                              subCat={subcategory}
                              onDone={updateBOQTotal}
                              setPrice={handlePrice}
                              price={price}
                              selectedData={selectedData}
                              setSelectedData={setSelectedData}
                              product={product}
                              categories={categories}
                              groupedProducts={groupedProducts}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
      {/* <Cart
        open={open} setOpen={setOpen} cartItems={cartItems}
      />       */}
      <div>
        {/* <button className='cart-icon fixed bottom-10 right-10 bg-black text-white rounded-xl ' onClick={toggleCart}><ShoppingCart size={40} /></button> */}
        <h4 className='fixed right-10 bottom-2 bg-gray-300 px-3 rounded'>Total Cost: ₹
          {totalBOQCost}
        </h4>
      </div>
      <div className='flex'>
        <button /*onClick={handleDownloadPDF}*/ className='bg-blue-500 text-white font-semibold px-5 py-1.5 rounded-sm mb-2 hover:bg-green-500 m-auto'>Download BOQ</button>
      </div>
    </div>
  );
};

export default App;