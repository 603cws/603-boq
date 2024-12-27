import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './services/supabase';
import Sidebar from './Components/SideBar.jsx';
import ProgressBar from './Components/ProgressBar.js';
import CategoryButtons from './Components/CategoryButtons.js';
import ProductList from './Components/ProductList';
import AddonsSection from './Components/AddonsSection';
import Recommendations from './Components/Recommendations.js';

const ProductPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('Furniture');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedSubCategory1, setSelectedSubCategory1] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [selectedCategory2, setSelectedCategory2] = useState('Table');
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedChair, setSelectedChair] = useState(null);
    const [categories, setCategories] = useState([]);
    const [productsData, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([1000, 15000]);

    const handleSubCategory1Change = (subCategory) => {
        setSelectedSubCategory1(subCategory);
    };

    async function fetchCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, subcategories');

            if (error) {
                console.error('Error fetching categories:', error);
                return;
            }

            const formattedData = data
                .map((item) => ({
                    id: item.id,
                    category: item.name,
                    subcategories: JSON.parse(item.subcategories || '[]'),
                }))
                .sort((a, b) => a.id - b.id);

            setCategories(formattedData);

            // Automatically select the first category and subcategory
            if (formattedData.length > 0) {
                setSelectedCategory(formattedData[0].category);
                setSelectedSubCategory(formattedData[0].subcategories[0] || null);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            return [];
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

            setProductData(processedData);
        } catch (error) {
            console.error('Error fetching products data:', error);
        } finally {
            setLoading(false);
        }
    }

    // Fetch workspaces data (Not used in the current version of the component)
    async function fetchWorkspaces() {
        try {
            const { data: workspacesData, error: workspacesError } = await supabase
                .from('workspaces')
                .select();

            if (workspacesError) {
                console.error('Error fetching workspaces:', workspacesError.message);
                return;
            }

        } catch (error) {
            console.error('Error fetching workspaces:', error.message);
        }
    }

    // Fetch room data (Not used in the current version of the component)
    async function fetchRoomData() {
        try {
            const { data: quantityData, error: quantityError } = await supabase
                .from('quantity')
                .select()
                .order('created_at', { ascending: false })
                .limit(1);

            if (quantityError) throw quantityError;

            const { data: areasData, error: areasError } = await supabase
                .from('areas')
                .select()
                .order('created_at', { ascending: false })
                .limit(1);

            if (areasError) throw areasError;

            // console.log("Quantity Data", quantityData);
            // console.log("Areas Data", areasData);
        } catch (error) {
            console.error('Error fetching room data:', error);
        }
    }

    // useEffect to fetch all required data on component mount
    useEffect(() => {
        Promise.all([fetchCategories(), fetchProductsData(), fetchWorkspaces(), fetchRoomData()]);
    }, []);

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

    const totalCategories = 2;
    const selectedCategoriesCount = (selectedTable ? 1 : 0) + (selectedChair ? 1 : 0);
    const progressPercentage = Math.round((selectedCategoriesCount / totalCategories) * 100);

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
        const totalCategories = Object.keys(groupedProducts).reduce(
            (count, category) =>
                count + Object.keys(groupedProducts[category]).length,
            0
        );
        return (selectedProducts.length / totalCategories) * 100;
    };

    return (
        <div>
            <ProgressBar progressPercentage={calculateProgress()} />
            <div className="product-page flex justify-between mt-8">
                <Sidebar categories={categories}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
                    onSelectSubCategory={handleSelectSubCategory}
                />
                <div>
                    <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onSubCategory1Change={handleSubCategory1Change} />
                    <main className="main-content flex">
                        {groupedProducts && <ProductList
                            products={groupedProducts}
                            selectedCategory={selectedCategory}
                            selectedSubCategory={selectedSubCategory}
                            selectedSubCategory1={selectedSubCategory1}
                            selectedProduct={selectedProducts.find(
                                (item) =>
                                    item.category === selectedCategory &&
                                    item.subCategory1 === selectedSubCategory1
                            )}
                            onProductSelect={handleProductSelect}
                        />}
                    </main>
                    <AddonsSection />
                </div>
                <Recommendations />
            </div>
        </div>
    );
}

export default ProductPage;
