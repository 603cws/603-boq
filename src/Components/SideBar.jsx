import React, { useState, useEffect } from 'react';
import '../styles/SideBar.css'
import { supabase } from '../services/supabase';
import { Layers2Icon } from 'lucide-react';

const SideBar = () => {
    const [categories, setCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null); // Track expanded category

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('name, subcategories');

                if (error) {
                    console.error('Error fetching categories:', error);
                    return;
                }

                // Parse subcategories JSON strings into arrays
                const formattedData = data.map((item) => ({
                    category: item.name,
                    subcategories: JSON.parse(item.subcategories || '[]'), // Ensure subcategories is an array
                }));

                setCategories(formattedData);
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        fetchCategories();
    }, []);
    const handleToggleCategory = (category) => {
        setExpandedCategory((prev) => (prev === category ? null : category)); // Toggle expand/collapse
    };

    return (
        <div className="sidebar">

            {categories.map(({ category, subcategories }) => (
                <div
                    key={category}
                    className={`category ${expandedCategory === category ? 'expanded' : ''}`}
                >
                    {/* Category Title */}
                    <div
                        className="category-header font-bold"
                        onClick={() => handleToggleCategory(category)}
                    >
                        <span className='flex gap-2'>
                            <Layers2Icon />
                            {category}</span>
                        <span className="toggle-icon font-bold">
                            {expandedCategory === category ? '-' : '+'}
                        </span>
                    </div>

                    {/* Subcategories */}
                    <ul className="subcategory-list">
                        {expandedCategory === category &&
                            subcategories.map((subcat) => (
                                <li key={subcat} className="subcategory-item">
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
