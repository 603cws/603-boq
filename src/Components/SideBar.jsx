import React, { useState, useEffect } from 'react';
import '../styles/SideBar.css';
import { supabase } from '../services/supabase';
import { Layers2Icon } from 'lucide-react';

const SideBar = ({ categories, selectedCategory, selectedSubCategory, onSelectSubCategory, }) => {

    const [expandedCategory, setExpandedCategory] = React.useState(
        selectedCategory || null
    );

    const handleToggleCategory = (category) => {
        setExpandedCategory((prev) => (prev === category ? null : category)); // Toggle expand/collapse
    };

    return (
        <div className="sidebar">
            {categories.map(({ id, category, subcategories }) => (
                <div
                    key={id}
                    className={`category ${expandedCategory === category ? 'expanded' : ''}`}
                >
                    {/* Category Title */}
                    <div
                        className={`category-header font-bold cursor-pointer p-2 flex items-center justify-between rounded-md ${selectedCategory === category
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-blue-100'
                            }`}
                        onClick={() => handleToggleCategory(category)}
                    >
                        <span className="flex gap-2">
                            <Layers2Icon />
                            {category}
                        </span>
                        <span className="toggle-icon font-bold">
                            {expandedCategory === category ? '-' : '+'}
                        </span>
                    </div>

                    {/* Subcategories */}
                    <ul className="subcategory-list mt-2 pl-4 space-y-1">
                        {expandedCategory === category &&
                            subcategories.map((subcat) => (
                                <li
                                    key={subcat}
                                    className={`cursor-pointer p-2 rounded-md ${selectedCategory === category &&
                                        selectedSubCategory === subcat
                                        ? 'bg-blue-100 text-blue-700 font-bold'
                                        : 'hover:bg-gray-200'
                                        }`}
                                    onClick={() => onSelectSubCategory(category, subcat)}
                                >
                                    {subcat}
                                </li>
                            ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default SideBar;
