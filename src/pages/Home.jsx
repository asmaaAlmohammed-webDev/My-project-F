//import CategoriesBooksSec from "../components/CategoriesBooksSec/CategoriesBooksSec";
//import BookCategories from "../components/BookCategories/BookCategories";
import FeaturesSection from "../components/FeaturesSec/FeaturesSec";
import Hero from "../components/Hero/Hero";
import NewsBar from "../components/NewsBar/NewsBar";
import NewArrivalsSec from "../components/NewArrivalsSec/NewArrivalsSec";
import PopularBooksSec from "../components/PopularBooksSec/PopularBooksSec";

const Home = () => {
  return (
    <>
      <Hero />
      <NewsBar />
      <PopularBooksSec />
      <NewArrivalsSec />
      <FeaturesSection />
    </>
  );
};

export default Home;
