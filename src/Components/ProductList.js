import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, selectedCategory, handleSelectProduct, selectedProduct }) => {
    const [hoveredImage, setHoveredImage] = useState(null);

    return (
        <section className="products-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {products[selectedCategory].map((product, index) => (
                <ProductCard
                    key={index}
                    product={product}
                    handleSelectProduct={() => handleSelectProduct(product.title)}
                    isSelected={selectedProduct === product.title}
                    hoveredImage={hoveredImage}
                    setHoveredImage={setHoveredImage}
                />
            ))}
        </section>
    );
};

export default ProductList;
