import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({
    products,
    selectedCategory,
    selectedSubCategory,
    selectedSubCategory1,
    selectedProduct,
    onProductSelect,
    quantityData,
    areasData,
    handelSelectedData,
    handleAddOnChange,
    userResponses,
}) => {
    const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';
    const productsInCategory = products[selectedCategory];

    // Validate category
    if (!productsInCategory) {
        return <p>Category "{selectedCategory}" not found.</p>;
    }

    const productsInSubCategory = productsInCategory[selectedSubCategory];

    // Validate subcategory
    if (!productsInSubCategory) {
        return <p>Subcategory "{selectedSubCategory}" not found in category "{selectedCategory}".</p>;
    }

    // Conditional logic for rendering products
    let filteredProducts = [];
    if (selectedCategory === 'Flooring' && userResponses.flooringArea === 'allArea') {
        // Filter products based on the user's flooring type
        filteredProducts = productsInSubCategory.filter(
            (product) => product.subcategory1 === userResponses.flooringType
        );
    } else if (selectedCategory === 'HVAC' && userResponses.hvacType === 'Centralized') {
        // Filter products based on the user's HVAC type
        filteredProducts = productsInSubCategory.filter(
            (product) => product.subcategory1 === 'Centralized'
        );
    } else {
        // Default filtering based on selectedSubCategory1
        filteredProducts = productsInSubCategory.filter(
            (product) => product.subcategory1 === selectedSubCategory1
        );
    }

    // Handle case when no products match
    if (filteredProducts.length === 0) {
        return <p>No products found for the selected criteria.</p>;
    }

    const handleSelect = (product, variant) => {
        // Update selected product in local storage
        const updatedSelection = {
            category: selectedCategory,
            subCategory: selectedSubCategory,
            subCategory1: selectedSubCategory1,
            product: variant,
        };
        localStorage.setItem('selectedProducts', JSON.stringify(updatedSelection));
        onProductSelect(updatedSelection);
    };
    console.log("selected category in product list", selectedCategory)
    console.log("filtered products", filteredProducts)
    return (
        <section className="products-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <h1>Products in {selectedSubCategory} - {selectedSubCategory1}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {filteredProducts.map((product, index) =>
                    product.product_variants.map((variant, variantIndex) => {
                        const additionalImagesArray = variant.additional_images
                            ? JSON.parse(variant.additional_images).map(
                                (imageName) => `${baseImageUrl}${imageName}`
                            )
                            : [];
                        return (
                            <ProductCard
                                key={`${index}-${variantIndex}`}
                                product={product}
                                variant={variant}
                                additionalImages={additionalImagesArray}
                                isSelected={selectedProduct?.product?.id === variant.id}
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
