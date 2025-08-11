import { useRouteError, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ErrorPage.css";

const ErrorPage = () => {
  const error = useRouteError();
  const { t } = useTranslation();

  return (
    <div className="error-container">
      <h1 className="error-title">{t("errorTitle")}</h1>
      <p className="error-message">{t("errorMessage")}</p>
      <p className="error-details">
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/" className="home-link">
        {t("goHome")}
      </Link>
    </div>
  );
};

export default ErrorPage;
