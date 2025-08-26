import "./Hero.css";
import img from "../../assets/imgs/hero/bg2-removebg-preview.png";
import img2 from "./../../assets/imgs/pencil.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const handleExploreClick = () => {
    navigate("/shop");
  };
  return (
    <section
      className="hero"
      data-aos="fade-down"
      data-aos-easing="linear"
      data-aos-duration="1500"
    >
      <div className="hero__text">
        <h1>
          {t("discoverBooks")} <span className="highlight">{t("books")}</span>
          <img src={img2} alt="Girl with books" className="pencil-img" />
        </h1>
        <p>{t("exploreWorld")}</p>
        <button className="explore-btn-hero" onClick={handleExploreClick}>
          {t("exploreNow")}
        </button>
      </div>

      <div className="hero__image">
        <div className="hero__img-wrapper">
          <img src={img} alt="Girl with books" className="main-img" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
