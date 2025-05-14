
import './FeaturesSec.css';
import icon1 from "../../assets/imgs/features/filter.png"
import icon2 from "../../assets/imgs/features/rating.png"
import icon3 from "../../assets/imgs/features/wishlist.png"
import icon4 from "../../assets/imgs/features/secure.png"
const features = [
  {
    icon: icon1, 
    title: 'Advanced Search and Filters',
    description: 'Effortlessly search books by title, author, genre, or price range.',
  },
  {
    icon:icon2, 
    title: 'User Reviews and Ratings',
    description: 'Customers can share reviews, rate books, and guide future readers.',
  },
  {
    icon: icon3, 
    title: 'Wishlist and Favorites',
    description: 'Save books to wishlist for future purchases or easy access.',
  },
  {
    icon: icon4, 
    title: 'Secure Online Payments',
    description: 'Enjoy seamless checkout with multiple secure payment options.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="features-section" >
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature-item" key={index} data-aos="fade-up"
            data-aos-anchor-placement="top-center">
            <img src={feature.icon} alt={feature.title} className="feature-icon" />
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;