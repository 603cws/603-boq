import React from "react";
import { Slider, Select, MenuItem, Button } from "@mui/material";

const Filters = ({ searchQuery, handleSearch, priceRange, handleSliderChange, toggleFilters, showFilters, selectedCategory, handleCategoryChange, categories }) => (
    <div className="search-filter">
        <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-bar"
        />
        <Button onClick={toggleFilters} variant="contained" color="primary">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        {showFilters && (
            <div className="filters">
                <Slider
                    value={priceRange}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    min={1000}
                    max={15000}
                    className="price-slider"
                />
                <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    displayEmpty
                    className="category-select"
                >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                </Select>
            </div>
        )}
    </div>
);

export default Filters;