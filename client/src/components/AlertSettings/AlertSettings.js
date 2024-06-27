import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UpdateButtons from "../UpdateButtons/UpdateButtons";
import bellIcon from "../../assets/icons/alert-icon.svg";
import "./AlertSettings.scss";

const AlertSettings = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // State to manage the checkbox values
  const [alertSettings, setAlertSettings] = useState({
    email_notifications: true,
    top_offenders: true,
    top_products: true,
  });

  // Handler to update the state when a checkbox is toggled
  const handleCheck = (event) => {
    const { name, checked } = event.target;
    setAlertSettings({
      ...alertSettings,
      [name]: checked,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    navigate(`/dashboard/${userId}`);
  };

  return (
    <>
      <form className="alerts-form" onSubmit={handleSubmit}>
        <div className="alerts-form__heading-container">
          <h1 className="alerts-form__heading">Notifications</h1>
          <img
            className="alerts-form__heading--title"
            src={bellIcon}
            alt="bell icon to sybmolize alerts"
          />
        </div>
        <div className="alerts-inputs">
          <div className="alerts-inputs__container">
            <label
              htmlFor="email_notifications"
              className="alerts-inputs__container--label"
            >
              Receive Email Notifications
            </label>
            <input
              className="alerts-inputs__container--field"
              type="checkbox"
              name="email_notifications"
              checked={alertSettings.email_notifications}
              onChange={handleCheck}
            />
          </div>
          <div className="alerts-inputs__container">
            <label
              htmlFor="top_offenders"
              className="alerts-inputs__container--label"
            >
              Notify Me About Top Offenders
            </label>
            <input
              className="alerts-inputs__container--field"
              type="checkbox"
              name="top_offenders"
              checked={alertSettings.top_offenders}
              onChange={handleCheck}
            />
          </div>
          <div className="alerts-inputs__container">
            <label
              htmlFor="top_products"
              className="alerts-inputs__container--label"
            >
              Notify Me About Top Offending Products
            </label>
            <input
              className="alerts-inputs__container--field"
              type="checkbox"
              name="top_products"
              checked={alertSettings.top_products}
              onChange={handleCheck}
            />
          </div>
        </div>
      </form>
      <div className="update-buttons responsive-padding">
        <UpdateButtons handleSubmit={handleSubmit} userId={userId} />
      </div>
    </>
  );
};

export default AlertSettings;
