import './BookComponent.css'
import { TbShoppingBagPlus } from 'react-icons/tb';
const BookComponent = ({ author, category, price, description, coverImage }) => {
    return (
        <div className='book-comp' data-aos="fade-right"
            data-aos-offset="400"
            data-aos-easing="ease-in-sine">

            <div className="cover-book">
                <img src={coverImage} alt='book-img' />
            </div>

            <div className="deatils">
                <div className='book-header'>
                    <h4 className="category">{category}</h4>
                    <div className="icon"><TbShoppingBagPlus /></div>
                </div>
                <div className='book-info'>
                    <h6 className="author">{author}</h6>
                    <p className="price">{price}$</p>

                </div>
                <p className='desc'>{description}</p>
            </div>
        </div>
    )
}

export default BookComponent