import React from 'react';

const ProgressBar = ({ progressPercentage }) => {
    return (
        <div className="progress-bar-container" style={{ position: 'fixed', top: '0', left: '0', width: '100%', backgroundColor: '#f0f0f0', padding: '0.5rem 1rem', zIndex: '1000' }}>
            <h2 className="category-name" style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '20px', margin: '0' }}>Product Categories</h2>
            <div className="progress-bar-outer" style={{ backgroundColor: '#ddd', borderRadius: '8px', overflow: 'hidden', height: '20px', marginTop: '0.5rem' }}>
                <div className="progress-bar-inner" style={{ width: `${progressPercentage}%`, backgroundColor: '#4CAF50', height: '100%', textAlign: 'center', color: '#fff', lineHeight: '20px' }}>
                    {progressPercentage === 100 ? 'Completed ✓' : `${progressPercentage}%`}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
