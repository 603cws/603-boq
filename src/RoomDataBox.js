import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom Next Arrow component for carousel
const NextArrow = ({ onClick }) => (
  <button
    className="slick-next absolute top-1/2 right-5 transform -translate-y-1/2 p-2 rounded-full shadow-lg slick-btn"
    onClick={onClick}
  >

  </button>
);

// Custom Prev Arrow component for carousel
const PrevArrow = ({ onClick }) => (
  <button
    className="slick-prev absolute top-1/2 left-100 transform -translate-y-1/2  p-2 rounded-full shadow-lg slick-btn"
    onClick={onClick}
  >

  </button>
);

const RoomDataBox = ({ roomData }) => {
  const roomEntries = Object.entries(roomData);

  const settings = {
    // infinite: true,
    speed: 800,
    slidesToShow: 7, // Show 7 slides at a time by default
    slidesToScroll: 2,
    // autoplay: true, // Enable auto sliding
    // autoplaySpeed: 5000, // Auto slide every 5 seconds
    nextArrow: <NextArrow />, // Custom next arrow
    prevArrow: <PrevArrow />, // Custom previous arrow
    responsive: [
      {
        breakpoint: 1025, // For devices smaller than 1024px
        settings: {
          slidesToShow: 5, // Show 4 slides on medium screens
        },
      },
      {
        breakpoint: 768, // For devices smaller than 768px
        settings: {
          slidesToShow: 4, // Show 2 slides on small screens
        },
      },
      {
        breakpoint: 480, // For devices smaller than 480px
        settings: {
          slidesToShow: 2, // Show 1 slide on mobile screens
        },
      },
    ],
  };

  return (
    <div className="room-data-carousel-container relative w-full ">
      <Slider {...settings}>
        {roomEntries.map(([key, value]) => (
          <div key={key} className="room-data-box-tooltip">
            <div className="room-data-box p-4 border rounded-lg shadow-md">
              <p className="room-data-key text-base sm:text-sm md:text-lg lg:text-xl font-semibold">{key}</p>
              <p className="room-data-value text-lg">{value}</p>
            </div>
            <div className="tooltip-text absolute bottom-0 left-0 bg-black text-white p-2">
              Additional info about {key}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RoomDataBox;
