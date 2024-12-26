import React from 'react';

const CategoryButtons = ({ selectedCategory, setSelectedCategory }) => {
    return (
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
    );
};

export default CategoryButtons;
