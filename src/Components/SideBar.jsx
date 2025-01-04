import React, { useState, useEffect } from 'react';
import '../styles/SideBar.css';
import { supabase } from '../services/supabase';
import { Layers2Icon } from 'lucide-react';
import QuestionModal from './questionModal';

const SideBar = ({ categories, selectedCategory, selectedSubCategory, onSelectSubCategory, handleQuestionSubmit, setSelectedCategory }) => {

    const [expandedCategory, setExpandedCategory] = React.useState(
        selectedCategory || null
    );
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const categoriesWithModal = ['Flooring', 'HVAC', 'Partitions / Ceilings'];   // Array of categories that should show the modal when clicked


    const handleToggleCategory = (category) => {
        if (expandedCategory === category) {
            setExpandedCategory(null); // Collapse the category
        } else {
            setExpandedCategory(category); // Expand the new category
            const newCategory = categories.find((cat) => cat.category === category);
            if (newCategory && newCategory.subcategories.length > 0) {
                onSelectSubCategory(category, newCategory.subcategories[0]); // Select the first subcategory
            }
        }
        if (categoriesWithModal.includes(category)) {
            setShowQuestionModal(true);
        }
        setSelectedCategory(category)
    };
    console.log("categories", categories)
    console.log("category in sidebar", selectedCategory);
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
                                console.log("subcat", subcat),
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
            {showQuestionModal && (
                <QuestionModal
                    onSubmit={handleQuestionSubmit}
                    selectedCategory={selectedCategory}
                    onClose={() => {
                        setShowQuestionModal(false); // Close the modal
                        // setCabinsQuestions(false); // Reset questions state
                    }}
                />
            )}
        </div>
    );
};

export default SideBar;
