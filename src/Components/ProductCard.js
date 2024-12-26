import React from 'react';

const ProductCard = ({ product, handleSelectProduct, isSelected, hoveredImage, setHoveredImage }) => {
    return (
        <div className="product-details">
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
                    src={hoveredImage || product.image}
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
                        onMouseEnter={() => setHoveredImage(img)}
                        onMouseLeave={() => setHoveredImage(null)}
                        style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            border: hoveredImage === img ? '2px solid #4CAF50' : '2px solid transparent',
                        }}
                    />
                ))}
            </div>

            {/* Select Button */}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                    onClick={handleSelectProduct}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: isSelected ? '#ff9800' : '#2196f3',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    {isSelected ? 'Selected' : 'Select'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
