import { useRouteError, Link } from "react-router-dom";
import "./ErrorPage.css";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="error-container">
      <h1 className="error-title">Oops!</h1>
      <p className="error-message">Sorry, an unexpected error has occurred.</p>
      <p className="error-details">
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/" className="home-link">
        Go back to homepage
      </Link>
    </div>
  );
};

export default ErrorPage;
