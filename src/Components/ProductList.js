import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, selectedCategory, handleSelectProduct, selectedProduct }) => {
    const baseImageUrl = 'https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/public/addon/';

    const selectedSubCategory = 'Linear Workstation'; // This could be dynamic based on user selection

    const productsInCategory = products[selectedCategory];
    if (!productsInCategory) {
        return <p>Category "{selectedCategory}" not found.</p>;
    }

    const productsInSubCategory = productsInCategory[selectedSubCategory];
    if (!productsInSubCategory) {
        return <p>Subcategory "{selectedSubCategory}" not found in category "{selectedCategory}".</p>;
    } else {
        productsInSubCategory.map(product => {
            console.log(product);
        }
        )
    }

    return (
        <section className="products-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <h1>Products in {selectedSubCategory}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {productsInSubCategory.map((product, index) =>
                    product.product_variants.map((variant, variantIndex) => {
                        const additionalImagesArray = variant.additional_images
                            ? JSON.parse(variant.additional_images).map(imageName => `${baseImageUrl}${imageName}`)
                            : [];

                        return (
                            <ProductCard
                                key={`${index}-${variantIndex}`}
                                product={product}
                                variant={variant}
                                additionalImages={additionalImagesArray}
                                handleSelectProduct={() => handleSelectProduct(variant)}
                                isSelected={selectedProduct?.id === variant.id}
                            />
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default ProductList;
