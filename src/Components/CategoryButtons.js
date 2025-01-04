import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const CategoryButtons = ({ selectedCategory, setSelectedCategory, onSubCategory1Change, userResponses }) => {
    const [subCat1, setSubCat1] = useState({});
    const [selectedSubCategory1, setSelectedSubCategory1] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Automatically set the first subcategory of the selected category
        if (selectedCategory) {
            if (selectedCategory === 'Flooring' && userResponses?.flooringArea === 'allArea') {
                // Set default subcategory for Flooring when 'allArea' is selected
                setSelectedSubCategory1(userResponses.flooringType);
            } else if (subCat1[selectedCategory]?.length > 0) {
                // For other categories, default to the first subcategory
                setSelectedSubCategory1(subCat1[selectedCategory][0]);
            }
        }
    }, [selectedCategory, subCat1, userResponses]);

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

        if (selectedCategory === 'Flooring' && userResponses?.flooringArea === 'allArea') {
            // Show only the button for userResponses.flooringType
            return subCategories
                .filter((subCat) => subCat === userResponses.flooringType) // Filter for flooringType
                .map((subCat) => (
                    <button
                        key={subCat}
                        onClick={() => setSelectedSubCategory1(subCat)}
                        className={`px-4 py-2 rounded ${selectedSubCategory1 === subCat ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}
                    >
                        {subCat}
                    </button>
                ));
        }

        // Render all subcategory buttons for other categories or default case
        return subCategories.map((subCat) => (
            <button
                key={subCat}
                onClick={() => setSelectedSubCategory1(subCat)}
                className={`px-4 py-2 rounded ${selectedSubCategory1 === subCat ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}
            >
                {subCat}
            </button>
        ));
    };

    return (
        <div className="mt-20 mb-5">
            {/* Subcategory Buttons */}
            <div className="flex flex-wrap gap-4">
                {selectedCategory ? renderSubCategoryButtons() : <p>Select a category to see subcategories</p>}
            </div>
        </div>
    );
};

export default CategoryButtons;
