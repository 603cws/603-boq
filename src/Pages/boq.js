import React, { useState, useMemo, useEffect } from 'react';
import { Slider, Skeleton, Select, MenuItem, Button } from '@mui/material';
import { supabase } from '../supabase';
import RoomDataBox from '../RoomDataBox';
import './boq.css';
// import Cart from './Cart';
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import '../Components/Modal'
import "jspdf-autotable";
import Card from '../Components/Card';

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
      // console.log("all images", allImages)
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

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 100; // Restrict image width for PDF
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const publicUrl = `https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/`;

    // Prepare table data
    const headers = ["Product Details", "Product Image", "Addons"];
    const rows = [];

    for (const item of selectedData) {
      const productDetails = `
        Title: ${item.product_variant.variant_title || "N/A"}
        Category: ${item.category || "N/A"}
        Subcategory: ${item.subcategory || "N/A"}
        Price: $${item.product_variant.variant_price || "N/A"}
        Description: ${item.product_variant.variant_details || "N/A"}
      `;

      let productImage = "No image available";
      if (item.product_variant.variant_iamge) {
        try {
          const fileName = new URL(item.product_variant.variant_iamge).pathname.split("/").pop();
          const imageUrl = publicUrl + fileName;
          productImage = await loadImage(imageUrl);
        } catch (err) {
          console.error("Failed to load product image:", err);
        }
      }

      const addonDetails = [];
      if (item.addons) {
        for (const addon of Object.values(item.addons)) {
          const addonText = `
            Addon Title: ${addon.addon_title || "N/A"}
            Addon Price: $${addon.addon_price || "N/A"}
          `;
          // let addonImage = "No image available";
          // if (addon.addon_image) {
          //   try {
          //     const fileName = new URL(addon.addon_image).pathname.split("/").pop();
          //     const imageUrl = publicUrl + fileName;
          //     addonImage = await loadImage(imageUrl);
          //   } catch (err) {
          //     console.error("Failed to load addon image:", err);
          //   }
          // }
          addonDetails.push({ text: addonText }); //, image: addonImage
        }
      }

      const addonTextCombined = addonDetails.map((addon) => addon.text).join("\n\n");
      // const addonImages = addonDetails.map((addon) => addon.image).filter((img) => img !== "No image available");

      // Prepare row
      rows.push([
        productDetails,
        productImage !== "No image available"
          ? { content: "", styles: { cellPadding: 5 }, image: productImage }
          : "No image available",
        addonTextCombined,
      ]);

      // Add images for addons (compactly)
      // for (const addonImage of addonImages) {
      //   rows.push(["", "", { content: "", styles: { cellPadding: 5 }, image: addonImage }]);   //commented addon part
      // }
    }

    // Render table with images
    doc.autoTable({
      head: [headers],
      body: rows.map((row) =>
        row.map((cell) => {
          if (cell.image) {
            return {
              content: "",
              styles: { cellPadding: 5 },
              image: cell.image,
            };
          }
          return cell;
        })
      ),
      didDrawCell: (data) => {
        if (data.cell.raw && data.cell.raw.image) {
          doc.addImage(data.cell.raw.image, "PNG", data.cell.x + 5, data.cell.y + 5, 20, 20);
        }
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40 },
        2: { cellWidth: 70 },
      },
      startY: 10,
      margin: { top: 10 },
    });

    // Save the PDF
    doc.save("products_table.pdf");
  };

  // Normalize function for consistent comparison
  const normalizeKey = (key) => {
    return (key || "").toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Update price state whenever selectedData or roomNumbers change
  useEffect(() => {
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
        <button onClick={generatePDF} className='bg-blue-500 text-white font-semibold px-5 py-1.5 rounded-sm mb-2 hover:bg-green-500 m-auto'>Download BOQ</button>
      </div>
    </div>
  );
};

export default App;