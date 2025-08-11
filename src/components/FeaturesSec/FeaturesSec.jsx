
import { useTranslation } from "react-i18next";
import './FeaturesSec.css';
import icon1 from "../../assets/imgs/features/filter.png"
import icon2 from "../../assets/imgs/features/rating.png"
import icon3 from "../../assets/imgs/features/wishlist.png"
import icon4 from "../../assets/imgs/features/secure.png"
const features = [
  {
    icon: icon1, 
    title: "advancedSearch",
    description: "advancedSearchDesc",
  },
  {
    icon:icon2, 
    title: "userReviews",
    description: "userReviewsDesc",
  },
  {
    icon: icon3, 
    title: "wishlist",
    description: "wishlistDesc",
  },
  {
    icon: icon4, 
    title: "securePayments",
    description: "securePaymentsDesc",
  },
];

const FeaturesSection = () => {
  const { t } = useTranslation();
  return (
    <section className="features-section" >
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature-item" key={index} data-aos="fade-up"
            data-aos-anchor-placement="top-center">
            <img src={feature.icon} alt={t(feature.title)} className="feature-icon" />
            <h3 className="feature-title">{t(feature.title)}</h3>
            <p className="feature-description">{t(feature.description)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;