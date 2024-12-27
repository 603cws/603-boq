import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const CategoryButtons = ({ selectedCategory, setSelectedCategory, onSubCategory1Change }) => {
    const [subCat1, setSubCat1] = useState({});
    const [selectedSubCategory1, setSelectedSubCategory1] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Automatically set the first subcategory of the selected category
        if (selectedCategory && subCat1[selectedCategory]?.length > 0) {
            setSelectedSubCategory1(subCat1[selectedCategory][0]); // Default to the first subcategory
        } else {
            setSelectedSubCategory1(null); // Clear if no subcategories exist
        }
    }, [selectedCategory, subCat1]);

    useEffect(() => {
        // Notify the parent whenever selectedSubCategory1 changes
        if (onSubCategory1Change) {
            onSubCategory1Change(selectedSubCategory1);
        }
    }, [selectedSubCategory1, onSubCategory1Change]);

    async function fetchCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('name,subCat1');

            if (error) {
                console.error('Error fetching categories:', error);
                return;
            }

            // Transform data into key-value pairs
            const transformedData = data.reduce((acc, item) => {
                acc[item.name] = item.subCat1 ? JSON.parse(item.subCat1) : [];
                return acc;
            }, {});

            setSubCat1(transformedData);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    const renderSubCategoryButtons = () => {
        const subCategories = subCat1[selectedCategory] || []; // Get subcategories for the selected category

        return subCategories.map((subCat) => (
            <button
                key={subCat}
                onClick={() => setSelectedSubCategory1(subCat)}
                style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    backgroundColor: selectedSubCategory1 === subCat ? '#4CAF50' : '#ddd',
                    color: '#fff',
                    cursor: 'pointer',
                    margin: '0.5rem',
                }}
            >
                {subCat}
            </button>
        ));
    };

    return (
        <div style={{ marginTop: '80px', marginBottom: '20px' }}>
            {/* Subcategory Buttons */}
            <div className="subcategory-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {selectedCategory ? renderSubCategoryButtons() : <p>Select a category to see subcategories</p>}
            </div>
        </div>
    );
};

export default CategoryButtons;
