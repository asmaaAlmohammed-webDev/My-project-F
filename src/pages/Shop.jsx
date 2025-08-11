import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Shop.css";
import BookComponent from "../components/BookComponent/BookComponent";
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
  const { t } = useTranslation();

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
        const formattedBooks = productsData.map((product) => ({
          _id: product._id,
          id: product._id,
          title: product.name,
          name: product.name,
          author: product.categoryId?.name || "Unknown Category",
          price: product.price,
          category: product.categoryId?.name || "Uncategorized",
          coverImage: getProductImageUrl(product),
          image: getProductImageUrl(product),
          rating: 4.5,
          description: product.description,
        }));

        // Format categories with "All" option
        const formattedCategories = [
          "All",
          ...categoriesData.map((cat) => cat.name),
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
  }, []);

  // Filter books based on category and search term
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
              <BookComponent
                key={book._id}
                id={book._id}
                title={book.title}
                author={book.author}
                category={book.category}
                price={book.price}
                coverImage={book.coverImage}
                description={book.description}
                product={book}
              />
            ))
          ) : (
            <div className="no-books-message">
              <h3>{t("noBooksFound")}</h3>
              <p>{t("adjustSearch")}</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                {t("clearFilters")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
