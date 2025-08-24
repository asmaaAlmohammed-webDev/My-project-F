import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PromotionsBanner from "../components/PromotionsBanner/PromotionsBanner";
import { useEffect } from "react";
import Aos from "aos";

const Layout = () => {
  const location = useLocation();

  // Show promotions banner on specific pages
  const showPromotionsBanner = [
    "/",
    "/home",
    "/shop",
    "/profile",
    "/cart",
  ].includes(location.pathname);

  // Custom cursor..
  useEffect(() => {
    document.body.classList.add("cursor-custom-default");
  }, []);
  useEffect(() => {
    Aos.init({
      duration: 1000,
      offset: 0,
      distance: "50px",
      once: false,
    });
  }, []);

  return (
    <>
      {showPromotionsBanner && <PromotionsBanner />}
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
