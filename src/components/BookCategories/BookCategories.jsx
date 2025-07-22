import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import BookComponent from "../BookComponent/BookComponent";
import TitleComponent from "../TitleComponent/TitleComponent";
import "./BookCategories.css";
import { TbShoppingBagPlus, TbSearch, TbArrowsSort } from "react-icons/tb";
import { FaFilter } from "react-icons/fa";
import { mockBooks } from "../../data/CategoriesBooksData";
const BookCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState("Fiction");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortOption, setSortOption] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  // بيانات الفئات والكتب
  const categories = [
    "Fiction",
    "Children",
    "Health",
    "Academic",
    "Business",
    "Religion",
  ];

  useEffect(() => {
    // محاكاة جلب البيانات من API
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  // تصفية وترتيب الكتب
  const getFilteredBooks = () => {
    let books = [...(mockBooks[selectedCategory] || [])];
    // التصفية حسب الكلمة المفتاحية
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.description.toLowerCase().includes(term)
      );
    }

    // التصفية حسب نطاق السعر
    books = books.filter(
      (book) => book.price >= priceRange[0] && book.price <= priceRange[1]
    );

    // الترتيب حسب السعر
    if (sortOption === "price-low") {
      books.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      books.sort((a, b) => b.price - a.price);
    }

    return books;
  };

  const filteredBooks = getFilteredBooks();

  return (
    <div className="book-categories-container">
      <TitleComponent
        title="Our Book"
        subTitle="Collection"
        desc="  From timeless classics to modern masterpieces, find the perfect read
          for every moment."
      />

      <div className="categories-bar">
        <div className="categories-scroll">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="category-display">
        <div className="category-header">
          <h2>{selectedCategory} Books</h2>
          <div className="curated-by">
            <span>Set by:</span>
            <div className="curator">Robert</div>
          </div>
        </div>

        {/* أدوات التصفية والبحث */}
        <div className="filters-container">
          <div className="search-bar">
            <TbSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>

          {showFilters && (
            <div className="filter-options">
              <div className="filter-group">
                <label>Price Range:</label>
                <div className="price-range">
                  <span>${priceRange[0]}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                  />
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <div className="filter-group">
                <label>Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="books-loading">
            <div className="loading-spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : (
          <>
            {filteredBooks.length === 0 ? (
              <div className="no-results">
                <h3>No books found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                  600: { slidesPerView: 1 },
                  850: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                navigation
                pagination={{ clickable: true }}
                className="books-swiper"
              >
                {filteredBooks.map((book) => (
                  <SwiperSlide key={book.id}>
                    <BookComponent
                      author={book.author}
                      category={book.category}
                      price={book.price}
                      description={book.description}
                      coverImage={book.coverImage}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookCategories;
