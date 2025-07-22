import "./PopularBooksSec.css";
import { PopularBooksData } from "../../data/PopularBooksData";
import TitleComponent from "./../TitleComponent/TitleComponent";
import BookComponent from "../BookComponent/BookComponent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PopularBooksSec = () => {
  return (
    <section className="popular-books-sec">
      <TitleComponent
        title="Popular"
        subTitle="Books"
        desc="From timeless classics to modern masterpieces, find the perfect read for every moment."
      />
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={3}
        navigation
        loop={true}
        autoplay={{
          delay: 2700,
          disableOnInteraction: false,
        }}
        className="books-slider"
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {PopularBooksData.map((item, index) => (
          <SwiperSlide key={index}>
            <BookComponent
              author={item.author}
              category={item.category}
              price={item.price}
              description={item.description}
              coverImage={item.coverImage}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default PopularBooksSec;
