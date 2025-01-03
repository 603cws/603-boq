import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import QuestionModal from './questionModal';

const CategoryButtons = ({ selectedCategory, setSelectedCategory, onSubCategory1Change }) => {
    const [subCat1, setSubCat1] = useState({});
    const [selectedSubCategory1, setSelectedSubCategory1] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [question1, setQuestion1] = useState('');
    const [question2, setQuestion2] = useState('');
    const [canDisplaySubCategories, setCanDisplaySubCategories] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            if (selectedCategory === 'Flooring') {
                setShowModal(true);
                setCanDisplaySubCategories(false);
            } else {
                setShowModal(false);
                setCanDisplaySubCategories(true);
            }
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (canDisplaySubCategories && selectedCategory && subCat1[selectedCategory]?.length > 0) {
            setSelectedSubCategory1(subCat1[selectedCategory][0]);
        } else {
            setSelectedSubCategory1(null);
        }
    }, [selectedCategory, canDisplaySubCategories, subCat1]);

    useEffect(() => {
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

            const transformedData = data.reduce((acc, item) => {
                acc[item.name] = item.subCat1 ? JSON.parse(item.subCat1) : [];
                return acc;
            }, {});

            setSubCat1(transformedData);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    const handleModalSubmit = () => {
        if (question1 && question2) {
            setCanDisplaySubCategories(true);
            setShowModal(false);
        } else {
            alert('Please answer both questions.');
        }
    };

    const renderSubCategoryButtons = () => {
        const subCategories = subCat1[selectedCategory] || [];

        return subCategories.map((subCat) => (
            <button
                key={subCat}
                onClick={() => setSelectedSubCategory1(subCat)}
                className={`py-2 px-4 rounded ${selectedSubCategory1 === subCat
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                    } transition duration-300`}
            >
                {subCat}
            </button>
        ));
    };

    return (
        <div className="mt-20 mb-8">
            {showModal && (
                <QuestionModal
                    onSubmit={handleModalSubmit}
                    question1={question1}
                    setQuestion1={setQuestion1}
                    question2={question2}
                    setQuestion2={setQuestion2}
                />
            )}
            {canDisplaySubCategories ? (
                <div className="flex flex-wrap gap-4">
                    {renderSubCategoryButtons()}
                </div>
            ) : (
                <p>Select a category to see subcategories</p>
            )}
        </div>
    );
};

export default CategoryButtons;
