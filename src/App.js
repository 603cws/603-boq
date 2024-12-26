import React, { useState } from 'react';

const ProductPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('Tables');
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedChair, setSelectedChair] = useState(null);
    const [hoveredImage, setHoveredImage] = useState({}); // Track hovered image per product

    const products = {
        Tables: [
            {
                title: 'Modern Wooden Table',
                description: 'A beautifully crafted wooden table perfect for dining or workspace.',
                price: '$250',
                image: 'https://via.placeholder.com/300',
                additionalImages: [
                    'https://via.placeholder.com/300/FF0000',
                    'https://via.placeholder.com/300/00FF00',
                    'https://via.placeholder.com/300/0000FF',
                ],
            },
            {
                title: 'Glass Dining Table',
                description: 'A sleek glass dining table for modern homes.',
                price: '$300',
                image: 'https://via.placeholder.com/300',
                additionalImages: [
                    'https://via.placeholder.com/300/FFFF00',
                    'https://via.placeholder.com/300/FF00FF',
                ],
            },
        ],
        Chairs: [
            {
                title: 'Comfortable Office Chair',
                description: 'An ergonomic chair perfect for long hours of work.',
                price: '$120',
                image: 'https://via.placeholder.com/300',
                additionalImages: [
                    'https://via.placeholder.com/300/FFA500',
                    'https://via.placeholder.com/300/800080',
                ],
            },
            {
                title: 'Stylish Lounge Chair',
                description: 'A stylish lounge chair for your living room.',
                price: '$200',
                image: 'https://via.placeholder.com/300',
                additionalImages: [
                    'https://via.placeholder.com/300/008000',
                    'https://via.placeholder.com/300/000080',
                ],
            },
        ],
    };

    const totalCategories = 2; // Tables and Chairs
    const selectedCategoriesCount = (selectedTable ? 1 : 0) + (selectedChair ? 1 : 0);
    const progressPercentage = Math.round((selectedCategoriesCount / totalCategories) * 100);

    const handleSelectProduct = (productTitle) => {
        if (selectedCategory === 'Tables') {
            setSelectedTable(selectedTable === productTitle ? null : productTitle);
        } else if (selectedCategory === 'Chairs') {
            setSelectedChair(selectedChair === productTitle ? null : productTitle);
        }
    };

    const renderProduct = (product, index) => (
        <div key={index} className="product-details">
            <h1 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{product.title}</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#555' }}>{product.description}</p>
            <p style={{ fontWeight: 'bold', color: '#4CAF50' }}>Price: {product.price}</p>

            {/* Main Image */}
            <div
                className="main-image-box"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '300px',
                    height: '300px',
                    border: '1px solid #ddd',
                    margin: '1rem auto',
                    borderRadius: '8px',
                }}
            >
                <img
                    src={hoveredImage[product.title] || product.image} // Display hovered image or default
                    alt={product.title}
                    style={{ width: '100%', borderRadius: '8px' }}
                />
            </div>

            {/* Additional Images */}
            <div className="additional-images" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {product.additionalImages.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`Angle ${idx + 1}`}
                        onMouseEnter={() =>
                            setHoveredImage((prev) => ({ ...prev, [product.title]: img })) // Update only this product's image
                        }
                        onMouseLeave={() =>
                            setHoveredImage((prev) => ({ ...prev, [product.title]: null })) // Reset only this product's image
                        }
                        style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            border: hoveredImage[product.title] === img ? '2px solid #4CAF50' : '2px solid transparent',
                        }}
                    />
                ))}
            </div>

            {/* Select Button */}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                    onClick={() => handleSelectProduct(product.title)}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: (selectedCategory === 'Tables' && selectedTable === product.title) || (selectedCategory === 'Chairs' && selectedChair === product.title) ? '#ff9800' : '#2196f3',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    {(selectedCategory === 'Tables' && selectedTable === product.title) || (selectedCategory === 'Chairs' && selectedChair === product.title) ? 'Selected' : 'Select'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="product-page" style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{ width: '250px', marginTop: '70px' }}>Sidebar Content</aside>

            {/* Left Section (Product List and Progress Bar) */}
            <div style={{ flex: 1, marginLeft: '250px' }}>
                <div className="progress-bar-container" style={{ position: 'fixed', top: '0', left: '0', width: '100%', backgroundColor: '#f0f0f0', padding: '0.5rem 1rem', zIndex: '1000' }}>
                    <h2 className="category-name" style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '20px', margin: '0' }}>Product Categories</h2>
                    <div className="progress-bar-outer" style={{ backgroundColor: '#ddd', borderRadius: '8px', overflow: 'hidden', height: '20px', marginTop: '0.5rem' }}>
                        <div className="progress-bar-inner" style={{ width: `${progressPercentage}%`, backgroundColor: '#4CAF50', height: '100%', textAlign: 'center', color: '#fff', lineHeight: '20px' }}>
                            {progressPercentage === 100 ? 'Completed ✓' : `${progressPercentage}%`}
                        </div>
                    </div>
                </div>

                {/* Category Buttons */}
                <div className="category-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '80px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setSelectedCategory('Tables')}
                        style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: selectedCategory === 'Tables' ? '#4CAF50' : '#ddd', color: '#fff', cursor: 'pointer' }}
                    >
                        Tables
                    </button>
                    <button
                        onClick={() => setSelectedCategory('Chairs')}
                        style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: selectedCategory === 'Chairs' ? '#4CAF50' : '#ddd', color: '#fff', cursor: 'pointer' }}
                    >
                        Chairs
                    </button>
                </div>

                <main className="main-content" style={{ marginTop: '70px', padding: '1rem' }}>
                    <section className="products-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                        {selectedCategory === 'Tables' && products.Tables.map((product, index) => renderProduct(product, index))}
                        {selectedCategory === 'Chairs' && products.Chairs.map((product, index) => renderProduct(product, index))}
                    </section>
                </main>

                {/* Addons Section */}
                <aside className="addons" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <h2 style={{ color: '#4CAF50', fontSize: '1.5rem', marginBottom: '1rem' }}>Addons Section</h2>
                    <p style={{ color: '#555' }}>You can place relevant addon items or other accessories here to enhance user experience.</p>
                </aside>
            </div>

            {/* Right Section (Recommend Section) */}
            <aside className="recommend" style={{ width: '300px', padding: '1rem', borderLeft: '2px solid #ddd', marginTop: '70px' }}>
                <h2 style={{ color: '#4CAF50', fontSize: '1.5rem', marginBottom: '1rem' }}>Recommend Section</h2>
                <p style={{ color: '#555' }}>Here you can place recommendations, related products, or promotional offers.</p>
            </aside>
        </div>
    );
};

export default ProductPage;
