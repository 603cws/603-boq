import React, { useState, useMemo, useEffect } from 'react';
import { Skeleton, Button } from '@mui/material'; // Select, MenuItem, Button, Slider
import { supabase } from '../supabase';
import RoomDataBox from '../RoomDataBox';
import './boq.css';
// import Cart from './Cart';
import { ArrowDownNarrowWide, ArrowLeftFromLine, ArrowRightFromLine, ArrowUpNarrowWide } from 'lucide-react';
// import jsPDF from "jspdf";
import '../Components/Modal'
// import "jspdf-autotable";
import Card from '../Components/Card';
import QuestionModal from '../Components/questionModal';
import PDFGenerator from "../Components/PDFGenerator";
import Filters from "../Components/Filters";
import { calculateTotalPriceHelper } from "../Utils/CalculateTotalPriceHelper";

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
  const [category, setCategory] = useState('');
  const categoriesWithModal = ['Flooring', 'HVAC'];   // Array of categories that should show the modal when clicked

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

  console.log("selected data", selectedData);

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

  // const [isSaving, setIsSaving] = useState(false);
  // const [error, setError] = useState(null);

  // Function to handle saving data to Supabase
  // const handleSaveBOQ = async (selectedData) => {
  //   console.log("Selected data in save BOQ:", selectedData);

  //   try {
  //     setIsSaving(true);
  //     setError(null);

  //     // Initialize arrays to collect comma-separated values
  //     const product_ids = [];
  //     const product_variant_ids = [];
  //     const addon_ids = [];
  //     const addon_variant_ids = [];

  //     // Ensure selectedData is an array and process each product
  //     (Array.isArray(selectedData) ? selectedData : []).forEach((product) => {
  //       // Add product ID
  //       if (product.id) product_ids.push(product.id);

  //       // Add product variant ID
  //       if (product.product_variant?.variant_id) {
  //         product_variant_ids.push(product.product_variant.variant_id);
  //       }

  //       // Process addons and extract addonId and variantID
  //       Object.keys(product.addons || {}).forEach((addonKey) => {
  //         const addon = product.addons[addonKey];
  //         if (addon.addonId) addon_ids.push(addon.addonId); // Extract addonId
  //         if (addon.variantID) addon_variant_ids.push(addon.variantID); // Extract variantID
  //       });
  //     });

  //     // Join the arrays into comma-separated strings
  //     const product_id_str = product_ids.join(',');
  //     const product_variant_id_str = product_variant_ids.join(',');
  //     const addon_id_str = addon_ids.join(',');
  //     const addon_variant_id_str = addon_variant_ids.join(',');

  //     // Create a single row object
  //     const formattedData = {
  //       product_id: product_id_str,
  //       product_variant_id: product_variant_id_str,
  //       addon_id: addon_id_str,
  //       addon_variant_id: addon_variant_id_str,
  //     };

  //     console.log("Formatted data:", formattedData);

  //     // Insert a single row into Supabase
  //     const { data, error } = await supabase.from('boqdata').insert([formattedData]);

  //     if (error) {
  //       console.error("Error saving BOQ:", error);
  //       throw error;
  //     }

  //     console.log("Data saved successfully:", formattedData);
  //   } catch (err) {
  //     console.error("Error saving BOQ:", err);
  //     setError("There was an error saving the BOQ. Please try again.");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

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

  // console.log("User response: ", userResponses);
  // console.log("Workspace: ", workspaces);

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
    // Check if the category requires the modal
    if (categoriesWithModal.includes(category)) {
      setShowQuestionModal(true);
      setCategory(category);
    }
  };

  useEffect(() => {
    let savedAnswers = localStorage.getItem("answers");
    savedAnswers = JSON.parse(savedAnswers);
    if (savedAnswers) {

      setUserResponses((prevResponses) => ({
        ...prevResponses,
        flooring: savedAnswers.flooringStatus,
        flooringArea: savedAnswers.flooringArea,
        flooringType: savedAnswers.flooringType,
        cabinFlooring: savedAnswers.cabinFlooring,
      }));
    }
  }, []);

  const handleQuestionSubmit = (answers) => {
    console.log("Answers from QuestionModal:", answers); // Log submitted answers
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      flooring: answers.flooringStatus,
      flooringArea: answers.flooringArea,
      flooringType: answers.flooringType,
      cabinFlooring: answers.cabinFlooring,
      hvacType: answers.hvacType,
      hvacCentralized: answers.hvacCentralized,
      [expandedSubcategory]: answers, // Store answers for the subcategory
      // [expandedSubcategory]: answers,
    }));

    // Hide the modal and reset questions state
    setShowQuestionModal(false);
    setCabinsQuestions(false);

    setExpandedSubcategory(expandedSubcategory);

    // Update the total cost or other BOQ data if needed
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

    // Prevent expansion while modal is open
    if (showQuestionModal) return;

    // You can dynamically check for categories that need modal handling
    const workspaceNames = workspaces.map(workspace => workspace.name);

    if (categoriesWithModal.includes(category) && workspaceNames.includes(subcategory)) {
      if (category !== "HVAC") {
        setCabinsQuestions(workspaceNames.includes(subcategory));
        setShowQuestionModal(true);
        setExpandedSubcategory(`${category}-${subcategory}`);
      }
      return;
    }
  };

  useEffect(() => {
    if (expandedSubcategory !== null || expandedSubcategory !== undefined) {
      handleCardClick(category, subCat);
    }
  }, [expandedSubcategory]);

  const handlePrice = (category, subCat, value) => {
    setPrice((prevPrices) => {
      const key = `${category}-${subCat}`;

      const updatedPrices = {
        ...prevPrices,
        [key]: Math.max(0, (prevPrices[key] || 0) + value), // Ensure price doesn't go below 0
      };

      // Update the BOQ Total
      const total = Object.values(updatedPrices).reduce((acc, curr) => acc + curr, 0);
      setTotalBOQCost(total);

      return updatedPrices; // Ensure the new state is returned
    });
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

        // Call the CalculateTotalPriceHelper component
        const quantity = calculateTotalPriceHelper(roomNumbersMap, areasData, category, subcategory);

        const variantPrice = item?.product_variant?.variant_price || 0;

        // Addon price calculation (access price for each addon in the object)
        const addonPrice = Object.values(item?.addons || {}).reduce((sum, addon) => {
          const addonPrice = addon?.addon_price || 0; // Assuming each addon has a `price` key
          return sum + addonPrice;
        }, 0);

        const key = `${category}-${subcategory}`;

        if (!acc[key]) {
          acc[key] = 0;
        }

        // Multiply total price by quantity
        acc[key] += (variantPrice + addonPrice) * quantity;

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

  const handleCardClick = (category, subcategory) => {
    console.log("Card clicked!");
    setPrice((prevPrice) => ({
      ...prevPrice,
      [`${category}-${subcategory}`]: 0, // Use template literals to create the key
    }));
  };

  const renderCards = (products, subCat, category) => {
    return products.map((product) => (
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
          data={roomNumbers[0]}
          subCat={subCat}
          onDone={updateBOQTotal}
          setPrice={handlePrice}
          price={price}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          product={product}
          groupedProducts={groupedProducts}
          category={category}
          totalBOQCost={totalBOQCost}
          areasData={roomAreas[0]}
        />
      </div>
    ));
  };

  return (
    <div className="App">
      <Filters
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        priceRange={priceRange}
        handleSliderChange={handleSliderChange}
        toggleFilters={toggleFilters}
        showFilters={showFilters}
        selectedCategory={selectedCategory}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
      />

      {roomNumbers.length > 0 && roomNumbers && roomNumbers[0] && (
        <RoomDataBox roomData={roomNumbers[0] && Object.fromEntries(Object.entries(roomNumbers[0]).filter(([_, value]) => value > 0))} />
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
        ) : groupedProducts && Object.entries(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts || {}).map(([category, subcategories]) => (
            <div key={category} className="category-section">
              <h2 onClick={() => handleCategoryClick(category)}>{category}</h2>

              {/* Check if category is 'Flooring' and answer is 'allArea' */}
              {category === "Flooring" && userResponses.flooringArea === "allArea" ? (
                <div>
                  {/* If user selected 'allArea', display the selected flooring type */}
                  {userResponses.flooringType && (
                    <div>
                      <h3>Showing products for: {userResponses.flooringType}</h3>
                      <div className="subcategory-section">
                        {renderCards(
                          productsData.filter(
                            (product) =>
                              product.subcategory === "All Areas" &&
                              product.subcategory1 === userResponses.flooringType
                          ),
                          "All Areas"
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : category === "HVAC" && userResponses.hvacType === "Centralized" ? (
                <div>
                  {/* If category is HVAC and user selected 'combination' */}
                  {userResponses.hvacCentralized && (
                    <div>
                      <h3>Showing HVAC products for: {userResponses.hvacCentralized}</h3>
                      <div className="subcategory-section">
                        {renderCards(
                          productsData.filter(
                            (product) =>
                              product.subcategory === "Centralized" &&
                              product.subcategory1 === userResponses.hvacCentralized
                          ),
                          "Centralized"
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                Object.entries(subcategories)
                  .filter(([subcategory]) => subcategory !== "All Areas" && subcategory !== "Centralized")
                  .flatMap(([subcategory, products]) => {
                    // Handle Linear subcategory splitting
                    const subcategoryArray =
                      subcategory === "Linear"
                        ? [subcategory]
                        : subcategory.split(",").map((sub) => sub.trim());
                    return subcategoryArray.map((sub) => [sub, products]);
                  })
                  .filter(([subcategory]) => {
                    const roomCount = roomNumbers[0];
                    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

                    const isFurniture = normalize(category) === "furniture";
                    if (!isFurniture) {
                      return true;
                    }

                    const normalizedSubcategory = normalize(subcategory);

                    const matchFound = Object.keys(roomCount).some((roomKey) => {
                      const normalizedRoomKey = normalize(roomKey);
                      return normalizedSubcategory.includes(normalizedRoomKey);
                    });

                    if (!matchFound) {
                      return false;
                    }

                    const matchingRoomKey = Object.keys(roomCount).find((roomKey) =>
                      normalizedSubcategory.includes(normalize(roomKey))
                    );

                    if (roomCount[matchingRoomKey] === 0) {
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
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <h3 style={{ margin: 0 }}>{subcategory}</h3>
                        <h6 className="text-xs" style={{ margin: "0 10px" }}>
                          Total Cost of {subcategory}: ₹ {price[`${category}-${subcategory}`] || 0}
                        </h6>
                        <span style={{ marginLeft: "50px" }}>
                          {expandedSubcategory === `${category}-${subcategory}` ? (
                            <ArrowUpNarrowWide size={20} />
                          ) : (
                            <ArrowDownNarrowWide size={20} />
                          )}
                        </span>
                      </div>
                      {expandedSubcategory === `${category}-${subcategory}` && !showQuestionModal && (
                        <div className="subcategory-content">
                          {workspaces.map((workspace) =>
                            subcategory === workspace.name && userResponses?.cabinFlooring === "Customize" ? (
                              workspace.type.map((workspaceType, index) => (
                                <div
                                  key={index}
                                  className={`${workspace.name.toLowerCase()}-category`}
                                >
                                  {/* Display the disclaimer if the workspaceType is 'Reception' or 'Lounge' */}
                                  {["Reception", "Lounge"].includes(workspaceType) && (
                                    <div className="disclaimer">
                                      <p style={{ color: "red", fontStyle: "italic" }} className='text-sm'>
                                        Choose "Tile" only. Carpet and Vinyl are not recommended for this area.
                                      </p>
                                    </div>
                                  )}
                                  <h4 className="text-md font-bold">{workspaceType}</h4>
                                  <div className={`${workspace.name.toLowerCase()}-products`}>
                                    {renderCards(
                                      products.filter(
                                        (product) => product.subcategory === workspace.name
                                      ),
                                      workspaceType,
                                      category
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : null
                          )}
                          {/* Render default content if no specific category match */}
                          {!(userResponses?.cabinFlooring === "Customize") &&
                            renderCards(products, subcategory, category)}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          ))
        ) : (
          <div>No products available</div>
        )}
      </div>

      {showQuestionModal && (
        <QuestionModal
          subcategory={expandedSubcategory}
          cabinsQuestions={cabinsQuestions}
          category={category}
          onSubmit={handleQuestionSubmit}
          initialAnswers={userResponses[expandedSubcategory]} // Pass previous responses
          onClose={() => {
            setShowQuestionModal(false); // Close the modal
            setCabinsQuestions(false); // Reset questions state
          }}
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
        <button onClick={() => PDFGenerator.generatePDF(selectedData)}
          variant="contained"
          color="primary" className='bg-blue-500 text-white font-semibold px-5 py-1.5 rounded-sm mb-2 hover:bg-green-500 m-auto'>Download BOQ</button>
      </div>
    </div>
  );
};

export default App;
