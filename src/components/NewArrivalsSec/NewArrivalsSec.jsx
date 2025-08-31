import "./NewArrivalsSec.css";
// REMOVED: import { NewArrivalsData } from '../../data/NewArrivalsData';
// ADDED: Import real API service instead of mock data
import { fetchNewArrivals } from "../../services/productService";
import { getProductImageUrl } from "../../utils/imageUtils";
import TitleComponent from "./../TitleComponent/TitleComponent";
import BookComponent from "../BookComponent/BookComponent";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// ADDED: React hooks for state management and API calls
import { useState, useEffect } from "react";
// ADDED: Translation hook
import { useTranslation } from "react-i18next";

const NewArrivalsSec = () => {
  // ADDED: Translation hook
  const { t } = useTranslation();
  
  // ADDED: State management for real API data
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ADDED: Fetch real data from backend API on component mount and language change
  useEffect(() => {
    const loadNewArrivals = async () => {
      try {
        setLoading(true);
        const books = await fetchNewArrivals();
        setNewArrivals(books);
        setError(null);
      } catch (err) {
        console.error("Error loading new arrivals:", err);
        setError(t("failedLoadNewArrivals"));
      } finally {
        setLoading(false);
      }
    };

    loadNewArrivals();
  }, [t]); // Re-fetch when language changes (t function changes)

  // ADDED: Loading state display
  if (loading) {
    return (
      <section className="newArrivals-sec">
        <TitleComponent
          title={t("new")}
          subTitle={t("arrivals")}
          desc={t("loadingNewArrivals")}
        />
        <div className="loading-spinner">{t("loading")}</div>
      </section>
    );
  }

  // ADDED: Error state display
  if (error) {
    return (
      <section className="newArrivals-sec">
        <TitleComponent
          title={t("new")}
          subTitle={t("arrivals")}
          desc={t("unableLoadNewArrivals")}
        />
        <div className="error-message">{error}</div>
      </section>
    );
  }

  return (
    <section className="newArrivals-sec">
      <TitleComponent
        title={t("new")}
        subTitle={t("arrivals")}
        desc={t("newArrivalsDesc")}
      />
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={5}
        slidesPerView={4}
        navigation
        loop={true}
        autoplay={{
          delay: 2700,
          disableOnInteraction: false,
        }}
        className="books-slider"
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {/* CHANGED: Using real API data instead of mock data */}
        {newArrivals.map((book, index) => (
          <SwiperSlide key={book._id || index} className="book">
            <BookComponent
              // UPDATED: Map backend data structure to component props
              id={book._id}
              author={book.categoryId?.name || "Unknown Author"} // Using category as author for now
              category={book.categoryId?.name || "Unknown Category"}
              price={book.price}
              description={book.description}
              coverImage={getProductImageUrl(book)} // Use proper image URL
              title={book.name} // Add book title
              product={book}
              navigateToShop={true} // Enable navigation to shop page
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default NewArrivalsSec;
