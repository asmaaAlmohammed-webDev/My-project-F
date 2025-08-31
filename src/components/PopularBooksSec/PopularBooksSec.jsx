import "./PopularBooksSec.css";
// REMOVED: import { PopularBooksData } from "../../data/PopularBooksData";
// ADDED: Import real API service instead of mock data
import { fetchPopularBooks } from "../../services/productService";
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

const PopularBooksSec = () => {
  // ADDED: Translation hook
  const { t } = useTranslation();
  
  // ADDED: State management for real API data
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ADDED: Fetch real data from backend API on component mount and language change
  useEffect(() => {
    const loadPopularBooks = async () => {
      try {
        setLoading(true);
        const books = await fetchPopularBooks();
        setPopularBooks(books);
        setError(null);
      } catch (err) {
        console.error("Error loading popular books:", err);
        setError(t("failedLoadPopularBooks"));
      } finally {
        setLoading(false);
      }
    };

    loadPopularBooks();
  }, [t]); // Re-fetch when language changes (t function changes)

  // ADDED: Loading state display
  if (loading) {
    return (
      <section className="popular-books-sec">
        <TitleComponent
          title={t("popular")}
          subTitle={t("books")}
          desc={t("loadingPopularBooks")}
        />
        <div className="loading-spinner">{t("loading")}</div>
      </section>
    );
  }

  // ADDED: Error state display
  if (error) {
    return (
      <section className="popular-books-sec">
        <TitleComponent
          title={t("popular")}
          subTitle={t("books")}
          desc={t("unableLoadPopularBooks")}
        />
        <div className="error-message">{error}</div>
      </section>
    );
  }

  return (
    <section className="popular-books-sec">
      <TitleComponent
        title={t("popular")}
        subTitle={t("books")}
        desc={t("popularBooksDesc")}
      />
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={3}
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
        {popularBooks.map((book, index) => (
          <SwiperSlide key={book._id || index}>
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

export default PopularBooksSec;
