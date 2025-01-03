import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, selectedCategory, selectedSubCategory, selectedSubCategory1, selectedProduct, onProductSelect, setSelectedProducts, quantityData, areasData, selectedAddOns, handelSelectedData, handleAddOnChange }) => {
    const [selectedData, setSelectedData] = useState([])
    const categoriesWithModal = ['Flooring', 'HVAC', 'Partitions / Ceilings'];   // Array of categories that should show the modal when clicked

    const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';
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
                                handleAddOnChange={handleAddOnChange}
                            />
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default ProductList;
