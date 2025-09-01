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

  const handlePromotionSelect = (promotion) => {
    // Store the selected promotion in localStorage so it can be used in cart/checkout
    const appliedPromotions = JSON.parse(
      localStorage.getItem("appliedPromotions") || "[]"
    );

    // Check if promotion is already applied
    const isAlreadyApplied = appliedPromotions.some(
      (p) => p._id === promotion._id
    );

    if (!isAlreadyApplied) {
      appliedPromotions.push({
        _id: promotion._id,
        name: promotion.name,
        promoCode: promotion.promoCode,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscountAmount: promotion.maxDiscountAmount,
        minOrderAmount: promotion.minOrderAmount,
        appliedAt: new Date().toISOString(),
      });

      localStorage.setItem(
        "appliedPromotions",
        JSON.stringify(appliedPromotions)
      );

      // Show success message or feedback
      alert(
        `Promotion "${promotion.name}" applied successfully! It will be used at checkout.`
      );
    } else {
      alert(`Promotion "${promotion.name}" is already applied.`);
    }
  };

  return (
    <>
      {showPromotionsBanner && (
        <PromotionsBanner onPromotionSelect={handlePromotionSelect} />
      )}
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
