
import './NewArrivalsSec.css';
import { NewArrivalsData } from '../../data/NewArrivalsData';
import TitleComponent from './../TitleComponent/TitleComponent';
import BookComponent from '../BookComponent/BookComponent';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const NewArrivalsSec = () => {
    return (
        <section className='newArrivals-sec'>
            <TitleComponent
                title="New"
                subTitle="Arrivals"
                desc="From timeless classics to modern masterpieces. Find the perfect spot for every moment."
            />
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={5}
                slidesPerView={4}
                navigation
                loop={true}
                autoplay={{
                    delay: 2700,
                    disableOnInteraction: false
                }}
                className="books-slider"
                breakpoints={{
                    0: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }}
            >
                {NewArrivalsData.map((item, index) => (
                    <SwiperSlide key={index} className='book'>
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

export default NewArrivalsSec;