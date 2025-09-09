import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Shop.css";
import BookComponent from "../components/BookComponent/BookComponent";
import BookDetail from "../components/BookDetail/BookDetail";
import SimilarProducts from "../components/SimilarProducts/SimilarProducts";
import { fetchProducts, fetchCategories } from "../services/productService";
import { getProductImageUrl } from "../utils/imageUtils";
import { FaSearch, FaFilter } from "react-icons/fa";

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState(null);
  const [isBookDetailOpen, setIsBookDetailOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize search term from URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(decodeURIComponent(searchFromUrl));
    }
  }, [searchParams]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);

        // Map backend product data to frontend format
        const formattedBooks = productsData.map((product) => {
          const rawCategory = product.categoryId?.name || "Uncategorized";
          // Remove spaces for translation key
          const categoryKey = 'category' + rawCategory.replace(/\s/g, '');
          return {
            _id: product._id,
            id: product._id,
            title: product.name,
            name: product.name,
            author:
              i18n.language === "ar"
                ? product.author_ar || product.author_en || rawCategory || "Unknown Category"
                : product.author_en || product.author_ar || rawCategory || "Unknown Category",
            price: product.price,
            category: t(categoryKey) || rawCategory,
            rawCategory,
            coverImage: getProductImageUrl(product),
            image: getProductImageUrl(product),
            rating: 4.5,
            description: product.description,
          };
        });

        // Format categories with "All" option, translated
        const formattedCategories = [
          t("All"),
          ...categoriesData.map((cat) => {
            const key = 'category' + cat.name.replace(/\s/g, '');
            return t(key) || cat.name;
          }),
        ];

        setBooks(formattedBooks);
        setCategories(formattedCategories);
        setError(null);
      } catch (err) {
        setError("Failed to load books. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]); // Re-fetch when language changes (t function changes)

  // Handle book highlighting from URL parameters
  useEffect(() => {
    const bookId = searchParams.get('bookId');
    if (bookId && books.length > 0) {
      // Find the book with the matching ID
      const targetBook = books.find(book => book._id === bookId);
      if (targetBook) {
        // Open the book detail modal directly
        setSelectedBookForDetail(targetBook);
        setIsBookDetailOpen(true);
        
        // Also scroll to the book after a short delay to ensure rendering
        setTimeout(() => {
          const bookElement = document.querySelector(`[data-book-id="${bookId}"]`);
          if (bookElement) {
            bookElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add a highlight effect
            bookElement.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.6)';
            bookElement.style.transform = 'scale(1.02)';
            bookElement.style.transition = 'all 0.3s ease';
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
              bookElement.style.boxShadow = '';
              bookElement.style.transform = '';
            }, 3000);
          }
        }, 500);
      }
    }
  }, [searchParams, books]);

  // Listen for similar product navigation events
  useEffect(() => {
    const handleNavigateToBook = (event) => {
      const newBook = event.detail;
      if (newBook && newBook._id) {
        // Update the URL with the new book ID
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.set('bookId', newBook._id);
          return newParams;
        });
        
        // Open the book detail modal with the new book
        setSelectedBookForDetail(newBook);
        setIsBookDetailOpen(true);
      }
    };

    window.addEventListener('navigateToBook', handleNavigateToBook);
    
    return () => {
      window.removeEventListener('navigateToBook', handleNavigateToBook);
    };
  }, [setSearchParams]);

  // Filter books based on category and search term
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === t("All") || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i18n.language === "ar" ? book.author_ar : book.author_en).toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Update URL parameters
    if (newSearchTerm) {
      setSearchParams({ search: newSearchTerm });
    } else {
      setSearchParams({});
    }
  };

  // Clear search and filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSearchParams({});
  };

  // Handle book click for detail modal (main books grid)
  const handleBookDetailClick = (book) => {
    setSelectedBookForDetail(book);
    setIsBookDetailOpen(true);
  };

  // Close book detail modal
  const closeBookDetail = () => {
    setIsBookDetailOpen(false);
    setSelectedBookForDetail(null);
  };

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="loading-spinner"></div>
        <p>{t("loadingCollection")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{t("tryAgain")}</button>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Shop Header */}
        <div className="shop-header">
          <h1>{t("bookCollection")}</h1>
          <p>{t("discoverCollection")}</p>
        </div>

        {/* Search and Filter Section */}
        <div className="shop-controls">
          {/* Search Bar */}
          <div
            className="search-container "
            data-aos="fade-right"
            data-aos-offset="300"
            data-aos-duration="2500"
            data-aos-easing="ease-in-sine"
          >
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t("search") + " books, authors, or descriptions..."}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {/* Category Filter */}
          <div
            className="filter-container"
            data-aos="fade-right"
            data-aos-offset="300"
            data-aos-duration="2500"
            data-aos-easing="ease-in-sine"
          >
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-pill ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => handleCategoryChange(category)}
              data-aos="fade-up"
              data-aos-duration="2500"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="results-info">
          <p>
            {filteredBooks.length} {filteredBooks.length === 1 ? t("book") : t("books")}
            {selectedCategory !== "All" && ` ${t("inCategory", { category: selectedCategory })}`}
            {searchTerm && ` ${t("forSearch", { search: searchTerm })}`}
          </p>
        </div>

        {/* Books Grid */}
        <div className="books-grid">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div key={book._id} data-book-id={book._id}>
                <BookComponent
                  id={book._id}
                  title={book.title}
                    author={i18n.language === "ar" ? book.author_ar : book.author_en}
                  category={book.category}
                  price={book.price}
                  coverImage={book.coverImage}
                  description={book.description}
                  product={book}
                  onBookClick={handleBookDetailClick}
                />
              </div>
            ))
          ) : (
            <div className="no-books-message">
              <h3>{t("noBooksFound")}</h3>
              <p>{t("adjustSearch")}</p>
              <button onClick={clearFilters}>
                {t("clearFilters")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Book Detail Modal */}
      <BookDetail
        book={selectedBookForDetail}
        isOpen={isBookDetailOpen}
        onClose={closeBookDetail}
      />
    </div>
  );
};

export default Shop;
