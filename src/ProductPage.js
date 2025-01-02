import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Components/SideBar.jsx';
import ProgressBar from './Components/ProgressBar.js';
import CategoryButtons from './Components/CategoryButtons.js';
import ProductList from './Components/ProductList';
import AddonsSection from './Components/AddonsSection';
import Recommendations from './Components/Recommendations.js';
import processData from './Utils/dataProcessor';
import { fetchCategories, fetchProductsData, fetchWorkspaces, fetchRoomData, } from './Utils/dataFetchers';

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
    const [priceRange, setPriceRange] = useState([1000, 15000]);
    const [selectedData, setSelectedData] = useState([])
    const [selectedAddOns, setSelectedAddOns] = useState([])

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

    // useEffect(() => {
    //     console.log("Areas Data: ", areasData);
    //     console.log("Quantity Data: ", quantityData);
    // }, [areasData, quantityData]);

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
        console.log("Selected Sub Category: ", category, subcategory);
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
    console.log("selected addons", selectedAddOns)
    return (
        <div>
            <ProgressBar progressPercentage={calculateProgress()} />
            <div className="product-page flex justify-between mt-8">
                <Sidebar categories={categories} selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory} onSelectSubCategory={handleSelectSubCategory} />
                <div>
                    <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onSubCategory1Change={handleSubCategory1Change} />
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
                        />}
                    </main>
                    {filteredProducts.map((product) => {
                        // Only render the AddonsSection if product's subcategory1 matches the selected one
                        if (product.subcategory1 === selectedSubCategory1) {
                            console.log("subcat1 to addon section", selectedSubCategory1)
                            return (
                                <div key={product.id}>
                                    {/* Render AddonsSection only once per product */}
                                    <AddonsSection product={product}
                                        handleAddOnChange={handleAddOnChange}
                                        selectedSubCategory={selectedSubCategory}
                                    />
                                </div>
                            );
                        }
                        return null; // Return nothing if subcategory1 doesn't match
                    })}
                </div>
                <Recommendations />
            </div>
        </div>
    );
}

export default ProductPage;
