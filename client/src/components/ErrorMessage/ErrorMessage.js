import errorIcon from "../../assets/icons/error-24px.svg";
import "./ErrorMessage.scss";

const ErrorMessage = ({ message, isSecondary }) => {
  return (
    <div className={`error-message ${isSecondary ? "register-error" : ""}`}>
      <img className="error-message__icon" src={errorIcon} alt="error icon" />
      <p
        className={`error-message__text ${isSecondary ? "register-error" : ""}`}
      >
        {message}
      </p>{" "}
    </div>
  );
};

export default ErrorMessage;
