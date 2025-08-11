import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./BookCategories.css";
import BookComponent from "../BookComponent/BookComponent";
import { fetchProducts, fetchCategories } from "../../services/productService";
import { getProductImageUrl } from "../../utils/imageUtils";

const BookCategories = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // UPDATED: Use real API data instead of mock data
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);

        // Map backend product data to frontend format
        const formattedBooks = productsData.map(product => ({
          _id: product._id,
          id: product._id, // Add id field for cart compatibility
          title: product.name,
          name: product.name, // Add name field for cart compatibility
          author: product.categoryId?.name || "Unknown Category", // Using category as author for consistency
          price: product.price,
          category: product.categoryId?.name || "Uncategorized",
          coverImage: getProductImageUrl(product),
          image: getProductImageUrl(product),
          rating: 4.5, // Default rating until review system is implemented
          description: product.description
        }));

        // Format categories with "All" option
        const formattedCategories = [
          "All",
          ...categoriesData.map(cat => cat.name)
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
    };    fetchData();
  }, []);

  // Filter books based on selected category
  const filteredBooks = selectedCategory === "All" 
    ? books 
    : books.filter(book => book.category === selectedCategory);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <div className="book-categories-loading">
        <div className="spinner"></div>
        <p>{t("loadingBooks")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-categories-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="book-categories">
      <div className="container">
        <h2 className="section-title">{t("browseByCategory")}</h2>
        {/* Category Filter Buttons */}
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
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
              <p>{t("noBooksCategory")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCategories;
