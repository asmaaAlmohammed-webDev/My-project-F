import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNewestBooks, createNewsBarContent, prepareClickableContent } from '../../services/newsService';
import { useTranslation } from 'react-i18next';
import './NewsBar.css';

const NewsBar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Handle clicking on a book in the news bar
  const handleBookClick = (bookId, bookTitle) => {
    // Navigate to shop page with search for the book title
    // You can customize this behavior based on your routing structure
    navigate(`/shop?search=${encodeURIComponent(bookTitle)}`);
  };

  // Render clickable news content
  const renderNewsContent = (item) => {
    const contentData = prepareClickableContent(item);
    
    if (!contentData.hasClickableTitle) {
      return contentData.fullText;
    }

    return (
      <>
        {contentData.beforeTitle}
        <button 
          className="clickable-book-title"
          onClick={(e) => {
            e.stopPropagation();
            handleBookClick(contentData.bookId, contentData.bookTitle);
          }}
          title={t('clickToSearchBook', `Click to search for "${contentData.bookTitle}"`)}
        >
          {contentData.titleInQuotes}
        </button>
        {contentData.afterTitle}
      </>
    );
  };

  // Fetch newest books and create news content
  const loadNewsContent = async () => {
    try {
      setLoading(true);
      const newestBooks = await fetchNewestBooks(8); // Get 8 newest books
      
      if (newestBooks.length > 0) {
        const formattedNews = createNewsBarContent(newestBooks);
        setNewsItems(formattedNews);
        setError(null);
      } else {
        // Fallback content if no books found
        setNewsItems([{
          id: 'fallback',
          text: t('checkBackForNewArrivals', '📚 Check back soon for exciting new book arrivals! 💫'),
        }]);
      }
    } catch (err) {
      console.error('Error loading news content:', err);
      setError(t('failedToLoadNews', 'Unable to load latest book news'));
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load news on component mount and language change
  useEffect(() => {
    loadNewsContent();
  }, [i18n.language]); // Reload when language changes

  // Set up auto-refresh interval
  useEffect(() => {
    // Refresh news every 5 minutes
    intervalRef.current = setInterval(loadNewsContent, 5 * 60 * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="news-bar loading">
        <div className="news-content">
          <span className="loading-text">
            📚 {t('loadingLatestNews', 'Loading latest book news...')} 📚
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="news-bar error">
        <div className="news-content">
          <span className="error-text">
            ⚠️ {error}
          </span>
        </div>
      </div>
    );
  }

  // Create scrolling content by duplicating items for seamless loop
  const scrollingContent = [...newsItems, ...newsItems, ...newsItems];

  return (
    <div className="news-bar" role="banner" aria-label={t('latestBookNews', 'Latest Book News')}>
      <div className="news-bar-container">
        <div className="news-label">
          <span className="news-icon">🔥</span>
          <span className="news-title">
            {t('latestArrivals', 'Latest Arrivals')}
          </span>
        </div>
        
        <div className="news-scroll-container">
          <div className="news-content" aria-live="polite">
            {scrollingContent.map((item, index) => (
              <span 
                key={`${item.id}-${index}`} 
                className="news-item"
                role="text"
              >
                {renderNewsContent(item)}
              </span>
            ))}
          </div>
        </div>
        
        <div className="news-refresh">
          <button 
            onClick={loadNewsContent}
            className="refresh-btn"
            aria-label={t('refreshNews', 'Refresh News')}
            title={t('refreshNews', 'Refresh News')}
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsBar;
