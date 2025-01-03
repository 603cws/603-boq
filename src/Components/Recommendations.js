import React from 'react';

const Recommendations = ({ product, selectedSubCategory, handleAddOnChange }) => {
    // If no addons or subcategory doesn't match, return null early
    if (
        !product.addons ||
        product.addons.length === 0 ||
        !product.subcategory.split(',').includes(selectedSubCategory)
    ) {
        return null;
    }

    // Check if any addon has variants
    const hasVariants = product.addons.some(
        (addon) => addon.addon_variants && addon.addon_variants.length > 0
    );

    if (!hasVariants) {
        return null; // Return nothing if no addons with variants
    }

    return (
        <aside className="recommendations min-w-80 mt-8 py-4 bg-gray-100 rounded-lg flex flex-col">
            <h2 className="text-green-600 text-lg font-semibold mb-4">Recommended</h2>
            <div className="recommendations-container overflow-y-auto mt-4">
                {product.addons.map((addon) =>
                    addon.addon_variants && addon.addon_variants.length > 0 ? (
                        <div key={addon.id} className="recommended-item text-sm mb-3">
                            <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
                            <h4>{addon.title}</h4>
                            {addon.addon_variants.map((variant) => (
                                <div key={variant.id} className="recommended-variant flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`addon-${variant.id}`}
                                        onChange={(e) => handleAddOnChange(variant, e.target.checked, addon?.title)}
                                    />
                                    <label htmlFor={`addon-${variant.id}`} className="ml-2 flex items-center">
                                        <img
                                            src={variant.image || variant.title} // Fallback for missing image
                                            alt={variant.title}
                                            className="recommended-image w-10 h-10 object-cover"
                                        />
                                        <div className="text-xs ml-2">
                                            <h6 className="font-semibold">{variant.title}</h6>
                                            <p>Price: ₹{variant.price}</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : null
                )}
            </div>
        </aside>
    );
};

export default Recommendations;
