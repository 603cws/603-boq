import React, { createContext, useContext, useState } from "react";

const GrandTotalContext = createContext();

export const GrandTotalProvider = ({ children }) => {
    const [grandTotal, setGrandTotal] = useState(0);

    return (
        <GrandTotalContext.Provider value={{ grandTotal, setGrandTotal }}>
            {children}
        </GrandTotalContext.Provider>
    );
};

export const useGrandTotal = () => useContext(GrandTotalContext);
