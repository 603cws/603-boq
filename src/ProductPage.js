import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Components/SideBar.jsx';
import ProgressBar from './Components/ProgressBar.js';
import CategoryButtons from './Components/CategoryButtons.js';
import ProductList from './Components/ProductList';
import AddonsSection from './Components/AddonsSection';
import Recommendations from './Components/Recommendations.js';
import processData from './Utils/dataProcessor';
import { fetchCategories, fetchProductsData, fetchWorkspaces, fetchRoomData, } from './Utils/dataFetchers';
import { Button } from '@headlessui/react';
import CryptoJS from 'crypto-js';
import { ArrowLeftFromLine } from 'lucide-react';
import QuestionModal from './Components/questionModal.js';
import { useGrandTotal } from "./GrandTotalContext.js";

const ProductPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('Furniture');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedSubCategory1, setSelectedSubCategory1] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [categories, setCategories] = useState([]);
    const [productsData, setProductData] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [roomData, setRoomData] = useState({ quantityData: [], areasData: [] });

    const [quantityData, setQuantityData] = useState([]);
    const [areasData, setAreasData] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([1000, 15000000]);
    const [selectedData, setSelectedData] = useState([]);
    const [selectedAddOns, setSelectedAddOns] = useState([]);
    const [userResponses, setUserResponses] = useState({});
    const userID = '67a73a7c-8556-44b0-a42e-81ba988b25ff';
    const secretKey = process.env.REACT_APP_SECRET_KEY; // Get the secret key from the environment variable
    const encryptedUserId = CryptoJS.AES.encrypt(userID, secretKey).toString();
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://603-layout.vercel.app' : 'http://localhost:3001';
    if (!secretKey) {
        throw new Error("Secret key is undefined. Check your environment variable REACT_APP_SECRET_KEY.");
    }
    const { grandTotal, setGrandTotal } = useGrandTotal();

    useEffect(() => {
        const loadData = async () => {
            const [categoriesData, productsData, workspacesData, roomDataResult] = await Promise.all([
                fetchCategories(), fetchProductsData(), fetchWorkspaces(), fetchRoomData(),]);

            setCategories(categoriesData);

            if (categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0].category);
                setSelectedSubCategory(categoriesData[0].subcategories[0] || null);
            }

            setProductData(productsData);
            setWorkspaces(workspacesData);
            setRoomData(roomDataResult);
        };

        loadData();
    }, []);

    useEffect(() => {
        if (roomData.quantityData && roomData.quantityData.length > 0) {
            const processedQuantityData = processData(roomData.quantityData, "quantity");
            if (processedQuantityData) {
                setQuantityData([processedQuantityData]);
            }
        }

        if (roomData.areasData && roomData.areasData.length > 0) {
            const processedAreasData = processData(roomData.areasData, "areas");
            if (processedAreasData) {
                setAreasData([processedAreasData]);
            }
        }
    }, [roomData]);

    // Filter products based on search query, price range, and category
    const filteredProducts = useMemo(() => {
        return productsData.filter((product) => {
            if (!product.product_variants || product.product_variants.length === 0) {
                return false;
            }

            const matchesVariant = product.product_variants.some((variant) => {
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

    // Group products by category and subcategory
    const groupedProducts = useMemo(() => {
        const grouped = {};

        filteredProducts.forEach(product => {
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

    const handleSubCategory1Change = (subCategory) => {
        setSelectedSubCategory1(subCategory);
    };

    const handleSelectSubCategory = (category, subcategory) => {
        setSelectedCategory(category);
        setSelectedSubCategory(subcategory);
        // console.log("Selected Sub Category: ", category, subcategory);
    };

    const handleProductSelect = (product, variant) => {
        setSelectedProducts((prevSelected) => {
            const updatedSelection = prevSelected.filter(
                (item) =>
                    item.category !== product.category ||
                    item.subCategory !== product.subCategory ||
                    item.subCategory1 !== product.subCategory1
            );
            updatedSelection.push({
                ...product,
                selectedVariant: variant,
            });
            localStorage.setItem('selectedProducts', JSON.stringify(updatedSelection));
            return updatedSelection;
        });
    };

    const calculateProgress = () => {
        const totalCategories = Object.keys(groupedProducts).reduce((count, category) =>
            count + Object.keys(groupedProducts[category]).length, 0);
        return (selectedProducts.length / totalCategories) * 100;
    };
    const handleAddOnChange = (variant, isChecked, product, productId) => {
        // Ensure the variant object has title, price, and image
        if (!variant || !variant.title || variant.price == null || !variant.image) return;

        if (product.id !== productId) return;

        setSelectedAddOns((prevSelectedAddOns) => {
            let updatedAddOns;
            if (isChecked) {
                // Add the selected add-on with separate fields for title, price, and image
                updatedAddOns = {
                    ...prevSelectedAddOns,
                    [variant.title]: {
                        addon_title: variant.title || "No Title", // Store the title of the add-on
                        addon_price: variant.price || "No Price", // Store the price of the add-on
                        addon_image: variant.image || "No Image", // Store the image of the add-on
                        addonId: variant.addonid || "No Id",
                        variantID: variant.id || "No Id",
                        productID: productId || "No Id",
                    }
                };
            } else {
                // Remove the unselected add-on by title
                const { [variant.title]: _, ...rest } = prevSelectedAddOns;
                updatedAddOns = rest;
            }
            // Store the updated add-ons in localStorage
            localStorage.setItem("selectedAddOns", JSON.stringify(updatedAddOns));

            return updatedAddOns;
        });
    };
    // console.log("selected addons", selectedAddOns);

    const handelSelectedData = (product, variant, category, subCat, subcategory1) => {
        if (!product || !variant) return;

        // Unique group key to ensure only one selection per group
        const groupKey = `${category}-${subCat}`;

        const productData = {
            groupKey, // For group-level management
            id: product.id,
            category,
            subcategory: subCat,
            subcategory1, // added subcategory1 as an argument
            product_variant: {
                variant_title: variant.title,
                variant_image: variant.image,
                variant_details: variant.details,
                variant_price: variant.price,
                variant_id: variant.id,
                additional_images: JSON.parse(variant.additional_images || "[]"), // Parse the string to an array
            },
            addons: selectedAddOns || [], // Assuming addons might be optional
        };

        // Update selectedData to replace any existing product in the group
        setSelectedData((prevData) => {
            // Check if there's already a product with the same category and subcategory
            const existingProduct = prevData.find(item =>
                item.category === category &&
                item.subcategory === subCat &&
                item.subcategory1 === subcategory1 // Include subcategory1 here for the check
            );

            // If product exists with the same category, subcategory, and subcategory1
            if (existingProduct) {
                // If the selected variant is the same, skip addition
                if (existingProduct.product_variant.variant_id === variant.id) {
                    console.log("Duplicate product with the same variant detected. Skipping addition.");
                    return prevData; // Return unchanged data if the variant is the same
                }

                // Replace the existing product with the new variant if it's a different variant
                const updatedData = prevData.map(item =>
                    item.category === category && item.subcategory === subCat && item.subcategory1 === subcategory1
                        ? productData // Replace the product if the category, subcategory, and subcategory1 are the same
                        : item
                );

                localStorage.setItem("selectedData", JSON.stringify(updatedData)); // Persist updated state
                return updatedData;
            }

            // If no existing product with the same category, subcategory, and subcategory1, add the new product
            const updatedData = [...prevData, productData];
            localStorage.setItem("selectedData", JSON.stringify(updatedData)); // Persist updated state
            return updatedData;
        });
        // console.log("Processed group key:", groupKey);
    };

    console.log("selected data", selectedData);

    const handleQuestionSubmit = (answers) => {
        console.log("Answers from QuestionModal:", answers); // Log submitted answers
        setUserResponses((prevResponses) => ({
            ...prevResponses,
            flooring: answers.flooringStatus,
            // flooringArea: answers.flooringArea,
            demolishTile: answers.demolishTile,
            // cabinFlooring: answers.cabinFlooring,
            hvacType: answers.hvacType,
            hvacCentralized: answers.hvacCentralized,
            partitionArea: answers.partitionArea,
            partitionType: answers.partitionType,
            // [expandedSubcategory]: answers, // Store answers for the subcategory
            // [expandedSubcategory]: answers,
        }));

        // Hide the modal and reset questions state
        // setShowQuestionModal(false);
        // setCabinsQuestions(false);

        // setExpandedSubcategory(expandedSubcategory);

        // // Update the total cost or other BOQ data if needed
        // updateBOQTotal();
    };
    console.log("user responces", userResponses)
    return (
        <div>
            <ProgressBar progressPercentage={calculateProgress()} />
            {/* <Button href={`${baseUrl}/?userId=${encodeURIComponent(encryptedUserId)}`} className='GoToLayout-btn' onClick={console.log("button clicked")}>
                <ArrowLeftFromLine />Go to Layout
            </Button> */}
            <div className="product-page flex justify-between mt-8">
                <Sidebar className="self-center" categories={categories} selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory} onSelectSubCategory={handleSelectSubCategory}
                    handleQuestionSubmit={handleQuestionSubmit} setSelectedCategory={setSelectedCategory}
                />
                <div>
                    <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onSubCategory1Change={handleSubCategory1Change} userResponses={userResponses} />
                    <main className="main-content flex">
                        {groupedProducts && <ProductList products={groupedProducts} selectedCategory={selectedCategory}
                            selectedSubCategory={selectedSubCategory} selectedSubCategory1={selectedSubCategory1}
                            selectedProduct={selectedProducts.find(
                                (item) =>
                                    item.category === selectedCategory &&
                                    item.subCategory1 === selectedSubCategory1
                            )}
                            setSelectedProducts={setSelectedProducts}
                            onProductSelect={handleProductSelect}
                            quantityData={quantityData}
                            areasData={areasData}
                            selectedAddOns={selectedAddOns}
                            handelSelectedData={handelSelectedData}
                            handleAddOnChange={handleAddOnChange}
                            userResponses={userResponses}
                            selectedData={selectedData}
                            setSelectedData={setSelectedData}
                        />}
                    </main>
                    {filteredProducts.map((product) =>
                        product.subcategory1 === selectedSubCategory1 ? (
                            <AddonsSection
                                key={product.id} // Use key directly on AddonsSection
                                product={product}
                                handleAddOnChange={handleAddOnChange}
                                selectedSubCategory={selectedSubCategory}
                            />
                        ) : null
                    )}
                </div>
                {filteredProducts.some(
                    (product) => product.subcategory1 === selectedSubCategory1 && product.addons?.length > 0
                ) ? (
                    <div>
                        {filteredProducts
                            .filter((product) => product.subcategory1 === selectedSubCategory1)
                            .map((product) => (
                                <Recommendations
                                    key={product.id}
                                    product={product}
                                    handleAddOnChange={handleAddOnChange}
                                    selectedSubCategory={selectedSubCategory}
                                />
                            ))}
                    </div>
                ) : (
                    <div className="invisible w-64"></div> // Invisible placeholder to maintain layout
                )}
            </div>
            <h1 className='fixed right-10 bottom-0'>Grand Total: {grandTotal}</h1>
        </div>
    );
}

export default ProductPage;
