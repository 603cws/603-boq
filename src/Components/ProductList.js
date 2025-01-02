import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, selectedCategory, selectedSubCategory, selectedSubCategory1, selectedProduct, onProductSelect, setSelectedProducts, quantityData, areasData, selectedAddOns }) => {
    const [selectedData, setSelectedData] = useState([])
    const categoriesWithModal = ['Flooring', 'HVAC', 'Partitions / Ceilings'];   // Array of categories that should show the modal when clicked

    const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';
    console.log("selected data", selectedData)
    const productsInCategory = products[selectedCategory];
    if (!productsInCategory) {
        return <p>Category "{selectedCategory}" not found.</p>;
    }

    const productsInSubCategory = productsInCategory[selectedSubCategory];
    if (!productsInSubCategory) {
        return <p>Subcategory "{selectedSubCategory}" not found in category "{selectedCategory}".</p>;
    }

    // Filter products based on selectedSubCategory1
    const filteredProducts = productsInSubCategory.filter(product => product.subcategory1 === selectedSubCategory1);

    if (filteredProducts.length === 0) {
        return <p>No products found in subcategory "{selectedSubCategory1}".</p>;
    }

    const handleSelect = (product, variant) => {
        // Update selected product in local storage
        const updatedSelection = { category: selectedCategory, subCategory: selectedSubCategory, subCategory1: selectedSubCategory1, product: variant };
        localStorage.setItem('selectedProducts', JSON.stringify(updatedSelection));

        // Trigger the callback for updating state
        onProductSelect(updatedSelection);
    };

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

        console.log("Processed group key:", groupKey);
    };

    return (
        <section className="products-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <h1>Products in {selectedSubCategory} - {selectedSubCategory1}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {filteredProducts.map((product, index) =>
                    product.product_variants.map((variant, variantIndex) => {
                        const additionalImagesArray = variant.additional_images
                            ? JSON.parse(variant.additional_images).map(imageName => `${baseImageUrl}${imageName}`)
                            : [];
                        // console.log("Product List: ", selectedProduct?.id, variant.id)

                        return (
                            <ProductCard
                                key={`${index}-${variantIndex}`}
                                product={product}
                                variant={variant}
                                additionalImages={additionalImagesArray}
                                isSelected={selectedProduct?.product.id === variant.id}
                                handleSelect={handleSelect}
                                selectedCategory={selectedCategory}
                                selectedSubCategory={selectedSubCategory}
                                selectedSubCategory1={selectedSubCategory1}
                                quantityData={quantityData}
                                areasData={areasData}
                                handelSelectedData={handelSelectedData}
                            />
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default ProductList;
