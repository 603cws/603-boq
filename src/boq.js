// import React, { useState, useMemo, useEffect } from 'react';
// import './boq.css';
// import { Slider, Skeleton } from '@mui/material';
// import { supabase } from './supabase';

// const Card = ({ title, price, image, details, addOns, initialMinimized = false, roomData }) => {
//   const [selectedAddOns, setSelectedAddOns] = useState({});
//   const [isMinimized, setIsMinimized] = useState(initialMinimized);
//   const basePrice = price;

//   const handleAddOnChange = (addOn, isChecked) => {
//     setSelectedAddOns((prevSelectedAddOns) => ({
//       ...prevSelectedAddOns,
//       [addOn.name]: isChecked ? addOn.price : 0,
//     }));
//   };

//   const calculateTotalPrice = useMemo(() => {
//     return Object.values(selectedAddOns).reduce((total, addOnPrice) => total + addOnPrice, basePrice);
//   }, [selectedAddOns, basePrice]);

//   const toggleMinimize = () => setIsMinimized((prev) => !prev);

//   if (isMinimized) {
//     return (
//       <div className="minimized-card" onClick={toggleMinimize}>
//         <span>{title}</span>
//         <div className="info">
//           <p>Base Price: ₹{basePrice}</p>
//           <p>Total Price: ₹{calculateTotalPrice}</p>
//         </div>
//         <button className="start-button">Start</button>
//       </div>
//     );
//   }

//   return (
//     <div className="card-container">
//       <CardSection className="card-image">
//         <img src={image} alt={title} className="image" />
//       </CardSection>

//       <CardSection className="card-features">
//         <h3>{title}</h3>
//         <p>{details}</p>
//         {roomData && (
//           <div className="room-info">
//             <p>Room Data:</p>
//             <ul>
//               {Object.entries(roomData).map(([key, value]) => (
//                 <li key={key}>{`${key}: ${value}`}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </CardSection>

//       <CardSection className="card-add-ons">
//         <h3>ADD ON</h3>
//         <ul>
//           {addOns.map((addOn, index) => (
//             <li key={index}>
//               <label>
//                 <input
//                   type="checkbox"
//                   onChange={(e) => handleAddOnChange(addOn, e.target.checked)}
//                 />
//                 {addOn.name} (+₹{addOn.price})
//               </label>
//             </li>
//           ))}
//         </ul>
//       </CardSection>

//       <CardSection className="card-summary">
//         <h4>Summary</h4>
//         <p>Base Price: ₹{basePrice}</p>
//         <p>Add-Ons: ₹{Object.values(selectedAddOns).reduce((total, price) => total + price, 0)}</p>
//         <p>Total Price: ₹{calculateTotalPrice}</p>
//         <button className="done-button" onClick={toggleMinimize}>Done</button>
//       </CardSection>
//     </div>
//   );
// };

// const CardSection = ({ className, children }) => {
//   return <div className={`card ${className}`}>{children}</div>;
// };

// const App = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [priceRange, setPriceRange] = useState([1000, 12000]);
//   const [productsData, setProductData] = useState([]);
//   const categories = [
//     'Furniture', 
//     'Civil / Plumbing', 
//     'Lighting', 
//     'Electrical', 
//     'Partitions- door / windows / ceilings',
//     'Paint', 
//     'HVAC', 
//     'Smart Solutions', 
//     'Flooring', 
//     'Accessories'
//   ];
//   const [loading, setLoading] = useState(true);
//   const [roomNumbers, setRoomNumbers] = useState([]);

//   async function fetchRoomData() {
//     try {
//       const { data, error } = await supabase
//         .from('areas')
//         .select()
//         .order('created_at', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         const latestRoomData = data[0];
//         const roomsArray = {
// linear: latestRoomData.linear,
// ltype: latestRoomData.ltype,
// md: latestRoomData.md,
// manager: latestRoomData.manager,
// small: latestRoomData.small,
// ups: latestRoomData.ups,
// bms: latestRoomData.bms,
// server: latestRoomData.server,
// reception: latestRoomData.reception,
// lounge: latestRoomData.lounge,
// sales: latestRoomData.sales,
// phonebooth: latestRoomData.phonebooth,
// discussionroom: latestRoomData.discussionroom,
// interviewroom: latestRoomData.interviewroom,
// conferenceroom: latestRoomData.conferenceroom,
// boardroom: latestRoomData.boardroom,
// meetingroom: latestRoomData.meetingroom,
// meetingroomlarge: latestRoomData.meetingroomlarge,
// hrroom: latestRoomData.hrroom,
// financeroom: latestRoomData.financeroom,
//         };
//         setRoomNumbers([roomsArray]);
//       }
//     } catch (error) {
//       console.error('Error fetching room data:', error);
//     }
//   }

//   async function fetchProductsData() {
//     try {
//       const { data, error } = await supabase
//         .from("products")
//         .select(`
//           *,
//           addons (*)
//         `);

//       if (error) throw error;

//       const allImages = data.flatMap(product => [product.image, ...product.addons.map(addon => addon.image)]);
//       const uniqueImages = [...new Set(allImages)];

//       const { data: signedUrls, error: signedUrlError } = await supabase.storage
//         .from("addon")
//         .createSignedUrls(uniqueImages, 3600);

//       if (signedUrlError) throw signedUrlError;

//       const urlMap = Object.fromEntries(signedUrls.map(item => [item.path, item.signedUrl]));

//       const processedData = data.map(product => ({
//         ...product,
//         image: urlMap[product.image] || '',
//         addons: product.addons.map(addon => ({
//           ...addon,
//           image: urlMap[addon.image] || ''
//         }))
//       }));

//       setProductData(processedData);
//     } catch (error) {
//       console.error('Error fetching products data:', error);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     Promise.all([fetchRoomData(), fetchProductsData()]);
//   }, []);

//   const handleSearch = (event) => {
//     setSearchQuery(event.target.value.toLowerCase());
//   };

//   const handleSliderChange = (event, newValue) => {
//     setPriceRange(newValue);
//   };

//   const filteredProducts = useMemo(() => {
//     return productsData.filter((product) => {
//       const matchesSearch = product.title.toLowerCase().includes(searchQuery) ||
//                             product.details.toLowerCase().includes(searchQuery);
//       const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
//       return matchesSearch && matchesPrice;
//     });
//   }, [productsData, searchQuery, priceRange]);

//   return (
//     <div className="App">
//       <div className="search-filter">
//         {loading ? (
//           <>
//             <Skeleton variant="rectangular" height={40} width="80%" className="skeleton-bar" />
//             <Skeleton variant="rectangular" height={40} width="80%" className="skeleton-slider" />
//           </>
//         ) : (
//           <>
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchQuery}
//               onChange={handleSearch}
//               className="search-bar"
//             />
//             <Slider
//               value={priceRange}
//               onChange={handleSliderChange}
//               valueLabelDisplay="auto"
//               min={1000}
//               max={12000}
//               className="price-slider"
//             />
//           </>
//         )}
//       </div>

//       <div className="products-grid">
//         {loading ? (
//           Array.from({ length: 4 }).map((_, index) => (
//             <div key={index} className="card-skeleton-container">
// <Skeleton variant="rectangular" height={150} width="100%" className="skeleton-card-image" />
// <Skeleton variant="text" width="60%" height={20} style={{ margin: '10px 0' }} />
// <Skeleton variant="text" width="80%" height={20} style={{ margin: '5px 0' }} />
// <Skeleton variant="text" width="50%" height={20} style={{ margin: '5px 0' }} />
//             </div>
//           ))
//         ) : (
//           categories.map((category) => {
//             const categoryProducts = filteredProducts.filter(product => product.category === category);
//             if (categoryProducts.length === 0) return null;

//             return (
//               <div key={category} className="category-section">
//                 <h2>{category}</h2>
//                 {categoryProducts.map((product) => (
//                   <div key={product.id}>
//                     <Card
//                       title={product.title}
//                       price={product.price}
//                       details={product.details}
//                       addOns={product.addons}
//                       image={product.image}
//                       initialMinimized={product.initialMinimized}
//                       // roomData={roomNumbers[0]}
//                     />
//                   </div>
//                 ))}
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default App; 

import React, { useState, useMemo, useEffect } from 'react';
import { Slider, Skeleton, Select, MenuItem, Button } from '@mui/material';
import { supabase } from './supabase';
import RoomDataBox from './RoomDataBox';
import './boq.css';
import Cart from './Cart';
import { LucideShoppingBag } from 'lucide-react';

const Card = ({ title, price, image, details, product_variants = [], addOns, initialMinimized = false, roomData, quantity, onAddToCart, data, subCat }) => {
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  // const colorOptions = [
  //   {src: null, label: 'black'},
  //   { src: image, label: 'White' },
  //   // { src: "https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/sign/addon/c31ace1e-a575-40ff-8cfa-bcbf98801e22-Expensive%20Chair?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhZGRvbi9jMzFhY2UxZS1hNTc1LTQwZmYtOGNmYS1iY2JmOTg4MDFlMjItRXhwZW5zaXZlIENoYWlyIiwiaWF0IjoxNzMxNTc4NTUzLCJleHAiOjE3MzE1ODIxNTN9.rTfG-gLLuET1iYwJ3QfZ03cL82GNwgji59IrdD3XJm0", label: 'Black' },
  //   { src: image2, label: 'Wooden' },
  //   { src: "https://bwxzfwsoxwtzhjbzbdzs.supabase.co/storage/v1/object/sign/addon/Chair-Good%20Chair?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhZGRvbi9DaGFpci1Hb29kIENoYWlyIiwiaWF0IjoxNzMxNTc4MTYxLCJleHAiOjE3MzE1ODE3NjF9.UGbv5YrpzDAv1xFXxT0zC1vB9CX3uXesKqPVgbo5ofc", label: 'Gray' }
  // ];

  const colorOptions = product_variants
    .filter(variant => variant.image)  // Filter out variants with null or undefined images
    .map(variant => ({
      src: variant.image,
      label: variant.title || 'Default',
      title: variant.title,
      details: variant.details,
      price: variant.price
    }));
  console.log(colorOptions);

  const [selectedImage, setSelectedImage] = useState(colorOptions.find(option => option.src)?.src || null);
  const [selectedTitle, setSelectedTitle] = useState(product_variants[0]?.title || null);
  const [selectedDetails, setSelectedDetails] = useState(product_variants[0]?.details || null);
  const [selectedPrice, setSelectedPrice] = useState(product_variants[0]?.price || 0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const basePrice = selectedPrice;  //price

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleAddOnChange = (addOn, isChecked) => {
    setSelectedAddOns((prevSelectedAddOns) => ({
      ...prevSelectedAddOns,
      [addOn.title]: isChecked ? addOn.price : 0,
    }));
  };

  const calculateTotalPrice = useMemo(() => {
    const totalAddOnPrice = Object.values(selectedAddOns).reduce((total, addOnPrice) => total + addOnPrice, basePrice);

    const normalizedSubCat = subCat.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Iterate over the data keys and check if any match normalizedSubCat
    const matchedKey = Object.keys(data).find(key => normalizedSubCat.includes(key.toLowerCase()));
    var quantity;
    if (matchedKey) {
      console.log(`Matched key: ${matchedKey}, Value: ${data[matchedKey]}`);
      quantity = data[matchedKey];
    }

    // Calculation for 'linear' using basePrice and addOn
    const linearTotal = (quantity * totalAddOnPrice);
    // console.log('bp: '+basePrice+ 'quantity: '+ quantity + 'total: ' +totalAddOnPrice+ 'lTotal: ' + linearTotal);
    console.log(subCat);
    return linearTotal;
  }, [selectedAddOns, basePrice, data]);

  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  if (isMinimized) {
    return (
      <div className="minimized-card" onClick={toggleMinimize}>
        <span>{selectedTitle}</span>
        <div className="info">
          <p>Base Price: ₹{basePrice}</p>
          <p>Total Price: ₹{calculateTotalPrice}</p>
        </div>
        <button className="start-button">Start</button>
      </div>
    );
  }

  const handleAddToCartClick = () => {
    const cartItem = {
      title: selectedTitle,
      image: selectedImage,
      price: calculateTotalPrice,
      addOns: Object.keys(selectedAddOns).filter((key) => selectedAddOns[key] > 0),
    };
    onAddToCart(cartItem); // Add item to cart
    toggleMinimize();
  };

  const handleImageClick = (imageSrc, title, details, price) => {
    if (imageSrc !== selectedImage) {
      setSelectedImage(imageSrc); // Only update the selected image if it's different
      setSelectedTitle(title); // Update the selected title
      setSelectedDetails(details);
      setSelectedPrice(price);
      setIsImageLoaded(false); // Reset image load state to trigger fade-in for the new image
    }
  };

  return (
    <div className="card-container">
      <CardSection className="card-image">
        <img src={selectedImage} alt={selectedTitle} className={`image ${isImageLoaded ? 'loaded' : ''}`} onLoad={handleImageLoad} />

        <div className="color-options">
          {colorOptions.filter(option => option.src).map((option, index) => (
            <img
              key={index}
              src={option.src}
              alt={option.label}
              className="color-thumbnail"
              onClick={() => handleImageClick(option.src, option.title, option.details, option.price)}
            />
          ))}
        </div>
      </CardSection>

      <CardSection className="card-features">
        <h3>{selectedTitle}</h3>
        <p>{selectedDetails}</p>
        {roomData && (
          <div className="room-info">
            <p>Room Data:</p>
            <ul>
              {Object.entries(roomData).map(([key, value]) => (
                <li key={key}>{`${key}: ${value}`}</li>
              ))}
            </ul>
          </div>
        )}
        {quantity && (
          <div className="quantity-info">
            <p>Quantity: {quantity}</p>
          </div>
        )}
      </CardSection>

      <CardSection className="card-add-ons">
        <h3>ADD ON</h3>
        <ul>
          {addOns.map((addOn, index) => (
            <li key={index} className="hover-card" style={{ position: 'relative', padding: '10px', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <span className="hover-trigger">
                  <input
                    type="checkbox"
                    onChange={(e) => handleAddOnChange(addOn, e.target.checked)}
                  />
                  {addOn.title} (+₹{addOn.price})
                </span>
                {addOn.image && (
                  <img
                    src={addOn.image}
                    alt={addOn.title}
                    className="hover-image"
                  />
                )}
              </label>
            </li>
          ))}
        </ul>
      </CardSection>

      <CardSection className="card-summary">
        <h4>Summary</h4>
        <p>Base Price: ₹{basePrice}</p>
        <p>Add-Ons: ₹{Object.values(selectedAddOns).reduce((total, price) => total + price, 0)}</p>
        <p>Total Price: ₹{calculateTotalPrice}</p>
        <button className="done-button" onClick={handleAddToCartClick}>Done</button>
      </CardSection>
    </div>
  );
};


const CardSection = ({ className, children }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([1000, 12000]);
  const [productsData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [open, setOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const categories = [
    'Furniture',
    'Civil / Plumbing',
    'Lighting',
    'Electrical',
    'Partitions- door / windows / ceilings',
    'Paint',
    'HVAC',
    'Smart Solutions',
    'Flooring',
    'Accessories'
  ];

  async function fetchRoomData() {
    try {
      const { data, error } = await supabase
        .from('quantity')
        .select()
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latestRoomData = data[0];
        const roomsArray = {
          linear: latestRoomData.linear,
          ltype: latestRoomData.ltype,
          md: latestRoomData.md,
          manager: latestRoomData.manager,
          small: latestRoomData.small,
          ups: latestRoomData.ups,
          bms: latestRoomData.bms,
          server: latestRoomData.server,
          reception: latestRoomData.reception,
          lounge: latestRoomData.lounge,
          sales: latestRoomData.sales,
          phonebooth: latestRoomData.phonebooth,
          discussionroom: latestRoomData.discussionroom,
          interviewroom: latestRoomData.interviewroom,
          conferenceroom: latestRoomData.conferenceroom,
          boardroom: latestRoomData.boardroom,
          meetingroom: latestRoomData.meetingroom,
          meetingroomlarge: latestRoomData.meetingroomlarge,
          hrroom: latestRoomData.hrroom,
          financeroom: latestRoomData.financeroom,
        };
        setRoomNumbers([roomsArray]);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  }

  async function fetchProductsData() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          addons (*),
          product_variants (*)
        `);

      if (error) throw error;

      // Flatten all images from products, addons, and product_variants
      const allImages = data.flatMap(product => [
        ...product.product_variants.map(variant => variant.image),
        ...product.addons.map(addon => addon.image)
      ]).filter(Boolean); // Remove null or undefined images

      const uniqueImages = [...new Set(allImages)];

      const { data: signedUrls, error: signedUrlError } = await supabase.storage
        .from("addon")
        .createSignedUrls(uniqueImages, 3600);

      if (signedUrlError) throw signedUrlError;

      const urlMap = Object.fromEntries(signedUrls.map(item => [item.path, item.signedUrl]));

      const processedData = data.map(product => ({
        ...product,
        product_variants: product.product_variants.map(variant => ({
          ...variant,
          image: urlMap[variant.image] || ''
        })),
        addons: product.addons.map(addon => ({
          ...addon,
          image: urlMap[addon.image] || ''
        }))
      }));

      setProductData(processedData);
    } catch (error) {
      console.error('Error fetching products data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([fetchRoomData(), fetchProductsData()]);
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      // Ensure product_variants2 exists and has at least one element
      if (!product.product_variants || product.product_variants.length === 0) {
        return false;
      }

      // Check if any variant matches the criteria
      const matchesVariant = product.product_variants.some((variant) => {
        // Ensure title, details, and price exist in the variant
        const matchesSearch =
          variant.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variant.details?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice =
          variant.price >= priceRange[0] && variant.price <= priceRange[1];
        return matchesSearch && matchesPrice;
      });

      const matchesCategory =
        selectedCategory === '' || product.category === selectedCategory;

      return matchesVariant && matchesCategory;
    });
  }, [productsData, searchQuery, priceRange, selectedCategory]);


  const groupedProducts = useMemo(() => {
    const grouped = {};
    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = {};
      }
      if (!grouped[product.category][product.subcategory]) {
        grouped[product.category][product.subcategory] = [];
      }
      grouped[product.category][product.subcategory].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const toggleCart = () => {
    setOpen(true);
  }

  const handleAddToCart = (item) => {
    setCartItems((prev) => [...prev, item]);
  };


  return (
    <div className="App">
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
              max={12000}
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

      {roomNumbers.length > 0 && (
        <RoomDataBox roomData={Object.fromEntries(Object.entries(roomNumbers[0]).filter(([_, value]) => value > 0))} />
      )}

      <div className="products-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card-skeleton-container">
              <Skeleton variant="rectangular" height={150} width="100%" className="skeleton-card-image" />
              <Skeleton variant="text" width="60%" height={20} style={{ margin: '10px 0' }} />
              <Skeleton variant="text" width="80%" height={20} style={{ margin: '5px 0' }} />
              <Skeleton variant="text" width="50%" height={20} style={{ margin: '5px 0' }} />
            </div>
          ))
        ) : (
          Object.entries(groupedProducts).map(([category, subcategories]) => (
            <div key={category} className="category-section">
              <h2>{category}</h2>
              {Object.entries(subcategories).map(([subcategory, products]) => (
                <div key={subcategory} className="subcategory-section">
                  <h3 className="subcategory-heading">{subcategory}</h3>
                  {products.map((product) => (
                    <div key={product.id}>
                      <Card
                        // title={product.title}
                        // price={product.price}
                        // details={product.details}
                        addOns={product.addons}
                        // image={product.image}
                        product_variants={product.product_variants}
                        initialMinimized={product.initialMinimized}
                        onAddToCart={handleAddToCart}
                        data={roomNumbers[0]}
                        subCat={subcategory}
                      // productsData={productsData || []}
                      // roomData={roomNumbers[0]} // Adjust this if necessary
                      // quantity={roomNumbers[0]?.[product.title.toLowerCase()] || 0} // Pass the quantity
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      <Cart
        open={open} setOpen={setOpen} cartItems={cartItems}
      />
      <button className='cart-icon fixed bottom-10 right-10 bg-black text-white rounded-xl ' onClick={toggleCart}><LucideShoppingBag size={40} /></button>

    </div>
  );
};

export default App;