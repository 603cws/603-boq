import React from 'react';

const AddonsSection = ({ product, selectedSubCategory, handleAddOnChange }) => {
    // Ensure the addon section only renders when there are addons
    if (!product.addons || product.addons.length === 0) {
        return null; // Return nothing if there are no addons
    }

    console.log("Inside Addon Section: ", product);

    return (
        <div>
            {product.subcategory.split(',').includes(selectedSubCategory) && product.addons.some(
                (addon) => addon.addon_variants && addon.addon_variants.length > 0
            ) && (
                    <>
                        <aside className="addons mt-8 p-4 bg-gray-100 rounded-lg">

                            <h2 className="text-green-600 text-xl font-semibold mb-4">Addons Section</h2>
                            <div className="addons-container overflow-y-auto mt-4">
                                {product.addons.map((addon) => {
                                    if (addon.addon_variants && addon.addon_variants.length > 0) {
                                        return (
                                            <div key={addon.id} className="addon-item text-sm mb-3">
                                                <h3 className="text-sm font-semibold mb-2">ADD-ONS</h3>
                                                <h4>{addon.title}</h4>
                                                {addon.addon_variants.map((variant) => (
                                                    <div key={variant.id} className="addon-variant flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`addon-${variant.id}`}
                                                            onChange={(e) => handleAddOnChange(variant, e.target.checked, addon?.title)}
                                                        />
                                                        <label htmlFor={`addon-${variant.id}`} className="ml-2 flex items-center">
                                                            <img
                                                                src={variant.image || variant.title} // Fallback for missing image
                                                                alt={variant.title}
                                                                className="addon-image w-10 h-10 object-cover"
                                                            />
                                                            <div className="text-xs ml-2">
                                                                <h6 className="font-semibold">{variant.title}</h6>
                                                                <p>Price: ₹{variant.price}</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } else {
                                        return null; // Return nothing if no addon variants
                                    }
                                })}
                            </div>

                        </aside>
                    </>
                )}
        </div>
    );
};

export default AddonsSection;
