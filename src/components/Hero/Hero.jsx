
import "./Hero.css";
import img from "./../../assets/imgs/bg.png";
import img2 from "./../../assets/imgs/pencil.png";


const Hero = () => {
  return (
    <section
      className="hero"
      data-aos="fade-down"
      data-aos-easing="linear"
      data-aos-duration="1500"
    >
      <div className="hero__text">
        <h1>
          Discover <span className="highlight">Books</span>
          <img src={img2} alt="Girl with books" className="pencil-img" /> That
          Inspire Your World
        </h1>
        <p>
          Explore a world of stories, knowledge, and inspiration. Discover books
          that ignite your imagination, broaden your perspective, and enrich
          your journey.
        </p>
        <button className="explore-btn">Explore Now</button>
      </div>

      <div className="hero__image">
        <div className="hero__img-wrapper">
          <img src={img} alt="Girl with books" className="main-img" />
          {/* <img src="/book1.png" alt="Book 1" className="floating book1" />
          <img src="/book2.png" alt="Book 2" className="floating book2" />
          <img src="/book3.png" alt="Book 3" className="floating book3" /> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
