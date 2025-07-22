import "./LoaderComponent.css";

const LoaderComponent = () => {
  return (
    // <div className="loader">
    //   <div className="book-wrapper">
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       fill="white"
    //       viewBox="0 0 126 75"
    //       className="book"
    //     >
    //       <rect
    //         stroke-width="5"
    //         stroke="#5a16bf"
    //         rx="7.5"
    //         height="70"
    //         width="121"
    //         y="2.5"
    //         x="2.5"
    //       ></rect>
    //       <line
    //         stroke-width="5"
    //         stroke="#5a16bf"
    //         y2="75"
    //         x2="63.5"
    //         x1="63.5"
    //       ></line>
    //       <path
    //         stroke-linecap="round"
    //         stroke-width="4"
    //         stroke="#fac1c1"
    //         d="M25 20H50"
    //       ></path>
    //       <path
    //         stroke-linecap="round"
    //         stroke-width="4"
    //         stroke="#fac1c1"
    //         d="M101 20H76"
    //       ></path>
    //       <path
    //         stroke-linecap="round"
    //         stroke-width="4"
    //         stroke="#fac1c1"
    //         d="M16 30L50 30"
    //       ></path>
    //       <path
    //         stroke-linecap="round"
    //         stroke-width="4"
    //         stroke="#fac1c1"
    //         d="M110 30L76 30"
    //       ></path>
    //     </svg>

    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       fill="#ffffff74"
    //       viewBox="0 0 65 75"
    //       className="book-page"
    //     >
    //       <path
    //         stroke-linecap="round"
    //         stroke-width="4"
    //         stroke="#c18949"
    //         d="M40 20H15"
    //       ></path>
    //       <path
    //         stroke-linecap="round"
    //         stroke-width="4"
    //         stroke="#c18949"
    //         d="M49 30L15 30"
    //       ></path>
    //       <path
    //         stroke-width="5"
    //         stroke="#5a16bf"
    //         d="M2.5 2.5H55C59.1421 2.5 62.5 5.85786 62.5 10V65C62.5 69.1421 59.1421 72.5 55 72.5H2.5V2.5Z"
    //       ></path>
    //     </svg>
    //   </div>
    // </div>

    <div className="loader">
      <div class="blobs">
        <div class="blob-center"></div>
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            ></feGaussianBlur>
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            ></feColorMatrix>
            <feBlend in="SourceGraphic" in2="goo"></feBlend>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default LoaderComponent;
