import './BookComponent.css'
import { TbShoppingBagPlus } from 'react-icons/tb';
import { addToCart } from '../../utils/cartUtils';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// UPDATED: Added title prop and improved prop handling for real API data
const BookComponent = ({ author, category, price, description, coverImage, title, id, product, onBookClick, navigateToShop, showReviews = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const handleAddToCart = (e) => {
        e.stopPropagation(); // Prevent navigation when clicking add to cart
        // Create product object for cart
        const productForCart = product || {
            id: id,
            name: title,
            price: price,
            image: coverImage, // Use coverImage prop
            author: author,
            category: category,
            description: description
        };

        console.log('Adding to cart:', productForCart); // Debug log

        addToCart(productForCart, 1);
        
        // Show a quick feedback (you can replace this with a toast notification)
        alert(t('productAddedToCart'));
    };

    const handleBookClick = () => {
        // Check if this should navigate to shop (for home page components)
        if (navigateToShop) {
            navigate(`/shop?bookId=${id}`);
            return;
        }
        
        // Use custom click handler if provided (for shop page similar products or AI demo)
        if (onBookClick) {
            onBookClick(product || { 
                _id: id,
                id, 
                title, 
                name: title,
                author, 
                category, 
                price, 
                description, 
                coverImage 
            });
        } else {
            // Default behavior: scroll to similar products section (fallback)
            window.scrollTo({ 
                top: document.querySelector('.similar-products-section')?.offsetTop || 0, 
                behavior: 'smooth' 
            });
        }
    };

    return (
        <div className='book-comp' 
            data-aos="fade-right"
            data-aos-offset="400"
            data-aos-easing="ease-in-sine"
            onClick={handleBookClick}
            style={{ cursor: 'pointer' }}
        >

            <div className="cover-book">
                <img src={coverImage} alt='book-img' />
            </div>

            <div className="deatils">
                <div className='book-header'>
                    <h4 className="category">{category}</h4>
                    <div className="icon" onClick={handleAddToCart} style={{ cursor: 'pointer' }}>
                        <TbShoppingBagPlus />
                    </div>
                </div>
                {/* ADDED: Display book title */}
                {title && <h5 className="book-title">{title}</h5>}
                <div className='book-info'>
                    <h6 className="author">{author}</h6>
                    <p className="price">${price}</p> {/* FIXED: Moved $ to the front for better formatting */}
                </div>
                <p className='desc'>{description}</p>
            </div>
        </div>
    )
}

export default BookComponent