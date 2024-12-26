import React, { useState } from 'react';
import Sidebar from './Components/SideBar.jsx';
import ProgressBar from './Components/ProgressBar.js';
import CategoryButtons from './Components/CategoryButtons.js';
import ProductList from './Components/ProductList';
import AddonsSection from './Components/AddonsSection';
import Recommendations from './Components/Recommendations.js';

const ProductPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('Tables');
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedChair, setSelectedChair] = useState(null);

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

    const totalCategories = 2;
    const selectedCategoriesCount = (selectedTable ? 1 : 0) + (selectedChair ? 1 : 0);
    const progressPercentage = Math.round((selectedCategoriesCount / totalCategories) * 100);

    const handleSelectProduct = (productTitle) => {
        if (selectedCategory === 'Tables') {
            setSelectedTable(selectedTable === productTitle ? null : productTitle);
        } else if (selectedCategory === 'Chairs') {
            setSelectedChair(selectedChair === productTitle ? null : productTitle);
        }
    };

    return (
        <div className="product-page" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '250px' }}>
                <ProgressBar progressPercentage={progressPercentage} />
                <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
                <main className="main-content" style={{ marginTop: '70px', padding: '1rem' }}>
                    <ProductList
                        products={products}
                        selectedCategory={selectedCategory}
                        handleSelectProduct={handleSelectProduct}
                        selectedProduct={selectedCategory === 'Tables' ? selectedTable : selectedChair}
                    />
                </main>
                <AddonsSection />
            </div>
            <Recommendations />
        </div>
    );
};

export default ProductPage;
