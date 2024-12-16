import React, { useState, useMemo, useEffect } from 'react';
import { Slider, Skeleton, Select, MenuItem, Button } from '@mui/material';
import { supabase } from '../supabase';
import RoomDataBox from '../RoomDataBox';
import './boq.css';
// import Cart from './Cart';
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import jsPDF from "jspdf";
import '../Components/Modal'
import "jspdf-autotable";
import Card from '../Components/Card';
import QuestionModal from '../Components/questionModal';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([1000, 15000]);
  const [productsData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [roomAreas, setRoomAreas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  // const [open, setOpen] = useState(false);
  // const [cartItems, setCartItems] = useState([]);
  const [totalBOQCost, setTotalBOQCost] = useState(0);
  const [selectedData, setSelectedData] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const [price, setPrice] = useState({});
  const [workspaces, setWorkspaces] = useState([]);
  const [cabinsQuestions, setCabinsQuestions] = useState(false);
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
  console.log("selected data", selectedData)
  async function fetchWorkspaces() {
    try {
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces') // Querying the 'workspaces' table
        .select(); // Select all columns

      if (workspacesError) {
        console.error('Error fetching workspaces:', workspacesError.message);
        return; // Stop further processing
      }

      if (workspacesData) {
        // Map through the data and parse the 'type' field from JSON
        const parsedWorkspaces = workspacesData.map((workspace) => ({
          ...workspace,
          type: JSON.parse(workspace.type), // Parse 'type' if stored as JSON string
        }));

        setWorkspaces(parsedWorkspaces); // Update state with parsed data
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error.message); // Log error
    }
  }

  // console.log("Workspace Data", workspaces)

  async function fetchRoomData() {
    try {
      // Fetch the latest data from the 'quantity' table
      const { data: quantityData, error: quantityError } = await supabase
        .from('quantity')
        .select()
        .order('created_at', { ascending: false })
        .limit(1);

      if (quantityError) throw quantityError;

      // Fetch the latest data from the 'areas' table
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select()
        .order('created_at', { ascending: false })
        .limit(1);

      if (areasError) throw areasError;

      // Process the data for 'quantity'
      if (quantityData && quantityData.length > 0) {
        const latestRoomData = quantityData[0];
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
          videorecordingroom: latestRoomData.videorecordingroom,
          breakoutroom: latestRoomData.breakoutroom,
          executivewashroom: latestRoomData.executivewashroom,
        };
        setRoomNumbers([roomsArray]);
      }

      // Process the data for 'areas'
      if (areasData && areasData.length > 0) {
        const latestAreaData = areasData[0];
        const areasArray = {
          linear: latestAreaData.linear,
          ltype: latestAreaData.ltype,
          manager: latestAreaData.manager,
          small: latestAreaData.small,
          ups: latestAreaData.ups,
          bms: latestAreaData.bms,
          server: latestAreaData.server,
          reception: latestAreaData.reception,
          lounge: latestAreaData.lounge,
          sales: latestAreaData.sales,
          phonebooth: latestAreaData.phonebooth,
          discussionroom: latestAreaData.discussionroom,
          interviewroom: latestAreaData.interviewroom,
          conferenceroom: latestAreaData.conferenceroom,
          boardroom: latestAreaData.boardroom,
          meetingroom: latestAreaData.meetingroom,
          meetingroomlarge: latestAreaData.meetingroomlarge,
          hrroom: latestAreaData.hrroom,
          financeroom: latestAreaData.financeroom,
          videorecordingroom: latestAreaData.videorecordingroom,
          breakoutroom: latestAreaData.breakoutroom,
          executivewashroom: latestAreaData.executivewashroom,
          totalArea: latestAreaData.totalArea,

          openworkspaces: latestAreaData.linear + latestAreaData.ltype,
          cabins: latestAreaData.md + latestAreaData.manager + latestAreaData.small,
          meetingrooms: latestAreaData.discussionroom + latestAreaData.interviewroom + latestAreaData.conferenceroom +
            latestAreaData.boardroom + latestAreaData.meetingroom + latestAreaData.meetingroomlarge + latestAreaData.hrroom +
            latestAreaData.financeroom + latestAreaData.sales + latestAreaData.videorecordingroom,
          publicspaces: latestAreaData.reception + latestAreaData.lounge + latestAreaData.phonebooth + latestAreaData.breakoutroom,
          supportspaces: latestAreaData.ups + latestAreaData.bms + latestAreaData.server + latestAreaData.other + latestAreaData.executivewashroom,

          allareas: latestAreaData.linear + latestAreaData.ltype + latestAreaData.md + latestAreaData.manager + latestAreaData.small +
            latestAreaData.discussionroom + latestAreaData.interviewroom + latestAreaData.conferenceroom + latestAreaData.boardroom +
            latestAreaData.meetingroom + latestAreaData.meetingroomlarge + latestAreaData.hrroom + latestAreaData.financeroom +
            latestAreaData.sales + latestAreaData.videorecordingroom + latestAreaData.reception + latestAreaData.lounge + latestAreaData.phonebooth +
            latestAreaData.breakoutroom + latestAreaData.ups + latestAreaData.bms + latestAreaData.server + latestAreaData.other + latestAreaData.executivewashroom,
        };
        setRoomAreas([areasArray]);
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
    Promise.all([fetchRoomData(), fetchProductsData(), fetchWorkspaces()]);
  }, []);
  useEffect(() => {
    const savedData = localStorage.getItem('selectedData');

    if (savedData) {
      setSelectedData(JSON.parse(savedData)); // Parse and set the data
    }
  }, []);

  useEffect(() => {
    updateBOQTotal();
  }, [price, userResponses]);


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

  const updateBOQTotal = () => {
    // Sum of all prices
    const baseTotal = Object.values(price).reduce((acc, curr) => acc + curr, 0);

    // Check if user responded with 'bareShell'
    const additionalCost =
      userResponses.flooring === 'bareShell' && roomAreas.length > 0
        ? roomAreas[0].totalArea * 150 // Multiply totalArea by 150
        : 0;

    // Calculate final total
    const total = baseTotal + additionalCost;
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
      // Split product.subcategory by commas and trim spaces
      const subcategories = product.subcategory.split(',').map(sub => sub.trim());
  
      subcategories.forEach(subcategory => {
        if (!grouped[product.category]) {
          grouped[product.category] = {};
        }
        if (!grouped[product.category][subcategory]) {
          grouped[product.category][subcategory] = [];
        }
        grouped[product.category][subcategory].push(product);
      });
    });
  
    return grouped;
  }, [filteredProducts]);
  

  // const toggleCart = () => {
  //   setOpen(true);
  // }

  // const handleAddToCart = (item) => {
  //   setCartItems((prev) => [...prev, item]);
  // };

  const handleCategoryClick = (category) => {
    if (category === "Flooring") {
      setShowQuestionModal(true);
    }
  };

  const closeQuestionModal = () => {
    setShowQuestionModal(false);
  };

  const handleQuestionSubmit = (answers) => {
    console.log("Answers from QuestionModal:", answers); // Log submitted answers
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      flooring: answers.flooringStatus,
      flooringArea: answers.flooringArea,
      customizeSelection: answers.customizeSelection,
      cabinFlooring: answers.cabinFlooring,
    }));
    updateBOQTotal();
  };

  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [subCat, setSubCat] = useState(null);

  const toggleSubcategory = (category, subcategory) => {
    const key = `${category}-${subcategory}`; // Unique key combining category and subcategory
    setExpandedSubcategory((prev) => {
      // Ensure it only collapses or expands the specific subcategory
      return prev === key ? null : key; // If already expanded, collapse it; otherwise, expand it
    });
  
    if (subcategory === "Cabins" && expandedSubcategory === null) {
      setCabinsQuestions(true);
      setShowQuestionModal(true);
    } else {
      setCabinsQuestions(false);
      setShowQuestionModal(false);
    }
  };
  
  useEffect(() => {
    if (expandedSubcategory !== null || expandedSubcategory !== undefined) {
      handleCardClick(subCat);
    }
  }, [expandedSubcategory]);

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
    const calculateTotalPriceBySubcategory = (data, roomNumbers, roomAreas) => {
      if (!data || !Array.isArray(data) || !roomNumbers || !roomNumbers[0] || !roomAreas || !roomAreas[0]) return {};

      // Extract the first object from roomNumbers (since it's an array with a single object)
      const roomNumbersMap = roomNumbers[0];
      const areasData = roomAreas[0];

      return data.reduce((acc, item) => {
        const category = item?.category || "Unknown";
        const subcategory = item?.subcategory || "Unknown";
        const normalizedSubCat = normalizeKey(subcategory); // Normalize the subcategory name

        let matchedKey, quantity;
        if (category === "Furniture") {     //calculation of price * quantity
          matchedKey = Object.keys(roomNumbersMap).find((key) =>
            normalizedSubCat.includes(key.toLowerCase())
          );
          quantity = matchedKey ? roomNumbersMap[matchedKey] : 1;
        } else {                            //calculation of price * area
          matchedKey = Object.keys(areasData).find((key) =>
            normalizedSubCat.includes(key.toLowerCase())
          );
          quantity = matchedKey ? areasData[matchedKey] : 1;
        }

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
      const calculatedPrice = calculateTotalPriceBySubcategory(selectedData, roomNumbers, roomAreas);
      setPrice(calculatedPrice);
    } else {
      setPrice({});
    }
  }, [selectedData, roomNumbers, roomAreas]);

  const handleCardClick = (subcategory) => {
    console.log("Card clicked!");
    setPrice((prevPrice) => ({
      ...prevPrice,
      [subcategory]: 0,
    }));
  };

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
              max={15000}
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
              <h2 onClick={() => handleCategoryClick(category)}>{category}</h2>
          
              {/* Check if category is 'Flooring' and answer is 'allArea' */}
              {category === 'Flooring' && userResponses.flooringArea === 'allArea' ? (
                <div>
                  {/* If user selected 'allArea', display the selected flooring type */}
                  {userResponses.customizeSelection && (
                    <div>
                      <h3>Showing products for: {userResponses.customizeSelection}</h3>
                      <div className="subcategory-section">
                        {productsData
                          .filter(product => product.subcategory === 'All Areas' && product.subcategory1 === userResponses.customizeSelection)
                          .map((product) => (
                            <div key={product.id}>
                              {/* Render product info */}
                              <Card
                                addOns={product.addons}
                                addon_variants={product.addons?.flatMap((addon) =>
                                  addon.addon_variants?.map((variant) => ({
                                    ...variant,
                                    addonTitle: addon.title, // Optionally add addon title to the variant
                                  }))
                                ) || []}
                                product_variants={product.product_variants}
                                initialMinimized={product.initialMinimized}
                                data={roomNumbers[0]}
                                subCat="All Areas"
                                onDone={updateBOQTotal}
                                setPrice={handlePrice}
                                price={price}
                                selectedData={selectedData}
                                setSelectedData={setSelectedData}
                                product={product}
                                categories={categories}
                                groupedProducts={groupedProducts}
                                category={category}
                                totalBOQCost={totalBOQCost}
                                areasData={roomAreas[0]}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                Object.entries(subcategories)
                  .filter(([subcategory]) => subcategory !== 'All Areas')
                  .flatMap(([subcategory, products]) => {
                    // If subcategory is 'Linear', handle mapping differently
                    const subcategoryArray = subcategory === 'Linear' ? [subcategory] : subcategory.split(',').map((sub) => sub.trim());
                    return subcategoryArray.map((sub) => [sub, products]);
                  })
                  .filter(([subcategory]) => {
                    const roomCount = roomNumbers[0];
                    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
          
                    const isFurniture = normalize(category) === 'furniture';
                    if (!isFurniture) {
                      return true;
                    }
          
                    const normalizedSubcategory = normalize(subcategory);
          
                    const matchFound = Object.keys(roomCount).some((roomKey) => {
                      const normalizedRoomKey = normalize(roomKey);
                      return normalizedSubcategory.includes(normalizedRoomKey);
                    });
          
                    if (!matchFound) {
                      console.warn(`Subcategory "${subcategory}" does not match any roomNumbers keys.`);
                      return false;
                    }
          
                    const matchingRoomKey = Object.keys(roomCount).find((roomKey) =>
                      normalizedSubcategory.includes(normalize(roomKey))
                    );
          
                    if (roomCount[matchingRoomKey] === 0) {
                      console.log(`Excluding subcategory "${subcategory}" because its count is 0.`);
                      return false;
                    }
          
                    return true;
                  })
                  .map(([subcategory, products]) => (
                    <div key={`${category}-${subcategory}`} className="subcategory-section">
                      <div
                        className="subcategory-heading"
                        onClick={() => {
                          toggleSubcategory(category, subcategory); // Pass category and subcategory to the toggle function
                          setSubCat(subcategory);
                        }}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <h3 style={{ margin: 0 }}>{subcategory}</h3>
                        <h6 className="text-xs" style={{ margin: '0 10px' }}>
                          Total Cost of {subcategory}: ₹ {price[subcategory] || 0}
                        </h6>
                        <span style={{ marginLeft: '50px' }}>
                          {expandedSubcategory === `${category}-${subcategory}` ? (
                            <ArrowUpNarrowWide size={20} />
                          ) : (
                            <ArrowDownNarrowWide size={20} />
                          )}
                        </span>
                      </div>
                      {expandedSubcategory === `${category}-${subcategory}` && (
                        <div className="subcategory-content">
                          {subcategory === 'Cabins' && userResponses?.cabinFlooring === 'Customize' ? (
                            workspaces
                              .find((workspace) => workspace.name === 'Cabins')
                              ?.type.map((cabinType, index) => (
                                <div key={`${subcategory}-${cabinType}-${index}`} className="cabin-category">
                                  <h4 className="text-md font-bold">{cabinType}</h4>
                                  <div className="cabin-products">
                                    {products
                                      .filter((product) => product.subcategory === 'Cabins')
                                      .map((product) => (
                                        <div key={`${subcategory}-${product.id}`}>
                                          <Card
                                            addOns={product.addons}
                                            addon_variants={product.addons?.flatMap((addon) =>
                                              addon.addon_variants?.map((variant) => ({
                                                ...variant,
                                                addonTitle: addon.title,
                                              }))
                                            ) || []}
                                            product_variants={product.product_variants}
                                            initialMinimized={product.initialMinimized}
                                            data={roomNumbers[0]}
                                            subCat={cabinType}
                                            onDone={updateBOQTotal}
                                            setPrice={handlePrice}
                                            price={price}
                                            selectedData={selectedData}
                                            setSelectedData={setSelectedData}
                                            product={product}
                                            categories={categories}
                                            groupedProducts={groupedProducts}
                                            category={category}
                                            totalBOQCost={totalBOQCost}
                                            areasData={roomAreas[0]}
                                          />
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              ))
                          ) : (
                            products.map((product) => (
                              <div key={`${subcategory}-${product.id}`}>
                                <Card
                                  addOns={product.addons}
                                  addon_variants={product.addons?.flatMap((addon) =>
                                    addon.addon_variants?.map((variant) => ({
                                      ...variant,
                                      addonTitle: addon.title,
                                    }))
                                  ) || []}
                                  product_variants={product.product_variants}
                                  initialMinimized={product.initialMinimized}
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
                                  category={category}
                                  totalBOQCost={totalBOQCost}
                                  areasData={roomAreas[0]}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          ))          
        )}
      </div>
      {showQuestionModal && (
        <QuestionModal
          cabinsQuestions={cabinsQuestions}
          onClose={closeQuestionModal}
          onSubmit={handleQuestionSubmit}
        />
      )}

      {/* <Cart open={open} setOpen={setOpen} cartItems={cartItems} />       */}
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
