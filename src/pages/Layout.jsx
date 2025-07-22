import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useEffect } from "react";
import Aos from "aos";

const Layout = () => {
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
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
