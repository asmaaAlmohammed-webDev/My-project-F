import "./TitleComponent.css";

const TitleComponent = ({ title, subTitle, desc }) => {
    return (
        <div className="title-comp" data-aos="fade-right"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine">
            <h2 className="title">
                {title}
                <span>{subTitle}</span>
            </h2>
            <p className="desc"> {desc}</p>
        </div>
    );
};

export default TitleComponent;