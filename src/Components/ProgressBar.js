import React from 'react';

const ProgressBar = ({ progressPercentage }) => {
    return (
        <div className="fixed top-0 left-0 w-full bg-gray-100 p-2 z-50">
            <div className="flex justify-between items-center mb-1">
                {/* <span className="text-sm font-medium text-gray-600">Progress</span> */}
                <span className={`text-xs font-semibold text-white bg-green-600 px-2 py-1 rounded-full`}>
                    {progressPercentage === 100 ? 'Completed ✓' : `${progressPercentage}%`}
                </span>
            </div>
            <div className="bg-gray-300 rounded-md overflow-hidden h-1">
                <div
                    className="bg-green-600 h-full"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
