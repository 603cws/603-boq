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
    const [selectedCategory2, setSelectedCategory2] = useState('Tables');
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedChair, setSelectedChair] = useState(null);
    const [categories, setCategories] = useState([]);
    const [productsData, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([1000, 15000]);

    // const products = {
    //     Tables: [
    //         {
    //             title: 'Modern Wooden Table',
    //             description: 'A beautifully crafted wooden table perfect for dining or workspace.',
    //             price: '$250',
    //             image: 'https://via.placeholder.com/300',
    //             additionalImages: [
    //                 'https://via.placeholder.com/300/FF0000',
    //                 'https://via.placeholder.com/300/00FF00',
    //                 'https://via.placeholder.com/300/0000FF',
    //             ],
    //         },
    //         {
    //             title: 'Glass Dining Table',
    //             description: 'A sleek glass dining table for modern homes.',
    //             price: '$300',
    //             image: 'https://via.placeholder.com/300',
    //             additionalImages: [
    //                 'https://via.placeholder.com/300/FFFF00',
    //                 'https://via.placeholder.com/300/FF00FF',
    //             ],
    //         },
    //     ],
    //     Chairs: [
    //         {
    //             title: 'Comfortable Office Chair',
    //             description: 'An ergonomic chair perfect for long hours of work.',
    //             price: '$120',
    //             image: 'https://via.placeholder.com/300',
    //             additionalImages: [
    //                 'https://via.placeholder.com/300/FFA500',
    //                 'https://via.placeholder.com/300/800080',
    //             ],
    //         },
    //         {
    //             title: 'Stylish Lounge Chair',
    //             description: 'A stylish lounge chair for your living room.',
    //             price: '$200',
    //             image: 'https://via.placeholder.com/300',
    //             additionalImages: [
    //                 'https://via.placeholder.com/300/008000',
    //                 'https://via.placeholder.com/300/000080',
    //             ],
    //         },
    //     ],
    // };

    async function fetchCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('name');

            if (error) {
                console.error('Error fetching categories:', error);
                return [];
            }

            const categories = data.map((item) => item.name);
            setCategories(categories);
            // console.log("Categories", categories);
            return categories;
        } catch (err) {
            console.error('Unexpected error:', err);
            return [];
        }
    }

    // Fetch products data
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
            // console.log("Products Data", processedData);
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

            // console.log("Workspace Data", workspacesData); // You can use it if needed
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

        // console.log("Filtered Products in group:", filteredProducts);

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
        // console.log("Grouped products in fucntion: ", grouped);
        return grouped;
    }, [filteredProducts]);

    const totalCategories = 2;
    const selectedCategoriesCount = (selectedTable ? 1 : 0) + (selectedChair ? 1 : 0);
    const progressPercentage = Math.round((selectedCategoriesCount / totalCategories) * 100);

    const handleSelectProduct = (productTitle) => {
        if (selectedCategory2 === 'Tables') {
            setSelectedTable(selectedTable === productTitle ? null : productTitle);
        } else if (selectedCategory2 === 'Chairs') {
            setSelectedChair(selectedChair === productTitle ? null : productTitle);
        }
    };

    // if (groupedProducts) {
    //     console.log("Grouped products: ", groupedProducts);
    // }

    return (
        <div>
            <ProgressBar progressPercentage={progressPercentage} />
            <div className="product-page flex justify-between">
                <Sidebar />
                <div>
                    <CategoryButtons selectedCategory={selectedCategory2} setSelectedCategory={setSelectedCategory2} />
                    <main className="main-content flex">
                        {groupedProducts && <ProductList
                            products={groupedProducts}
                            selectedCategory={selectedCategory}
                            handleSelectProduct={handleSelectProduct}
                            selectedProduct={selectedCategory2 === 'Tables' ? selectedTable : selectedChair}
                        />}
                    </main>
                    <AddonsSection />
                </div>
                <Recommendations />
            </div>
        </div>
    );
};

export default ProductPage;
